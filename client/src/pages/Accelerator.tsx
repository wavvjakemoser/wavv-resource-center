import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useMemo } from "react";
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
  Info,
} from "lucide-react";
import { toast } from "sonner";

// ─── Live call schedule ──────────────────────────────────────────────────────
// 12 sessions: Tue + Thu, starting Jul 21 2026
// All times stored as UTC milliseconds. 12:00 MT = 18:00 UTC (MDT = UTC-6)
const SCHEDULE: { id: number; week: number; sessionInWeek: 1 | 2; label: string; utcMs: number; joinUrl?: string }[] = [
  // Week 1
  { id: 1,  week: 1, sessionInWeek: 1, label: "Tuesday, July 21st, 2026 · 12:00 PM MT / 2:00 PM ET",  utcMs: Date.UTC(2026, 6, 21, 18, 0, 0) },
  { id: 2,  week: 1, sessionInWeek: 2, label: "Thursday, July 23rd, 2026 · 12:00 PM MT / 2:00 PM ET", utcMs: Date.UTC(2026, 6, 23, 18, 0, 0) },
  // Week 2
  { id: 3,  week: 2, sessionInWeek: 1, label: "Tuesday, July 28th, 2026 · 12:00 PM MT / 2:00 PM ET",  utcMs: Date.UTC(2026, 6, 28, 18, 0, 0) },
  { id: 4,  week: 2, sessionInWeek: 2, label: "Thursday, July 30th, 2026 · 12:00 PM MT / 2:00 PM ET", utcMs: Date.UTC(2026, 6, 30, 18, 0, 0) },
  // Week 3
  { id: 5,  week: 3, sessionInWeek: 1, label: "Tuesday, August 4th, 2026 · 12:00 PM MT / 2:00 PM ET",  utcMs: Date.UTC(2026, 7, 4,  18, 0, 0) },
  { id: 6,  week: 3, sessionInWeek: 2, label: "Thursday, August 6th, 2026 · 12:00 PM MT / 2:00 PM ET", utcMs: Date.UTC(2026, 7, 6,  18, 0, 0) },
  // Week 4
  { id: 7,  week: 4, sessionInWeek: 1, label: "Tuesday, August 11th, 2026 · 12:00 PM MT / 2:00 PM ET",  utcMs: Date.UTC(2026, 7, 11, 18, 0, 0) },
  { id: 8,  week: 4, sessionInWeek: 2, label: "Thursday, August 13th, 2026 · 12:00 PM MT / 2:00 PM ET", utcMs: Date.UTC(2026, 7, 13, 18, 0, 0) },
  // Week 5
  { id: 9,  week: 5, sessionInWeek: 1, label: "Tuesday, August 18th, 2026 · 12:00 PM MT / 2:00 PM ET",  utcMs: Date.UTC(2026, 7, 18, 18, 0, 0) },
  { id: 10, week: 5, sessionInWeek: 2, label: "Thursday, August 20th, 2026 · 12:00 PM MT / 2:00 PM ET", utcMs: Date.UTC(2026, 7, 20, 18, 0, 0) },
  // Week 6
  { id: 11, week: 6, sessionInWeek: 1, label: "Tuesday, August 25th, 2026 · 12:00 PM MT / 2:00 PM ET",  utcMs: Date.UTC(2026, 7, 25, 18, 0, 0) },
  { id: 12, week: 6, sessionInWeek: 2, label: "Thursday, August 27th, 2026 · 12:00 PM MT / 2:00 PM ET", utcMs: Date.UTC(2026, 7, 27, 18, 0, 0) },
];

// 30-minute pre-join window
const JOIN_WINDOW_MS = 30 * 60 * 1000;

// Duration of each live call in ms (90 minutes)
const CALL_DURATION_MS = 90 * 60 * 1000;

type ScheduleState =
  | { status: "upcoming"; next: typeof SCHEDULE[0]; secondsLeft: number; hasPast: boolean }
  | { status: "live";     current: typeof SCHEDULE[0]; secondsLeft: number; hasPast: boolean }
  | { status: "done" };

