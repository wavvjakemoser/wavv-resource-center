import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import {
  Rocket,
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
  MessageCircle,
  Clock,
} from "lucide-react";

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
    title: "6-Week Sales Bootcamp",
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

export default function Accelerator() {
  const { user } = useAuth();
  // TODO: Replace with real Stripe SKU check once billing integration is confirmed
  const hasAccess = false; // Placeholder — will be driven by subscription tier

  return (
    <PortalLayout title="WAVV Accelerator">
      {hasAccess ? <MemberView /> : <MarketingView user={user} />}
    </PortalLayout>
  );
}

// ─── Marketing / Landing View (unauthenticated or non-qualifying plan) ───────
function MarketingView({ user }: { user: any }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="px-4 lg:px-8 py-6 space-y-12">
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

        <div className="relative z-10 px-4 sm:px-6 lg:px-16 py-8 sm:py-12 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full"
            style={{ background: "rgba(0,116,244,0.10)", border: "1px solid rgba(0,116,244,0.25)" }}>
            <Rocket size={12} style={{ color: "#4a9eff" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#4a9eff" }}>
              WAVV × Prospecting On Demand
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-extrabold tracking-tight leading-[1.05] mb-4"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}
          >
            <span style={{
              background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #4ade80 70%, #22c55e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              WAVV Sales Accelerator
            </span>
          </h1>

          {/* Accent line */}
          <div className="flex justify-center mb-6">
            <div style={{ width: "200px", height: "3px", borderRadius: "2px", background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)" }} />
          </div>

          {/* Subline */}
          <p className="mx-auto mb-5 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(0.88rem, 1.6vw, 1rem)", maxWidth: "560px" }}>
            A coaching bootcamp that combines live sales training with hands-on WAVV product mastery. More dials. More conversations. More closes.
          </p>
          {/* Schedule line */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <Clock size={13} style={{ color: "rgba(0,169,226,0.7)" }} />
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
              Live coaching calls every Tuesday & Thursday
            </span>
          </div>

          {/* CTA */}
          {!user ? (
            <a
              href="/api/oauth/login?return_path=/accelerator"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Sign In to Check Access
              <ArrowRight size={15} />
            </a>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* Plan badge — larger and more prominent */}
              <div className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl"
                style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                <Lock size={16} style={{ color: "#f97316" }} />
                <span className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
                  Available on Quarterly & Annual Plans
                </span>
              </div>
              <a
                href="https://www.wavv.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Upgrade Your Plan to Unlock
                <ArrowRight size={15} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── The Partnership ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #f97316, #fbbf24)" }} />
          <h2 className="text-xl font-bold text-white">The Partnership</h2>
        </div>
        <div
          className="rounded-2xl p-6 lg:p-8"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-stretch">
            {/* WAVV side */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,116,244,0.12)" }}>
                  <Zap size={16} style={{ color: "#0074F4" }} />
                </div>
                <h3 className="text-sm font-bold text-white">WAVV</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                WAVV is a native multi-line power dialer that lives inside your CRM. We provide the product training layer — short how-to clips, cheat sheets, and guided walkthroughs — so you can immediately apply every sales skill inside the dialer.
              </p>
            </div>
            {/* Divider */}
            <div className="hidden md:flex flex-col items-center gap-2 py-4">
              <div className="w-px h-full min-h-[80px]" style={{ background: "rgba(255,255,255,0.1)" }} />
              <Handshake size={18} style={{ color: "rgba(249,115,22,0.6)" }} />
              <div className="w-px h-full min-h-[80px]" style={{ background: "rgba(255,255,255,0.1)" }} />
            </div>
            <div className="md:hidden w-full flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              <Handshake size={16} style={{ color: "rgba(249,115,22,0.6)" }} />
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            </div>
            {/* POD side */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(249,115,22,0.12)" }}>
                  <Target size={16} style={{ color: "#f97316" }} />
                </div>
                <h3 className="text-sm font-bold text-white">Prospecting On Demand</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                POD is a team of experienced outbound sales trainers who specialize in turning reps into closers. They own the live coaching curriculum — objection handling, conversation frameworks, follow-up systems, and the mindset work that separates top performers from everyone else.
              </p>
            </div>
          </div>
          {/* Bottom summary */}
          <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.45)" }}>
              Together, we combine <span className="font-medium" style={{ color: "#f97316" }}>live sales coaching</span> with <span className="font-medium" style={{ color: "#0074F4" }}>hands-on product training</span> — so every skill you learn gets applied inside the tool you're already using.
            </p>
          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #f97316, #fbbf24)" }} />
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

      {/* ── The 6-Week Curriculum Preview ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #f97316, #fbbf24)" }} />
          <h2 className="text-xl font-bold text-white">The 6-Week Curriculum</h2>
        </div>
        <p className="text-sm max-w-lg" style={{ color: "rgba(255,255,255,0.45)" }}>
          An evergreen loop — join at any week and get full value. Each session pairs live sales coaching with hands-on WAVV product training.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SESSIONS.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl p-5 space-y-3 relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Week badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: `${session.color}20`, color: session.color }}>
                  Week {session.week}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug">{session.title}</h3>
              <div className="space-y-1.5">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="text-gray-400 font-medium">WAVV Focus:</span> {session.wavvFocus}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="text-gray-400 font-medium">Outcome:</span> {session.outcome}
                </p>
              </div>
              {/* Lock overlay for non-members */}
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
                style={{ background: "rgba(15,19,24,0.55)", backdropFilter: "blur(4px)" }}>
                <Lock size={20} style={{ color: "rgba(255,255,255,0.3)" }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Money Math Section ── */}
      <section className="rounded-2xl p-8 text-center space-y-4"
        style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}>
        <h2 className="text-xl font-bold text-white">The Money Math Equation</h2>
        <p className="text-2xl lg:text-3xl font-bold" style={{ color: "#f97316" }}>
          Dials → Conversations → Appointments → Closes × Price = Revenue
        </p>
        <p className="text-sm max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
          Every module in the Accelerator is designed to improve one lever of this equation.
          WAVV is the engine that drives the volume. The bootcamp teaches you how to maximize every other lever.
        </p>
      </section>

      {/* ── Social Proof (placeholder) ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #f97316, #fbbf24)" }} />
          <h2 className="text-xl font-bold text-white">What Members Are Saying</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Placeholder testimonial cards — replace with real quotes once pilot feedback is collected */}
          <div className="rounded-2xl p-6 space-y-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <MessageCircle size={18} style={{ color: "rgba(249,115,22,0.5)" }} />
            <p className="text-sm italic leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              "Testimonial coming soon — pilot members will share their experience here."
            </p>
            <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>— Accelerator Member</p>
          </div>
          <div className="rounded-2xl p-6 space-y-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <MessageCircle size={18} style={{ color: "rgba(249,115,22,0.5)" }} />
            <p className="text-sm italic leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              "Testimonial coming soon — pilot members will share their experience here."
            </p>
            <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>— Accelerator Member</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #f97316, #fbbf24)" }} />
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
                  <ChevronUp size={16} style={{ color: "#f97316", flexShrink: 0 }} />
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

      {/* ── Final CTA ── */}
      <section className="text-center space-y-5 pb-8">
        <h2 className="text-xl font-bold text-white">Ready to accelerate?</h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          The WAVV Sales Accelerator is included with Quarterly and Annual subscriptions.
        </p>
        {!user ? (
          <a
            href="/api/oauth/login?return_path=/accelerator"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Sign In
            <ArrowRight size={15} />
          </a>
        ) : (
          <a
            href="https://www.wavv.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Upgrade Your Plan
            <ArrowRight size={15} />
          </a>
        )}
      </section>
    </div>
  );
}

// ─── Member View (authenticated + qualifying subscription) ───────────────────
function MemberView() {
  return (
    <div className="px-4 lg:px-8 py-6 space-y-6">
      {/* ── Compact Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,116,244,0.12)" }}>
            <Rocket size={20} style={{ color: "#0074F4" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">WAVV Sales Accelerator</h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>6-week coaching bootcamp — jump into any session below.</p>
          </div>
        </div>
        {/* Schedule pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(0,116,244,0.08)", border: "1px solid rgba(0,116,244,0.18)" }}>
          <Calendar size={12} style={{ color: "#4a9eff" }} />
          <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>Live calls Tue & Thu</span>
        </div>
      </div>

      {/* ── 6 Session Tiles — THE PRIMARY CONTENT ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Your Sessions</h2>
          <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>Evergreen — join any week</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SESSIONS.map((session) => (
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
              {/* Top row: week badge + arrow */}
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

              {/* Title */}
              <h3 className="text-[15px] font-semibold text-white leading-snug">{session.title}</h3>

              {/* WAVV Focus */}
              <p className="text-xs leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                <span className="font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>WAVV Focus:</span> {session.wavvFocus}
              </p>

              {/* Outcome badge */}
              <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: session.color }} />
                  <span className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>{session.outcome}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Upcoming Live Calls ── */}
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

      {/* ── Quick Start (secondary — below the fold) ── */}
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
    </div>
  );
}
