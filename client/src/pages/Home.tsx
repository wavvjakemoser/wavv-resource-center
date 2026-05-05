import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  GraduationCap,
  Video,
  FileText,
  LifeBuoy,
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

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

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!email || !password) {
      setLoginError("Please enter your email and password.");
      return;
    }
    loginMutation.mutate({ email: email.trim().toLowerCase(), password });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d0d" }}>
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
      desc: "Playbooks, checklists, and PDFs to accelerate your ROI",
      color: "#67C728",
    },
    {
      icon: FlaskConical,
      label: "WAVV Playground",
      desc: "Practice WAVV features in a safe, isolated environment before going live",
      color: "#a855f7",
    },
    {
      icon: LifeBuoy,
      label: "WAVV Support",
      desc: "Submit tickets, book calls, or get instant answers from WAVV AI",
      color: "#FF9900",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0d0d0d", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav
        className="flex items-center justify-between px-6 sm:px-10 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <img
          src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
          alt="WAVV"
          className="h-7 w-auto"
        />
        <button
          onClick={() => { setShowModal(true); setLoginError(""); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
        >
          Sign In
          <ArrowRight size={14} />
        </button>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8"
          style={{
            background: "rgba(0,116,244,0.12)",
            border: "1px solid rgba(0,116,244,0.3)",
            color: "#60a5fa",
          }}
        >
          <Sparkles size={11} />
          Powered by WAVV AI
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.05] tracking-tight max-w-4xl">
          <span
            style={{
              background: "linear-gradient(90deg, #0074F4 0%, #00A9E2 35%, #00c4a0 60%, #67C728 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            WAVV Success Center
          </span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
          Training, webinars, guides, and dedicated support — everything you need to get the most out of WAVV, all in one place.
        </p>

        <button
          onClick={() => { setShowModal(true); setLoginError(""); }}
          className="flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #0074F4, #00A9E2)",
            boxShadow: "0 8px 32px rgba(0,116,244,0.35)",
          }}
        >
          Access Success Center
          <ArrowRight size={16} />
        </button>

        <div className="grid grid-cols-5 gap-3 mt-16 max-w-5xl w-full">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="p-5 rounded-2xl text-center transition-all hover:-translate-y-1 cursor-default flex flex-col items-center"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${m.color}60`;
                  e.currentTarget.style.boxShadow = `0 4px 24px ${m.color}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 mx-auto"
                  style={{ background: `${m.color}18` }}
                >
                  <Icon size={20} style={{ color: m.color }} />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{m.label}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{m.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 max-w-2xl">
          {[
            "Self-Service Learning",
            "Progress Tracking",
            "AI-Powered Answers",
            "On-Demand Recordings",
          ].map((b) => (
            <div key={b} className="flex items-center gap-1.5">
              <CheckCircle size={13} className="text-[#67C728] flex-shrink-0" />
              <span className="text-gray-500 text-xs">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer
        className="px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-gray-600 text-xs">© 2026 WAVV. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a
            href="https://wavv.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 text-xs hover:text-gray-400 transition-colors"
          >
            Privacy Policy
          </a>
          <span className="text-gray-700 text-xs">·</span>
          <a
            href="https://wavv.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 text-xs hover:text-gray-400 transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </footer>

      {/* ── Sign-In Modal ────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl p-8 flex flex-col items-center"
            style={{
              background: "#161616",
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
              className="h-8 w-auto mb-8"
            />

            <h2 className="text-white text-xl font-bold mb-1 text-center">Sign in to your account</h2>
            <p className="text-gray-500 text-sm mb-7 text-center">Enter your WAVV account credentials to sign in</p>

            <form onSubmit={handleSignIn} className="w-full flex flex-col gap-3">
              {/* Email */}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                style={{
                  background: "#242424",
                  border: "1px solid #333",
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#0074F4";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,116,244,0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#333";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all pr-11"
                  style={{
                    background: "#242424",
                    border: "1px solid #333",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#0074F4";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,116,244,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#333";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Error message */}
              {loginError && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#f87171",
                  }}
                >
                  <AlertCircle size={13} className="flex-shrink-0" />
                  {loginError}
                </div>
              )}

              {/* Forgot password */}
              <div className="flex justify-end">
                <a
                  href="mailto:support@wavv.com?subject=Password Reset Request"
                  className="text-xs text-[#0074F4] hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #0074F4, #00A9E2)",
                  boxShadow: "0 4px 20px rgba(0,116,244,0.3)",
                }}
              >
                {loginMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>


          </div>
        </div>
      )}
    </div>
  );
}
