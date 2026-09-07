"""Заполняет меню сайта начальными пунктами"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import select
from app.database import SessionLocal
from app.models import MenuCategory

def seed_menu():
    db = SessionLocal()
    try:
        existing = db.execute(select(MenuCategory)).scalars().first()
        if existing:
            print("ℹ️  Меню уже заполнено")
            return

        # Создаём корневые пункты и подпункты
        structure = [
            {"title": "Главная", "slug": "/", "order": 0},
            {"title": "О Нас", "slug": "#", "order": 1, "children": [
                {"title": "История", "slug": "page/history", "order": 0},
                {"title": "Структура и руководство", "slug": "page/leadership", "order": 1},
            ]},
            {"title": "Услуги", "slug": "page/services", "order": 2},
            {"title": "Потребителям", "slug": "#", "order": 3, "children": [
                {"title": "Тарифы", "slug": "page/tariffs", "order": 0},
                {"title": "Законодательство", "slug": "page/legislation", "order": 1},
                {"title": "Вопросы-Ответы", "slug": "page/faq", "order": 2},
                {"title": "Правила безопасности", "slug": "page/safety", "order": 3},
                {"title": "Договора", "slug": "page/contracts", "order": 4},
                {"title": "Развитие сетей", "slug": "page/network-development", "order": 5},
            ]},
            {"title": "Тендеры", "slug": "/tenders", "order": 4},
            {"title": "Новости", "slug": "#", "order": 5, "children": [
                {"title": "Новости", "slug": "/news", "order": 0},
                {"title": "Галерея", "slug": "/gallery", "order": 1},
            ]},
            {"title": "Объявления", "slug": "/announcements", "order": 6},
            {"title": "Прозрачность", "slug": "/transparency", "order": 7},
            {"title": "Контакты", "slug": "/contacts", "order": 8},
        ]

        print("🧭 Создаю структуру меню...")
        
        for item in structure:
            children = item.pop("children", None)
            parent = MenuCategory(**item, language_code="ru")
            db.add(parent)
            db.flush()  # получаем parent.id
            
            if children:
                for child in children:
                    child_obj = MenuCategory(**child, parent_id=parent.id, language_code="ru")
                    db.add(child_obj)
            print(f"   ✅ {item['title']}" + (f" (+{len(children)} подпунктов)" if children else ""))
        
        db.commit()
        print("\n Меню создано!")
    except Exception as e:
        db.rollback()
        print(f" Ошибка: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_menu()