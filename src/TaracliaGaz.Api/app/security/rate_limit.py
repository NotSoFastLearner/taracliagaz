"""
Rate limiting для защиты от брутфорса и DDoS.
Использует slowapi с хранением в памяти (для одного процесса).
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse
import logging
# Создаём лимитер (идентификация по IP)
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379/0",  # вместо memory://
)


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Обработчик превышения лимита — возвращает понятный JSON"""
    return JSONResponse(
        status_code=429,
        content={
            "detail": f"Слишком много запросов. Повторите через {exc.retry_after} сек."
        },
    )