"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import TrustBadge from "@/components/TrustBadge";
import OfflineBanner from "@/components/OfflineBanner";
import { getEvents, getWildlifeIntelligence, getUserProfile } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle2,
  Camera,
  Activity,
  MapPin,
  Compass,
  Eye,
  FileText,
  ChevronRight,
  Shield,
} from "lucide-react";

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
          getEvents().catch((err) => {
            console.warn("getEvents connection warning:", err);
            return [];
          }),
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
        {/* Quiet Operations Safety Advisory Banner */}
        <div
          className={`safety-banner ${
            activeEvents.length === 0 ? "clear" : ""
          }`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className="banner-swatch">
              {activeEvents.length === 0 ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}
            </div>
            <div>
              <div className="mono-label">
                {activeEvents.length === 0
                  ? "SYSTEM STATUS // MONITORING SECTOR CLEAR"
                  : `INCIDENT ADVISORY // ${activeEvents.length} ACTIVE EVENT(S) DETECTED`}
              </div>
              <h2
                style={{
                  margin: "2px 0 0",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {activeEvents.length === 0
                  ? "No active threat incidents reported in current monitoring zone."
                  : `Active wildlife activity reported within regional monitoring perimeter.`}
              </h2>
              {profile && (
                <p
                  className="mono-code"
                  style={{ margin: "2px 0 0", fontSize: "11px" }}
                >
                  GEOFENCE: {profile.home_address || "DEFAULT SECTOR"} | RADIUS:{" "}
                  {profile.alert_radius_km} KM
                </p>
              )}
            </div>
          </div>
          <Link href="/upload" className="btn btn-primary">
            <Camera size={13} /> REPORT SIGHTING
          </Link>
        </div>

        {/* Hairline Divided Stat Cards Bar */}
        <div className="stat-bar">
          <div className="stat-card">
            <div className="mono-label">ACTIVE INCIDENTS</div>
            <div className="stat-val" style={{ color: activeEvents.length > 0 ? "var(--red-text)" : "var(--text-primary)" }}>
              {activeEvents.length}
            </div>
          </div>
          <div className="stat-card">
            <div className="mono-label">PRIMARY SPECIES</div>
            <div className="stat-val" style={{ fontSize: "1.3rem", color: "var(--amber-text)", marginTop: "8px" }}>
              {intelligence?.most_active_species || "ELEPHANT"}
            </div>
          </div>
          <div className="stat-card">
            <div className="mono-label">NETWORK PERIMETER</div>
            <div className="stat-val" style={{ fontSize: "1.3rem", color: "var(--sage-text)", marginTop: "8px" }}>
              VERIFIED
            </div>
          </div>
          <div className="stat-card">
            <div className="mono-label">CONTROL ROOM HOTLINE</div>
            <div className="stat-val" style={{ fontSize: "1.1rem", color: "var(--blue-text)", marginTop: "10px" }}>
              1800-425-4700
            </div>
          </div>
        </div>

        {/* Live Operations Workspace: Map & Hairline List */}
        <div className="alert-detail-grid" style={{ marginBottom: "2rem" }}>
          <div>
            <div className="section-header">
              <h1>GEOSPATIAL OPERATIONS MAP</h1>
              <p>Clustered wildlife incidents and perimeter monitoring radii</p>
            </div>
            <div className="map-container" style={{ height: "400px" }}>
              <Map events={events} />
            </div>
          </div>

          <div>
            <div className="section-header">
              <h1>ACTIVE WILDLIFE EVENTS</h1>
              <p>Grouped incident records updated in real time</p>
            </div>

            {loading ? (
              <div className="spinner" />
            ) : events.length === 0 ? (
              <div className="empty-state">
                <Shield size={24} style={{ opacity: 0.4, marginBottom: "8px" }} />
                <h3>NO ACTIVE INCIDENTS</h3>
                <p className="mono-code">PERIMETER QUIET. CAMERA SIGHTINGS WILL BE CLUSTERED HERE.</p>
              </div>
            ) : (
              <div className="card" style={{ padding: "0 1.25rem", maxHeight: "400px", overflowY: "auto" }}>
                <div className="hairline-list">
                  {events.slice(0, 5).map((ev) => (
                    <div key={ev.event_id} className="hairline-item">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <span className="mono-code" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                          EVT-0824#{ev.event_id}
                        </span>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <span className={`status-pill ${ev.status}`}>
                            {ev.status.replace("_", " ")}
                          </span>
                          <TrustBadge status={ev.verification_status} score={ev.trust_score} />
                        </div>
                      </div>

                      <h3 style={{ margin: "4px 0 6px", fontSize: "14px", fontWeight: 600 }}>
                        {ev.title}
                      </h3>

                      <div
                        className="mono-code"
                        style={{
                          display: "flex",
                          gap: "12px",
                          marginBottom: "10px",
                          fontSize: "11px",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Compass size={11} /> DIR: {ev.movement_direction || "N/A"}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Eye size={11} /> SIGHTINGS: {ev.sighting_count}
                        </span>
                      </div>

                      <Link
                        href={`/events/${ev.event_id}`}
                        className="btn btn-outline"
                        style={{ fontSize: "12px", padding: "4px 10px", width: "100%" }}
                      >
                        INCIDENT TIMELINE & WORKSPACE <ChevronRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sector Movement Intelligence */}
        {intelligence && intelligence.movement_stories && (
          <div className="card" style={{ padding: "1.25rem", marginTop: "1rem" }}>
            <div className="section-header" style={{ marginBottom: "1rem" }}>
              <h1><FileText size={16} inline style={{ marginRight: "6px" }} /> SECTOR MOVEMENT STORIES & HISTORICAL INSIGHTS</h1>
              <p>Aggregated historical movement logs for conflict prevention</p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1rem",
              }}
            >
              {intelligence.movement_stories.map((story, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--bg-primary)",
                    padding: "0.85rem 1rem",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <p className="mono-code" style={{ margin: 0, fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.6 }}>
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
