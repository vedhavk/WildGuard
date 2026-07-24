from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ── User Schemas ──────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    location: str  # pincode


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Admin Schemas ─────────────────────────────────────────────

class AdminRegister(BaseModel):
    name: str
    email: str
    password: str


class AdminResponse(BaseModel):
    admin_id: int
    name: str
    email: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Auth Schemas ──────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str


# ── Alert Schemas ─────────────────────────────────────────────

class AlertResponse(BaseModel):
    alert_id: int
    user_id: Optional[int] = None
    animal_detected: Optional[str] = None
    alert_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    status: str
    message: str
    confidence: Optional[float] = None
    alert_id: Optional[int] = None
    event_id: Optional[int] = None


# ── Wildlife Event Schemas ────────────────────────────────────

class TimelineResponse(BaseModel):
    timeline_id: int
    event_id: int
    actor_type: str
    actor_name: Optional[str] = None
    action_type: str
    description: str
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConfirmationCreate(BaseModel):
    status_update: str  # still_present, no_longer_visible, moved
    direction: Optional[str] = "Unknown"
    notes: Optional[str] = None
    image_url: Optional[str] = None


class ConfirmationResponse(BaseModel):
    confirmation_id: int
    event_id: int
    user_id: int
    user_name: Optional[str] = "Community Member"
    status_update: str
    direction: Optional[str] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WildlifeEventResponse(BaseModel):
    event_id: int
    title: str
    species: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    status: str
    movement_direction: Optional[str] = "Unknown"
    trust_score: int
    verification_status: str
    sighting_count: int
    primary_image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WildlifeEventDetail(WildlifeEventResponse):
    timelines: list[TimelineResponse] = []
    confirmations: list[ConfirmationResponse] = []


# ── User Safety Profile Schemas ───────────────────────────────

class UserProfileSchema(BaseModel):
    profile_id: int
    user_id: int
    home_address: Optional[str] = None
    home_lat: Optional[float] = None
    home_lng: Optional[float] = None
    work_address: Optional[str] = None
    work_lat: Optional[float] = None
    work_lng: Optional[float] = None
    alert_radius_km: float = 5.0
    reputation_score: int = 10
    badge_title: str = "Community Watcher"

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    home_address: Optional[str] = None
    home_lat: Optional[float] = None
    home_lng: Optional[float] = None
    work_address: Optional[str] = None
    work_lat: Optional[float] = None
    work_lng: Optional[float] = None
    alert_radius_km: Optional[float] = 5.0


# ── Authority Schemas ──────────────────────────────────────────

class AuthorityStatusUpdate(BaseModel):
    status: str  # monitoring, active, verified, response_in_progress, resolved
    notes: str
    movement_direction: Optional[str] = None


class AuthorityBroadcastCreate(BaseModel):
    event_id: Optional[int] = None
    title: str
    message: str
    severity: str = "warning"  # info, warning, critical
    restricted_zone: Optional[str] = None


class AuthorityBroadcastResponse(BaseModel):
    broadcast_id: int
    admin_id: Optional[int] = None
    event_id: Optional[int] = None
    title: str
    message: str
    severity: str
    restricted_zone: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

