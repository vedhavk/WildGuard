from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import User, AlertGenerated
from schemas import UploadResponse
from auth import get_current_user
from inference import detect_animal
import os
import uuid
import asyncio
import traceback

router = APIRouter()

# Directory to store uploaded images
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def run_in_thread(func, *args, **kwargs):
    """Fallback for asyncio.to_thread for Python < 3.9"""
    if hasattr(asyncio, "to_thread"):
        return await asyncio.to_thread(func, *args, **kwargs)
    else:
        loop = asyncio.get_running_loop()
        import functools
        return await loop.run_in_executor(None, functools.partial(func, *args, **kwargs))


@router.post("/upload", response_model=UploadResponse)
async def upload_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    pincode: str = Form(...),
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a wildlife image for analysis.

    The frontend sends the image along with the user's GPS coordinates
    and reverse-geocoded pincode. If a wild animal is detected, an alert
    is created and emails are sent to all users in the same pincode area.
    """
    user, role = current
    if role != "user":
        raise HTTPException(status_code=403, detail="Only users can upload images")

    try:
        # Save the uploaded file to disk
        ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)

        # Run wild animal detection in a thread to not block event loop
        result = await run_in_thread(detect_animal, filepath)

        if not result["detected"]:
            return UploadResponse(
                status="safe",
                message="No wild animal detected in the image.",
            )

        # Wild animal detected — create an alert record
        alert = AlertGenerated(
            user_id=user.user_id,
            animal_detected=result["animal"],
            alert_type="wild_animal",
            latitude=latitude,
            longitude=longitude,
            image_url=f"/uploads/{filename}",
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)

        # ── Spatio-temporal Event Clustering ──
        from models import WildlifeEvent, EventTimeline
        from events import haversine_km
        from datetime import datetime, timedelta

        detected_species = result["animal"]
        image_url = f"/uploads/{filename}"

        # Look for existing active event within 3 km and 2 hours
        cutoff_time = datetime.utcnow() - timedelta(hours=2)
        active_events = (
            db.query(WildlifeEvent)
            .filter(
                WildlifeEvent.species.ilike(f"%{detected_species}%"),
                WildlifeEvent.status.in_(["active", "monitoring", "verified"]),
                WildlifeEvent.updated_at >= cutoff_time,
            )
            .all()
        )

        matched_event = None
        for ev in active_events:
            dist = haversine_km(latitude, longitude, ev.latitude, ev.longitude)
            if dist <= 3.0:
                matched_event = ev
                break

        if matched_event:
            matched_event.sighting_count += 1
            matched_event.updated_at = datetime.utcnow()
            # Append timeline entry
            timeline = EventTimeline(
                event_id=matched_event.event_id,
                actor_type="system",
                actor_name="AI Vision Sentinel",
                action_type="detection",
                description=f"Additional AI sighting of {detected_species} (Confidence: {result['confidence'] * 100:.1f}%) near pincode {pincode}",
                image_url=image_url,
            )
            db.add(timeline)
            event_id = matched_event.event_id
        else:
            # Create new WildlifeEvent
            new_event = WildlifeEvent(
                title=f"{detected_species.title()} Spotted near Sector {pincode}",
                species=detected_species,
                latitude=latitude,
                longitude=longitude,
                location_name=f"Sector {pincode}",
                status="active",
                trust_score=60,
                verification_status="AI Detected",
                sighting_count=1,
                primary_image_url=image_url,
            )
            db.add(new_event)
            db.flush()  # to populate new_event.event_id

            timeline = EventTimeline(
                event_id=new_event.event_id,
                actor_type="system",
                actor_name="AI Vision Sentinel",
                action_type="detection",
                description=f"Initial detection of {detected_species} with AI confidence {result['confidence'] * 100:.1f}%",
                image_url=image_url,
            )
            db.add(timeline)
            event_id = new_event.event_id

        db.commit()

        # Send email alerts to ALL registered users in the BACKGROUND
        from alert import send_alert_emails  # lazy import to avoid circular dependency
        
        # Extract raw data to avoid DetachedInstanceError in the background task
        alert_data = {
            "alert_id": alert.alert_id,
            "animal_detected": alert.animal_detected,
            "alert_type": alert.alert_type,
            "latitude": alert.latitude,
            "longitude": alert.longitude,
        }
        
        all_users = db.query(User).all()
        recipient_emails = [u.email for u in all_users if u.email]
            
        if recipient_emails:
            background_tasks.add_task(send_alert_emails, alert_data, recipient_emails)

        return UploadResponse(
            status="alert",
            message=f"Wild animal detected: {result['animal']}",
            confidence=result["confidence"],
            alert_id=alert.alert_id,
            event_id=event_id,
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {str(e)}")

