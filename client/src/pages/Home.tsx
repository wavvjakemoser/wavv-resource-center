import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  GraduationCap,
  Video,
  FileText,
  Headphones,
  ArrowRight,
  FlaskConical,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Play,
  BookOpen,
  Zap,
  ChevronDown,
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

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [authLoading, user, navigate]);

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080c12" }}>
        <div className="w-10 h-10 border-2 border-[#0074F4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const features = [
    {
      icon: GraduationCap,
      label: "WAVV Academy",
      desc: "Structured courses across Onboarding, How-To, and Strategy — learn at your own pace.",
      color: "#0074F4",
      stat: "29 videos",
      path: "/academy",
    },
    {
      icon: Video,
      label: "Webinars",
      desc: "Live sessions and on-demand recordings to deepen your WAVV expertise.",
      color: "#00A9E2",
      stat: "On-demand",
      path: "/webinars",
    },
    {
      icon: FileText,
      label: "Guides & Docs",
      desc: "Playbooks, checklists, and PDFs to accelerate your team's performance.",
      color: "#67C728",
      stat: "3 resources",
      path: "/guides",
    },
    {
      icon: FlaskConical,
      label: "Playground",
      desc: "Practice WAVV features in a safe sandbox before going live with your team.",
      color: "#a855f7",
      stat: "Hands-on",
      path: "/hands-on",
    },
    {
      icon: Headphones,
      label: "Support",
      desc: "Submit a ticket, chat with support, or get instant answers from WAVV AI.",
      color: "#FF9900",
      stat: "24/7 AI",
      path: "/support",
    },
  ];

  const stats = [
    { icon: BookOpen, value: "29", label: "Training Videos" },
    { icon: Play, value: "3", label: "Course Categories" },
    { icon: Zap, value: "24/7", label: "AI-Powered Support" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ background: "#080c12", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Animated background ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Large blue orb top-right */}
        <div
          className="absolute rounded-full"
          style={{
            width: "700px",
            height: "700px",
            top: "-200px",
            right: "-150px",
            background: "radial-gradient(circle, rgba(0,116,244,0.18) 0%, rgba(0,116,244,0.04) 50%, transparent 70%)",
            animation: "pulse-slow 8s ease-in-out infinite",
          }}
        />
        {/* Green orb bottom-left */}
        <div
          className="absolute rounded-full"
          style={{
            width: "500px",
            height: "500px",
            bottom: "-100px",
            left: "-100px",
            background: "radial-gradient(circle, rgba(103,199,40,0.1) 0%, rgba(103,199,40,0.02) 50%, transparent 70%)",
            animation: "pulse-slow 10s ease-in-out infinite 2s",
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 30px rgba(0,116,244,0.4), 0 8px 32px rgba(0,116,244,0.3); }
          50% { box-shadow: 0 0 50px rgba(0,116,244,0.6), 0 8px 48px rgba(0,116,244,0.45); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up-1 { animation: fade-up 0.7s ease forwards; }
        .fade-up-2 { animation: fade-up 0.7s ease 0.15s forwards; opacity: 0; }
        .fade-up-3 { animation: fade-up 0.7s ease 0.3s forwards; opacity: 0; }
        .fade-up-4 { animation: fade-up 0.7s ease 0.45s forwards; opacity: 0; }
        .fade-up-5 { animation: fade-up 0.7s ease 0.6s forwards; opacity: 0; }
        .feature-card:hover .feature-card-icon {
          transform: scale(1.1);
        }
        .feature-card:hover {
          transform: translateY(-4px);
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav
        className="relative flex items-center justify-between px-6 sm:px-12 py-5"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(8,12,18,0.8)",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        <img
          src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
          alt="WAVV"
          className="h-7 w-auto"
        />
        <button
          onClick={() => { setShowModal(true); setLoginError(""); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #0074F4, #00A9E2)",
            animation: "glow-pulse 3s ease-in-out infinite",
          }}
        >
          Sign In
          <ArrowRight size={14} />
        </button>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col lg:flex-row items-center justify-between px-6 sm:px-12 pt-20 pb-16 gap-12 max-w-7xl mx-auto w-full"
        style={{ zIndex: 1 }}
      >
        {/* Left: text */}
        <div className="flex-1 max-w-2xl">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 fade-up-1"
            style={{
              background: "rgba(0,116,244,0.12)",
              border: "1px solid rgba(0,116,244,0.3)",
              color: "#60a5fa",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#0074F4", boxShadow: "0 0 6px #0074F4" }}
            />
            Your WAVV Success Hub
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.02] tracking-tight mb-6 fade-up-2"
          >
            <span className="text-white">Get more out</span>
            <br />
            <span className="text-white">of WAVV,</span>
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #0074F4 0%, #00A9E2 40%, #67C728 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              faster.
            </span>
          </h1>

          {/* Sub-headline */}
          <p
            className="text-gray-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl fade-up-3"
          >
            Training courses, live webinars, expert guides, and AI-powered support — everything your team needs to connect, convert, and succeed with WAVV.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 fade-up-4">
            <button
              onClick={() => { setShowModal(true); setLoginError(""); }}
              className="flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #0074F4, #00A9E2)",
                boxShadow: "0 8px 32px rgba(0,116,244,0.4)",
                animation: "glow-pulse 3s ease-in-out infinite",
              }}
            >
              Access Success Center
              <ArrowRight size={16} />
            </button>
            <a
              href="#features"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              See what's inside
              <ChevronDown size={14} />
            </a>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 mt-12 fade-up-5">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col">
                <span className="text-2xl font-extrabold text-white">{value}</span>
                <span className="text-xs text-gray-500 mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: visual card stack */}
        <div
          className="relative flex-shrink-0 w-full max-w-sm hidden lg:block"
          style={{ animation: "float 6s ease-in-out infinite" }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(0,116,244,0.2) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          {/* Main card */}
          <div
            className="relative rounded-2xl p-6 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0d1929 0%, #0a1520 100%)",
              border: "1px solid rgba(0,116,244,0.25)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Card header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,116,244,0.2)", border: "1px solid rgba(0,116,244,0.3)" }}
              >
                <GraduationCap size={20} style={{ color: "#0074F4" }} />
              </div>
              <div>
                <div className="text-white text-sm font-bold">WAVV Academy</div>
                <div className="text-gray-500 text-xs">3 categories · 29 videos</div>
              </div>
            </div>
            {/* Progress bars */}
            {[
              { label: "Onboarding", pct: 75, color: "#0074F4" },
              { label: "How-To", pct: 45, color: "#00A9E2" },
              { label: "Strategy", pct: 20, color: "#67C728" },
            ].map(({ label, pct, color }) => (
              <div key={label} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }}
                  />
                </div>
              </div>
            ))}
            {/* Bottom stat */}
            <div
              className="mt-5 pt-4 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-xs text-gray-500">Your progress</span>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(103,199,40,0.15)", color: "#67C728" }}
              >
                On track
              </span>
            </div>
          </div>

          {/* Floating mini-cards */}
          <div
            className="absolute -bottom-4 -left-8 rounded-xl px-4 py-3 flex items-center gap-3"
            style={{
              background: "#0d1929",
              border: "1px solid rgba(0,169,226,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,169,226,0.15)" }}
            >
              <Video size={14} style={{ color: "#00A9E2" }} />
            </div>
            <div>
              <div className="text-white text-xs font-bold">New Webinar</div>
              <div className="text-gray-500 text-xs">Live this week</div>
            </div>
          </div>

          <div
            className="absolute -top-4 -right-6 rounded-xl px-4 py-3 flex items-center gap-3"
            style={{
              background: "#0d1929",
              border: "1px solid rgba(103,199,40,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(103,199,40,0.15)" }}
            >
              <Zap size={14} style={{ color: "#67C728" }} />
            </div>
            <div>
              <div className="text-white text-xs font-bold">WAVV AI</div>
              <div className="text-gray-500 text-xs">Always available</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ───────────────────────────────────────── */}
      <section
        id="features"
        className="relative px-6 sm:px-12 py-20 max-w-7xl mx-auto w-full"
        style={{ zIndex: 1 }}
      >
        {/* Section label */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#0074F4" }}>
            Everything in one place
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Your complete WAVV toolkit
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-base">
            Five powerful resources, all designed to help your team get results faster.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="feature-card group relative rounded-2xl p-6 cursor-pointer transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #0d1422 0%, #0a1020 100%)",
                  border: `1px solid rgba(255,255,255,0.07)`,
                }}
                onClick={() => { setShowModal(true); setLoginError(""); }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${f.color}40`;
                  e.currentTarget.style.boxShadow = `0 8px 40px ${f.color}18, inset 0 1px 0 ${f.color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Stat badge */}
                <div
                  className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${f.color}18`, color: f.color }}
                >
                  {f.stat}
                </div>

                {/* Icon */}
                <div
                  className="feature-card-icon w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300"
                  style={{
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}30`,
                  }}
                >
                  <Icon size={26} style={{ color: f.color }} />
                </div>

                {/* Text */}
                <h3 className="text-white font-bold text-lg mb-2">{f.label}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>

                {/* Arrow */}
                <div
                  className="flex items-center gap-1.5 mt-5 text-xs font-semibold transition-colors duration-200"
                  style={{ color: f.color }}
                >
                  Get started
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            );
          })}

          {/* Last card: CTA card */}
          <div
            className="relative rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, #0074F4 0%, #00A9E2 100%)",
              boxShadow: "0 8px 40px rgba(0,116,244,0.3)",
            }}
            onClick={() => { setShowModal(true); setLoginError(""); }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <ArrowRight size={26} className="text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Ready to start?</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Sign in to access your full WAVV Success Center.
            </p>
            <div className="mt-5 px-5 py-2.5 rounded-xl bg-white text-sm font-bold text-[#0074F4] hover:bg-blue-50 transition-colors">
              Sign In Now
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA band ─────────────────────────────────────── */}
      <section
        className="relative px-6 sm:px-12 py-16 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(0,116,244,0.12) 0%, rgba(0,169,226,0.08) 50%, rgba(103,199,40,0.06) 100%)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          zIndex: 1,
        }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#67C728" }}>
          Built for WAVV teams
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Your team's success starts here.
        </h2>
        <p className="text-gray-400 text-base max-w-xl mx-auto mb-8">
          Stop searching for answers. Everything you need to onboard, train, and grow with WAVV is in one place.
        </p>
        <button
          onClick={() => { setShowModal(true); setLoginError(""); }}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #0074F4, #00A9E2)",
            boxShadow: "0 8px 32px rgba(0,116,244,0.4)",
          }}
        >
          Access Success Center
          <ArrowRight size={16} />
        </button>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer
        className="relative px-6 sm:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", zIndex: 1 }}
      >
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

      {/* ── Sign-In Modal ────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl p-8 flex flex-col items-center"
            style={{
              background: "#0d1422",
              border: "1px solid rgba(0,116,244,0.2)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(0,116,244,0.1)",
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X size={18} />
            </button>

            <img
              src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
              alt="WAVV"
              className="h-8 w-auto mb-8"
            />

            <h2 className="text-white text-xl font-bold mb-1 text-center">Sign in to your account</h2>
            <p className="text-gray-500 text-sm mb-7 text-center">Enter your WAVV account credentials to sign in</p>

            <form onSubmit={handleSignIn} className="w-full flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                style={{
                  background: "#161e2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#0074F4";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,116,244,0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
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
                  style={{
                    background: "#161e2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#0074F4";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,116,244,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
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

              <div className="flex justify-end">
                <a href="mailto:support@wavv.com?subject=Password Reset Request" className="text-xs text-[#0074F4] hover:underline">
                  Forgot password?
                </a>
              </div>

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
