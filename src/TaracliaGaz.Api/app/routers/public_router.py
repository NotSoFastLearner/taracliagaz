"""
Публичные эндпоинты API — только чтение + форма контактов.
Все GET отдают ТОЛЬКО опубликованный контент (is_published=True).
"""
from contextlib import contextmanager
from contextvars import ContextVar
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
import logging
import re
import smtplib
import threading
import time
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import SessionLocal, get_db
from ..models import (
    Page, NewsPost, Announcement, Tender, Document,
    GalleryImage, MenuCategory, ContactMessage,
)
from ..schemas import (
    PageRead, NewsPostRead, AnnouncementRead, TenderRead,
    DocumentRead, GalleryImageRead, MenuCategoryRead,
    ContactMessageCreate, BootstrapRead, SearchResultItem,
)
from ..security.rate_limit import limiter, CONTACT_LIMIT, get_real_client_ip

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/bootstrap", response_model=BootstrapRead)
def get_bootstrap(lang: str = Query(default="ru", pattern="^(ru|ro)$")):
    """Единый эндпоинт для стартовой загрузки (меню + главная страница за 1 WSGI-запрос)."""
    now = time.monotonic()
    with _search_lock:
        cached = _bootstrap_cache.get(lang)
        if cached and (now - cached[0]) < _SEARCH_CACHE_TTL:
            return cached[1]

    with _session_scope():
        payload = BootstrapRead.model_validate({
            "menu": get_menu(lang=lang),
            "announcements": get_announcements(lang=lang, limit=3),
            "news": get_news(lang=lang),
            "gallery": get_gallery(limit=6),
        })
    with _search_lock:
        _bootstrap_cache[lang] = (now, payload)
    return payload


@router.get("/pages", response_model=list[PageRead])
def get_pages(lang: str = Query(default="ru", pattern="^(ru|ro)$")):
    def _build(db: Session):
        stmt = (
            select(Page)
            .where(Page.language_code == lang, Page.is_published == True)
            .order_by(Page.id.desc())
        )
        items = [PageRead.model_validate(x) for x in db.execute(stmt).scalars().all()]
        now = time.monotonic()
        with _search_lock:
            for p in items:
                _public_cache[f"page:{lang}:{p.slug}"] = (now, p)
        return items

    return _cached_public(f"pages:{lang}", _build)


@router.get("/pages/{slug}", response_model=PageRead)
def get_page(slug: str, lang: str = Query(default="ru", pattern="^(ru|ro)$")):
    def _build(db: Session):
        stmt = select(Page).where(
            Page.slug == slug,
            Page.language_code == lang,
            Page.is_published == True,
        )
        page = db.execute(stmt).scalar_one_or_none()
        if page is None:
            raise HTTPException(status_code=404, detail="Page not found")
        return PageRead.model_validate(page)

    return _cached_public(f"page:{lang}:{slug}", _build)


@router.get("/news", response_model=list[NewsPostRead])
def get_news(lang: str = Query(default="ru", pattern="^(ru|ro)$")):
    def _build(db: Session):
        stmt = (
            select(NewsPost)
            .where(NewsPost.language_code == lang, NewsPost.is_published == True)
            .order_by(NewsPost.published_at.desc())
        )
        items = [NewsPostRead.model_validate(x) for x in db.execute(stmt).scalars().all()]
        now = time.monotonic()
        with _search_lock:
            for item in items:
                _public_cache[f"news-item:{item.id}"] = (now, item)
        return items

    return _cached_public(f"news:{lang}", _build)


@router.get("/news/{id}", response_model=NewsPostRead)
def get_news_item(id: int):
    def _build(db: Session):
        post = db.get(NewsPost, id)
        if post is None or not post.is_published:
            raise HTTPException(status_code=404, detail="News post not found")
        return NewsPostRead.model_validate(post)

    return _cached_public(f"news-item:{id}", _build)


