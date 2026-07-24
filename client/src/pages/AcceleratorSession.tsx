/**
 * AcceleratorSession.tsx
 *
 * Individual session hub page for the WAVV Accelerator.
 * URL: /accelerator/:id  (id = session number 1-6)
 *
 * Redesigned as a 3-tile hub page (Academy-style):
 *  - Hero header band with session badge, title, outcome, and back link
 *  - 3 clickable tiles: Live Call Events, Product Training, Previous Recordings
 *  - Clicking a tile expands to show content inline below the tiles
 *  - Timer/countdown preserved in hero
 *  - Access gating preserved
 */

import { useParams, Link } from "wouter";
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
import { useVideoPlayer } from "@/contexts/VideoPlayerContext";
import ResourceSidePanel, { PanelItem } from "@/components/ResourceSidePanel";

// ─── Icon URLs ───────────────────────────────────────────────────────────────
const TILE_ICONS = {
  live: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/acc-icon-live-v2-5SLFaHmkSJiRcBLANHk9Ux.webp",
  training: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/acc-icon-training-v2-Ah5NsXzGWXLs5JLhmnHNvb.webp",
  recordings: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/acc-icon-recordings-v2-2H8NKAbyymnW7VVmXdYEvx.webp",
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

// ─── Banner Tile component (full-bleed Academy-style with big icon on right) ──
const BANNER_ICONS = {
  live: "/manus-storage/final-accel-live-sign-transparent_581be7cc.png",
  training: "/manus-storage/accel-training-cyan-transparent-final_f3e37c72.png",
  recordings: "/manus-storage/final-accel-recordings-v3-transparent_ec91855f.png",
};

// ─── Tile-specific colors ────────────────────────────────────────────────────
const TILE_COLORS = {
  live: "#0074F4",       // blue
  training: "#00A9E2",  // cyan
  recordings: "#67C728", // green
};

function BannerTile({ title, subtitle, bannerIcon, color, count, href }: {
  title: string;
  subtitle: string;
  bannerIcon: string;
  color: string;
  count: number;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group relative overflow-hidden rounded-2xl block cursor-pointer transition-all duration-200 hover:scale-[1.01] text-left w-full"
      style={{
        border: `1px solid ${color}60`,
        height: "260px",
        boxShadow: `0 0 0 1px ${color}20, 0 4px 32px ${color}18`,
        textDecoration: "none",
      }}
    >
      {/* Deep space black base */}
      <div className="absolute inset-0" style={{ background: "#000" }} />

      {/* Circuit board SVG pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`banner-tile-${title.replace(/\s/g, "")}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={color} strokeWidth="0.8" fill="none"/>
            <circle cx="10" cy="10" r="2" fill={color}/>
            <circle cx="50" cy="10" r="2" fill={color}/>
            <circle cx="50" cy="50" r="2" fill={color}/>
            <circle cx="30" cy="30" r="1.5" fill={color}/>
            <path d="M0 30 L10 30 M60 50 L50 50" stroke={color} strokeWidth="0.6" fill="none"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#banner-tile-${title.replace(/\s/g, "")})`}/>
      </svg>

      {/* Full-width radial color glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 120% 100% at 70% 50%, ${color}28 0%, ${color}10 45%, transparent 75%)` }} />

      {/* Neon scan line */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, ${color}06 0%, ${color}12 50%, ${color}06 100%)` }} />

      {/* Top edge neon line */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: "1px", background: `linear-gradient(to right, transparent 0%, ${color}60 30%, ${color}90 60%, transparent 100%)` }} />

      {/* Full-bleed thumbnail — covers entire tile as background */}
      <img src={bannerIcon} alt="" loading="eager" fetchPriority="high" className="hidden" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${bannerIcon})`,
          backgroundSize: "50% auto",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right center",
          opacity: 0.85,
        }}
      />

      {/* Dark gradient overlay — left side for text legibility */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)" }} />

      {/* Hover neon border pulse */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `inset 0 0 0 1px ${color}80, 0 0 24px ${color}30` }} />

      {/* Content overlay */}
      <div className="relative flex flex-col justify-center h-full px-8 py-6 gap-1">
        <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color }}>WAVV Accelerator</p>
        <h3 className="text-4xl font-extrabold text-white leading-tight mb-1">{title}</h3>
        <p className="text-base text-white mb-3" style={{ maxWidth: "420px" }}>{subtitle}</p>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: `${color}35`, color, border: `1px solid ${color}` }}>
              {count} {count === 1 ? "item" : "items"}
            </span>
          </div>
        )}
      </div>
    </a>
  );
}