function useAcceleratorSchedule(): ScheduleState {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo((): ScheduleState => {
    // Check if we're currently in a live call window
    for (const s of SCHEDULE) {
      if (now >= s.utcMs && now < s.utcMs + CALL_DURATION_MS) {
        const secondsLeft = Math.max(0, Math.floor((s.utcMs + CALL_DURATION_MS - now) / 1000));
        const hasPast = SCHEDULE.some(x => x.utcMs < s.utcMs);
        return { status: "live", current: s, secondsLeft, hasPast };
      }
    }
    // Find next upcoming session
    const next = SCHEDULE.find(s => s.utcMs > now);
    if (next) {
      const secondsLeft = Math.max(0, Math.floor((next.utcMs - now) / 1000));
      const hasPast = SCHEDULE.some(s => s.utcMs + CALL_DURATION_MS < now);
      return { status: "upcoming", next, secondsLeft, hasPast };
    }
    return { status: "done" };
  }, [now]);
}

function formatCountdown(totalSeconds: number) {
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { d, h, m, s };
}

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
    title: "Sales Accelerator Program",
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
    a: "Absolutely. The Accelerator is an evergreen loop — you can join at any session and get full value. Once you complete the cycle, you can repeat any module or keep attending live calls.",
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

// ─── Week 1 free window constants ────────────────────────────────────────────
// Starts now (Jul 10) → locks Jul 27 00:00 MDT
const WEEK1_FREE_START_UTC = Date.UTC(2026, 6, 10, 0, 0, 0);  // Jul 10 00:00 UTC (live now)
const WEEK1_FREE_END_UTC   = Date.UTC(2026, 6, 27, 6, 0, 0);  // Jul 27 00:00 MDT

function isWeek1FreeNow() {
  const now = Date.now();
  return now >= WEEK1_FREE_START_UTC && now < WEEK1_FREE_END_UTC;
}

// ─── Access logic (live API — subscription data no longer in token) ──────────
function useAcceleratorAccess() {
  const { user } = useAuth();
  const entitlementQuery = trpc.accelerator.getEntitlement.useQuery(undefined, {
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // cache for 5 min, re-fetch on focus
  });

  const week1FreeActive = isWeek1FreeNow();
  const week1FreeEndsAt = WEEK1_FREE_END_UTC;

  if (!user) return { hasAccess: false, reason: "unauthenticated" as const, user: null, isLoading: false, week1FreeActive, week1FreeEndsAt };
  if (entitlementQuery.isLoading) return { hasAccess: false, reason: "loading" as const, user, isLoading: true, week1FreeActive, week1FreeEndsAt };

  const e = entitlementQuery.data;
  if (!e) return { hasAccess: false, reason: "no_access" as const, user, isLoading: false, week1FreeActive, week1FreeEndsAt };
  if (e.isEmployee) return { hasAccess: true, reason: "employee" as const, user, isLoading: false, week1FreeActive, week1FreeEndsAt };
  if (e.entitled) return { hasAccess: true, reason: "qualifying_plan" as const, user, isLoading: false, week1FreeActive, week1FreeEndsAt };
  return { hasAccess: false, reason: "no_access" as const, user, isLoading: false, week1FreeActive, week1FreeEndsAt };
}

