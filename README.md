# TaracliaGaz

Веб-сайт SRL «Taraclia Gaz» — компании по поставке природного газа в Тараклийском районе Молдовы.

**Домен:** https://new.taraclia-gaz.md

## Структура проекта

```text
taracliagaz/
├── src/
│   ├── TaracliaGaz.Api/                # Backend (FastAPI + SQLite)
│   │   ├── app/
│   │   │   ├── main.py                 # инициализация FastAPI, middleware, роутеры
│   │   │   ├── config.py               # валидация настроек (pydantic-settings)
│   │   │   ├── database.py             # SQLAlchemy engine, PRAGMA WAL
│   │   │   ├── models.py               # 9 моделей SQLAlchemy + TimestampMixin
│   │   │   ├── schemas.py              # схемы Pydantic v2, sanitize_html (nh3)
│   │   │   ├── middleware/security.py  # pure ASGI security headers и CSP
│   │   │   ├── security/rate_limit.py  # SlowAPI rate limiting (proxy-aware)
│   │   │   └── routers/                # public, admin, auth, upload, seo
│   │   ├── data/taracliagaz.db         # БД SQLite (WAL)
│   │   ├── passenger_wsgi.py           # потокобезопасный ASGI->WSGI адаптер
│   │   ├── .htaccess                   # правила Passenger и защита файлов
│   │   └── requirements.txt
│   └── TaracliaGaz.Web/                # Frontend (React 19 + TypeScript + Vite 8)
│       ├── index.html                  # app-shell + ранний __TG_BOOTSTRAP__
│       ├── public/                     # robots.txt, og-image.png, sitemap.xsl
│       ├── src/
│       │   ├── api/                    # http, authApi, contentApi, adminApi, uploadApi
│       │   ├── components/             # Header, Footer, RichEditor, SEO, JSON-LD
│       │   ├── hooks/                  # useCachedFetch (SWR), useCookieConsent
│       │   ├── pages/                  # публичные страницы и pages/admin/* (lazy)
│       │   └── utils/                  # sanitize, prefetch, urls, menuHelpers
│       ├── verify_upload_compress.mjs  # автоматизированная проверка сжатия фото
│       └── vite.config.ts
└── README.md
```