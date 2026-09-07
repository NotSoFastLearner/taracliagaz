import os
from fastapi import APIRouter, Request, Depends, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Page, NewsPost, Announcement, Tender, Document, GalleryImage, MenuCategory

router = APIRouter(tags=["frontend"])

# Абсолютный путь к папке templates
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))


def get_menu(db: Session, lang: str):
    stmt = select(MenuCategory).where(
        MenuCategory.language_code == lang
    ).order_by(MenuCategory.order)
    return db.execute(stmt).scalars().all()


# ========== ГЛАВНАЯ ==========
@router.get("/", response_class=HTMLResponse)
async def home(
    request: Request,
    lang: str = Query(default="ru", regex="^(ru|ro)$"),
    db: Session = Depends(get_db),
):
    # Новости
    news_stmt = (
        select(NewsPost)
        .where(NewsPost.language_code == lang, NewsPost.is_published == True)
        .order_by(NewsPost.published_at.desc())
        .limit(3)
    )
    news = db.execute(news_stmt).scalars().all()

    # Объявления (pinned сверху)
    ann_stmt = (
        select(Announcement)
        .where(Announcement.language_code == lang, Announcement.is_published == True)
        .order_by(Announcement.is_pinned.desc(), Announcement.published_at.desc())
        .limit(5)
    )
    announcements = db.execute(ann_stmt).scalars().all()

    # Тендеры
    tender_stmt = (
        select(Tender)
        .where(Tender.language_code == lang, Tender.is_published == True)
        .order_by(Tender.published_at.desc())
        .limit(5)
    )
    tenders = db.execute(tender_stmt).scalars().all()

    # Галерея
    gallery_stmt = (
        select(GalleryImage)
        .where(GalleryImage.is_published == True)
        .order_by(GalleryImage.sort_order)
        .limit(6)
    )
    gallery = db.execute(gallery_stmt).scalars().all()

    menu = get_menu(db, lang)

    return templates.TemplateResponse("home.html", {
        "request": request,
        "lang": lang,
        "news": news,
        "announcements": announcements,
        "tenders": tenders,
        "gallery": gallery,
        "menu": menu,
    })


# ========== НОВОСТИ ==========
@router.get("/news", response_class=HTMLResponse)
async def news_list(
    request: Request,
    lang: str = Query(default="ru", regex="^(ru|ro)$"),
    db: Session = Depends(get_db),
):
    stmt = (
        select(NewsPost)
        .where(NewsPost.language_code == lang, NewsPost.is_published == True)
        .order_by(NewsPost.published_at.desc())
    )
    posts = db.execute(stmt).scalars().all()
    menu = get_menu(db, lang)

    return templates.TemplateResponse("news_list.html", {
        "request": request,
        "lang": lang,
        "posts": posts,
        "menu": menu,
    })


@router.get("/news/{post_id}", response_class=HTMLResponse)
async def news_detail(
    request: Request,
    post_id: int,
    lang: str = Query(default="ru", regex="^(ru|ro)$"),
    db: Session = Depends(get_db),
):
    post = db.get(NewsPost, post_id)
    if not post or post.language_code != lang or not post.is_published:
        return templates.TemplateResponse("404.html", {"request": request, "lang": lang}, status_code=404)
    menu = get_menu(db, lang)

    return templates.TemplateResponse("news_detail.html", {
        "request": request,
        "lang": lang,
        "post": post,
        "menu": menu,
    })


# ========== ОБЪЯВЛЕНИЯ ==========
@router.get("/announcements", response_class=HTMLResponse)
async def announcements_page(
    request: Request,
    lang: str = Query(default="ru", regex="^(ru|ro)$"),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Announcement)
        .where(Announcement.language_code == lang, Announcement.is_published == True)
        .order_by(Announcement.is_pinned.desc(), Announcement.published_at.desc())
    )
    items = db.execute(stmt).scalars().all()
    menu = get_menu(db, lang)

    return templates.TemplateResponse("announcements.html", {
        "request": request,
        "lang": lang,
        "items": items,
        "menu": menu,
    })


# ========== ТЕНДЕРЫ ==========
@router.get("/tenders", response_class=HTMLResponse)
async def tenders_page(
    request: Request,
    lang: str = Query(default="ru", regex="^(ru|ro)$"),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Tender)
        .where(Tender.language_code == lang, Tender.is_published == True)
        .order_by(Tender.published_at.desc())
    )
    items = db.execute(stmt).scalars().all()
    menu = get_menu(db, lang)

    return templates.TemplateResponse("tenders.html", {
        "request": request,
        "lang": lang,
        "items": items,
        "menu": menu,
    })


# ========== ДОКУМЕНТЫ ==========
@router.get("/documents", response_class=HTMLResponse)
async def documents_page(
    request: Request,
    lang: str = Query(default="ru", regex="^(ru|ro)$"),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Document)
        .where(Document.language_code == lang, Document.is_published == True)
        .order_by(Document.published_at.desc())
    )
    if category:
        stmt = stmt.where(Document.category_slug == category)
    items = db.execute(stmt).scalars().all()

    # Уникальные категории для фильтра
    cat_stmt = (
        select(Document.category_slug)
        .where(Document.language_code == lang, Document.is_published == True)
        .distinct()
    )
    categories = [c[0] for c in db.execute(cat_stmt).all()]
    menu = get_menu(db, lang)

    return templates.TemplateResponse("documents.html", {
        "request": request,
        "lang": lang,
        "items": items,
        "categories": categories,
        "current_category": category,
        "menu": menu,
    })


# ========== ГАЛЕРЕЯ ==========
@router.get("/gallery", response_class=HTMLResponse)
async def gallery_page(
    request: Request,
    db: Session = Depends(get_db),
):
    stmt = (
        select(GalleryImage)
        .where(GalleryImage.is_published == True)
        .order_by(GalleryImage.sort_order)
    )
    images = db.execute(stmt).scalars().all()
    menu = get_menu(db, "ru")  # галерея без языка, но меню нужно

    return templates.TemplateResponse("gallery.html", {
        "request": request,
        "lang": "ru",
        "images": images,
        "menu": menu,
    })


# ========== СТАТИЧЕСКИЕ СТРАНИЦЫ ==========
@router.get("/page/{slug}", response_class=HTMLResponse)
async def page_detail(
    request: Request,
    slug: str,
    lang: str = Query(default="ru", regex="^(ru|ro)$"),
    db: Session = Depends(get_db),
):
    stmt = select(Page).where(
        Page.slug == slug,
        Page.language_code == lang,
        Page.is_published == True
    )
    page = db.execute(stmt).scalar_one_or_none()
    if not page:
        return templates.TemplateResponse("404.html", {"request": request, "lang": lang}, status_code=404)

    menu = get_menu(db, lang)
    return templates.TemplateResponse("page.html", {
        "request": request,
        "lang": lang,
        "page": page,
        "menu": menu,
    })


# ========== КОНТАКТЫ ==========
@router.get("/contacts", response_class=HTMLResponse)
async def contacts_page(
    request: Request,
    lang: str = Query(default="ru", regex="^(ru|ro)$"),
    db: Session = Depends(get_db),
):
    menu = get_menu(db, lang)
    return templates.TemplateResponse("contacts.html", {
        "request": request,
        "lang": lang,
        "menu": menu,
    })