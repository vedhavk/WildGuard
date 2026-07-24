"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  uploadImage,
  getCurrentPosition,
  reverseGeocode,
} from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState("Fetching your location...");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Check auth
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, [router]);

  // Fetch GPS on mount
  useEffect(() => {
    async function fetchGeo() {
      try {
        const pos = await getCurrentPosition();
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const geo = await reverseGeocode(lat, lng);
        setLocation({ lat, lng, pincode: geo.pincode, address: geo.address });
        setGeoStatus("Location acquired");
      } catch (err) {
        setGeoStatus(err.message || "Could not get location. Please enable GPS.");
      }
    }
    fetchGeo();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return setError("Please select an image");
    if (!location) return setError("Location not available yet");

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await uploadImage(
        file,
        location.lat,
        location.lng,
        location.pincode
      );
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="section-header fade-in" style={{ textAlign: "center" }}>
        <h1>Upload Wildlife Image</h1>
        <p>Select or capture a photo to analyze for wild animals</p>
      </div>

      {/* Location bar */}
      {location && (
        <div className="location-bar fade-in">
          <div className="loc-item">
            <span className="loc-value">{location.pincode}</span>
          </div>
          <div className="loc-item">
            {" "}
            <span className="loc-value">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </div>
          <div
            className="loc-item"
            style={{ flex: 1, fontSize: "0.8rem", color: "var(--text-muted)" }}
          >
            {location.address}
          </div>
        </div>
      )}

      {!location && (
        <div className="alert-box alert-warning fade-in">{geoStatus}</div>
      )}

      {/* Upload zone */}
      <div
        className={`upload-zone fade-in ${file ? "active" : ""}`}
        onClick={() => fileRef.current?.click()}
      >
        <input
          id="file-input"
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="upload-zone-preview" />
        ) : (
          <>
            <div className="upload-zone-icon">Upload</div>
            <div className="upload-zone-text">
              Click to select an image or take a photo
            </div>
          </>
        )}
      </div>

      {file && (
        <p
          style={{
            textAlign: "center",
            marginTop: "0.75rem",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
          }}
        >
          {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="alert-box alert-error" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        id="upload-submit"
        className="btn btn-primary btn-full"
        style={{ marginTop: "1.5rem" }}
        disabled={loading || !file || !location}
        onClick={handleUpload}
      >
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>

      {/* Result */}
      {result && (
        <div
          className={`card fade-in`}
          style={{
            marginTop: "2rem",
            borderLeft: `4px solid ${result.status === "alert" ? "var(--accent)" : "var(--success)"
              }`,
          }}
        >
          {result.status === "alert" ? (
            <>
              <h2 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>
                Wild Animal Detected!
              </h2>
              <p style={{ marginBottom: "0.5rem" }}>{result.message}</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Confidence:{" "}
                <strong>{(result.confidence * 100).toFixed(1)}%</strong>
              </p>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  marginBottom: "1rem",
                }}
              >
                Email alerts have been sent to all users in pincode{" "}
                <strong>{location.pincode}</strong>
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => router.push(`/alert/${result.alert_id}`)}
              >
                View on Map
              </button>
            </>
          ) : (
            <>
              <h2 style={{ color: "var(--success)", marginBottom: "0.5rem" }}>
                All Clear
              </h2>
              <p>{result.message}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
