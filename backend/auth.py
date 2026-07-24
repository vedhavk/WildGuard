from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import User, Admin
from config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme — tokens are obtained from the user login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")


def _truncate_password(password: str) -> str:
    """Truncate password to 72 bytes to satisfy bcrypt input limits."""
    if not password:
        return ""
    if isinstance(password, str):
        pwd_bytes = password.encode("utf-8")[:72]
        return pwd_bytes.decode("utf-8", errors="ignore")
    return str(password)[:72]


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt (safely truncated to 72 bytes)."""
    truncated = _truncate_password(password)
    return pwd_context.hash(truncated)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    truncated = _truncate_password(plain)
    return pwd_context.verify(truncated, hashed)


def create_access_token(data: dict) -> str:
    """Create a JWT access token with an expiration time."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expiration_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """FastAPI dependency: decode JWT and return the (user_or_admin, role) tuple."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None or role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if role == "admin":
        user = db.query(Admin).filter(Admin.email == email).first()
    else:
        user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise credentials_exception

    return user, role


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """FastAPI dependency: ensures the caller is an admin."""
    user, role = get_current_user(token, db)
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user
