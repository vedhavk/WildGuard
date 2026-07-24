"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getAlert } from "@/lib/api";

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function AlertDetailPage() {
  const params = useParams();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAlert() {
      try {
        const data = await getAlert(params.id);
        setAlert(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchAlert();
  }, [params.id]);

  if (loading) return <div className="spinner"></div>;

  if (error) {
    return (
      <div className="page-container">
        <div className="alert-box alert-error"> {error}</div>
        <Link href="/alerts" className="btn btn-outline">
          ← Back to Alerts
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link
        href="/alerts"
        style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
      >
        ← Back to Alerts
      </Link>

      <div className="section-header fade-in" style={{ marginTop: "1rem" }}>
        <h1>
          Alert #{alert.alert_id}:{" "}
          <span style={{ color: "var(--accent)" }}>
            {alert.animal_detected}
          </span>
        </h1>
        <p>Detected on {new Date(alert.created_at).toLocaleString()}</p>
      </div>

      <div className="alert-detail-grid fade-in">
        {/* Map */}
        <div className="map-container">
          {alert.latitude && alert.longitude && (
            <Map
              latitude={alert.latitude}
              longitude={alert.longitude}
              animal={alert.animal_detected}
            />
          )}
        </div>

        {/* Info panel */}
        <div className="card">
          <h3 style={{ marginBottom: "1.5rem" }}>Detection Details</h3>

          <div className="alert-detail-info">
            <div className="info-row">
              <span className="label">Animal</span>
              <span className="value">
                <span className="badge badge-danger">
                  {alert.animal_detected}
                </span>
              </span>
            </div>

            <div className="info-row">
              <span className="label">Alert Type</span>
              <span className="value">{alert.alert_type}</span>
            </div>

            <div className="info-row">
              <span className="label">Latitude</span>
              <span className="value">{alert.latitude?.toFixed(6)}</span>
            </div>

            <div className="info-row">
              <span className="label">Longitude</span>
              <span className="value">{alert.longitude?.toFixed(6)}</span>
            </div>

            <div className="info-row">
              <span className="label">Reported By</span>
              <span className="value">User #{alert.user_id}</span>
            </div>

            <div className="info-row">
              <span className="label">Time</span>
              <span className="value">
                {new Date(alert.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          {/* External map link */}
          <a
            href={`https://www.openstreetmap.org/?mlat=${alert.latitude}&mlon=${alert.longitude}#map=15/${alert.latitude}/${alert.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-full"
            style={{ marginTop: "1.5rem" }}
          >
            Open in OpenStreetMap
          </a>

          {alert.image_url && (
            <img
              src={`http://localhost:8000${alert.image_url}`}
              alt="Detected animal"
              style={{
                width: "100%",
                borderRadius: "var(--radius-sm)",
                marginTop: "1.5rem",
                border: "1px solid var(--border)",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
