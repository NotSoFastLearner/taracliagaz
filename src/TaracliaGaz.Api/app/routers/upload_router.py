"""
Загрузка файлов (изображения и документы).
Использует стриминг для защиты от DoS через большие файлы.
"""
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from sqlalchemy.orm import Session
import logging

from ..database import get_db
from ..config import get_settings
from ..security.rate_limit import limiter
from .auth_router import get_current_admin
from ..models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

settings = get_settings()

# Разрешённые типы файлов
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif",
}

ALLOWED_DOCUMENT_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx",
    ".ppt", ".pptx", ".txt", ".rtf",
}
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
    "application/octet-stream",
}

MAX_IMAGE_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
MAX_DOCUMENT_SIZE = 25 * 1024 * 1024

CHUNK_SIZE = 1024 * 1024  # 1 MB chunks для стриминга


def validate_image_header(header: bytes, ext: str) -> None:
    """Magic bytes проверка для изображений"""
    if ext in {".jpg", ".jpeg"} and not header.startswith(b"\xff\xd8\xff"):
        raise HTTPException(400, "Invalid JPEG file (magic bytes mismatch)")
    if ext == ".png" and not header.startswith(b"\x89PNG"):
        raise HTTPException(400, "Invalid PNG file (magic bytes mismatch)")
    if ext == ".webp" and not (header.startswith(b"RIFF") and len(header) > 11 and header[8:12] == b"WEBP"):
        raise HTTPException(400, "Invalid WebP file (magic bytes mismatch)")
    if ext == ".gif" and not header.startswith(b"GIF8"):
        raise HTTPException(400, "Invalid GIF file (magic bytes mismatch)")


def validate_extension_and_type(
    file: UploadFile, allowed_ext: set, allowed_types: set,
) -> str:
    """Базовая валидация расширения и content-type"""
    if not file.filename:
        raise HTTPException(400, "Filename is required")

    ext = Path(file.filename).suffix.lower()
    if ext not in allowed_ext:
        raise HTTPException(
            400,
            f"Invalid extension: {ext}. Allowed: {', '.join(sorted(allowed_ext))}",
        )

    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(400, f"Invalid content type: {file.content_type}")

    return ext


async def save_file_streaming(
    file: UploadFile, subfolder: str, max_size: int, is_image: bool,
) -> str:
    """
    Сохраняет файл ЧТЕНИЕМ ПО ЧАНКАМ (не в память целиком).
    Обрывает загрузку при превышении max_size.
    """
    ext = Path(file.filename).suffix.lower()
    safe_name = "".join(
        c for c in Path(file.filename).stem if c.isalnum() or c in ("-", "_")
    )[:50] or "file"
    unique_id = uuid.uuid4().hex[:8]
    filename = f"{safe_name}_{unique_id}{ext}"

    upload_dir = Path(settings.UPLOAD_DIR) / subfolder
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / filename

    total_size = 0
    header_read = False
    file_header = b""

    try:
        with open(file_path, "wb") as f:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break

                # Первая порция — для magic bytes
                if not header_read:
                    file_header = chunk[:32]
                    header_read = True
                    # Проверка magic bytes для изображений
                    if is_image:
                        validate_image_header(file_header, ext)

                total_size += len(chunk)
                if total_size > max_size:
                    # Превышен лимит — удаляем начатый файл
                    f.close()
                    file_path.unlink(missing_ok=True)
                    raise HTTPException(
                        400,
                        f"File too large. Maximum: {max_size // (1024*1024)} MB",
                    )

                f.write(chunk)
    except Exception:
        # Очистка при ошибке
        file_path.unlink(missing_ok=True)
        raise

    return f"/uploads/{subfolder}/{filename}"


@router.post("/image")
@limiter.limit("10/minute")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin),
):
    """Загрузить изображение (только админ)"""
    validate_extension_and_type(
        file, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_CONTENT_TYPES
    )
    url = await save_file_streaming(
        file, "images", MAX_IMAGE_SIZE, is_image=True
    )
    logger.info(f"Image uploaded by {current_user.username}: {url}")
    return {"url": url, "filename": file.filename}


@router.post("/document")
@limiter.limit("10/minute")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin),
):
    """Загрузить документ (только админ)"""
    validate_extension_and_type(
        file, ALLOWED_DOCUMENT_EXTENSIONS, ALLOWED_DOCUMENT_CONTENT_TYPES
    )
    url = await save_file_streaming(
        file, "documents", MAX_DOCUMENT_SIZE, is_image=False
    )
    logger.info(f"Document uploaded by {current_user.username}: {url}")
    return {"url": url, "filename": file.filename}


@router.delete("/image/{filename}")
async def delete_image(
    filename: str,
    current_user: User = Depends(get_current_admin),
):
    """Удалить изображение"""
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(400, "Invalid filename")

    file_path = Path(settings.UPLOAD_DIR) / "images" / filename
    if not file_path.exists():
        raise HTTPException(404, "Image not found")

    file_path.unlink()
    logger.info(f"Image deleted by {current_user.username}: {filename}")
    return {"status": "deleted", "filename": filename}


@router.delete("/document/{filename}")
async def delete_document(
    filename: str,
    current_user: User = Depends(get_current_admin),
):
    """Удалить документ"""
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(400, "Invalid filename")

    file_path = Path(settings.UPLOAD_DIR) / "documents" / filename
    if not file_path.exists():
        raise HTTPException(404, "Document not found")

    file_path.unlink()
    logger.info(f"Document deleted by {current_user.username}: {filename}")
    return {"status": "deleted", "filename": filename}