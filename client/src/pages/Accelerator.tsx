import PortalLayout from "@/components/PortalLayout";
import { Link } from "wouter";
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
    color: "#00A9E2",
  },
  {
    id: 3,
    week: 3,
    title: "The Conversation: Sales Psychology",
    wavvFocus: "Power/multi-line dialing, using local presence, live-call controls, voicemail drops",
    outcome: "Confident running the dialer during real conversations",
    color: "#67C728",
  },
  {
    id: 4,
    week: 4,
    title: "Follow-Up Systems That Convert",
    wavvFocus: "Dispositions, tags, follow-up cadences, SMS/texting, and reminders inside WAVV",
    outcome: "A repeatable follow-up cadence built in WAVV",
    color: "#0074F4",
  },
  {
    id: 5,
    week: 5,
    title: "Objection Handling",
    wavvFocus: "Call recordings & notes to review calls; saved scripts/snippets for fast responses",
    outcome: "Uses recordings + saved scripts to improve call over call",
    color: "#00A9E2",
  },
  {
    id: 6,
    week: 6,
    title: "The 1-Call Close & Wins Review",
    wavvFocus: "Pipeline/disposition reporting; CRM sync; reading conversion stats to find the next lever",
    outcome: "Can track closes in WAVV and see which lever to move next",
    color: "#67C728",
  },
];

