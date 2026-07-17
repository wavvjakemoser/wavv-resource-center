/**
 * AcceleratorSession.tsx
 *
 * Individual week/session page for the WAVV Accelerator.
 * URL: /accelerator/session/:id  (id = week number 1–6)
 *
 * Features:
 *  - Hero header band with week badge, title, outcome, and back link
 *  - Live call cards as the dominant visual element
 *  - Mid-cycle late-joiner callout (always visible)
 *  - Session recordings (Loom embed)
 *  - WAVV product training video
 *  - Resource links
 *  - Full 12-session schedule table
 */

import { useParams } from "wouter";
import PortalLayout from "@/components/PortalLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Play,
  FileText,
  Download,
  Lock,
  CheckCircle2,
  Clock,
  Video,
  AlertCircle,
  PlayCircle,
  X,
  User,
  Timer,
} from "lucide-react";
import FloatingVideoPlayer from "@/components/FloatingVideoPlayer";
import ResourceSidePanel, { PanelItem } from "@/components/ResourceSidePanel";

// ─── Embed URL helper (Loom, YouTube, Vimeo) ────────────────────────────────
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const loomShare = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomShare) return `https://www.loom.com/embed/${loomShare[1]}?hide_share=true&hide_owner=true&hideEmojiReactions=true&hideEmbedTopBar=true`;
  const loomEmbed = url.match(/loom\.com\/embed\/([a-zA-Z0-9]+)/);
  if (loomEmbed) return `https://www.loom.com/embed/${loomEmbed[1]}?hide_share=true&hide_owner=true&hideEmojiReactions=true&hideEmbedTopBar=true`;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

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
const JOIN_WINDOW_MS   = 15 * 60 * 1000;

// ─── Week 1 Free Window (must stay in sync with Accelerator.tsx) ─────────────
const WEEK1_FREE_START_UTC = Date.UTC(2026, 6, 10, 0, 0, 0);  // Jul 10 00:00 UTC
const WEEK1_FREE_END_UTC   = Date.UTC(2026, 6, 27, 6, 0, 0);  // Jul 27 00:00 MDT

function isWeek1FreeNow() {
  const now = Date.now();
  return now >= WEEK1_FREE_START_UTC && now < WEEK1_FREE_END_UTC;
}

// ─── Qualifying plans ─────────────────────────────────────────────────────────
const QUALIFYING_PLANS = ["quarterly", "annual"];

