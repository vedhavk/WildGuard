"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUsers } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (!localStorage.getItem("token") || role !== "admin") {
      router.push("/login");
      return;
    }

    async function fetchUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [router]);

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page-container">
      <div className="section-header fade-in">
        <h1> Admin Dashboard</h1>
        <p>Manage registered users across all areas</p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
        className="fade-in"
      >
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--accent)" }}>
            {users.length}
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Registered Users
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              color: "var(--accent-2)",
            }}
          >
            {new Set(users.map((u) => u.location).filter(Boolean)).size}
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Active Pincodes
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-state-icon"></div>
          <h3>No users registered yet</h3>
          <p>Users will appear here once they sign up.</p>
        </div>
      ) : (
        <div className="table-wrapper fade-in">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Pincode</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>#{user.user_id}</td>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {user.email}
                  </td>
                  <td>{user.phone}</td>
                  <td>
                    <span className="badge badge-success">
                      {user.location || "—"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "—"}
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
