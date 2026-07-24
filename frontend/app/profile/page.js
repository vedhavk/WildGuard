"use client";

import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile, getCurrentPosition, reverseGeocode } from "@/lib/api";

const DEFAULT_PROFILE = {
  profile_id: 1,
  user_id: 1,
  home_address: "Forest Edge Estate, Sector 4",
  home_lat: 10.1234,
  home_lng: 76.5678,
  work_address: "Tea Garden Patrol Route",
  work_lat: 10.1300,
  work_lng: 76.5700,
  alert_radius_km: 5.0,
  reputation_score: 15,
  badge_title: "Community Watcher",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [homeAddress, setHomeAddress] = useState(DEFAULT_PROFILE.home_address);
  const [homeLat, setHomeLat] = useState(DEFAULT_PROFILE.home_lat);
  const [homeLng, setHomeLng] = useState(DEFAULT_PROFILE.home_lng);
  const [workAddress, setWorkAddress] = useState(DEFAULT_PROFILE.work_address);
  const [workLat, setWorkLat] = useState(DEFAULT_PROFILE.work_lat);
  const [workLng, setWorkLng] = useState(DEFAULT_PROFILE.work_lng);
  const [alertRadiusKm, setAlertRadiusKm] = useState(5.0);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getUserProfile();
      if (data) {
        setProfile(data);
        setHomeAddress(data.home_address || "");
        setHomeLat(data.home_lat || "");
        setHomeLng(data.home_lng || "");
        setWorkAddress(data.work_address || "");
        setWorkLat(data.work_lat || "");
        setWorkLng(data.work_lng || "");
        setAlertRadiusKm(data.alert_radius_km || 5.0);
      }
    } catch (err) {
      console.warn("Profile API fallback used:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAutoDetectHome() {
    try {
      const pos = await getCurrentPosition();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const geo = await reverseGeocode(lat, lng);
      setHomeLat(lat);
      setHomeLng(lng);
      setHomeAddress(geo.address);
    } catch (err) {
      alert(`Location detection failed: ${err.message}`);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateUserProfile({
        home_address: homeAddress,
        home_lat: homeLat ? parseFloat(homeLat) : null,
        home_lng: homeLng ? parseFloat(homeLng) : null,
        work_address: workAddress,
        work_lat: workLat ? parseFloat(workLat) : null,
        work_lng: workLng ? parseFloat(workLng) : null,
        alert_radius_km: parseFloat(alertRadiusKm),
      });
      setProfile(updated);
      alert("Personal Safety Profile updated successfully!");
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="spinner" />;

  return (
    <div className="page-container">
      <div className="section-header">
        <h1>👤 Personal Safety Profile & Badges</h1>
        <p>Configure your private geofence routes and view your community reputation rank</p>
      </div>

      <div className="alert-detail-grid">
        {/* Left Column: Safety Geofence Settings */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ margin: "0 0 1rem" }}>📍 Geofenced Safety Routes</h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label className="label">Home / Primary Sector Address</label>
                <button
                  type="button"
                  onClick={handleAutoDetectHome}
                  style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.8rem" }}
                >
                  📍 Use Current GPS
                </button>
              </div>
              <input
                type="text"
                className="input"
                placeholder="e.g. Forest Edge Estate, Sector 4"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="label">Home Latitude</label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  placeholder="10.1234"
                  value={homeLat}
                  onChange={(e) => setHomeLat(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Home Longitude</label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  placeholder="76.5678"
                  value={homeLng}
                  onChange={(e) => setHomeLng(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Workplace / Travel Route Address</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Tea Factory Road / Forest Office"
                value={workAddress}
                onChange={(e) => setWorkAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                Safety Warning Radius: <strong>{alertRadiusKm} km</strong>
              </label>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                style={{ width: "100%", accentColor: "var(--accent)" }}
                value={alertRadiusKm}
                onChange={(e) => setAlertRadiusKm(e.target.value)}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Alerts will trigger on your dashboard when active incidents occur within this radius.
              </span>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Safety Geofence"}
            </button>
          </form>
        </div>

        {/* Right Column: Contributor Badges & Reputation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card" style={{ padding: "1.75rem", textAlign: "center", borderTop: "5px solid #fbbf24" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "8px" }}>🎖️</div>
            <span className="trust-badge community" style={{ fontSize: "0.85rem" }}>
              {profile?.badge_title || "Community Watcher"}
            </span>
            <h2 style={{ fontSize: "2rem", margin: "12px 0 4px" }}>
              {profile?.reputation_score || 10} Points
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
              Community Contributor Reputation
            </p>
          </div>

          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem" }}>🏅 Reputation Ranks</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: profile?.reputation_score >= 10 ? 1 : 0.4 }}>
                <span>🌱 Community Watcher</span>
                <strong>10 pts</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: profile?.reputation_score >= 25 ? 1 : 0.4 }}>
                <span>🔍 Verified Scout</span>
                <strong>25 pts</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: profile?.reputation_score >= 50 ? 1 : 0.4 }}>
                <span>🛡️ Forest Sentinel</span>
                <strong>50 pts</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: profile?.reputation_score >= 100 ? 1 : 0.4 }}>
                <span>👑 Master Guardian</span>
                <strong>100 pts</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
