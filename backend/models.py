from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """Registered users who can upload images and receive alerts."""
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(20))
    location = Column(String(20))  # Stores the user's pincode
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Admin(Base):
    """Admin users who can view registered users and manage the system."""
    __tablename__ = "admin"

    admin_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AlertGenerated(Base):
    """Records of wild animal detections with location data."""
    __tablename__ = "alert_generated"

    alert_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    animal_detected = Column(String(100))
    alert_type = Column(String(50))
    latitude = Column(Float)
    longitude = Column(Float)
    image_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class WildlifeEvent(Base):
    """Grouped wildlife incident representing evolving real-world activity."""
    __tablename__ = "wildlife_events"

    event_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    species = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255))
    status = Column(String(50), default="active")  # monitoring, active, verified, response_in_progress, resolved
    movement_direction = Column(String(100), default="Unknown")  # North, East, Toward Eastern Village, etc.
    trust_score = Column(Integer, default=60)  # 0 to 100
    verification_status = Column(String(50), default="AI Detected")  # AI Detected, Community Confirmed, Authority Verified
    sighting_count = Column(Integer, default=1)
    primary_image_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class EventTimeline(Base):
    """Chronological milestone entries for a Wildlife Event."""
    __tablename__ = "event_timelines"

    timeline_id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("wildlife_events.event_id", ondelete="CASCADE"), nullable=False)
    actor_type = Column(String(50), default="system")  # system, user, authority
    actor_name = Column(String(100))
    action_type = Column(String(50))  # detection, confirmation, direction_update, authority_verification, resolution
    description = Column(Text, nullable=False)
    image_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CommunityConfirmation(Base):
    """Community user reports & evidence additions to an active event."""
    __tablename__ = "community_confirmations"

    confirmation_id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("wildlife_events.event_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    status_update = Column(String(50), nullable=False)  # still_present, no_longer_visible, moved
    direction = Column(String(100))
    notes = Column(Text)
    image_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserProfile(Base):
    """User personal safety profiles and gamification status."""
    __tablename__ = "user_profiles"

    profile_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)
    home_address = Column(String(255))
    home_lat = Column(Float)
    home_lng = Column(Float)
    work_address = Column(String(255))
    work_lat = Column(Float)
    work_lng = Column(Float)
    alert_radius_km = Column(Float, default=5.0)
    reputation_score = Column(Integer, default=10)
    badge_title = Column(String(100), default="Community Watcher")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuthorityBroadcast(Base):
    """Official announcements and emergency safety advisories by forest officers."""
    __tablename__ = "authority_broadcasts"

    broadcast_id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admin.admin_id"))
    event_id = Column(Integer, ForeignKey("wildlife_events.event_id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(50), default="warning")  # info, warning, critical
    restricted_zone = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

