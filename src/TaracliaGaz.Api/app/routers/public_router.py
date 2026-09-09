from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..security.rate_limit import limiter
from ..database import get_db
from ..models import Page, NewsPost, Announcement, Tender, Document, GalleryImage, MenuCategory, ContactMessage
from ..schemas import (
    PageRead, NewsPostRead, AnnouncementRead, TenderRead,
    DocumentRead, GalleryImageRead, MenuCategoryRead,
    ContactMessageCreate,
)

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/pages", response_model=list[PageRead])
def get_pages(lang: str = Query(default="ru", regex="^(ru|ro)$"), db: Session = Depends(get_db)):
    stmt = (
        select(Page)
        .where(Page.language_code == lang, Page.is_published == True)  # ✅
        .order_by(Page.id.desc())
    )
    return db.execute(stmt).scalars().all()


@router.get("/pages/{slug}", response_model=PageRead)
def get_page(slug: str, lang: str = Query(default="ru", regex="^(ru|ro)$"), db: Session = Depends(get_db)):
    stmt = select(Page).where(
        Page.slug == slug,
        Page.language_code == lang,
        Page.is_published == True,  # ✅
    )
    page = db.execute(stmt).scalar_one_or_none()
    if page is None:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.get("/news", response_model=list[NewsPostRead])
def get_news(lang: str = Query(default="ru", regex="^(ru|ro)$"), db: Session = Depends(get_db)):
    stmt = (
        select(NewsPost)
        .where(NewsPost.language_code == lang, NewsPost.is_published == True)  # ✅
        .order_by(NewsPost.published_at.desc())
    )
    return db.execute(stmt).scalars().all()


@router.get("/news/{id}", response_model=NewsPostRead)
def get_news_item(id: int, db: Session = Depends(get_db)):
    post = db.get(NewsPost, id)
    if post is None or not post.is_published:  # ✅
        raise HTTPException(status_code=404, detail="News post not found")
    return post


@router.get("/announcements", response_model=list[AnnouncementRead])
def get_announcements(lang: str = Query(default="ru", regex="^(ru|ro)$"), db: Session = Depends(get_db)):
    stmt = (
        select(Announcement)
        .where(Announcement.language_code == lang, Announcement.is_published == True)  # ✅
        .order_by(Announcement.is_pinned.desc(), Announcement.published_at.desc())
    )
    return db.execute(stmt).scalars().all()


@router.get("/tenders", response_model=list[TenderRead])
def get_tenders(lang: str = Query(default="ru", regex="^(ru|ro)$"), db: Session = Depends(get_db)):
    stmt = (
        select(Tender)
        .where(Tender.language_code == lang, Tender.is_published == True)  # ✅
        .order_by(Tender.published_at.desc())
    )
    return db.execute(stmt).scalars().all()


@router.get("/documents", response_model=list[DocumentRead])
def get_documents(
    category_slug: str | None = Query(default=None),
    lang: str = Query(default="ru", regex="^(ru|ro)$"),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Document)
        .where(Document.language_code == lang, Document.is_published == True)  # ✅
        .order_by(Document.published_at.desc())
    )
    if category_slug:
        stmt = stmt.where(Document.category_slug == category_slug)
    return db.execute(stmt).scalars().all()


@router.get("/gallery", response_model=list[GalleryImageRead])
def get_gallery(db: Session = Depends(get_db)):
    stmt = (
        select(GalleryImage)
        .where(GalleryImage.is_published == True)  # ✅
        .order_by(GalleryImage.sort_order)
    )
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


@router.post("/contact", status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")  # 3 сообщения в минуту с IP
def submit_contact(
    request: Request,
    item: ContactMessageCreate,
    db: Session = Depends(get_db)
):
    """Приём сообщения с формы контактов с honeypot-защитой"""
    is_spam = bool(item.website_url and item.website_url.strip())
    
    if is_spam:
        print(f"Honeypot triggered from {request.client.host}")

    if len(item.name.strip()) < 2:
        raise HTTPException(422, "Имя слишком короткое")
    if len(item.message.strip()) < 10:
        raise HTTPException(422, "Сообщение слишком короткое (мин. 10 символов)")
    if len(item.message) > 5000:
        raise HTTPException(422, "Сообщение слишком длинное (макс. 5000 символов)")
    if "@" not in item.email or "." not in item.email:
        raise HTTPException(422, "Некорректный email")

    contact = ContactMessage(
        name=item.name.strip(),
        email=item.email.strip().lower(),
        phone=item.phone.strip() if item.phone else None,
        message=item.message.strip(),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")[:500] if request.headers.get("user-agent") else None,
        is_spam=is_spam,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    return {
        "success": True,
        "message": "Сообщение отправлено! Мы свяжемся с вами в ближайшее время.",
    }