import warnings
warnings.filterwarnings("ignore", message=".*UnsupportedFieldAttributeWarning.*")

from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from .config import get_settings
from .routers import public_router, admin_router, auth_router
from .routers import upload_router, seo_router
from .middleware.security import SecurityHeadersMiddleware
from .security.rate_limit import limiter

settings = get_settings()

# Автоматическое создание папок
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.UPLOAD_DIR + "/images").mkdir(parents=True, exist_ok=True)
Path(settings.UPLOAD_DIR + "/documents").mkdir(parents=True, exist_ok=True)
Path("app/static").mkdir(parents=True, exist_ok=True)

# ✅ УБРАЛИ docs_url=None — используем стандартный Swagger
app = FastAPI(
    title="TaracliaGaz API",
    description="Backend API for taraclia-gaz.md",
    version="0.1.0",
)

# 🔒 Подключаем rate limiter
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def _rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Обработчик превышения лимита запросов"""
    # slowapi уже формирует понятное сообщение в exc.detail
    return JSONResponse(
        status_code=429,
        content={
            "detail": str(exc.detail) if hasattr(exc, "detail") else "Rate limit exceeded"
        },
    )


# Security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Статические файлы
app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Роутеры
app.include_router(auth_router.router)
app.include_router(public_router.router)
app.include_router(admin_router.router)
app.include_router(upload_router.router)
app.include_router(seo_router.router)


@app.get("/")
async def root():
    return {"status": "TaracliaGaz API is online"}


@app.get("/health")
async def health():
    return {"status": "ok"}