"""
Middleware для добавления security headers ко всем ответам.
Реализует рекомендации OWASP и Mozilla Observatory.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # HSTS — принуждает браузер использовать HTTPS
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        
        # Защита от MIME-type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Защита от clickjacking
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        
        # XSS-фильтр браузера
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Контроль заголовка Referer
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Разрешаем только нужные браузерные API
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), payment=()"
        )
        
        # CSP — с разрешёнными CDN для Swagger UI
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' "
                "https://plausible.io "
                "https://cdn.jsdelivr.net "
                "https://unpkg.com; "
            "style-src 'self' 'unsafe-inline' "
                "https://fonts.googleapis.com "
                "https://cdn.jsdelivr.net "
                "https://unpkg.com; "
            "img-src 'self' data: https: blob:; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "connect-src 'self' https://plausible.io http://localhost:8000 https://taraclia-gaz.md; "
            "frame-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        
        # Не раскрываем стек (но uvicorn всё равно добавит server: uvicorn)
        if "server" in response.headers:
            del response.headers["server"]
        
        return response