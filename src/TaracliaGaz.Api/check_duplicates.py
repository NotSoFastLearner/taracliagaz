"""Проверка дубликатов slug в таблице pages"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import select, func
from app.database import SessionLocal
from app.models import Page

db = SessionLocal()
try:
    # Находим slug'и, которые встречаются более 1 раза
    stmt = (
        select(Page.slug, Page.language_code, func.count(Page.id).label("cnt"))
        .group_by(Page.slug, Page.language_code)
        .having(func.count(Page.id) > 1)
    )
    duplicates = db.execute(stmt).all()
    
    if not duplicates:
        print("✅ Дубликатов нет")
    else:
        print(f"⚠️  Найдено {len(duplicates)} дублирующихся slug:")
        for slug, lang, count in duplicates:
            print(f"   - slug='{slug}', lang={lang}, записей: {count}")
            
            # Показываем все записи с этим slug
            pages = db.execute(
                select(Page).where(Page.slug == slug, Page.language_code == lang)
            ).scalars().all()
            for p in pages:
                print(f"      ID={p.id}: '{p.title}' (created: {p.created_at})")
finally:
    db.close()