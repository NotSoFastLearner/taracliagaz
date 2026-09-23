
"""
Pydantic схемы для валидации входных/выходных данных.
"""
from datetime import datetime
import nh3
from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator


def to_camel(snake: str) -> str:
    components = snake.split("_")
    return components[0] + "".join(x.capitalize() for x in components[1:])


# Общий конфиг для всех классов (camelCase/snake_case)
camel_config = ConfigDict(
    from_attributes=True,
    alias_generator=to_camel,
    populate_by_name=True,
)


# ============================================
# HTML Sanitization (XSS protection)
# ============================================
ALLOWED_TAGS = {
    "p", "br", "strong", "em", "u", "s", "b", "i",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "a", "blockquote", "code", "pre",
    "img", "hr", "div", "span",
    # Таблицы — нужны для мигрированного контента Joomla (Услуги и др.)
    "table", "thead", "tbody", "tfoot", "tr", "td", "th",
    "caption", "colgroup", "col",
    "figure", "figcaption",
}

ALLOWED_ATTRS = {
    "a": {"href", "title", "target", "rel"},
    "img": {"src", "alt", "title", "width", "height"},
    "td": {"colspan", "rowspan"},
    "th": {"colspan", "rowspan"},
    "col": {"span", "width"},
    # "style" разрешён, т.к. контент мигрирован из Joomla с инлайн-стилями.
    # HTML редактируют только админы, риск приемлем.
    "*": {"class", "id", "style"},
}

# Лимиты длины для защиты от DoS
MAX_TITLE_LENGTH = 200
MAX_SUMMARY_LENGTH = 500
MAX_BODY_HTML_LENGTH = 100_000  # 100 KB HTML максимум
MAX_CAPTION_LENGTH = 200
MAX_SLUG_LENGTH = 160


def sanitize_html(html: str) -> str:
    """Очистка HTML от XSS-инъекций"""
    if not html:
        return ""
    return nh3.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRS,
        link_rel="noopener noreferrer nofollow",
    )


# ============================================
# Base classes
# ============================================
class BaseRead(BaseModel):
    model_config = camel_config
    id: int
    created_at: datetime
    updated_at: datetime


class BaseInput(BaseModel):
    """Базовый класс для Create/Update — принимает camelCase и snake_case"""
    model_config = camel_config


class UserRead(BaseRead):
    username: str
    role: str


# ============================================
# PAGES
# ============================================
class PageBase(BaseInput):
    slug: str = Field(..., max_length=MAX_SLUG_LENGTH)
    title: str = Field(..., min_length=1, max_length=MAX_TITLE_LENGTH)
    body_html: str = Field(..., max_length=MAX_BODY_HTML_LENGTH)
    language_code: str = "ru"
    is_published: bool = True


class PageCreate(PageBase):
    @field_validator("body_html")
    @classmethod
    def clean_body_html(cls, v: str) -> str:
        return sanitize_html(v)


class PageUpdate(BaseInput):
    title: str | None = Field(None, max_length=MAX_TITLE_LENGTH)
    body_html: str | None = Field(None, max_length=MAX_BODY_HTML_LENGTH)
    is_published: bool | None = None

    @field_validator("body_html")
    @classmethod
    def clean_body_html(cls, v: str | None) -> str | None:
        return sanitize_html(v) if v is not None else None


class PageRead(PageBase, BaseRead):
    pass


# ============================================
# NEWS
# ============================================
class NewsPostBase(BaseInput):
    title: str
    summary: str
    body_html: str
    published_at: datetime
    language_code: str = "ru"
    is_published: bool = True


class NewsPostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=MAX_TITLE_LENGTH)
    summary: str = Field("", max_length=MAX_SUMMARY_LENGTH)
    body_html: str = Field(..., max_length=MAX_BODY_HTML_LENGTH)
    language_code: str = "ru"

    @field_validator("body_html")
    @classmethod
    def clean_body_html(cls, v: str) -> str:
        return sanitize_html(v)


class NewsPostUpdate(BaseModel):
    title: str | None = Field(None, max_length=MAX_TITLE_LENGTH)
    summary: str | None = Field(None, max_length=MAX_SUMMARY_LENGTH)
    body_html: str | None = Field(None, max_length=MAX_BODY_HTML_LENGTH)
    is_published: bool | None = None

    @field_validator("body_html")
    @classmethod
    def clean_body_html(cls, v: str | None) -> str | None:
        return sanitize_html(v) if v is not None else None


