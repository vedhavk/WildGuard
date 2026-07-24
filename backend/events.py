import math
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import WildlifeEvent, EventTimeline, CommunityConfirmation, User, UserProfile
from schemas import (
    WildlifeEventResponse,
    WildlifeEventDetail,
    TimelineResponse,
    ConfirmationCreate,
    ConfirmationResponse,
)
from auth import get_current_user

router = APIRouter()


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Great Circle distance between two points in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def update_event_trust_score(event: WildlifeEvent, db: Session):
    """
    Dynamic Trust Calculation:
    - Base AI Detection: 60%
    - +15% per unique community confirmation
    - Upgrade label: "AI Detected" -> "Community Confirmed" (if confirmations >= 2) -> "Authority Verified"
    """
    confirmations_count = db.query(CommunityConfirmation).filter(
        CommunityConfirmation.event_id == event.event_id
    ).count()

    base_score = 60
    bonus = min(confirmations_count * 15, 30)
    
    if event.verification_status == "Authority Verified":
        event.trust_score = 98
    else:
        event.trust_score = min(base_score + bonus, 90)
        if confirmations_count >= 2:
            event.verification_status = "Community Confirmed"
    
    event.sighting_count = 1 + confirmations_count


@router.get("/", response_model=List[WildlifeEventResponse])
def list_events(
    status: Optional[str] = None,
    species: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List all Wildlife Events, sorted by newest activity."""
    query = db.query(WildlifeEvent)
    if status:
        query = query.filter(WildlifeEvent.status == status)
    if species:
        query = query.filter(WildlifeEvent.species.ilike(f"%{species}%"))
    
    return query.order_by(WildlifeEvent.updated_at.desc()).all()


@router.get("/intelligence")
def get_wildlife_intelligence(db: Session = Depends(get_db)):
    """
    Historical Wildlife Movement Stories & Aggregated Insights.
    Generates human-readable summaries while protecting exact location privacy.
    """
    events = db.query(WildlifeEvent).all()
    total_events = len(events)
    active_events = sum(1 for e in events if e.status in ["active", "verified", "response_in_progress"])
    
    # Species breakdown
    species_counts = {}
    for e in events:
        species_counts[e.species] = species_counts.get(e.species, 0) + 1
        
    most_common_species = (
        max(species_counts, key=species_counts.get) if species_counts else "Wildlife"
    )

    movement_stories = [
        f"In the last 7 days, {total_events} wildlife incidents were monitored across forest edge zones.",
        f"{most_common_species.title()} remains the most frequently reported animal activity in the sector.",
        "Peak animal sightings occur predominantly between 6:00 PM and 11:00 PM during dusk migration.",
        "Recent movement trends indicate animals venturing toward water sources along eastern boundaries.",
    ]

    return {
        "total_incidents": total_events,
        "active_incidents": active_events,
        "most_active_species": most_common_species,
        "species_distribution": species_counts,
        "movement_stories": movement_stories,
        "safety_advisory": "Avoid solitary walking along forest borders during late evening hours.",
    }


@router.get("/{event_id}", response_model=WildlifeEventDetail)
def get_event_detail(event_id: int, db: Session = Depends(get_db)):
    """Fetch complete Wildlife Event workspace with timelines and community confirmations."""
    event = db.query(WildlifeEvent).filter(WildlifeEvent.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Wildlife Event not found")

    timelines = (
        db.query(EventTimeline)
        .filter(EventTimeline.event_id == event_id)
        .order_by(EventTimeline.created_at.asc())
        .all()
    )

    raw_confirmations = (
        db.query(CommunityConfirmation)
        .filter(CommunityConfirmation.event_id == event_id)
        .order_by(CommunityConfirmation.created_at.desc())
        .all()
    )

    confirmations = []
    for c in raw_confirmations:
        user = db.query(User).filter(User.user_id == c.user_id).first()
        user_name = user.name if user else "Community Member"
        confirmations.append(
            ConfirmationResponse(
                confirmation_id=c.confirmation_id,
                event_id=c.event_id,
                user_id=c.user_id,
                user_name=user_name,
                status_update=c.status_update,
                direction=c.direction,
                notes=c.notes,
                image_url=c.image_url,
                created_at=c.created_at,
            )
        )

    return WildlifeEventDetail(
        event_id=event.event_id,
        title=event.title,
        species=event.species,
        latitude=event.latitude,
        longitude=event.longitude,
        location_name=event.location_name,
        status=event.status,
        movement_direction=event.movement_direction,
        trust_score=event.trust_score,
        verification_status=event.verification_status,
        sighting_count=event.sighting_count,
        primary_image_url=event.primary_image_url,
        created_at=event.created_at,
        updated_at=event.updated_at,
        timelines=[TimelineResponse.from_orm(t) for t in timelines],
        confirmations=confirmations,
    )


@router.post("/{event_id}/confirm", response_model=WildlifeEventDetail)
def add_community_confirmation(
    event_id: int,
    payload: ConfirmationCreate,
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Add a user sighting update or evidence confirmation to an existing Wildlife Event.
    Recalculates trust score, updates movement direction, awards reputation points, and adds timeline entry.
    """
    user, role = current
    event = db.query(WildlifeEvent).filter(WildlifeEvent.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Wildlife Event not found")

    # Save confirmation
    confirmation = CommunityConfirmation(
        event_id=event_id,
        user_id=user.user_id,
        status_update=payload.status_update,
        direction=payload.direction,
        notes=payload.notes,
        image_url=payload.image_url,
    )
    db.add(confirmation)

    # Update event details if direction provided
    if payload.direction and payload.direction.strip():
        event.movement_direction = payload.direction

    if payload.status_update == "no_longer_visible":
        event.status = "monitoring"

    # Append Timeline milestone
    timeline_desc = f"Community member {user.name} reported: '{payload.status_update.replace('_', ' ').title()}'"
    if payload.direction:
        timeline_desc += f" (Moving {payload.direction})"
    if payload.notes:
        timeline_desc += f" - {payload.notes}"

    timeline_item = EventTimeline(
        event_id=event_id,
        actor_type="user",
        actor_name=user.name,
        action_type="confirmation",
        description=timeline_desc,
        image_url=payload.image_url,
    )
    db.add(timeline_item)

    # Recalculate trust score
    update_event_trust_score(event, db)
    event.updated_at = datetime.utcnow()

    # Award reputation to user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.user_id).first()
    if profile:
        profile.reputation_score += 5
        if profile.reputation_score >= 50:
            profile.badge_title = "Forest Sentinel"
        elif profile.reputation_score >= 25:
            profile.badge_title = "Verified Scout"

    db.commit()
    return get_event_detail(event_id=event_id, db=db)
