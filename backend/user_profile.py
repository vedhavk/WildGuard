from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import UserProfile, User, Admin
from schemas import UserProfileSchema, UserProfileUpdate
from auth import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserProfileSchema)
def get_user_profile(current=Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch current user/admin's personal safety profile or auto-initialize one."""
    user, role = current

    if role == "admin":
        return UserProfileSchema(
            profile_id=user.admin_id,
            user_id=user.admin_id,
            home_address="Forest Department Command Center",
            alert_radius_km=10.0,
            reputation_score=100,
            badge_title="Forest Department Officer",
        )

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.user_id).first()
    if not profile:
        profile = UserProfile(
            user_id=user.user_id,
            home_address="Forest Edge Sector",
            alert_radius_km=5.0,
            reputation_score=10,
            badge_title="Community Watcher",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


@router.post("/me", response_model=UserProfileSchema)
def update_user_profile(
    payload: UserProfileUpdate,
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update home, work coordinates, and notification sensitivity radius."""
    user, role = current

    if role == "admin":
        return UserProfileSchema(
            profile_id=user.admin_id,
            user_id=user.admin_id,
            home_address=payload.home_address or "Forest Department Command Center",
            alert_radius_km=payload.alert_radius_km or 10.0,
            reputation_score=100,
            badge_title="Forest Department Officer",
        )

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.user_id).first()
    if not profile:
        profile = UserProfile(user_id=user.user_id)
        db.add(profile)

    if payload.home_address is not None:
        profile.home_address = payload.home_address
    if payload.home_lat is not None:
        profile.home_lat = payload.home_lat
    if payload.home_lng is not None:
        profile.home_lng = payload.home_lng
    if payload.work_address is not None:
        profile.work_address = payload.work_address
    if payload.work_lat is not None:
        profile.work_lat = payload.work_lat
    if payload.work_lng is not None:
        profile.work_lng = payload.work_lng
    if payload.alert_radius_km is not None:
        profile.alert_radius_km = payload.alert_radius_km

    db.commit()
    db.refresh(profile)
    return profile
