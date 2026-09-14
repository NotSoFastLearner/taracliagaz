"""
Тарифы на газ — публичные + админские эндпоинты.
ANRE Молдовы требует публикации калькулятора стоимости.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Tariff, User
from ..schemas import (
    TariffRead, TariffCreate, TariffUpdate,
    TariffCalculateRequest, TariffCalculateResponse,
)
from .auth_router import get_current_admin

router = APIRouter(tags=["tariffs"])


# ============================================
# PUBLIC ENDPOINTS
# ============================================
@router.get("/api/public/tariffs", response_model=list[TariffRead])
def get_active_tariffs(
    lang: str = Query(default="ru", regex="^(ru|ro)$"),
    db: Session = Depends(get_db),
):
    """Все действующие тарифы (is_active=True)"""
    now = datetime.now(timezone.utc)
    stmt = (
        select(Tariff)
        .where(
            Tariff.language_code == lang,
            Tariff.is_active == True,
            Tariff.valid_from <= now,
        )
        .order_by(Tariff.category, Tariff.valid_from.desc())
    )
    tariffs = db.execute(stmt).scalars().all()
    # Фильтр по valid_until (на уровне Python, т.к. SQLite сравнение datetime сложнее)
    return [t for t in tariffs if t.valid_until is None or t.valid_until >= now]


@router.get("/api/public/tariffs/history", response_model=list[TariffRead])
def get_tariffs_history(
    lang: str = Query(default="ru", regex="^(ru|ro)$"),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """История тарифов (включая неактуальные)"""
    stmt = (
        select(Tariff)
        .where(Tariff.language_code == lang)
        .order_by(Tariff.valid_from.desc())
    )
    if category:
        stmt = stmt.where(Tariff.category == category)
    return db.execute(stmt).scalars().all()


@router.post("/api/public/tariffs/calculate", response_model=TariffCalculateResponse)
def calculate_tariff(
    request: TariffCalculateRequest,
    db: Session = Depends(get_db),
):
    """
    Рассчитать стоимость газа по действующему тарифу.
    Формула: total = (м³ × price_per_m3) + fixed_fee
    """
    now = datetime.now(timezone.utc)
    
    # Найти действующий тариф для категории
    stmt = (
        select(Tariff)
        .where(
            Tariff.category == request.category,
            Tariff.is_active == True,
            Tariff.valid_from <= now,
        )
        .order_by(Tariff.valid_from.desc())
        .limit(1)
    )
    tariff = db.execute(stmt).scalars().first()
    
    # Если не нашли для категории — fallback на residential
    if tariff is None and request.category != "residential":
        stmt = (
            select(Tariff)
            .where(
                Tariff.category == "residential",
                Tariff.is_active == True,
                Tariff.valid_from <= now,
            )
            .order_by(Tariff.valid_from.desc())
            .limit(1)
        )
        tariff = db.execute(stmt).scalars().first()
    
    if tariff is None:
        raise HTTPException(404, "No active tariff found for this category")
    
    # Проверка valid_until
    if tariff.valid_until and tariff.valid_until < now:
        raise HTTPException(404, "Tariff is no longer valid")
    
    gas_cost = request.cubic_meters * tariff.price_per_m3
    total = gas_cost + tariff.fixed_fee
    
    return TariffCalculateResponse(
        tariff_id=tariff.id,
        tariff_name=tariff.name,
        category=tariff.category,
        price_per_m3=tariff.price_per_m3,
        fixed_fee=tariff.fixed_fee,
        cubic_meters=request.cubic_meters,
        gas_cost=round(gas_cost, 2),
        total=round(total, 2),
        currency="MDL",
        valid_from=tariff.valid_from,
        source_decision=tariff.source_decision,
    )


# ============================================
# ADMIN ENDPOINTS
# ============================================
@router.get("/api/admin/tariffs", response_model=list[TariffRead])
def admin_get_tariffs(
    lang: str = Query(default="ru"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Все тарифы (включая неактивные) — только для админа"""
    stmt = (
        select(Tariff)
        .where(Tariff.language_code == lang)
        .order_by(Tariff.valid_from.desc())
    )
    return db.execute(stmt).scalars().all()


@router.post("/api/admin/tariffs", response_model=TariffRead, status_code=status.HTTP_201_CREATED)
def admin_create_tariff(
    item: TariffCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Создать новый тариф. Автоматически деактивирует предыдущий в той же категории."""
    # Деактивируем предыдущие активные тарифы в этой категории
    stmt = (
        select(Tariff)
        .where(
            Tariff.category == item.category,
            Tariff.is_active == True,
            Tariff.language_code == item.language_code,
        )
    )
    for old in db.execute(stmt).scalars().all():
        old.is_active = False
        old.valid_until = item.valid_from
    
    db_tariff = Tariff(**item.model_dump())
    db.add(db_tariff)
    db.commit()
    db.refresh(db_tariff)
    return db_tariff


@router.put("/api/admin/tariffs/{id}", response_model=TariffRead)
def admin_update_tariff(
    id: int,
    item: TariffUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    tariff = db.get(Tariff, id)
    if not tariff:
        raise HTTPException(404, "Tariff not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(tariff, field, value)
    db.commit()
    db.refresh(tariff)
    return tariff


@router.delete("/api/admin/tariffs/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_tariff(
    id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    tariff = db.get(Tariff, id)
    if not tariff:
        raise HTTPException(404, "Tariff not found")
    db.delete(tariff)
    db.commit()