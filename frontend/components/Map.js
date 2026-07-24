"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Map({ latitude, longitude, animal, events = [], radiusKm = 3.0, zoom = 13 }) {
  const centerLat = latitude || (events.length > 0 ? events[0].latitude : 10.0);
  const centerLng = longitude || (events.length > 0 ? events[0].longitude : 76.5);
  const position = [centerLat, centerLng];

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Single event view */}
      {latitude && longitude && (
        <>
          <Marker position={[latitude, longitude]} icon={defaultIcon}>
            <Popup>
              <strong>🐾 {animal || "Wild Animal"} Incident</strong>
              <br />
              Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
            </Popup>
          </Marker>
          <Circle
            center={[latitude, longitude]}
            radius={radiusKm * 1000}
            pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.15 }}
          />
        </>
      )}

      {/* Multiple events array */}
      {events &&
        events.map((ev) => (
          <div key={ev.event_id}>
            <Marker position={[ev.latitude, ev.longitude]} icon={defaultIcon}>
              <Popup>
                <div style={{ padding: "4px" }}>
                  <h4 style={{ margin: "0 0 4px", color: "#059669" }}>{ev.title}</h4>
                  <p style={{ margin: "0 0 6px", fontSize: "0.85rem" }}>
                    Species: <strong>{ev.species}</strong>
                    <br />
                    Trust Score: <strong>{ev.trust_score}%</strong> ({ev.verification_status})
                  </p>
                  <a
                    href={`/events/${ev.event_id}`}
                    style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.85rem" }}
                  >
                    View Timeline & Event Workspace &rarr;
                  </a>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[ev.latitude, ev.longitude]}
              radius={2000}
              pathOptions={{
                color: ev.status === "active" ? "#ef4444" : "#f59e0b",
                fillColor: ev.status === "active" ? "#ef4444" : "#f59e0b",
                fillOpacity: 0.12,
              }}
            />
          </div>
        ))}
    </MapContainer>
  );
}
