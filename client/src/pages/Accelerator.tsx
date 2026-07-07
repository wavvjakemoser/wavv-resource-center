import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Lock,
  Play,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Award,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Handshake,
  Clock,
  Gift,
} from "lucide-react";

// ─── Qualifying plans for Accelerator access ────────────────────────────────
// TODO: Confirm exact plan strings with Steve once Stripe SKU is finalized
const QUALIFYING_PLANS = ["quarterly", "annual"];

// ─── Session data (static for V1.0 — content populated later) ───────────────
const SESSIONS = [
  {
    id: 1,
    week: 1,
    title: "Build Your Number & Mindset Reset",
    wavvFocus: "Account setup, caller ID/number registration, dialer basics, and where to read your own activity stats",
    outcome: "Fully set up; can see the dials/conversations data behind their number",
    color: "#0074F4",
  },
  {
    id: 2,
    week: 2,
    title: "Prospecting Frames & Angles",
    wavvFocus: "Build or import a list; segment it; load it into a dialing campaign",
    outcome: "A live, dialer-ready list loaded in WAVV",
    color: "#10b981",
  },
  {
    id: 3,
    week: 3,
    title: "The Conversation: Sales Psychology",
    wavvFocus: "Power/multi-line dialing, using local presence, live-call controls, voicemail drops",
    outcome: "Confident running the dialer during real conversations",
    color: "#8b5cf6",
  },
  {
    id: 4,
    week: 4,
    title: "Follow-Up Systems That Convert",
    wavvFocus: "Dispositions, tags, follow-up cadences, SMS/texting, and reminders inside WAVV",
    outcome: "A repeatable follow-up cadence built in WAVV",
    color: "#f97316",
  },
  {
    id: 5,
    week: 5,
    title: "Objection Handling",
    wavvFocus: "Call recordings & notes to review calls; saved scripts/snippets for fast responses",
    outcome: "Uses recordings + saved scripts to improve call over call",
    color: "#ec4899",
  },
  {
    id: 6,
    week: 6,
    title: "The 1-Call Close & Wins Review",
    wavvFocus: "Pipeline/disposition reporting; CRM sync; reading conversion stats to find the next lever",
    outcome: "Can track closes in WAVV and see which lever to move next",
    color: "#06b6d4",
  },
];

const VALUE_PROPS = [
  {
    icon: Zap,
    title: "First Dial in 10 Minutes",
    description: "A guided quick-start that gets you from sign-up to your first live dial — fast.",
    color: "#f97316",
  },
  {
    icon: Target,
    title: "6-Week Sales Program",
    description: "Live coaching calls twice a week, built around the Money Math equation: more dials → more conversations → more closes.",
    color: "#0074F4",
  },
  {
    icon: TrendingUp,
    title: "WAVV Product Training",
    description: "Short how-to clips and cheat sheets mapped to each module — learn the sales skill AND how to execute it in WAVV.",
    color: "#10b981",
  },
  {
    icon: Users,
    title: "Community & Accountability",
    description: "Weekly leaderboards, peer mentorship, and a wins channel to keep you dialing and celebrating results.",
    color: "#8b5cf6",
  },
  {
    icon: Calendar,
    title: "Live Calls & Recordings",
    description: "Join live Tuesday/Thursday coaching calls or catch up with on-demand recordings at your own pace.",
    color: "#ec4899",
  },
  {
    icon: Award,
    title: "Milestones & Recognition",
    description: "Earn badges and rewards tied to real activity — first dial, 100 dials, first appointment, first close.",
    color: "#06b6d4",
  },
];

const FAQS = [
  {
    q: "Can I join mid-cycle?",
    a: "Absolutely. The Accelerator is an evergreen 6-week loop — you can join at any session and get full value. Once you complete the cycle, you can repeat any module or keep attending live calls.",
  },
  {
    q: "What if I miss a live call?",
    a: "Every live coaching call is recorded and available on-demand within 24 hours. You'll also get the cheat sheet and action items for that session so you never fall behind.",
  },
  {
    q: "What plan do I need?",
    a: "The WAVV Sales Accelerator is included with Quarterly and Annual subscriptions at no additional cost. Monthly subscribers can upgrade their plan to unlock access.",
  },
  {
    q: "Is this live or self-paced?",
    a: "Both. Live coaching calls happen twice a week (Tuesday and Thursday). Between calls, you have access to on-demand recordings, WAVV product training clips, and downloadable cheat sheets to work through at your own pace.",
  },
  {
    q: "Who runs the coaching calls?",
    a: "Live sales coaching is delivered by Prospecting On Demand (POD), a team of experienced outbound sales trainers. WAVV provides the product training layer so you can immediately apply what you learn inside the dialer.",
  },
  {
    q: "Do I need any prior experience?",
    a: "No. The Accelerator is designed for anyone making outbound calls — from brand-new reps to experienced dialers looking to sharpen their approach. All you need is an active WAVV account and a headset.",
  },
];