// ─── Upgrade CTA component (reused in multiple places) ──────────────────────
function UpgradeCTA({ reason, variant = "inline" }: { reason: string; variant?: "inline" | "sticky" }) {
  const manageUrl = trpc.accelerator.getManageSubscriptionUrl.useMutation();

  const handleUpgradeClick = async () => {
    try {
      const result = await manageUrl.mutateAsync();
      window.location.href = result.url;
    } catch {
      // Employee accounts don't have Stripe subscriptions — show a toast instead of redirecting
      toast.info("Employee preview mode", {
        description: "This button is for subscribers only. Real customers will be directed to their Stripe billing portal.",
      });
    }
  };

  if (reason === "unauthenticated") {
    return (
      <a
        href="/api/oauth/login?return_path=/accelerator"
        className={`inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${variant === "sticky" ? "px-5 py-2" : "px-6 py-2.5"}`}
        style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", textDecoration: "none" }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        Sign In to Upgrade
        <ArrowRight size={15} />
      </a>
    );
  }
  return (
    <button
      onClick={handleUpgradeClick}
      disabled={manageUrl.isPending}
      className={`inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${variant === "sticky" ? "px-5 py-2" : "px-6 py-2.5"}`}
      style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", opacity: manageUrl.isPending ? 0.7 : 1 }}
      onMouseEnter={(e) => { if (!manageUrl.isPending) { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {manageUrl.isPending ? "Loading..." : reason === "no_access" ? "Upgrade Your Plan" : "Unlock the Full Accelerator"}
      {!manageUrl.isPending && <ArrowRight size={15} />}
    </button>
  );
}

// ─── Week 1 Free Banner with countdown ─────────────────────────────────────
function Week1FreeBanner({ endsAt, reason }: { endsAt: number; reason: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secsLeft = Math.max(0, Math.floor((endsAt - now) / 1000));
  const d = Math.floor(secsLeft / 86400);
  const h = Math.floor((secsLeft % 86400) / 3600);
  const m = Math.floor((secsLeft % 3600) / 60);
  const s = secsLeft % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const countdownStr = d > 0
    ? `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`
    : `${pad(h)}h ${pad(m)}m ${pad(s)}s`;

  return (
    <div
      className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-5"
      style={{
        background: "linear-gradient(135deg, rgba(103,199,40,0.12) 0%, rgba(0,116,244,0.10) 100%)",
        border: "1px solid rgba(103,199,40,0.3)",
        boxShadow: "0 0 24px rgba(103,199,40,0.08)",
      }}
    >
      {/* Gift icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(103,199,40,0.15)" }}>
        <Gift size={20} style={{ color: "#67C728" }} />
      </div>

      {/* Text */}
      <div className="flex-1 text-center sm:text-left">
        <p className="text-sm font-bold text-white">
          Session 1 is free through July 26
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
          Free access ends in{" "}
          <span className="font-semibold tabular-nums" style={{ color: "#67C728" }}>{countdownStr}</span>
          {" "}· Upgrade to unlock the full program
        </p>
      </div>

      {/* CTA */}
      <UpgradeCTA reason={reason} variant="inline" />
    </div>
  );
}

// ─── Live Call Countdown component ──────────────────────────────────────────
function LiveCallCountdown({ hasAccess }: { hasAccess: boolean }) {
  const schedule = useAcceleratorSchedule();

  const isLive   = schedule.status === "live";
  const isDone   = schedule.status === "done";
  const accentBg = isLive
    ? "linear-gradient(135deg, #052e16 0%, #064e3b 40%, #065f46 100%)"
    : "linear-gradient(135deg, #0a1628 0%, #0d2847 40%, #0a3a6b 100%)";
  const accentBorder = isLive ? "rgba(16,185,129,0.4)" : "rgba(0,116,244,0.3)";
  const glowColor    = isLive ? "#10b981" : "#0074F4";

  const countdown = schedule.status !== "done"
    ? formatCountdown(
        schedule.status === "live" ? schedule.secondsLeft : schedule.secondsLeft
      )
    : null;

  const sessionRef = schedule.status === "live"
    ? schedule.current
    : schedule.status === "upcoming"
    ? schedule.next
    : null;

  // Map schedule session id → SESSIONS week (1-indexed session id maps to week via SESSIONS array)
  const weekNum   = sessionRef?.week ?? null;
  const sessionInWeek = sessionRef?.sessionInWeek ?? null;
  const sessionPageId = weekNum; // session page id = week number

  const hasPast = schedule.status !== "done" && schedule.hasPast;

  return (
    <section
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
      style={{
        background: accentBg,
        border: `1px solid ${accentBorder}`,
        boxShadow: `0 4px 24px ${glowColor}1a`,
      }}
    >
      {/* Glow orbs */}
      <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl"
        style={{ background: `radial-gradient(circle, ${glowColor}, transparent)` }} />
      <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full opacity-10 blur-3xl"
        style={{ background: `radial-gradient(circle, ${glowColor}, transparent)` }} />

      <div className="relative flex flex-col items-center text-center gap-4">
        {/* Icon + live badge */}
        <div className="relative">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center"
            style={{
              background: isLive
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #0074F4, #00A9E2)",
              boxShadow: `0 4px 16px ${glowColor}40`,
            }}
          >
            <Clock size={20} className="text-white" />
          </div>
          <div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
            style={{
              background: isLive ? "#10b981" : "#10b981",
              borderColor: isLive ? "#064e3b" : "#0d2847",
            }}
          >
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-75"
              style={{ background: isLive ? "#10b981" : "#10b981" }}
            />
          </div>
        </div>

        {/* Title row */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {isLive ? "🔴 LIVE NOW" : "NEXT LIVE CALL"}
          </h3>
          {sessionRef && (
            <p className="mt-1 text-xs font-semibold" style={{ color: isLive ? "#6ee7b7" : "#4a9eff" }}>
               Session {weekNum} · Call {sessionInWeek} of 2
            </p>
          )}
          <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Tue & Thu · Live Coaching with Prospecting On Demand
          </p>
          {sessionRef && (
            <p className="mt-1 text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
              {sessionRef.label}
            </p>
          )}
        </div>

        {/* Countdown digits — segmented display style with colon separators */}
        {!isDone && countdown && (
          <div className="flex items-end gap-1 sm:gap-2">
            {[{ val: countdown.d, label: "Days" }, { val: countdown.h, label: "Hrs" }, { val: countdown.m, label: "Min" }, { val: countdown.s, label: "Sec" }].map(({ val, label }, idx) => (
              <div key={label} className="flex items-end gap-1 sm:gap-2">
                <div className="text-center">
                  <div
                    className="w-[72px] sm:w-[88px] h-[72px] sm:h-[88px] rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: `linear-gradient(160deg, ${glowColor}22 0%, ${glowColor}0a 100%)`,
                      border: `1.5px solid ${glowColor}40`,
                      boxShadow: `0 0 18px ${glowColor}18, inset 0 1px 0 rgba(255,255,255,0.08)`,
                    }}
                  >
                    {/* Subtle top highlight */}
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${glowColor}50, transparent)` }} />
                    <p
                      className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight"
                      style={{
                        color: "#fff",
                        textShadow: `0 0 20px ${glowColor}80, 0 0 40px ${glowColor}30`,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {String(val).padStart(2, "0")}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[9px] uppercase tracking-[0.15em] font-bold" style={{ color: `${glowColor}99` }}>
                    {label}
                  </p>
                </div>
                {/* Colon separator between digits (not after last) */}
                {idx < 3 && (
                  <div className="flex flex-col gap-2 pb-7 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: `${glowColor}60` }} />
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: `${glowColor}60` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isDone && (
          <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            All 12 sessions complete. Recordings available in each session below.
          </p>
        )}

        {/* CTA button to current session (members only) */}
        {hasAccess && sessionRef && sessionPageId && (
          <a
            href={`/accelerator/session/${sessionPageId}`}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: isLive ? "#10b981" : "#0074F4" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {isLive ? <Play size={14} /> : <Calendar size={14} />}
            {isLive ? "Join Live Call" : `Go to Session ${weekNum}`}
            <ChevronRight size={14} />
          </a>
        )}
      </div>

      {/* Bottom bar — late-joiner callout */}
      <div className="relative mt-6 pt-4" style={{ borderTop: `1px solid ${glowColor}15` }}>
        {hasPast ? (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.18)" }}
          >
            <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: "#fbbf24" }}>Joining mid-cycle?</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                No problem — every previous session recording is available. Click into any session below to catch up at your own pace.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            {sessionRef ? sessionRef.label : "Tuesday, July 21st, 2026 · 12:00 PM MT / 2:00 PM ET"}
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Upcoming calls list (members only) ──────────────────────────────────────
function UpcomingCallsList() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const upcoming = SCHEDULE.filter(s => s.utcMs + CALL_DURATION_MS > now).slice(0, 6);
  const past     = SCHEDULE.filter(s => s.utcMs + CALL_DURATION_MS <= now);

  return (
    <section
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={16} style={{ color: "#0074F4" }} />
          <h3 className="text-sm font-semibold text-white">Upcoming Live Calls</h3>
        </div>
        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>Tuesdays & Thursdays</span>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>All sessions complete. Check recordings in each session below.</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map((s) => {
            const isLive       = now >= s.utcMs && now < s.utcMs + CALL_DURATION_MS;
            const isJoinable   = now >= s.utcMs - JOIN_WINDOW_MS && now < s.utcMs + CALL_DURATION_MS;
            const secsToStart  = Math.max(0, Math.floor((s.utcMs - now) / 1000));
            const { d, h, m, sec: _sec } = (() => {
              const d = Math.floor(secsToStart / 86400);
              const h = Math.floor((secsToStart % 86400) / 3600);
              const m = Math.floor((secsToStart % 3600) / 60);
              const sec = secsToStart % 60;
              return { d, h, m, sec };
            })();
            const countdownStr = isLive
              ? "🔴 LIVE NOW"
              : d > 0 ? `${d}d ${h}h ${m}m`
              : h > 0 ? `${h}h ${m}m`
              : `${m}m ${_sec}s`;

            return (
              <div
                key={s.id}
                className="rounded-xl px-4 py-3 space-y-2"
                style={{
                  background: isLive ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)",
                  border: isLive ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                    style={{ background: isLive ? "rgba(16,185,129,0.15)" : "rgba(0,116,244,0.1)", color: isLive ? "#10b981" : "#4a9eff" }}
                  >
                    W{s.week}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">
                      Session {s.week} · Call {s.sessionInWeek} of 2
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                  </div>
                  <span
                    className="text-[11px] font-bold tabular-nums flex-shrink-0"
                    style={{ color: isLive ? "#10b981" : "rgba(255,255,255,0.5)" }}
                  >
                    {countdownStr}
                  </span>
                </div>
                {/* Join button — grayed until 30 min before */}
                <div className="flex justify-end">
                  {isJoinable ? (
                    <a
                      href={s.joinUrl ?? `/accelerator/session/${s.week}`}
                      target={s.joinUrl ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                      style={{ background: isLive ? "#10b981" : "#0074F4" }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      <Play size={11} />
                      {isLive ? "Join Live" : "Join Waiting Room"}
                    </a>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <Lock size={11} />
                      Opens 30 min before
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {past.length > 0 && (
        <p className="text-[11px] pt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          ✱ {past.length} previous session{past.length > 1 ? "s" : ""} available — click any session below to catch up.
        </p>
      )}
    </section>
  );
}

export default function Accelerator() {
  const { hasAccess: realAccess, reason: realReason, user, week1FreeActive, week1FreeEndsAt } = useAcceleratorAccess();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [previewAsCustomer, setPreviewAsCustomer] = useState(false);
  const [showAccessPopup, setShowAccessPopup] = useState(false);

  // Show pop-up for signed-in users who don't qualify (suppress during Week 1 free window)
  useEffect(() => {
    if (realReason === "no_access" && !previewAsCustomer && !week1FreeActive) {
      setShowAccessPopup(true);
    }
  }, [realReason, previewAsCustomer, week1FreeActive]);

  // Allow employees to preview the locked/customer view
  const isApprovedEmployee = (user as any)?.isEmployee && (user as any)?.approvalStatus === "approved";
  const hasAccess = previewAsCustomer ? false : realAccess;
  const reason = previewAsCustomer ? "no_access" : realReason;
  // Session 1 is accessible to everyone during the free window (including employee preview-as-customer)
  const week1Open = week1FreeActive;

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

        {/* ── Week 1 Free Banner (shown to non-members during the free window) ── */}
        {!hasAccess && week1FreeActive && (
          <Week1FreeBanner endsAt={week1FreeEndsAt} reason={reason} />
        )}

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
              Complete the WAVV Accelerator and walk away with a fully configured dialer, a proven outreach cadence, and the skills to hit your connection rate targets.
            </p>
            {/* Schedule line */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <Clock size={13} style={{ color: "rgba(0,169,226,0.7)" }} />
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                Live coaching calls every Tuesday & Thursday
              </span>
            </div>

            {/* Hero CTA buttons */}
            {reason === "unauthenticated" && (
              <UpgradeCTA reason="unauthenticated" variant="inline" />
            )}
            {reason === "no_access" && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "480px" }}>
                  The WAVV Sales Accelerator is included with Quarterly and Annual subscriptions at no additional cost. Monthly subscribers can upgrade their plan to unlock access.
                </p>
                <UpgradeCTA reason="no_access" variant="inline" />
              </div>
            )}
          </div>
        </div>



        {/* ── Curriculum (tiles — gated or unlocked) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #00A9E2)" }} />
              <h2 className="text-xl font-bold text-white">The Curriculum</h2>
            </div>
            {hasAccess && (
              <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>On-demand — start any session, any time</span>
            )}
          </div>
          {!hasAccess && (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              On-demand access — start any session, any time. Each session pairs live sales coaching with hands-on WAVV product training.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {SESSIONS.map((session) => {
              // Week 1 is open to all during the free window
              const sessionOpen = hasAccess || (week1Open && session.week === 1);
              if (sessionOpen) {
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
                        Session {session.id}
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
              // Locked — grayed out with Week 1 free badge if applicable
              return (
                <div
                  key={session.id}
                  className="rounded-2xl p-6 h-full flex flex-col relative overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", opacity: session.week === 1 && week1FreeActive ? 0.75 : 0.55 }}
                >
                  <div className="space-y-4 h-full flex flex-col pointer-events-none select-none" style={{ filter: "blur(4px)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: `${session.color}12`, color: `${session.color}99` }}>
                        Session {session.id}
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
                </div>
              );
            })}
          </div>

          {/* "What You're Missing" banner + CTA (only for non-access users) */}
          {!hasAccess && (
            <div className="space-y-5 pt-4">
              {/* What You're Missing — prominent banner */}
              <div className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.03) 100%)", border: "1px solid rgba(249,115,22,0.18)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(249,115,22,0.15)" }}>
                  <Gift size={20} style={{ color: "#f97316" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white mb-1">What You're Missing</p>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {week1FreeActive
                      ? "Session 1 is on us — but the full program includes 6 live coaching calls/week, 12+ WAVV training clips, downloadable cheat sheets, community leaderboards, and milestone badges."
                      : "6 live coaching calls/week, 12+ WAVV training clips, downloadable cheat sheets, community leaderboards, and milestone badges — all included with your upgrade."
                    }
                  </p>
                </div>
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
                <p className="text-sm text-center max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {week1FreeActive
                    ? "Upgrade to a quarterly or annual plan to unlock Sessions 2–6, all future live coaching calls, and the full video library."
                    : "Upgrade to a quarterly or annual plan to unlock all live coaching sessions, the full video library, and save money on your subscription."
                  }
                </p>
                <UpgradeCTA reason={reason} />
              </div>
            </div>
          )}
        </section>



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
              <div className="space-y-3 flex flex-col items-center text-center">
                <img src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png" alt="WAVV" className="h-7 object-contain" />
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
              <div className="space-y-3 flex flex-col items-center text-center">
                <a href="https://prospectingondemand.com" target="_blank" rel="noopener noreferrer">
                  <img src="/manus-storage/pod_icon_417b718b.webp" alt="Prospecting On Demand" className="h-12 object-contain hover:opacity-80 transition-opacity" />
                </a>
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
            <h2 className="text-xl font-bold text-white">FAQs</h2>
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
              {week1FreeActive
                ? "Session 1 is on us. Upgrade to a Quarterly or Annual plan to unlock the full program."
                : "The WAVV Sales Accelerator is included with Quarterly and Annual subscriptions at no additional cost."
              }
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

      {/* ── Sticky availability bar (non-access users only) ── */}
      {!hasAccess && (
        <div
          className="sticky bottom-0 left-0 right-0 z-40 flex items-center justify-center px-4 py-3"
          style={{
            background: "linear-gradient(180deg, rgba(8,12,20,0.85) 0%, rgba(8,12,20,0.98) 100%)",
            borderTop: "1px solid rgba(0,116,244,0.15)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2">
            <Lock size={14} style={{ color: "#4a9eff" }} />
            <span className="text-xs sm:text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
              Available on Quarterly and Annual Plans
            </span>
          </div>
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
              <UpgradeCTA reason="no_access" variant="inline" />
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
