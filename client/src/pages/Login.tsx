import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const nextPath = new URLSearchParams(window.location.search).get("next") || "/wavvadmin";

  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      // Pre-populate auth.me cache with the user returned from login so the
      // destination page sees an authenticated user immediately on mount —
      // no second network request, no second loading flash.
      if (data?.user) {
        utils.auth.me.setData(undefined, data.user as Parameters<typeof utils.auth.me.setData>[1]);
      }
      const role = data?.user?.role;
      if (role === "partner_admin" || role === "partner") {
        navigate("/wavvpartner");
      } else {
        navigate(nextPath);
      }
    },
    onError: (err) => {
      // If user exists but has no password yet, guide them to set one
      if (err.message?.toLowerCase().includes("no password") || err.message?.toLowerCase().includes("set a password")) {
        setError("Your account doesn't have a password yet. Use your invite link to set one, or contact your admin to resend it.");
      } else {
        setError(err.message || "Invalid email or password.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password) { setError("Please enter your password."); return; }
    loginMutation.mutate({ email: email.trim().toLowerCase(), password });
  };

  const inputBase = "w-full rounded-lg px-4 py-3 text-sm text-white outline-none transition-all pl-10";
  const inputStyle = {
    background: "#0d1117",
    border: `1px solid ${error ? "rgba(248,81,73,0.5)" : "rgba(255,255,255,0.12)"}`,
    fontFamily: "inherit",
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
            <p className="text-white font-semibold text-lg text-center mb-1">Sign In</p>
            <p className="text-sm text-center" style={{ color: "#8b949e" }}>
              Enter your email and password to access the portal.
            </p>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#8b949e" }}>
              Work Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8b949e" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@wavv.com"
                autoFocus
                autoComplete="email"
                className={inputBase}
                style={inputStyle}
                onFocus={(e) => { if (!error) e.target.style.borderColor = "#0074F4"; }}
                onBlur={(e) => { if (!error) e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#8b949e" }}>
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8b949e" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Your password"
                autoComplete="current-password"
                className={`${inputBase} pr-10`}
                style={inputStyle}
                onFocus={(e) => { if (!error) e.target.style.borderColor = "#0074F4"; }}
                onBlur={(e) => { if (!error) e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#8b949e" }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
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
            disabled={loginMutation.isPending}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity"
            style={{
              background: "linear-gradient(135deg, #0074F4, #0056b3)",
              opacity: loginMutation.isPending ? 0.6 : 1,
            }}
          >
            {loginMutation.isPending ? "Signing in…" : "Sign In →"}
          </button>

          <p className="text-xs text-center" style={{ color: "#8b949e" }}>
            Access requires an active account. Contact your WAVV admin to request access.
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
