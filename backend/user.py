from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        phone=data.phone,
        location=data.location,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "role": "user"})
    return TokenResponse(access_token=token, role="user", name=user.name)


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password, returns a JWT token."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email, "role": "user"})
    return TokenResponse(access_token=token, role="user", name=user.name)


@router.get("/me", response_model=UserResponse)
def get_me(current=Depends(get_current_user)):
    """Get the current user's profile."""
    user, role = current
    if role != "user":
        raise HTTPException(status_code=403, detail="Not a user account")
    return user
