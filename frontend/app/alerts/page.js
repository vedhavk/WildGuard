"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAlerts } from "@/lib/api";

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
      return;
    }

    async function fetchAlerts() {
      try {
        const data = await getAlerts();
        setAlerts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, [router]);

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page-container">
      <div className="section-header fade-in">
        <h1> Alert History</h1>
        <p>All wild animal detections reported by the community</p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}

      {alerts.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-state-icon"></div>
          <h3>No alerts yet</h3>
          <p>When wild animals are detected, they will appear here.</p>
          <Link
            href="/upload"
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Upload an Image
          </Link>
        </div>
      ) : (
        <div className="table-wrapper fade-in">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Animal</th>
                <th>Type</th>
                <th>Location</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.alert_id}>
                  <td>#{alert.alert_id}</td>
                  <td>
                    <span className="badge badge-danger">
                      {alert.animal_detected}
                    </span>
                  </td>
                  <td>{alert.alert_type}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {alert.latitude?.toFixed(4)}, {alert.longitude?.toFixed(4)}
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {new Date(alert.created_at).toLocaleString()}
                  </td>
                  <td>
                    <Link
                      href={`/alert/${alert.alert_id}`}
                      className="btn btn-outline"
                      style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                    >
                      Map
                    </Link>
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
