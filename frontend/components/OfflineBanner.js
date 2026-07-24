"use client";

import { useEffect, useState } from "react";
import { getOfflineQueue } from "@/lib/offlineStore";
import { WifiOff, RefreshCw } from "lucide-react";

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
      {isOffline ? <WifiOff size={14} /> : <RefreshCw size={14} />}
      <span>
        {isOffline
          ? "SYSTEM OFFLINE: OPERATING FROM LOCAL CACHED FIELD PROTOCOLS AND CONTACTS"
          : `NETWORK RESTORED: ${queueCount} PENDING SIGHTING RECORD(S) READY TO SYNCHRONIZE.`}
      </span>
    </div>
  );
}
