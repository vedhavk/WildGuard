"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, getCurrentPosition, reverseGeocode } from "@/lib/api";
import { Eye, EyeOff, MapPin, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoFetching, setGeoFetching] = useState(true);
  const [geoStatus, setGeoStatus] = useState("Fetching location...");

  // Auto-fetch location on mount
  useEffect(() => {
    async function fetchLocation() {
      try {
        const pos = await getCurrentPosition();
        const { lat, lng } = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        const geo = await reverseGeocode(lat, lng);
        setForm((prev) => ({ ...prev, location: geo.pincode }));
        setGeoStatus(`Location detected: Pincode ${geo.pincode}`);
      } catch (err) {
        setGeoStatus(err.message || "Could not auto-detect location — enter pincode manually");
      } finally {
        setGeoFetching(false);
      }
    }
    fetchLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(form);
      // Redirect to sign in page after successful registration
      window.location.href = "/login";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        {/* Header */}
        <div className="auth-header">
          <h1>Join Wild Guard</h1>
          <p className="subtitle">Create your account to protect your community</p>
        </div>

        {/* Location Auto-detect Status Line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "#8B9598",
            marginBottom: "1.25rem",
            background: "#181D1F",
            border: "1px solid #2A3134",
            padding: "6px 10px",
            borderRadius: "4px",
          }}
        >
          {geoFetching ? (
            <Loader2 size={13} className="spin" style={{ color: "#7FA084" }} />
          ) : (
            <MapPin size={13} style={{ color: "#7FA084" }} />
          )}
          <span>{geoStatus}</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="mono-code"
            style={{
              marginBottom: "1rem",
              padding: "8px 12px",
              background: "var(--red-bg)",
              border: "1px solid var(--red-border)",
              color: "var(--red-text)",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="auth-form-group">
            <label className="mono-label" style={{ color: "#767F82", display: "block", marginBottom: "6px" }}>
              FULL NAME
            </label>
            <input
              id="register-name"
              type="text"
              className="auth-input"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="auth-form-group">
            <label className="mono-label" style={{ color: "#767F82", display: "block", marginBottom: "6px" }}>
              EMAIL ADDRESS
            </label>
            <input
              id="register-email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div className="auth-form-group">
            <label className="mono-label" style={{ color: "#767F82", display: "block", marginBottom: "6px" }}>
              PASSWORD
            </label>
            <div className="auth-input-wrapper">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                className="auth-input auth-input-icon-right"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="auth-form-group">
            <label className="mono-label" style={{ color: "#767F82", display: "block", marginBottom: "6px" }}>
              PHONE NUMBER
            </label>
            <input
              id="register-phone"
              type="tel"
              className="auth-input"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          {/* Pincode (auto-detected) */}
          <div className="auth-form-group">
            <label className="mono-label" style={{ color: "#767F82", display: "block", marginBottom: "6px" }}>
              PINCODE (AUTO-DETECTED)
            </label>
            <div className="auth-input-wrapper">
              <MapPin size={15} className="input-icon-left" />
              <input
                id="register-pincode"
                type="text"
                className="auth-input auth-input-icon-left"
                placeholder="560001"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="register-submit"
            type="submit"
            className="auth-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" /> Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer Link Row */}
        <p className="auth-switch">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
