"use client";

import { useEffect, useState } from "react";
import TrustBadge from "@/components/TrustBadge";
import {
  getEvents,
  createAuthorityBroadcast,
  getAuthorityBroadcasts,
  updateAuthorityStatus,
} from "@/lib/api";
import {
  Radio,
  AlertOctagon,
  ShieldCheck,
  Send,
  Building,
  ListFilter,
} from "lucide-react";

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
        <h1>
          <Building size={18} style={{ marginRight: "6px", verticalAlign: "middle" }} />
          FOREST AUTHORITY COLLABORATION DESK
        </h1>
        <p>Official incident verifications, emergency advisories, and QRT dispatches</p>
      </div>

      <div className="alert-detail-grid" style={{ marginBottom: "2.5rem" }}>
        {/* Broadcast Form */}
        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--sage-text)" }}>
          <div className="mono-label" style={{ color: "var(--sage-text)", marginBottom: "6px" }}>
            PUBLIC EMERGENCY ADVISORY DISPATCH
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
            Publish official advisories and danger zones to community dashboards.
          </p>

          <form onSubmit={handleBroadcastSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div>
              <label className="label">ADVISORY TITLE</label>
              <input
                type="text"
                className="input"
                required
                placeholder="E.G. HIGH ALERT: ELEPHANT HERD CROSSING EASTERN HIGHWAY"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="label">MESSAGE & DIRECTIVES</label>
              <textarea
                className="input"
                rows={3}
                required
                placeholder="Official directives for sector residents..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
              <div>
                <label className="label">SEVERITY LEVEL</label>
                <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                  <option value="info">INFO ADVISORY</option>
                  <option value="warning">WARNING NOTICE</option>
                  <option value="critical">CRITICAL EMERGENCY</option>
                </select>
              </div>

              <div>
                <label className="label">RESTRICTED ZONE</label>
                <input
                  type="text"
                  className="input"
                  placeholder="E.G. SECTOR 4 BOUNDARY"
                  value={restrictedZone}
                  onChange={(e) => setRestrictedZone(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Send size={13} /> {submitting ? "BROADCASTING..." : "PUBLISH ADVISORY"}
            </button>
          </form>
        </div>

        {/* Active Broadcasts Feed */}
        <div>
          <div className="section-header" style={{ marginBottom: "1rem" }}>
            <h2><Radio size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} /> ACTIVE OFFICIAL BROADCASTS</h2>
          </div>
          {broadcasts.length === 0 ? (
            <div className="empty-state">
              <p className="mono-code">NO ACTIVE ADVISORIES ISSUED.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {broadcasts.map((b) => (
                <div key={b.broadcast_id} className="card" style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span className="status-pill verified">
                      <ShieldCheck size={11} /> {b.severity.toUpperCase()}
                    </span>
                    <span className="mono-code" style={{ fontSize: "11px" }}>
                      {b.created_at ? new Date(b.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) : "LOGGED"}
                    </span>
                  </div>
                  <h3 style={{ margin: "4px 0", fontSize: "13px", fontWeight: 600 }}>{b.title}</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                    {b.message}
                  </p>
                  {b.restricted_zone && (
                    <div className="mono-code" style={{ marginTop: "6px", fontSize: "11px", color: "var(--red-text)" }}>
                      ⛔ RESTRICTED ZONE: {b.restricted_zone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Incidents Management Table */}
      <div className="section-header" style={{ marginBottom: "1rem" }}>
        <h2><ListFilter size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} /> INCIDENT VERIFICATION & TEAM DISPATCH</h2>
      </div>
      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="card" style={{ padding: "1rem", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr className="mono-label" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <th style={{ padding: "8px 12px" }}>INCIDENT ID</th>
                <th style={{ padding: "8px 12px" }}>SPECIES</th>
                <th style={{ padding: "8px 12px" }}>STATUS</th>
                <th style={{ padding: "8px 12px" }}>TRUST SCORE</th>
                <th style={{ padding: "8px 12px" }}>DISPATCH ACTION</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.event_id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 600 }}>{ev.title}</div>
                    <div className="mono-code" style={{ fontSize: "11px" }}>EVT-0824#{ev.event_id}</div>
                  </td>
                  <td style={{ padding: "10px 12px", textTransform: "uppercase", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{ev.species}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span className={`status-pill ${ev.status}`}>{ev.status}</span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <TrustBadge status={ev.verification_status} score={ev.trust_score} />
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <button
                      onClick={() => handleQuickVerify(ev.event_id)}
                      className="btn btn-outline"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      <AlertOctagon size={11} /> DISPATCH QRT
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
