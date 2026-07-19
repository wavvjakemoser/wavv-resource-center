/**
 * AcceleratorSession.tsx
 *
 * Individual session hub page for the WAVV Accelerator.
 * URL: /accelerator/session/:id  (id = session number 1-6)
 *
 * Redesigned as a 3-tile hub page (Academy-style):
 *  - Hero header band with session badge, title, outcome, and back link
 *  - 3 clickable tiles: Live Call Events, Product Training, Previous Recordings
 *  - Clicking a tile expands to show content inline below the tiles
 *  - Timer/countdown preserved in hero
 *  - Access gating preserved
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
  Video,
  AlertCircle,
  PlayCircle,
  X,
  User,
  Timer,
  MessageSquare,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import FloatingVideoPlayer from "@/components/FloatingVideoPlayer";
import ResourceSidePanel, { PanelItem } from "@/components/ResourceSidePanel";

// ─── Icon URLs ───────────────────────────────────────────────────────────────
const TILE_ICONS = {
  live: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/acc-icon-live-calls-3fxRXX6hrnFaQfUDmmNmyL.webp",
  training: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/acc-icon-product-training-74W6B56QYPpoptvfwz37bg.webp",
  recordings: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/acc-icon-prev-recordings-6B7nYVcrVn5WYpHnYoGuqN.webp",
};

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

// ─── Live call schedule constants ────────────────────────────────────────────
const CALL_DURATION_MS = 90 * 60 * 1000;
const JOIN_WINDOW_MS   = 15 * 60 * 1000;

// ─── Week 1 Free Window (must stay in sync with Accelerator.tsx) ─────────────
const WEEK1_FREE_START_UTC = Date.UTC(2026, 6, 10, 0, 0, 0);
const WEEK1_FREE_END_UTC   = Date.UTC(2026, 6, 27, 6, 0, 0);

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

// ─── Upgrade button ──────────────────────────────────────────────────────────
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

// ─── Countdown hook ──────────────────────────────────────────────────────────
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ─── Per-session call card (DB-driven, webinar-style) ───────────────────────
interface LiveCallRecord {
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
}

const DEFAULT_LIVE_CALL_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/wavv-accelerator-unique-thumb-PH5cZf5TmQyJjKNTX8EsfM.webp";

function SessionCallCard({ call, now, color, isCurrentWeek }: { call: LiveCallRecord; now: number; color: string; isCurrentWeek: boolean }) {
  const utcMs = new Date(call.scheduledAt).getTime();
  const durationMs = (call.durationMinutes ?? 90) * 60 * 1000;
  const isLive     = now >= utcMs && now < utcMs + durationMs;
  const isPast     = now >= utcMs + durationMs;
  const isJoinable = now >= utcMs - JOIN_WINDOW_MS && now < utcMs + durationMs;
  const glowColor  = isLive ? "#10b981" : color;

  const dateLabel = new Date(call.scheduledAt).toLocaleString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden transition-all duration-200"
      style={{ background: "#1d2230", border: isLive ? "1px solid rgba(16,185,129,0.4)" : isPast ? "1px solid #252d3d" : `1px solid ${color}30` }}
      onMouseEnter={(e) => { if (!isPast) { e.currentTarget.style.borderColor = glowColor; e.currentTarget.style.boxShadow = `0 4px 20px ${glowColor}22`; } }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = isLive ? "rgba(16,185,129,0.4)" : isPast ? "#252d3d" : `${color}30`; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Thumbnail header */}
      <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: "160px" }}>
        <img src={DEFAULT_LIVE_CALL_BG} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.9, objectPosition: "center 30%" }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${glowColor}20 0%, transparent 60%)` }} />
        {call.thumbnailUrl && (
          <img src={call.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.92 }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(15,19,24,0.85))" }} />
        <div className="absolute top-3 right-3">
          {isLive ? (
            <span className="flex items-center gap-1.5 text-[9px] font-bold px-2 py-1 rounded-full tracking-wide uppercase" style={{ background: "#10b981", color: "#fff" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE NOW
            </span>
          ) : isPast ? (
            <span className="text-[9px] font-bold px-2 py-1 rounded-full tracking-wide uppercase" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)" }}>Completed</span>
          ) : (
            <span className="text-[9px] font-bold px-2 py-1 rounded-full tracking-wide uppercase select-none pointer-events-none" style={{ background: glowColor, color: "#fff" }}>Call {call.callNumber} of 2</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-3 flex flex-col gap-2">
        <h3 className="text-white font-bold text-sm leading-snug">{call.title}</h3>
        {call.description && <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{call.description}</p>}
        <p className="text-gray-500 text-xs flex items-center gap-1.5">
          <Calendar size={11} className="text-gray-600" />
          <span className="text-gray-300">{dateLabel}</span>
        </p>

        {/* CTA buttons */}
        <div className="pt-3 flex flex-col items-center gap-2" style={{ borderTop: `1px solid ${glowColor}18` }}>
          <div className="flex items-center justify-center gap-3 w-full">
            {!isPast && call.registrationUrl && (
              <a
                href={call.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: `${glowColor}22`, color: glowColor, border: `1px solid ${glowColor}40` }}
              >
                Register
              </a>
            )}
            {isJoinable ? (
              <a
                href={call.joinUrl ?? "#"}
                target={call.joinUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
                style={{ background: isLive ? "#10b981" : `linear-gradient(135deg, ${glowColor}, ${glowColor}cc)` }}
              >
                <Play size={14} />
                {isLive ? "Join Live" : "Join"}
              </a>
            ) : isPast ? (
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Recording available below if posted.</p>
            ) : (
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed select-none"
                style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Play size={14} /> Join
              </span>
            )}
          </div>
          {!isPast && !isJoinable && (
            <p className="text-[10px] italic" style={{ color: "rgba(255,255,255,0.35)" }}>* Join button opens 15 minutes before session</p>
          )}
        </div>
      </div>
    </div>
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
  onCheatSheet,
}: {
  item: { id: number; title: string; loomUrl?: string | null; thumbnailUrl?: string | null; hostName?: string | null; duration?: string | null; description?: string | null; contentType: string; comingSoon?: boolean; cheatSheetUrl?: string | null };
  accentColor: string;
  badgeLabel: string;
  onPlay: (url: string, title: string) => void;
  onCheatSheet?: (url: string, title: string) => void;
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
      <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: "160px" }}>
        {item.thumbnailUrl ? (
          <>
            <img
              src={item.thumbnailUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.92 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(15,19,24,0.85))" }} />
          </>
        ) : (
          <>
            <img src={defaultBg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.9 }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accentColor}18 0%, transparent 60%)` }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(15,19,24,0.85))" }} />
          </>
        )}
        <div className="absolute top-3 right-3">
          <span className="text-[9px] font-bold px-2 py-1 rounded-full tracking-wide uppercase"
            style={{ background: accentColor, color: "#fff" }}>
            {badgeLabel}
          </span>
        </div>
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

      {isComingSoon && (
        <div
          className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold"
          style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", borderBottom: "1px solid rgba(245,158,11,0.3)" }}
        >
          <Timer size={11} />
          Coming Soon
        </div>
      )}

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

        <div className="mt-auto flex items-center gap-2 flex-wrap">
          {isComingSoon ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
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
          {!isComingSoon && item.cheatSheetUrl && onCheatSheet && (
            <button
              type="button"
              onClick={() => onCheatSheet(item.cheatSheetUrl!, item.title)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}30` }}
            >
              <FileText size={12} /> Cheat Sheet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Hub Tile component (Academy-style) ──────────────────────────────────────
function HubTile({ title, subtitle, icon, color, count, isActive, onClick }: {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl block cursor-pointer transition-all duration-200 hover:scale-[1.01] text-left w-full"
      style={{
        border: isActive ? `2px solid ${color}` : `1px solid ${color}40`,
        height: "200px",
        boxShadow: isActive ? `0 0 24px ${color}30, inset 0 0 0 1px ${color}60` : `0 0 0 1px ${color}15, 0 4px 24px ${color}12`,
      }}
    >
      {/* Deep space black base */}
      <div className="absolute inset-0" style={{ background: "#000" }} />

      {/* Circuit board SVG pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.1 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`circuit-tile-${title.replace(/\s/g, "")}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={color} strokeWidth="0.8" fill="none"/>
            <circle cx="10" cy="10" r="2" fill={color}/>
            <circle cx="50" cy="10" r="2" fill={color}/>
            <circle cx="50" cy="50" r="2" fill={color}/>
            <circle cx="30" cy="30" r="1.5" fill={color}/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#circuit-tile-${title.replace(/\s/g, "")})`}/>
      </svg>

      {/* Radial color glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 120% 100% at 80% 50%, ${color}25 0%, ${color}08 45%, transparent 75%)` }} />

      {/* Top edge neon line */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: "1px", background: `linear-gradient(to right, transparent 0%, ${color}60 30%, ${color}90 60%, transparent 100%)` }} />

      {/* Hover border pulse */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `inset 0 0 0 1px ${color}80, 0 0 24px ${color}30` }} />

      {/* Content */}
      <div className="relative flex items-center h-full px-6 py-5 gap-5">
        {/* Icon */}
        <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <img src={icon} alt="" className="w-10 h-10 object-contain" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
        </div>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-extrabold text-white leading-tight mb-1">{title}</h3>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{subtitle}</p>
          {count > 0 && (
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
              {count} {count === 1 ? "item" : "items"}
            </span>
          )}
        </div>
        {/* Arrow */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isActive ? `${color}30` : "rgba(255,255,255,0.04)" }}>
          <ChevronRight size={16} style={{ color: isActive ? color : "rgba(255,255,255,0.4)" }} className={isActive ? "rotate-90 transition-transform" : "transition-transform"} />
        </div>
      </div>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AcceleratorSession() {
  const params = useParams<{ id: string }>();
  const weekId = parseInt(params.id ?? "1", 10);
  const { hasAccess, reason, week1FreeActive } = useAcceleratorAccess();
  const now = useNow();

  const { data: session, isLoading } = trpc.accelerator.get.useQuery({ id: weekId });

  // Fetch dynamic content from CMS
  const { data: sessionContent = [] } = trpc.accelerator.listContent.useQuery({ sessionNumber: weekId });

  // DB-driven live calls
  const { data: liveCalls = [] } = trpc.accelerator.listLiveCalls.useQuery({ sessionNumber: weekId });
  const { data: allLiveCalls = [] } = trpc.accelerator.listLiveCalls.useQuery({});

  // Video player state
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  // Cheat sheet side panel state
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);

  // Active tile section (null = none expanded)
  const [activeSection, setActiveSection] = useState<"live" | "training" | "recordings" | null>(null);

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
              \u2190 Back to Accelerator
            </a>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const color = session.color ?? "#0074F4";

  // ─── No-access view ─────────────────────────────────────────────────────────
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

  // Determine if this page's week is the "current" active week
  const nextCall = allLiveCalls.find((c: any) => new Date(c.scheduledAt).getTime() + (c.durationMinutes ?? 90) * 60 * 1000 > now);
  const isCurrentWeek = nextCall ? nextCall.sessionNumber === weekId : false;

  const cmsRecordings = sessionContent.filter((c: any) => c.contentType === "recording" && c.isVisible);
  const cmsProductTraining = sessionContent.filter((c: any) => c.contentType === "product_training" && c.isVisible);

  const visibleLiveCalls = liveCalls.filter((c: any) => c.isVisible !== false);

  // Side panel for cheat sheet PDF viewer
  const sidePanel = (
    <ResourceSidePanel item={panelItem} onClose={() => setPanelItem(null)} pushMode={true} />
  );

  // Toggle section
  const toggleSection = (section: "live" | "training" | "recordings") => {
    setActiveSection(prev => prev === section ? null : section);
  };

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
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color}18, transparent 65%)`, transform: "translate(20%, -30%)" }} />

        <div className="relative z-10 px-4 lg:px-8 py-8 pb-10">
          <a href="/accelerator" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft size={14} />
            Back to Accelerator
          </a>

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
      <div className="px-4 lg:px-8 py-8 space-y-8">

        {/* ── Late-joiner callout ── */}
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3.5"
          style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)" }}
        >
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: "#fbbf24" }}>Joining mid-cycle or catching up?</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              Every previous session recording is available below. You can catch up at your own pace.
            </p>
          </div>
        </div>

        {/* ── 3 Hub Tiles ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <HubTile
            title="Live Call Events"
            subtitle="Join live coaching calls or view upcoming schedule"
            icon={TILE_ICONS.live}
            color={color}
            count={visibleLiveCalls.length}
            isActive={activeSection === "live"}
            onClick={() => toggleSection("live")}
          />
          <HubTile
            title="Product Training"
            subtitle="WAVV how-to clips and cheat sheets for this session"
            icon={TILE_ICONS.training}
            color={color}
            count={cmsProductTraining.length}
            isActive={activeSection === "training"}
            onClick={() => toggleSection("training")}
          />
          <HubTile
            title="Previous Recordings"
            subtitle="Catch up on past session recordings at your own pace"
            icon={TILE_ICONS.recordings}
            color={color}
            count={cmsRecordings.length}
            isActive={activeSection === "recordings"}
            onClick={() => toggleSection("recordings")}
          />
        </div>

        {/* ── Expanded content section ── */}
        {activeSection === "live" && (
          <section className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom, ${color}, ${color}55)` }} />
              <Clock size={14} style={{ color }} />
              <h2 className="text-sm font-bold text-white tracking-wide">Upcoming Live Calls \u2014 Session {weekId}</h2>
            </div>
            {visibleLiveCalls.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-sm text-gray-400">No live call events scheduled for this session yet.</p>
                <p className="text-xs text-gray-500 mt-1">Check back soon or contact your success manager.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleLiveCalls.map((c: any) => (
                  <SessionCallCard key={c.id} call={c} now={now} color={color} isCurrentWeek={isCurrentWeek} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === "training" && (
          <section className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom, ${color}, ${color}55)` }} />
              <Play size={14} style={{ color }} />
              <h2 className="text-sm font-bold text-white tracking-wide">WAVV Product Training</h2>
            </div>

            {/* Cheat Sheet callout */}
            {session.cheatSheetUrl && (
              <div
                className="rounded-xl p-4 mb-4 flex items-center justify-between"
                style={{ background: `${color}08`, border: `1px solid ${color}18` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                    <FileText size={16} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Session {weekId} Resource</p>
                    <p className="text-sm font-semibold text-white">Session Cheat Sheet</p>
                  </div>
                </div>
                <button
                  onClick={() => setPanelItem({ type: "pdf", title: `Session ${weekId} Cheat Sheet`, url: session.cheatSheetUrl! })}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                >
                  <FileText size={14} /> View Cheat Sheet
                </button>
              </div>
            )}

            {cmsProductTraining.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cmsProductTraining.map((item: any) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    accentColor={color}
                    badgeLabel="Training"
                    onPlay={(url: string, title: string) => setActiveVideo({ url, title })}
                    onCheatSheet={(url: string, title: string) => setPanelItem({ type: "pdf", title: `${title} \u2014 Cheat Sheet`, url })}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl p-6 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
                <Play size={24} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.12)" }} />
                <p className="text-xs text-gray-500">Product training video coming soon</p>
              </div>
            )}
          </section>
        )}

        {activeSection === "recordings" && (
          <section className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom, ${color}, ${color}55)` }} />
              <Video size={14} style={{ color }} />
              <h2 className="text-sm font-bold text-white tracking-wide">Previous Session Recordings</h2>
            </div>
            {cmsRecordings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cmsRecordings.map((item: any) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    accentColor={color}
                    badgeLabel="Recording"
                    onPlay={(url: string, title: string) => setActiveVideo({ url, title })}
                    onCheatSheet={(url: string, title: string) => setPanelItem({ type: "pdf", title: `${title} \u2014 Cheat Sheet`, url })}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl p-8 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
                <Video size={28} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.12)" }} />
                <p className="text-xs text-gray-500">No recordings yet \u2014 check back after the live call.</p>
              </div>
            )}
          </section>
        )}

        {/* ── Resource links ── */}
        {resourceLinks.length > 0 && (
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom, ${color}, ${color}55)` }} />
              <FileText size={14} style={{ color }} />
              <h2 className="text-sm font-bold text-white tracking-wide">Resources</h2>
            </div>
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

        {/* ── Community ── */}
        <section>
          <h2 className="text-sm font-bold text-white tracking-wide mb-4">Community</h2>
          {session.slackUrl ? (
            <div
              className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-white">WAVV Accelerator Slack Community</p>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>Connect with your cohort, share wins, ask questions, and get support between live sessions.</p>
              </div>
              <a
                href={session.slackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                Join Slack
              </a>
            </div>
          ) : (
            <div
              className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-white">WAVV Accelerator Slack Community</p>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>Connect with your cohort, share wins, ask questions, and get support between live sessions.</p>
              </div>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold flex-shrink-0 cursor-not-allowed select-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
                <Lock size={14} /> Link Coming Soon
              </div>
            </div>
          )}
        </section>

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
