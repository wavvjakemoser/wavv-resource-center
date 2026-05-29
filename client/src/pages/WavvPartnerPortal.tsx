import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Award,
  Users,
  TrendingUp,
  PlayCircle,
  FileText,
  CheckCircle2,
  Lock,
  Sparkles,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Static data ─────────────────────────────────────────────────────────────

const COURSE_MODULES = [
  {
    id: 1,
    title: "Welcome to the WAVV Partner Program",
    description: "Overview of the program, your role as a WAVV Partner, and how to get started.",
    duration: "~10 min",
    status: "coming_soon" as "coming_soon" | "completed" | "available",
  },
  {
    id: 2,
    title: "Understanding WAVV's Value Proposition",
    description: "Learn what makes WAVV different and how to communicate that to your network.",
    duration: "~15 min",
    status: "coming_soon" as "coming_soon" | "completed" | "available",
  },
  {
    id: 3,
    title: "How Referrals Work",
    description: "Step-by-step guide to submitting referrals, tracking links, and the approval process.",
    duration: "~12 min",
    status: "coming_soon" as "coming_soon" | "completed" | "available",
  },
  {
    id: 4,
    title: "Revenue Share & Payouts",
    description: "How commissions are calculated, when you get paid, and how to track your earnings.",
    duration: "~8 min",
    status: "coming_soon" as "coming_soon" | "completed" | "available",
  },
  {
    id: 5,
    title: "Partner Resources & Co-Marketing",
    description: "Access to approved assets, messaging guides, and co-marketing opportunities.",
    duration: "~10 min",
    status: "coming_soon" as "coming_soon" | "completed" | "available",
  },
];

const QUICK_LINKS = [
  { label: "WAVV Website", href: "https://www.wavv.com", icon: ExternalLink },
  { label: "Partner Program Page", href: "https://www.wavv.com/partner-program", icon: ExternalLink },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WavvPartnerPortal() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const [, navigate] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { navigate("/login"); },
  });

  useEffect(() => {
    document.title = "WAVV Partner Portal";
  }, []);

  // Gate: only partner role can access this page
  if (!isLoading && !user) {
    navigate("/login?next=/wavv-partner");
    return null;
  }
  if (!isLoading && user && user.role !== "partner") {
    // Admins go to /admin, everyone else to /dashboard
    if (user.role === "admin" || user.role === "super_admin" || user.role === "partner_admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f1318" }}>
        <div className="animate-spin w-8 h-8 border-2 border-[#0074F4] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f1318", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top bar ── */}
      <header
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-30"
        style={{ background: "#0f1318", borderBottom: "1px solid #1e2030" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
            alt="WAVV"
            style={{ height: "22px", width: "auto" }}
          />
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,116,244,0.15)", color: "#0074F4", border: "1px solid rgba(0,116,244,0.3)" }}
          >
            Partner Portal
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 hidden sm:block">
            {user?.name || user?.email}
          </span>
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="px-6 py-10 max-w-5xl mx-auto w-full">
        <div
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(0,116,244,0.18) 0%, rgba(0,169,226,0.12) 50%, rgba(16,185,129,0.10) 100%)",
            border: "1px solid rgba(0,116,244,0.25)",
          }}
        >
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,116,244,0.12) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,169,226,0.10) 0%, transparent 70%)", transform: "translate(-20%, 20%)" }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} style={{ color: "#0074F4" }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#0074F4" }}>
                WAVV Partner Program
              </span>
            </div>
            <h1
              className="text-3xl font-bold mb-3"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #0074F4 50%, #00A9E2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Welcome, {user?.name?.split(" ")[0] || "Partner"}
            </h1>
            <p className="text-gray-300 max-w-xl" style={{ fontSize: "15px", lineHeight: "1.6" }}>
              You're officially part of the WAVV Partner Program. Complete the onboarding course below to unlock your referral link, tracking dashboard, and partner resources.
            </p>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mt-6">
              {[
                { icon: BookOpen, label: "5 Modules", color: "#0074F4" },
                { icon: Award, label: "Certification on Completion", color: "#10b981" },
                { icon: TrendingUp, label: "Revenue Share Unlocked After", color: "#f59e0b" },
              ].map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: `${color}18`, border: `1px solid ${color}30`, color: "#e5e7eb" }}
                >
                  <Icon size={12} style={{ color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Course Modules ── */}
      <section className="px-6 pb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Onboarding Course</h2>
          <span className="text-xs text-gray-500">0 / {COURSE_MODULES.length} completed</span>
        </div>

        <div className="space-y-3">
          {COURSE_MODULES.map((module, idx) => (
            <div
              key={module.id}
              className="flex items-start gap-4 p-4 rounded-xl transition-all"
              style={{
                background: "#161b22",
                border: "1px solid #1e2030",
              }}
            >
              {/* Step number / status */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(0,116,244,0.12)", border: "1px solid rgba(0,116,244,0.2)" }}
              >
                {module.status === "completed" ? (
                  <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                ) : (
                  <span className="text-xs font-bold" style={{ color: "#0074F4" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-white">{module.title}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}
                  >
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)", lineHeight: "1.5" }}>
                  {module.description}
                </p>
                <span className="text-xs mt-1 inline-block" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {module.duration}
                </span>
              </div>

              {/* Action */}
              <button
                disabled
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 opacity-40 cursor-not-allowed"
                style={{ background: "rgba(0,116,244,0.15)", color: "#0074F4", border: "1px solid rgba(0,116,244,0.2)" }}
              >
                <Lock size={11} />
                <span>Locked</span>
              </button>
            </div>
          ))}
        </div>

        {/* Under construction notice */}
        <div
          className="mt-6 rounded-xl p-5 flex items-start gap-4"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(245,158,11,0.15)" }}
          >
            <PlayCircle size={18} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#f59e0b" }}>Course content coming soon</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)", lineHeight: "1.6" }}>
              The WAVV Partner onboarding course is being built out. You'll receive an email notification as soon as modules are available. In the meantime, explore the resources below.
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick Links ── */}
      <section className="px-6 pb-10 max-w-5xl mx-auto w-full">
        <h2 className="text-base font-semibold text-white mb-4">Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl transition-all hover:border-[#0074F4]/40"
              style={{ background: "#161b22", border: "1px solid #1e2030", color: "#e5e7eb" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,116,244,0.12)" }}
              >
                <Icon size={15} style={{ color: "#0074F4" }} />
              </div>
              <span className="text-sm font-medium">{label}</span>
              <ExternalLink size={12} className="ml-auto flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
            </a>
          ))}

          {/* Placeholder resource cards */}
          {["Partner Playbook", "Referral Tracking Dashboard", "Co-Marketing Assets", "Contact Your Partner Manager"].map((label) => (
            <div
              key={label}
              className="flex items-center gap-3 p-4 rounded-xl opacity-40"
              style={{ background: "#161b22", border: "1px solid #1e2030" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <FileText size={15} style={{ color: "rgba(255,255,255,0.3)" }} />
              </div>
              <span className="text-sm font-medium text-gray-500">{label}</span>
              <Lock size={12} className="ml-auto flex-shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto px-6 py-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
          &copy; 2026 WAVV. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="https://www.wavv.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
          >
            Privacy Policy
          </a>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>&bull;</span>
          <a
            href="https://www.wavv.com/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
          >
            Terms &amp; Conditions
          </a>
        </div>
      </footer>
    </div>
  );
}
