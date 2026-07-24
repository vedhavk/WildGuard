"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, loginAdmin } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({ email: "", password: "" });
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
      <div className="card auth-card fade-in">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to Wild Guard</p>

        <div className="role-toggle">
          <button
            className={role === "user" ? "active" : ""}
            onClick={() => setRole("user")}
          >
            User
          </button>
          <button
            className={role === "admin" ? "active" : ""}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
        </div>

        {error && <div className="alert-box alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="login-email"
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
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <Link href="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
