from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

import re

def to_camel(snake: str) -> str:
    components = snake.split("_")
    return components[0] + "".join(x.capitalize() for x in components[1:])


class BaseRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )
    id: int
    created_at: datetime
    updated_at: datetime


class UserRead(BaseRead):
    username: str
    role: str


class PageBase(BaseModel):
    slug: str
    title: str
    body_html: str
    language_code: str = "ru"
    is_published: bool = True


class PageCreate(PageBase):
    pass


class PageUpdate(BaseModel):
    title: str | None = None
    body_html: str | None = None
    is_published: bool | None = None


class PageRead(PageBase, BaseRead):
    pass


class NewsPostBase(BaseModel):
    title: str
    summary: str
    body_html: str
    published_at: datetime
    language_code: str = "ru"
    is_published: bool = True


class NewsPostCreate(NewsPostBase):
    pass


class NewsPostUpdate(BaseModel):
    title: str | None = None
    summary: str | None = None
    body_html: str | None = None
    published_at: datetime | None = None
    is_published: bool | None = None


class NewsPostRead(NewsPostBase, BaseRead):
    pass


class AnnouncementBase(BaseModel):
    title: str
    body_html: str
    published_at: datetime
    is_pinned: bool = False
    language_code: str = "ru"
    is_published: bool = True


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(BaseModel):
    title: str | None = None
    body_html: str | None = None
    published_at: datetime | None = None
    is_pinned: bool | None = None
    is_published: bool | None = None


class AnnouncementRead(AnnouncementBase, BaseRead):
    pass


class TenderBase(BaseModel):
    title: str
    body_html: str
    published_at: datetime
    deadline_at: datetime | None = None
    document_url: str | None = None
    language_code: str = "ru"
    is_published: bool = True


class TenderCreate(TenderBase):
    pass


class TenderUpdate(BaseModel):
    title: str | None = None
    body_html: str | None = None
    published_at: datetime | None = None
    deadline_at: datetime | None = None
    document_url: str | None = None
    is_published: bool | None = None


class TenderRead(TenderBase, BaseRead):
    pass


class DocumentBase(BaseModel):
    title: str
    category_slug: str
    file_url: str
    published_at: datetime
    language_code: str = "ru"
    is_published: bool = True


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    title: str | None = None
    category_slug: str | None = None
    file_url: str | None = None
    published_at: datetime | None = None
    is_published: bool | None = None


class DocumentRead(DocumentBase, BaseRead):
    pass


class GalleryImageBase(BaseModel):
    caption: str
    image_url: str
    sort_order: int = 0
    is_published: bool = True


class GalleryImageCreate(GalleryImageBase):
    pass


class GalleryImageUpdate(BaseModel):
    caption: str | None = None
    image_url: str | None = None
    sort_order: int | None = None
    is_published: bool | None = None


class GalleryImageRead(GalleryImageBase, BaseRead):
    pass

class MenuCategoryBase(BaseModel):
    title: str
    slug: str
    parent_id: int | None = None
    order: int = 0
    language_code: str = "ru"


class MenuCategoryCreate(MenuCategoryBase):
    pass


class MenuCategoryUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    parent_id: int | None = None
    order: int | None = None
    language_code: str | None = None


class MenuCategoryRead(MenuCategoryBase, BaseRead):
    pass