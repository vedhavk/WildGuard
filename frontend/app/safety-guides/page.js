"use client";

import { useEffect, useState } from "react";
import { getCachedSafetyGuides, getCachedEmergencyContacts } from "@/lib/offlineStore";
import { PhoneCall, FileText, ShieldAlert, BookOpen } from "lucide-react";

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
        <h1>
          <BookOpen size={18} inline style={{ marginRight: "6px", verticalAlign: "middle" }} />
          WILDLIFE SAFETY FIELD PROTOCOLS & HOTLINES
        </h1>
        <p>Offline-cached field safety protocols and 24/7 control room emergency contacts</p>
      </div>

      {/* Emergency Hotlines Grid */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div className="section-header" style={{ marginBottom: "1rem" }}>
          <h2><PhoneCall size={16} inline style={{ marginRight: "6px" }} /> 24/7 CONTROL ROOM EMERGENCY DIRECTORY</h2>
        </div>
        <div className="grid-responsive">
          {contacts.map((c, idx) => (
            <div key={idx} className="card" style={{ padding: "1rem", borderLeft: "4px solid var(--amber-text)" }}>
              <div className="mono-label" style={{ fontSize: "10px", color: "var(--amber-text)" }}>
                {c.type}
              </div>
              <h3 style={{ margin: "4px 0 8px", fontSize: "14px", fontWeight: 600 }}>{c.name}</h3>
              <a
                href={`tel:${c.phone}`}
                className="btn btn-primary"
                style={{ fontSize: "12px", padding: "4px 10px" }}
              >
                <PhoneCall size={12} /> CALL {c.phone}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Protocols */}
      <div className="section-header" style={{ marginBottom: "1rem" }}>
        <h2><ShieldAlert size={16} inline style={{ marginRight: "6px" }} /> SPECIES ENCOUNTER FIELD PROTOCOLS</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {guides.map((g) => (
          <div key={g.id} className="card" style={{ padding: "1.25rem" }}>
            <div className="mono-label" style={{ color: "var(--accent-link)", marginBottom: "4px" }}>
              PROTOCOL #{g.id.toUpperCase()}
            </div>
            <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.1rem", fontWeight: 600 }}>
              {g.species} Encounter Guidelines
            </h3>
            <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "6px", color: "var(--text-primary)", fontSize: "13px" }}>
              {g.precautions.map((p, pIdx) => (
                <li key={pIdx}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
