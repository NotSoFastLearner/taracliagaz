"""Удаляет дубликаты страниц, оставляя только самую свежую запись.
По умолчанию запускается в безопасном режиме (dry-run).
Для реального удаления требуется указать флаг --confirm.
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import select, func
from app.database import SessionLocal
from app.models import Page


def clean_duplicate_pages(confirm: bool = False) -> int:
    """
    Поиск и очистка дубликатов страниц (Page).
    Если confirm=False, выполняется dry-run (без вызовов db.delete и db.commit).
    Если confirm=True, дубликаты удаляются из базы данных.
    """
    db = SessionLocal()
    try:
        stmt = (
            select(Page.slug, Page.language_code)
            .group_by(Page.slug, Page.language_code)
            .having(func.count(Page.id) > 1)
        )
        duplicates = db.execute(stmt).all()

        if not duplicates:
            print("Дубликатов нет")
            return 0

        mode_prefix = "[LIVE]" if confirm else "[DRY-RUN]"
        print(f"{mode_prefix} Найдено групп дубликатов: {len(duplicates)}")
        total_items = 0

        for slug, lang in duplicates:
            pages = db.execute(
                select(Page)
                .where(Page.slug == slug, Page.language_code == lang)
                .order_by(Page.created_at.desc())
            ).scalars().all()

            keep = pages[0]
            to_delete = pages[1:]

            print(f" slug='{slug}', lang={lang}")
            print(f"   Оставляю: ID={keep.id} '{keep.title}' (created: {keep.created_at})")

            for p in to_delete:
                action_text = "Удаляю: " if confirm else "К удалению (dry-run):"
                print(f"   {action_text} ID={p.id} '{p.title}' (created: {p.created_at})")
                if confirm:
                    db.delete(p)
                total_items += 1

        if confirm:
            db.commit()
            print(f"\nУспешно удалено {total_items} дубликатов")
        else:
            print(
                f"\n[DRY-RUN] Найдено {total_items} дубликатов к удалению. "
                "Изменения НЕ применены к базе данных. Чтобы удалить, запустите скрипт с флагом --confirm."
            )

        return total_items
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(
        description="Поиск и удаление дубликатов страниц в базе данных TaracliaGaz."
    )
    parser.add_argument(
        "--confirm",
        action="store_true",
        help="Подтвердить реальное удаление дубликатов из базы. Без флага запускается в безопасном режиме (dry-run).",
    )
    args = parser.parse_args()
    clean_duplicate_pages(confirm=args.confirm)


if __name__ == "__main__":
    main()