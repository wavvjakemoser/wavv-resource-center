import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, AlertCircle, ArrowRight, GraduationCap, Video, FileText, Headphones } from "lucide-react";

// ── Shared input styles ──────────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  fontFamily: "'Inter', sans-serif",
  color: "#fff",
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function inputFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#0074F4";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,116,244,0.18)";
}
function inputBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
  e.currentTarget.style.boxShadow = "none";
}

// ── Feature pills ────────────────────────────────────────────────────────────
const features = [
  { icon: GraduationCap, label: "WAVV Academy", color: "#0074F4" },
  { icon: Video,         label: "Live & On-Demand Webinars", color: "#00A9E2" },
  { icon: FileText,      label: "Guides & Docs", color: "#67C728" },
  { icon: Headphones,    label: "Dedicated Support", color: "#a78bfa" },
];

export default function Home() {
  const [, navigate] = useLocation();
  const { data: user, isLoading: authLoading } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "register">("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState("");

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowModal(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => { await utils.auth.me.invalidate(); navigate("/dashboard"); },
    onError: (err) => setLoginError(err.message || "Invalid email or password."),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => { await utils.auth.me.invalidate(); navigate("/dashboard"); },
    onError: (err) => setRegError(err.message || "Registration failed."),
  });

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!email || !password) { setLoginError("Please enter your email and password."); return; }
    loginMutation.mutate({ email: email.trim().toLowerCase(), password });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regName.trim()) { setRegError("Please enter your full name."); return; }
    if (!regEmail.trim()) { setRegError("Please enter your email."); return; }
    if (regPassword.length < 8) { setRegError("Password must be at least 8 characters."); return; }
    if (regPassword !== regConfirm) { setRegError("Passwords do not match."); return; }
    registerMutation.mutate({ name: regName.trim(), email: regEmail.trim().toLowerCase(), password: regPassword });
  };

  const switchMode = (mode: "signin" | "register") => {
    setModalMode(mode); setLoginError(""); setRegError("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080b10" }}>
        <div className="w-8 h-8 border-2 border-[#0074F4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,116,244,0.18) 0%, rgba(0,169,226,0.08) 40%, transparent 70%), #080b10",
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
      }}
    >
      {/* ── Top bar ── */}
      <nav className="flex items-center justify-between px-8 py-5">
        <img src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png" alt="WAVV" className="h-7 w-auto" />
        <button
          onClick={() => { setModalMode("signin"); setShowModal(true); }}
          className="text-sm font-semibold transition-all hover:text-white"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Sign In →
        </button>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-8 pb-24">

        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 tracking-wide uppercase"
          style={{
            background: "rgba(0,116,244,0.12)",
            border: "1px solid rgba(0,116,244,0.28)",
            color: "#60a5fa",
            letterSpacing: "0.08em",
          }}
        >
          Customer Success Center
        </div>

        {/* Main headline */}
        <h1
          className="font-extrabold tracking-tight leading-[1.08] mb-6"
          style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", maxWidth: "820px" }}
        >
          <span style={{
            background: "linear-gradient(135deg, #ffffff 0%, #c7d9ff 40%, #93c5fd 70%, #67C728 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            WAVV Success Center
          </span>
        </h1>

        {/* Gradient accent line */}
        <div
          className="mb-8"
          style={{
            width: "200px",
            height: "3px",
            borderRadius: "2px",
            background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)",
          }}
        />

        {/* Subheadline */}
        <p
          className="mb-12 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.1rem", maxWidth: "520px" }}
        >
          Training, webinars, guides, and dedicated support — everything you need to get the most out of WAVV.
        </p>

        {/* CTA */}
        <button
          onClick={() => { setModalMode("signin"); setShowModal(true); }}
          className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.98] mb-16"
          style={{
            background: "linear-gradient(135deg, #0074F4 0%, #00A9E2 100%)",
            boxShadow: "0 0 0 1px rgba(0,116,244,0.4), 0 8px 32px rgba(0,116,244,0.35)",
          }}
        >
          Access the Success Center <ArrowRight size={15} />
        </button>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {features.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
              style={{
                background: `${color}14`,
                border: `1px solid ${color}30`,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              <Icon size={13} style={{ color }} />
              {label}
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="text-center py-5 text-xs"
        style={{ color: "rgba(255,255,255,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        © {new Date().getFullYear()} WAVV. All rights reserved.&nbsp;·&nbsp;
        <a href="https://wavv.com/privacy" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">Privacy</a>
        &nbsp;·&nbsp;
        <a href="https://wavv.com/terms" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">Terms</a>
      </footer>

      {/* ── Auth Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl p-8 flex flex-col items-center"
            style={{
              background: "linear-gradient(160deg, #0f1520 0%, #0a0e18 100%)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,116,244,0.1)",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-sm transition-colors"
              style={{ color: "#4b5563" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#9ca3af")}
              onMouseLeave={e => (e.currentTarget.style.color = "#4b5563")}
            >
              ✕
            </button>

            {/* Logo */}
            <img src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png" alt="WAVV" className="h-7 w-auto mb-7" />

            {/* Mode tabs */}
            <div
              className="flex w-full mb-6 rounded-xl p-1"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {(["signin", "register"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => switchMode(mode)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: modalMode === mode ? "linear-gradient(135deg, #0074F4, #00A9E2)" : "transparent",
                    color: modalMode === mode ? "#fff" : "#6b7280",
                    boxShadow: modalMode === mode ? "0 2px 8px rgba(0,116,244,0.3)" : "none",
                  }}
                >
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {/* ── SIGN IN ── */}
            {modalMode === "signin" && (
              <>
                <h2 className="text-white text-xl font-bold mb-1 text-center">Welcome back</h2>
                <p className="mb-6 text-center text-sm" style={{ color: "#6b7280" }}>Sign in to your WAVV account</p>
                <form onSubmit={handleSignIn} className="w-full flex flex-col gap-3">
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email" required style={inputBase} onFocus={inputFocus} onBlur={inputBlur} />
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                      onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required
                      style={{ ...inputBase, paddingRight: "44px" }} onFocus={inputFocus} onBlur={inputBlur} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "#6b7280" }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {loginError && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                      <AlertCircle size={13} className="flex-shrink-0" />{loginError}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <a href="mailto:support@wavv.com?subject=Password Reset Request" className="text-xs hover:underline" style={{ color: "#0074F4" }}>Forgot password?</a>
                  </div>
                  <button type="submit" disabled={loginMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)", boxShadow: "0 4px 20px rgba(0,116,244,0.3)" }}>
                    {loginMutation.isPending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</> : "Sign In"}
                  </button>
                  <p className="text-center text-xs mt-1" style={{ color: "#6b7280" }}>
                    Don't have an account?{" "}
                    <button type="button" onClick={() => switchMode("register")} className="hover:underline font-medium" style={{ color: "#0074F4" }}>Create one</button>
                  </p>
                </form>
              </>
            )}

            {/* ── CREATE ACCOUNT ── */}
            {modalMode === "register" && (
              <>
                <h2 className="text-white text-xl font-bold mb-1 text-center">Create your account</h2>
                <p className="mb-6 text-center text-sm" style={{ color: "#6b7280" }}>Get access to the WAVV Success Center</p>
                <form onSubmit={handleRegister} className="w-full flex flex-col gap-3">
                  <input type="text" placeholder="Full name" value={regName} onChange={(e) => setRegName(e.target.value)}
                    autoComplete="name" required style={inputBase} onFocus={inputFocus} onBlur={inputBlur} />
                  <input type="email" placeholder="Work email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email" required style={inputBase} onFocus={inputFocus} onBlur={inputBlur} />
                  <div className="relative">
                    <input type={showRegPassword ? "text" : "password"} placeholder="Password (min. 8 characters)"
                      value={regPassword} onChange={(e) => setRegPassword(e.target.value)} autoComplete="new-password" required
                      style={{ ...inputBase, paddingRight: "44px" }} onFocus={inputFocus} onBlur={inputBlur} />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "#6b7280" }}>
                      {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <input type="password" placeholder="Confirm password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                    autoComplete="new-password" required style={inputBase} onFocus={inputFocus} onBlur={inputBlur} />
                  {regError && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                      <AlertCircle size={13} className="flex-shrink-0" />{regError}
                    </div>
                  )}
                  <button type="submit" disabled={registerMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                    style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)", boxShadow: "0 4px 20px rgba(0,116,244,0.3)" }}>
                    {registerMutation.isPending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account...</> : "Create Account"}
                  </button>
                  <p className="text-center text-xs mt-1" style={{ color: "#6b7280" }}>
                    Already have an account?{" "}
                    <button type="button" onClick={() => switchMode("signin")} className="hover:underline font-medium" style={{ color: "#0074F4" }}>Sign in</button>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
