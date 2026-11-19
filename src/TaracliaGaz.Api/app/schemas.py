
"""
Pydantic схемы для валидации входных/выходных данных.
"""
from datetime import datetime, timezone
import re
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
    # Аккордеоны и YouTube-embeds (FAQ, Видео-инструкция)
    "details", "summary", "iframe",
}

ALLOWED_ATTRS = {
    "a": {"href", "title", "target"},
    "img": {"src", "alt", "title", "width", "height"},
    "td": {"colspan", "rowspan"},
    "th": {"colspan", "rowspan"},
    "col": {"span", "width"},
    "details": {"open"},
    "iframe": {"src", "width", "height", "allowfullscreen", "frameborder", "allow", "loading", "title"},
    # "style" разрешён, т.к. контент мигрирован из Joomla с инлайн-стилями.
    # HTML редактируют только админы, риск приемлем.
    "*": {"class", "id", "style"},
}

_YOUTUBE_EMBED_URL_RE = re.compile(
    r"^https://(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)/embed/[A-Za-z0-9_-]+(?:\?[^\s\"'<>]*)?$",
    re.IGNORECASE,
)
_IFRAME_BLOCK_RE = re.compile(r"<iframe\b([^>]*)>.*?</iframe>", re.IGNORECASE | re.DOTALL)
_NH3_ATTR_RE = re.compile(r'([a-z0-9_-]+)(?:="([^"]*)")?', re.IGNORECASE)

# Лимиты длины для защиты от DoS
MAX_TITLE_LENGTH = 200
MAX_SUMMARY_LENGTH = 500
MAX_BODY_HTML_LENGTH = 100_000  # 100 KB HTML максимум
MAX_CAPTION_LENGTH = 200
MAX_SLUG_LENGTH = 160


def _filter_html_attribute(tag: str, attr: str, value: str) -> str | None:
    """Нативный attribute_filter для nh3: разрешает iframe.src только для YouTube embed."""
    if tag == "iframe" and attr == "src":
        cleaned_url = value.strip()
        return cleaned_url if _YOUTUBE_EMBED_URL_RE.match(cleaned_url) else None
    return value


def _keep_only_valid_iframe(match: re.Match[str]) -> str:
    attrs = _NH3_ATTR_RE.findall(match.group(1))
    if any(k.lower() == "src" and _YOUTUBE_EMBED_URL_RE.match(v) for k, v in attrs):
        return match.group(0)
    return ""


def sanitize_html(html: str) -> str:
    """Очистка HTML от XSS-инъекций"""
    if not html:
        return ""
    cleaned = nh3.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRS,
        attribute_filter=_filter_html_attribute,
        link_rel="noopener noreferrer nofollow",
    )
    return _IFRAME_BLOCK_RE.sub(_keep_only_valid_iframe, cleaned)


def validate_safe_url(url: str | None) -> str | None:
    """Проверка безопасности URL-схемы (защита от Stored XSS)"""
    if url is None:
        return None
    url_clean = url.strip()
    if not url_clean:
        return url_clean
    lower = url_clean.lower()
    if any(lower.startswith(p) for p in ("javascript:", "data:", "vbscript:")):
        raise ValueError("Dangerous URL scheme not allowed (javascript:, data:, vbscript:)")
    if not (lower.startswith("http://") or lower.startswith("https://") or (url_clean.startswith("/") and not url_clean.startswith("//")) or any(lower.startswith(p) for p in ("images/", "uploads/", "static/"))):
        raise ValueError("URL must start with http://, https://, /, or images/|uploads/|static/")
    return url_clean


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
    language_code: str = Field("ru", pattern=r"^(ru|ro)$")
    is_published: bool = True


class PageCreate(PageBase):
    @field_validator("body_html")
    @classmethod
    def clean_body_html(cls, v: str) -> str:
        return sanitize_html(v)


class PageUpdate(BaseInput):
    slug: str | None = Field(None, max_length=MAX_SLUG_LENGTH)
    title: str | None = Field(None, max_length=MAX_TITLE_LENGTH)
    body_html: str | None = Field(None, max_length=MAX_BODY_HTML_LENGTH)
    language_code: str | None = Field(None, pattern=r"^(ru|ro)$")
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
    language_code: str = Field("ru", pattern=r"^(ru|ro)$")
    is_published: bool = True


class NewsPostCreate(BaseInput):
    title: str = Field(..., min_length=1, max_length=MAX_TITLE_LENGTH)
    summary: str = Field("", max_length=MAX_SUMMARY_LENGTH)
    body_html: str = Field(..., max_length=MAX_BODY_HTML_LENGTH)
    published_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc))
    language_code: str = Field("ru", pattern=r"^(ru|ro)$")
    is_published: bool = True

    @field_validator("published_at", mode="before")
    @classmethod
    def default_published_at(cls, v):
        return datetime.now(timezone.utc) if (v is None or v == "") else v

    @field_validator("body_html")
    @classmethod
    def clean_body_html(cls, v: str) -> str:
        return sanitize_html(v)


