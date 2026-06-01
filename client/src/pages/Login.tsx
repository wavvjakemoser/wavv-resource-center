import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const nextPath = new URLSearchParams(window.location.search).get("next") || "/wavvadmin";

  const checkEmail = trpc.auth.checkEmail.useMutation({
    onSuccess: () => {
      navigate(nextPath);
    },
    onError: (err) => {
      setError(err.message || "No account found for this email. Contact your admin if you need access.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    checkEmail.mutate({ email: email.trim().toLowerCase() });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#0d1117", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Card */}
      <div
        className="w-full max-w-md rounded-2xl p-8 flex flex-col gap-6"
        style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <img
            src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
            alt="WAVV"
            className="h-8 w-auto"
          />
          <p className="text-sm" style={{ color: "#8b949e" }}>Success Center — Team Access</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="text-white font-semibold text-lg text-center mb-1">Team Login</p>
            <p className="text-sm text-center" style={{ color: "#8b949e" }}>
              Enter your work email to sign in. Access requires an active account.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#8b949e" }}>
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@wavv.com"
              autoFocus
              className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none transition-all"
              style={{
                background: "#0d1117",
                border: `1px solid ${error ? "rgba(248,81,73,0.5)" : "rgba(255,255,255,0.12)"}`,
                fontFamily: "inherit",
              }}
              onFocus={(e) => { if (!error) e.target.style.borderColor = "#0074F4"; }}
              onBlur={(e) => { if (!error) e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
            />
          </div>

          {error && (
            <p
              className="text-xs rounded-lg px-3 py-2"
              style={{ background: "rgba(248,81,73,0.12)", color: "#f85149" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={checkEmail.isPending}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity"
            style={{
              background: "linear-gradient(135deg, #0074F4, #0056b3)",
              opacity: checkEmail.isPending ? 0.6 : 1,
            }}
          >
            {checkEmail.isPending ? "Verifying…" : "Sign In →"}
          </button>

          <p className="text-xs text-center" style={{ color: "#8b949e" }}>
            This page requires access. Contact your WAVV admin to request an invitation.
          </p>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs" style={{ color: "#484f58" }}>
        © {new Date().getFullYear()} WAVV. All rights reserved.
      </p>
    </div>
  );
}
