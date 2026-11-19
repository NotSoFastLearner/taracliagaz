"""
Pure ASGI middleware для добавления security headers и кэширования публичного API.
Избегает накладных расходов BaseHTTPMiddleware (anyio task groups / body streaming) под WSGI (a2wsgi).
"""
from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from ..config import get_settings


class SecurityHeadersMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app
        self.settings = get_settings()
        self.is_production = self.settings.ENVIRONMENT == "production"
        self.csp = self._build_csp()

    def _build_csp(self) -> str:
        """CSP зависит от окружения"""
        if self.is_production:
            return (
                "default-src 'self'; "
                "script-src 'self' https://plausible.io; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "img-src 'self' data: https: blob:; "
                "font-src 'self' https://fonts.gstatic.com data:; "
                f"connect-src 'self' https://plausible.io {self.settings.SITE_URL}; "
                "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self'"
            )
        return (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
            "img-src 'self' data: https: blob:; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "connect-src 'self' https://plausible.io http://localhost:8000 http://127.0.0.1:8000; "
            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        is_get = scope.get("method") == "GET"
        is_public_get = is_get and path.startswith("/api/public/")
        is_static_asset = is_get and path.startswith(("/uploads/", "/images/", "/static/"))

        async def send_wrapper(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)
                headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
                headers["X-Content-Type-Options"] = "nosniff"
                headers["X-Frame-Options"] = "SAMEORIGIN"
                headers["X-XSS-Protection"] = "1; mode=block"
                headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
                headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=()"
                headers["Content-Security-Policy"] = self.csp
                if is_public_get and "cache-control" not in headers:
                    headers["Cache-Control"] = "private, max-age=60"
                elif is_static_asset and "cache-control" not in headers:
                    headers["Cache-Control"] = "public, max-age=604800, stale-while-revalidate=86400"
                if path.startswith("/api/"):
                    headers["X-LiteSpeed-Cache-Control"] = "no-cache"
                    vary = headers.get("vary", "")
                    if "origin" not in vary.lower():
                        headers["Vary"] = f"Origin, {vary}" if vary else "Origin"
                if "server" in headers:
                    del headers["server"]
            await send(message)

        await self.app(scope, receive, send_wrapper)
