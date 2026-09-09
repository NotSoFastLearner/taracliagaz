"""
Конфигурация приложения через pydantic-settings.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = "sqlite:///./taracliagaz.db"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 часа
    ALGORITHM: str = "HS256"
    UPLOAD_DIR: str = "uploads"
    SITE_URL: str = "https://taraclia-gaz.md"
    
    # 🔑 ВАЖНО: список origin для CORS
    # Pydantic автоматически распарсит строку '["..."]' из .env в list
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",   # Vite dev
        "http://localhost:4173",   # Vite preview
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        "https://taraclia-gaz.md",
        "https://www.taraclia-gaz.md",
    ]


_settings: Settings | None = None


def get_settings() -> Settings:
    """Singleton для Settings"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings