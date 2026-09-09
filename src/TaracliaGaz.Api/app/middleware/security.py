"""
Middleware для добавления security headers ко всем ответам.
Реализует рекомендации OWASP и Mozilla Observatory.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from ..config import get_settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Добавляет security headers ко всем HTTP-ответам"""
    
    def __init__(self, app):
        super().__init__(app)
        self.settings = get_settings()
        self.is_production = self.settings.ENVIRONMENT == "production"
        
        # CSP формируется один раз при инициализации middleware
        self.csp = self._build_csp()
    
    def _build_csp(self) -> str:
        """Построение Content-Security-Policy в зависимости от окружения"""
        
        # Базовые директивы (одинаковые для dev и prod)
        directives = [
            "default-src 'self'",
        ]
        
        # script-src — разный для dev и prod
        if self.is_production:
            # Production: БЕЗ unsafe-inline и unsafe-eval (строгая защита)
            script_src = (
                "script-src 'self' "
                "https://plausible.io"
            )
        else:
            # Development: разрешаем unsafe-eval для Vite HMR
            script_src = (
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' "
                "https://plausible.io "
                "https://cdn.jsdelivr.net "
                "https://unpkg.com"
            )
        directives.append(script_src)
        
        # style-src — разрешаем inline для Tailwind/стилей
        style_src = (
            "style-src 'self' 'unsafe-inline' "
            "https://fonts.googleapis.com "
            "https://cdn.jsdelivr.net "
            "https://unpkg.com"
        )
        directives.append(style_src)
        
        # img-src — разрешаем HTTPS, data:, blob: для base64
        img_src = "img-src 'self' data: https: blob:"
        directives.append(img_src)
        
        # font-src
        font_src = "font-src 'self' https://fonts.gstatic.com data:"
        directives.append(font_src)
        
        # connect-src — разные для dev и prod
        if self.is_production:
            # Production: только наш домен и plausible
            connect_src = (
                "connect-src 'self' "
                "https://plausible.io "
                f"https://{self.settings.SITE_URL.replace('https://', '').replace('http://', '')}"
            )
        else:
            # Development: разрешаем localhost для API
            connect_src = (
                "connect-src 'self' "
                "https://plausible.io "
                "http://localhost:8000 "
                "http://127.0.0.1:8000"
            )
        directives.append(connect_src)
        
        # Остальные директивы (одинаковые)
        directives.extend([
            "frame-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ])
        
        return "; ".join(directives)
    
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
        
        # Контроль заголовка Referer
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Разрешаем только нужные браузерные API
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), payment=()"
        )
        
        # CSP — с учётом окружения
        response.headers["Content-Security-Policy"] = self.csp
        
        # Не раскрываем стек сервера
        if "server" in response.headers:
            del response.headers["server"]
        
        return response