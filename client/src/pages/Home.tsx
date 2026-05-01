import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, Video, FileText, LifeBuoy, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

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
    <div className="min-h-screen" style={{ background: "#121212", fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1e1e1e" }}>
        <div className="flex items-center gap-3">
          <svg width="36" height="24" viewBox="0 0 32 22" fill="none">
            <path d="M0 0L5.5 22H8.5L13 5L17.5 22H20.5L26 0H22.5L19 14L14.5 0H11.5L7 14L3.5 0H0Z" fill="url(#home-grad)" />
            <defs>
              <linearGradient id="home-grad" x1="0" y1="0" x2="26" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0074F4" />
                <stop offset="50%" stopColor="#00A9E2" />
                <stop offset="100%" stopColor="#67C728" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-white font-bold text-lg">WAVV</span>
          <span className="text-gray-500 text-sm hidden sm:block">Resource Center</span>
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

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "rgba(0, 116, 244, 0.1)", border: "1px solid rgba(0, 116, 244, 0.3)", color: "#60a5fa" }}
        >
          <Sparkles size={12} />
          Powered by WAVV AI
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
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
        <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Everything you need to succeed with WAVV — training, webinars, guides, and AI-powered support — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={getLoginUrl()}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
          >
            Access Resource Center
            <ArrowRight size={16} />
          </a>
          <a
            href="https://wavv.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-medium text-gray-300 transition-all hover:text-white"
            style={{ border: "1px solid #2a2a2a" }}
          >
            Learn about WAVV
          </a>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="p-5 rounded-xl transition-all hover:-translate-y-1"
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = f.color;
                  e.currentTarget.style.boxShadow = `0 4px 24px ${f.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${f.color}20` }}
                >
                  <Icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{f.label}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 pb-20 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-8">Built for WAVV customers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-3 text-left">
              <CheckCircle size={16} className="text-[#67C728] flex-shrink-0" />
              <span className="text-gray-300 text-sm">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center" style={{ borderTop: "1px solid #1e1e1e" }}>
        <p className="text-gray-600 text-xs">© 2025 WAVV. All rights reserved.</p>
      </footer>
    </div>
  );
}