@router.get("/announcements", response_model=list[AnnouncementRead])
def get_announcements(
    lang: str = Query(default="ru", pattern="^(ru|ro)$"),
    limit: int | None = Query(default=None, ge=1, le=200),
):
    def _build(db: Session):
        stmt = (
            select(Announcement)
            .where(Announcement.language_code == lang, Announcement.is_published == True)
            .order_by(Announcement.is_pinned.desc(), Announcement.published_at.desc())
        )
        if limit is not None:
            stmt = stmt.limit(limit)
        return [AnnouncementRead.model_validate(x) for x in db.execute(stmt).scalars().all()]

    return _cached_public(f"announcements:{lang}:{limit}", _build)


@router.get("/tenders", response_model=list[TenderRead])
def get_tenders(lang: str = Query(default="ru", pattern="^(ru|ro)$")):
    def _build(db: Session):
        stmt = (
            select(Tender)
            .where(Tender.language_code == lang, Tender.is_published == True)
            .order_by(Tender.published_at.desc())
        )
        items = [TenderRead.model_validate(x) for x in db.execute(stmt).scalars().all()]
        now = time.monotonic()
        with _search_lock:
            for item in items:
                _public_cache[f"tender-item:{item.id}"] = (now, item)
        return items

    return _cached_public(f"tenders:{lang}", _build)


@router.get("/tenders/{id}", response_model=TenderRead)
def get_tender_item(id: int):
    """Детальная страница тендера"""
    def _build(db: Session):
        tender = db.get(Tender, id)
        if tender is None or not tender.is_published:
            raise HTTPException(status_code=404, detail="Tender not found")
        return TenderRead.model_validate(tender)

    return _cached_public(f"tender-item:{id}", _build)


@router.get("/documents", response_model=list[DocumentRead])
def get_documents(
    category_slug: str | None = Query(default=None),
    lang: str = Query(default="ru", pattern="^(ru|ro)$"),
):
    def _build(db: Session):
        stmt = (
            select(Document)
            .where(Document.language_code == lang, Document.is_published == True)
            .order_by(Document.published_at.desc())
        )
        if category_slug:
            stmt = stmt.where(Document.category_slug == category_slug)
        return [DocumentRead.model_validate(x) for x in db.execute(stmt).scalars().all()]

    return _cached_public(f"documents:{lang}:{category_slug or ''}", _build)


@router.get("/gallery", response_model=list[GalleryImageRead])
def get_gallery(limit: int | None = Query(default=None, ge=1, le=500)):
    def _build(db: Session):
        stmt = (
            select(GalleryImage)
            .where(GalleryImage.is_published == True)
            .order_by(GalleryImage.sort_order)
        )
        if limit is not None:
            stmt = stmt.limit(limit)
        return [GalleryImageRead.model_validate(x) for x in db.execute(stmt).scalars().all()]

    return _cached_public(f"gallery:{limit}", _build)


@router.get("/menu", response_model=list[MenuCategoryRead])
def get_menu(lang: str = Query(default="ru", pattern="^(ru|ro)$")):
    def _build(db: Session):
        stmt = (
            select(MenuCategory)
            .where(MenuCategory.language_code == lang)
            .order_by(MenuCategory.order)
        )
        return [MenuCategoryRead.model_validate(x) for x in db.execute(stmt).scalars().all()]

    return _cached_public(f"menu:{lang}", _build)


_HTML_TAG_RE = re.compile(r"<[^>]+>")
_SEARCH_CACHE_TTL = 300.0
_search_lock = threading.Lock()
_search_index_cache: dict[str, tuple[float, list[dict]]] = {}
_bootstrap_cache: dict[str, tuple[float, BootstrapRead]] = {}
_public_cache: dict[str, tuple[float, object]] = {}
_active_db: ContextVar[Session | None] = ContextVar("_active_db", default=None)


@contextmanager
def _session_scope():
    existing = _active_db.get()
    if existing is not None:
        yield existing
        return
    with SessionLocal() as session:
        token = _active_db.set(session)
        try:
            yield session
        finally:
            _active_db.reset(token)


def _cached_public(key: str, builder):
    now = time.monotonic()
    with _search_lock:
        cached = _public_cache.get(key)
        if cached and (now - cached[0]) < _SEARCH_CACHE_TTL:
            return cached[1]
    with _session_scope() as db:
        value = builder(db)
    with _search_lock:
        if len(_public_cache) >= 512:
            _public_cache.clear()
        _public_cache[key] = (now, value)
    return value


