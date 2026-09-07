from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Announcement, Document, GalleryImage, NewsPost, Page, Tender, MenuCategory
from ..schemas import (
    AnnouncementCreate,
    AnnouncementRead,
    AnnouncementUpdate,
    DocumentCreate,
    DocumentRead,
    DocumentUpdate,
    GalleryImageCreate,
    GalleryImageRead,
    GalleryImageUpdate,
    NewsPostCreate,
    NewsPostRead,
    NewsPostUpdate,
    PageCreate,
    PageRead,
    PageUpdate,
    TenderCreate,
    TenderRead,
    TenderUpdate,
    MenuCategoryCreate,
    MenuCategoryRead,
    MenuCategoryUpdate,
)
from .auth_router import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


def get_or_404(db: Session, model, id: int):
    obj = db.get(model, id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return obj


# Pages
@router.post("/pages", response_model=PageRead, status_code=status.HTTP_201_CREATED)
def create_page(item: PageCreate, db: Session = Depends(get_db)):
    obj = Page(**item.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/pages/{id}", response_model=PageRead)
def update_page(id: int, item: PageUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, Page, id)
    for k, v in item.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/pages/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_page(id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, Page, id)
    db.delete(obj)
    db.commit()


# News
@router.post("/news", response_model=NewsPostRead, status_code=status.HTTP_201_CREATED)
def create_news(item: NewsPostCreate, db: Session = Depends(get_db)):
    obj = NewsPost(**item.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/news/{id}", response_model=NewsPostRead)
def update_news(id: int, item: NewsPostUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, NewsPost, id)
    for k, v in item.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/news/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_news(id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, NewsPost, id)
    db.delete(obj)
    db.commit()


# Announcements
@router.post("/announcements", response_model=AnnouncementRead, status_code=status.HTTP_201_CREATED)
def create_announcement(item: AnnouncementCreate, db: Session = Depends(get_db)):
    obj = Announcement(**item.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/announcements/{id}", response_model=AnnouncementRead)
def update_announcement(id: int, item: AnnouncementUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, Announcement, id)
    for k, v in item.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/announcements/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, Announcement, id)
    db.delete(obj)
    db.commit()


# Tenders
@router.post("/tenders", response_model=TenderRead, status_code=status.HTTP_201_CREATED)
def create_tender(item: TenderCreate, db: Session = Depends(get_db)):
    obj = Tender(**item.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/tenders/{id}", response_model=TenderRead)
def update_tender(id: int, item: TenderUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, Tender, id)
    for k, v in item.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/tenders/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tender(id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, Tender, id)
    db.delete(obj)
    db.commit()


# Documents
@router.post("/documents", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
def create_document(item: DocumentCreate, db: Session = Depends(get_db)):
    obj = Document(**item.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/documents/{id}", response_model=DocumentRead)
def update_document(id: int, item: DocumentUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, Document, id)
    for k, v in item.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/documents/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, Document, id)
    db.delete(obj)
    db.commit()


# Gallery
@router.post("/gallery", response_model=GalleryImageRead, status_code=status.HTTP_201_CREATED)
def create_gallery_image(item: GalleryImageCreate, db: Session = Depends(get_db)):
    obj = GalleryImage(**item.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/gallery/{id}", response_model=GalleryImageRead)
def update_gallery_image(id: int, item: GalleryImageUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, GalleryImage, id)
    for k, v in item.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/gallery/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gallery_image(id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, GalleryImage, id)
    db.delete(obj)
    db.commit()

@router.post("/menu", response_model=MenuCategoryRead, status_code=status.HTTP_201_CREATED)
def create_menu_item(item: MenuCategoryCreate, db: Session = Depends(get_db)):
    obj = MenuCategory(**item.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/menu/{id}", response_model=MenuCategoryRead)
def update_menu_item(id: int, item: MenuCategoryUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, MenuCategory, id)
    for k, v in item.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/menu/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, MenuCategory, id)
    db.delete(obj)
    db.commit()