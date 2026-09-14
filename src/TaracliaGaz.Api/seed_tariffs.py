"""
Инициализация тарифов. Запуск: python seed_tariffs.py

Тарифы основаны на публичных данных ANRE Молдовы.
Актуальные значения уточняйте на anre.md
Идемпотентный — при повторном запуске не создаёт дубликаты.
"""
import sys
from pathlib import Path
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).parent))

from app.models import Base, Tariff
from app.database import engine, SessionLocal
from sqlalchemy import select


TARIFFS_DATA = [
    # Бытовые потребители
    {
        "name": "Бытовые потребители",
        "category": "residential",
        "price_per_m3": 21.11,
        "fixed_fee": 0.0,
        "valid_from": datetime(2024, 1, 1, tzinfo=timezone.utc),
        "is_active": True,
        "description": "Тариф для населения (потребление до 10 000 м³/год)",
        "language_code": "ru",
        "source_decision": "Решение ANRE №467 от 21.12.2023",
    },
    {
        "name": "Consumatori casnici",
        "category": "residential",
        "price_per_m3": 21.11,
        "fixed_fee": 0.0,
        "valid_from": datetime(2024, 1, 1, tzinfo=timezone.utc),
        "is_active": True,
        "description": "Tarif pentru populație (consum până la 10 000 m³/an)",
        "language_code": "ro",
        "source_decision": "Hotărârea ANRE nr.467 din 21.12.2023",
    },
    # Коммерческие
    {
        "name": "Коммерческие потребители",
        "category": "commercial",
        "price_per_m3": 24.50,
        "fixed_fee": 0.0,
        "valid_from": datetime(2024, 1, 1, tzinfo=timezone.utc),
        "is_active": True,
        "description": "Тариф для юридических лиц и предприятий",
        "language_code": "ru",
        "source_decision": "Решение ANRE №468 от 21.12.2023",
    },
    {
        "name": "Consumatori comerciali",
        "category": "commercial",
        "price_per_m3": 24.50,
        "fixed_fee": 0.0,
        "valid_from": datetime(2024, 1, 1, tzinfo=timezone.utc),
        "is_active": True,
        "description": "Tarif pentru persoane juridice și întreprinderi",
        "language_code": "ro",
        "source_decision": "Hotărârea ANRE nr.468 din 21.12.2023",
    },
]


def seed_tariffs():
    """Создаёт начальные тарифы (идемпотентно)"""
    print("Создаю таблицы тарифов...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    created = 0
    skipped = 0
    
    try:
        for t_data in TARIFFS_DATA:
            # Проверяем: есть ли уже такой тариф (category + valid_from + language_code)
            stmt = select(Tariff).where(
                Tariff.category == t_data["category"],
                Tariff.valid_from == t_data["valid_from"],
                Tariff.language_code == t_data["language_code"],
            )
            existing = db.execute(stmt).scalar_one_or_none()
            
            if existing:
                print(f"Пропущен (уже есть): {t_data['name']} ({t_data['language_code']})")
                skipped += 1
                continue
            
            tariff = Tariff(**t_data)
            db.add(tariff)
            print(f" Создан тариф: {t_data['name']} ({t_data['language_code']}) — {t_data['price_per_m3']} MDL/м³")
            created += 1
        
        db.commit()
        
        print(f"\n Итог: создано {created}, пропущено {skipped}")
        
    except Exception as e:
        db.rollback()
        print(f"\nОшибка: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_tariffs()