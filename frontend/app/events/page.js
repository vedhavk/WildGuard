"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import TrustBadge from "@/components/TrustBadge";
import { getEvents } from "@/lib/api";
import {
  Radio,
  Search,
  SlidersHorizontal,
  Compass,
  Eye,
  MapPin,
  ChevronRight,
} from "lucide-react";

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
        <h1>
          <Radio size={18} style={{ marginRight: "6px", verticalAlign: "middle" }} />
          LIVE WILDLIFE EVENTS WORKSPACE
        </h1>
        <p>Evolving incident records grouped by spatio-temporal radius</p>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: "0.85rem 1rem",
          marginBottom: "1.5rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Search size={14} style={{ color: "var(--text-secondary)" }} />
          <input
            type="text"
            className="input"
            placeholder="FILTER BY SPECIES (E.G. ELEPHANT, LEOPARD)..."
            value={searchSpecies}
            onChange={(e) => setSearchSpecies(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SlidersHorizontal size={14} style={{ color: "var(--text-secondary)" }} />
          <select
            className="input"
            style={{ width: "180px" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">ALL STATUSES</option>
            <option value="active">ACTIVE</option>
            <option value="monitoring">MONITORING</option>
            <option value="verified">VERIFIED</option>
            <option value="response_in_progress">RESPONSE IN PROGRESS</option>
            <option value="resolved">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Interactive Map */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div className="map-container" style={{ height: "360px" }}>
          <Map events={filteredEvents} />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="spinner" />
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <h3>NO INCIDENT RECORDS FOUND</h3>
          <p className="mono-code">CLEAR SEARCH CRITERIA OR REGISTER A NEW CAMERA REPORT.</p>
        </div>
      ) : (
        <div className="grid-responsive">
          {filteredEvents.map((ev) => (
            <div key={ev.event_id} className="card" style={{ padding: "1.25rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
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

              <h2 style={{ fontSize: "1rem", margin: "4px 0 8px", fontWeight: 600 }}>{ev.title}</h2>

              <div
                className="mono-code"
                style={{
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  marginBottom: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={11} /> LOCATION: {ev.location_name || `${ev.latitude.toFixed(3)}, ${ev.longitude.toFixed(3)}`}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Compass size={11} /> DIRECTION: {ev.movement_direction || "UNKNOWN"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Eye size={11} /> TOTAL SIGHTINGS: {ev.sighting_count}
                </div>
              </div>

              <Link
                href={`/events/${ev.event_id}`}
                className="btn btn-primary"
                style={{ width: "100%", textAlign: "center", display: "block" }}
              >
                EVENT WORKSPACE <ChevronRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
