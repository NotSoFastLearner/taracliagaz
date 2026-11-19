"""
Rate limiting для защиты от брутфорса и DoS-атак.
"""
from starlette.requests import Request
from slowapi import Limiter

from ..config import get_settings

settings = get_settings()


def get_real_client_ip(request: Request) -> str:
    """
    Reverse-proxy aware key function for rate limiting.
    If request.client.host is loopback, trust X-Real-IP or the rightmost
    (proxy-appended) X-Forwarded-For entry so clients cannot spoof the leftmost IP.
    """
    host = request.client.host if request.client else "127.0.0.1"
    if host in {"127.0.0.1", "localhost", "::1"}:
        real_ip = request.headers.get("X-Real-IP")
        if real_ip and real_ip.strip():
            return real_ip.strip()
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ips = [ip.strip() for ip in forwarded.split(",") if ip.strip()]
            if ips:
                return ips[-1]
    return host


get_remote_address = get_real_client_ip

# Storage URI из env
RATE_LIMIT_STORAGE_URI = getattr(settings, "RATE_LIMIT_STORAGE_URI", "memory://")

# Default limits — 100/minute на ВСЕ endpoints по умолчанию
# Отдельные эндпоинты могут переопределить через @limiter.limit()
limiter = Limiter(
    key_func=get_real_client_ip,
    storage_uri=RATE_LIMIT_STORAGE_URI,
    default_limits=["100/minute"],  # Дефолтный лимит для всех endpoints
)

# Константы для специфичных эндпоинтов
LOGIN_LIMIT = "5/15minute"
CONTACT_LIMIT = "3/minute"
UPLOAD_LIMIT = "10/minute"
GENERAL_LIMIT = "100/minute"