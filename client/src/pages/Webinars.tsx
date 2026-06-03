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
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ContentRequestCTA } from "./Academy";

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
  webinar: { id: number; title: string; description?: string | null; host?: string | null; scheduledAt?: Date | null; registrationUrl?: string | null; videoUrl?: string | null; viewCount?: number | null; accentColor?: string | null; thumbnailUrl?: string | null; iconName?: string | null; comingSoon?: boolean | null };
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
    evergreen: "#0074F4",
    recording: "#00A9E2",
  };
  const accentColor = (variant === "evergreen" && webinar.accentColor) ? webinar.accentColor : SECTION_ACCENT[variant];

  const SECTION_BG: Record<WebinarType, string> = {
    evergreen: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-thumb-evergreen-v2-GrKL79AD2FdyCtLXnUSv4C.webp",
    exclusive: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-thumb-exclusive-v2-gGXX6nYRkYWDJDcBByZ8iX.webp",
    recording: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-thumb-recording-v2-3C9ghU23nQyUUDrjZs5iVM.webp",
  };
  const thumbBg = webinar.thumbnailUrl
    ? webinar.thumbnailUrl
    : SECTION_BG[variant];

  // Resolve the selected icon component from the stored name
  const ICON_MAP: Record<string, LucideIcon> = {
    Video, Play, Mic, Radio, Users, UserCheck, GraduationCap,
    BarChart3, TrendingUp, Activity, Target, Zap,
    Phone, PhoneCall, Headphones, MessageSquare, Mail,
    BookOpen, FileText, Lightbulb, Star, Award, Trophy, Rocket,
    PhoneOutgoing, PhoneMissed, PhoneOff, ListChecks, ClipboardList,
    Crosshair, Megaphone, Repeat, RotateCcw, Shuffle,
  };
  const CardIcon: LucideIcon | undefined = webinar.iconName ? ICON_MAP[webinar.iconName] : undefined;

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
    if (embedUrl && onPlay) {
      onPlay(embedUrl, webinar.title, variant);
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
        className="relative flex-shrink-0 overflow-hidden"
        style={{ height: "120px", borderBottom: `1px solid ${accentColor}30` }}
      >
        <img src={thumbBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        {/* Play overlay for cards with video */}
        {(embedUrl || isHostedVideo) && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ background: "rgba(0,0,0,0.55)" }}
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
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-2">{webinar.description}</p>
        )}
        {webinar.host && (
          <p className="text-gray-500 text-xs mb-2">
            Host: <span className="text-gray-300">{webinar.host}</span>
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
        {variant === "evergreen" && !embedUrl && !isHostedVideo && (
          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
            <RefreshCw size={11} style={{ color: accentColor }} />
            Session details coming soon
          </p>
        )}

        <div className="mt-auto">
          {/* Platform-hosted (manus-storage) video */}
          {isHostedVideo && webinar.videoUrl && (
            <div className="mt-2">
              <video
                controls
                className="w-full rounded-lg"
                style={{ maxHeight: "180px", background: "#000" }}
                onPlay={() => watchMutation.mutate({ webinarId: webinar.id })}
              >
                <source src={webinar.videoUrl} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Embeddable video (Loom / YouTube / Vimeo) */}
          {!isHostedVideo && embedUrl && (
            <button
              type="button"
              onClick={handleWatchClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}40` }}
            >
              <PlayCircle size={12} /> Watch Now
            </button>
          )}

          {/* No video yet — recording coming soon */}
          {!isHostedVideo && !embedUrl && variant === "recording" && (
            <span className="text-xs text-gray-600">Recording coming soon</span>
          )}

          {/* Registration link (exclusive live, no video yet) */}
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
              {variant === "evergreen" ? "Join Next Session →" : "Register Now →"}
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
    accent: "#0074F4",
    description: "Available anytime — watch at your own pace",
  },
  exclusive: {
    label: "Upcoming WAVV Exclusive Live Webinars",
    icon: <Star size={14} />,
    accent: "#D4AF37",
    description: "Single-topic, focused live sessions — limited availability",
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
  } | null>(null);

  function handlePlay(embedUrl: string, title: string, variant: WebinarType) {
    setPlayingVideo({ embedUrl, title, variant });
  }

  function handleCloseModal() {
    setPlayingVideo(null);
  }

  const cfg = SECTION_CONFIG[activeSection];

  return (
    <PortalLayout title="Webinars">
      <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #001B28 0%, #0d1f35 100%)",
            border: "1px solid rgba(0,169,226,0.2)",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,169,226,0.2)" }}>
              <Video size={24} style={{ color: "#00A9E2" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#00A9E2" }}>WAVV Webinars</h1>
              <p className="text-gray-400 text-sm">
                Join exclusive live sessions and on-demand content from the WAVV team.
              </p>
            </div>
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
              <p className="text-gray-400 text-sm font-medium">No exclusive webinars scheduled right now.</p>
              <p className="text-gray-600 text-xs mt-1">New sessions are added regularly — check back soon.</p>
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
              <p className="text-gray-400 text-sm font-medium">No on-demand videos available yet.</p>
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
              <p className="text-gray-400 text-sm font-medium">No recordings available yet.</p>
              <p className="text-gray-600 text-xs mt-1">Completed exclusive webinars will be added here.</p>
            </div>
          )
        )}

      </div>

      {/* ── Request a Webinar ── */}
      <div className="px-4 lg:px-6 pb-10 max-w-5xl mx-auto">
        <ContentRequestCTA requestType="webinar" accentColor="#00A9E2" />
      </div>

      {/* ── Inline Video Modal ── */}
      {playingVideo && (
        <VideoModal
          title={playingVideo.title}
          embedUrl={playingVideo.embedUrl}
          accentColor={
            playingVideo.variant === "exclusive" ? "#D4AF37" :
            playingVideo.variant === "evergreen" ? "#0074F4" : "#00A9E2"
          }
          showPip={true}
          onClose={handleCloseModal}
        />
      )}
    </PortalLayout>
  );
}
