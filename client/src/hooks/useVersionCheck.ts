/**
 * useVersionCheck
 *
 * Polls /api/version every 60 seconds. When the server returns a different
 * version hash than the one seen at page load, sets `updateAvailable = true`.
 *
 * The UpdateBanner component reads this flag and drives the auto-refresh UI.
 *
 * Design notes:
 * - Single fetch per poll cycle — no redundant second request.
 * - deployedAt and autoRefreshEnabled are read from the same response that
 *   detected the version change, so there is no race window.
 * - If autoRefreshEnabled is false (disabled in Command Center), the banner
 *   is never shown and the page is never auto-refreshed.
 * - The baseline is captured on the first successful fetch after mount, so
 *   the hook works correctly even if the server is briefly unreachable at load.
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

    async function fetchVersion(): Promise<VersionResponse | null> {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return null;
        return (await res.json()) as VersionResponse;
      } catch {
        return null;
      }
    }

    async function checkVersion() {
      const data = await fetchVersion();
      if (!data || cancelled) return;

      if (baselineVersion.current === null) {
        // First successful fetch — record the version the client loaded with.
        baselineVersion.current = data.version;
        return;
      }

      if (data.version !== baselineVersion.current) {
        // Server has been redeployed since this client loaded.
        // If auto-refresh is disabled in Command Center, do nothing.
        if (data.autoRefreshEnabled === false) return;

        setDeployedAt(data.deployedAt);
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
