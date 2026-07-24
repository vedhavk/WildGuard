from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import AlertGenerated, User
from schemas import AlertResponse
from auth import get_current_user
from config import settings
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List

router = APIRouter()


async def send_alert_emails(alert_data: dict, recipient_emails: list):
    """
    Send styled HTML email alerts to all users in the affected area.
    Each email contains the animal info, location, and map links.
    """
    if not settings.smtp_email or not settings.smtp_password:
        print("⚠️  SMTP not configured — skipping email alerts")
        print(f"   Would have emailed {len(recipient_emails)} users about: {alert_data['animal_detected']}")
        return

    # Map URLs
    osm_url = (
        f"https://www.openstreetmap.org/"
        f"?mlat={alert_data['latitude']}&mlon={alert_data['longitude']}"
        f"#map=15/{alert_data['latitude']}/{alert_data['longitude']}"
    )
    app_url = f"http://localhost:3000/alert/{alert_data['alert_id']}"

    for email in recipient_emails:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"⚠️ Wild Guard Alert: {alert_data['animal_detected']} detected near you!"
        msg["From"] = settings.smtp_email
        msg["To"] = email

        html = f"""
        <html>
        <body style="margin:0; padding:0; font-family:'Segoe UI',Arial,sans-serif; background:#051307;">
            <div style="max-width:600px; margin:20px auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #2ecc71;">
                <!-- Header -->
                <div style="background:#2ecc71; padding:30px; text-align:center;">
                    <h1 style="color:#ffffff; margin:0; font-size:28px; letter-spacing:1px;">🚨 WILD GUARD ALERT</h1>
                    <p style="color:rgba(255,255,255,0.9); margin:8px 0 0; font-size:14px;">Wildlife Detection System</p>
                </div>

                <!-- Body -->
                <div style="padding:30px;">
                    <div style="background:rgba(46,204,113,0.1); border-radius:12px; padding:24px; margin-bottom:20px; border-left:4px solid #2ecc71;">
                        <h2 style="color:#27ae60; margin:0 0 15px; font-size:22px;">🐾 {alert_data['animal_detected']}</h2>
                        <table style="width:100%; color:#0a2e15; font-size:14px;">
                            <tr><td style="padding:6px 0; color:#166534;">Alert Type</td><td style="padding:6px 0;">{alert_data['alert_type']}</td></tr>
                            <tr><td style="padding:6px 0; color:#166534;">Latitude</td><td style="padding:6px 0;">{alert_data['latitude']:.6f}</td></tr>
                            <tr><td style="padding:6px 0; color:#166534;">Longitude</td><td style="padding:6px 0;">{alert_data['longitude']:.6f}</td></tr>
                        </table>
                    </div>

                    <!-- Map Buttons -->
                    <div style="text-align:center; margin:25px 0;">
                        <a href="{osm_url}" style="display:inline-block; background:#2ecc71; color:#fff; padding:14px 32px; border-radius:10px; text-decoration:none; font-weight:600; font-size:15px; margin:6px;">
                            📍 View on OpenStreetMap
                        </a>
                        <br/>
                        <a href="{app_url}" style="display:inline-block; background:#27ae60; color:#fff; padding:14px 32px; border-radius:10px; text-decoration:none; font-weight:600; font-size:15px; margin:6px;">
                            🗺️ Interactive Map View
                        </a>
                    </div>

                    <p style="color:#666; text-align:center; font-size:12px; margin-top:30px; border-top:1px solid #2a2a4a; padding-top:20px;">
                        Stay alert, stay safe! — Wild Guard Team
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(html, "html"))

        try:
            await aiosmtplib.send(
                msg,
                hostname="smtp.gmail.com",
                port=587,
                start_tls=True,
                username=settings.smtp_email,
                password=settings.smtp_password,
            )
            print(f"✅ Alert email sent to {email}")
        except Exception as e:
            print(f"❌ Failed to send email to {email} over SMTP: {e}")
            
        # For local testing: always write the email content to a log file
        try:
            import os
            log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email_logs.txt")
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(f"\n{'='*50}\n")
                f.write(f"TO: {email}\n")
                f.write(f"SUBJECT: {msg['Subject']}\n")
                f.write(f"BODY:\n{html}\n")
                f.write(f"{'='*50}\n")
            print(f"📝 Wrote email for {email} to email_logs.txt")
        except Exception as log_e:
            print(f"Failed to write to email log: {log_e}")


# ── Alert API Routes ──────────────────────────────────────────

@router.get("/", response_model=List[AlertResponse])
def list_alerts(current=Depends(get_current_user), db: Session = Depends(get_db)):
    """List all generated alerts, newest first."""
    return db.query(AlertGenerated).order_by(AlertGenerated.created_at.desc()).all()


@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    """
    Get a single alert by ID.
    Public endpoint (no auth) so users can click the map link from email.
    """
    alert = db.query(AlertGenerated).filter(AlertGenerated.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
