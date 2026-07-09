/**
 * UpdateBanner
 *
 * Shown when useVersionCheck detects a new deployment.
 *
 * Behavior:
 * - Counts down from 10 seconds, then auto-refreshes.
 * - If the user moves their mouse or presses a key within the last 30 seconds,
 *   the countdown resets and waits until they've been idle for 30 seconds.
 * - "Refresh Now" button triggers an immediate reload.
 * - No dismiss option — the goal is to ensure everyone is on the latest version.
 */
import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

const COUNTDOWN_SECONDS = 10;
const ACTIVITY_DELAY_MS = 30_000; // 30 seconds idle before auto-refresh fires

interface UpdateBannerProps {
  deployedAt: string | null;
}

export function UpdateBanner({ deployedAt }: UpdateBannerProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const lastActivityRef = useRef<number>(Date.now());
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track user activity
  useEffect(() => {
    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };
    window.addEventListener("mousemove", recordActivity, { passive: true });
    window.addEventListener("keydown", recordActivity, { passive: true });
    window.addEventListener("touchstart", recordActivity, { passive: true });
    return () => {
      window.removeEventListener("mousemove", recordActivity);
      window.removeEventListener("keydown", recordActivity);
      window.removeEventListener("touchstart", recordActivity);
    };
  }, []);

  // Countdown logic — resets if user was recently active
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;

      if (idleMs < ACTIVITY_DELAY_MS) {
        // User is active — reset countdown
        setCountdown(COUNTDOWN_SECONDS);
        return;
      }

      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1_000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const deployTime = deployedAt
    ? new Date(deployedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-4 px-4 py-2.5"
      style={{
        background: "linear-gradient(90deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
        borderBottom: "1px solid rgba(59,130,246,0.4)",
        boxShadow: "0 2px 12px rgba(59,130,246,0.2)",
      }}
    >
      {/* Left: icon + message */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
          <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: "2s" }} />
        </div>
        <div className="min-w-0">
          <span className="text-white text-sm font-semibold">New version deployed</span>
          {deployTime && (
            <span className="text-blue-300 text-xs ml-2">at {deployTime}</span>
          )}
          <span className="text-slate-400 text-xs ml-2 hidden sm:inline">
            — refreshing in{" "}
            <span className="text-white font-mono font-bold tabular-nums">{countdown}s</span>
            {" "}(paused while you're active)
          </span>
        </div>
      </div>

      {/* Right: countdown pill + refresh button */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Mobile countdown */}
        <span className="text-white font-mono text-sm font-bold tabular-nums sm:hidden">
          {countdown}s
        </span>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            border: "1px solid rgba(96,165,250,0.4)",
          }}
        >
          <RefreshCw className="w-3 h-3" />
          Refresh Now
        </button>
      </div>
    </div>
  );
}