// ─── Access logic ────────────────────────────────────────────────────────────
function useAcceleratorAccess() {
  const { user } = useAuth();

  // Not signed in
  if (!user) return { hasAccess: false, reason: "unauthenticated" as const, user: null };

  // All approved WAVV employees always have access
  const isApprovedEmployee = (user as any)?.isEmployee && (user as any)?.approvalStatus === "approved";
  if (isApprovedEmployee) return { hasAccess: true, reason: "employee" as const, user };

  // Customers: check plan
  const plan = ((user as any)?.wavvPlan ?? "").toLowerCase();
  const subStatus = ((user as any)?.subscriptionStatus ?? "").toUpperCase();
  const hasQualifyingPlan = QUALIFYING_PLANS.some((p) => plan.includes(p)) && subStatus === "ACTIVE";
  if (hasQualifyingPlan) return { hasAccess: true, reason: "qualifying_plan" as const, user };

  // Authenticated but no access
  return { hasAccess: false, reason: "no_access" as const, user };
}

// ─── Upgrade CTA component (reused in multiple places) ──────────────────────
function UpgradeCTA({ reason, variant = "inline" }: { reason: string; variant?: "inline" | "sticky" }) {
  if (reason === "unauthenticated") {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <a
          href="https://www.wavv.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
          style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          Unlock the Full Accelerator
          <ArrowRight size={15} />
        </a>
        <a
          href="/api/oauth/login?return_path=/accelerator"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        >
          Sign In
          <ArrowRight size={14} />
        </a>
      </div>
    );
  }
  return (
    <a
      href="https://www.wavv.com/pricing"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${variant === "sticky" ? "px-5 py-2" : "px-6 py-2.5"}`}
      style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {reason === "no_access" ? "Upgrade Your Plan" : "Unlock the Full Accelerator"}
      <ArrowRight size={15} />
    </a>
  );
}

export default function Accelerator() {
  const { hasAccess: realAccess, reason: realReason, user } = useAcceleratorAccess();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [previewAsCustomer, setPreviewAsCustomer] = useState(false);
  const [showAccessPopup, setShowAccessPopup] = useState(false);

  // Show pop-up for signed-in users who don't qualify
  useEffect(() => {
    if (realReason === "no_access" && !previewAsCustomer) {
      setShowAccessPopup(true);
    }
  }, [realReason, previewAsCustomer]);

  // Allow employees to preview the locked/customer view
  const isApprovedEmployee = (user as any)?.isEmployee && (user as any)?.approvalStatus === "approved";
  const hasAccess = previewAsCustomer ? false : realAccess;
  const reason = previewAsCustomer ? "no_access" : realReason;

  return (
    <PortalLayout title="WAVV Accelerator">
      <div className="px-4 lg:px-8 py-6 space-y-10 pb-24">
        {/* ── Employee Preview Toggle (fixed height to prevent layout shift) ── */}
        <div style={{ minHeight: "32px" }}>
        {isApprovedEmployee && (
          <div className="flex items-center justify-end gap-3">
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
              Viewing As: {previewAsCustomer ? "Non WAVV Accelerator Member" : "WAVV Accelerator Member"}
            </span>
            <button
              onClick={() => setPreviewAsCustomer(!previewAsCustomer)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
              style={{ background: previewAsCustomer ? "#f97316" : "rgba(0,116,244,0.3)" }}
            >
              <span
                className="inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200"
                style={{ transform: previewAsCustomer ? "translateX(22px)" : "translateX(4px)" }}
              />
            </button>
          </div>
        )}
        </div>

        {/* ── Hero (gradient box matching site pattern) ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "radial-gradient(ellipse 100% 90% at 50% 0%, rgba(0,116,244,0.28) 0%, rgba(0,169,226,0.12) 40%, rgba(103,199,40,0.06) 70%, transparent 90%), #080c14",
            border: "1px solid rgba(0,116,244,0.18)",
            minHeight: "280px",
          }}
        >
          {/* Subtle grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,116,244,0.14), transparent 65%)", transform: "translate(25%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(103,199,40,0.08), transparent 65%)", transform: "translate(-25%, 30%)" }} />

          <div className="relative z-10 px-4 sm:px-6 lg:px-16 py-8 sm:py-10 text-center">
            {/* Headline */}
            <h1 className="font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}>
              <span style={{ background: "linear-gradient(135deg, #ffffff 0%, #bae6fd 30%, #7dd3fc 60%, #67C728 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                WAVV Accelerator
              </span>
            </h1>

            {/* Accent line */}
            <div className="flex justify-center mb-5">
              <div style={{ width: "200px", height: "3px", borderRadius: "2px", background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)" }} />
            </div>

            {/* Subline */}
            <p className="mx-auto mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(0.85rem, 1.5vw, 0.95rem)", maxWidth: "540px" }}>
              A structured program that combines live sales training with hands-on WAVV product mastery. More dials. More conversations. More closes.
            </p>
            {/* Schedule line */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <Clock size={13} style={{ color: "rgba(0,169,226,0.7)" }} />
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                Live coaching calls every Tuesday & Thursday
              </span>
            </div>

            {/* Hero CTA buttons */}
            {!hasAccess && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://www.wavv.com/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Become a WAVV Accelerator Member
                  <ArrowRight size={15} />
                </a>
                {reason === "unauthenticated" && (
                  <a
                    href="/api/oauth/login?return_path=/accelerator"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  >
                    Sign In
                    <ArrowRight size={14} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Next Live Call Countdown ── */}
        <section className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
          style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2847 40%, #0a3a6b 100%)", border: "1px solid rgba(0,116,244,0.3)", boxShadow: "0 4px 24px rgba(0,116,244,0.12)" }}>
          {/* Animated glow effects */}
          <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #0074F4, transparent)" }} />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #00A9E2, transparent)" }} />
          
          {/* Centered layout */}
          <div className="relative flex flex-col items-center text-center gap-4">
            {/* Clock icon */}
            <div className="relative">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)", boxShadow: "0 4px 16px rgba(0,116,244,0.4)" }}>
                <Clock size={20} className="text-white" />
              </div>
              {/* Pulsing live dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0d2847]">
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">NEXT LIVE CALL</h3>
              <p className="mt-0.5 text-xs font-medium" style={{ color: "#4a9eff" }}>Tue & Thu • Live Coaching with Prospecting On Demand</p>
            </div>

            {/* Countdown numbers — centered, medium size */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,116,244,0.12)", border: "1px solid rgba(0,116,244,0.25)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">--</p>
                </div>
                <p className="mt-1.5 text-[9px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Days</p>
              </div>
              <span className="text-2xl font-bold" style={{ color: "rgba(0,116,244,0.5)" }}>:</span>
              <div className="text-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,116,244,0.12)", border: "1px solid rgba(0,116,244,0.25)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">--</p>
                </div>
                <p className="mt-1.5 text-[9px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Hours</p>
              </div>
              <span className="text-2xl font-bold" style={{ color: "rgba(0,116,244,0.5)" }}>:</span>
              <div className="text-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,116,244,0.12)", border: "1px solid rgba(0,116,244,0.25)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                  <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">--</p>
                </div>
                <p className="mt-1.5 text-[9px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Min</p>
              </div>
            </div>
          </div>

          {/* Bottom bar: Schedule status */}
          <div className="relative mt-4 pt-3" style={{ borderTop: "1px solid rgba(0,116,244,0.12)" }}>
            <p className="text-center text-xs font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
              Schedule drops soon — check back for the next session date
            </p>
          </div>
        </section>

        {/* ── 6-Week Curriculum (tiles — gated or unlocked) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #00A9E2)" }} />
              <h2 className="text-xl font-bold text-white">The 6-Week Curriculum</h2>
            </div>
            {hasAccess && (
              <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>Evergreen — join any week</span>
            )}
          </div>
          {!hasAccess && (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              An evergreen loop — join at any week and get full value. Each session pairs live sales coaching with hands-on WAVV product training.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {SESSIONS.map((session) => {
              if (hasAccess) {
                return (
                  <a
                    key={session.id}
                    href={`/accelerator/session/${session.id}`}
                    className="rounded-2xl p-6 space-y-4 transition-all group cursor-pointer h-full flex flex-col"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${session.color}0a`;
                      e.currentTarget.style.borderColor = `${session.color}30`;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 8px 24px ${session.color}12`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: `${session.color}18`, color: session.color }}>
                        Week {session.week}
                      </span>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "rgba(255,255,255,0.04)" }}>
                        <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <h3 className="text-[15px] font-semibold text-white leading-snug">{session.title}</h3>
                    <p className="text-xs leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                      <span className="font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>WAVV Focus:</span> {session.wavvFocus}
                    </p>
                    <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: session.color }} />
                        <span className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>{session.outcome}</span>
                      </div>
                    </div>
                  </a>
                );
              }
              // Locked — grayed out, visible but not clickable
              return (
                <div
                  key={session.id}
                  className="rounded-2xl p-6 space-y-4 h-full flex flex-col relative"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", opacity: 0.55 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: `${session.color}12`, color: `${session.color}99` }}>
                      Week {session.week}
                    </span>
                    <Lock size={14} style={{ color: "rgba(255,255,255,0.25)" }} />
                  </div>
                  <h3 className="text-[15px] font-semibold leading-snug" style={{ color: "rgba(255,255,255,0.6)" }}>{session.title}</h3>
                  <p className="text-xs leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                    <span className="font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>WAVV Focus:</span> {session.wavvFocus}
                  </p>
                  <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: `${session.color}66` }} />
                      <span className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.35)" }}>{session.outcome}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* "What you're missing" banner + CTA (only for non-access users) */}
          {!hasAccess && (
            <div className="space-y-3 pt-2">
              {/* What you're missing quantification */}
              <div className="rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3"
                style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.12)" }}>
                <Gift size={18} style={{ color: "#f97316" }} className="flex-shrink-0" />
                <p className="text-sm text-center sm:text-left" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <span className="font-semibold text-white">You're missing:</span>{" "}
                  6 live coaching calls/week, 12+ WAVV training clips, downloadable cheat sheets, community leaderboards, and milestone badges — all included with your upgrade.
                </p>
              </div>
              {/* CTA */}
              <div className="flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl"
                  style={{ background: "rgba(0,116,244,0.06)", border: "1px solid rgba(0,116,244,0.15)" }}>
                  <Lock size={14} style={{ color: "#4a9eff" }} />
                  <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                    Available on Quarterly & Annual Plans
                  </span>
                </div>
                <UpgradeCTA reason={reason} />
              </div>
            </div>
          )}
        </section>

        {/* ── Upcoming Live Calls (for members) ── */}
        {hasAccess && (
          <section className="rounded-2xl p-5 space-y-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: "#0074F4" }} />
                <h3 className="text-sm font-semibold text-white">Upcoming Live Calls</h3>
              </div>
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>Tuesdays & Thursdays</span>
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>No upcoming calls scheduled yet. Check back soon.</p>
          </section>
        )}

        {/* ── The Partnership ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #00A9E2)" }} />
            <h2 className="text-xl font-bold text-white">The Partnership</h2>
          </div>
          <div
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
              {/* WAVV side */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <img src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png" alt="WAVV" className="h-5 object-contain" />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  WAVV is a native multi-line power dialer that lives inside your CRM. We provide the product training layer — short how-to clips, cheat sheets, and guided walkthroughs — so you can immediately apply every sales skill inside the dialer.
                </p>
              </div>
              {/* Divider */}
              <div className="hidden md:flex flex-col items-center self-stretch justify-center">
                <div className="w-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
                <Handshake size={18} className="my-3" style={{ color: "rgba(0,116,244,0.5)" }} />
                <div className="w-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
              </div>
              <div className="md:hidden w-full flex items-center gap-3 py-1">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                <Handshake size={16} style={{ color: "rgba(0,116,244,0.5)" }} />
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              </div>
              {/* POD side */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <a href="https://prospectingondemand.com" target="_blank" rel="noopener noreferrer">
                    <img src="/manus-storage/pod_logo_d9f904c3.webp" alt="Prospecting On Demand" className="w-8 h-8 rounded-lg object-contain hover:opacity-80 transition-opacity" style={{ background: "rgba(255,255,255,0.08)" }} />
                  </a>
                  <h3 className="text-sm font-bold text-white">Prospecting On Demand</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  POD is a team of experienced outbound sales trainers who specialize in turning reps into closers. They own the live coaching curriculum — objection handling, conversation frameworks, follow-up systems, and the mindset work that separates top performers.
                </p>
              </div>
            </div>
            {/* Bottom summary */}
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.45)" }}>
                Together, we combine <span className="font-medium" style={{ color: "#0074F4" }}>hands-on product training</span> with <span className="font-medium" style={{ color: "#f97316" }}>live sales coaching</span> — so every skill you learn gets applied inside the tool you're already using.
              </p>
            </div>
          </div>
        </section>

        {/* ── What's Included ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #00A9E2)" }} />
            <h2 className="text-xl font-bold text-white">What's Included</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUE_PROPS.map((prop) => (
              <div
                key={prop.title}
                className="rounded-2xl p-5 space-y-3 transition-all h-full flex flex-col"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${prop.color}08`;
                  e.currentTarget.style.borderColor = `${prop.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${prop.color}15` }}>
                  <prop.icon size={20} style={{ color: prop.color }} />
                </div>
                <h3 className="text-sm font-semibold text-white">{prop.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed flex-1">{prop.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Money Math Section ── */}
        <section className="rounded-2xl p-8 text-center space-y-4"
          style={{ background: "rgba(0,116,244,0.05)", border: "1px solid rgba(0,116,244,0.12)" }}>
          <h2 className="text-xl font-bold text-white">The Money Math Equation</h2>
          <p className="text-2xl lg:text-3xl font-bold" style={{ color: "#0074F4" }}>
            Dials → Conversations → Appointments → Closes × Price = Revenue
          </p>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
            Every module in the Accelerator is designed to improve one lever of this equation.
            WAVV is the engine that drives the volume. The Accelerator teaches you how to maximize every other lever.
          </p>
        </section>

        {/* ── FAQ ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #00A9E2)" }} />
            <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl overflow-hidden transition-all"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp size={16} style={{ color: "#0074F4", flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4">
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Repeat CTA after FAQ (for non-access users) ── */}
        {!hasAccess && (
          <section className="text-center space-y-4 pb-6">
            <h2 className="text-xl font-bold text-white">Ready to accelerate?</h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              The WAVV Sales Accelerator is included with Quarterly and Annual subscriptions at no additional cost.
            </p>
            <UpgradeCTA reason={reason} />
          </section>
        )}

        {/* ── Quick Start (for members — below the fold) ── */}
        {hasAccess && (
          <section className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ background: "rgba(0,116,244,0.05)", border: "1px solid rgba(0,116,244,0.12)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0,116,244,0.12)" }}>
              <Zap size={20} style={{ color: "#4a9eff" }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white">New to WAVV? First Dial in 10 Minutes</h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>A guided quick-start to get you from setup to your first live dial.</p>
            </div>
            <button className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "#0074F4", color: "#fff" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#005cc5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#0074F4"; }}
            >
              <Play size={12} />
              Start
            </button>
          </section>
        )}
      </div>

      {/* ── Sticky floating upgrade bar (non-access users only) ── */}
      {!hasAccess && (
        <div
          className="sticky bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-4 px-4 py-3"
          style={{
            background: "linear-gradient(180deg, rgba(8,12,20,0.85) 0%, rgba(8,12,20,0.98) 100%)",
            borderTop: "1px solid rgba(0,116,244,0.15)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2">
            <Lock size={14} style={{ color: "#4a9eff" }} />
            <span className="text-xs sm:text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
              {reason === "no_access" ? "Upgrade your plan" : "Unlock the full Accelerator"}
            </span>
          </div>
          <UpgradeCTA reason={reason} variant="sticky" />
        </div>
      )}

      {/* ── Access Denied Pop-up (signed-in but not qualified) ── */}
      {showAccessPopup && reason === "no_access" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="relative w-full max-w-md rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, #0f1a2e 0%, #162240 100%)", border: "1px solid rgba(0,116,244,0.2)", boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(249,115,22,0.15)" }}>
              <Lock size={22} style={{ color: "#f97316" }} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Access Restricted</h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
              Whoops, please contact your account rep or upgrade your plan to gain access to WAVV Accelerator.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://www.wavv.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                Upgrade Your Plan
                <ArrowRight size={15} />
              </a>
              <button
                onClick={() => setShowAccessPopup(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