function useAcceleratorAccess() {
  const { user } = useAuth();
  const entitlementQuery = trpc.accelerator.getEntitlement.useQuery(undefined, {
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
  const week1FreeActive = isWeek1FreeNow();
  if (!user) return { hasAccess: false, reason: "unauthenticated" as const, isLoading: false, week1FreeActive };
  if (entitlementQuery.isLoading) return { hasAccess: false, reason: "loading" as const, isLoading: true, week1FreeActive };
  const e = entitlementQuery.data;
  if (!e) return { hasAccess: false, reason: "no_access" as const, isLoading: false, week1FreeActive };
  if (e.isEmployee) return { hasAccess: true, reason: "employee" as const, isLoading: false, week1FreeActive };
  if (e.entitled) return { hasAccess: true, reason: "qualifying_plan" as const, isLoading: false, week1FreeActive };
  return { hasAccess: false, reason: "no_access" as const, isLoading: false, week1FreeActive };
}

// ─── Upgrade button (Stripe portal, falls back to pricing page) ──────────────
function UpgradeButton() {
  const manageUrl = trpc.accelerator.getManageSubscriptionUrl.useMutation();
  const handleClick = async () => {
    try {
      const result = await manageUrl.mutateAsync();
      window.location.href = result.url;
    } catch {
      window.open("https://www.wavv.com/pricing", "_blank");
    }
  };
  return (
    <button
      onClick={handleClick}
      disabled={manageUrl.isPending}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold mt-2"
      style={{ background: "#f97316", color: "#fff", opacity: manageUrl.isPending ? 0.7 : 1 }}
    >
      {manageUrl.isPending ? "Loading..." : "Upgrade to Unlock"}
    </button>
  );
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

// ─── Per-session call card (simplified — no countdown) ─────────────────────
function SessionCallCard({ session: s, now, color }: { session: typeof SCHEDULE[0]; now: number; color: string }) {
  const isLive     = now >= s.utcMs && now < s.utcMs + CALL_DURATION_MS;
  const isPast     = now >= s.utcMs + CALL_DURATION_MS;
  const isJoinable = now >= s.utcMs - JOIN_WINDOW_MS && now < s.utcMs + CALL_DURATION_MS;
  const glowColor  = isLive ? "#10b981" : color;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: isLive
          ? "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 100%)"
          : isPast
          ? "rgba(255,255,255,0.02)"
          : `linear-gradient(135deg, ${color}10 0%, ${color}04 100%)`,
        border: isLive
          ? "1px solid rgba(16,185,129,0.35)"
          : isPast
          ? "1px solid rgba(255,255,255,0.05)"
          : `1px solid ${color}25`,
      }}
    >
      {/* Card header bar */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{
          borderBottom: isPast
            ? "1px solid rgba(255,255,255,0.04)"
            : `1px solid ${glowColor}15`,
          background: isLive
            ? "rgba(16,185,129,0.06)"
            : `${glowColor}06`,
        }}
      >
        <div className="flex items-center gap-2.5">
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "#10b981" }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE NOW
            </span>
          )}
          {!isLive && (
            <Calendar size={13} style={{ color: glowColor, opacity: 0.7 }} />
          )}
          <span className="text-sm font-bold text-white">Session {s.sessionInWeek} of 2</span>
          {isPast && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 py-5 space-y-3">
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</p>

        {/* Join button — active only within 15 min window */}
        {isJoinable ? (
          <a
            href={s.joinUrl ?? "#"}
            target={s.joinUrl ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
            style={{ background: isLive ? "#10b981" : `linear-gradient(135deg, ${glowColor}, ${glowColor}cc)` }}
          >
            <Play size={14} />
            Join
          </a>
        ) : isPast ? (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Recording available below if posted.
          </p>
        ) : (
          <span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed select-none"
            style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Play size={14} />
            Join
          </span>
        )}

        {/* Asterisk note */}
        {!isPast && !isJoinable && (
          <p className="text-[11px] italic" style={{ color: "rgba(255,255,255,0.35)" }}>
            * Join button opens 15 minutes before session
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Loom embed ───────────────────────────────────────────────────────────────
function LoomEmbed({ url, title }: { url: string; title: string }) {
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

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom, ${color}, ${color}55)` }} />
      <Icon size={14} style={{ color }} />
      <h2 className="text-sm font-bold text-white tracking-wide">{label}</h2>
    </div>
  );
}

// ─── Full schedule table (all 12 sessions) ────────────────────────────────────
function FullScheduleTable({ currentWeek, now }: { currentWeek: number; now: number }) {
  const weeks = [1, 2, 3, 4, 5, 6];
  return (
    <section>
      <SectionHeader icon={Calendar} label="Full Program Schedule" color="#0074F4" />
      <div className="space-y-2">
        {weeks.map(w => {
          const wSessions = SCHEDULE.filter(s => s.week === w);
          const isCurrentWeek = w === currentWeek;
          return (
            <div
              key={w}
              className="rounded-xl overflow-hidden"
              style={{
                border: isCurrentWeek ? "1px solid rgba(0,116,244,0.35)" : "1px solid rgba(255,255,255,0.05)",
                background: isCurrentWeek ? "rgba(0,116,244,0.05)" : "rgba(255,255,255,0.015)",
              }}
            >
              {/* Week header */}
              <a
                href={`/accelerator/session/${w}`}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
                style={{ textDecoration: "none" }}
              >
                <div className="flex items-center gap-2.5">
                  {isCurrentWeek && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(0,116,244,0.2)", color: "#60a5fa" }}>
                      Current
                    </span>
                  )}
                  <span className="text-sm font-semibold text-white">Session {w}</span>
                </div>
                <span className="text-xs" style={{ color: "rgba(0,116,244,0.7)" }}>View →</span>
              </a>
              {/* Sessions */}
              {wSessions.map(s => {
                const isLive = now >= s.utcMs && now < s.utcMs + CALL_DURATION_MS;
                const isPast = now >= s.utcMs + CALL_DURATION_MS;
                const isJoinable = now >= s.utcMs - JOIN_WINDOW_MS && now < s.utcMs + CALL_DURATION_MS;
                return (
                  <div
                    key={s.id}
                    className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white">Session {s.sessionInWeek} of 2</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isLive && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE
                        </span>
                      )}
                      {!isPast && !isLive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(0,116,244,0.1)", color: "rgba(0,116,244,0.7)" }}>
                          Upcoming
                        </span>
                      )}
                      {isPast && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)" }}>
                          Done
                        </span>
                      )}
                      {isJoinable ? (
                        <a
                          href={s.joinUrl ?? "#"}
                          target={s.joinUrl ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold px-3 py-1 rounded-lg text-white"
                          style={{ background: isLive ? "#10b981" : "#0074F4" }}
                        >
                          Join
                        </a>
                      ) : isPast ? (
                        <a
                          href={`/accelerator/session/${s.week}`}
                          className="text-[11px] font-semibold px-3 py-1 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
                        >
                          Recording
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
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
  const { hasAccess, reason, week1FreeActive } = useAcceleratorAccess();
  const now = useNow();

  const { data: session, isLoading } = trpc.accelerator.get.useQuery({ id: weekId });

  // Fetch dynamic content from CMS (must be before any conditional returns to avoid hook-order issues)
  const { data: sessionContent = [] } = trpc.accelerator.listContent.useQuery({ sessionNumber: weekId });

  // Video player state (must be before any conditional returns)
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  // Cheat sheet side panel state (must be before any conditional returns)
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);

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

  // ─── No-access view (bypass for Session 1 during free window) ─────────────
  const sessionFree = week1FreeActive && weekId === 1;
  if (!hasAccess && !sessionFree) {
    return (
      <PortalLayout title={`Session ${session.week}: ${session.title}`}>
        <div className="px-4 lg:px-8 py-8 max-w-3xl space-y-6">
          <a href="/accelerator" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            Back to Accelerator
          </a>
          <div className="rounded-2xl p-12 text-center space-y-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: `${color}15` }}>
              <Lock size={28} style={{ color }} />
            </div>
            <h2 className="text-xl font-bold text-white">Session {session.week}: {session.title}</h2>
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
              <UpgradeButton />
            )}
          </div>
        </div>
      </PortalLayout>
    );
  }

  // Parse resource links
  let resourceLinks: { label: string; url: string }[] = [];
  try { if (session.resourceLinks) resourceLinks = JSON.parse(session.resourceLinks); } catch { /* ignore */ }

  const weekSessions = SCHEDULE.filter(s => s.week === weekId);

  const cmsRecordings = sessionContent.filter((c: any) => c.contentType === "recording" && c.isVisible);
  const cmsProductTraining = sessionContent.filter((c: any) => c.contentType === "product_training" && c.isVisible);

  // Side panel for cheat sheet PDF viewer
  const sidePanel = (
    <ResourceSidePanel item={panelItem} onClose={() => setPanelItem(null)} pushMode={true} />
  );

  // ─── Member view ─────────────────────────────────────────────────────────
  return (
    <PortalLayout title={`Session ${session.week}: ${session.title}`} rightPanel={sidePanel}>

      {/* ── Hero header band ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `radial-gradient(ellipse 120% 80% at 60% 0%, ${color}28 0%, ${color}08 45%, transparent 75%), #080c14`,
          borderBottom: `1px solid ${color}18`,
        }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color}18, transparent 65%)`, transform: "translate(20%, -30%)" }} />

        <div className="relative z-10 px-4 lg:px-8 py-8 pb-10">
          {/* Back link */}
          <a href="/accelerator" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft size={14} />
            Back to Accelerator
          </a>

          {/* Week badge + title */}
          <div className="flex items-center gap-2.5 mb-3">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: `${color}25`, color, border: `1px solid ${color}35` }}
            >
              Session {session.week}
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            {session.heroHeadline || session.title}
          </h1>
          {(session.heroSubline || session.wavvFocus) && (
            <p className="text-base mb-5" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "600px" }}>
              {session.heroSubline || session.wavvFocus}
            </p>
          )}

          {/* Outcome pill */}
          {session.outcome && (
            <div
              className="inline-flex items-start gap-2.5 rounded-xl px-4 py-3"
              style={{ background: `${color}10`, border: `1px solid ${color}22`, maxWidth: "560px" }}
            >
              <CheckCircle2 size={15} style={{ color }} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: `${color}cc` }}>
                  By the end of this session
                </p>
                <p className="text-sm text-white">{session.outcome}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="px-4 lg:px-8 py-8 space-y-10">

        {/* ── Late-joiner callout ── */}
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3.5"
          style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)" }}
        >
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: "#fbbf24" }}>Joining mid-cycle or catching up?</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              Every previous session recording is available below. Click into any session in the Full Program Schedule to catch up at your own pace.
            </p>
          </div>
        </div>

        {/* ── Registration + Join buttons (DB-driven) ── */}
        <section
          className="rounded-2xl p-5 space-y-3"
          style={{ background: `${color}08`, border: `1px solid ${color}18` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={15} style={{ color }} />
            <h3 className="text-sm font-semibold text-white">Session Access</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Register button — always visible, greyed when no URL */}
            {session.registrationUrl ? (
              <a
                href={session.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
              >
                <FileText size={14} />
                Register
              </a>
            ) : (
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed select-none"
                style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <FileText size={14} />
                Register
              </span>
            )}

            {/* Join button — always visible, active only within 15 min window */}
            {(() => {
              const sessionTime = session.sessionDateTime ? new Date(session.sessionDateTime).getTime() : null;
              const isJoinable = sessionTime && now >= sessionTime - JOIN_WINDOW_MS && now < sessionTime + CALL_DURATION_MS;
              const isLive = sessionTime && now >= sessionTime && now < sessionTime + CALL_DURATION_MS;
              if (isJoinable && session.joinUrl) {
                return (
                  <a
                    href={session.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
                    style={{ background: isLive ? "#10b981" : `linear-gradient(135deg, ${color}, ${color}cc)` }}
                  >
                    <Play size={14} />
                    Join
                  </a>
                );
              }
              return (
                <span
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed select-none"
                  style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <Play size={14} />
                  Join
                </span>
              );
            })()}
            </div>

            {/* Asterisk note */}
            <p className="text-[11px] italic mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
              * Join button opens 15 minutes before session
            </p>
          </section>

        {/* ── Cheat Sheet callout (pinned resource card) ── */}
        {session.cheatSheetUrl && (
          <section
            className="rounded-2xl p-5"
            style={{ background: `${color}08`, border: `1px solid ${color}18` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}15` }}
                >
                  <FileText size={18} style={{ color }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Session {weekId} Resource</p>
                  <p className="text-sm font-semibold text-white">Session Cheat Sheet</p>
                </div>
              </div>
              <button
                onClick={() =>
                  setPanelItem({
                    type: "pdf",
                    title: `Session ${weekId} Cheat Sheet`,
                    url: session.cheatSheetUrl!,
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
              >
                <FileText size={14} /> View Cheat Sheet
              </button>
            </div>
          </section>
        )}

        {/* ── Live call cards — dominant section ── */}
        <section>
          <SectionHeader icon={Clock} label={`Upcoming Live Calls — Session ${weekId}`} color={color} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weekSessions.map(s => (
              <SessionCallCard key={s.id} session={s} now={now} color={color} />
            ))}
          </div>
        </section>

        {/* ── WAVV Product Training (webinar-style cards) ── */}
        <section>
          <SectionHeader icon={Play} label="WAVV Product Training" color={color} />
          {cmsProductTraining.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cmsProductTraining.map((item: any) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  accentColor="#10b981"
                  badgeLabel="Training"
                  onPlay={(url: string, title: string) => setActiveVideo({ url, title })}
                />
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl p-6 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}
            >
              <Play size={24} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.12)" }} />
              <p className="text-xs text-gray-500">Product training video coming soon</p>
            </div>
          )}
        </section>

        {/* ── Previous Session Recordings (webinar-style cards) ── */}
        <section>
          <SectionHeader icon={Video} label="Previous Session Recordings" color={color} />
          {cmsRecordings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cmsRecordings.map((item: any) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  accentColor={color}
                  badgeLabel="Recording"
                  onPlay={(url: string, title: string) => setActiveVideo({ url, title })}
                />
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}
            >
              <Video size={28} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.12)" }} />
              <p className="text-xs text-gray-500">No recordings yet — check back after the live call.</p>
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
          <section>
            <SectionHeader icon={FileText} label="Resources" color={color} />
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

      {/* Floating video player */}
      {activeVideo && (
        <FloatingVideoPlayer
          title={activeVideo.title}
          embedUrl={activeVideo.url}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </PortalLayout>
  );
}

