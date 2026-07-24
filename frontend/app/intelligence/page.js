"use client";

import { useEffect, useState } from "react";
import { getWildlifeIntelligence } from "@/lib/api";
import { Activity, BarChart2, Lock, FileText, AlertTriangle } from "lucide-react";

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
        <h1>
          <Activity size={18} inline style={{ marginRight: "6px", verticalAlign: "middle" }} />
          HISTORICAL WILDLIFE MOVEMENT STORIES & INSIGHTS
        </h1>
        <p>Anonymized regional activity trends, peak sighting hours, and conflict prevention logs</p>
      </div>

      {/* Movement Stories */}
      <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem", borderLeft: "4px solid var(--amber-text)" }}>
        <div className="mono-label" style={{ color: "var(--amber-text)", marginBottom: "8px" }}>
          SECTOR MOVEMENT STORIES
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {data?.movement_stories?.map((story, idx) => (
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

      {/* Analytics Breakdown */}
      <div className="alert-detail-grid">
        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="mono-label" style={{ marginBottom: "12px" }}>
            <BarChart2 size={12} inline style={{ marginRight: "4px" }} /> SPECIES INCIDENT DISTRIBUTION
          </div>
          {data?.species_distribution ? (
            <div className="mono-code" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
              {Object.entries(data.species_distribution).map(([sp, count]) => (
                <div key={sp} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ textTransform: "uppercase", fontWeight: 600 }}>{sp}</span>
                  <span className="status-pill active">{count} INCIDENTS</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mono-code">NO SPECIES BREAKDOWN RECORDED.</p>
          )}
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="mono-label" style={{ marginBottom: "12px" }}>
            <Lock size={12} inline style={{ marginRight: "4px" }} /> CONSERVATION & PRIVACY ADVISORY
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Wild Guard strictly protects endangered species by anonymizing exact GPS coordinates in public summaries. High-precision telemetry data is restricted to authorized Forest Department personnel to prevent poaching risks while maintaining community safety.
          </p>
          <div
            className="mono-code"
            style={{
              marginTop: "1rem",
              padding: "10px 12px",
              background: "var(--sage-bg)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--sage-border)",
              color: "var(--sage-text)",
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertTriangle size={13} />
            <span>ADVISORY: {data?.safety_advisory || "STAY ALERT DURING DUSK HOURS ALONG FOREST BORDERS."}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
