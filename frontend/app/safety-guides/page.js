"use client";

import { useEffect, useState } from "react";
import { getCachedSafetyGuides, getCachedEmergencyContacts } from "@/lib/offlineStore";

export default function SafetyGuidesPage() {
  const [guides, setGuides] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    setGuides(getCachedSafetyGuides());
    setContacts(getCachedEmergencyContacts());
  }, []);

  return (
    <div className="page-container">
      <div className="section-header">
        <h1>📖 Offline Wildlife Safety Guides & Emergency Hotlines</h1>
        <p>Essential field protocols and emergency contact numbers cached locally on your device</p>
      </div>

      {/* Emergency Hotlines Grid */}
      <div style={{ marginBottom: "3rem" }}>
        <h2 style={{ marginBottom: "1rem", color: "#f87171" }}>📞 24/7 Emergency Hotline Directory</h2>
        <div className="grid-responsive">
          {contacts.map((c, idx) => (
            <div key={idx} className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #ef4444" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                {c.type}
              </div>
              <h3 style={{ margin: "4px 0 8px", fontSize: "1.1rem" }}>{c.name}</h3>
              <a
                href={`tel:${c.phone}`}
                className="btn btn-primary"
                style={{ display: "inline-block", fontSize: "0.85rem", padding: "6px 12px" }}
              >
                📞 Call {c.phone}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Protocols */}
      <h2>🐾 Animal Encounter Field Protocols</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
        {guides.map((g) => (
          <div key={g.id} className="card" style={{ padding: "1.75rem" }}>
            <h3 style={{ margin: "0 0 1rem", color: "var(--accent)", fontSize: "1.3rem" }}>
              {g.species} Encounter Guidelines
            </h3>
            <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "8px", color: "var(--text-primary)" }}>
              {g.precautions.map((p, pIdx) => (
                <li key={pIdx} style={{ fontSize: "0.95rem" }}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
