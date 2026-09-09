"""
Middleware для добавления security headers ко всем ответам.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from ..config import get_settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.settings = get_settings()
        self.is_production = self.settings.ENVIRONMENT == "production"
        self.csp = self._build_csp()
    
    def _build_csp(self) -> str:
        """CSP зависит от окружения"""
        if self.is_production:
            # Production: БЕЗ unsafe-inline и unsafe-eval
            return (
                "default-src 'self'; "
                "script-src 'self' https://plausible.io; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "img-src 'self' data: https: blob:; "
                "font-src 'self' https://fonts.gstatic.com data:; "
                f"connect-src 'self' https://plausible.io {self.settings.SITE_URL}; "
                "frame-src 'self'; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self'"
            )
        else:
            # Development: разрешаем unsafe-eval для Vite HMR
            return (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "img-src 'self' data: https: blob:; "
                "font-src 'self' https://fonts.gstatic.com data:; "
                "connect-src 'self' https://plausible.io http://localhost:8000 http://127.0.0.1:8000; "
                "frame-src 'self'; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self'"
            )
    
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=()"
        response.headers["Content-Security-Policy"] = self.csp
        
        if "server" in response.headers:
            del response.headers["server"]
        
        return response