import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Lock,
  Play,
  ArrowRight,
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
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

// ─── Live call schedule (now CMS-driven via accelerator_live_calls table) ────
// 15-minute pre-join window
const JOIN_WINDOW_MS = 15 * 60 * 1000;

interface LiveCallItem {
  id: number;
  sessionNumber: number;
  callNumber: number;
  title: string;
  description?: string | null;
  scheduledAt: string | Date;
  durationMinutes: number;
  registrationUrl?: string | null;
  joinUrl?: string | null;
  thumbnailUrl?: string | null;
  isVisible?: boolean;
}

type ScheduleState =
  | { status: "upcoming"; next: LiveCallItem; secondsLeft: number; hasPast: boolean }
  | { status: "live";     current: LiveCallItem; secondsLeft: number; hasPast: boolean }
  | { status: "done" };

function useAcceleratorSchedule(liveCalls: LiveCallItem[]): ScheduleState {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo((): ScheduleState => {
    const sorted = [...liveCalls].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    // Check if we're currently in a live call window
    for (const c of sorted) {
      const utcMs = new Date(c.scheduledAt).getTime();
      const durationMs = (c.durationMinutes ?? 90) * 60 * 1000;
      if (now >= utcMs && now < utcMs + durationMs) {
        const secondsLeft = Math.max(0, Math.floor((utcMs + durationMs - now) / 1000));
        const hasPast = sorted.some(x => new Date(x.scheduledAt).getTime() < utcMs);
        return { status: "live", current: c, secondsLeft, hasPast };
      }
    }
    // Find next upcoming call
    const next = sorted.find(c => new Date(c.scheduledAt).getTime() > now);
    if (next) {
      const secondsLeft = Math.max(0, Math.floor((new Date(next.scheduledAt).getTime() - now) / 1000));
      const hasPast = sorted.some(c => {
        const utcMs = new Date(c.scheduledAt).getTime();
        return utcMs + (c.durationMinutes ?? 90) * 60 * 1000 < now;
      });
      return { status: "upcoming", next, secondsLeft, hasPast };
    }
    return { status: "done" };
  }, [now, liveCalls]);
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
  {
    icon: MessageSquare,
    title: "Private Slack Community",
    description: "Connect with your cohort, share wins, ask questions, and get peer support between live sessions.",
    color: "#f97316",
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
        background: "linear-gradient(135deg, rgba(249,115,22,0.10) 0%, rgba(249,115,22,0.04) 100%), #0d1117",
        border: "1px solid rgba(249,115,22,0.22)",
        boxShadow: "0 0 24px rgba(249,115,22,0.06)",
      }}
    >
      {/* Gift icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(249,115,22,0.15)" }}>
        <Gift size={20} style={{ color: "#f97316" }} />
      </div>

      {/* Text */}
      <div className="flex-1 text-center sm:text-left">
        <p className="text-sm font-bold text-white">
          Session 1 is free through July 26
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
          Free access ends in{" "}
          <span className="font-semibold tabular-nums" style={{ color: "#f97316" }}>{countdownStr}</span>
          {" "}· Upgrade to unlock the full program
        </p>
      </div>

      {/* CTA */}
      <UpgradeCTA reason={reason} variant="inline" />
    </div>
  );
}

