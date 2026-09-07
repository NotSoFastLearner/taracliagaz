from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    Announcement,
    Document,
    GalleryImage,
    NewsPost,
    Page,
    Tender,
    MenuCategory,
)
from ..schemas import (
    AnnouncementRead,
    DocumentRead,
    GalleryImageRead,
    NewsPostRead,
    PageRead,
    TenderRead,
    MenuCategoryRead,
)

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/pages/{slug}", response_model=PageRead)
def get_page(slug: str, lang: str = Query(default="ru", regex="^(ru|ro)$"), db: Session = Depends(get_db)):
    stmt = select(Page).where(Page.slug == slug, Page.language_code == lang)
    page = db.execute(stmt).scalar_one_or_none()
    if page is None:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.get("/news", response_model=list[NewsPostRead])
def get_news(lang: str = Query(default="ru", regex="^(ru|ro)$"), db: Session = Depends(get_db)):
    stmt = select(NewsPost).where(NewsPost.language_code == lang).order_by(NewsPost.published_at.desc())
    return db.execute(stmt).scalars().all()


@router.get("/news/{id}", response_model=NewsPostRead)
def get_news_item(id: int, db: Session = Depends(get_db)):
    post = db.get(NewsPost, id)
    if post is None:
        raise HTTPException(status_code=404, detail="News post not found")
    return post


@router.get("/announcements", response_model=list[AnnouncementRead])
def get_announcements(lang: str = Query(default="ru", regex="^(ru|ro)$"), db: Session = Depends(get_db)):
    stmt = select(Announcement).where(Announcement.language_code == lang).order_by(Announcement.is_pinned.desc(), Announcement.published_at.desc())
    return db.execute(stmt).scalars().all()


@router.get("/tenders", response_model=list[TenderRead])
def get_tenders(lang: str = Query(default="ru", regex="^(ru|ro)$"), db: Session = Depends(get_db)):
    stmt = select(Tender).where(Tender.language_code == lang).order_by(Tender.published_at.desc())
    return db.execute(stmt).scalars().all()


@router.get("/documents", response_model=list[DocumentRead])
def get_documents(category_slug: str | None = Query(default=None), lang: str = Query(default="ru", regex="^(ru|ro)$"), db: Session = Depends(get_db)):
    stmt = select(Document).where(Document.language_code == lang).order_by(Document.published_at.desc())
    if category_slug:
        stmt = stmt.where(Document.category_slug == category_slug)
    return db.execute(stmt).scalars().all()


@router.get("/gallery", response_model=list[GalleryImageRead])
def get_gallery(db: Session = Depends(get_db)):
    stmt = select(GalleryImage).order_by(GalleryImage.sort_order)
    return db.execute(stmt).scalars().all()

@router.get("/menu", response_model=list[MenuCategoryRead])
def get_menu(
    lang: str = Query(default="ru", regex="^(ru|ro)$"),
    db: Session = Depends(get_db),
):
    stmt = (
        select(MenuCategory)
        .where(MenuCategory.language_code == lang)
        .order_by(MenuCategory.order)
    )
    return db.execute(stmt).scalars().all()