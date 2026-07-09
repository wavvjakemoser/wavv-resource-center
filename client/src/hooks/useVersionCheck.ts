/**
 * useVersionCheck
 *
 * Polls /api/version every 60 seconds. When the server returns a different
 * version hash than the one seen at page load, sets `updateAvailable = true`.
 *
 * The UpdateBanner component reads this flag and drives the auto-refresh UI.
 */
import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 60_000; // 60 seconds

interface VersionResponse {
  version: string;
  deployedAt: string;
  autoRefreshEnabled?: boolean;
}

export function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deployedAt, setDeployedAt] = useState<string | null>(null);
  const baselineVersion = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchVersion(): Promise<string | null> {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return null;
        const data: VersionResponse = await res.json();
        return data.version;
      } catch {
        return null;
      }
    }

    async function checkVersion() {
      const version = await fetchVersion();
      if (!version || cancelled) return;

      if (baselineVersion.current === null) {
        // First call — record the version the client loaded with
        baselineVersion.current = version;
        return;
      }

      if (version !== baselineVersion.current) {
        // Server has been redeployed since this client loaded.
        // Re-fetch to get autoRefreshEnabled and deployedAt.
        try {
          const res2 = await fetch("/api/version", { cache: "no-store" });
          const data: VersionResponse = await res2.json();
          setDeployedAt(data.deployedAt);
          // If auto-refresh is disabled in Command Center, do nothing.
          if (data.autoRefreshEnabled === false) return;
        } catch {
          // ignore — proceed with update notification
        }
        if (!cancelled) setUpdateAvailable(true);
      }
    }

    // Run immediately on mount to capture the baseline
    checkVersion();

    const interval = setInterval(checkVersion, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { updateAvailable, deployedAt };
}
