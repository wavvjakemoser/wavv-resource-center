import { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
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
  return (
    <div className="px-4 lg:px-8 py-8 max-w-6xl mx-auto space-y-12">
      {/* Hero */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
          style={{ background: "rgba(249,115,22,0.12)", color: "#f97316", border: "1px solid rgba(249,115,22,0.25)" }}>
          <Rocket size={13} />
          Powered by POD × WAVV
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
          WAVV Sales <span style={{ color: "#f97316" }}>Accelerator</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          A coaching bootcamp that combines live sales training with hands-on WAVV product mastery.
          More dials. More conversations. More closes. The equation is simple — we help you execute it.
        </p>

        {/* CTA */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {!user ? (
            <a
              href="/api/oauth/login?return_path=/accelerator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "#f97316", color: "#fff" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#ea580c"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f97316"; }}
            >
              Sign In to Check Access
              <ArrowRight size={16} />
            </a>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }}>
                <Lock size={14} />
                Available on Quarterly & Annual plans
              </div>
              <a
                href="https://www.wavv.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: "#f97316" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fb923c"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#f97316"; }}
              >
                Upgrade your plan to unlock
                <ArrowRight size={14} />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Value Props Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">What's Included</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VALUE_PROPS.map((prop) => (
            <div
              key={prop.title}
              className="rounded-2xl p-5 space-y-3 transition-all"
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
              <p className="text-xs text-gray-400 leading-relaxed">{prop.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The 6-Week Curriculum Preview */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">The 6-Week Curriculum</h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            An evergreen loop — join at any week and get full value. Each session pairs live sales coaching with hands-on WAVV product training.
          </p>
        </div>
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
                style={{ background: "rgba(15,19,24,0.4)", backdropFilter: "blur(1px)" }}>
                <Lock size={20} style={{ color: "rgba(255,255,255,0.3)" }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Money Math Section */}
      <section className="rounded-2xl p-8 text-center space-y-4"
        style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}>
        <h2 className="text-xl font-bold text-white">The Money Math Equation</h2>
        <p className="text-3xl font-bold" style={{ color: "#f97316" }}>
          Dials → Conversations → Appointments → Closes × Price = Revenue
        </p>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Every module in the Accelerator is designed to improve one lever of this equation.
          WAVV is the engine that drives the volume. The bootcamp teaches you how to maximize every other lever.
        </p>
      </section>

      {/* Final CTA */}
      <section className="text-center space-y-4 pb-8">
        <h2 className="text-xl font-bold text-white">Ready to accelerate?</h2>
        <p className="text-sm text-gray-400">
          The WAVV Sales Accelerator is included with Quarterly and Annual subscriptions.
        </p>
        {!user ? (
          <a
            href="/api/oauth/login?return_path=/accelerator"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#f97316", color: "#fff" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#ea580c"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#f97316"; }}
          >
            Sign In
            <ArrowRight size={16} />
          </a>
        ) : (
          <a
            href="https://www.wavv.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#f97316", color: "#fff" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#ea580c"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#f97316"; }}
          >
            Upgrade Your Plan
            <ArrowRight size={16} />
          </a>
        )}
      </section>
    </div>
  );
}

// ─── Member View (authenticated + qualifying subscription) ───────────────────
function MemberView() {
  return (
    <div className="px-4 lg:px-8 py-8 max-w-6xl mx-auto space-y-8">
      {/* Member Header */}
      <section className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(249,115,22,0.15)" }}>
            <Rocket size={20} style={{ color: "#f97316" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">WAVV Sales Accelerator</h1>
            <p className="text-sm text-gray-400">Your 6-week coaching bootcamp — join any session, anytime.</p>
          </div>
        </div>
      </section>

      {/* Quick Start Banner */}
      <section className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(249,115,22,0.15)" }}>
          <Zap size={24} style={{ color: "#f97316" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">First Dial in 10 Minutes</h3>
          <p className="text-xs text-gray-400">New here? Start with our guided quick-start to place your first live dial.</p>
        </div>
        <button className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: "#f97316", color: "#fff" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#ea580c"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#f97316"; }}
        >
          <Play size={12} />
          Start
        </button>
      </section>

      {/* 6 Session Tiles */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SESSIONS.map((session) => (
            <a
              key={session.id}
              href={`/accelerator/session/${session.id}`}
              className="rounded-2xl p-5 space-y-3 transition-all group cursor-pointer"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${session.color}08`;
                e.currentTarget.style.borderColor = `${session.color}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: `${session.color}20`, color: session.color }}>
                  Week {session.week}
                </span>
                <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug">{session.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{session.wavvFocus}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Upcoming Calls */}
      <section className="rounded-2xl p-5 space-y-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <Calendar size={16} style={{ color: "#f97316" }} />
          <h3 className="text-sm font-semibold text-white">Upcoming Live Calls</h3>
        </div>
        <p className="text-xs text-gray-500">No upcoming calls scheduled yet. Check back soon.</p>
      </section>
    </div>
  );
}
