import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ShieldCheck, KeyRound } from "lucide-react";

export default function MfaSetup() {
  const [, navigate] = useLocation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Setup token comes from URL: /mfa-setup?token=...
  const setupToken = new URLSearchParams(window.location.search).get("token") ?? "";

  // Fetch QR code from server using the setup token
  const { data, isLoading, isError } = trpc.auth.getMfaSetupData.useQuery(
    { setupToken },
    { enabled: !!setupToken, retry: false }
  );

  const utils = trpc.useUtils();

  const verifyMutation = trpc.auth.verifyMfaSetupByToken.useMutation({
    onSuccess: async (result) => {
      if (result?.user) {
        utils.auth.me.setData(undefined, result.user as Parameters<typeof utils.auth.me.setData>[1]);
      }
      setSuccess(true);
      setTimeout(() => {
        const role = result?.user?.role;
        if (role === "partner_manager" || role === "partner") {
          navigate("/wavvpartner");
        } else {
          navigate("/wavvcommandcenter");
        }
      }, 1500);
    },
    onError: (err) => {
      setError(err.message || "Invalid code. Please try again.");
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
    verifyMutation.mutate({ setupToken, code: trimmed });
  };

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    const trimmed = code.replace(/\s/g, "");
    if (trimmed.length === 6 && /^\d{6}$/.test(trimmed)) {
      setError("");
      verifyMutation.mutate({ setupToken, code: trimmed });
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

  if (!setupToken) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d1117" }}>
        <p className="text-sm" style={{ color: "#f85149" }}>Invalid setup link. Contact your admin.</p>
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
          <p className="text-sm" style={{ color: "#8b949e" }}>Success Center — Two-Factor Setup</p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-sm" style={{ color: "#8b949e" }}>Loading setup…</p>
          </div>
        )}

        {isError && (
          <div className="rounded-lg px-4 py-3 text-sm text-center" style={{ background: "rgba(248,81,73,0.12)", color: "#f85149" }}>
            This setup link is invalid or has expired. Ask your admin to generate a new one.
          </div>
        )}

        {data && !success && (
          <>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={16} style={{ color: "#0074F4" }} />
                <p className="text-white font-semibold text-base">Set Up Google Authenticator</p>
              </div>
              <p className="text-sm" style={{ color: "#8b949e" }}>
                Scan this QR code with the <strong style={{ color: "#c9d1d9" }}>Google Authenticator</strong> app on your phone, then enter the 6-digit code below to confirm.
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="rounded-xl p-3" style={{ background: "#ffffff" }}>
                <img src={data.qrDataUrl} alt="MFA QR Code" className="w-48 h-48" />
              </div>
            </div>

            {/* Manual entry fallback */}
            <details className="text-xs" style={{ color: "#8b949e" }}>
              <summary className="cursor-pointer hover:text-white transition-colors">Can't scan? Enter code manually</summary>
              <div className="mt-2 rounded-lg px-3 py-2 font-mono text-xs break-all" style={{ background: "#0d1117", color: "#c9d1d9", border: "1px solid rgba(255,255,255,0.08)" }}>
                {data.secret}
              </div>
              <p className="mt-1" style={{ color: "#8b949e" }}>
                In Google Authenticator: tap + → Enter a setup key → paste the code above.
              </p>
            </details>

            {/* Code entry */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium flex items-center gap-1" style={{ color: "#8b949e" }}>
                  <KeyRound size={12} />
                  Verification Code
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
                {verifyMutation.isPending ? "Verifying…" : "Confirm & Activate →"}
              </button>
            </form>
          </>
        )}

        {success && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(63,185,80,0.15)" }}>
              <ShieldCheck size={24} style={{ color: "#3fb950" }} />
            </div>
            <p className="text-white font-semibold">Two-factor authentication enabled!</p>
            <p className="text-sm text-center" style={{ color: "#8b949e" }}>Redirecting you to the admin panel…</p>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs" style={{ color: "#484f58" }}>
        © {new Date().getFullYear()} WAVV. All rights reserved.
      </p>
    </div>
  );
}
