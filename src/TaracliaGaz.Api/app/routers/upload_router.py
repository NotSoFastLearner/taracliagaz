"""
Роутер для загрузки файлов (документы, изображения)
"""
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from ..config import get_settings
from .auth_router import get_current_admin
from ..security.rate_limit import limiter
settings = get_settings()
router = APIRouter(prefix="/api/admin/upload", tags=["upload"], dependencies=[Depends(get_current_admin)])

# Создаём папку для загрузок при старте
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_DOC_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """Загрузка изображения (для галереи, новостей, страниц)"""
    
    # Проверка типа
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый тип файла: {file.content_type}. Разрешены: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )
    
    # Читаем содержимое
    content = await file.read()
    
    # Проверка размера
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Файл слишком большой. Максимум: {MAX_FILE_SIZE // (1024*1024)} MB"
        )
    
    # Генерируем уникальное имя
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    # Создаём подпапку images если её нет
    images_dir = UPLOAD_DIR / "images"
    images_dir.mkdir(exist_ok=True)
    
    # Сохраняем файл
    file_path = images_dir / unique_filename
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Возвращаем URL (относительный путь для фронтенда)
    file_url = f"/uploads/images/{unique_filename}"
    
    return {
        "url": file_url,
        "filename": file.filename,
        "size": len(content)
    }


@router.post("/document")
async def upload_document(file: UploadFile = File(...)):
    """Загрузка документа (PDF, DOCX и т.д.)"""
    
    # Проверка типа
    if file.content_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый тип файла: {file.content_type}"
        )
    
    # Читаем содержимое
    content = await file.read()
    
    # Проверка размера
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Файл слишком большой. Максимум: {MAX_FILE_SIZE // (1024*1024)} MB"
        )
    
    # Генерируем уникальное имя
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    # Создаём подпапку documents если её нет
    docs_dir = UPLOAD_DIR / "documents"
    docs_dir.mkdir(exist_ok=True)
    
    # Сохраняем файл
    file_path = docs_dir / unique_filename
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Возвращаем URL
    file_url = f"/uploads/documents/{unique_filename}"
    
    return {
        "url": file_url,
        "filename": file.filename,
        "size": len(content)
    }