def invalidate_search_cache() -> None:
    """Сбрасывает кэш поискового индекса, bootstrap и публичных эндпоинтов."""
    with _search_lock:
        _search_index_cache.clear()
        _bootstrap_cache.clear()
        _public_cache.clear()


def warm_public_cache() -> None:
    """Прогревает кэш bootstrap и страниц для ru/ro при старте воркера."""
    try:
        with _session_scope():
            for lang in ("ru", "ro"):
                get_bootstrap(lang=lang)
                get_pages(lang=lang)
    except Exception:
        logger.warning("Startup public cache warm failed", exc_info=True)


def _strip_tags(html: str) -> str:
    return re.sub(r"\s+", " ", _HTML_TAG_RE.sub(" ", html or "")).strip()


def _get_search_entries(lang: str) -> list[dict]:
    now = time.monotonic()
    with _search_lock:
        cached = _search_index_cache.get(lang)
        if cached and (now - cached[0]) < _SEARCH_CACHE_TTL:
            return cached[1]

    lang_suffix = "?lang=ro" if lang == "ro" else ""
    entries: list[dict] = []

    with _session_scope() as db:
        for p in db.execute(select(Page).where(Page.language_code == lang, Page.is_published == True)).scalars():
            plain = _strip_tags(p.body_html)
            entries.append({
                "type": "page",
                "id": p.id,
                "title": p.title,
                "title_lower": p.title.casefold(),
                "plain": plain,
                "plain_lower": plain.casefold(),
                "url": f"/page/{p.slug}{lang_suffix}",
                "fixed_snippet": None,
            })

        for n in db.execute(select(NewsPost).where(NewsPost.language_code == lang, NewsPost.is_published == True)).scalars():
            plain = f"{n.summary or ''} {_strip_tags(n.body_html)}".strip()
            entries.append({
                "type": "news",
                "id": n.id,
                "title": n.title,
                "title_lower": n.title.casefold(),
                "plain": plain,
                "plain_lower": plain.casefold(),
                "url": f"/news/{n.id}{lang_suffix}",
                "fixed_snippet": None,
            })

        for a in db.execute(select(Announcement).where(Announcement.language_code == lang, Announcement.is_published == True)).scalars():
            plain = _strip_tags(a.body_html)
            entries.append({
                "type": "announcement",
                "id": a.id,
                "title": a.title,
                "title_lower": a.title.casefold(),
                "plain": plain,
                "plain_lower": plain.casefold(),
                "url": f"/announcements{lang_suffix}",
                "fixed_snippet": None,
            })

        for t in db.execute(select(Tender).where(Tender.language_code == lang, Tender.is_published == True)).scalars():
            plain = _strip_tags(t.body_html)
            entries.append({
                "type": "tender",
                "id": t.id,
                "title": t.title,
                "title_lower": t.title.casefold(),
                "plain": plain,
                "plain_lower": plain.casefold(),
                "url": f"/tenders/{t.id}{lang_suffix}",
                "fixed_snippet": None,
            })

        for d in db.execute(select(Document).where(Document.language_code == lang, Document.is_published == True)).scalars():
            entries.append({
                "type": "document",
                "id": d.id,
                "title": d.title,
                "title_lower": d.title.casefold(),
                "plain": "",
                "plain_lower": "",
                "url": f"/transparency/{d.category_slug}{lang_suffix}",
                "fixed_snippet": d.category_slug,
            })

    with _search_lock:
        _search_index_cache[lang] = (now, entries)
    return entries


