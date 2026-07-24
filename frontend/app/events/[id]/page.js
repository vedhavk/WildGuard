"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import TrustBadge from "@/components/TrustBadge";
import EventTimeline from "@/components/EventTimeline";
import { getEventDetail, submitConfirmation, updateAuthorityStatus } from "@/lib/api";

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
        <h3>Wildlife Event Not Found</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Event Header Banner */}
      <div
        className="card"
        style={{
          padding: "2rem",
          marginBottom: "2rem",
          borderLeft: "6px solid var(--accent)",
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
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
              <span className={`status-pill ${eventData.status}`}>
                ● {eventData.status.replace("_", " ").toUpperCase()}
              </span>
              <TrustBadge status={eventData.verification_status} score={eventData.trust_score} />
            </div>
            <h1 style={{ fontSize: "2rem", margin: 0 }}>{eventData.title}</h1>
            <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
              Species: <strong>{eventData.species}</strong> &bull; Total Verified Sightings: <strong>{eventData.sighting_count}</strong>
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              padding: "1rem 1.25rem",
              borderRadius: "10px",
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Current Direction</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fbbf24" }}>
              🧭 {eventData.movement_direction || "Unknown"}
            </div>
          </div>
        </div>
      </div>

      <div className="alert-detail-grid">
        {/* Left Column: Timeline & Map */}
        <div>
          <div className="section-header">
            <h2>📍 Event Location Map</h2>
          </div>
          <div className="map-container" style={{ height: "350px", marginBottom: "2rem" }}>
            <Map latitude={eventData.latitude} longitude={eventData.longitude} animal={eventData.species} />
          </div>

          <div className="section-header">
            <h2>📜 Chronological Event Timeline</h2>
            <p>Milestones logged by system AI, community sightings, and forest officers</p>
          </div>
          <EventTimeline timelines={eventData.timelines} />
        </div>

        {/* Right Column: Community Confirmation Form & Authority Tools */}
        <div>
          {/* Community Confirmation Form */}
          <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
            <h3 style={{ margin: "0 0 8px", color: "var(--accent)" }}>
              🤝 Contribute Sighting Update
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
              Verify this incident to earn contributor reputation points and keep your community informed.
            </p>

            <form onSubmit={handleConfirmationSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="label" style={{ fontSize: "0.85rem" }}>Current Status</label>
                <select
                  className="input"
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                >
                  <option value="still_present">🐾 Animal Still Present</option>
                  <option value="moved">🏃 Animal Moving/Direction Changed</option>
                  <option value="no_longer_visible">🌲 Animal No Longer Visible</option>
                </select>
              </div>

              <div>
                <label className="label" style={{ fontSize: "0.85rem" }}>Observed Direction of Movement</label>
                <select
                  className="input"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                >
                  <option value="North">North</option>
                  <option value="North-East">North-East</option>
                  <option value="East">East</option>
                  <option value="South-East">South-East</option>
                  <option value="South">South</option>
                  <option value="South-West">South-West</option>
                  <option value="West">West</option>
                  <option value="North-West">North-West</option>
                  <option value="Toward Forest Boundary">Toward Forest Boundary</option>
                  <option value="Toward River Bed">Toward River Bed</option>
                </select>
              </div>

              <div>
                <label className="label" style={{ fontSize: "0.85rem" }}>Additional Field Notes</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="e.g. Heard elephant calls near eastern teagarden, moving slowly..."
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
                {submitting ? "Submitting..." : "Submit Verified Sighting"}
              </button>
            </form>
          </div>

          {/* Forest Authority Control Box (Admins only) */}
          {userRole === "admin" && (
            <div
              className="card"
              style={{
                padding: "1.5rem",
                border: "1px solid #34d399",
                background: "rgba(52, 211, 153, 0.05)",
              }}
            >
              <h3 style={{ margin: "0 0 8px", color: "#34d399" }}>
                🛡️ Forest Officer Incident Management
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Official verification upgrades trust rating to 98% (Authority Verified).
              </p>

              <form onSubmit={handleAdminStatusSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="label" style={{ fontSize: "0.85rem" }}>Set Incident Status</label>
                  <select
                    className="input"
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value)}
                  >
                    <option value="verified">Verified (Active Monitoring)</option>
                    <option value="response_in_progress">Response Team Dispatched</option>
                    <option value="monitoring">Monitoring (Lower Risk)</option>
                    <option value="resolved">Resolved (Safe Area)</option>
                  </select>
                </div>

                <div>
                  <label className="label" style={{ fontSize: "0.85rem" }}>Official Instructions / Note</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. QRT Team 2 dispatched with sirens. Stay indoors."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-outline"
                  disabled={submitting}
                  style={{ borderColor: "#34d399", color: "#34d399" }}
                >
                  Publish Official Update & Verify
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
