"""
Загрузка файлов (изображения и документы).
"""
import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from ..security.rate_limit import limiter
from ..database import get_db
from ..config import get_settings
from .auth_router import get_current_admin
from ..models import User

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

settings = get_settings()

# Разрешённые типы файлов
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".rtf"}
ALLOWED_DOCUMENT_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/rtf",
}

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_DOCUMENT_SIZE = 25 * 1024 * 1024  # 25 MB


def validate_image(file: UploadFile) -> None:
    """Проверка файла изображения + magic bytes"""
    if not file.filename:
        raise HTTPException(400, "Filename is required")
    
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(400, f"Invalid image extension: {ext}")
    
    # Magic bytes проверка
    file.file.seek(0)
    header = file.file.read(16)
    file.file.seek(0)
    
    # JPEG: FF D8 FF
    # PNG: 89 50 4E 47
    # WebP: 52 49 46 46 (RIFF)
    # GIF: 47 49 46 38 (GIF8)
    if ext in {".jpg", ".jpeg"} and not header.startswith(b"\xff\xd8\xff"):
        raise HTTPException(400, "Invalid JPEG file")
    if ext == ".png" and not header.startswith(b"\x89PNG"):
        raise HTTPException(400, "Invalid PNG file")
    if ext == ".webp" and not (header.startswith(b"RIFF") and header[8:12] == b"WEBP"):
        raise HTTPException(400, "Invalid WebP file")
    if ext == ".gif" and not header.startswith(b"GIF8"):
        raise HTTPException(400, "Invalid GIF file")





def validate_document(file: UploadFile) -> None:
    """Проверка файла документа"""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required",
        )
    
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document extension: {ext}. Allowed: {', '.join(ALLOWED_DOCUMENT_EXTENSIONS)}",
        )
    
    # content_type может отсутствовать — проверяем только если есть
    if file.content_type and file.content_type not in ALLOWED_DOCUMENT_CONTENT_TYPES:
        # Разрешаем application/octet-stream как fallback
        if file.content_type != "application/octet-stream":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid document content type: {file.content_type}",
            )


def get_safe_filename(original: str, ext: str) -> str:
    """Генерирует безопасное имя файла с UUID"""
    # Убираем пробелы и спецсимволы из оригинального имени
    safe_name = "".join(
        c for c in Path(original).stem if c.isalnum() or c in ("-", "_")
    )[:50]
    
    if not safe_name:
        safe_name = "file"
    
    unique_id = uuid.uuid4().hex[:8]
    return f"{safe_name}_{unique_id}{ext}"


async def save_file(file: UploadFile, subfolder: str) -> str:
    """Сохраняет файл и возвращает относительный URL"""
    ext = Path(file.filename).suffix.lower()
    filename = get_safe_filename(file.filename, ext)
    
    upload_dir = Path(settings.UPLOAD_DIR) / subfolder
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = upload_dir / filename
    
    # Читаем и сохраняем
    contents = await file.read()
    
    # Проверка размера
    max_size = MAX_IMAGE_SIZE if subfolder == "images" else MAX_DOCUMENT_SIZE
    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {max_size // (1024*1024)} MB",
        )
    
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Возвращаем относительный путь для URL
    return f"/uploads/{subfolder}/{filename}"

@router.post("/image")
@limiter.limit("10/minute")  # 10 загрузок в минуту
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin),
):
    """Загрузить изображение (только для администраторов)"""
    validate_image(file)
    url = await save_file(file, "images")
    return {"url": url, "filename": file.filename}


@router.post("/document")
@limiter.limit("10/minute")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin),
):
    """Загрузить документ (только для администраторов)"""
    validate_document(file)
    url = await save_file(file, "documents")
    return {"url": url, "filename": file.filename}


@router.delete("/image/{filename}")
async def delete_image(
    filename: str,
    current_user: User = Depends(get_current_admin),
):
    """Удалить изображение"""
    # Защита от path traversal
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename",
        )
    
    file_path = Path(settings.UPLOAD_DIR) / "images" / filename
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )
    
    file_path.unlink()
    return {"status": "deleted", "filename": filename}


@router.delete("/document/{filename}")
async def delete_document(
    filename: str,
    current_user: User = Depends(get_current_admin),
):
    """Удалить документ"""
    # Защита от path traversal
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename",
        )
    
    file_path = Path(settings.UPLOAD_DIR) / "documents" / filename
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    file_path.unlink()
    return {"status": "deleted", "filename": filename}