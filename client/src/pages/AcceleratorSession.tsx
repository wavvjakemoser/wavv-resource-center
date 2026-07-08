/**
 * AcceleratorSession.tsx
 *
 * Individual week/session page for the WAVV Accelerator.
 * URL: /accelerator/session/:id  (id = week number 1–6)
 *
 * Features:
 *  - Session header with week/title/outcome
 *  - Per-session countdown timer (D/H/M/S) to each live call in this week
 *  - Join button: grayed out until 30 min before, active during call window
 *  - Full 12-session schedule with per-row countdown and join buttons
 *  - Loom recording slots: admin pastes a Loom URL in the DB, it embeds here
 *  - WAVV product training video slot
 *  - Resource links
 */

import { useParams } from "wouter";
import PortalLayout from "@/components/PortalLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  Play,
  FileText,
  Download,
  Lock,
  CheckCircle2,
  Clock,
  ChevronRight,
  Video,
} from "lucide-react";

// ─── Shared schedule (must stay in sync with Accelerator.tsx) ─────────────────
const SCHEDULE: { id: number; week: number; sessionInWeek: 1 | 2; label: string; utcMs: number; joinUrl?: string }[] = [
  { id: 1,  week: 1, sessionInWeek: 1, label: "Tuesday, July 21st, 2026 · 12:00 PM MT / 2:00 PM ET",    utcMs: Date.UTC(2026, 6, 21, 18, 0, 0) },
  { id: 2,  week: 1, sessionInWeek: 2, label: "Thursday, July 23rd, 2026 · 12:00 PM MT / 2:00 PM ET",   utcMs: Date.UTC(2026, 6, 23, 18, 0, 0) },
  { id: 3,  week: 2, sessionInWeek: 1, label: "Tuesday, July 28th, 2026 · 12:00 PM MT / 2:00 PM ET",    utcMs: Date.UTC(2026, 6, 28, 18, 0, 0) },
  { id: 4,  week: 2, sessionInWeek: 2, label: "Thursday, July 30th, 2026 · 12:00 PM MT / 2:00 PM ET",   utcMs: Date.UTC(2026, 6, 30, 18, 0, 0) },
  { id: 5,  week: 3, sessionInWeek: 1, label: "Tuesday, August 4th, 2026 · 12:00 PM MT / 2:00 PM ET",   utcMs: Date.UTC(2026, 7, 4,  18, 0, 0) },
  { id: 6,  week: 3, sessionInWeek: 2, label: "Thursday, August 6th, 2026 · 12:00 PM MT / 2:00 PM ET",  utcMs: Date.UTC(2026, 7, 6,  18, 0, 0) },
  { id: 7,  week: 4, sessionInWeek: 1, label: "Tuesday, August 11th, 2026 · 12:00 PM MT / 2:00 PM ET",  utcMs: Date.UTC(2026, 7, 11, 18, 0, 0) },
  { id: 8,  week: 4, sessionInWeek: 2, label: "Thursday, August 13th, 2026 · 12:00 PM MT / 2:00 PM ET", utcMs: Date.UTC(2026, 7, 13, 18, 0, 0) },
  { id: 9,  week: 5, sessionInWeek: 1, label: "Tuesday, August 18th, 2026 · 12:00 PM MT / 2:00 PM ET",  utcMs: Date.UTC(2026, 7, 18, 18, 0, 0) },
  { id: 10, week: 5, sessionInWeek: 2, label: "Thursday, August 20th, 2026 · 12:00 PM MT / 2:00 PM ET", utcMs: Date.UTC(2026, 7, 20, 18, 0, 0) },
  { id: 11, week: 6, sessionInWeek: 1, label: "Tuesday, August 25th, 2026 · 12:00 PM MT / 2:00 PM ET",  utcMs: Date.UTC(2026, 7, 25, 18, 0, 0) },
  { id: 12, week: 6, sessionInWeek: 2, label: "Thursday, August 27th, 2026 · 12:00 PM MT / 2:00 PM ET", utcMs: Date.UTC(2026, 7, 27, 18, 0, 0) },
];

const CALL_DURATION_MS = 90 * 60 * 1000;
const JOIN_WINDOW_MS   = 30 * 60 * 1000;

// ─── Qualifying plans ─────────────────────────────────────────────────────────
const QUALIFYING_PLANS = ["quarterly", "annual"];

