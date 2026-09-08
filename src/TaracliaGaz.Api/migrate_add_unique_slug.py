"""Добавляет уникальный индекс на (slug, language_code) в таблице pages"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text, inspect
from app.database import engine
from app.config import get_settings

settings = get_settings()
INDEX_NAME = "uq_pages_slug_lang"

def migrate():
    print(f"Мигрирую БД: {settings.DATABASE_URL}")
    
    with engine.connect() as conn:
        try:
            inspector = inspect(engine)
            indexes = inspector.get_indexes("pages")
            unique_constraints = inspector.get_unique_constraints("pages")
            
            # Проверяем, есть ли уже нужный индекс
            existing = [idx for idx in indexes if idx.get("name") == INDEX_NAME]
            existing += [uc for uc in unique_constraints if uc.get("name") == INDEX_NAME]
            
            if existing:
                print("Уникальный индекс уже существует")
                return
            
            print("  Создаю уникальный индекс...")
            # SQLite и MySQL синтаксис одинаковый для CREATE UNIQUE INDEX
            conn.execute(text(
                f"CREATE UNIQUE INDEX {INDEX_NAME} ON pages (slug, language_code)"
            ))
            conn.commit()
            print(" Уникальный индекс создан")
            
        except Exception as e:
            print(f" Ошибка: {e}")
            conn.rollback()
            raise
    
    print("Миграция завершена!")

if __name__ == "__main__":
    migrate()