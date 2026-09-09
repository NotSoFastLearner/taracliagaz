"""
SEO endpoints: sitemap.xml и robots.txt
"""
from fastapi import APIRouter, Depends, Request
from fastapi.responses import PlainTextResponse, Response
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..database import get_db
from ..models import Page, NewsPost, Announcement, Tender, Document
from ..config import get_settings

router = APIRouter(tags=["seo"])

settings = get_settings()


def get_site_url() -> str:
    """Возвращает публичный URL сайта"""
    return getattr(settings, "SITE_URL", "https://taraclia-gaz.md")


@router.get("/robots.txt", response_class=PlainTextResponse)
async def robots_txt():
    """Генерирует robots.txt для поисковых роботов"""
    content = f"""# robots.txt для {get_site_url()}
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

# Sitemap location
Sitemap: {get_site_url()}/sitemap.xml
"""
    return content


@router.get("/sitemap.xml")
async def sitemap(request: Request, db: Session = Depends(get_db)):
    """
    Динамический XML sitemap для поисковых систем.
    Автоматически включает все опубликованные страницы, новости, тендеры и т.д.
    """
    urls = []

    # 1. Главная страница (высокий приоритет)
    urls.append({
        "loc": f"{get_site_url()}/",
        "changefreq": "daily",
        "priority": "1.0",
    })

    # 2. Основные разделы
    static_routes = [
        ("/news", "daily", "0.8"),
        ("/announcements", "daily", "0.8"),
        ("/tenders", "weekly", "0.7"),
        ("/gallery", "monthly", "0.6"),
        ("/contacts", "monthly", "0.5"),
        ("/transparency", "monthly", "0.5"),
    ]
    for path, freq, prio in static_routes:
        urls.append({
            "loc": f"{get_site_url()}{path}",
            "changefreq": freq,
            "priority": prio,
        })

    # 3. Статические страницы из БД
    pages = db.execute(
        select(Page).where(Page.is_published == True)
    ).scalars().all()
    for p in pages:
        urls.append({
            "loc": f"{get_site_url()}/page/{p.slug}",
            "lastmod": p.updated_at.strftime("%Y-%m-%d") if p.updated_at else None,
            "changefreq": "monthly",
            "priority": "0.6",
        })

    # 4. Новости (каждая новость - отдельный URL)
    news = db.execute(
        select(NewsPost).where(NewsPost.is_published == True)
        .order_by(NewsPost.published_at.desc())
    ).scalars().all()
    for n in news:
        urls.append({
            "loc": f"{get_site_url()}/news/{n.id}",
            "lastmod": n.updated_at.strftime("%Y-%m-%d") if n.updated_at else None,
            "changefreq": "monthly",
            "priority": "0.7",
        })

    # 5. Тендеры (каждый тендер - отдельный URL)
    tenders = db.execute(
        select(Tender).where(Tender.is_published == True)
    ).scalars().all()
    for t in tenders:
        urls.append({
            "loc": f"{get_site_url()}/tenders/{t.id}",
            "lastmod": t.updated_at.strftime("%Y-%m-%d") if t.updated_at else None,
            "changefreq": "weekly",
            "priority": "0.7",
        })

    # 6. Объявления - ТОЛЬКО список (детальных страниц нет в App.tsx)
    # Убрано: /announcements/{a.id} — роута не существует в frontend

    # Формируем XML
    xml_urls = []
    for u in urls:
        url_xml = f'  <url>\n    <loc>{u["loc"]}</loc>\n'
        if u.get("lastmod"):
            url_xml += f'    <lastmod>{u["lastmod"]}</lastmod>\n'
        url_xml += f'    <changefreq>{u["changefreq"]}</changefreq>\n'
        url_xml += f'    <priority>{u["priority"]}</priority>\n'
        url_xml += '  </url>'
        xml_urls.append(url_xml)

    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(xml_urls)}
</urlset>"""

    return Response(
        content=xml_content,
        media_type="application/xml",
    )