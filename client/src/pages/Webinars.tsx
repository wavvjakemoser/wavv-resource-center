import { useState, useEffect, useRef } from "react";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import {
  Video, Calendar, Clock, ExternalLink, PlayCircle,
  Users, Star, RefreshCw, Timer, X, PictureInPicture2, Maximize2,
  Play, Mic, Radio, UserCheck, GraduationCap,
  BarChart3, TrendingUp, Activity, Target, Zap,
  Phone, PhoneCall, Headphones, MessageSquare, Mail,
  BookOpen, FileText, Lightbulb, Award, Trophy, Rocket,
  PhoneOutgoing, PhoneMissed, PhoneOff, ListChecks, ClipboardList,
  Crosshair, Megaphone, Repeat, RotateCcw, Shuffle,
  Clapperboard, MonitorPlay, Eye,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ContentRequestCTA } from "./Academy";
import FloatingVideoPlayer from "@/components/FloatingVideoPlayer";

// ─── Countdown helper ─────────────────────────────────────────────────────────
function nextHalfHour(): Date {
  const now = new Date();
  const ms = now.getTime();
  const interval = 30 * 60 * 1000;
  return new Date(Math.ceil(ms / interval) * interval);
}

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(() => Math.max(0, target.getTime() - Date.now()));
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, target.getTime() - Date.now()));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const totalSec = Math.floor(remaining / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Loom embed URL converter ─────────────────────────────────────────────────
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // Loom share URL → embed URL
  const loomShare = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomShare) return `https://www.loom.com/embed/${loomShare[1]}?hide_share=true&hide_owner=true&hideEmojiReactions=true&hideEmbedTopBar=true`;
  // Already an embed URL
  const loomEmbed = url.match(/loom\.com\/embed\/([a-zA-Z0-9]+)/);
  if (loomEmbed) return `https://www.loom.com/embed/${loomEmbed[1]}?hide_share=true&hide_owner=true&hideEmojiReactions=true&hideEmbedTopBar=true`;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

// ─── Video Modal ──────────────────────────────────────────────────────────────
interface VideoModalProps {
  title: string;
  embedUrl: string;
  accentColor: string;
  showPip?: boolean;
  onClose: () => void;
}