// ─── Sub-page banner header (AcademyCategory-style) ─────────────────────────
function SubPageBanner({ title, subtitle, bannerIcon, color }: {
  title: string;
  subtitle: string;
  bannerIcon: string;
  color: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        border: `1px solid ${color}60`,
        height: "260px",
        boxShadow: `0 0 0 1px ${color}20, 0 4px 32px ${color}18`,
      }}
    >
      {/* Deep space black base */}
      <div className="absolute inset-0" style={{ background: "#000" }} />

      {/* Circuit board SVG pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`subpage-banner-${title.replace(/\s/g, "")}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={color} strokeWidth="0.8" fill="none"/>
            <circle cx="10" cy="10" r="2" fill={color}/>
            <circle cx="50" cy="10" r="2" fill={color}/>
            <circle cx="50" cy="50" r="2" fill={color}/>
            <circle cx="30" cy="30" r="1.5" fill={color}/>
            <path d="M0 30 L10 30 M60 50 L50 50" stroke={color} strokeWidth="0.6" fill="none"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#subpage-banner-${title.replace(/\s/g, "")})`}/>
      </svg>

      {/* Full-width radial color glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 120% 100% at 70% 50%, ${color}28 0%, ${color}10 45%, transparent 75%)` }} />

      {/* Neon scan line */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, ${color}06 0%, ${color}12 50%, ${color}06 100%)` }} />

      {/* Top edge neon line */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: "1px", background: `linear-gradient(to right, transparent 0%, ${color}60 30%, ${color}90 60%, transparent 100%)` }} />

      {/* Full-bleed thumbnail — covers entire tile as background */}
      <img src={bannerIcon} alt="" loading="eager" fetchPriority="high" className="hidden" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${bannerIcon})`,
          backgroundSize: "50% auto",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right center",
          opacity: 0.85,
        }}
      />

      {/* Dark gradient overlay — left side for text legibility */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)" }} />

      {/* Content overlay */}
      <div className="relative flex flex-col justify-center h-full px-8 py-6 gap-1">
        <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color }}>
          WAVV Accelerator
        </p>
        <h2 className="text-4xl font-extrabold text-white leading-tight mb-1">{title}</h2>
        <p className="text-base text-white" style={{ maxWidth: "420px" }}>{subtitle}</p>
      </div>
    </div>
  );
}

