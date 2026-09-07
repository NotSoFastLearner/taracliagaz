"""Добавляет колонку external_url в таблицу tenders (универсальный для любой БД)"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text, inspect
from app.database import engine
from app.config import get_settings

settings = get_settings()

def migrate():
    print(f"🔧 Мигрирую БД: {settings.DATABASE_URL}")
    
    with engine.connect() as conn:
        try:
            # Проверяем, существует ли уже колонка
            inspector = inspect(engine)
            columns = [col["name"] for col in inspector.get_columns("tenders")]
            
            if "external_url" in columns:
                print("   ✅ Колонка external_url уже существует")
                return
            
            # Добавляем колонку
            print("   ⏳ Добавляю колонку external_url...")
            conn.execute(text("ALTER TABLE tenders ADD COLUMN external_url VARCHAR(1000) NULL"))
            conn.commit()
            print("   ✅ Добавлена колонка external_url")
            
        except Exception as e:
            print(f"❌ Ошибка: {e}")
            conn.rollback()
            raise
    
    print("🎉 Миграция завершена!")

if __name__ == "__main__":
    migrate()