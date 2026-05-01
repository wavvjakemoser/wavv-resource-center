import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
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
} from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [loading, isAuthenticated, navigate]);

  // Close modal on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (loading) {
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
      label: "Webinars",
      desc: "Evergreen and live sessions to deepen your WAVV expertise",
      color: "#00A9E2",
    },
    {
      icon: FileText,
      label: "Guides & Docs",
      desc: "Playbooks, checklists, and PDFs to accelerate your ROI",
      color: "#67C728",
    },
    {
      icon: LifeBuoy,
      label: "Support",
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
        {/* Official WAVV logo */}
        <img
          src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
          alt="WAVV"
          className="h-7 w-auto"
          style={{ filter: "brightness(1)" }}
        />

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
        >
          Sign In
          <ArrowRight size={14} />
        </button>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Pill badge */}
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

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.05] tracking-tight max-w-4xl">
          Your WAVV{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #0074F4 0%, #00A9E2 45%, #67C728 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Resource Center
          </span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed">
          Training, webinars, guides, and AI-powered support — everything you need to get the most out of WAVV, all in one place.
        </p>

        {/* CTA */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #0074F4, #00A9E2)",
            boxShadow: "0 8px 32px rgba(0,116,244,0.35)",
          }}
        >
          Access Resource Center
          <ArrowRight size={16} />
        </button>

        {/* Module cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-4xl w-full">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="p-5 rounded-2xl text-left transition-all hover:-translate-y-1 cursor-default"
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
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
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

        {/* Benefits strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 max-w-2xl">
          {[
            "Self-service learning",
            "AI-powered answers",
            "Progress tracking",
            "On-demand recordings",
            "Instant support tickets",
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
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Official WAVV logo */}
            <img
              src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
              alt="WAVV"
              className="h-8 w-auto mb-8"
            />

            <h2 className="text-white text-xl font-bold mb-1 text-center">Sign in to your account</h2>
            <p className="text-gray-500 text-sm mb-7 text-center">Enter your account email below</p>

            {/* Email field */}
            <div className="w-full mb-3">
              <input
                type="email"
                placeholder="Email"
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
            </div>

            {/* Password field */}
            <div className="w-full mb-3 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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

            {/* Forgot password */}
            <div className="w-full flex justify-end mb-5">
              <a
                href="https://app.wavv.com/forgot-password"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#0074F4] hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Sign In button → Manus OAuth */}
            <a
              href={getLoginUrl()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #0074F4, #00A9E2)",
                boxShadow: "0 4px 20px rgba(0,116,244,0.3)",
              }}
            >
              Sign In
            </a>

            <p className="text-gray-600 text-xs mt-5 text-center">
              Need access?{" "}
              <a
                href="https://wavv.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0074F4] hover:underline"
              >
                Contact your WAVV rep
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
