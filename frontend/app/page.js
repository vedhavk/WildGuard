"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import TrustBadge from "@/components/TrustBadge";
import OfflineBanner from "@/components/OfflineBanner";
import { getEvents, getWildlifeIntelligence, getUserProfile } from "@/lib/api";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [events, setEvents] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [evList, intelData] = await Promise.all([
          getEvents(),
          getWildlifeIntelligence().catch(() => null),
        ]);
        setEvents(evList || []);
        setIntelligence(intelData);

        const token = localStorage.getItem("token");
        if (token) {
          const prof = await getUserProfile().catch(() => null);
          setProfile(prof);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeEvents = events.filter((e) =>
    ["active", "monitoring", "verified"].includes(e.status)
  );

  return (
    <>
      <OfflineBanner />

      <div className="page-container">
        {/* Personal Safety Geofence Status Banner */}
        <div
          className={`safety-banner ${
            activeEvents.length === 0 ? "clear" : ""
          }`}
        >
          <div>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: activeEvents.length === 0 ? "#34d399" : "#f87171",
              }}
            >
              {activeEvents.length === 0
                ? "🟢 PERSONAL SAFETY STATUS: ALL CLEAR"
                : `🚨 PERSONAL SAFETY ADVISORY: ${activeEvents.length} ACTIVE INCIDENT(S)`}
            </span>
            <h2 style={{ margin: "4px 0 0", fontSize: "1.3rem" }}>
              {activeEvents.length === 0
                ? "No immediate wildlife threats detected in your sector."
                : `Active wildlife activity reported within your local monitoring radius.`}
            </h2>
            {profile && (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  margin: "4px 0 0",
                }}
              >
                Monitoring Geofence: Home ({profile.home_address || "Sector"}) &bull; Alert Radius: {profile.alert_radius_km} km
              </p>
            )}
          </div>
          <Link
            href="/upload"
            className="btn btn-primary"
            style={{ whiteSpace: "nowrap" }}
          >
            📸 Report Sighting
          </Link>
        </div>

        {/* Hero Quick Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            marginBottom: "2.5rem",
          }}
        >
          <div className="card" style={{ padding: "1.25rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Active Incidents
            </span>
            <h2 style={{ fontSize: "2rem", color: "var(--accent)", margin: "4px 0 0" }}>
              {activeEvents.length}
            </h2>
          </div>
          <div className="card" style={{ padding: "1.25rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Most Active Species
            </span>
            <h2 style={{ fontSize: "1.4rem", color: "#fbbf24", margin: "8px 0 0" }}>
              {intelligence?.most_active_species || "Elephant"}
            </h2>
          </div>
          <div className="card" style={{ padding: "1.25rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Community Network Status
            </span>
            <h2 style={{ fontSize: "1.4rem", color: "#60a5fa", margin: "8px 0 0" }}>
              Verified & Active
            </h2>
          </div>
          <div className="card" style={{ padding: "1.25rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Emergency Hotline
            </span>
            <h2 style={{ fontSize: "1.1rem", color: "#34d399", margin: "10px 0 0" }}>
              1800-425-4700
            </h2>
          </div>
        </div>

        {/* Live Map & Active Events Workspace */}
        <div className="alert-detail-grid" style={{ marginBottom: "3rem" }}>
          <div>
            <div className="section-header">
              <h1>Interactive Wildlife Map</h1>
              <p>Real-time incident clustering, trust badges, and movement radii</p>
            </div>
            <div className="map-container" style={{ height: "420px" }}>
              <Map events={events} />
            </div>
          </div>

          <div>
            <div className="section-header">
              <h1>Active Wildlife Events</h1>
              <p>Evolving incidents aggregated from AI and community sightings</p>
            </div>

            {loading ? (
              <div className="spinner" />
            ) : events.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🌲</div>
                <h3>No active events reported</h3>
                <p>The forest perimeter is quiet. Use camera upload to submit a sighting.</p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  maxHeight: "420px",
                  overflowY: "auto",
                  paddingRight: "6px",
                }}
              >
                {events.slice(0, 5).map((ev) => (
                  <div key={ev.event_id} className="card" style={{ padding: "1.25rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{ev.title}</h3>
                      <TrustBadge status={ev.verification_status} score={ev.trust_score} />
                    </div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        margin: "0 0 10px",
                      }}
                    >
                      Direction: <strong>{ev.movement_direction}</strong> &bull; Sightings: <strong>{ev.sighting_count}</strong>
                    </p>
                    <Link
                      href={`/events/${ev.event_id}`}
                      className="btn btn-outline"
                      style={{ fontSize: "0.8rem", padding: "6px 14px", width: "100%", textAlign: "center" }}
                    >
                      View Incident Timeline & Workspace &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Wildlife Movement Stories & Safety Insights */}
        {intelligence && intelligence.movement_stories && (
          <div className="card" style={{ padding: "2rem", marginBottom: "3rem" }}>
            <div className="section-header" style={{ marginBottom: "1.25rem" }}>
              <h1>📖 Wildlife Movement Stories & Historical Insights</h1>
              <p>Anonymized regional intelligence to keep communities prepared</p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {intelligence.movement_stories.map((story, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    padding: "1rem 1.25rem",
                    borderRadius: "10px",
                    borderLeft: "4px solid var(--accent)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    {story}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