def _send_contact_email(
    name: str,
    email: str,
    phone: str | None,
    ip_address: str | None,
    message: str,
) -> None:
    """Отправка уведомления на почту через stdlib smtplib (если настроен SMTP_HOST)."""
    cfg = get_settings()
    if not cfg.SMTP_HOST or not cfg.NOTIFY_EMAIL:
        return
    try:
        msg = EmailMessage()
        msg["Subject"] = f"Новое сообщение с сайта от {name} — Taraclia-Gaz"
        msg["From"] = cfg.SMTP_FROM
        msg["To"] = cfg.NOTIFY_EMAIL
        msg["Reply-To"] = email
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="taraclia-gaz.md")
        msg.set_content(
            f"Имя: {name}\n"
            f"Email: {email}\n"
            f"Телефон: {phone or '—'}\n"
            f"IP: {ip_address or '—'}\n\n"
            f"Сообщение:\n{message}\n"
        )
        if cfg.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(cfg.SMTP_HOST, cfg.SMTP_PORT, timeout=10) as server:
                if cfg.SMTP_USER and cfg.SMTP_PASSWORD:
                    server.login(cfg.SMTP_USER, cfg.SMTP_PASSWORD)
                server.send_message(msg)
        else:
            with smtplib.SMTP(cfg.SMTP_HOST, cfg.SMTP_PORT, timeout=10) as server:
                if cfg.SMTP_USER and cfg.SMTP_PASSWORD:
                    server.starttls()
                    server.login(cfg.SMTP_USER, cfg.SMTP_PASSWORD)
                server.send_message(msg)
        logger.info("Contact email sent to %s via %s:%s", cfg.NOTIFY_EMAIL, cfg.SMTP_HOST, cfg.SMTP_PORT)
    except Exception:
        logger.warning("Failed to send contact email notification", exc_info=True)


@router.get("/search", response_model=list[SearchResultItem])
def search_content(
    q: str = Query(..., min_length=2, max_length=100),
    lang: str = Query(default="ru", pattern="^(ru|ro)$"),
):
    """Поиск по страницам, новостям, объявлениям, тендерам и документам (с поддержкой кириллицы и диакритики)."""
    needle = q.strip().casefold()
    if len(needle) < 2:
        return []

    results: list[dict] = []

    def make_snippet(clean: str) -> str:
        idx = clean.casefold().find(needle)
        if idx == -1:
            return clean[:140] + ("…" if len(clean) > 140 else "")
        start = max(0, idx - 50)
        end = min(len(clean), idx + len(needle) + 90)
        prefix = "…" if start > 0 else ""
        suffix = "…" if end < len(clean) else ""
        return f"{prefix}{clean[start:end]}{suffix}"

    for entry in _get_search_entries(lang):
        if needle in entry["title_lower"] or (entry["plain_lower"] and needle in entry["plain_lower"]):
            results.append({
                "type": entry["type"],
                "id": entry["id"],
                "title": entry["title"],
                "snippet": entry["fixed_snippet"] if entry["fixed_snippet"] is not None else make_snippet(entry["plain"]),
                "url": entry["url"],
            })
            if len(results) >= 25:
                break

    return results


@router.post("/contact", status_code=status.HTTP_201_CREATED)
@limiter.limit(CONTACT_LIMIT)
def submit_contact(
    request: Request,
    item: ContactMessageCreate,
    db: Session = Depends(get_db)
):
    """
    Приём сообщения с формы контактов.
    Honeypot-защита: если поле website_url заполнено — это бот.
    """
    is_spam = bool(item.website_url and item.website_url.strip())
    client_ip = get_real_client_ip(request)

    if is_spam:
        logger.warning("Honeypot triggered from %s", client_ip)
        return {
            "status": "ok",
            "id": 0,
            "is_spam": True,
            "success": True,
            "message": "Сообщение отправлено! Мы свяжемся с вами в ближайшее время.",
        }

    contact = ContactMessage(
        name=item.name,
        email=item.email.strip().lower(),
        phone=item.phone.strip() if item.phone else None,
        message=item.message,
        ip_address=client_ip,
        user_agent=request.headers.get("user-agent")[:500] if request.headers.get("user-agent") else None,
        is_spam=False,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    _send_contact_email(contact.name, contact.email, contact.phone, contact.ip_address, contact.message)

    return {
        "status": "ok",
        "id": contact.id,
        "is_spam": False,
        "success": True,
        "message": "Сообщение отправлено! Мы свяжемся с вами в ближайшее время.",
    }


create_contact_message = submit_contact