class NewsPostRead(NewsPostBase, BaseRead):
    pass


# ============================================
# ANNOUNCEMENTS
# ============================================
class AnnouncementBase(BaseInput):
    title: str = Field(..., min_length=1, max_length=MAX_TITLE_LENGTH)
    body_html: str = Field(..., max_length=MAX_BODY_HTML_LENGTH)
    published_at: datetime
    is_pinned: bool = False
    language_code: str = "ru"
    is_published: bool = True


class AnnouncementCreate(AnnouncementBase):
    @field_validator("body_html")
    @classmethod
    def clean_body_html(cls, v: str) -> str:
        return sanitize_html(v)


class AnnouncementUpdate(BaseInput):
    title: str | None = Field(None, max_length=MAX_TITLE_LENGTH)
    body_html: str | None = Field(None, max_length=MAX_BODY_HTML_LENGTH)
    published_at: datetime | None = None
    is_pinned: bool | None = None
    is_published: bool | None = None

    @field_validator("body_html")
    @classmethod
    def clean_body_html(cls, v: str | None) -> str | None:
        return sanitize_html(v) if v is not None else None


class AnnouncementRead(AnnouncementBase, BaseRead):
    pass


# ============================================
# TENDERS
# ============================================
class TenderBase(BaseInput):
    title: str = Field(..., min_length=1, max_length=MAX_TITLE_LENGTH)
    body_html: str = Field(..., max_length=MAX_BODY_HTML_LENGTH)
    published_at: datetime
    deadline_at: datetime | None = None
    document_url: str | None = Field(None, max_length=500)
    external_url: str | None = Field(None, max_length=1000)
    language_code: str = "ru"
    is_published: bool = True


class TenderCreate(TenderBase):
    @field_validator("body_html")
    @classmethod
    def clean_body_html(cls, v: str) -> str:
        return sanitize_html(v)


class TenderUpdate(BaseInput):
    title: str | None = Field(None, max_length=MAX_TITLE_LENGTH)
    body_html: str | None = Field(None, max_length=MAX_BODY_HTML_LENGTH)
    published_at: datetime | None = None
    deadline_at: datetime | None = None
    document_url: str | None = Field(None, max_length=500)
    external_url: str | None = Field(None, max_length=1000)
    is_published: bool | None = None

    @field_validator("body_html")
    @classmethod
    def clean_body_html(cls, v: str | None) -> str | None:
        return sanitize_html(v) if v is not None else None


class TenderRead(TenderBase, BaseRead):
    pass


# ============================================
# DOCUMENTS
# ============================================
class DocumentBase(BaseInput):
    title: str = Field(..., min_length=1, max_length=MAX_TITLE_LENGTH)
    category_slug: str = Field(..., max_length=100)
    file_url: str = Field(..., max_length=500)
    published_at: datetime
    language_code: str = "ru"
    is_published: bool = True


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseInput):
    title: str | None = Field(None, max_length=MAX_TITLE_LENGTH)
    category_slug: str | None = Field(None, max_length=100)
    file_url: str | None = Field(None, max_length=500)
    published_at: datetime | None = None
    is_published: bool | None = None


class DocumentRead(DocumentBase, BaseRead):
    pass


# ============================================
# GALLERY
# ============================================
class GalleryImageBase(BaseInput):
    caption: str = Field(..., max_length=MAX_CAPTION_LENGTH)
    image_url: str = Field(..., max_length=500)
    sort_order: int = 0
    is_published: bool = True


class GalleryImageCreate(GalleryImageBase):
    pass


class GalleryImageUpdate(BaseInput):
    caption: str | None = Field(None, max_length=MAX_CAPTION_LENGTH)
    image_url: str | None = Field(None, max_length=500)
    sort_order: int | None = None
    is_published: bool | None = None


class GalleryImageRead(GalleryImageBase, BaseRead):
    pass


# ============================================
# MENU
# ============================================
class MenuCategoryBase(BaseInput):
    title: str = Field(..., min_length=1, max_length=MAX_TITLE_LENGTH)
    slug: str = Field(..., max_length=100)
    parent_id: int | None = None
    order: int = 0
    language_code: str = "ru"


