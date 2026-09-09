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

    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def validate_secret_key(cls, v: str | None, info) -> str:
        # Получаем ENVIRONMENT из уже валидированных полей
        environment = info.data.get("ENVIRONMENT", "development")
        
        if not v or v == "change-me-in-production":
            if environment == "production":
                raise ValueError(
                    "SECRET_KEY must be set via environment variable in production. "
                    "Generate: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
                )
            # В dev разрешаем сгенерировать автоматически для удобства
            import secrets
            print("⚠️  SECRET_KEY not set, generating random key for development")
            return secrets.token_urlsafe(32)
        
        if len(v) < 32:
            raise ValueError(f"SECRET_KEY must be at least 32 characters, got {len(v)}")
        
        return v


_settings: Settings | None = None


def get_settings() -> Settings:
    """Singleton для Settings"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings