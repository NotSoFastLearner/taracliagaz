
"""
Главный модуль FastAPI приложения.
"""

import os
import sys
import warnings
import logging
import traceback
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

# -----------------------------------------------------------------------------
# Базовое логирование - настраиваем ДО импорта остальных модулей приложения
# -----------------------------------------------------------------------------

LOG_FILE = Path(__file__).resolve().parent.parent / "taracliagaz_debug.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stderr),
    ],
    force=True,
)

logger = logging.getLogger("app.main")


def log_stage(message: str):
    """Логирование этапов запуска приложения."""
    logger.info("=" * 70)
    logger.info(message)


# -----------------------------------------------------------------------------
# Информация о процессе
# -----------------------------------------------------------------------------

log_stage("TaracliaGaz startup diagnostics")

logger.info("Python version: %s", sys.version)
logger.info("Python executable: %s", sys.executable)
logger.info("Process PID: %s", os.getpid())
logger.info("Current working directory: %s", os.getcwd())
logger.info("main.py location: %s", Path(__file__).resolve())
logger.info("Debug log file: %s", LOG_FILE)

# -----------------------------------------------------------------------------
# Предупреждения
# -----------------------------------------------------------------------------

warnings.filterwarnings(
    "ignore",
    message=".*UnsupportedFieldAttributeWarning.*"
)

logger.info("Warnings configuration completed")

# -----------------------------------------------------------------------------
# Импорты приложения
# -----------------------------------------------------------------------------

try:
    logger.info("Importing application config...")
    from .config import get_settings

    logger.info("Config imported successfully")

except Exception:
    logger.exception("FAILED TO IMPORT config")
    raise


try:
    logger.info("Importing routers...")

    from .routers import (
        public_router,
        admin_router,
        auth_router,
    )

    from .routers import (
        upload_router,
        seo_router,
    )

    logger.info("Routers imported successfully")

except Exception:
    logger.exception("FAILED TO IMPORT ROUTERS")
    raise


try:
    logger.info("Importing security middleware...")

    from .middleware.security import SecurityHeadersMiddleware
    from .security.rate_limit import limiter
    from .security.xss_protection import XSSProtectionMiddleware

    logger.info("Security modules imported successfully")

except Exception:
    logger.exception("FAILED TO IMPORT SECURITY MODULES")
    raise


# -----------------------------------------------------------------------------
# Настройки
# -----------------------------------------------------------------------------

try:
    logger.info("Loading application settings...")

    settings = get_settings()

    logger.info("Settings loaded successfully")
    logger.info("Environment: %s", settings.ENVIRONMENT)
    logger.info("Upload directory: %s", settings.UPLOAD_DIR)

    is_production = settings.ENVIRONMENT == "production"

except Exception:
    logger.exception("FAILED TO LOAD SETTINGS")
    raise


# -----------------------------------------------------------------------------
# Режим приложения
# -----------------------------------------------------------------------------

if settings.ENVIRONMENT == "development":
    logger.warning(
        "Running in DEVELOPMENT mode. "
        "Set ENVIRONMENT=production before deploying!"
    )
    logger.info("CORS origins: %s", settings.CORS_ORIGINS)

else:
    logger.info("Running in PRODUCTION mode")


# -----------------------------------------------------------------------------
# Создание директорий
# -----------------------------------------------------------------------------

try:
    logger.info("Creating upload directories...")

    upload_dir = Path(settings.UPLOAD_DIR)
    images_dir = upload_dir / "images"
    documents_dir = upload_dir / "documents"
    static_dir = Path("app/static")

    upload_dir.mkdir(parents=True, exist_ok=True)
    logger.info("Upload directory ready: %s", upload_dir.resolve())

    images_dir.mkdir(parents=True, exist_ok=True)
    logger.info("Images directory ready: %s", images_dir.resolve())

    documents_dir.mkdir(parents=True, exist_ok=True)
    logger.info("Documents directory ready: %s", documents_dir.resolve())

    static_dir.mkdir(parents=True, exist_ok=True)
    logger.info("Static directory ready: %s", static_dir.resolve())

except Exception:
    logger.exception("FAILED TO CREATE APPLICATION DIRECTORIES")
    raise


# -----------------------------------------------------------------------------
# Создание FastAPI
# -----------------------------------------------------------------------------

try:
    logger.info("Creating FastAPI application...")

    app = FastAPI(
        title="TaracliaGaz API",
        version="1.0.0",
        docs_url=None if is_production else "/docs",
        redoc_url=None if is_production else "/redoc",
        openapi_url=None if is_production else "/openapi.json",
    )

    logger.info("FastAPI application created successfully")

except Exception:
    logger.exception("FAILED TO CREATE FASTAPI APPLICATION")
    raise


# -----------------------------------------------------------------------------
# Rate limiter
# -----------------------------------------------------------------------------

