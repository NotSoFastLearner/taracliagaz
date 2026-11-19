import threading
import time
from fastapi import APIRouter, Depends, Request
from fastapi.responses import PlainTextResponse, Response
from sqlalchemy.orm import Session
from sqlalchemy import select
from xml.sax.saxutils import escape as xml_escape

from ..database import get_db
from ..models import Page, NewsPost, Announcement, Tender, Document
from ..config import BASE_DIR, get_settings

router = APIRouter(tags=["seo"])

settings = get_settings()

SITEMAP_CACHE_TTL = 3600.0  # 1 hour TTL
SITEMAP_CACHE_FILE = BASE_DIR / "app" / "static" / "sitemap_cache.xml"
_sitemap_lock = threading.Lock()
_cached_sitemap_content: str | None = None
_cached_sitemap_time: float = 0.0


def invalidate_sitemap_cache():
    """Очищает кэш sitemap.xml (для тестов или при обновлении контента)"""
    global _cached_sitemap_content, _cached_sitemap_time
    with _sitemap_lock:
        _cached_sitemap_content = None
        _cached_sitemap_time = 0.0
        try:
            SITEMAP_CACHE_FILE.unlink(missing_ok=True)
        except OSError:
            pass


def _read_fresh_sitemap_cache(now: float) -> str | None:
    try:
        mtime = SITEMAP_CACHE_FILE.stat().st_mtime
    except OSError:
        return None
    if (now - mtime) >= SITEMAP_CACHE_TTL:
        return None
    if _cached_sitemap_content is not None and _cached_sitemap_time >= mtime:
        return _cached_sitemap_content
    try:
        return SITEMAP_CACHE_FILE.read_text(encoding="utf-8")
    except OSError:
        return None


def get_site_url() -> str:
    """Возвращает публичный URL сайта из настройки SITE_URL."""
    url = getattr(settings, "SITE_URL", "https://taraclia-gaz.md") or "https://taraclia-gaz.md"
    return url.rstrip("/")


@router.get("/robots.txt", response_class=PlainTextResponse)
def robots_txt():
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
def sitemap(request: Request, db: Session = Depends(get_db)):
    """
    Динамический XML sitemap для поисковых систем.
    Автоматически включает все опубликованные страницы, новости, тендеры и т.д.
    Использует потокобезопасный TTL-кэш (3600 сек) для предотвращения частых
    сканирований БД краулерами.
    """
    global _cached_sitemap_content, _cached_sitemap_time

    now = time.time()
    cached = _read_fresh_sitemap_cache(now)
    if cached is not None:
        return Response(
            content=cached,
            media_type="application/xml",
        )

    with _sitemap_lock:
        now = time.time()
        cached = _read_fresh_sitemap_cache(now)
        if cached is not None:
            _cached_sitemap_content = cached
            _cached_sitemap_time = now
            return Response(
                content=cached,
                media_type="application/xml",
            )

        urls = []

        # 1. Главная страница (RU + RO)
        urls.append({
            "loc": f"{get_site_url()}/",
            "changefreq": "daily",
            "priority": "1.0",
        })
        urls.append({
            "loc": f"{get_site_url()}/?lang=ro",
            "changefreq": "daily",
            "priority": "0.9",
        })

        # 2. Основные разделы (RU + RO)
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
            urls.append({
                "loc": f"{get_site_url()}{path}?lang=ro",
                "changefreq": freq,
                "priority": prio,
            })

        # 3. Статические страницы из БД
        pages = db.execute(
            select(Page.slug, Page.language_code, Page.updated_at).where(Page.is_published == True)
        ).all()
        for slug, lang_code, updated_at in pages:
            suffix = "?lang=ro" if lang_code == "ro" else ""
            urls.append({
                "loc": f"{get_site_url()}/page/{slug}{suffix}",
                "lastmod": updated_at.strftime("%Y-%m-%d") if updated_at else None,
                "changefreq": "monthly",
                "priority": "0.6",
            })

        # 4. Новости (каждая новость — одноязычный URL по её language_code)
        news = db.execute(
            select(NewsPost.id, NewsPost.language_code, NewsPost.updated_at, NewsPost.published_at)
            .where(NewsPost.is_published == True)
            .order_by(NewsPost.published_at.desc())
        ).all()
        for nid, lang_code, updated_at, published_at in news:
            suffix = "?lang=ro" if lang_code == "ro" else ""
            mod_dt = updated_at or published_at
            urls.append({
                "loc": f"{get_site_url()}/news/{nid}{suffix}",
                "lastmod": mod_dt.strftime("%Y-%m-%d") if mod_dt else None,
                "changefreq": "monthly",
                "priority": "0.7",
            })

        # 5. Тендеры (каждый тендер — одноязычный URL по его language_code)
        tenders = db.execute(
            select(Tender.id, Tender.language_code, Tender.updated_at, Tender.published_at)
            .where(Tender.is_published == True)
        ).all()
        for tid, lang_code, updated_at, published_at in tenders:
            suffix = "?lang=ro" if lang_code == "ro" else ""
            mod_dt = updated_at or published_at
            urls.append({
                "loc": f"{get_site_url()}/tenders/{tid}{suffix}",
                "lastmod": mod_dt.strftime("%Y-%m-%d") if mod_dt else None,
                "changefreq": "weekly",
                "priority": "0.7",
            })

        # 6. Объявления - ТОЛЬКО список (детальных страниц нет в App.tsx)
        # Убрано: /announcements/{a.id} — роута не существует в frontend

        # Формируем XML (с дедупликацией по loc)
        seen_locs = set()
        unique_urls = []
        for u in urls:
            if u["loc"] not in seen_locs:
                seen_locs.add(u["loc"])
                unique_urls.append(u)

        xml_urls = []
        for u in unique_urls:
            loc_escaped = xml_escape(str(u["loc"]))
            url_xml = f'  <url>\n    <loc>{loc_escaped}</loc>\n'
            if u.get("lastmod"):
                lastmod_escaped = xml_escape(str(u["lastmod"]))
                url_xml += f'    <lastmod>{lastmod_escaped}</lastmod>\n'
            url_xml += f'    <changefreq>{xml_escape(str(u["changefreq"]))}</changefreq>\n'
            url_xml += f'    <priority>{xml_escape(str(u["priority"]))}</priority>\n'
            url_xml += '  </url>'
            xml_urls.append(url_xml)

        xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(xml_urls)}