const VALUE_PROPS = [
  {
    title: "Sales Accelerator Program",
    description: "Live coaching calls twice a week, built around the Money Math equation: more dials → more conversations → more closes.",
    color: "#0074F4",
  },
  {
    title: "WAVV Product Training",
    description: "Short how-to clips and cheat sheets mapped to each module — learn the sales skill AND how to execute it in WAVV.",
    color: "#00A9E2",
  },
  {
    title: "Community & Accountability",
    description: "Weekly leaderboards, peer mentorship, and a wins channel to keep you dialing and celebrating results.",
    color: "#67C728",
  },
  {
    title: "Live Calls & Recordings",
    description: "Join live Tuesday/Thursday coaching calls or catch up with on-demand recordings at your own pace.",
    color: "#0074F4",
  },
  {
    title: "Milestones & Recognition",
    description: "Earn badges and rewards tied to real activity — first dial, 100 dials, first appointment, first close.",
    color: "#00A9E2",
  },
  {
    title: "Private Slack Community",
    description: "Connect with your cohort, share wins, ask questions, and get peer support between live sessions.",
    color: "#67C728",
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
    q: "Is this available on all plans?",
    a: "Yes. The WAVV Sales Accelerator is available to all WAVV users at no additional cost, regardless of your plan.",
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

// ─── Access logic (open to all — no plan gating) ──────────────────────────────
function useAcceleratorAccess() {
  const { user } = useAuth();
  const isEmployee = !!(user as any)?.isEmployee && (user as any)?.approvalStatus === "approved";
  return { hasAccess: true, user, isLoading: false, isEmployee };
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
    <div className="flex flex-col items-center text-center gap-3 mt-2">
      {/* Title row */}
      <div className="space-y-1">
        {/* Status pill */}
        <div className="flex items-center justify-center gap-2">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE NOW
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: "rgba(0,116,244,0.12)", color: "#60a5fa", border: "1px solid rgba(0,116,244,0.25)" }}>
              <Calendar size={10} />
              NEXT LIVE CALL
            </span>
          )}
          {sessionRef && !usingFallback && callNum && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>
              Session {weekNum} · Call {callNum} of 2
            </span>
          )}
          {sessionRef && (usingFallback || !callNum) && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>
              Session {weekNum}
            </span>
          )}
        </div>
        {dateLabel && (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
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
                    className="w-[60px] sm:w-[72px] h-[60px] sm:h-[72px] rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: `linear-gradient(160deg, ${glowColor}22 0%, ${glowColor}0a 100%)`,
                      border: `1.5px solid ${glowColor}40`,
                      boxShadow: `0 0 18px ${glowColor}18, inset 0 1px 0 rgba(255,255,255,0.08)`,
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${glowColor}50, transparent)` }} />
                    <p
                      className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight"
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
                  <div className="flex flex-col gap-1.5 pb-6 flex-shrink-0">
                    <div className="w-1 h-1 rounded-full" style={{ background: `${glowColor}60` }} />
                    <div className="w-1 h-1 rounded-full" style={{ background: `${glowColor}60` }} />
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
  const { hasAccess, user, isLoading: accessLoading, isEmployee: isApprovedEmployee } = useAcceleratorAccess();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Fetch site settings (for Slack banner visibility)
  const { data: siteSettings = {} } = trpc.siteSettings.getAll.useQuery();
  const slackBannerEnabled = siteSettings["slack_banner_accelerator_enabled"] !== false;

  // Fetch DB-backed session data for countdown, registration, and coming soon
  const sessionsQuery = trpc.accelerator.list.useQuery();
  const dbSessions = sessionsQuery.data ?? [];

  // Fetch all live call events for countdown and upcoming list
  const { data: allLiveCalls = [] } = trpc.accelerator.listLiveCalls.useQuery({});
  const visibleLiveCalls = allLiveCalls.filter((c: any) => c.isVisible !== false) as LiveCallItem[];

  const accessResolved = !accessLoading;

  return (
    <PortalLayout title="WAVV Accelerator">
      <div className="px-4 lg:px-8 py-6 space-y-14 pb-24">




        {/* ── Hero ── */}
        <div className="px-4 sm:px-6 lg:px-16 py-8 sm:py-12 text-center">
            {/* Headline */}
            <h1 className="font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}>
              <span style={{ background: "linear-gradient(135deg, #ffffff 0%, #bae6fd 30%, #7dd3fc 60%, #67C728 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                WAVV Accelerator
              </span>
            </h1>

            {/* Accent line */}
            <div className="flex justify-center mb-5">
  
            </div>

            {/* Subline */}
            <p className="mx-auto mb-4 leading-relaxed" style={{ color: "#ffffff", fontSize: "clamp(0.85rem, 1.5vw, 0.95rem)", maxWidth: "540px" }}>
              Complete the WAVV Accelerator and walk away with a fully configured dialer, a proven outreach cadence, and the skills to hit your connection rate targets.
            </p>
            {/* Schedule line */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock size={13} style={{ color: "rgba(0,169,226,0.7)" }} />
              <span className="text-xs font-medium text-white">
                Live coaching calls every Tuesday & Thursday
              </span>
            </div>



            {/* ── "Not registered?" CTA ── */}
            {(() => {
              const now = Date.now();
              const nextSession = dbSessions.find(s => s.sessionDateTime && new Date(s.sessionDateTime).getTime() > now);
              if (nextSession && hasAccess) {
                return (
                  <p className="text-sm mt-4 mb-4 text-white">
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



        </div>{/* end hero */}


        {/* ── Curriculum (tiles — gated or unlocked) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-white">The Curriculum</h2>
            </div>
          </div>
          <div className="space-y-5">
            {SESSIONS.map((session) => {
              // Check visibility state from DB
              const dbSession = dbSessions.find(s => s.id === session.id);
              const isComingSoon = dbSession?.comingSoon ?? false;
              const isPublished = dbSession?.isPublished ?? true;

              // Hidden — don't render at all
              if (!isPublished && !isComingSoon) return null;

              // Coming Soon — full-width banner with Coming Soon badge on right
              if (isComingSoon && hasAccess) {
                return (
                  <div
                    key={session.id}
                    className="group relative overflow-hidden rounded-2xl block"
                    style={{
                      border: `1px solid ${session.color}40`,
                      height: "180px",
                    }}
                  >
                    <div className="absolute inset-0" style={{ background: "#000" }} />
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.1 }} xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`circuit-acc-${session.id}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                          <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={session.color} strokeWidth="0.8" fill="none"/>
                          <circle cx="10" cy="10" r="2" fill={session.color}/>
                          <circle cx="50" cy="10" r="2" fill={session.color}/>
                          <circle cx="50" cy="50" r="2" fill={session.color}/>
                          <circle cx="30" cy="30" r="1.5" fill={session.color}/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#circuit-acc-${session.id})`}/>
                    </svg>
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 120% 100% at 70% 50%, ${session.color}20 0%, ${session.color}08 45%, transparent 75%)` }} />
                    <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: "1px", background: `linear-gradient(to right, transparent 0%, ${session.color}50 30%, ${session.color}80 60%, transparent 100%)` }} />
                    <div className="relative flex items-center h-full px-8 py-6 gap-6">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: session.color }}>
                          WAVV Accelerator
                        </p>
                        <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-1">
                          {session.title}
                        </h2>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{session.outcome}</p>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full flex-shrink-0" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>Coming Soon</span>
                    </div>
                  </div>
                );
              }

              // All sessions are open to everyone
              return (
                  <a
                    key={session.id}
                    href={`/accelerator/session/${session.id}`}
                    className="group relative overflow-hidden rounded-2xl block cursor-pointer transition-all duration-200 hover:scale-[1.005]"
                    style={{
                      textDecoration: "none",
                      border: `1px solid ${session.color}60`,
                      height: "180px",
                      boxShadow: `0 0 0 1px ${session.color}20, 0 4px 32px ${session.color}18`,
                    }}
                  >
                    {/* Deep space black base */}
                    <div className="absolute inset-0" style={{ background: "#000" }} />

                    {/* Circuit board SVG pattern */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`circuit-acc-${session.id}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                          <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={session.color} strokeWidth="0.8" fill="none"/>
                          <circle cx="10" cy="10" r="2" fill={session.color}/>
                          <circle cx="50" cy="10" r="2" fill={session.color}/>
                          <circle cx="50" cy="50" r="2" fill={session.color}/>
                          <circle cx="30" cy="30" r="1.5" fill={session.color}/>
                          <path d="M0 30 L10 30 M60 50 L50 50" stroke={session.color} strokeWidth="0.6" fill="none"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#circuit-acc-${session.id})`}/>
                    </svg>

                    {/* Full-width radial color glow */}
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 120% 100% at 70% 50%, ${session.color}28 0%, ${session.color}10 45%, transparent 75%)` }} />

                    {/* Secondary glow — left edge */}
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 80% at 15% 50%, ${session.color}12 0%, transparent 60%)` }} />

                    {/* Neon scan line */}
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, ${session.color}06 0%, ${session.color}12 50%, ${session.color}06 100%)` }} />

                    {/* Top edge neon line */}
                    <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: "1px", background: `linear-gradient(to right, transparent 0%, ${session.color}60 30%, ${session.color}90 60%, transparent 100%)` }} />

                    {/* Hover neon border pulse */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `inset 0 0 0 1px ${session.color}80, 0 0 24px ${session.color}30` }} />

                    {/* Content overlay */}
                    <div className="relative flex items-center h-full px-8 py-6 gap-6">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: session.color }}>
                          WAVV Accelerator
                        </p>
                        <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-1">
                          {session.title}
                        </h2>
                        <p className="text-sm text-white" style={{ maxWidth: "500px" }}>{session.outcome}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ background: `${session.color}20` }}>
                        <ChevronRight size={20} style={{ color: session.color }} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </a>
              );
            })}
          </div>

        </section>



        {/* ── The Partnership ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-white">The Partnership</h2>
          </div>
          <div
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Two-column partnership layout */}
            <div className="flex flex-col md:flex-row gap-0 md:gap-0">
              {/* WAVV side */}
              <div className="flex-1 flex flex-col items-center text-center px-4 py-4 gap-4">
                <div className="h-12 flex items-center justify-center">
                  <img src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png" alt="WAVV" className="h-8 w-auto object-contain" />
                </div>
                <p className="text-sm leading-relaxed text-white">
                  WAVV is a native multi-line power dialer that lives inside your CRM. We provide the product training layer — short how-to clips, cheat sheets, and guided walkthroughs — so you can immediately apply every sales skill inside the dialer.
                </p>
              </div>
              {/* Divider */}
              <div className="hidden md:flex flex-col items-center justify-center px-4">
                <div className="w-px h-full min-h-[80px]" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="my-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,116,244,0.1)", border: "1px solid rgba(0,116,244,0.2)" }}>
                  <Handshake size={16} style={{ color: "rgba(0,116,244,0.6)" }} />
                </div>
                <div className="w-px h-full min-h-[80px]" style={{ background: "rgba(255,255,255,0.08)" }} />
              </div>
              <div className="md:hidden w-full flex items-center gap-3 py-3 px-4">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,116,244,0.1)", border: "1px solid rgba(0,116,244,0.2)" }}>
                  <Handshake size={14} style={{ color: "rgba(0,116,244,0.6)" }} />
                </div>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              </div>
              {/* POD side */}
              <div className="flex-1 flex flex-col items-center text-center px-4 py-4 gap-4">
                <div className="h-12 flex items-center justify-center">
                  <a href="https://prospectingondemand.com" target="_blank" rel="noopener noreferrer">
                    <img src="/manus-storage/pod_icon_417b718b.webp" alt="Prospecting On Demand" className="h-12 w-auto object-contain hover:opacity-80 transition-opacity" />
                  </a>
                </div>
                <p className="text-sm leading-relaxed text-white">
                  POD is a team of experienced outbound sales trainers who specialize in turning reps into closers. They own the live coaching curriculum — objection handling, conversation frameworks, follow-up systems, and the mindset work that separates top performers.
                </p>
              </div>
            </div>
            {/* Bottom summary */}
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-sm text-center text-white">
                Together, we combine <span className="font-medium" style={{ color: "#0074F4" }}>hands-on product training</span> with <span className="font-medium" style={{ color: "#f97316" }}>live sales coaching</span> — so every skill you learn gets applied inside the tool you're already using.
              </p>
            </div>
          </div>
        </section>

        {/* ── What's Included ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-white">What's Included</h2>
          <div className="space-y-4">
            {VALUE_PROPS.map((prop, idx) => (
              <div
                key={prop.title}
                className="group relative overflow-hidden rounded-2xl transition-all duration-200 hover:scale-[1.003]"
                style={{
                  border: `1px solid ${prop.color}40`,
                  height: "120px",
                  boxShadow: `0 0 0 1px ${prop.color}15, 0 4px 24px ${prop.color}10`,
                }}
              >
                {/* Black base */}
                <div className="absolute inset-0" style={{ background: "#000" }} />

                {/* Circuit pattern */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.10 }} xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id={`circuit-inc-${idx}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={prop.color} strokeWidth="0.8" fill="none"/>
                      <circle cx="10" cy="10" r="2" fill={prop.color}/>
                      <circle cx="50" cy="10" r="2" fill={prop.color}/>
                      <circle cx="50" cy="50" r="2" fill={prop.color}/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#circuit-inc-${idx})`}/>
                </svg>

                {/* Radial glow */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 120% 100% at 80% 50%, ${prop.color}20 0%, transparent 70%)` }} />

                {/* Top neon line */}
                <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: "1px", background: `linear-gradient(to right, transparent 0%, ${prop.color}50 30%, ${prop.color}80 60%, transparent 100%)` }} />

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `inset 0 0 0 1px ${prop.color}60, 0 0 20px ${prop.color}20` }} />

                {/* Content */}
                <div className="relative flex items-center h-full px-6 py-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white mb-1">{prop.title}</h3>
                    <p className="text-sm text-white" style={{ maxWidth: "500px" }}>{prop.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Community ── */}
        {slackBannerEnabled && (
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-white">Community</h2>
          {(() => {
            const slackSession = dbSessions.find((s: any) => s.slackUrl);
            return (
              <div
                className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white">WAVV Accelerator Slack Community</p>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>Connect with your cohort, share wins, ask questions, and get support between live sessions.</p>
                </div>
                {slackSession?.slackUrl ? (
                  <a href={slackSession.slackUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 flex-shrink-0"
                    style={{ background: "#0074F4" }}>
                    Join Slack
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold flex-shrink-0 cursor-not-allowed select-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}>
                    Link Coming Soon
                  </span>
                )}
              </div>
            );
          })()}
        </section>
        )}

        {/* ── FAQ ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-white">FAQs</h2>
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
                    <p className="text-sm leading-relaxed text-white">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Money Math Section ── */}
        <section className="rounded-2xl p-8 text-center space-y-4"
          style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.12)" }}>
          <h2 className="text-2xl font-extrabold text-white">The Money Math Equation</h2>
          <p className="text-2xl lg:text-3xl font-bold" style={{ color: "#f97316" }}>
            Dials → Conversations → Appointments → Closes × Price = Revenue
          </p>
          <p className="text-sm max-w-lg mx-auto text-white">
            Every module in the Accelerator is designed to improve one lever of this equation.
            WAVV is the engine that drives the volume. The Accelerator teaches you how to maximize every other lever.
          </p>
        </section>




      </div>


    </PortalLayout>
  );
}
