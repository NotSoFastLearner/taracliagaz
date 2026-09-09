"""
Rate limiting для защиты от брутфорса и DoS-атак.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..config import get_settings

settings = get_settings()

# Storage URI из env (по умолчанию memory://)
RATE_LIMIT_STORAGE_URI = getattr(settings, "RATE_LIMIT_STORAGE_URI", "memory://")

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=RATE_LIMIT_STORAGE_URI,
)

# Константы лимитов
LOGIN_LIMIT = "5/15minute"
GENERAL_LIMIT = "100/minute"
CONTACT_LIMIT = "3/minute"
UPLOAD_LIMIT = "10/minute"