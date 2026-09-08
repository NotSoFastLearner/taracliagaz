"""Создаёт таблицу contact_messages"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text, inspect
from app.database import engine

def migrate():
    print(f"Мигрирую БД: {engine.url}")
    
    with engine.connect() as conn:
        try:
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            
            if "contact_messages" in tables:
                print("Таблица contact_messages уже существует")
                return
            
            print("  Создаю таблицу contact_messages...")
            conn.execute(text("""
                CREATE TABLE contact_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(150) NOT NULL,
                    phone VARCHAR(30),
                    message TEXT NOT NULL,
                    ip_address VARCHAR(45),
                    user_agent VARCHAR(500),
                    is_read BOOLEAN DEFAULT 0,
                    is_spam BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            print("Таблица contact_messages создана")
        except Exception as e:
            print(f"Ошибка: {e}")
            conn.rollback()
            raise
    
    print("Миграция завершена!")

if __name__ == "__main__":
    migrate()