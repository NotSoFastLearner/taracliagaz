
"""
Административные эндпоинты — CRUD для всего контента.
Все эндпоинты защищены JWT (get_current_admin).
"""
import logging
import sqlite3
import tempfile
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..config import BASE_DIR, get_settings
from ..database import get_db
from ..models import (
    Page, NewsPost, Announcement, Tender, Document,
    GalleryImage, MenuCategory, ContactMessage,
)
from ..schemas import (
    PageRead, PageCreate, PageUpdate,
    NewsPostRead, NewsPostCreate, NewsPostUpdate,
    AnnouncementRead, AnnouncementCreate, AnnouncementUpdate,
    TenderRead, TenderCreate, TenderUpdate,
    DocumentRead, DocumentCreate, DocumentUpdate,
    GalleryImageRead, GalleryImageCreate, GalleryImageUpdate,
    MenuCategoryRead, MenuCategoryCreate, MenuCategoryUpdate,
    ContactMessageRead,
)
from .auth_router import get_current_admin
from .public_router import invalidate_search_cache
from .seo_router import invalidate_sitemap_cache

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],  # Все эндпоинты защищены
)


def _cleanup_local_upload(db: Session, url: str | None) -> None:
    """Удаляет локально загруженный файл (/uploads/images|documents/...), если на него больше не ссылаются."""
    if not url:
        return
    clean_url = url.strip().split("?", 1)[0]
    if clean_url.startswith("/uploads/images/") or clean_url.startswith("/uploads/documents/"):
        rel_part = clean_url[len("/uploads/"):]
    else:
        return

    still_referenced = (
        db.execute(select(Document.id).where(Document.file_url == url).limit(1)).first() is not None
        or db.execute(select(Tender.id).where(Tender.document_url == url).limit(1)).first() is not None
        or db.execute(select(GalleryImage.id).where(GalleryImage.image_url == url).limit(1)).first() is not None
    )
    if still_referenced:
        return

    uploads_root = Path(get_settings().UPLOAD_DIR).resolve()
    target = (uploads_root / rel_part).resolve()
    if target.is_relative_to(uploads_root) and target.is_file():
        target.unlink(missing_ok=True)


def _delete_menu_subtree(db: Session, category: MenuCategory) -> None:
    """Рекурсивно удаляет дочерние пункты меню перед удалением родителя (из-за PRAGMA foreign_keys=ON)."""
    children = db.execute(
        select(MenuCategory).where(MenuCategory.parent_id == category.id)
    ).scalars().all()
    for child in children:
        _delete_menu_subtree(db, child)
    db.flush()
    db.delete(category)


# ============================================
# PAGES
# ============================================
@router.get("/pages", response_model=list[PageRead])
def admin_get_pages(
    lang: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """Все страницы (включая неопубликованные)"""
    stmt = select(Page)
    if lang:
        stmt = stmt.where(Page.language_code == lang)
    stmt = stmt.order_by(Page.id.desc())
    return db.execute(stmt).scalars().all()


@router.post("/pages", response_model=PageRead, status_code=status.HTTP_201_CREATED)
def admin_create_page(item: PageCreate, db: Session = Depends(get_db)):
    db_page = Page(**item.model_dump())
    db.add(db_page)
    try:
        db.commit()
        db.refresh(db_page)
        invalidate_sitemap_cache()
        invalidate_search_cache()
        return db_page
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Page with this slug already exists for this language",
        )
    except Exception:
        db.rollback()
        raise


@router.put("/pages/{id}", response_model=PageRead)
def admin_update_page(id: int, item: PageUpdate, db: Session = Depends(get_db)):
    page = db.get(Page, id)

    if not page:
        raise HTTPException(404, "Page not found")

    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(page, field, value)

    try:
        db.commit()
        db.refresh(page)
        invalidate_sitemap_cache()
        invalidate_search_cache()
        return page
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Страница со slug '{page.slug}' для языка '{page.language_code}' уже существует.",
        )
    except Exception:
        db.rollback()
        # Детали — только в серверный лог, наружу отдаём общий текст
        logger.exception("Page update failed (id=%s)", id)
        raise HTTPException(
            status_code=500,
            detail="Page update failed"
        )


