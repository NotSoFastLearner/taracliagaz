"""
Конфигурация приложения через pydantic-settings.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = "sqlite:///./taracliagaz.db"
    
    # Security - ОБЯЗАТЕЛЬНЫЙ ключ без дефолта
    SECRET_KEY: str = Field(default=None, description="JWT signing key, min 32 chars")
    
    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALGORITHM: str = "HS256"
    
    # Uploads
    UPLOAD_DIR: str = "uploads"
    
    # Site
    SITE_URL: str = "https://taraclia-gaz.md"
    
    # Environment
    ENVIRONMENT: str = "development"  # development | production
    
    # Rate limiting storage
    RATE_LIMIT_STORAGE_URI: str = "memory://"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        "https://taraclia-gaz.md",
        "https://www.taraclia-gaz.md",
    ]
    
    # Admin bootstrap (только для dev; в prod берётся из .env)
    ADMIN_PASSWORD: str = "admin123"

    @field_validator("ADMIN_PASSWORD", mode="before")
    @classmethod
    def validate_admin_password(cls, v: str | None, info) -> str:
        environment = info.data.get("ENVIRONMENT", "development")
    
        if not v or v == "admin123":
            if environment == "production":
                raise ValueError(
                    "ADMIN_PASSWORD must be changed in production. "
                    "Use a strong password (min 12 chars, mixed case, numbers, symbols)."
                )
            return "admin123"  # Dev default
    
        # Проверка сложности
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


_settings: Settings | None = None


def get_settings() -> Settings:
    """Singleton для Settings"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings