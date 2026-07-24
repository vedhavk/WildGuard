"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, loginAdmin } from "@/lib/api";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginFn = role === "admin" ? loginAdmin : loginUser;
      const data = await loginFn(form);

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userRole", data.role);

      if (data.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/upload";
      }
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
          <h1>Welcome back</h1>
          <p className="subtitle">Sign in to Wild Guard</p>
        </div>

        {/* Role Toggle Switcher */}
        <div className="role-toggle">
          <button
            type="button"
            className={role === "user" ? "active" : ""}
            onClick={() => setRole("user")}
          >
            User
          </button>
          <button
            type="button"
            className={role === "admin" ? "active" : ""}
            onClick={() => setRole("admin")}
          >
            Admin / Officer
          </button>
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
          {/* Email Field */}
          <div className="auth-form-group">
            <label className="mono-label" style={{ color: "#767F82", display: "block", marginBottom: "6px" }}>
              EMAIL ADDRESS
            </label>
            <input
              id="login-email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password Field */}
          <div className="auth-form-group">
            <label className="mono-label" style={{ color: "#767F82", display: "block", marginBottom: "6px" }}>
              PASSWORD
            </label>
            <div className="auth-input-wrapper">
              <input
                id="login-password"
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

          {/* Submit Button */}
          <button
            id="login-submit"
            type="submit"
            className="auth-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" /> Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer Link Row */}
        <p className="auth-switch">
          Don&apos;t have an account? <Link href="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