function useAcceleratorAccess() {
  const { user } = useAuth();
  if (!user) return { hasAccess: false, reason: "unauthenticated" as const };
  const isApprovedEmployee = (user as any)?.isEmployee && (user as any)?.approvalStatus === "approved";
  if (isApprovedEmployee) return { hasAccess: true, reason: "employee" as const };
  const plan = ((user as any)?.wavvPlan ?? "").toLowerCase();
  const subStatus = ((user as any)?.subscriptionStatus ?? "").toUpperCase();
  const hasQualifyingPlan = QUALIFYING_PLANS.some((p) => plan.includes(p)) && subStatus === "ACTIVE";
  if (hasQualifyingPlan) return { hasAccess: true, reason: "qualifying_plan" as const };
  return { hasAccess: false, reason: "no_access" as const };
}

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function fmtCountdown(totalSeconds: number) {
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { d, h, m, s };
}

// ─── Per-session countdown + join card ───────────────────────────────────────
function SessionCallCard({
  session: s,
  now,
  color,
}: {
  session: typeof SCHEDULE[0];
  now: number;
  color: string;
}) {
  const isLive     = now >= s.utcMs && now < s.utcMs + CALL_DURATION_MS;
  const isPast     = now >= s.utcMs + CALL_DURATION_MS;
  const isJoinable = now >= s.utcMs - JOIN_WINDOW_MS && now < s.utcMs + CALL_DURATION_MS;
  const secsLeft   = Math.max(0, Math.floor((s.utcMs - now) / 1000));
  const cd         = fmtCountdown(secsLeft);

  const bgColor   = isLive ? "rgba(16,185,129,0.07)" : isPast ? "rgba(255,255,255,0.01)" : `${color}06`;
  const border    = isLive ? "1px solid rgba(16,185,129,0.3)" : isPast ? "1px solid rgba(255,255,255,0.04)" : `1px solid ${color}20`;
  const glowColor = isLive ? "#10b981" : color;

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: bgColor, border }}>
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm font-bold text-white">
            {isLive && <span className="mr-2 text-emerald-400">🔴 LIVE NOW</span>}
            Session {s.sessionInWeek} of 2
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</p>
        </div>
        {isPast && (
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
            Completed
          </span>
        )}
      </div>

      {/* Countdown digits — segmented display style with colon separators */}
      {!isPast && (
        <div className="flex items-end gap-1">
          {[{ val: cd.d, label: "Days" }, { val: cd.h, label: "Hrs" }, { val: cd.m, label: "Min" }, { val: cd.s, label: "Sec" }].map(({ val, label }, idx) => (
            <div key={label} className="flex items-end gap-1">
              <div className="text-center">
                <div
                  className="w-[60px] h-[60px] rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(160deg, ${glowColor}22 0%, ${glowColor}0a 100%)`,
                    border: `1.5px solid ${glowColor}40`,
                    boxShadow: `0 0 14px ${glowColor}15, inset 0 1px 0 rgba(255,255,255,0.07)`,
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${glowColor}50, transparent)` }} />
                  <p
                    className="text-2xl font-black tabular-nums tracking-tight"
                    style={{ color: "#fff", textShadow: `0 0 16px ${glowColor}70` }}
                  >
                    {String(val).padStart(2, "0")}
                  </p>
                </div>
                <p className="mt-1 text-[8px] uppercase tracking-[0.15em] font-bold" style={{ color: `${glowColor}99` }}>
                  {label}
                </p>
              </div>
              {idx < 3 && (
                <div className="flex flex-col gap-1.5 pb-6 flex-shrink-0">
                  <div className="w-1 h-1 rounded-full" style={{ background: `${glowColor}55` }} />
                  <div className="w-1 h-1 rounded-full" style={{ background: `${glowColor}55` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Join button */}
      <div>
        {isJoinable ? (
          <a
            href={s.joinUrl ?? "#"}
            target={s.joinUrl ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: isLive ? "#10b981" : glowColor }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <Play size={14} />
            {isLive ? "Join Live Call" : "Join Waiting Room"}
          </a>
        ) : isPast ? (
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Recording available below if posted.
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Lock size={13} />
            Join link opens 30 min before
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Loom embed ───────────────────────────────────────────────────────────────
function LoomEmbed({ url, title }: { url: string; title: string }) {
  // Convert share URL to embed URL
  // https://www.loom.com/share/abc123 → https://www.loom.com/embed/abc123
  const embedUrl = url.replace("loom.com/share/", "loom.com/embed/");
  return (
    <div className="rounded-2xl overflow-hidden" style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
      <iframe
        src={embedUrl}
        title={title}
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
}

// ─── Full schedule table (all 12 sessions) ────────────────────────────────────
function FullScheduleTable({ currentWeek, now }: { currentWeek: number; now: number }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Calendar size={16} style={{ color: "#0074F4" }} />
        Full Program Schedule
      </h2>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        {SCHEDULE.map((s, idx) => {
          const isLive     = now >= s.utcMs && now < s.utcMs + CALL_DURATION_MS;
          const isPast     = now >= s.utcMs + CALL_DURATION_MS;
          const isJoinable = now >= s.utcMs - JOIN_WINDOW_MS && now < s.utcMs + CALL_DURATION_MS;
          const isThisWeek = s.week === currentWeek;
          const secsLeft   = Math.max(0, Math.floor((s.utcMs - now) / 1000));
          const cd         = fmtCountdown(secsLeft);

          const countdownStr = isLive
            ? "🔴 LIVE"
            : isPast
            ? "Done"
            : cd.d > 0 ? `${cd.d}d ${cd.h}h`
            : cd.h > 0 ? `${cd.h}h ${cd.m}m`
            : `${cd.m}m ${cd.s}s`;

          return (
            <div
              key={s.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: isLive
                  ? "rgba(16,185,129,0.07)"
                  : isThisWeek
                  ? "rgba(0,116,244,0.05)"
                  : idx % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                borderBottom: idx < SCHEDULE.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
            >
              {/* Week badge */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                style={{
                  background: isLive ? "rgba(16,185,129,0.15)" : isThisWeek ? "rgba(0,116,244,0.15)" : "rgba(255,255,255,0.05)",
                  color: isLive ? "#10b981" : isThisWeek ? "#4a9eff" : "rgba(255,255,255,0.35)",
                }}
              >
                W{s.week}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: isPast ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)" }}>
                  Session {s.sessionInWeek} of 2
                  {isThisWeek && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(0,116,244,0.15)", color: "#4a9eff" }}>This Week</span>}
                </p>
                <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
              </div>

              {/* Countdown */}
              <span
                className="text-[11px] font-bold tabular-nums flex-shrink-0 mr-2"
                style={{ color: isLive ? "#10b981" : isPast ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.45)" }}
              >
                {countdownStr}
              </span>

              {/* Join button */}
              {isJoinable ? (
                <a
                  href={s.joinUrl ?? `/accelerator/session/${s.week}`}
                  target={s.joinUrl ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white flex-shrink-0 transition-all"
                  style={{ background: isLive ? "#10b981" : "#0074F4" }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  <Play size={10} />
                  {isLive ? "Join" : "Waiting Room"}
                </a>
              ) : isPast ? (
                <a
                  href={`/accelerator/session/${s.week}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium flex-shrink-0 transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                >
                  <ChevronRight size={10} />
                  Recording
                </a>
              ) : (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium flex-shrink-0 cursor-not-allowed"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <Lock size={9} />
                  Soon
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AcceleratorSession() {
  const params = useParams<{ id: string }>();
  const weekId = parseInt(params.id ?? "1", 10);
  const { hasAccess, reason } = useAcceleratorAccess();
  const now = useNow();

  // Load session from database
  const { data: session, isLoading } = trpc.accelerator.get.useQuery({ id: weekId });

  if (isLoading) {
    return (
      <PortalLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PortalLayout>
    );
  }

  if (!session) {
    return (
      <PortalLayout title="Session Not Found">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <p className="text-gray-400">Session not found.</p>
            <a href="/accelerator" className="text-sm font-medium" style={{ color: "#0074F4" }}>
              ← Back to Accelerator
            </a>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const color = session.color ?? "#0074F4";

  if (!hasAccess) {
    return (
      <PortalLayout title={`Week ${session.week}: ${session.title}`}>
        <div className="px-4 lg:px-8 py-8 max-w-4xl mx-auto space-y-6">
          <a href="/accelerator" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            Back to Accelerator
          </a>
          <div className="rounded-2xl p-12 text-center space-y-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: `${color}15` }}>
              <Lock size={28} style={{ color }} />
            </div>
            <h2 className="text-xl font-bold text-white">Week {session.week}: {session.title}</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              This session is available to WAVV Quarterly and Annual subscribers.
            </p>
            {reason === "unauthenticated" ? (
              <a href="/api/oauth/login?return_path=/accelerator"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold mt-2"
                style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)", color: "#fff" }}>
                Sign In to Check Access
              </a>
            ) : (
              <a href="https://www.wavv.com/pricing" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold mt-2"
                style={{ background: "#f97316", color: "#fff" }}>
                Upgrade to Unlock
              </a>
            )}
          </div>
        </div>
      </PortalLayout>
    );
  }

  // Parse resource links
  let resourceLinks: { label: string; url: string }[] = [];
  try {
    if (session.resourceLinks) resourceLinks = JSON.parse(session.resourceLinks);
  } catch { /* ignore */ }

  // Sessions for this week
  const weekSessions = SCHEDULE.filter(s => s.week === weekId);

  // Recordings: parse from session.recordingUrls (JSON array of {label, url}) if available
  let recordings: { label: string; url: string }[] = [];
  try {
    if ((session as any).recordingUrls) recordings = JSON.parse((session as any).recordingUrls);
  } catch { /* ignore */ }

  // ─── Member view ─────────────────────────────────────────────────────────────
  return (
    <PortalLayout title={`Week ${session.week}: ${session.title}`}>
      <div className="px-4 lg:px-8 py-8 space-y-8">
        {/* Back link */}
        <a href="/accelerator" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          Back to Accelerator
        </a>

        {/* Session header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: `${color}20`, color }}>
              Week {session.week}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">{session.heroHeadline || session.title}</h1>
          {session.heroSubline && <p className="text-sm text-gray-300">{session.heroSubline}</p>}
          {!session.heroSubline && session.wavvFocus && <p className="text-sm text-gray-400">{session.wavvFocus}</p>}
        </div>

        {/* Outcome */}
        {session.outcome && (
          <div className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
            <CheckCircle2 size={18} style={{ color }} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-300">By the end of this week, you will:</p>
              <p className="text-sm text-white mt-1">{session.outcome}</p>
            </div>
          </div>
        )}

        {/* ── Live call cards for this week ── */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock size={16} style={{ color }} />
            Upcoming Live Calls — Week {weekId}
          </h2>
          <div className="space-y-3">
            {weekSessions.map(s => (
              <SessionCallCard key={s.id} session={s} now={now} color={color} />
            ))}
          </div>
        </section>

        {/* ── Recordings ── */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Video size={16} style={{ color }} />
            Session Recordings
          </h2>
          {recordings.length > 0 ? (
            <div className="space-y-5">
              {recordings.map((rec, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm font-medium text-white">{rec.label}</p>
                  <LoomEmbed url={rec.url} title={rec.label} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl p-6 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
              <Video size={24} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
              <p className="text-xs text-gray-500">No recordings yet — check back after the live call.</p>
            </div>
          )}
        </section>

        {/* ── WAVV Product Training video ── */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Play size={16} style={{ color }} />
            WAVV Product Training
          </h2>
          {session.videoUrl ? (
            <div className="rounded-2xl overflow-hidden aspect-video">
              <iframe
                src={session.videoUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                style={{ border: "none" }}
              />
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden aspect-video flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-center space-y-2">
                <Play size={40} style={{ color: "rgba(255,255,255,0.15)" }} />
                <p className="text-xs text-gray-500">Product training video coming soon</p>
              </div>
            </div>
          )}
        </section>

        {/* ── Body content ── */}
        {session.bodyContent && (
          <section>
            <div
              className="prose prose-invert prose-sm max-w-none rounded-xl p-5"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              dangerouslySetInnerHTML={{ __html: session.bodyContent }}
            />
          </section>
        )}

        {/* ── Resource links ── */}
        {resourceLinks.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText size={16} style={{ color }} />
              Resources
            </h2>
            <div className="space-y-2">
              {resourceLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="rounded-xl p-4 flex items-center gap-3 transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}30`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                    <Download size={18} style={{ color }} />
                  </div>
                  <span className="text-sm font-medium text-white">{link.label}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Full 12-session schedule ── */}
        <FullScheduleTable currentWeek={weekId} now={now} />
      </div>
    </PortalLayout>
  );
}
