"""
Конфигурация приложения через pydantic-settings.
"""
from pathlib import Path, PurePosixPath, PureWindowsPath
import warnings

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

BASE_DIR = Path(__file__).resolve().parent.parent



class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Environment
    ENVIRONMENT: str = "development"  # development | production

    # Database
    DATABASE_URL: str = "sqlite:///./data/taracliagaz.db"

    # Security — ОБЯЗАТЕЛЬНЫЙ ключ с валидацией
    SECRET_KEY: str = Field(
        default=None,
        description="JWT signing key, min 32 chars, required in production"
    )

    # JWT — сокращённый TTL для безопасности
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=480, ge=15, le=1440)  # 8 часов, не 24
    ALGORITHM: str = "HS256"

    # Uploads
    UPLOAD_DIR: str = "uploads"
    IMAGES_DIR: str = "images"
    MAX_UPLOAD_SIZE_MB: int = Field(default=10, ge=1, le=100)

    # Site
    SITE_URL: str = "https://taraclia-gaz.md"

    # SMTP Email Notifications (optional; if SMTP_HOST is empty, email sending is skipped)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@taraclia-gaz.md"
    NOTIFY_EMAIL: str = "office@taraclia-gaz.md"

    # Rate limiting
    RATE_LIMIT_STORAGE_URI: str = "memory://"  # или "redis://localhost:6379/0"

    # Admin bootstrap
    ADMIN_PASSWORD: str = Field(default="admin123")

    # CORS (список доменов)
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        "https://taraclia-gaz.md",
        "https://www.taraclia-gaz.md",
    ]

    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def validate_secret_key(cls, v: str | None, info) -> str:
        environment = info.data.get("ENVIRONMENT", "development")

        if not v:
            if environment == "production":
                raise ValueError(
                    "SECRET_KEY must be set in production. "
                    "Generate: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
                )
            # Dev — генерируем случайный
            import secrets
            return secrets.token_urlsafe(32)

        v_lower = v.lower()
        if (
            v == "taracliagaz_super_secret_key_2026_change_me_later"
            or "change_me" in v_lower
            or "change-me" in v_lower
        ):
            raise ValueError(
                "Insecure SECRET_KEY: default placeholder or key containing 'change_me' is not allowed. "
                "Generate: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )

        if len(v) < 32:
            raise ValueError(
                f"SECRET_KEY must be at least 32 characters, got {len(v)}. "
                "Generate: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )
        return v

    @field_validator("ADMIN_PASSWORD", mode="before")
    @classmethod
    def validate_admin_password(cls, v: str | None, info) -> str:
        environment = info.data.get("ENVIRONMENT", "development")

        if not v or v == "admin123":
            if environment == "production":
                raise ValueError(
                    "ADMIN_PASSWORD must be changed in production. "
                    "Min 12 chars, mixed case + digits required."
                )
            return "admin123"

        if len(v) < 12:
            raise ValueError("ADMIN_PASSWORD must be at least 12 characters")

        has_upper = any(c.isupper() for c in v)
        has_lower = any(c.islower() for c in v)
        has_digit = any(c.isdigit() for c in v)

        if not (has_upper and has_lower and has_digit):
            raise ValueError(
                "ADMIN_PASSWORD must contain uppercase, lowercase, and digits"
            )
        return v

    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "production", "testing"}
        if v not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}")
        return v

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if v and v.startswith("sqlite:///"):
            prefix = "sqlite:///"
            db_part = v[len(prefix):]
            if db_part and db_part != ":memory:":
                query_part = ""
                if "?" in db_part:
                    db_part, query_part = db_part.split("?", 1)
                    query_part = "?" + query_part
                is_abs = PurePosixPath(db_part).is_absolute() or PureWindowsPath(db_part).is_absolute()
                if not is_abs:
                    abs_path = (BASE_DIR / db_part).resolve()
                    return f"sqlite:///{abs_path.as_posix()}{query_part}"
        return v

    @field_validator("UPLOAD_DIR", "IMAGES_DIR", mode="before")
    @classmethod
    def validate_upload_dir(cls, v: str) -> str:
        if v:
            is_abs = PurePosixPath(v).is_absolute() or PureWindowsPath(v).is_absolute()
            if not is_abs:
                return str((BASE_DIR / v).resolve())
        return v



_settings: Settings | None = None


def get_settings() -> Settings:
    """Singleton для Settings с предупреждением о ENVIRONMENT"""
    global _settings
    if _settings is None:
        _settings = Settings()

        # Явное предупреждение если в продакшене забыли ENVIRONMENT
        if _settings.ENVIRONMENT == "development":
            warnings.warn(
                "  Running in DEVELOPMENT mode. "
                "Set ENVIRONMENT=production for production deployment!",
                RuntimeWarning,
                stacklevel=2,
            )
    return _settings