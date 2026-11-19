"""Минимальная самопроверка защитных механизмов API."""
from types import SimpleNamespace
import bcrypt
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base, User
from app.routers.auth_router import (
    _password_fingerprint,
    create_access_token,
    get_current_admin,
)
from app.schemas import ContactMessageCreate, sanitize_html
from app.security.rate_limit import get_real_client_ip


def _req(host: str, headers: dict[str, str] | None = None):
    return SimpleNamespace(client=SimpleNamespace(host=host), headers=headers or {})


def check_real_client_ip() -> None:
    # Не loopback — игнорируем клиентский X-Forwarded-For
    assert get_real_client_ip(_req("203.0.113.5", {"X-Forwarded-For": "1.2.3.4"})) == "203.0.113.5"
    # Loopback — берём последний (добавленный прокси) IP, а не подделанный первый
    assert get_real_client_ip(_req("127.0.0.1", {"X-Forwarded-For": "1.2.3.4, 198.51.100.9"})) == "198.51.100.9"
    # Loopback + X-Real-IP
    assert get_real_client_ip(_req("127.0.0.1", {"X-Real-IP": "198.51.100.7", "X-Forwarded-For": "1.2.3.4"})) == "198.51.100.7"


def check_iframe_sanitization() -> None:
    good = '<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>'
    assert "youtube-nocookie.com/embed/dQw4w9WgXcQ" in sanitize_html(good)

    evil = '<iframe src="https://evil.example/x"></iframe>'
    assert "<iframe" not in sanitize_html(evil)

    bypass_attempt = (
        '<iframe src="https://evil.example/x" '
        'title=\'src="https://www.youtube.com/embed/abc123"\'>'
        'src="https://www.youtube.com/embed/abc123"</iframe>'
    )
    cleaned = sanitize_html(bypass_attempt)
    assert "evil.example" not in cleaned
    assert "<iframe" not in cleaned


def check_contact_header_sanitization() -> None:
    msg = ContactMessageCreate(
        name="Иван\r\nBcc: victim@example.com",
        email="user@example.com",
        phone="+373\n123456",
        message="Проверка корректной очистки переносов строк.",
    )
    assert "\r" not in msg.name and "\n" not in msg.name
    assert "\r" not in (msg.phone or "") and "\n" not in (msg.phone or "")


def check_jwt_revocation_on_password_change() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    with Session() as db:
        old_hash = bcrypt.hashpw(b"OldPass123456", bcrypt.gensalt()).decode("utf-8")
        user = User(username="admin", password_hash=old_hash, role="admin")
        db.add(user)
        db.commit()

        # Токен без отпечатка пароля (старого формата) отклоняется
        legacy_token = create_access_token({"sub": "admin", "role": "admin"})
        try:
            get_current_admin(token=legacy_token, db=db)
            raise AssertionError("Legacy token without pwd claim should fail")
        except HTTPException as exc:
            assert exc.status_code == 401

        old_token = create_access_token({
            "sub": "admin",
            "role": "admin",
            "pwd": _password_fingerprint(old_hash),
        })
        assert get_current_admin(token=old_token, db=db).username == "admin"

        # Смена пароля мгновенно отзывает старый токен
        new_hash = bcrypt.hashpw(b"NewPass123456", bcrypt.gensalt()).decode("utf-8")
        user.password_hash = new_hash
        db.commit()

        try:
            get_current_admin(token=old_token, db=db)
            raise AssertionError("Old token after password change should fail")
        except HTTPException as exc:
            assert exc.status_code == 401

        new_token = create_access_token({
            "sub": "admin",
            "role": "admin",
            "pwd": _password_fingerprint(new_hash),
        })
        assert get_current_admin(token=new_token, db=db).username == "admin"


if __name__ == "__main__":
    check_real_client_ip()
    check_iframe_sanitization()
    check_contact_header_sanitization()
    check_jwt_revocation_on_password_change()
    print("API security checks OK")
