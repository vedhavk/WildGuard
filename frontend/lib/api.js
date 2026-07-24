const getApiBase = () => {
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:8000/api`;
  }
  return "http://localhost:8000/api";
};

/**
 * Helper to make authenticated API calls to the FastAPI backend.
 */
async function apiFetch(endpoint, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = { ...options.headers };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let res;
  try {
    res = await fetch(`${getApiBase()}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    console.warn(`API Connection error for ${endpoint}:`, err);
    throw new Error(`Unable to connect to backend server (${endpoint}). Please ensure backend is running.`);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────

export async function registerUser(data) {
  return apiFetch("/users/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data) {
  return apiFetch("/users/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginAdmin(data) {
  return apiFetch("/admin/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function seedAdmin(data) {
  return apiFetch("/admin/seed", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── User ─────────────────────────────────────────────────────

export async function getMe() {
  return apiFetch("/users/me");
}

// ── Admin ────────────────────────────────────────────────────

export async function getUsers() {
  return apiFetch("/admin/users");
}

// ── Upload ───────────────────────────────────────────────────

export async function uploadImage(file, latitude, longitude, pincode) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("latitude", latitude);
  formData.append("longitude", longitude);
  formData.append("pincode", pincode);

  return apiFetch("/upload", {
    method: "POST",
    body: formData,
  });
}

// ── Alerts ───────────────────────────────────────────────────

export async function getAlerts() {
  return apiFetch("/alerts/");
}

export async function getAlert(id) {
  // Public endpoint — no auth needed
  let res;
  try {
    res = await fetch(`${getApiBase()}/alerts/${id}`);
  } catch (err) {
    throw new Error("Unable to connect to backend server");
  }
  if (!res.ok) {
    throw new Error("Alert not found");
  }
  return res.json();
}

// ── Geolocation helpers ──────────────────────────────────────

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        let message;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied. Please allow location access in your browser settings and reload the page.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable. Please check your device's location services.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out. Please check your connection and try again.";
            break;
          default:
            message = "An unknown error occurred while fetching location.";
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // Accept cached position up to 5 minutes old
      }
    );
  });
}

export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      { headers: { "User-Agent": "WildGuard/1.0" } }
    );
    if (!res.ok) {
      console.warn("Reverse geocode request failed:", res.status);
      return { address: `${lat.toFixed(4)}, ${lon.toFixed(4)}`, pincode: "000000" };
    }
    const data = await res.json();
    const pincode =
      data.address?.postcode || data.address?.postal_code || "000000";
    return { address: data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`, pincode };
  } catch (err) {
    console.warn("Reverse geocode error:", err);
    return { address: `${lat.toFixed(4)}, ${lon.toFixed(4)}`, pincode: "000000" };
  }
}

// ── Wildlife Events ──────────────────────────────────────────

export async function getEvents(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/events/${query ? `?${query}` : ""}`);
}

export async function getEventDetail(id) {
  return apiFetch(`/events/${id}`);
}

export async function submitConfirmation(eventId, data) {
  return apiFetch(`/events/${eventId}/confirm`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getWildlifeIntelligence() {
  return apiFetch("/events/intelligence");
}

// ── User Safety Profiles ─────────────────────────────────────

export async function getUserProfile() {
  return apiFetch("/profile/me");
}

export async function updateUserProfile(data) {
  return apiFetch("/profile/me", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Authority Portal ─────────────────────────────────────────

export async function updateAuthorityStatus(eventId, data) {
  return apiFetch(`/authority/events/${eventId}/status`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createAuthorityBroadcast(data) {
  return apiFetch("/authority/broadcast", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAuthorityBroadcasts() {
  return apiFetch("/authority/broadcasts");
}

