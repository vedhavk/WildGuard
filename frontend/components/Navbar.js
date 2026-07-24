"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
          🛡️ <span>Wild Guard</span>
        </Link>

        <div className="navbar-links">
          <Link href="/">Dashboard</Link>
          <Link href="/events">Live Events</Link>
          <Link href="/intelligence">Stories</Link>
          <Link href="/safety-guides">Safety Guides</Link>

          {user ? (
            <>
              {user.role === "admin" ? (
                <Link href="/authority" style={{ color: "#34d399", fontWeight: 700 }}>
                  🛡️ Authority Portal
                </Link>
              ) : (
                <>
                  <Link href="/upload" className="nav-btn-primary">
                    📸 Quick Report
                  </Link>
                  <Link href="/profile">Profile</Link>
                </>
              )}

              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginLeft: "6px" }}>
                {user.name}
              </span>
              <button onClick={logout} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                Logout
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
