import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  GraduationCap,
  Video,
  FileText,
  Headphones,
  ArrowRight,
  CheckCircle,
  Sparkles,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  FlaskConical,
} from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { data: user, isLoading: authLoading } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "register">("signin");

  // Sign-in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [authLoading, user, navigate]);

  // Close modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/dashboard");
    },
    onError: (err) => {
      setLoginError(err.message || "Invalid email or password. Please try again.");
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/dashboard");
    },
    onError: (err) => {
      setRegError(err.message || "Registration failed. Please try again.");
    },
  });

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!email || !password) {
      setLoginError("Please enter your email and password.");
      return;
    }
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
    setModalMode(mode);
    setLoginError("");
    setRegError("");
  };

  const inputStyle = {
    background: "#1e2330",
    border: "1px solid #2d3548",
    fontFamily: "'Inter', sans-serif",
  };
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#0074F4";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,116,244,0.15)";
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#2d3548";
    e.currentTarget.style.boxShadow = "none";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f1318" }}>
        <div className="w-10 h-10 border-2 border-[#0074F4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const modules = [
    {
      icon: GraduationCap,
      label: "WAVV Academy",
      desc: "Structured courses: Onboarding, How-To, Strategy & Best Practices, and more",
      color: "#0074F4",
    },
    {
      icon: Video,
      label: "WAVV Webinars",
      desc: "Evergreen and live sessions to deepen your WAVV expertise",
      color: "#00A9E2",
    },
    {
      icon: FileText,
      label: "WAVV Guides & Docs",
      desc: "Playbooks, how-to guides, and documentation to reference anytime",
      color: "#67C728",
    },
    {
      icon: FlaskConical,
      label: "WAVV Playground",
      desc: "Practice WAVV features in a safe, isolated environment before going live",
      color: "#a855f7",
    },
    {
      icon: Headphones,
      label: "WAVV Support",
      desc: "AI-powered help and direct access to the WAVV support team",
      color: "#f59e0b",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#161b22", fontFamily: "'Inter', sans-serif", color: "#f3f4f6" }}
    >
      {/* ── Nav ── */}
      <nav
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-20"
        style={{ background: "rgba(22,27,34,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <img src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png" alt="WAVV" className="h-7 w-auto" />
        <button
          onClick={() => { setModalMode("signin"); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)", boxShadow: "0 4px 16px rgba(0,116,244,0.3)" }}
        >
          Sign In <ArrowRight size={14} />
        </button>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
          style={{ background: "rgba(0,116,244,0.12)", border: "1px solid rgba(0,116,244,0.3)", color: "#60a5fa" }}
        >
          <Sparkles size={12} /> Powered by WAVV AI
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          <span style={{ color: "#0074F4" }}>WAVV</span>{" "}
          <span style={{ color: "#00A9E2" }}>Success</span>{" "}
          <span style={{ color: "#67C728" }}>Center</span>
        </h1>

        <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
          Training, webinars, and dedicated support — everything you need to get the most out of WAVV, all in one place.
        </p>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button
            onClick={() => { setModalMode("signin"); setShowModal(true); }}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)", boxShadow: "0 6px 24px rgba(0,116,244,0.35)" }}
          >
            Access Success Center <ArrowRight size={15} />
          </button>
          <button
            onClick={() => { setModalMode("register"); setShowModal(true); }}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all hover:bg-white/10 active:scale-95"
            style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#e5e7eb" }}
          >
            Create Account
          </button>
        </div>

        {/* Module cards */}
        <div className="mt-16 w-full max-w-2xl flex flex-col gap-3">
          {modules.map(({ icon: Icon, label, desc, color }) => (
            <div
              key={label}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:scale-[1.01]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}22`, border: `1px solid ${color}44` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <CheckCircle size={16} className="ml-auto flex-shrink-0" style={{ color: `${color}88` }} />
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-6 text-xs text-gray-600" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        © {new Date().getFullYear()} WAVV. All rights reserved. &nbsp;·&nbsp;
        <a href="https://wavv.com/privacy" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">Privacy</a>
        &nbsp;·&nbsp;
        <a href="https://wavv.com/terms" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">Terms</a>
      </footer>

      {/* ── Auth Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl p-8 flex flex-col items-center"
            style={{
              background: "#161b22",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X size={18} />
            </button>

            {/* WAVV logo */}
            <img
              src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
              alt="WAVV"
              className="h-8 w-auto mb-6"
            />

            {/* Mode tabs */}
            <div
              className="flex w-full mb-6 rounded-xl p-1"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: modalMode === "signin" ? "linear-gradient(135deg, #0074F4, #00A9E2)" : "transparent",
                  color: modalMode === "signin" ? "#fff" : "#9ca3af",
                  boxShadow: modalMode === "signin" ? "0 2px 8px rgba(0,116,244,0.3)" : "none",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: modalMode === "register" ? "linear-gradient(135deg, #0074F4, #00A9E2)" : "transparent",
                  color: modalMode === "register" ? "#fff" : "#9ca3af",
                  boxShadow: modalMode === "register" ? "0 2px 8px rgba(0,116,244,0.3)" : "none",
                }}
              >
                Create Account
              </button>
            </div>

            {/* ── SIGN IN FORM ── */}
            {modalMode === "signin" && (
              <>
                <h2 className="text-white text-xl font-bold mb-1 text-center">Welcome back</h2>
                <p className="text-gray-500 text-sm mb-6 text-center">Sign in to your WAVV account</p>
                <form onSubmit={handleSignIn} className="w-full flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all pr-11"
                      style={inputStyle}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {loginError && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                      <AlertCircle size={13} className="flex-shrink-0" />{loginError}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <a href="mailto:support@wavv.com?subject=Password Reset Request" className="text-xs text-[#0074F4] hover:underline">Forgot password?</a>
                  </div>
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)", boxShadow: "0 4px 20px rgba(0,116,244,0.3)" }}
                  >
                    {loginMutation.isPending ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</>
                    ) : "Sign In"}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-1">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => switchMode("register")} className="text-[#0074F4] hover:underline font-medium">Create one</button>
                  </p>
                </form>
              </>
            )}

            {/* ── CREATE ACCOUNT FORM ── */}
            {modalMode === "register" && (
              <>
                <h2 className="text-white text-xl font-bold mb-1 text-center">Create your account</h2>
                <p className="text-gray-500 text-sm mb-6 text-center">Get access to the WAVV Success Center</p>
                <form onSubmit={handleRegister} className="w-full flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    autoComplete="name"
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <input
                    type="email"
                    placeholder="Work email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Password (min. 8 characters)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all pr-11"
                      style={inputStyle}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  {regError && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                      <AlertCircle size={13} className="flex-shrink-0" />{regError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                    style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)", boxShadow: "0 4px 20px rgba(0,116,244,0.3)" }}
                  >
                    {registerMutation.isPending ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account...</>
                    ) : "Create Account"}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-1">
                    Already have an account?{" "}
                    <button type="button" onClick={() => switchMode("signin")} className="text-[#0074F4] hover:underline font-medium">Sign in</button>
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
