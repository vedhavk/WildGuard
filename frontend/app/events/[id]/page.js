"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import TrustBadge from "@/components/TrustBadge";
import EventTimeline from "@/components/EventTimeline";
import { getEventDetail, submitConfirmation, updateAuthorityStatus } from "@/lib/api";
import {
  MapPin,
  Compass,
  FileText,
  CheckCircle2,
  ShieldAlert,
  Send,
  Eye,
  Layers,
} from "lucide-react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id;

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [userRole, setUserRole] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("still_present");
  const [direction, setDirection] = useState("North");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Admin form state
  const [adminStatus, setAdminStatus] = useState("verified");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("userRole"));
    }
    loadEvent();
  }, [eventId]);

  async function loadEvent() {
    try {
      const data = await getEventDetail(eventId);
      setEventData(data);
    } catch (err) {
      setError(err.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmationSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitConfirmation(eventId, {
        status_update: statusUpdate,
        direction,
        notes,
      });
      setNotes("");
      await loadEvent();
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdminStatusSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateAuthorityStatus(eventId, {
        status: adminStatus,
        notes: adminNotes,
        movement_direction: direction,
      });
      setAdminNotes("");
      await loadEvent();
    } catch (err) {
      alert(`Authority update failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="spinner" />;
  if (error || !eventData) {
    return (
      <div className="page-container empty-state">
        <h3>WILDLIFE EVENT RECORD NOT FOUND</h3>
        <p className="mono-code">{error}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Event Header Banner */}
      <div
        className="card"
        style={{
          padding: "1.25rem 1.5rem",
          marginBottom: "1.5rem",
          borderLeft: "4px solid var(--accent)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
              <span className="mono-code" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                EVT-0824#{eventData.event_id}
              </span>
              <span className={`status-pill ${eventData.status}`}>
                {eventData.status.replace("_", " ")}
              </span>
              <TrustBadge status={eventData.verification_status} score={eventData.trust_score} />
            </div>
            <h1 style={{ fontSize: "1.5rem", margin: 0, fontWeight: 700 }}>{eventData.title}</h1>
            <p className="mono-code" style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: "12px" }}>
              SPECIES: {eventData.species.toUpperCase()} | VERIFIED SIGHTINGS: {eventData.sighting_count}
            </p>
          </div>

          <div
            style={{
              background: "var(--bg-primary)",
              padding: "0.75rem 1rem",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              textAlign: "right",
            }}
          >
            <div className="mono-label">MOVEMENT VECTOR</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--amber-text)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Compass size={14} /> {eventData.movement_direction || "UNKNOWN"}
            </div>
          </div>
        </div>
      </div>

      <div className="alert-detail-grid">
        {/* Left Column: Timeline & Map */}
        <div>
          <div className="section-header">
            <h2><MapPin size={16} inline style={{ marginRight: "6px" }} /> GEOSPATIAL MAP</h2>
          </div>
          <div className="map-container" style={{ height: "320px", marginBottom: "1.5rem" }}>
            <Map latitude={eventData.latitude} longitude={eventData.longitude} animal={eventData.species} />
          </div>

          <div className="section-header">
            <h2><Layers size={16} inline style={{ marginRight: "6px" }} /> INCIDENT CHRONOLOGY TIMELINE</h2>
            <p>System AI detections, community reports, and official actions</p>
          </div>
          <EventTimeline timelines={eventData.timelines} />
        </div>

        {/* Right Column: Community Confirmation Form & Authority Tools */}
        <div>
          {/* Community Confirmation Form */}
          <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
            <div className="mono-label" style={{ marginBottom: "6px", color: "var(--accent-link)" }}>
              CONTRIBUTE FIELD SIGHTING
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Submit verified field observations to update the incident vector and earn contributor reputation.
            </p>

            <form onSubmit={handleConfirmationSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label className="label">OBSERVED STATUS</label>
                <select
                  className="input"
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                >
                  <option value="still_present">ANIMAL STILL PRESENT</option>
                  <option value="moved">ANIMAL MOVED / VECTOR CHANGED</option>
                  <option value="no_longer_visible">ANIMAL NO LONGER VISIBLE</option>
                </select>
              </div>

              <div>
                <label className="label">MOVEMENT DIRECTION</label>
                <select
                  className="input"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                >
                  <option value="North">NORTH</option>
                  <option value="North-East">NORTH-EAST</option>
                  <option value="East">EAST</option>
                  <option value="South-East">SOUTH-EAST</option>
                  <option value="South">SOUTH</option>
                  <option value="South-West">SOUTH-WEST</option>
                  <option value="West">WEST</option>
                  <option value="North-West">NORTH-WEST</option>
                  <option value="Toward Forest Boundary">TOWARD FOREST BOUNDARY</option>
                  <option value="Toward River Bed">TOWARD RIVER BED</option>
                </select>
              </div>

              <div>
                <label className="label">FIELD NOTES & OBSERVATIONS</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="e.g. Sighting confirmed near Eastern teagarden perimeter..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: "100%" }}
              >
                <Send size={13} /> {submitting ? "SUBMITTING..." : "SUBMIT SIGHTING LOG"}
              </button>
            </form>
          </div>

          {/* Forest Authority Control Box (Admins only) */}
          {userRole === "admin" && (
            <div
              className="card"
              style={{
                padding: "1.25rem",
                border: "1px solid var(--sage-border)",
                background: "var(--sage-bg)",
              }}
            >
              <div className="mono-label" style={{ marginBottom: "6px", color: "var(--sage-text)" }}>
                FOREST OFFICER COMMAND DESK
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Official verification upgrades incident credibility to AUTH-VERIF (98%).
              </p>

              <form onSubmit={handleAdminStatusSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div>
                  <label className="label">SET INCIDENT STATUS</label>
                  <select
                    className="input"
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value)}
                  >
                    <option value="verified">VERIFIED (ACTIVE MONITORING)</option>
                    <option value="response_in_progress">RESPONSE TEAM DISPATCHED</option>
                    <option value="monitoring">MONITORING (LOWER RISK)</option>
                    <option value="resolved">RESOLVED (AREA SAFE)</option>
                  </select>
                </div>

                <div>
                  <label className="label">OFFICIAL DIRECTIVE / NOTE</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. QRT Unit 2 deployed for border siren alert."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-outline"
                  disabled={submitting}
                  style={{ borderColor: "var(--sage-text)", color: "var(--sage-text)" }}
                >
                  <ShieldAlert size={13} /> PUBLISH DIRECTIVE & VERIFY
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
