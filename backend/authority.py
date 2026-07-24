from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import WildlifeEvent, EventTimeline, AuthorityBroadcast, Admin
from schemas import (
    AuthorityStatusUpdate,
    AuthorityBroadcastCreate,
    AuthorityBroadcastResponse,
    WildlifeEventResponse,
)
from auth import get_current_user

router = APIRouter()


@router.post("/events/{event_id}/status", response_model=WildlifeEventResponse)
def update_event_authority_status(
    event_id: int,
    payload: AuthorityStatusUpdate,
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Forest Officer/Admin status update & verification endpoint.
    Upgrades trust status to 'Authority Verified', updates event status, and logs official timeline entry.
    """
    user, role = current
    if role != "admin":
        raise HTTPException(status_code=403, detail="Only Forest Officers / Admins can perform authority updates")

    event = db.query(WildlifeEvent).filter(WildlifeEvent.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Wildlife Event not found")

    event.status = payload.status
    if payload.movement_direction:
        event.movement_direction = payload.movement_direction

    event.verification_status = "Authority Verified"
    event.trust_score = 98
    event.updated_at = datetime.utcnow()

    # Append timeline entry
    timeline_item = EventTimeline(
        event_id=event_id,
        actor_type="authority",
        actor_name=f"Officer {user.name}",
        action_type="authority_verification",
        description=f"Forest Officer verification: Status set to '{payload.status.replace('_', ' ').title()}'. Note: {payload.notes}",
    )
    db.add(timeline_item)
    db.commit()
    db.refresh(event)
    return event


@router.post("/broadcast", response_model=AuthorityBroadcastResponse)
def create_emergency_broadcast(
    payload: AuthorityBroadcastCreate,
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Broadcast an official emergency safety advisory or restricted zone notice."""
    user, role = current
    if role != "admin":
        raise HTTPException(status_code=403, detail="Only Forest Officers / Admins can broadcast emergency notices")

    broadcast = AuthorityBroadcast(
        admin_id=user.admin_id,
        event_id=payload.event_id,
        title=payload.title,
        message=payload.message,
        severity=payload.severity,
        restricted_zone=payload.restricted_zone,
    )
    db.add(broadcast)
    db.commit()
    db.refresh(broadcast)
    return broadcast


@router.get("/broadcasts", response_model=List[AuthorityBroadcastResponse])
def list_broadcasts(db: Session = Depends(get_db)):
    """Fetch active official emergency broadcasts."""
    return db.query(AuthorityBroadcast).order_by(AuthorityBroadcast.created_at.desc()).all()
