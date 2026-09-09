"""
Middleware для защиты от XSS-атак.
Добавляет заголовки безопасности к HTTP-ответам.

Примечание: X-XSS-Protection устарел в современных браузерах
(Chrome 78+ его игнорирует), но добавляем для совместимости
со старыми браузерами. Основная защита — через CSP в SecurityHeadersMiddleware.
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class XSSProtectionMiddleware(BaseHTTPMiddleware):
    """Добавляет заголовки для защиты от XSS"""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # X-XSS-Protection — устаревший, но не вредный
        # "1; mode=block" — включить фильтр XSS и блокировать страницу при атаке
        if "X-XSS-Protection" not in response.headers:
            response.headers["X-XSS-Protection"] = "1; mode=block"
        
        return response