import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PortalLayout from "@/components/PortalLayout";
import {
  Sparkles,
  BookOpen,
  Award,
  TrendingUp,
  ExternalLink,
  FileText,
  Lock,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";

// ─── Static content ───────────────────────────────────────────────────────────
const COURSE_MODULES = [
  {
    id: 1,
    title: "Welcome to the WAVV Partner Program",
    description: "Overview of the program, expectations, and how to maximize your partnership.",
    duration: "~10 min",
    status: "coming_soon",
  },
  {
    id: 2,
    title: "Understanding WAVV's Product Suite",
    description: "Deep dive into WAVV's core features so you can speak confidently to prospects.",
    duration: "~20 min",
    status: "coming_soon",
  },
  {
    id: 3,
    title: "Ideal Customer Profile & Use Cases",
    description: "Who WAVV is built for, common pain points, and how partners can identify opportunities.",
    duration: "~15 min",
    status: "coming_soon",
  },
  {
    id: 4,
    title: "Referral Process & Revenue Share",
    description: "Step-by-step walkthrough of the referral submission process and how commissions work.",
    duration: "~12 min",
    status: "coming_soon",
  },
  {
    id: 5,
    title: "Co-Marketing & Partner Resources",
    description: "Access co-branded materials, approved messaging, and how to run joint campaigns.",
    duration: "~10 min",
    status: "coming_soon",
  },
];

const QUICK_LINKS = [
  { label: "WAVV Website",          href: "https://www.wavv.com",                  icon: ExternalLink },
  { label: "Partner Commission Hub", href: "https://www.wavv.com/partners",         icon: TrendingUp },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WavvPartnerPortal() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    // admin and customer_admin don't belong here — redirect to main admin panel
    if (user.role === "admin" || user.role === "customer_admin") {
      navigate("/wavvadmin");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) return null;
  if (user.role === "admin" || user.role === "customer_admin") return null;

  return (
    <PortalLayout title="WAVV Partners">
      <div className="px-6 py-8 max-w-5xl mx-auto w-full space-y-8">

        {/* ── Hero ── */}
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
              You're officially part of the WAVV Partner Program. Complete the onboarding course below to unlock your referral link, tracking dashboard, and partner resources. All WAVV Success Center content is also available to you in the sidebar.
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

        {/* ── Onboarding Course ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Onboarding Course</h2>
            <span className="text-xs text-gray-500">0 / {COURSE_MODULES.length} completed</span>
          </div>

          <div className="space-y-3">
            {COURSE_MODULES.map((module, idx) => (
              <div
                key={module.id}
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
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
                The WAVV Partner onboarding course is being built out. You'll receive an email notification as soon as modules are available. In the meantime, explore the resources below or browse the WAVV Academy, Webinars, and Guides in the sidebar.
              </p>
            </div>
          </div>
        </div>

        {/* ── Partner Resources ── */}
        <div>
          <h2 className="text-base font-semibold text-white mb-4">Partner Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl transition-all hover:border-[#0074F4]/40"
                style={{ background: "#1d2230", border: "1px solid #2a2a2a", color: "#e5e7eb" }}
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
                style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
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
        </div>

      </div>
    </PortalLayout>
  );
}
