"""
Rate limiting для защиты от брутфорса и DDoS.
Использует slowapi с хранением в памяти (для одного процесса).
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse

# Создаём лимитер (идентификация по IP)
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],  # базовый лимит для всех
    storage_uri="memory://",
)


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Обработчик превышения лимита — возвращает понятный JSON"""
    return JSONResponse(
        status_code=429,
        content={
            "detail": f"Слишком много запросов. Повторите через {exc.retry_after} сек."
        },
    )