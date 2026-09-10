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
    "p", "br", "strong", "em", "u", "s",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "a", "blockquote", "code", "pre",
    "img", "hr", "div", "span",
}

ALLOWED_ATTRS = {
    "a": {"href", "title", "target", "rel"},
    "img": {"src", "alt", "title", "width", "height"},
    "*": {"class", "id"},
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
        strip_markup_tags=True,
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