class NewsPostUpdate(BaseInput):
    title: str | None = Field(None, max_length=MAX_TITLE_LENGTH)
    summary: str | None = Field(None, max_length=MAX_SUMMARY_LENGTH)
    body_html: str | None = Field(None, max_length=MAX_BODY_HTML_LENGTH)
    published_at: datetime | None = None
    language_code: str | None = Field(None, pattern=r"^(ru|ro)$")
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
    language_code: str = Field("ru", pattern=r"^(ru|ro)$")
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
    language_code: str | None = Field(None, pattern=r"^(ru|ro)$")
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
    language_code: str = Field("ru", pattern=r"^(ru|ro)$")
    is_published: bool = True

    @field_validator("document_url", "external_url", mode="before")
    @classmethod
    def validate_urls(cls, v: str | None) -> str | None:
        return validate_safe_url(v)


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
    language_code: str | None = Field(None, pattern=r"^(ru|ro)$")
    is_published: bool | None = None

    @field_validator("body_html")
    @classmethod
    def clean_body_html(cls, v: str | None) -> str | None:
        return sanitize_html(v) if v is not None else None

    @field_validator("document_url", "external_url", mode="before")
    @classmethod
    def validate_urls(cls, v: str | None) -> str | None:
        return validate_safe_url(v)


class TenderRead(TenderBase, BaseRead):
    pass


# ============================================
# DOCUMENTS
# ============================================
class DocumentBase(BaseInput):
    title: str = Field(..., min_length=1, max_length=MAX_TITLE_LENGTH)
    category_slug: str = Field(..., max_length=100)
    file_url: str = Field(..., max_length=1000)
    published_at: datetime
    language_code: str = Field("ru", pattern=r"^(ru|ro)$")
    is_published: bool = True

    @field_validator("file_url", mode="before")
    @classmethod
    def validate_urls(cls, v: str | None) -> str | None:
        return validate_safe_url(v)


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseInput):
    title: str | None = Field(None, max_length=MAX_TITLE_LENGTH)
    category_slug: str | None = Field(None, max_length=100)
    file_url: str | None = Field(None, max_length=1000)
    published_at: datetime | None = None
    language_code: str | None = Field(None, pattern=r"^(ru|ro)$")
    is_published: bool | None = None

    @field_validator("file_url", mode="before")
    @classmethod
    def validate_urls(cls, v: str | None) -> str | None:
        return validate_safe_url(v)


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

    @field_validator("image_url", mode="before")
    @classmethod
    def validate_urls(cls, v: str | None) -> str | None:
        return validate_safe_url(v)


class GalleryImageCreate(GalleryImageBase):
    pass


class GalleryImageUpdate(BaseInput):
    caption: str | None = Field(None, max_length=MAX_CAPTION_LENGTH)
    image_url: str | None = Field(None, max_length=500)
    sort_order: int | None = None
    is_published: bool | None = None

    @field_validator("image_url", mode="before")
    @classmethod
    def validate_urls(cls, v: str | None) -> str | None:
        return validate_safe_url(v)


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
    language_code: str = Field("ru", pattern=r"^(ru|ro)$")


class MenuCategoryCreate(MenuCategoryBase):
    pass


class MenuCategoryUpdate(BaseInput):
    title: str | None = Field(None, max_length=MAX_TITLE_LENGTH)
    slug: str | None = Field(None, max_length=100)
    parent_id: int | None = None
    order: int | None = None
    language_code: str | None = Field(None, pattern=r"^(ru|ro)$")


class MenuCategoryRead(MenuCategoryBase, BaseRead):
    pass


# ============================================
# CONTACTS
# ============================================
class ContactMessageCreate(BaseInput):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str | None = Field(None, max_length=30)
    message: str = Field(..., min_length=10, max_length=5000)
    website_url: str | None = Field(None, max_length=500)

    @field_validator("name", "phone", mode="before")
    @classmethod
    def sanitize_single_line(cls, v: str | None) -> str | None:
        if isinstance(v, str):
            return re.sub(r"[\r\n]+", " ", v).strip()
        return v

    @field_validator("message", mode="before")
    @classmethod
    def strip_message(cls, v: str) -> str:
        return v.strip() if isinstance(v, str) else v


class ContactMessageRead(BaseInput):
    id: int
    name: str
    email: str
    phone: str | None = None
    message: str
    ip_address: str | None = None
    user_agent: str | None = None
    is_read: bool
    is_spam: bool
    created_at: datetime


class BootstrapRead(BaseInput):
    menu: list[MenuCategoryRead]
    announcements: list[AnnouncementRead]
    news: list[NewsPostRead]
    gallery: list[GalleryImageRead]


class PasswordChangeRequest(BaseInput):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=12, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not (any(c.isupper() for c in v) and any(c.islower() for c in v) and any(c.isdigit() for c in v)):
            raise ValueError("Новый пароль должен содержать заглавные и строчные буквы и цифры (минимум 12 символов)")
        return v


class SearchResultItem(BaseInput):
    type: str
    id: int
    title: str
    snippet: str
    url: str