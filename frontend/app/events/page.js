"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import TrustBadge from "@/components/TrustBadge";
import { getEvents } from "@/lib/api";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSpecies, setSearchSpecies] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    loadEvents();
  }, [filterStatus]);

  async function loadEvents() {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (searchSpecies) params.species = searchSpecies;
      const data = await getEvents(params);
      setEvents(data || []);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter((e) =>
    searchSpecies
      ? e.species.toLowerCase().includes(searchSpecies.toLowerCase())
      : true
  );

  return (
    <div className="page-container">
      <div className="section-header">
        <h1>🐾 Live Wildlife Events Workspace</h1>
        <p>Evolving community incidents grouped by location and time window</p>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: "1.25rem",
          marginBottom: "2rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: "220px" }}>
          <input
            type="text"
            className="input"
            placeholder="Search by animal species (e.g. Elephant, Leopard)..."
            value={searchSpecies}
            onChange={(e) => setSearchSpecies(e.target.value)}
          />
        </div>

        <select
          className="input"
          style={{ width: "200px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="monitoring">Monitoring</option>
          <option value="verified">Verified</option>
          <option value="response_in_progress">Response in Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Interactive Map */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div className="map-container" style={{ height: "380px" }}>
          <Map events={filteredEvents} />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="spinner" />
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌲</div>
          <h3>No events match your criteria</h3>
          <p>Try clearing filters or search query.</p>
        </div>
      ) : (
        <div className="grid-responsive">
          {filteredEvents.map((ev) => (
            <div key={ev.event_id} className="card" style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <span className={`status-pill ${ev.status}`}>
                  ● {ev.status.replace("_", " ").toUpperCase()}
                </span>
                <TrustBadge status={ev.verification_status} score={ev.trust_score} />
              </div>

              <h2 style={{ fontSize: "1.25rem", margin: "0 0 8px" }}>{ev.title}</h2>

              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div>📍 Location: {ev.location_name || `${ev.latitude.toFixed(3)}, ${ev.longitude.toFixed(3)}`}</div>
                <div>🧭 Direction: {ev.movement_direction || "Unknown"}</div>
                <div>👁️ Total Sightings: {ev.sighting_count}</div>
              </div>

              <Link
                href={`/events/${ev.event_id}`}
                className="btn btn-primary"
                style={{ width: "100%", textAlign: "center", display: "block" }}
              >
                Explore Event Detail & Timeline &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