@router.delete("/pages/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_page(id: int, db: Session = Depends(get_db)):
    page = db.get(Page, id)
    if not page:
        raise HTTPException(404, "Page not found")
    db.delete(page)
    try:
        db.commit()
        invalidate_sitemap_cache()
        invalidate_search_cache()
    except Exception:
        db.rollback()
        raise


# ============================================
# NEWS
# ============================================
@router.get("/news", response_model=list[NewsPostRead])
def admin_get_news(
    lang: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """Все новости (включая неопубликованные)"""
    stmt = select(NewsPost)
    if lang:
        stmt = stmt.where(NewsPost.language_code == lang)
    stmt = stmt.order_by(NewsPost.published_at.desc())
    return db.execute(stmt).scalars().all()


@router.post("/news", response_model=NewsPostRead, status_code=status.HTTP_201_CREATED)
def admin_create_news(item: NewsPostCreate, db: Session = Depends(get_db)):
    db_item = NewsPost(**item.model_dump())
    db.add(db_item)
    try:
        db.commit()
        db.refresh(db_item)
        invalidate_sitemap_cache()
        invalidate_search_cache()
        return db_item
    except Exception:
        db.rollback()
        raise


@router.put("/news/{id}", response_model=NewsPostRead)
def admin_update_news(id: int, item: NewsPostUpdate, db: Session = Depends(get_db)):
    post = db.get(NewsPost, id)
    if not post:
        raise HTTPException(404, "News post not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(post, field, value)
    try:
        db.commit()
        db.refresh(post)
        invalidate_sitemap_cache()
        invalidate_search_cache()
        return post
    except Exception:
        db.rollback()
        raise


@router.delete("/news/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_news(id: int, db: Session = Depends(get_db)):
    post = db.get(NewsPost, id)
    if not post:
        raise HTTPException(404, "News post not found")
    db.delete(post)
    try:
        db.commit()
        invalidate_sitemap_cache()
        invalidate_search_cache()
    except Exception:
        db.rollback()
        raise


# ============================================
# ANNOUNCEMENTS
# ============================================
@router.get("/announcements", response_model=list[AnnouncementRead])
def admin_get_announcements(
    lang: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    stmt = select(Announcement)
    if lang:
        stmt = stmt.where(Announcement.language_code == lang)
    stmt = stmt.order_by(Announcement.is_pinned.desc(), Announcement.published_at.desc())
    return db.execute(stmt).scalars().all()


@router.post("/announcements", response_model=AnnouncementRead, status_code=status.HTTP_201_CREATED)
def admin_create_announcement(item: AnnouncementCreate, db: Session = Depends(get_db)):
    db_item = Announcement(**item.model_dump())
    db.add(db_item)
    try:
        db.commit()
        db.refresh(db_item)
        invalidate_search_cache()
        return db_item
    except Exception:
        db.rollback()
        raise


@router.put("/announcements/{id}", response_model=AnnouncementRead)
def admin_update_announcement(id: int, item: AnnouncementUpdate, db: Session = Depends(get_db)):
    item_db = db.get(Announcement, id)
    if not item_db:
        raise HTTPException(404, "Announcement not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(item_db, field, value)
    try:
        db.commit()
        db.refresh(item_db)
        invalidate_search_cache()
        return item_db
    except Exception:
        db.rollback()
        raise


@router.delete("/announcements/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_announcement(id: int, db: Session = Depends(get_db)):
    item_db = db.get(Announcement, id)
    if not item_db:
        raise HTTPException(404, "Announcement not found")
    db.delete(item_db)
    try:
        db.commit()
        invalidate_search_cache()
    except Exception:
        db.rollback()
        raise


# ============================================
# TENDERS
# ============================================
@router.get("/tenders", response_model=list[TenderRead])
def admin_get_tenders(
    lang: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    stmt = select(Tender)
    if lang:
        stmt = stmt.where(Tender.language_code == lang)
    stmt = stmt.order_by(Tender.published_at.desc())
    return db.execute(stmt).scalars().all()


@router.post("/tenders", response_model=TenderRead, status_code=status.HTTP_201_CREATED)
def admin_create_tender(item: TenderCreate, db: Session = Depends(get_db)):
    db_item = Tender(**item.model_dump())
    db.add(db_item)
    try:
        db.commit()
        db.refresh(db_item)
        invalidate_sitemap_cache()
        invalidate_search_cache()
        return db_item
    except Exception:
        db.rollback()
        raise


@router.put("/tenders/{id}", response_model=TenderRead)
def admin_update_tender(id: int, item: TenderUpdate, db: Session = Depends(get_db)):
    item_db = db.get(Tender, id)
    if not item_db:
        raise HTTPException(404, "Tender not found")
    old_doc_url = item_db.document_url
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(item_db, field, value)
    try:
        db.commit()
        db.refresh(item_db)
        invalidate_sitemap_cache()
        invalidate_search_cache()
        if old_doc_url != item_db.document_url:
            _cleanup_local_upload(db, old_doc_url)
        return item_db
    except Exception:
        db.rollback()
        raise


@router.delete("/tenders/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_tender(id: int, db: Session = Depends(get_db)):
    item_db = db.get(Tender, id)
    if not item_db:
        raise HTTPException(404, "Tender not found")
    old_doc_url = item_db.document_url
    db.delete(item_db)
    try:
        db.commit()
        invalidate_sitemap_cache()
        invalidate_search_cache()
        _cleanup_local_upload(db, old_doc_url)
    except Exception:
        db.rollback()
        raise


# ============================================
# DOCUMENTS
# ============================================
@router.get("/documents", response_model=list[DocumentRead])
def admin_get_documents(
    lang: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    stmt = select(Document)
    if lang:
        stmt = stmt.where(Document.language_code == lang)
    stmt = stmt.order_by(Document.published_at.desc())
    return db.execute(stmt).scalars().all()


@router.post("/documents", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
def admin_create_document(item: DocumentCreate, db: Session = Depends(get_db)):
    db_item = Document(**item.model_dump())
    db.add(db_item)
    try:
        db.commit()
        db.refresh(db_item)
        invalidate_search_cache()
        return db_item
    except Exception:
        db.rollback()
        raise


@router.put("/documents/{id}", response_model=DocumentRead)
def admin_update_document(id: int, item: DocumentUpdate, db: Session = Depends(get_db)):
    item_db = db.get(Document, id)
    if not item_db:
        raise HTTPException(404, "Document not found")
    old_file_url = item_db.file_url
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(item_db, field, value)
    try:
        db.commit()
        db.refresh(item_db)
        invalidate_search_cache()
        if old_file_url != item_db.file_url:
            _cleanup_local_upload(db, old_file_url)
        return item_db
    except Exception:
        db.rollback()
        raise


@router.delete("/documents/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_document(id: int, db: Session = Depends(get_db)):
    item_db = db.get(Document, id)
    if not item_db:
        raise HTTPException(404, "Document not found")
    old_file_url = item_db.file_url
    db.delete(item_db)
    try:
        db.commit()
        invalidate_search_cache()
        _cleanup_local_upload(db, old_file_url)
    except Exception:
        db.rollback()
        raise


# ============================================
# GALLERY
# ============================================
@router.get("/gallery", response_model=list[GalleryImageRead])
def admin_get_gallery(db: Session = Depends(get_db)):
    stmt = select(GalleryImage).order_by(GalleryImage.sort_order)
    return db.execute(stmt).scalars().all()


@router.post("/gallery", response_model=GalleryImageRead, status_code=status.HTTP_201_CREATED)
def admin_create_gallery(item: GalleryImageCreate, db: Session = Depends(get_db)):
    db_item = GalleryImage(**item.model_dump())
    db.add(db_item)
    try:
        db.commit()
        db.refresh(db_item)
        invalidate_search_cache()
        return db_item
    except Exception:
        db.rollback()
        raise


@router.put("/gallery/{id}", response_model=GalleryImageRead)
def admin_update_gallery(id: int, item: GalleryImageUpdate, db: Session = Depends(get_db)):
    item_db = db.get(GalleryImage, id)
    if not item_db:
        raise HTTPException(404, "Gallery image not found")
    old_image_url = item_db.image_url
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(item_db, field, value)
    try:
        db.commit()
        db.refresh(item_db)
        invalidate_search_cache()
        if old_image_url != item_db.image_url:
            _cleanup_local_upload(db, old_image_url)
        return item_db
    except Exception:
        db.rollback()
        raise


@router.delete("/gallery/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_gallery(id: int, db: Session = Depends(get_db)):
    item_db = db.get(GalleryImage, id)
    if not item_db:
        raise HTTPException(404, "Gallery image not found")
    old_image_url = item_db.image_url
    db.delete(item_db)
    try:
        db.commit()
        invalidate_search_cache()
        _cleanup_local_upload(db, old_image_url)
    except Exception:
        db.rollback()
        raise


# ============================================
# MENU
# ============================================
@router.get("/menu", response_model=list[MenuCategoryRead])
def admin_get_menu(
    lang: str = Query(default="ru"),
    db: Session = Depends(get_db),
):
    stmt = (
        select(MenuCategory)
        .where(MenuCategory.language_code == lang)
        .order_by(MenuCategory.order)
    )
    return db.execute(stmt).scalars().all()


@router.post("/menu", response_model=MenuCategoryRead, status_code=status.HTTP_201_CREATED)
def admin_create_menu(item: MenuCategoryCreate, db: Session = Depends(get_db)):
    db_item = MenuCategory(**item.model_dump())
    db.add(db_item)
    try:
        db.commit()
        db.refresh(db_item)
        invalidate_search_cache()
        return db_item
    except Exception:
        db.rollback()
        raise


@router.put("/menu/{id}", response_model=MenuCategoryRead)
def admin_update_menu(id: int, item: MenuCategoryUpdate, db: Session = Depends(get_db)):
    if item.parent_id is not None and item.parent_id == id:
        raise HTTPException(status_code=400, detail="Menu category cannot be its own parent")
    item_db = db.get(MenuCategory, id)
    if not item_db:
        raise HTTPException(404, "Menu category not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(item_db, field, value)
    try:
        db.commit()
        db.refresh(item_db)
        invalidate_search_cache()
        return item_db
    except Exception:
        db.rollback()
        raise


@router.delete("/menu/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_menu(id: int, db: Session = Depends(get_db)):
    item_db = db.get(MenuCategory, id)
    if not item_db:
        raise HTTPException(404, "Menu category not found")
    _delete_menu_subtree(db, item_db)
    try:
        db.commit()
        invalidate_search_cache()
    except Exception:
        db.rollback()
        raise


# ============================================
# CONTACT MESSAGES
# ============================================
@router.get("/contacts", response_model=list[ContactMessageRead])
def admin_get_contacts(
    unread_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """Все сообщения с формы контактов"""
    stmt = select(ContactMessage).order_by(ContactMessage.created_at.desc())
    if unread_only:
        stmt = stmt.where(ContactMessage.is_read == False)
    return db.execute(stmt).scalars().all()


@router.patch("/contacts/{id}/read")
def admin_mark_contact_read(id: int, db: Session = Depends(get_db)):
    msg = db.get(ContactMessage, id)
    if not msg:
        raise HTTPException(404, "Contact message not found")
    msg.is_read = True
    try:
        db.commit()
        return {"success": True}
    except Exception:
        db.rollback()
        raise


@router.delete("/contacts/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_contact(id: int, db: Session = Depends(get_db)):
    msg = db.get(ContactMessage, id)
    if not msg:
        raise HTTPException(404, "Contact message not found")
    db.delete(msg)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise


@router.get("/backup")
def admin_backup_database():
    """Горячая консистентная резервная копия SQLite базы данных (через sqlite3.backup API)"""
    src_path = BASE_DIR / "data" / "taracliagaz.db"
    if not src_path.is_file():
        raise HTTPException(status_code=404, detail="Database file not found")

    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    try:
        src_conn = sqlite3.connect(str(src_path))
        dst_conn = sqlite3.connect(str(tmp_path))
        try:
            src_conn.backup(dst_conn)
        finally:
            dst_conn.close()
            src_conn.close()

        data = tmp_path.read_bytes()
    finally:
        tmp_path.unlink(missing_ok=True)

    date_str = datetime.now().strftime("%Y-%m-%d")
    return Response(
        content=data,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="taracliagaz-backup-{date_str}.db"',
            "Cache-Control": "no-store",
        },
    )