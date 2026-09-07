from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )

    DATABASE_URL: str = "sqlite:///./taracliagaz.db"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ALGORITHM: str = "HS256"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    UPLOAD_DIR: str = "uploads"


@lru_cache
def get_settings() -> Settings:
    return Settings()
