"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Radio,
  FileText,
  BookOpen,
  Camera,
  User,
  LogOut,
  Activity,
} from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole");
    if (token && name) {
      setUser({ name, role });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <Shield size={18} style={{ color: "var(--accent-link)" }} />
          WILD<span>GUARD</span>
        </Link>

        <div className="navbar-links">
          <Link href="/">
            <Activity size={14} /> Dashboard
          </Link>
          <Link href="/events">
            <Radio size={14} /> Live Events
          </Link>
          <Link href="/intelligence">
            <FileText size={14} /> Stories
          </Link>
          <Link href="/safety-guides">
            <BookOpen size={14} /> Safety Guides
          </Link>

          {user ? (
            <>
              {user.role === "admin" ? (
                <Link
                  href="/authority"
                  style={{ color: "var(--sage-text)", fontWeight: 600 }}
                >
                  <Shield size={14} /> Authority Portal
                </Link>
              ) : (
                <>
                  <Link href="/upload" className="nav-btn-primary">
                    <Camera size={14} /> Quick Report
                  </Link>
                  <Link href="/profile">
                    <User size={14} /> Profile
                  </Link>
                </>
              )}

              <span
                className="mono-code"
                style={{
                  color: "var(--text-secondary)",
                  marginLeft: "8px",
                  fontSize: "12px",
                }}
              >
                {user.name}
              </span>
              <button
                onClick={logout}
                className="btn btn-outline"
                style={{ padding: "4px 10px", fontSize: "12px" }}
              >
                <LogOut size={13} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register" className="nav-btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