</urlset>"""

        _cached_sitemap_content = xml_content
        _cached_sitemap_time = time.time()
        try:
            SITEMAP_CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
            tmp_file = SITEMAP_CACHE_FILE.with_suffix(".tmp")
            tmp_file.write_text(xml_content, encoding="utf-8")
            tmp_file.replace(SITEMAP_CACHE_FILE)
        except OSError:
            pass

        return Response(
            content=_cached_sitemap_content,
            media_type="application/xml",
        )


SITEMAP_XSL = """<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="ru">
      <head>
        <title>Карта сайта (Sitemap) — SRL «Taraclia-Gaz»</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1a202c;
            background: #f8f9fa;
            margin: 0;
            padding: 24px 16px;
          }
          .container {
            max-width: 1040px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
            overflow: hidden;
          }
          .header {
            padding: 28px 32px 20px;
            background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
            border-bottom: 1px solid #e2e8f0;
          }
          h1 {
            font-size: 22px;
            font-weight: 700;
            color: #0057b8;
            margin: 0 0 6px 0;
          }
          .desc {
            color: #64748b;
            font-size: 14px;
            margin: 0 0 14px 0;
          }
          .badge-count {
            display: inline-block;
            background: #e0f2fe;
            color: #0369a1;
            font-weight: 600;
            font-size: 13px;
            padding: 4px 10px;
            border-radius: 6px;
          }
          .table-wrapper {
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            text-align: left;
          }
          th {
            background: #f8fafc;
            color: #475569;
            padding: 12px 16px;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
          }
          td {
            padding: 10px 16px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
          }
          tr:hover td {
            background: #f8fafc;
          }
          a {
            color: #0057b8;
            text-decoration: none;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            background: #f1f5f9;
            color: #475569;
          }
          .date {
            color: #64748b;
            font-size: 12px;
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Карта сайта / Harta site-ului</h1>
            <p class="desc">
              XML Sitemap для SRL «Taraclia-Gaz». Этот документ содержит актуальные ссылки на страницы сайта для поисковых систем и пользователей.
            </p>
            <span class="badge-count">
              Всего ссылок: <xsl:value-of select="count(s:urlset/s:url)"/>
            </span>
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style="width: 55%;">URL</th>
                  <th style="width: 15%; text-align: center;">Приоритет</th>
                  <th style="width: 15%; text-align: center;">Период</th>
                  <th style="width: 15%; text-align: right;">Обновлено</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td>
                      <a href="{s:loc}">
                        <xsl:value-of select="s:loc"/>
                      </a>
                    </td>
                    <td style="text-align: center;">
                      <span class="badge"><xsl:value-of select="s:priority"/></span>
                    </td>
                    <td style="text-align: center;">
                      <xsl:if test="s:changefreq">
                        <span class="badge"><xsl:value-of select="s:changefreq"/></span>
                      </xsl:if>
                    </td>
                    <td style="text-align: right;" class="date">
                      <xsl:value-of select="s:lastmod"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
"""


@router.get("/sitemap.xsl")
def sitemap_xsl():
    """XSL-стили для визуального отображения sitemap.xml в браузере"""
    return Response(
        content=SITEMAP_XSL,
        media_type="application/xml",
    )
