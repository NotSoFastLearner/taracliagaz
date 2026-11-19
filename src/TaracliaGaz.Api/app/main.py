"""
Главный модуль FastAPI приложения.
"""
import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path
import sys
import warnings

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .config import BASE_DIR, get_settings
from .middleware.security import SecurityHeadersMiddleware
from .routers import (
    admin_router,
    auth_router,
    public_router,
    seo_router,
    upload_router,
)
from .security.rate_limit import get_real_client_ip, limiter


def _chmod_quiet(path: Path, mode: int) -> None:
    if os.name != "posix":
        return
    try:
        if path.exists():
            os.chmod(path, mode)
    except OSError:
        pass


class SafeRotatingFileHandler(RotatingFileHandler):
    """RotatingFileHandler, не падающий при гонке ротации между WSGI-процессами."""

    def doRollover(self) -> None:
        try:
            super().doRollover()
            _chmod_quiet(Path(self.baseFilename), 0o600)
        except (PermissionError, OSError):
            pass


LOG_FILE = BASE_DIR / "taracliagaz_debug.log"


def _harden_sensitive_permissions() -> None:
    """Ограничивает права на .env, SQLite БД и лог до 0600/0700 на POSIX-хостинге."""
    data_dir = BASE_DIR / "data"
    _chmod_quiet(BASE_DIR / ".env", 0o600)
    _chmod_quiet(LOG_FILE, 0o600)
    _chmod_quiet(data_dir, 0o700)
    if data_dir.is_dir():
        for db_file in data_dir.glob("*.db*"):
            _chmod_quiet(db_file, 0o600)


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        SafeRotatingFileHandler(
            LOG_FILE,
            maxBytes=5 * 1024 * 1024,
            backupCount=3,
            encoding="utf-8",
        ),
        logging.StreamHandler(sys.stderr),
    ],
    force=True,
)

_harden_sensitive_permissions()

logger = logging.getLogger("app.main")
warnings.filterwarnings("ignore", message=".*UnsupportedFieldAttributeWarning.*")

settings = get_settings()
is_production = settings.ENVIRONMENT == "production"

upload_dir = Path(settings.UPLOAD_DIR)
images_dir = upload_dir / "images"
documents_dir = upload_dir / "documents"
static_dir = BASE_DIR / "app" / "static"
images_content_dir = Path(settings.IMAGES_DIR)

for directory in (upload_dir, images_dir, documents_dir, static_dir, images_content_dir):
    directory.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="TaracliaGaz API",
    version="1.0.0",
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else "/openapi.json",
)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
def _rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Обработчик превышения лимита."""
    logger.warning(
        "Rate limit exceeded: %s - %s",
        get_real_client_ip(request),
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


app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    expose_headers=["X-RateLimit-Remaining", "X-RateLimit-Reset"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=500)

# В production желательно отдавать /static, /uploads, /images напрямую через LiteSpeed/Apache (.htaccess)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")
app.mount("/images", StaticFiles(directory=str(images_content_dir)), name="images")

app.include_router(auth_router.router)
app.include_router(admin_router.router)
app.include_router(public_router.router)
app.include_router(upload_router.router)
app.include_router(upload_router.admin_upload_router)
app.include_router(seo_router.router)


@app.get("/")
def root():
    return {"status": "TaracliaGaz API is online"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
    }


public_router.warm_public_cache()
logger.info("TaracliaGaz API ready (%s, %d routes)", settings.ENVIRONMENT, len(app.routes))
