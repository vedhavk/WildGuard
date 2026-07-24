"use client";

import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile, getCurrentPosition, reverseGeocode } from "@/lib/api";
import { User, MapPin, Sliders, Award, Shield } from "lucide-react";

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
        <h1><User size={18} inline style={{ marginRight: "6px" }} /> PERSONAL SAFETY GEOFENCE & CONTRIBUTOR BADGES</h1>
        <p>Private monitoring perimeter setup and reputation scoring</p>
      </div>

      <div className="alert-detail-grid">
        {/* Left Column: Safety Geofence Settings */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="section-header">
            <h2><MapPin size={16} inline style={{ marginRight: "6px" }} /> GEOFENCED SAFETY ROUTES</h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <label className="label">HOME / PRIMARY SECTOR LOCATION</label>
                <button
                  type="button"
                  onClick={handleAutoDetectHome}
                  className="mono-code"
                  style={{ background: "none", border: "none", color: "var(--accent-link)", cursor: "pointer", fontSize: "11px" }}
                >
                  <MapPin size={10} /> AUTO-DETECT GPS
                </button>
              </div>
              <input
                type="text"
                className="input"
                placeholder="E.G. FOREST EDGE ESTATE, SECTOR 4"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
              <div>
                <label className="label">HOME LATITUDE</label>
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
                <label className="label">HOME LONGITUDE</label>
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
              <label className="label">WORKPLACE / PATROL ROUTE</label>
              <input
                type="text"
                className="input"
                placeholder="E.G. TEA GARDEN PATROL ROUTE"
                value={workAddress}
                onChange={(e) => setWorkAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>SAFETY WARNING RADIUS</span>
                <span className="mono-code" style={{ color: "var(--amber-text)" }}>{alertRadiusKm} KM</span>
              </label>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                style={{ width: "100%", accentColor: "var(--accent-link)" }}
                value={alertRadiusKm}
                onChange={(e) => setAlertRadiusKm(e.target.value)}
              />
              <span className="mono-code" style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                ACTIVE THREAT ADVISORIES WILL TRIGGER WHEN INCIDENTS OCCUR WITHIN THIS PERIMETER.
              </span>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Sliders size={13} /> {saving ? "SAVING..." : "UPDATE SAFETY GEOFENCE"}
            </button>
          </form>
        </div>

        {/* Right Column: Contributor Badges & Reputation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card" style={{ padding: "1.5rem", textAlign: "center", borderTop: "3px solid var(--amber-text)" }}>
            <Award size={36} style={{ color: "var(--amber-text)", marginBottom: "8px" }} />
            <div style={{ marginBottom: "6px" }}>
              <span className="trust-badge community">
                {profile?.badge_title || "COMMUNITY WATCHER"}
              </span>
            </div>
            <div className="mono-code" style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--text-primary)", margin: "4px 0" }}>
              {profile?.reputation_score || 10} PTS
            </div>
            <p className="mono-label" style={{ margin: 0 }}>
              CONTRIBUTOR REPUTATION SCORE
            </p>
          </div>

          <div className="card" style={{ padding: "1.25rem" }}>
            <div className="mono-label" style={{ marginBottom: "12px" }}>REPUTATION RANKS</div>
            <div className="mono-code" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: profile?.reputation_score >= 10 ? 1 : 0.4 }}>
                <span>🌱 COMMUNITY WATCHER</span>
                <strong>10 PTS</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: profile?.reputation_score >= 25 ? 1 : 0.4 }}>
                <span>🔍 VERIFIED SCOUT</span>
                <strong>25 PTS</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: profile?.reputation_score >= 50 ? 1 : 0.4 }}>
                <span>🛡️ FOREST SENTINEL</span>
                <strong>50 PTS</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: profile?.reputation_score >= 100 ? 1 : 0.4 }}>
                <span>👑 MASTER GUARDIAN</span>
                <strong>100 PTS</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
