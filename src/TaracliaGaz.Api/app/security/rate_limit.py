"""
Rate limiting для защиты от брутфорса и DoS-атак.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..config import get_settings

settings = get_settings()

# Storage URI из env
RATE_LIMIT_STORAGE_URI = getattr(settings, "RATE_LIMIT_STORAGE_URI", "memory://")

#  Default limits — 100/minute на ВСЕ endpoints по умолчанию
# Отдельные эндпоинты могут переопределить через @limiter.limit()
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=RATE_LIMIT_STORAGE_URI,
    default_limits=["100/minute"],  #  Дефолтный лимит для всех endpoints
)

# Константы для специфичных эндпоинтов
LOGIN_LIMIT = "5/15minute"
CONTACT_LIMIT = "3/minute"
UPLOAD_LIMIT = "10/minute"
GENERAL_LIMIT = "100/minute"