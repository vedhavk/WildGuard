"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, getCurrentPosition, reverseGeocode } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
        setGeoStatus(`Pincode: ${geo.pincode}`);
      } catch (err) {
        setGeoStatus(err.message || "Could not get location — enter pincode manually");
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
      <div className="card auth-card fade-in">
        <h1>Join Wild Guard</h1>
        <p className="subtitle">Create your account to protect your community</p>

        <div
          className="alert-box"
          style={{
            background: "rgba(83,52,131,0.12)",
            border: "1px solid rgba(83,52,131,0.3)",
            color: "#a78bfa",
          }}
        >
          {geoStatus}
        </div>

        {error && <div className="alert-box alert-error"> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              id="register-name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="register-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="register-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              id="register-phone"
              type="tel"
              className="form-input"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pincode (auto-detected)</label>
            <input
              id="register-pincode"
              type="text"
              className="form-input"
              placeholder="560001"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
