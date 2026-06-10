import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ShieldCheck, Lock } from "lucide-react";

/**
 * MfaRequired — shown when a user has a valid session but mfaPending=true.
 * They must complete MFA setup before accessing any portal page.
 * This page auto-initiates the setup token and redirects to /mfa-setup.
 */
export default function MfaRequired() {
  const [, navigate] = useLocation();
  const [error, setError] = useState("");

  const initiateMutation = trpc.auth.initiateMfaSetupForSelf.useMutation({
    onSuccess: (data) => {
      navigate(`/mfa-setup?token=${data.setupToken}`);
    },
    onError: (err) => {
      setError(err.message || "Failed to start MFA setup. Please try again.");
    },
  });

  // Auto-trigger on mount
  useEffect(() => {
    initiateMutation.mutate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#0d1117", fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 flex flex-col gap-6 items-center text-center"
        style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Logo */}
        <img
          src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
          alt="WAVV"
          className="h-8 w-auto"
        />

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(0,116,244,0.15)", border: "1px solid rgba(0,116,244,0.3)" }}
        >
          {initiateMutation.isPending ? (
            <div className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          ) : error ? (
            <Lock size={28} style={{ color: "#f85149" }} />
          ) : (
            <ShieldCheck size={28} style={{ color: "#0074F4" }} />
          )}
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-white text-xl font-bold">Two-Factor Authentication Required</h1>
          <p className="text-sm leading-relaxed" style={{ color: "#8b949e" }}>
            Access to the <strong style={{ color: "#c9d1d9" }}>WAVV Success Center</strong> requires
            two-factor authentication. You will be redirected to set up Google Authenticator now.
          </p>
        </div>

        {/* Status */}
        {initiateMutation.isPending && (
          <p className="text-sm" style={{ color: "#8b949e" }}>Preparing your setup link…</p>
        )}

        {error && (
          <div className="w-full rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(248,81,73,0.12)", color: "#f85149", border: "1px solid rgba(248,81,73,0.3)" }}>
            {error}
            <button
              onClick={() => { setError(""); initiateMutation.mutate(); }}
              className="block mt-2 text-xs underline"
              style={{ color: "#f85149" }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Why this is required */}
        <div
          className="w-full rounded-xl p-4 text-left space-y-2"
          style={{ background: "rgba(0,116,244,0.06)", border: "1px solid rgba(0,116,244,0.15)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "#0074F4" }}>Why is this required?</p>
          <p className="text-xs leading-relaxed" style={{ color: "#8b949e" }}>
            Admin accounts have direct edit access to the WAVV Success Center. Two-factor authentication
            protects your account and all content from unauthorized access.
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs" style={{ color: "#484f58" }}>
        © {new Date().getFullYear()} WAVV. All rights reserved.
      </p>
    </div>
  );
}