class MenuCategoryCreate(MenuCategoryBase):
    pass


class MenuCategoryUpdate(BaseInput):
    title: str | None = Field(None, max_length=MAX_TITLE_LENGTH)
    slug: str | None = Field(None, max_length=100)
    parent_id: int | None = None
    order: int | None = None
    language_code: str | None = None


class MenuCategoryRead(MenuCategoryBase, BaseRead):
    pass


# ============================================
# CONTACTS
# ============================================
class ContactMessageCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str | None = Field(None, max_length=30)
    message: str = Field(..., min_length=10, max_length=5000)
    website_url: str | None = Field(None, max_length=500)


class ContactMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: str | None
    message: str
    ip_address: str | None
    is_read: bool
    is_spam: bool
    created_at: datetime


# ============================================
# TARIFFS (калькулятор стоимости газа)
# ============================================
class TariffBase(BaseInput):
    name: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., max_length=50)
    price_per_m3: float = Field(..., ge=0, le=10000)
    fixed_fee: float = Field(0.0, ge=0, le=10000)
    valid_from: datetime
    valid_until: datetime | None = None
    is_active: bool = True
    description: str | None = Field(None, max_length=2000)
    language_code: str = "ru"
    source_decision: str | None = Field(None, max_length=200)


class TariffCreate(TariffBase):
    pass


class TariffUpdate(BaseInput):
    name: str | None = Field(None, max_length=200)
    category: str | None = Field(None, max_length=50)
    price_per_m3: float | None = Field(None, ge=0, le=10000)
    fixed_fee: float | None = Field(None, ge=0, le=10000)
    valid_from: datetime | None = None
    valid_until: datetime | None = None
    is_active: bool | None = None
    description: str | None = Field(None, max_length=2000)
    source_decision: str | None = Field(None, max_length=200)


class TariffRead(TariffBase, BaseRead):
    pass

class TariffCalculateRequest(BaseModel):
    """Запрос расчёта стоимости"""
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,  # принимает и camelCase, и snake_case
    )
    
    cubic_meters: float = Field(..., ge=0, le=1000000, description="Объём в м³")
    category: str = Field("residential", description="Категория потребителя")


class TariffCalculateResponse(BaseModel):
    """Результат расчёта"""
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        alias_generator=to_camel,  #  возвращает camelCase
    )
    
    tariff_id: int
    tariff_name: str
    category: str
    price_per_m3: float
    fixed_fee: float
    cubic_meters: float
    gas_cost: float  # м³ × тариф
    total: float  # gas_cost + абонплата
    currency: str = "MDL"
    valid_from: datetime
    source_decision: str | None

# ============================================
# METER READINGS (показания счётчиков)
# ============================================
class MeterReadingCreate(BaseModel):
    """Форма передачи показаний (публичная)"""
    model_config = ConfigDict(populate_by_name=True)
    
    contract_number: str = Field(
        ...,
        min_length=3,
        max_length=50,
        pattern=r"^[A-Za-z0-9\-/]+$",
        description="Номер договора (только буквы, цифры, дефис, слэш)",
    )
    address: str = Field(..., min_length=5, max_length=300)
    reading_value: float = Field(..., ge=0, le=999999999)
    reading_date: datetime
    contact_phone: str | None = Field(None, max_length=30, pattern=r"^[\d\s\+\-\(\)]+$")
    contact_email: EmailStr | None = None
    notes: str | None = Field(None, max_length=1000)
    language_code: str = "ru"
    # Honeypot
    website_url: str | None = Field(None, max_length=500)


class MeterReadingRead(BaseModel):
    """Полная запись показания (для админки)"""
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )
    
    id: int
    contract_number: str
    address: str
    reading_value: float
    previous_reading: float | None
    consumption: float | None
    reading_date: datetime
    contact_phone: str | None
    contact_email: str | None
    notes: str | None
    ip_address: str | None
    is_processed: bool
    processed_at: datetime | None
    processed_by: str | None
    is_spam: bool
    created_at: datetime
    language_code: str


class MeterReadingProcess(BaseModel):
    """Пометить показание как обработанное"""
    processed_by: str = Field(..., min_length=1, max_length=100)


class MeterReadingSuccess(BaseModel):
    """Ответ на успешную отправку"""
    success: bool = True
    message: str
    reading_id: int
    consumption: float | None
    estimated_cost: float | None