// ─── Live Call Countdown component ──────────────────────────────────────────
function LiveCallCountdown({ hasAccess, liveCalls, dbSessions = [] }: { hasAccess: boolean; liveCalls: LiveCallItem[]; dbSessions?: { id: number; sessionDateTime?: string | Date | null; registrationUrl?: string | null; joinUrl?: string | null }[] }) {
  // Fallback: if no live call events in CMS, synthesize from accelerator_sessions.sessionDateTime
  const effectiveCalls = useMemo(() => {
    if (liveCalls.length > 0) return liveCalls;
    // Build synthetic LiveCallItem[] from dbSessions that have a sessionDateTime
    return dbSessions
      .filter(s => s.sessionDateTime)
      .map(s => ({
        id: s.id * 1000,
        sessionNumber: s.id,
        callNumber: 1,
        title: `Session ${s.id}`,
        scheduledAt: s.sessionDateTime instanceof Date ? s.sessionDateTime.toISOString() : s.sessionDateTime!,
        durationMinutes: 90,
        registrationUrl: s.registrationUrl ?? null,
        joinUrl: s.joinUrl ?? null,
      } as LiveCallItem));
  }, [liveCalls, dbSessions]);

  const schedule = useAcceleratorSchedule(effectiveCalls);

  const isLive   = schedule.status === "live";
  const isDone   = schedule.status === "done";
  const glowColor    = isLive ? "#10b981" : "#0074F4";

  const countdown = schedule.status !== "done"
    ? formatCountdown(schedule.secondsLeft)
    : null;

  const sessionRef = schedule.status === "live"
    ? schedule.current
    : schedule.status === "upcoming"
    ? schedule.next
    : null;

  const weekNum   = sessionRef?.sessionNumber ?? null;
  const callNum   = sessionRef?.callNumber ?? null;
  const sessionPageId = weekNum;

  // Format date label for display
  const dateLabel = sessionRef ? new Date(sessionRef.scheduledAt).toLocaleString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }) : null;

  // If using fallback (no live calls in CMS), don't show call number
  const usingFallback = liveCalls.length === 0 && effectiveCalls.length > 0;

  return (
    <div className="flex flex-col items-center text-center gap-4 mt-2">
      {/* Title row */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {isLive ? "🔴 LIVE NOW" : "NEXT LIVE CALL"}
        </h3>
        {sessionRef && (
          <p className="mt-1 text-xs font-semibold" style={{ color: isLive ? "#6ee7b7" : "#4a9eff" }}>
             Session {weekNum}{!usingFallback && callNum ? ` · Call ${callNum} of 2` : ""}
          </p>
        )}
        {dateLabel && (
          <p className="mt-1 text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
            {dateLabel}
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
            All sessions complete. Recordings available in each session below.
          </p>
        )}

        {/* CTA button to current session (members only) */}
        {hasAccess && sessionRef && sessionPageId && (() => {
          const sessionColor = SESSIONS.find(s => s.id === sessionPageId)?.color ?? "#0074F4";
          const btnBg = isLive ? "#10b981" : sessionColor;
          return (
            <a
              href={`/accelerator/session/${sessionPageId}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{ background: `linear-gradient(135deg, ${btnBg}, ${btnBg}cc)` }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {isLive ? <Play size={14} /> : <Calendar size={14} />}
              {isLive ? "Join Live Call" : `Go to Session ${weekNum}`}
              <ArrowRight size={15} />
            </a>
          );
        })()}
    </div>
  );
}

// ─── Upcoming calls list (members only, DB-driven) ─────────────────────────
function UpcomingCallsList({ liveCalls }: { liveCalls: LiveCallItem[] }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const sorted = [...liveCalls].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const upcoming = sorted.filter(c => {
    const utcMs = new Date(c.scheduledAt).getTime();
    const durationMs = (c.durationMinutes ?? 90) * 60 * 1000;
    return utcMs + durationMs > now;
  }).slice(0, 6);
  const pastCount = sorted.filter(c => {
    const utcMs = new Date(c.scheduledAt).getTime();
    const durationMs = (c.durationMinutes ?? 90) * 60 * 1000;
    return utcMs + durationMs <= now;
  }).length;

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
          {upcoming.map((c) => {
            const utcMs = new Date(c.scheduledAt).getTime();
            const durationMs = (c.durationMinutes ?? 90) * 60 * 1000;
            const isLive       = now >= utcMs && now < utcMs + durationMs;
            const isJoinable   = now >= utcMs - JOIN_WINDOW_MS && now < utcMs + durationMs;
            const secsToStart  = Math.max(0, Math.floor((utcMs - now) / 1000));
            const d = Math.floor(secsToStart / 86400);
            const h = Math.floor((secsToStart % 86400) / 3600);
            const m = Math.floor((secsToStart % 3600) / 60);
            const sec = secsToStart % 60;
            const countdownStr = isLive
              ? "🔴 LIVE NOW"
              : d > 0 ? `${d}d ${h}h ${m}m`
              : h > 0 ? `${h}h ${m}m`
              : `${m}m ${sec}s`;

            const dateLabel = new Date(c.scheduledAt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });

            return (
              <div
                key={c.id}
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
                    W{c.sessionNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">
                      Session {c.sessionNumber} · Call {c.callNumber} of 2
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{dateLabel}</p>
                  </div>
                  <span
                    className="text-[11px] font-bold tabular-nums flex-shrink-0"
                    style={{ color: isLive ? "#10b981" : "rgba(255,255,255,0.5)" }}
                  >
                    {countdownStr}
                  </span>
                </div>
                {/* Join button — grayed until 15 min before */}
                <div className="flex justify-end">
                  {isJoinable ? (
                    <a
                      href={c.joinUrl ?? `/accelerator/session/${c.sessionNumber}`}
                      target={c.joinUrl ? "_blank" : undefined}
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
                      Opens 15 min before
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pastCount > 0 && (
        <p className="text-[11px] pt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          ✱ {pastCount} previous session{pastCount > 1 ? "s" : ""} available — click any session below to catch up.
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

  // Fetch DB-backed session data for countdown, registration, and coming soon
  const sessionsQuery = trpc.accelerator.list.useQuery();
  const dbSessions = sessionsQuery.data ?? [];

  // Fetch all live call events for countdown and upcoming list
  const { data: allLiveCalls = [] } = trpc.accelerator.listLiveCalls.useQuery({});
  const visibleLiveCalls = allLiveCalls.filter((c: any) => c.isVisible !== false) as LiveCallItem[];

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
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock size={13} style={{ color: "rgba(0,169,226,0.7)" }} />
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                Live coaching calls every Tuesday & Thursday
              </span>
            </div>

            {/* ── Large Countdown Timer (inline in hero) ── */}
            <LiveCallCountdown hasAccess={hasAccess} liveCalls={visibleLiveCalls} dbSessions={dbSessions} />

            {/* ── "Not registered?" CTA ── */}
            {(() => {
              const now = Date.now();
              const nextSession = dbSessions.find(s => s.sessionDateTime && new Date(s.sessionDateTime).getTime() > now);
              if (nextSession && hasAccess) {
                return (
                  <p className="text-sm mt-4 mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                    Not registered?{" "}
                    <a
                      href={`/accelerator/session/${nextSession.id}`}
                      className="font-semibold underline underline-offset-2 transition-colors"
                      style={{ color: "#4a9eff" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#7dd3fc"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#4a9eff"; }}
                    >
                      Click here to view the next session
                    </a>{" "}
                    where you can register.
                  </p>
                );
              }
              return null;
            })()}


            {reason === "unauthenticated" && (
              <UpgradeCTA reason="unauthenticated" variant="inline" />
            )}
            {reason === "no_access" && (
              <div className="flex flex-col items-center gap-4">
                {week1FreeActive ? (
                  <>
                    <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)", maxWidth: "480px" }}>
                      Session 1 is free through July 26 — upgrade to unlock the full program.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {(() => {
                        const sessionColor = SESSIONS[0]?.color ?? "#0074F4";
                        return (
                          <a
                            href="/accelerator/session/1"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                            style={{ background: `linear-gradient(135deg, ${sessionColor}, ${sessionColor}cc)` }}
                            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                          >
                            <Calendar size={14} />
                            Go to Session 1
                            <ArrowRight size={15} />
                          </a>
                        );
                      })()}
                      <UpgradeCTA reason="no_access" variant="inline" />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "480px" }}>
                      The WAVV Sales Accelerator is included with Quarterly and Annual subscriptions at no additional cost. Monthly subscribers can upgrade their plan to unlock access.
                    </p>
                    <UpgradeCTA reason="no_access" variant="inline" />
                  </>
                )}
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
              // Check visibility state from DB
              const dbSession = dbSessions.find(s => s.id === session.id);
              const isComingSoon = dbSession?.comingSoon ?? false;
              const isPublished = dbSession?.isPublished ?? true;

              // Hidden — don't render at all
              if (!isPublished && !isComingSoon) return null;

              // Coming Soon — show card with badge, not clickable
              if (isComingSoon && hasAccess) {
                return (
                  <div
                    key={session.id}
                    className="rounded-2xl p-6 space-y-4 h-full flex flex-col relative"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", opacity: 0.7 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: `${session.color}12`, color: `${session.color}99` }}>
                        Session {session.id}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                        Coming Soon
                      </span>
                    </div>
                    <h3 className="text-[15px] font-semibold leading-snug" style={{ color: "rgba(255,255,255,0.7)" }}>{session.title}</h3>
                    <p className="text-xs leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                      <span className="font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>WAVV Focus:</span> {session.wavvFocus}
                    </p>
                    <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="flex items-start gap-2">
                        <Clock size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                        <span className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.4)" }}>Content will be available soon</span>
                      </div>
                    </div>
                  </div>
                );
              }

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
                  {prop.title === "Private Slack Community" ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"
                      style={{ filter: `drop-shadow(0 0 5px ${prop.color})` }}>
                      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#f97316"/>
                    </svg>
                  ) : (
                    <prop.icon size={20} style={{ color: prop.color }} />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white">{prop.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed flex-1">{prop.description}</p>
              </div>
            ))}
          </div>
          {/* ── Slack Community banners — immediately after the 6 tiles ── */}
          {/* Non-member locked version */}
          {!hasAccess && (
            <div
              className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
              style={{ background: "linear-gradient(135deg, rgba(74,21,75,0.18) 0%, rgba(74,21,75,0.06) 100%)", border: "1px solid rgba(74,21,75,0.35)", boxShadow: "0 0 32px rgba(74,21,75,0.12)" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(74,21,75,0.25)" }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 0 8px #e01e5a) drop-shadow(0 0 16px #36c5f0)" }}>
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "rgba(236,178,46,0.8)" }}>Community</p>
                <p className="text-base font-bold text-white">Join the WAVV Accelerator Slack</p>
                <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>Connect with your cohort, share wins, and get support between sessions.</p>
              </div>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 cursor-not-allowed select-none" style={{ background: "rgba(74,21,75,0.25)", border: "1px solid rgba(74,21,75,0.4)", color: "rgba(255,255,255,0.35)" }}>
                <Lock size={14} /> Members Only
              </div>
            </div>
          )}
          {/* Member clickable version */}
          {hasAccess && (() => {
            const slackSession = dbSessions.find((s: any) => s.slackUrl);
            if (!slackSession) return null;
            return (
              <div
                className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
                style={{ background: "linear-gradient(135deg, rgba(74,21,75,0.18) 0%, rgba(74,21,75,0.06) 100%)", border: "1px solid rgba(74,21,75,0.35)", boxShadow: "0 0 32px rgba(74,21,75,0.12)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(74,21,75,0.25)" }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 0 8px #e01e5a) drop-shadow(0 0 16px #36c5f0)" }}>
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "rgba(236,178,46,0.8)" }}>Community</p>
                  <p className="text-base font-bold text-white">Join the WAVV Accelerator Slack</p>
                  <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>Connect with your cohort, share wins, and get support between sessions.</p>
                </div>
                <a href={slackSession.slackUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 flex-shrink-0" style={{ background: "linear-gradient(135deg, #4A154B, #611f69)" }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="white"/></svg>
                  Join Slack
                </a>
              </div>
            );
          })()}
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
