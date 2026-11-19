"""
Аутентификация администраторов через JWT.
"""
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import bcrypt
import jwt
from jwt import PyJWTError as JWTError

from ..database import get_db
from ..models import User
from ..config import get_settings
from ..schemas import PasswordChangeRequest
from ..security.rate_limit import limiter

router = APIRouter(prefix="/api/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

settings = get_settings()
_DUMMY_BCRYPT_HASH = bcrypt.hashpw(b"dummy-timing-guard", bcrypt.gensalt()).decode("utf-8")


def _password_fingerprint(password_hash: str) -> str:
    """Короткий отпечаток bcrypt-хеша для мгновенного отзыва JWT при смене пароля."""
    return hashlib.sha256(password_hash.encode("utf-8")).hexdigest()[:16]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля через bcrypt"""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Создание JWT токена"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),  # когда выдан
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_admin(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db),
) -> User:
    """
    Получить текущего администратора из токена.
    Проверяет: валидность JWT + существование юзера + совпадение отпечатка пароля + роль == admin.
    Синхронная функция — выполняется в threadpool без блокировки event loop.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str | None = payload.get("sub")
        token_pwd: str | None = payload.get("pwd")

        if username is None or not token_pwd:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception

    if not hmac.compare_digest(str(token_pwd), _password_fingerprint(user.password_hash)):
        raise credentials_exception

    #  ПРОВЕРКА РОЛИ — только admin может использовать админку
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )

    return user


@router.post("/token")
@limiter.limit("5/15minute")
def login(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    """Получить JWT токен для администратора (синхронный обработчик для offload bcrypt в threadpool)"""
    user = db.query(User).filter(User.username == form_data.username).first()
    password_ok = verify_password(
        form_data.password,
        user.password_hash if user else _DUMMY_BCRYPT_HASH,
    )
    if not user or not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    #  Проверка роли при логине
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    access_token = create_access_token(
        data={
            "sub": user.username,
            "role": user.role,
            "pwd": _password_fingerprint(user.password_hash),
        }
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def read_users_me(
    current_user: Annotated[User, Depends(get_current_admin)]
):
    """Получить информацию о текущем пользователе"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
    }


@router.put("/password")
@limiter.limit("5/15minute")
def change_password(
    request: Request,
    item: PasswordChangeRequest,
    current_user: Annotated[User, Depends(get_current_admin)],
    db: Session = Depends(get_db),
):
    """Смена пароля текущего администратора (мгновенно отзывает все старые JWT)"""
    if not verify_password(item.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный текущий пароль",
        )
    current_user.password_hash = bcrypt.hashpw(
        item.new_password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")
    db.add(current_user)
    db.commit()
    new_token = create_access_token(
        data={
            "sub": current_user.username,
            "role": current_user.role,
            "pwd": _password_fingerprint(current_user.password_hash),
        }
    )
    return {
        "success": True,
        "message": "Пароль успешно изменён",
        "access_token": new_token,
    }