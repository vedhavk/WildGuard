/**
 * Offline-first safety storage engine for Wild Guard.
 * Caches emergency safety guides, hotlines, local alerts, and queues offline reports.
 */

const SAFETY_GUIDES_KEY = "wg_offline_safety_guides";
const EMERGENCY_CONTACTS_KEY = "wg_offline_emergency_contacts";
const OFFLINE_QUEUE_KEY = "wg_offline_report_queue";

export const DEFAULT_SAFETY_GUIDES = [
  {
    id: "elephant",
    species: "Wild Elephant",
    precautions: [
      "Maintain a safe distance of at least 100 meters.",
      "Do not make sudden loud movements or flash lights.",
      "Do not attempt to obstruct their movement corridor.",
      "If charged, move downwind and climb high terrain or stay inside a sturdy structure.",
    ],
    emergencyCall: "1800-FOREST-01",
  },
  {
    id: "leopard_tiger",
    species: "Leopard / Tiger",
    precautions: [
      "Never run away as it triggers predatory chase instincts.",
      "Back away slowly while facing the animal without staring directly into its eyes.",
      "Make yourself look larger by raising your arms or holding a jacket above your head.",
      "Make firm, loud noises to deter the animal.",
    ],
    emergencyCall: "1800-FOREST-02",
  },
  {
    id: "wild_boar",
    species: "Wild Boar",
    precautions: [
      "Avoid cornering a boar or getting between a sow and her piglets.",
      "Step behind a thick tree or climb elevated boulders if charged.",
      "Keep pet dogs secured on a leash.",
    ],
    emergencyCall: "1800-FOREST-03",
  },
];

export const DEFAULT_EMERGENCY_CONTACTS = [
  { name: "Forest Control Room Hotline", phone: "+91 1800-425-4700", type: "Official 24/7" },
  { name: "Wildlife Quick Response Team (QRT)", phone: "+91 9447-979-900", type: "Emergency Dispatch" },
  { name: "Local Forest Range Office", phone: "+91 484-252-3344", type: "Regional Sector" },
  { name: "State Emergency Services", phone: "112", type: "Toll-Free Emergency" },
];

export function getCachedSafetyGuides() {
  if (typeof window === "undefined") return DEFAULT_SAFETY_GUIDES;
  const stored = localStorage.getItem(SAFETY_GUIDES_KEY);
  if (!stored) {
    localStorage.setItem(SAFETY_GUIDES_KEY, JSON.stringify(DEFAULT_SAFETY_GUIDES));
    return DEFAULT_SAFETY_GUIDES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_SAFETY_GUIDES;
  }
}

export function getCachedEmergencyContacts() {
  if (typeof window === "undefined") return DEFAULT_EMERGENCY_CONTACTS;
  const stored = localStorage.getItem(EMERGENCY_CONTACTS_KEY);
  if (!stored) {
    localStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(DEFAULT_EMERGENCY_CONTACTS));
    return DEFAULT_EMERGENCY_CONTACTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_EMERGENCY_CONTACTS;
  }
}

export function getOfflineQueue() {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
  try {
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function queueOfflineReport(reportData) {
  if (typeof window === "undefined") return;
  const queue = getOfflineQueue();
  queue.push({ ...reportData, queuedAt: new Date().toISOString() });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}
