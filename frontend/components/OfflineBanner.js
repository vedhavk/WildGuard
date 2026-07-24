"use client";

import { useEffect, useState } from "react";
import { getOfflineQueue } from "@/lib/offlineStore";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
      setQueueCount(getOfflineQueue().length);
    }

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      setQueueCount(getOfflineQueue().length);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  if (!isOffline && queueCount === 0) return null;

  return (
    <div className="offline-banner">
      <span>📡</span>
      <span>
        {isOffline
          ? "You are currently OFFLINE. Offline Safety Guides & Contacts are active."
          : `Online. ${queueCount} report(s) ready to synchronize.`}
      </span>
    </div>
  );
}
