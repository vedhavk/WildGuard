from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Admin, User
from schemas import AdminRegister, UserLogin, AdminResponse, UserResponse, TokenResponse
from auth import hash_password, verify_password, create_access_token, get_current_admin
from typing import List

router = APIRouter()


@router.post("/seed", response_model=TokenResponse)
def seed_admin(data: AdminRegister, db: Session = Depends(get_db)):
    """Create/seed an admin account (no auth required — use for initial setup)."""
    existing = db.query(Admin).filter(Admin.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Admin email already exists")

    admin = Admin(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    token = create_access_token({"sub": admin.email, "role": "admin"})
    return TokenResponse(access_token=token, role="admin", name=admin.name)


@router.post("/login", response_model=TokenResponse)
def admin_login(data: UserLogin, db: Session = Depends(get_db)):
    """Login as an admin, returns a JWT token."""
    admin = db.query(Admin).filter(Admin.email == data.email).first()
    if not admin or not verify_password(data.password, admin.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": admin.email, "role": "admin"})
    return TokenResponse(access_token=token, role="admin", name=admin.name)


@router.get("/users", response_model=List[UserResponse])
def list_users(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    """List all registered users (admin only)."""
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/users/{pincode}", response_model=List[UserResponse])
def list_users_by_pincode(
    pincode: str,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """List registered users filtered by pincode (admin only)."""
    return db.query(User).filter(User.location == pincode).all()
