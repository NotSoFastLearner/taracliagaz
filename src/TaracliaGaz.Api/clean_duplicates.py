"""Удаляет дубликаты страниц, оставляя только самую свежую запись"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import select, func
from app.database import SessionLocal
from app.models import Page

db = SessionLocal()
try:
    # Находим дубликаты
    stmt = (
        select(Page.slug, Page.language_code)
        .group_by(Page.slug, Page.language_code)
        .having(func.count(Page.id) > 1)
    )
    duplicates = db.execute(stmt).all()
    
    if not duplicates:
        print("Дубликатов нет")
    else:
        total_deleted = 0
        for slug, lang in duplicates:
            # Берём все записи, сортируем по created_at DESC
            pages = db.execute(
                select(Page)
                .where(Page.slug == slug, Page.language_code == lang)
                .order_by(Page.created_at.desc())
            ).scalars().all()
            
            # Оставляем первую (самую свежую), остальные удаляем
            keep = pages[0]
            to_delete = pages[1:]
            
            print(f" slug='{slug}', lang={lang}")
            print(f"   Оставляю: ID={keep.id} '{keep.title}' (created: {keep.created_at})")
            
            for p in to_delete:
                print(f"   Удаляю:   ID={p.id} '{p.title}' (created: {p.created_at})")
                db.delete(p)
                total_deleted += 1
        
        db.commit()
        print(f"\nУдалено {total_deleted} дубликатов")
finally:
    db.close()