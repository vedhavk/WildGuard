"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadImage, getCurrentPosition, reverseGeocode } from "@/lib/api";
import { PawPrint, X, MapPin, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [location, setLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState("Acquiring GPS location...");
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
        setGeoStatus("GPS Location Acquired");
      } catch (err) {
        setGeoStatus(err.message || "GPS location unavailable");
      }
    }
    fetchGeo();
  }, []);

  const handleFileSelect = (f) => {
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setError("");
    } else {
      setError("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleUpload = async () => {
    if (!file) return setError("Please select an image first");
    if (!location) return setError("GPS Location not available yet");

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

  const handleClose = () => {
    router.push("/");
  };

  return (
    <div className="modal-backdrop">
      <div className="upload-card-modal">
        {/* Header Row */}
        <div className="upload-modal-header">
          <h2>Upload Photos</h2>
          <button
            onClick={handleClose}
            className="upload-modal-close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Location Status Badge */}
        <div
          className="mono-code"
          style={{
            fontSize: "11px",
            color: location ? "var(--sage-text)" : "var(--amber-text)",
            background: location ? "var(--sage-bg)" : "var(--amber-bg)",
            border: `1px solid ${location ? "var(--sage-border)" : "var(--amber-border)"}`,
            padding: "4px 8px",
            borderRadius: "3px",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <MapPin size={12} />
          <span>
            {location
              ? `GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} | PIN: ${location.pincode}`
              : geoStatus}
          </span>
        </div>

        {/* Dropzone Container */}
        <label
          htmlFor="upload-file-input"
          className={`dropzone-container ${isDragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            id="upload-file-input"
            ref={fileRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {preview ? (
            <div style={{ textAlign: "center" }}>
              <img
                src={preview}
                alt="Selected preview"
                style={{
                  maxHeight: "180px",
                  maxWidth: "100%",
                  borderRadius: "4px",
                  border: "1px solid #2A3134",
                  marginBottom: "8px",
                }}
              />
              <div className="mono-code" style={{ fontSize: "11px", color: "#C7CDCE" }}>
                {file?.name} ({(file?.size / 1024).toFixed(1)} KB)
              </div>
            </div>
          ) : (
            <>
              {/* Icon Swatch Box */}
              <div className="icon-swatch-box">
                <PawPrint size={24} strokeWidth={1.5} color="#7FA084" />
              </div>

              {/* Primary Line */}
              <div className="dropzone-primary-text">
                Drop your image here, or <span className="browse-link">browse</span>
              </div>

              {/* Secondary Line */}
              <div className="dropzone-secondary-text">
                Supports: PNG, JPG, JPEG, WEBP
              </div>
            </>
          )}
        </label>

        {/* Error message */}
        {error && (
          <div
            className="mono-code"
            style={{
              marginTop: "0.85rem",
              padding: "8px 10px",
              background: "var(--red-bg)",
              border: "1px solid var(--red-border)",
              color: "var(--red-text)",
              borderRadius: "3px",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}

        {/* Analyze & Upload Action */}
        <button
          id="upload-submit"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "1rem", height: "36px" }}
          disabled={loading || !file || !location}
          onClick={handleUpload}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="spin" /> ANALYZING IMAGE...
            </>
          ) : (
            "UPLOAD & ANALYZE"
          )}
        </button>

        {/* Result Output */}
        {result && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: result.status === "alert" ? "var(--red-bg)" : "var(--sage-bg)",
              border: `1px solid ${result.status === "alert" ? "var(--red-border)" : "var(--sage-border)"}`,
              borderRadius: "4px",
            }}
          >
            {result.status === "alert" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--red-text)", fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                  <AlertTriangle size={16} /> WILD ANIMAL DETECTED
                </div>
                <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#ECEEEE" }}>{result.message}</p>
                <div className="mono-code" style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                  CONFIDENCE: {(result.confidence * 100).toFixed(1)}% | ALERT DISPATCHED
                </div>
                <button
                  className="btn btn-outline"
                  style={{ width: "100%", fontSize: "12px" }}
                  onClick={() => router.push(`/events/${result.event_id || result.alert_id}`)}
                >
                  VIEW INCIDENT TIMELINE & MAP &rarr;
                </button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--sage-text)", fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                  <CheckCircle2 size={16} /> ALL CLEAR
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#ECEEEE" }}>{result.message}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