// ─── Default background for content cards ────────────────────────────────────
const DEFAULT_RECORDING_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/wavv-accelerator-unique-thumb-PH5cZf5TmQyJjKNTX8EsfM.webp";
const DEFAULT_TRAINING_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-bg-ondemand-playcircle-86q8N7uvwmsgxRr4MDpcr4.webp";

// ─── Webinar-style content card ──────────────────────────────────────────────
function ContentCard({
  item,
  accentColor,
  badgeLabel,
  onPlay,
}: {
  item: { id: number; title: string; loomUrl?: string | null; thumbnailUrl?: string | null; hostName?: string | null; duration?: string | null; description?: string | null; contentType: string; comingSoon?: boolean };
  accentColor: string;
  badgeLabel: string;
  onPlay: (url: string, title: string) => void;
}) {
  const embedUrl = item.loomUrl ? getEmbedUrl(item.loomUrl) : null;
  const isHostedVideo = item.loomUrl?.startsWith("/manus-storage");
  const defaultBg = item.contentType === "recording" ? DEFAULT_RECORDING_BG : DEFAULT_TRAINING_BG;
  const isComingSoon = item.comingSoon === true;

  function handleWatch() {
    const playUrl = embedUrl ?? (isHostedVideo ? item.loomUrl! : null);
    if (playUrl) onPlay(playUrl, item.title);
  }

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden transition-all duration-200"
      style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.boxShadow = `0 4px 20px ${accentColor}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#252d3d";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: "140px" }}>
        <img
          src={defaultBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.9 }}
        />
        {item.thumbnailUrl && (
          <img
            src={item.thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.92 }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}
        {/* Bottom gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(15,19,24,0.85))" }} />
        {/* Badge */}
        <div className="absolute top-3 right-3">
          <span className="text-[9px] font-bold px-2 py-1 rounded-full tracking-wide uppercase"
            style={{ background: accentColor, color: "#fff" }}>
            {badgeLabel}
          </span>
        </div>
        {/* Play overlay — hidden when Coming Soon */}
        {!isComingSoon && (embedUrl || isHostedVideo) && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={handleWatch}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: `${accentColor}cc`, boxShadow: `0 0 20px ${accentColor}66` }}
            >
              <PlayCircle size={24} className="text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Coming Soon banner */}
      {isComingSoon && (
        <div
          className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold"
          style={{ background: "#FF990022", color: "#FF9900", borderBottom: "1px solid #FF990040" }}
        >
          <Timer size={11} />
          Coming Soon
        </div>
      )}

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-white font-bold text-sm leading-snug mb-2">{item.title}</h3>
        {item.description && (
          <p className="text-gray-500 text-xs leading-relaxed mb-2">{item.description}</p>
        )}
        {item.hostName && (
          <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
            <User size={11} className="text-gray-600" />
            <span className="text-gray-300">{item.hostName}</span>
          </p>
        )}

        <div className="mt-auto">
          {isComingSoon ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "#FF990015", color: "#FF9900", border: "1px solid #FF990030" }}>
              <Timer size={12} /> Coming Soon
            </span>
          ) : (embedUrl || isHostedVideo) ? (
            <button
              type="button"
              onClick={handleWatch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}40` }}
            >
              <PlayCircle size={12} /> Watch Now
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
