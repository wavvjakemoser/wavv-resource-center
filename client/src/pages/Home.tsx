import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BookOpen, Video, FileText, LifeBuoy, Sparkles, ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#121212" }}>
        <div className="w-10 h-10 border-2 border-[#0074F4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const features = [
    { icon: BookOpen, label: "WAVV Academy", desc: "Structured courses for onboarding, how-to guides, and best practices", color: "#0074F4" },
    { icon: Video, label: "Webinars", desc: "Evergreen and live webinars to deepen your WAVV knowledge", color: "#00A9E2" },
    { icon: FileText, label: "Guides & Docs", desc: "Playbooks, checklists, and PDFs to accelerate your success", color: "#67C728" },
    { icon: LifeBuoy, label: "Support", desc: "Submit tickets, book calls, or get instant answers from WAVV AI", color: "#FF9900" },
  ];

  const benefits = [
    "Self-service learning at your own pace",
    "AI-powered answers to common questions",
    "Direct support ticket submission",
    "Track your Academy progress",
    "Access past webinar recordings",
    "Download guides and playbooks",
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#121212", fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1e1e1e" }}>
        <div className="flex items-center gap-3">
          {/* WAVV Logo SVG */}
          <svg width="80" height="26" viewBox="0 0 120 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* W mark */}
            <path d="M0 2L7.5 30H11.5L17.5 8L23.5 30H27.5L35 2H30L25.5 20L20 2H15L9.5 20L5 2H0Z" fill="url(#logo-grad-home)" />
            {/* WAVV text */}
            <text x="42" y="28" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="22" fill="white" letterSpacing="1">WAVV</text>
            <defs>
              <linearGradient id="logo-grad-home" x1="0" y1="0" x2="35" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0074F4" />
                <stop offset="50%" stopColor="#00A9E2" />
                <stop offset="100%" stopColor="#67C728" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-gray-500 text-sm hidden sm:block" style={{ borderLeft: "1px solid #2a2a2a", paddingLeft: "12px" }}>Resource Center</span>
        </div>
        <a
          href={getLoginUrl()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#0074F4" }}
        >
          Sign In
          <ArrowRight size={14} />
        </a>
      </nav>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left: Hero + features */}
        <div className="flex-1 px-6 py-16 lg:py-24 lg:px-12 xl:px-20 flex flex-col justify-center max-w-2xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 self-start"
            style={{ background: "rgba(0, 116, 244, 0.1)", border: "1px solid rgba(0, 116, 244, 0.3)", color: "#60a5fa" }}
          >
            <Sparkles size={12} />
            Powered by WAVV AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Your WAVV
            <span
              className="block"
              style={{
                background: "linear-gradient(135deg, #0074F4 0%, #00A9E2 50%, #67C728 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Resource Center
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-10 leading-relaxed">
            Everything you need to succeed with WAVV — training, webinars, guides, and AI-powered support — all in one place.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className="p-4 rounded-xl flex items-start gap-3"
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${f.color}20` }}
                  >
                    <Icon size={16} style={{ color: f.color }} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-0.5">{f.label}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2">
                <CheckCircle size={14} className="text-[#67C728] flex-shrink-0" />
                <span className="text-gray-400 text-xs">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sign-in card */}
        <div className="flex items-center justify-center px-6 py-12 lg:py-0 lg:w-[480px] lg:min-h-screen">
          <div
            className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
          >
            {/* WAVV logo centered in card */}
            <div className="mb-8 flex flex-col items-center gap-3">
              <svg width="100" height="32" viewBox="0 0 140 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 2L8.5 34H13L20 9L27 34H31.5L40 2H34L28.5 22L22 2H18L11.5 22L6 2H0Z" fill="url(#logo-grad-card)" />
                <text x="48" y="31" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="26" fill="white" letterSpacing="1">WAVV</text>
                <defs>
                  <linearGradient id="logo-grad-card" x1="0" y1="0" x2="40" y2="34" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0074F4" />
                    <stop offset="50%" stopColor="#00A9E2" />
                    <stop offset="100%" stopColor="#67C728" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h2 className="text-white text-xl font-bold mb-1 text-center">Sign in to your account</h2>
            <p className="text-gray-500 text-sm mb-7 text-center">Enter your WAVV account credentials below</p>

            {/* Email + Password form — clicking Sign In redirects to Manus OAuth */}
            <div className="w-full flex flex-col gap-3 mb-4">
              <div className="w-full">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-[#0074F4] transition-all"
                  style={{
                    background: "#242424",
                    border: "1px solid #333",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#0074F4"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#333"; }}
                />
              </div>
              <div className="w-full relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-[#0074F4] transition-all pr-12"
                  style={{
                    background: "#242424",
                    border: "1px solid #333",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#0074F4"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#333"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="w-full flex justify-end mb-5">
              <a href="https://app.wavv.com/forgot-password" target="_blank" rel="noopener noreferrer" className="text-xs text-[#0074F4] hover:underline">
                Forgot password?
              </a>
            </div>

            <a
              href={getLoginUrl()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
            >
              Sign In
              <ArrowRight size={14} />
            </a>

            <p className="text-gray-600 text-xs mt-6 text-center">
              Need access?{" "}
              <a href="https://wavv.com" target="_blank" rel="noopener noreferrer" className="text-[#0074F4] hover:underline">
                Contact your WAVV rep
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: "1px solid #1e1e1e" }}>
        <p className="text-gray-600 text-xs">© 2026 WAVV. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="https://wavv.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
            Privacy Policy
          </a>
          <span className="text-gray-700 text-xs">·</span>
          <a href="https://wavv.com/terms" target="_blank" rel="noopener noreferrer" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
}