try:
    logger.info("Configuring rate limiter...")

    app.state.limiter = limiter

    logger.info("Rate limiter configured successfully")

except Exception:
    logger.exception("FAILED TO CONFIGURE RATE LIMITER")
    raise


@app.exception_handler(RateLimitExceeded)
async def _rate_limit_exceeded_handler(
    request: Request,
    exc: RateLimitExceeded,
):
    """Обработчик превышения лимита."""

    logger.warning(
        "Rate limit exceeded: %s - %s",
        request.client.host if request.client else "unknown",
        request.url.path,
    )

    return JSONResponse(
        status_code=429,
        content={
            "detail": (
                str(exc.detail)
                if hasattr(exc, "detail")
                else "Rate limit exceeded"
            )
        },
    )


# -----------------------------------------------------------------------------
# CORS
# -----------------------------------------------------------------------------

try:
    logger.info("Configuring CORS...")
    logger.info("CORS origins: %s", settings.CORS_ORIGINS)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "X-Requested-With",
        ],
        expose_headers=[
            "X-RateLimit-Remaining",
            "X-RateLimit-Reset",
        ],
    )

    logger.info("CORS configured successfully")

except Exception:
    logger.exception("FAILED TO CONFIGURE CORS")
    raise


# -----------------------------------------------------------------------------
# Security middleware
# -----------------------------------------------------------------------------

try:
    logger.info("Adding SecurityHeadersMiddleware...")

    app.add_middleware(SecurityHeadersMiddleware)

    logger.info("SecurityHeadersMiddleware added")

except Exception:
    logger.exception("FAILED TO ADD SecurityHeadersMiddleware")
    raise


try:
    logger.info("Adding XSSProtectionMiddleware...")

    app.add_middleware(XSSProtectionMiddleware)

    logger.info("XSSProtectionMiddleware added")

except Exception:
    logger.exception("FAILED TO ADD XSSProtectionMiddleware")
    raise


# -----------------------------------------------------------------------------
# Static files
# -----------------------------------------------------------------------------

try:
    logger.info("Mounting /static...")

    app.mount(
        "/static",
        StaticFiles(directory="app/static"),
        name="static",
    )

    logger.info("/static mounted successfully")

except Exception:
    logger.exception("FAILED TO MOUNT /static")
    raise


try:
    logger.info("Mounting /uploads...")

    app.mount(
        "/uploads",
        StaticFiles(directory=settings.UPLOAD_DIR),
        name="uploads",
    )

    logger.info("/uploads mounted successfully")

except Exception:
    logger.exception("FAILED TO MOUNT /uploads")
    raise


# /images — контент со старого сайта (сканы документов, фото галереи).
# Папку images/ нужно скопировать со старого сайта в корень приложения.
try:
    logger.info("Mounting /images...")

    images_content_dir = Path("images")
    images_content_dir.mkdir(parents=True, exist_ok=True)

    app.mount(
        "/images",
        StaticFiles(directory="images"),
        name="images",
    )

    logger.info("/images mounted successfully")

except Exception:
    logger.exception("FAILED TO MOUNT /images")
    raise


# -----------------------------------------------------------------------------
# Routers
# -----------------------------------------------------------------------------

try:
    logger.info("Registering auth router...")
    app.include_router(auth_router.router)
    logger.info("Auth router registered")

except Exception:
    logger.exception("FAILED TO REGISTER AUTH ROUTER")
    raise


try:
    logger.info("Registering admin router...")
    app.include_router(admin_router.router)
    logger.info("Admin router registered")

except Exception:
    logger.exception("FAILED TO REGISTER ADMIN ROUTER")
    raise


try:
    logger.info("Registering public router...")
    app.include_router(public_router.router)
    logger.info("Public router registered")

except Exception:
    logger.exception("FAILED TO REGISTER PUBLIC ROUTER")
    raise


try:
    logger.info("Registering upload router...")
    app.include_router(upload_router.router)
    logger.info("Upload router registered")

except Exception:
    logger.exception("FAILED TO REGISTER UPLOAD ROUTER")
    raise


try:
    logger.info("Registering SEO router...")
    app.include_router(seo_router.router)
    logger.info("SEO router registered")

except Exception:
    logger.exception("FAILED TO REGISTER SEO ROUTER")
    raise


# -----------------------------------------------------------------------------
# Основные endpoints
# -----------------------------------------------------------------------------

@app.get("/")
async def root():
    return {
        "status": "TaracliaGaz API is online"
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
    }


# -----------------------------------------------------------------------------
# Финальное сообщение
# -----------------------------------------------------------------------------

log_stage("TaracliaGaz API startup completed successfully")

logger.info("FastAPI app object: %r", app)
logger.info("Registered routes: %d", len(app.routes))
logger.info("TaracliaGaz API is READY")
