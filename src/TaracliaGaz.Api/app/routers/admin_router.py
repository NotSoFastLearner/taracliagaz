"""
Административные эндпоинты — CRUD для всего контента.
Все эндпоинты защищены JWT (get_current_admin).
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

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
)
from ..security.rate_limit import limiter
from .auth_router import get_current_admin
from ..models import User

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],  # Все эндпоинты защищены
)


# ============================================
# PAGES
# ============================================
@router.get("/pages", response_model=list[PageRead])
def admin_get_pages(
    lang: str = Query(default="ru"),
    db: Session = Depends(get_db),
):
    """Все страницы (включая неопубликованные)"""
    stmt = (
        select(Page)
        .where(Page.language_code == lang)
        .order_by(Page.id.desc())
    )
    return db.execute(stmt).scalars().all()


@router.post("/pages", response_model=PageRead, status_code=status.HTTP_201_CREATED)
def admin_create_page(item: PageCreate, db: Session = Depends(get_db)):
    db_page = Page(**item.model_dump())
    db.add(db_page)
    db.commit()
    db.refresh(db_page)
    return db_page


@router.put("/pages/{id}", response_model=PageRead)
def admin_update_page(id: int, item: PageUpdate, db: Session = Depends(get_db)):
    page = db.get(Page, id)
    if not page:
        raise HTTPException(404, "Page not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(page, field, value)
    db.commit()
    db.refresh(page)
    return page


@router.delete("/pages/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_page(id: int, db: Session = Depends(get_db)):
    page = db.get(Page, id)
    if not page:
        raise HTTPException(404, "Page not found")
    db.delete(page)
    db.commit()


# ============================================
# NEWS
# ============================================
@router.get("/news", response_model=list[NewsPostRead])
def admin_get_news(
    lang: str = Query(default="ru"),
    db: Session = Depends(get_db),
):
    """Все новости (включая неопубликованные)"""
    stmt = (
        select(NewsPost)
        .where(NewsPost.language_code == lang)
        .order_by(NewsPost.published_at.desc())
    )
    return db.execute(stmt).scalars().all()


@router.post("/news", response_model=NewsPostRead, status_code=status.HTTP_201_CREATED)
def admin_create_news(item: NewsPostCreate, db: Session = Depends(get_db)):
    db_item = NewsPost(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/news/{id}", response_model=NewsPostRead)
def admin_update_news(id: int, item: NewsPostUpdate, db: Session = Depends(get_db)):
    post = db.get(NewsPost, id)
    if not post:
        raise HTTPException(404, "News post not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/news/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_news(id: int, db: Session = Depends(get_db)):
    post = db.get(NewsPost, id)
    if not post:
        raise HTTPException(404, "News post not found")
    db.delete(post)
    db.commit()


# ============================================
# ANNOUNCEMENTS
# ============================================
@router.get("/announcements", response_model=list[AnnouncementRead])
def admin_get_announcements(
    lang: str = Query(default="ru"),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Announcement)
        .where(Announcement.language_code == lang)
        .order_by(Announcement.is_pinned.desc(), Announcement.published_at.desc())
    )
    return db.execute(stmt).scalars().all()


@router.post("/announcements", response_model=AnnouncementRead, status_code=status.HTTP_201_CREATED)
def admin_create_announcement(item: AnnouncementCreate, db: Session = Depends(get_db)):
    db_item = Announcement(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/announcements/{id}", response_model=AnnouncementRead)
def admin_update_announcement(id: int, item: AnnouncementUpdate, db: Session = Depends(get_db)):
    item_db = db.get(Announcement, id)
    if not item_db:
        raise HTTPException(404, "Announcement not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(item_db, field, value)
    db.commit()
    db.refresh(item_db)
    return item_db


@router.delete("/announcements/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_announcement(id: int, db: Session = Depends(get_db)):
    item_db = db.get(Announcement, id)
    if not item_db:
        raise HTTPException(404, "Announcement not found")
    db.delete(item_db)
    db.commit()


# ============================================
# TENDERS
# ============================================
@router.get("/tenders", response_model=list[TenderRead])
def admin_get_tenders(
    lang: str = Query(default="ru"),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Tender)
        .where(Tender.language_code == lang)
        .order_by(Tender.published_at.desc())
    )
    return db.execute(stmt).scalars().all()


@router.post("/tenders", response_model=TenderRead, status_code=status.HTTP_201_CREATED)
def admin_create_tender(item: TenderCreate, db: Session = Depends(get_db)):
    db_item = Tender(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/tenders/{id}", response_model=TenderRead)
def admin_update_tender(id: int, item: TenderUpdate, db: Session = Depends(get_db)):
    item_db = db.get(Tender, id)
    if not item_db:
        raise HTTPException(404, "Tender not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(item_db, field, value)
    db.commit()
    db.refresh(item_db)
    return item_db


@router.delete("/tenders/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_tender(id: int, db: Session = Depends(get_db)):
    item_db = db.get(Tender, id)
    if not item_db:
        raise HTTPException(404, "Tender not found")
    db.delete(item_db)
    db.commit()


# ============================================
# DOCUMENTS
# ============================================
@router.get("/documents", response_model=list[DocumentRead])
def admin_get_documents(
    lang: str = Query(default="ru"),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Document)
        .where(Document.language_code == lang)
        .order_by(Document.published_at.desc())
    )
    return db.execute(stmt).scalars().all()


@router.post("/documents", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
def admin_create_document(item: DocumentCreate, db: Session = Depends(get_db)):
    db_item = Document(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/documents/{id}", response_model=DocumentRead)
def admin_update_document(id: int, item: DocumentUpdate, db: Session = Depends(get_db)):
    item_db = db.get(Document, id)
    if not item_db:
        raise HTTPException(404, "Document not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(item_db, field, value)
    db.commit()
    db.refresh(item_db)
    return item_db


@router.delete("/documents/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_document(id: int, db: Session = Depends(get_db)):
    item_db = db.get(Document, id)
    if not item_db:
        raise HTTPException(404, "Document not found")
    db.delete(item_db)
    db.commit()


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
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/gallery/{id}", response_model=GalleryImageRead)
def admin_update_gallery(id: int, item: GalleryImageUpdate, db: Session = Depends(get_db)):
    item_db = db.get(GalleryImage, id)
    if not item_db:
        raise HTTPException(404, "Gallery image not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(item_db, field, value)
    db.commit()
    db.refresh(item_db)
    return item_db


@router.delete("/gallery/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_gallery(id: int, db: Session = Depends(get_db)):
    item_db = db.get(GalleryImage, id)
    if not item_db:
        raise HTTPException(404, "Gallery image not found")
    db.delete(item_db)
    db.commit()


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
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/menu/{id}", response_model=MenuCategoryRead)
def admin_update_menu(id: int, item: MenuCategoryUpdate, db: Session = Depends(get_db)):
    item_db = db.get(MenuCategory, id)
    if not item_db:
        raise HTTPException(404, "Menu category not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(item_db, field, value)
    db.commit()
    db.refresh(item_db)
    return item_db


@router.delete("/menu/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_menu(id: int, db: Session = Depends(get_db)):
    item_db = db.get(MenuCategory, id)
    if not item_db:
        raise HTTPException(404, "Menu category not found")
    db.delete(item_db)
    db.commit()


# ============================================
# CONTACT MESSAGES
# ============================================
@router.get("/contacts", response_model=list[dict])
def admin_get_contacts(
    unread_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """Все сообщения с формы контактов"""
    stmt = select(ContactMessage).order_by(ContactMessage.created_at.desc())
    if unread_only:
        stmt = stmt.where(ContactMessage.is_read == False)
    messages = db.execute(stmt).scalars().all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "phone": m.phone,
            "message": m.message,
            "ipAddress": m.ip_address,
            "userAgent": m.user_agent,
            "isRead": m.is_read,
            "isSpam": m.is_spam,
            "createdAt": m.created_at,
        }
        for m in messages
    ]


@router.patch("/contacts/{id}/read")
def admin_mark_contact_read(id: int, db: Session = Depends(get_db)):
    msg = db.get(ContactMessage, id)
    if not msg:
        raise HTTPException(404, "Contact message not found")
    msg.is_read = True
    db.commit()
    return {"success": True}


@router.delete("/contacts/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_contact(id: int, db: Session = Depends(get_db)):
    msg = db.get(ContactMessage, id)
    if not msg:
        raise HTTPException(404, "Contact message not found")
    db.delete(msg)
    db.commit()