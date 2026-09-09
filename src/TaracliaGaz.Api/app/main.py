"""
Главный модуль FastAPI приложения.
"""
import warnings
import logging
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from .config import get_settings
from .routers import public_router, auth_router
from .routers import upload_router, seo_router
from .middleware.security import SecurityHeadersMiddleware
from .security.rate_limit import limiter
from .security.xss_protection import XSSProtectionMiddleware

# Игнорим предупреждения Pydantic (для совместимости)
warnings.filterwarnings("ignore", message=".*UnsupportedFieldAttributeWarning.*")

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


settings = get_settings()
is_production = settings.ENVIRONMENT == "production"

# Логируем конфигурацию (без print — только debug)
logger.info(f"Environment: {settings.ENVIRONMENT}")
logger.debug(f"CORS origins: {settings.CORS_ORIGINS}")

# Автоматическое создание папок для загрузок
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.UPLOAD_DIR + "/images").mkdir(parents=True, exist_ok=True)
Path(settings.UPLOAD_DIR + "/documents").mkdir(parents=True, exist_ok=True)
Path("app/static").mkdir(parents=True, exist_ok=True)


app = FastAPI(
    title="TaracliaGaz API",
    version="1.0.0",
    # В production закрываем Swagger для безопасности
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else "/openapi.json",
)


# Rate limiter
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def _rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Обработчик превышения лимита запросов"""
    logger.warning(
        f"Rate limit exceeded: {request.client.host if request.client else 'unknown'} - {request.url.path}"
    )
    return JSONResponse(
        status_code=429,
        content={
            "detail": str(exc.detail) if hasattr(exc, "detail") else "Rate limit exceeded"
        },
    )


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

# Security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# XSS protection middleware (устаревший заголовок, но не вредный)
app.add_middleware(XSSProtectionMiddleware)

# Статические файлы
app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Роутеры
app.include_router(auth_router.router)
app.include_router(public_router.router)
app.include_router(upload_router.router)
app.include_router(seo_router.router)


@app.get("/")
async def root():
    return {"status": "TaracliaGaz API is online"}


@app.get("/health")
async def health():
    return {"status": "ok"}


# Логируем старт приложения
logger.info("TaracliaGaz API started")