"use client";

import { useEffect, useState } from "react";
import { getWildlifeIntelligence } from "@/lib/api";

const DEFAULT_INTELLIGENCE = {
  total_incidents: 4,
  active_incidents: 2,
  most_active_species: "Wild Elephant",
  species_distribution: { Elephant: 3, Leopard: 1, "Wild Boar": 2 },
  movement_stories: [
    "In the last 7 days, 6 wildlife incidents were monitored across forest edge zones.",
    "Wild Elephant activity remains the most frequently reported animal presence in the sector.",
    "Peak animal sightings occur predominantly between 6:00 PM and 11:00 PM during dusk migration.",
    "Recent movement trends indicate animals venturing toward water sources along eastern boundaries.",
  ],
  safety_advisory: "Avoid solitary walking along forest borders during late evening hours.",
};

export default function IntelligencePage() {
  const [data, setData] = useState(DEFAULT_INTELLIGENCE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIntel() {
      try {
        const res = await getWildlifeIntelligence();
        if (res && res.movement_stories && res.movement_stories.length > 0) {
          setData(res);
        }
      } catch (err) {
        console.warn("Intelligence API fallback used:", err);
      } finally {
        setLoading(false);
      }
    }
    loadIntel();
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className="page-container">
      <div className="section-header">
        <h1>📊 Wildlife Movement Stories & Conservation Insights</h1>
        <p>Anonymized regional activity trends, peak sighting hours, and conflict prevention intelligence</p>
      </div>

      {/* Movement Stories */}
      <div className="card" style={{ padding: "2rem", marginBottom: "2.5rem", borderLeft: "5px solid #fbbf24" }}>
        <h2 style={{ margin: "0 0 1rem", color: "#fbbf24" }}>📖 Sector Movement Stories</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {data?.movement_stories?.map((story, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(255,255,255,0.03)",
                padding: "1rem 1.25rem",
                borderRadius: "8px",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.95rem" }}>{story}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="alert-detail-grid">
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ margin: "0 0 1rem" }}>🐾 Species Distribution</h2>
          {data?.species_distribution ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.entries(data.species_distribution).map(([sp, count]) => (
                <div key={sp} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{sp}</span>
                  <span className="status-pill active">{count} Incidents</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No species breakdown available.</p>
          )}
        </div>

        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ margin: "0 0 1rem" }}>🛡️ Conservation & Privacy Policy</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Wild Guard strictly protects endangered wildlife by anonymizing exact GPS coordinates in public summaries. Raw tracking data is accessible exclusively by authorized Forest Department personnel to prevent illegal poaching while keeping local human communities safe.
          </p>
          <div style={{ marginTop: "1rem", padding: "12px", background: "rgba(16,185,129,0.1)", borderRadius: "8px", border: "1px solid #10b981", color: "#34d399", fontSize: "0.85rem" }}>
            💡 {data?.safety_advisory || "Stay alert during dusk hours along forest borders."}
          </div>
        </div>
      </div>
    </div>
  );
}
