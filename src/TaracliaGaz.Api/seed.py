"""
Инициализация БД: создаёт таблицы и первого админа.
Запуск: python seed.py
"""
import sys
from pathlib import Path

# Добавляем текущую директорию в sys.path
sys.path.insert(0, str(Path(__file__).parent))

# ВАЖНО: импортируем ВСЕ модели ПЕРЕД create_all
from app.models import (
    Base, User, Page, NewsPost, Announcement, 
    Tender, Document, GalleryImage, MenuCategory
)
from app.database import engine, SessionLocal
from passlib.context import CryptContext
from sqlalchemy import select
from datetime import datetime, timezone

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_database():
    """Создаёт таблицы и заполняет начальными данными"""
    print("🔧 Создаю таблицы в БД...")
    
    # Создаём ВСЕ таблицы (все модели уже импортированы выше)
    Base.metadata.create_all(bind=engine)
    print("   ✅ Таблицы созданы")
    
    db = SessionLocal()
    try:
        # 1. Создаём первого админа
        print("\n👤 Создаю первого админа...")
        admin_exists = db.execute(select(User).where(User.username == "admin")).scalar_one_or_none()
        
        if not admin_exists:
            admin = User(
                username="admin",
                password_hash=pwd_context.hash("admin123"),
                role="admin"
            )
            db.add(admin)
            db.commit()
            print("   ✅ Админ создан: admin / admin123")
        else:
            print("   ℹ️  Админ уже существует")
        
        # 2. Создаём тестовые страницы
        print("\n📄 Создаю тестовые страницы...")
        test_pages = [
            {"slug": "history", "title": "История предприятия", "body_html": "<p>История Тараклия-ГАЗ началась в 1990-х годах...</p>"},
            {"slug": "leadership", "title": "Структура и руководство", "body_html": "<p>Руководство компании...</p>"},
            {"slug": "services", "title": "Услуги", "body_html": "<p>Газификация, обслуживание сетей, подключение...</p>"},
            {"slug": "tariffs", "title": "Тарифы", "body_html": "<p>Действующие тарифы на природный газ...</p>"},
            {"slug": "contacts", "title": "Контакты", "body_html": "<p>Адрес: г. Тараклия, ул. ...<br>Телефон: ...</p>"},
            {"slug": "faq", "title": "Вопросы-Ответы", "body_html": "<p>Часто задаваемые вопросы...</p>"},
            {"slug": "safety", "title": "Правила безопасности", "body_html": "<p>Правила безопасного использования газа...</p>"},
            {"slug": "contracts", "title": "Договора", "body_html": "<p>Типовые договоры на газоснабжение...</p>"},
            {"slug": "legislation", "title": "Законодательство", "body_html": "<p>Нормативные акты...</p>"},
            {"slug": "network-development", "title": "Руководство по процедуре развития сетей", "body_html": "<p>Процедура подключения к сетям...</p>"},
        ]
        
        for page_data in test_pages:
            page_exists = db.execute(
                select(Page).where(Page.slug == page_data["slug"], Page.language_code == "ru")
            ).scalar_one_or_none()
            
            if not page_exists:
                page = Page(**page_data, language_code="ru")
                db.add(page)
                print(f"   ✅ Создана страница: {page_data['slug']}")
        
        db.commit()
        
        # 3. Создаём тестовую новость
        print("\n📰 Создаю тестовую новость...")
        news_count = db.query(NewsPost).count()
        if news_count == 0:
            news = NewsPost(
                title="Запуск нового сайта",
                summary="Мы рады представить вам обновлённый сайт Тараклия-ГАЗ",
                body_html="<p>Добро пожаловать на наш новый сайт!</p><p>Здесь вы найдёте всю информацию о наших услугах.</p>",
                published_at=datetime.now(timezone.utc),
                language_code="ru"
            )
            db.add(news)
            db.commit()
            print("   ✅ Новость создана")
        
        print("\n" + "="*50)
        print("🎉 База данных инициализирована успешно!")
        print("="*50)
        print("\n🔑 Данные для входа в админку:")
        print("   URL: http://localhost:5173/admin/login")
        print("   Пользователь: admin")
        print("   Пароль: admin123")
        print("="*50)
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()