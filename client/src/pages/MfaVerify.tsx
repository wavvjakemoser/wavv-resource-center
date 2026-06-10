import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ShieldCheck, KeyRound } from "lucide-react";

export default function MfaVerify() {
  const [, navigate] = useLocation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  // Challenge token and next path come from URL params
  const params = new URLSearchParams(window.location.search);
  const challengeToken = params.get("challenge") ?? "";
  const nextPath = params.get("next") ?? "/wavvadmin";

  const utils = trpc.useUtils();

  const verifyMutation = trpc.auth.verifyMfaLogin.useMutation({
    onSuccess: async (result) => {
      if (result?.user) {
        utils.auth.me.setData(undefined, result.user as Parameters<typeof utils.auth.me.setData>[1]);
      }
      const role = result?.user?.role;
      if (role === "partner_admin" || role === "partner") {
        navigate("/wavvpartner");
      } else {
        navigate(nextPath);
      }
    },
    onError: (err) => {
      setError(err.message || "Invalid code. Please try again.");
      setCode("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = code.replace(/\s/g, "");
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setError("Please enter the 6-digit code from your Authenticator app.");
      return;
    }
    verifyMutation.mutate({ challengeToken, code: trimmed });
  };

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    const trimmed = code.replace(/\s/g, "");
    if (trimmed.length === 6 && /^\d{6}$/.test(trimmed) && !verifyMutation.isPending) {
      setError("");
      verifyMutation.mutate({ challengeToken, code: trimmed });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const inputBase = "w-full rounded-lg px-4 py-3 text-sm text-white outline-none transition-all text-center tracking-widest text-lg font-mono";
  const inputStyle = {
    background: "#0d1117",
    border: `1px solid ${error ? "rgba(248,81,73,0.5)" : "rgba(255,255,255,0.12)"}`,
    fontFamily: "inherit",
    letterSpacing: "0.3em",
  };

  if (!challengeToken) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d1117" }}>
        <p className="text-sm" style={{ color: "#f85149" }}>Session expired. Please <a href="/login" style={{ color: "#0074F4" }}>sign in again</a>.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#0d1117", fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 flex flex-col gap-6"
        style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Logo + header */}
        <div className="flex flex-col items-center gap-2">
          <img
            src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
            alt="WAVV"
            className="h-8 w-auto"
          />
          <p className="text-sm" style={{ color: "#8b949e" }}>Success Center — Two-Factor Verification</p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} style={{ color: "#0074F4" }} />
            <p className="text-white font-semibold text-base">Enter Authentication Code</p>
          </div>
          <p className="text-sm" style={{ color: "#8b949e" }}>
            Open <strong style={{ color: "#c9d1d9" }}>Google Authenticator</strong> on your phone and enter the 6-digit code for <strong style={{ color: "#c9d1d9" }}>WAVV Success Center</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium flex items-center gap-1" style={{ color: "#8b949e" }}>
              <KeyRound size={12} />
              6-Digit Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
              placeholder="000000"
              autoFocus
              autoComplete="one-time-code"
              className={inputBase}
              style={inputStyle}
              onFocus={(e) => { if (!error) e.target.style.borderColor = "#0074F4"; }}
              onBlur={(e) => { if (!error) e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
            />
          </div>

          {error && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ background: "rgba(248,81,73,0.12)", color: "#f85149" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={verifyMutation.isPending || code.length < 6}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity"
            style={{
              background: "linear-gradient(135deg, #0074F4, #0056b3)",
              opacity: verifyMutation.isPending || code.length < 6 ? 0.5 : 1,
            }}
          >
            {verifyMutation.isPending ? "Verifying…" : "Verify →"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-xs text-center transition-colors"
            style={{ color: "#8b949e" }}
          >
            ← Back to sign in
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs" style={{ color: "#484f58" }}>
        © {new Date().getFullYear()} WAVV. All rights reserved.
      </p>
    </div>
  );
}
