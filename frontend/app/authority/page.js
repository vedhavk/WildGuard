"use client";

import { useEffect, useState } from "react";
import TrustBadge from "@/components/TrustBadge";
import { getEvents, createAuthorityBroadcast, getAuthorityBroadcasts, updateAuthorityStatus } from "@/lib/api";

export default function AuthorityPage() {
  const [events, setEvents] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Broadcast Form
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("warning");
  const [restrictedZone, setRestrictedZone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [evList, bcList] = await Promise.all([
        getEvents(),
        getAuthorityBroadcasts().catch(() => []),
      ]);
      setEvents(evList || []);
      setBroadcasts(bcList || []);
    } catch (err) {
      console.error("Authority data load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleBroadcastSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAuthorityBroadcast({
        title,
        message,
        severity,
        restricted_zone: restrictedZone,
      });
      setTitle("");
      setMessage("");
      setRestrictedZone("");
      await loadData();
      alert("Official Emergency Advisory Broadcasted!");
    } catch (err) {
      alert(`Broadcast failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleQuickVerify(eventId) {
    try {
      await updateAuthorityStatus(eventId, {
        status: "response_in_progress",
        notes: "Forest Response Team dispatched for perimeter control.",
      });
      await loadData();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <h1>🛡️ Forest Authority Collaboration Workspace</h1>
        <p>Command center for official verifications, response teams, and public advisory broadcasts</p>
      </div>

      <div className="alert-detail-grid" style={{ marginBottom: "3rem" }}>
        {/* Broadcast Form */}
        <div className="card" style={{ padding: "1.75rem", borderLeft: "5px solid #34d399" }}>
          <h2 style={{ margin: "0 0 8px", color: "#34d399" }}>📢 Broadcast Official Advisory</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Publish official announcements and restricted zone warnings to all community dashboards.
          </p>

          <form onSubmit={handleBroadcastSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="label">Advisory Title</label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. HIGH ALERT: Elephant Herd Crossing Eastern Highway"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Advisory Message & Instructions</label>
              <textarea
                className="input"
                rows={3}
                required
                placeholder="Official instructions for residents and commuters..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="label">Severity Level</label>
                <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                  <option value="info">Info Advisory</option>
                  <option value="warning">Warning Notice</option>
                  <option value="critical">CRITICAL EMERGENCY</option>
                </select>
              </div>

              <div>
                <label className="label">Restricted Danger Zone</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Sector 4 Forest Boundary"
                  value={restrictedZone}
                  onChange={(e) => setRestrictedZone(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Broadcasting..." : "Publish Emergency Broadcast"}
            </button>
          </form>
        </div>

        {/* Active Broadcasts Feed */}
        <div>
          <h2 style={{ margin: "0 0 1rem" }}>📡 Active Official Broadcasts</h2>
          {broadcasts.length === 0 ? (
            <div className="empty-state" style={{ padding: "2rem" }}>
              <p>No active broadcasts issued.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {broadcasts.map((b) => (
                <div key={b.broadcast_id} className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span className="status-pill verified">● {b.severity.toUpperCase()}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {b.created_at ? new Date(b.created_at).toLocaleString() : "Recently"}
                    </span>
                  </div>
                  <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem" }}>{b.title}</h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    {b.message}
                  </p>
                  {b.restricted_zone && (
                    <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "#f87171" }}>
                      ⛔ Restricted Area: {b.restricted_zone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Incidents Management Table */}
      <h2 style={{ marginBottom: "1rem" }}>📋 Incident Verification & Dispatch Portal</h2>
      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="card" style={{ padding: "1.25rem", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                <th style={{ padding: "12px" }}>Incident</th>
                <th style={{ padding: "12px" }}>Species</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Trust Score</th>
                <th style={{ padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.event_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "12px", fontWeight: 600 }}>{ev.title}</td>
                  <td style={{ padding: "12px" }}>{ev.species}</td>
                  <td style={{ padding: "12px" }}>
                    <span className={`status-pill ${ev.status}`}>{ev.status}</span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <TrustBadge status={ev.verification_status} score={ev.trust_score} />
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => handleQuickVerify(ev.event_id)}
                      className="btn btn-outline"
                      style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                    >
                      Dispatch QRT Team
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