function VideoModal({ title, embedUrl, accentColor, showPip = false, onClose }: VideoModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pipSupported, setPipSupported] = useState(false);
  const [pipActive, setPipActive] = useState(false);

  // Detect Document PiP API support (Chrome 116+)
  useEffect(() => {
    setPipSupported("documentPictureInPicture" in window);
  }, []);  // always enabled when browser supports it

  async function handlePip() {
    if (!("documentPictureInPicture" in window)) return;
    try {
      // Open a small always-on-top PiP window
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
        width: 854,
        height: 480,
      });

      // Copy base styles so the iframe renders correctly
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          const cssRules = Array.from(sheet.cssRules).map((r) => r.cssText).join("");
          const style = pipWindow.document.createElement("style");
          style.textContent = cssRules;
          pipWindow.document.head.appendChild(style);
        } catch {
          // Cross-origin stylesheets — skip silently
        }
      });

      // Build the iframe inside the PiP window
      const iframe = pipWindow.document.createElement("iframe");
      iframe.src = embedUrl;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      iframe.style.cssText = "width:100%;height:100%;border:none;display:block;";
      pipWindow.document.body.style.cssText = "margin:0;padding:0;background:#000;overflow:hidden;";
      pipWindow.document.body.appendChild(iframe);

      setPipActive(true);
      pipWindow.addEventListener("pagehide", () => {
        setPipActive(false);
      });

      // Close the main modal — user is now watching in the floating window
      onClose();
    } catch (err) {
      console.error("PiP failed:", err);
      toast.error("Picture-in-Picture is not available in this browser.");
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{ background: "#111", border: "1px solid #2a2a2a", boxShadow: "0 25px 80px rgba(0,0,0,0.7)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 gap-3"
          style={{ borderBottom: "1px solid #2a2a2a" }}
        >
          <p className="text-sm font-semibold text-white truncate flex-1">{title}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {pipSupported && !pipActive && (
              <button
                type="button"
                onClick={handlePip}
                title="Pop out to floating window (Picture-in-Picture)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}
              >
                <PictureInPicture2 size={13} />
                <span className="hidden sm:inline">Pop out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close video"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 16:9 iframe */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: "none" }}
          />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid #2a2a2a", background: "#0d0f14" }}
        >
          <p className="text-xs text-gray-500">Click outside or press Esc to close</p>
          {pipSupported && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <PictureInPicture2 size={11} />
              Pop out to keep watching while you browse
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared card component ────────────────────────────────────────────────────
type WebinarType = "exclusive" | "evergreen" | "recording";

function WebinarCard({
  webinar,
  variant,
  nextSession,
  onPlay,
}: {
  webinar: { id: number; title: string; description?: string | null; host?: string | null; scheduledAt?: Date | null; registrationUrl?: string | null; videoUrl?: string | null; viewCount?: number | null; accentColor?: string | null; thumbnailUrl?: string | null; iconName?: string | null; comingSoon?: boolean | null; createdAt?: Date | null };
  variant: WebinarType;
  nextSession?: Date;
  onPlay?: (embedUrl: string, title: string, variant: WebinarType) => void;
}) {
  const registerClickMutation = trpc.webinars.trackRegistrationClick.useMutation();
  const watchMutation = trpc.webinars.watch.useMutation();
  const trackAnon = trpc.analytics.trackAnon.useMutation({ onError: () => {} });

  // countdown kept for future use if needed
  const _countdown = useCountdown(nextSession ?? nextHalfHour());

  const SECTION_ACCENT: Record<WebinarType, string> = {
    exclusive: "#D4AF37",
    evergreen: "#7C3AED",
    recording: "#00A9E2",
  };
  // Colors are hardcoded per section type — accentColor from DB is ignored
  const accentColor = SECTION_ACCENT[variant];

  // Per-section background images — each section has its own neon icon baked in
  const SECTION_BG: Record<string, string> = {
    evergreen: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-bg-ondemand-playcircle-86q8N7uvwmsgxRr4MDpcr4.webp",
    recording: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-bg-exclusive-ondemand-clapperboard-XGLnb93SFV6vDUAxePhB3u.webp",
    exclusive: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-bg-exclusive-live-star-KjxqVKGQiBBpKDhmiVbebz.webp",
  };

  // Resolve the selected icon component from the stored name
  const ICON_MAP: Record<string, LucideIcon> = {
    Video, Play, Mic, Radio, Users, UserCheck, GraduationCap,
    BarChart3, TrendingUp, Activity, Target, Zap,
    Phone, PhoneCall, Headphones, MessageSquare, Mail,
    BookOpen, FileText, Lightbulb, Star, Award, Trophy, Rocket,
    PhoneOutgoing, PhoneMissed, PhoneOff, ListChecks, ClipboardList,
    Crosshair, Megaphone, Repeat, RotateCcw, Shuffle,
    Clapperboard, MonitorPlay, PlayCircle,
  };
  // Section default icons — used when no iconName is set on the webinar
  // DB types: evergreen = On-Demand Series, recording = Exclusive On-Demand, exclusive = Exclusive Live
  const SECTION_DEFAULT_ICON: Record<string, LucideIcon> = {
    evergreen: PlayCircle,    // WAVV On-Demand Series
    recording: Clapperboard, // WAVV Exclusive On-Demand
    exclusive: Star,          // Exclusive Live — star only (no overlay shown)
  };
  const CardIcon: LucideIcon | undefined = webinar.iconName
    ? ICON_MAP[webinar.iconName]
    : SECTION_DEFAULT_ICON[variant];

  // Determine if this card has an embeddable video
  const embedUrl = webinar.videoUrl ? getEmbedUrl(webinar.videoUrl) : null;
  const isHostedVideo = webinar.videoUrl?.startsWith("/manus-storage");

  function handleWatchClick() {
    watchMutation.mutate({ webinarId: webinar.id });
    // Track anonymous play event (server drops authenticated users)
    trackAnon.mutate({
      eventType: "webinar_video_play",
      resourceType: "webinar",
      resourceId: webinar.id,
      metadata: JSON.stringify({ title: webinar.title, type: variant }),
    });
    // Open the full-size modal for both embed URLs and hosted videos
    const playUrl = embedUrl ?? (isHostedVideo ? webinar.videoUrl! : null);
    if (playUrl && onPlay) {
      onPlay(playUrl, webinar.title, variant);
    }
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
      <div
        className="relative w-full overflow-hidden flex-shrink-0"
        style={{ height: "140px" }}
      >
        {/* Per-section background image — neon icon baked in, no overlay needed */}
        <img
          src={SECTION_BG[variant] ?? SECTION_BG.exclusive}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.9 }}
        />
        {/* Custom thumbnail replaces background when set by admin */}
        {webinar.thumbnailUrl && (
          <img
            src={webinar.thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.92 }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}
        {/* No icon overlay — icon is baked into the section background image */}
        {/* Bottom gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(15,19,24,0.85))" }} />
        {/* New badge top-left — shown for content added in the last 14 days */}
        {webinar.createdAt && (Date.now() - new Date(webinar.createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000 && (
          <div className="absolute top-3 left-3">
            <span className="text-[9px] font-bold px-2 py-1 rounded-full tracking-wide uppercase"
              style={{ background: "rgba(74,222,128,0.2)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.4)" }}>
              New
            </span>
          </div>
        )}
        {/* Type badge top-right */}
        <div className="absolute top-3 right-3">
          <span className="text-[9px] font-bold px-2 py-1 rounded-full tracking-wide uppercase"
            style={{ background: accentColor, color: "#fff" }}>
            {variant === "exclusive" ? "Exclusive" : variant === "recording" ? "Exclusive On-Demand" : "On-Demand"}
          </span>
        </div>
        {/* Play overlay for cards with video */}
        {(embedUrl || isHostedVideo) && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={handleWatchClick}
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

      {/* Coming Soon bar — shown only when comingSoon flag is explicitly set */}
      {webinar.comingSoon && (
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
        <h3 className="text-white font-bold text-sm leading-snug mb-2">{webinar.title}</h3>
        {webinar.description && (
          <p className="text-gray-500 text-xs leading-relaxed mb-2">{webinar.description}</p>
        )}
        {webinar.host && (
          <p className="text-gray-500 text-xs mb-2">
            Host: <span className="text-gray-300">{webinar.host}</span>
          </p>
        )}
        {typeof webinar.viewCount === "number" && webinar.viewCount > 0 && (
          <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
            <Eye size={11} className="text-gray-600" />
            <span>{webinar.viewCount.toLocaleString()} {webinar.viewCount === 1 ? "view" : "views"}</span>
          </p>
        )}
        {variant === "exclusive" && webinar.scheduledAt && (
          <div className="space-y-0.5 mb-3">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <Calendar size={11} style={{ color: accentColor }} />
              {new Date(webinar.scheduledAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <Clock size={11} style={{ color: accentColor }} />
              {new Date(webinar.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
            </p>
          </div>
        )}
        {/* Session details shown only when content is available */}

        <div className="mt-auto">
          {/* Embeddable video (Loom / YouTube / Vimeo) or hosted video — both open the full modal */}
          {(embedUrl || isHostedVideo) && (
            <button
              type="button"
              onClick={handleWatchClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}40` }}
            >
              <PlayCircle size={12} /> Watch Now
            </button>
          )}

          {/* Registration link — only shown when registrationUrl is set */}
          {!isHostedVideo && !embedUrl && variant !== "recording" && webinar.registrationUrl && (
            <a
              href={webinar.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registerClickMutation.mutate({ webinarId: webinar.id })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}40` }}
            >
              <ExternalLink size={12} />
              {variant === "evergreen" ? "Join Next Session →" : "Register →"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type WebinarSection = "exclusive" | "evergreen" | "recording";

const SECTION_ORDER: WebinarSection[] = ["evergreen", "exclusive", "recording"];

const SECTION_CONFIG: Record<WebinarSection, { label: string; icon: React.ReactNode; accent: string; description: string }> = {
  evergreen: {
    label: "WAVV On-Demand Series",
    icon: <RefreshCw size={14} />,
    accent: "#7C3AED",
    description: "Available anytime — watch at your own pace",
  },
  exclusive: {
    label: "Upcoming WAVV Exclusive Live Webinars",
    icon: <Star size={14} />,
    accent: "#D4AF37",
    description: "Single-topic, focused live sessions with the WAVV team",
  },
  recording: {
    label: "WAVV Exclusive On-Demand Webinars",
    icon: <PlayCircle size={14} />,
    accent: "#00A9E2",
    description: "Watch past webinars and sessions at your own pace",
  },
};

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-52 rounded-xl animate-pulse" style={{ background: "#1d2230" }} />
      ))}
    </div>
  );
}

export default function Webinars() {
  const { data: visibilityRaw } = trpc.siteSettings.get.useQuery({ key: "webinar_sections_visibility" });
  const visibility: Record<string, boolean> = (visibilityRaw as Record<string, boolean> | null) ?? { evergreen: true, exclusive: true, recordings: true };
  const visibleSections = (SECTION_ORDER as WebinarSection[]).filter(key => {
    const vKey = key === "recording" ? "recordings" : key;
    return visibility[vKey] !== false;
  });
  const [activeSectionState, setActiveSection] = useState<WebinarSection>("evergreen");
  const activeSection: WebinarSection = visibleSections.includes(activeSectionState)
    ? activeSectionState
    : (visibleSections[0] ?? "evergreen");

  const { data: exclusiveWebinars, isLoading: loadingExclusive } = trpc.webinars.list.useQuery({ type: "exclusive" });
  const { data: evergreenWebinars, isLoading: loadingEvergreen } = trpc.webinars.list.useQuery({ type: "evergreen" });
  const { data: recordingWebinars, isLoading: loadingRecording } = trpc.webinars.list.useQuery({ type: "recording" });

  const [sharedNextSession] = useState(() => nextHalfHour());

  // ── Video modal state ──────────────────────────────────────────────────────
  const [playingVideo, setPlayingVideo] = useState<{
    embedUrl: string;
    title: string;
    variant: WebinarType;
    isHosted?: boolean;
  } | null>(null);

  function handlePlay(embedUrl: string, title: string, variant: WebinarType) {
    setFloatingVideo(null); // close any existing floating player before opening a new video
    const isHosted = embedUrl.startsWith("/manus-storage");
    setPlayingVideo({ embedUrl, title, variant, isHosted });
  }

  // Close modal on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setPlayingVideo(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function handleCloseModal() {
    setPlayingVideo(null);
  }

  // Floating player state — launched when user pops out from the inline modal
  const [floatingVideo, setFloatingVideo] = useState<{ embedUrl: string; title: string } | null>(null);

  function handlePopOut() {
    if (!playingVideo) return;
    setFloatingVideo({ embedUrl: playingVideo.embedUrl, title: playingVideo.title });
    handleCloseModal();
  }

  const cfg = SECTION_CONFIG[activeSection];

  return (
    <PortalLayout title="Webinars">
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Spacer for consistent vertical alignment with pages that have toggle bars */}
        <div style={{ minHeight: "32px" }} />

        {/* ── Header ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "radial-gradient(ellipse 100% 90% at 50% 0%, rgba(0,169,226,0.28) 0%, rgba(0,116,244,0.14) 40%, rgba(103,199,40,0.06) 70%, transparent 90%), #080c14",
            border: "1px solid rgba(0,169,226,0.2)",
            minHeight: "280px",
          }}
        >
          {/* Subtle grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,169,226,0.16), transparent 65%)", transform: "translate(25%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(103,199,40,0.08), transparent 65%)", transform: "translate(-25%, 30%)" }} />

          <div className="relative z-10 px-4 sm:px-6 lg:px-16 py-8 sm:py-12 text-center">
            {/* Headline */}
            <h1 className="font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}>
              <span style={{ background: "linear-gradient(135deg, #ffffff 0%, #bae6fd 30%, #7dd3fc 60%, #67C728 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                WAVV Webinars
              </span>
            </h1>

            {/* Accent line */}
            <div className="flex justify-center mb-5">
              <div style={{ width: "200px", height: "3px", borderRadius: "2px", background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)" }} />
            </div>

            {/* Subline */}
            <p className="mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(0.88rem, 1.6vw, 1rem)", maxWidth: "560px" }}>
              Join exclusive live sessions and on-demand content from the WAVV team. Learn best practices, see new features in action, and sharpen your outbound strategy.
            </p>
          </div>
        </div>

        {/* ── Section tab bar ── */}
        <div className="flex gap-2 flex-wrap">
          {(visibleSections.map(key => [key, SECTION_CONFIG[key]] as [WebinarSection, typeof cfg])).map(([key, c]) => {
            const isActive = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: isActive ? `${c.accent}22` : "#1d2230",
                  color: isActive ? c.accent : "#6b7280",
                  border: `1px solid ${isActive ? c.accent : "#252d3d"}`,
                }}
              >
                {c.icon}
                {c.label}
              </button>
            );
          })}
        </div>

        {/* ── Section description ── */}
        <div className="flex items-center gap-2">
          <span style={{ color: cfg.accent }}>{cfg.icon}</span>
          <p className="text-sm text-gray-400">{cfg.description}</p>
        </div>

        {/* ── Section content ── */}
        {activeSection === "exclusive" && (
          loadingExclusive ? <SectionSkeleton /> :
          exclusiveWebinars && exclusiveWebinars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exclusiveWebinars.map((w) => (
                <WebinarCard key={w.id} webinar={w} variant="exclusive" onPlay={handlePlay} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl text-center" style={{ background: "#111", border: "1px dashed #2a2a2a" }}>
              <Star size={32} className="text-gray-700 mb-3" />
              <p className="text-gray-400 text-sm font-medium">No Exclusive Webinars yet.</p>
              <p className="text-gray-600 text-xs mt-1">Please check back soon!</p>
            </div>
          )
        )}

        {activeSection === "evergreen" && (
          loadingEvergreen ? <SectionSkeleton /> :
          (evergreenWebinars ?? []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(evergreenWebinars ?? []).map((w) => (
                <WebinarCard key={w.id} webinar={w} variant="evergreen" nextSession={sharedNextSession} onPlay={handlePlay} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl text-center" style={{ background: "#111", border: "1px dashed #2a2a2a" }}>
              <RefreshCw size={32} className="text-gray-700 mb-3" />
              <p className="text-gray-400 text-sm font-medium">No On-Demand Videos yet.</p>
              <p className="text-gray-600 text-xs mt-1">Please check back soon!</p>
            </div>
          )
        )}

        {activeSection === "recording" && (
          loadingRecording ? <SectionSkeleton /> :
          (recordingWebinars ?? []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(recordingWebinars ?? []).map((w) => (
                <WebinarCard key={w.id} webinar={w} variant="recording" onPlay={handlePlay} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl text-center" style={{ background: "#111", border: "1px dashed #2a2a2a" }}>
              <PlayCircle size={32} className="text-gray-700 mb-3" />
              <p className="text-gray-400 text-sm font-medium">No Recordings yet.</p>
              <p className="text-gray-600 text-xs mt-1">Please check back soon!</p>
            </div>
          )
        )}

      </div>

      {/* ── Request a Webinar ── */}
      <div className="px-4 lg:px-8 pb-10">
        <ContentRequestCTA requestType="webinar" accentColor="#00A9E2" />
      </div>

      {/* ── Inline Video Modal ── */}
      {playingVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
            style={{ background: "#111", border: "1px solid #2a2a2a", boxShadow: "0 25px 80px rgba(0,0,0,0.7)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3 gap-3"
              style={{ borderBottom: "1px solid #2a2a2a" }}
            >
              <p className="text-sm font-semibold text-white truncate flex-1">{playingVideo.title}</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handlePopOut}
                  title="Pop out to floating window"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{
                    background: playingVideo.variant === "exclusive" ? "rgba(212,175,55,0.15)" : playingVideo.variant === "evergreen" ? "rgba(124,58,237,0.15)" : "rgba(0,169,226,0.15)",
                    color: playingVideo.variant === "exclusive" ? "#D4AF37" : playingVideo.variant === "evergreen" ? "#a78bfa" : "#38bdf8",
                    border: `1px solid ${playingVideo.variant === "exclusive" ? "rgba(212,175,55,0.3)" : playingVideo.variant === "evergreen" ? "rgba(124,58,237,0.3)" : "rgba(0,169,226,0.3)"}`,
                  }}
                >
                  <PictureInPicture2 size={13} />
                  <span className="hidden sm:inline">Pop out</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close video"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* 16:9 video area — native player for hosted files, iframe for embeds */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {playingVideo.isHosted ? (
                <video
                  controls
                  autoPlay
                  className="absolute inset-0 w-full h-full"
                  style={{ background: "#000", border: "none" }}
                >
                  <source src={playingVideo.embedUrl} />
                </video>
              ) : (
                <iframe
                  src={playingVideo.embedUrl}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                  className="absolute inset-0 w-full h-full"
                  style={{ border: "none" }}
                />
              )}
            </div>
            {/* Footer */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: "1px solid #2a2a2a", background: "#0d0f14" }}
            >
              <p className="text-xs text-gray-500">Click outside or press Esc to close</p>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <PictureInPicture2 size={11} />
                Pop out to keep watching while you browse
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating video player ── */}
      {floatingVideo && (
        <FloatingVideoPlayer
          title={floatingVideo.title}
          embedUrl={floatingVideo.embedUrl}
          onClose={() => setFloatingVideo(null)}
        />
      )}
    </PortalLayout>
  );
}