// ─── FlipDigit (flip-clock style digit box) ────────────────────────────────
function FlipDigit({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative overflow-hidden"
        style={{
          width: "48px",
          height: "58px",
          borderRadius: "8px",
          border: `1.5px solid ${color}30`,
          boxShadow: `0 4px 12px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Top half background */}
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: "50%", background: "linear-gradient(180deg, #1e2536 0%, #161c28 100%)" }}
        />
        {/* Bottom half background */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: "50%", background: "linear-gradient(180deg, #111825 0%, #171d2a 100%)" }}
        />
        {/* Center split line */}
        <div className="absolute inset-x-0" style={{ top: "calc(50% - 1px)", height: "2px", background: "#000", zIndex: 2 }}>
          <div className="absolute inset-x-0 bottom-0" style={{ height: "1px", background: "rgba(255,255,255,0.03)" }} />
        </div>
        {/* Hinge notches */}
        <div className="absolute left-0 rounded-r-sm" style={{ top: "calc(50% - 3px)", width: "3px", height: "6px", background: "rgba(0,0,0,0.8)", zIndex: 3 }} />
        <div className="absolute right-0 rounded-l-sm" style={{ top: "calc(50% - 3px)", width: "3px", height: "6px", background: "rgba(0,0,0,0.8)", zIndex: 3 }} />
        {/* Single centered number */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
          <span
            className="font-mono font-black text-[28px] leading-none"
            style={{ color: "#ffffff", textShadow: `0 0 12px ${color}40, 0 1px 3px rgba(0,0,0,0.4)` }}
          >
            {value}
          </span>
        </div>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </span>
    </div>
  );
}

// ─── LiveCallRow (Academy-style list row with countdown timer) ────────────
function LiveCallRow({ call, now, color, index }: { call: LiveCallRecord; now: number; color: string; index: number }) {
  const utcMs = new Date(call.scheduledAt).getTime();
  const durationMs = (call.durationMinutes ?? 90) * 60 * 1000;
  const isLive = now >= utcMs && now < utcMs + durationMs;
  const isPast = now >= utcMs + durationMs;
  const isJoinable = now >= utcMs - JOIN_WINDOW_MS && now < utcMs + durationMs;

  const secondsLeft = Math.max(0, Math.floor((utcMs - now) / 1000));
  const cd = { d: Math.floor(secondsLeft / 86400), h: Math.floor((secondsLeft % 86400) / 3600), m: Math.floor((secondsLeft % 3600) / 60), s: secondsLeft % 60 };

  const dateLabel = new Date(call.scheduledAt).toLocaleString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{ background: "#1d2230", border: `1px solid ${isLive ? "rgba(16,185,129,0.4)" : `${color}30`}` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = isLive ? "rgba(16,185,129,0.5)" : color; e.currentTarget.style.boxShadow = `0 2px 12px ${isLive ? "rgba(16,185,129,0.15)" : `${color}15`}`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = isLive ? "rgba(16,185,129,0.4)" : `${color}30`; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Left accent bar */}
        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: isLive ? "#10b981" : color }} />

        {/* Title + date */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-snug">{index + 1}. {call.title}</p>
          <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Calendar size={11} />
            {dateLabel}
          </p>
        </div>

        {/* Countdown / status */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {isLive ? (
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide" style={{ background: "#10b981", color: "#fff" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          ) : isPast ? (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>Completed</span>
          ) : (
            <div className="flex items-center gap-1.5">
              <FlipDigit value={String(cd.d).padStart(2, "0")} label="days" color={color} />
              <span className="text-lg font-bold" style={{ color: `${color}80` }}>:</span>
              <FlipDigit value={String(cd.h).padStart(2, "0")} label="hrs" color={color} />
              <span className="text-lg font-bold" style={{ color: `${color}80` }}>:</span>
              <FlipDigit value={String(cd.m).padStart(2, "0")} label="min" color={color} />
              <span className="text-lg font-bold" style={{ color: `${color}80` }}>:</span>
              <FlipDigit value={String(cd.s).padStart(2, "0")} label="sec" color={color} />
            </div>
          )}

          {/* Action buttons */}
          {!isPast && call.registrationUrl && (
            <a
              href={call.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ background: `${color}22`, color, border: `1px solid ${color}40` }}
            >
              Register
            </a>
          )}
          {isJoinable ? (
            <a
              href={call.joinUrl ?? "#"}
              target={call.joinUrl ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-85"
              style={{ background: isLive ? "#10b981" : color }}
            >
              <Play size={12} /> {isLive ? "Join Live" : "Join"}
            </a>
          ) : !isPast ? (
            <span
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-not-allowed select-none"
              style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Play size={12} /> Join
            </span>
          ) : null}
        </div>
      </div>
      {!isPast && !isJoinable && (
        <div className="px-5 pb-3">
          <p className="text-[10px] italic" style={{ color: "rgba(255,255,255,0.3)" }}>* Join button opens 15 minutes before session</p>
        </div>
      )}
    </div>
  );
}

// ─── ContentRow (Academy-style list row with Watch button) ───────────────
function ContentRow({
  item,
  index,
  accentColor,
  onPlay,
  onCheatSheet,
}: {
  item: { id: number; title: string; loomUrl?: string | null; hostName?: string | null; description?: string | null; contentType: string; comingSoon?: boolean; cheatSheetUrl?: string | null };
  index: number;
  accentColor: string;
  onPlay: (url: string, title: string) => void;
  onCheatSheet?: (url: string, title: string) => void;
}) {
  const embedUrl = item.loomUrl ? getEmbedUrl(item.loomUrl) : null;
  const isHostedVideo = item.loomUrl?.startsWith("/manus-storage");
  const isComingSoon = item.comingSoon === true;
  const hasVideo = !isComingSoon && (!!embedUrl || !!isHostedVideo);

  function handleWatch() {
    const playUrl = embedUrl ?? (isHostedVideo ? item.loomUrl! : null);
    if (playUrl) onPlay(playUrl, item.title);
  }

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{ background: "#1d2230", border: `1px solid ${accentColor}30` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 2px 12px ${accentColor}15`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${accentColor}30`; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Left accent bar */}
        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: accentColor }} />

        {/* Title + host */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-snug">{index + 1}. {item.title}</p>
          {item.hostName && (
            <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              <User size={11} />
              {item.hostName}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isComingSoon ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
              <Timer size={12} /> Coming Soon
            </span>
          ) : hasVideo ? (
            <button
              type="button"
              onClick={handleWatch}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}40` }}
            >
              <PlayCircle size={12} /> Watch
            </button>
          ) : null}
          {!isComingSoon && item.cheatSheetUrl && onCheatSheet && (
            <button
              type="button"
              onClick={() => onCheatSheet(item.cheatSheetUrl!, item.title)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AcceleratorSession() {
  const params = useParams<{ id: string; section?: string }>();
  const weekId = parseInt(params.id ?? "1", 10);
  // Access is open to all users — no plan gating
  const hasAccess = true;
  const now = useNow();

  const { data: session, isLoading } = trpc.accelerator.get.useQuery({ id: weekId });

  // Fetch dynamic content from CMS
  const { data: sessionContent = [] } = trpc.accelerator.listContent.useQuery({ sessionNumber: weekId });

  // DB-driven live calls
  const { data: liveCalls = [] } = trpc.accelerator.listLiveCalls.useQuery({ sessionNumber: weekId });
  const { data: allLiveCalls = [] } = trpc.accelerator.listLiveCalls.useQuery({});

  // Video player state
  const { playVideo: globalPlayVideo } = useVideoPlayer();

  // Cheat sheet side panel state
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);

  // Active section from URL param (sub-route)
  const activeSection = params.section as "live-calls" | "product-training" | "recordings" | undefined;

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
            <Link href="/accelerator" className="text-sm font-medium" style={{ color: "#0074F4" }}>
              \u2190 Back to Accelerator
            </Link>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const color = session.color ?? "#0074F4";


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



  // ─── Member view ─────────────────────────────────────────────────────────
  return (
    <PortalLayout title={`${session.title}`} rightPanel={sidePanel}>

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
          <Link href="/accelerator" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft size={14} />
            Back to Accelerator
          </Link>

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

        {/* ── Back to session hub when in sub-section ── */}
        {activeSection && (
          <a href={`/accelerator/${weekId}`} className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white" style={{ color }}>
            <ArrowLeft size={14} />
            Back to Overview
          </a>
        )}

        {/* ── Late-joiner callout (only on hub view) ── */}
        {!activeSection && (
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
        )}

        {/* ── 3 Banner Tiles (link to sub-URLs) ── */}
        {!activeSection && (
          <div className="flex flex-col gap-5">
            <BannerTile
              title="Live Call Events"
              subtitle="Join live coaching calls or view the upcoming schedule"
              bannerIcon={BANNER_ICONS.live}
              color={TILE_COLORS.live}
              count={visibleLiveCalls.length}
              href={`/accelerator/${weekId}/live-calls`}
            />
            <BannerTile
              title="Product Training"
              subtitle="WAVV how-to clips and cheat sheets for this session"
              bannerIcon={BANNER_ICONS.training}
              color={TILE_COLORS.training}
              count={cmsProductTraining.length}
              href={`/accelerator/${weekId}/product-training`}
            />
            <BannerTile
              title="Previous Recordings"
              subtitle="Catch up on past session recordings at your own pace"
              bannerIcon={BANNER_ICONS.recordings}
              color={TILE_COLORS.recordings}
              count={cmsRecordings.length}
              href={`/accelerator/${weekId}/recordings`}
            />
          </div>
        )}

        {/* ── Expanded content section (Academy-style list rows) ── */}
        {activeSection === "live-calls" && (
          <section className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <SubPageBanner
              title="Live Call Events"
              subtitle={`Upcoming live coaching calls`}
              bannerIcon={BANNER_ICONS.live}
              color={TILE_COLORS.live}
            />
            {visibleLiveCalls.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-sm text-gray-400">No live call events scheduled for this session yet.</p>
                <p className="text-xs text-gray-500 mt-1">Check back soon or contact your success manager.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleLiveCalls.map((c: any, idx: number) => (
                  <LiveCallRow key={c.id} call={c} now={now} color={TILE_COLORS.live} index={idx} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === "product-training" && (
          <section className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <SubPageBanner
              title="Product Training"
              subtitle={`WAVV how-to clips and cheat sheets`}
              bannerIcon={BANNER_ICONS.training}
              color={TILE_COLORS.training}
            />

            {/* Cheat Sheet callout */}
            {session.cheatSheetUrl && (
              <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ background: `${TILE_COLORS.training}08`, border: `1px solid ${TILE_COLORS.training}18` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${TILE_COLORS.training}15` }}>
                    <FileText size={16} style={{ color: TILE_COLORS.training }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Resource</p>
                    <p className="text-sm font-semibold text-white">Cheat Sheet</p>
                  </div>
                </div>
                <button
                  onClick={() => setPanelItem({ type: "pdf", title: `Cheat Sheet`, url: session.cheatSheetUrl! })}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
                  style={{ background: `linear-gradient(135deg, ${TILE_COLORS.training}, ${TILE_COLORS.training}cc)` }}
                >
                  <FileText size={14} /> View Cheat Sheet
                </button>
              </div>
            )}

            {cmsProductTraining.length > 0 ? (
              <div className="space-y-3">
                {cmsProductTraining.map((item: any, idx: number) => (
                  <ContentRow
                    key={item.id}
                    item={item}
                    index={idx}
                    accentColor={TILE_COLORS.training}
                    onPlay={(url: string, title: string) => globalPlayVideo(url, title)}
                    onCheatSheet={(url: string, title: string) => setPanelItem({ type: "pdf", title: `${title} \u2014 Cheat Sheet`, url })}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl p-6 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
                <Play size={24} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.12)" }} />
                <p className="text-xs text-gray-500">Product training videos coming soon</p>
              </div>
            )}
          </section>
        )}

        {activeSection === "recordings" && (
          <section className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <SubPageBanner
              title="Previous Recordings"
              subtitle={`Catch up on past session recordings`}
              bannerIcon={BANNER_ICONS.recordings}
              color={TILE_COLORS.recordings}
            />
            {cmsRecordings.length > 0 ? (
              <div className="space-y-3">
                {cmsRecordings.map((item: any, idx: number) => (
                  <ContentRow
                    key={item.id}
                    item={item}
                    index={idx}
                    accentColor={TILE_COLORS.recordings}
                    onPlay={(url: string, title: string) => globalPlayVideo(url, title)}
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

        {/* ── Resource links (hub view only) ── */}
        {!activeSection && (<>
        {resourceLinks.length > 0 && (
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <FileText size={14} style={{ color }} />
              <h2 className="text-base font-extrabold text-white tracking-wide">Resources</h2>
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
          <h2 className="text-base font-extrabold text-white tracking-wide mb-4">Community</h2>
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
                style={{ background: "#0074F4", border: "1px solid #0074F4" }}
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
        </>)}

      </div>


    </PortalLayout>
  );
}
