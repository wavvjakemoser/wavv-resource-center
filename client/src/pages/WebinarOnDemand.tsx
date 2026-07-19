import { useState, useEffect, useMemo, useRef } from "react";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Video, PlayCircle, Play, Mic, Radio, Users, UserCheck, GraduationCap,
  BarChart3, TrendingUp, Activity, Target, Zap,
  Phone, PhoneCall, Headphones, MessageSquare, Mail,
  BookOpen, FileText, Lightbulb, Star, Award, Trophy, Rocket,
  PhoneOutgoing, PhoneMissed, PhoneOff, ListChecks, ClipboardList,
  Crosshair, Megaphone, Repeat, RotateCcw, Shuffle,
  Clapperboard, MonitorPlay, ExternalLink, PictureInPicture2, X, ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import FloatingVideoPlayer from "@/components/FloatingVideoPlayer";

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT = "#0074F4";
const VARIANT = "evergreen" as const;
type WebinarType = "exclusive" | "evergreen" | "recording";

const SECTION_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-bg-ondemand-playcircle-86q8N7uvwmsgxRr4MDpcr4.webp";

const ICON_MAP: Record<string, LucideIcon> = {
  Video, Play, Mic, Radio, Users, UserCheck, GraduationCap,
  BarChart3, TrendingUp, Activity, Target, Zap,
  Phone, PhoneCall, Headphones, MessageSquare, Mail,
  BookOpen, FileText, Lightbulb, Star, Award, Trophy, Rocket,
  PhoneOutgoing, PhoneMissed, PhoneOff, ListChecks, ClipboardList,
  Crosshair, Megaphone, Repeat, RotateCcw, Shuffle,
  Clapperboard, MonitorPlay, PlayCircle,
};

// ─── WebinarCard ──────────────────────────────────────────────────────────────
function WebinarCard({
  webinar,
  nextSession,
  onPlay,
}: {
  webinar: { id: number; title: string; description?: string | null; host?: string | null; scheduledAt?: Date | null; registrationUrl?: string | null; videoUrl?: string | null; viewCount?: number | null; accentColor?: string | null; thumbnailUrl?: string | null; iconName?: string | null; comingSoon?: boolean | null; createdAt?: Date | null };
  nextSession?: Date;
  onPlay?: (embedUrl: string, title: string) => void;
}) {
  const registerClickMutation = trpc.webinars.trackRegistrationClick.useMutation();
  const watchMutation = trpc.webinars.watch.useMutation();
  const trackAnon = trpc.analytics.trackAnon.useMutation({ onError: () => {} });

  const _countdown = useCountdown(nextSession ?? nextHalfHour());

  const CardIcon: LucideIcon | undefined = webinar.iconName
    ? ICON_MAP[webinar.iconName]
    : PlayCircle;

  const embedUrl = webinar.videoUrl ? getEmbedUrl(webinar.videoUrl) : null;
  const isHostedVideo = webinar.videoUrl?.startsWith("/manus-storage") ?? false;

  function handleWatchClick() {
    const playUrl = embedUrl ?? (isHostedVideo ? webinar.videoUrl! : null);
    if (!playUrl) return;
    watchMutation.mutate({ webinarId: webinar.id });
    trackAnon.mutate({
      eventType: "webinar_watch",
      resourceType: "webinar",
      metadata: JSON.stringify({ id: webinar.id, title: webinar.title, type: VARIANT }),
    });
    onPlay?.(playUrl, webinar.title);
  }

  return (
    <div
      className="group relative overflow-hidden rounded-xl transition-all duration-200 hover:scale-[1.02] cursor-default"
      style={{
        background: "#111318",
        border: `1px solid ${ACCENT}30`,
        boxShadow: `0 2px 12px ${ACCENT}10`,
      }}
    >
      {/* Card background image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: webinar.thumbnailUrl ? `url(${webinar.thumbnailUrl})` : `url(${SECTION_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />

      {/* Content */}
      <div className="relative p-5 flex flex-col gap-3 h-full" style={{ minHeight: "200px" }}>
        {/* Icon + title */}
        <div className="flex items-start gap-3">
          {CardIcon && (
            <div
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40` }}
            >
              <CardIcon size={16} style={{ color: ACCENT }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">{webinar.title}</h3>
            {webinar.host && (
              <p className="text-xs mt-1" style={{ color: `${ACCENT}cc` }}>
                Hosted by {webinar.host}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {webinar.description && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{webinar.description}</p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {(embedUrl || isHostedVideo) && (
            <button
              type="button"
              onClick={handleWatchClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
            >
              <PlayCircle size={12} /> Watch Now
            </button>
          )}

          {!isHostedVideo && !embedUrl && webinar.registrationUrl && (
            <a
              href={webinar.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registerClickMutation.mutate({ webinarId: webinar.id })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
            >
              <ExternalLink size={12} />
              Join Next Session →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WebinarOnDemand() {
  const { data: webinars, isLoading } = trpc.webinars.list.useQuery({ type: "evergreen" });
  const [sharedNextSession] = useState(() => nextHalfHour());

  // Deep-link: ?play=<webinarId>
  const autoPlayId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("play");
    return v ? parseInt(v, 10) : null;
  }, []);

  const [autoPlayFired, setAutoPlayFired] = useState(false);

  // Video modal state
  const [playingVideo, setPlayingVideo] = useState<{ embedUrl: string; title: string; isHosted?: boolean } | null>(null);
  const [floatingVideo, setFloatingVideo] = useState<{ embedUrl: string; title: string } | null>(null);

  function handlePlay(embedUrl: string, title: string) {
    setFloatingVideo(null);
    const isHosted = embedUrl.startsWith("/manus-storage");
    setPlayingVideo({ embedUrl, title, isHosted });
  }

  function handleCloseModal() {
    setPlayingVideo(null);
  }

  function handlePopOut() {
    if (!playingVideo) return;
    setFloatingVideo({ embedUrl: playingVideo.embedUrl, title: playingVideo.title });
    handleCloseModal();
  }

  // Auto-play deep link
  useEffect(() => {
    if (autoPlayFired || !autoPlayId || !webinars || webinars.length === 0) return;
    const target = webinars.find((w: any) => w.id === autoPlayId);
    if (!target || !target.videoUrl) return;
    const embedUrl = getEmbedUrl(target.videoUrl);
    if (!embedUrl && !target.videoUrl.startsWith("/manus-storage")) return;
    const playUrl = embedUrl ?? target.videoUrl;
    handlePlay(playUrl, target.title);
    setAutoPlayFired(true);
  }, [autoPlayId, webinars, autoPlayFired]);

  // Escape key closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setPlayingVideo(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <PortalLayout title="On-Demand Series">
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb */}
        <Link href="/webinars" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          Back to WAVV Webinars
        </Link>

        {/* Hero banner */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ height: "160px", border: `1px solid ${ACCENT}40` }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, rgba(8,10,16,1) 0%, rgba(8,10,16,0.95) 60%, ${ACCENT}18 100%)` }}
          />
          <div
            className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ opacity: 0.35, color: ACCENT }}
          >
            <PlayCircle size={100} strokeWidth={1.2} />
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 80% 50%, ${ACCENT}14 0%, transparent 55%)` }}
          />
          <div className="relative flex flex-col justify-center h-full px-8 py-6 gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
              WAVV Webinars
            </p>
            <h1 className="text-2xl font-extrabold text-white leading-tight">WAVV On-Demand Series</h1>
            <p className="text-sm text-gray-300 mb-2">Available anytime — structured multi-part webinar series you can watch at your own pace.</p>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: `${ACCENT}35`, color: ACCENT, border: `1px solid ${ACCENT}` }}
              >
                {(webinars ?? []).length} {(webinars ?? []).length === 1 ? "webinar" : "webinars"}
              </span>
            </div>
          </div>
        </div>

        {/* Content grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-52 rounded-xl animate-pulse" style={{ background: "#1d2230" }} />
            ))}
          </div>
        ) : (webinars ?? []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(webinars ?? []).map((w) => (
              <WebinarCard key={w.id} webinar={w} nextSession={sharedNextSession} onPlay={handlePlay} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl text-center" style={{ background: "#111", border: "1px dashed #2a2a2a" }}>
            <PlayCircle size={32} className="text-gray-700 mb-3" />
            <p className="text-white text-sm font-bold">No On-Demand Videos yet.</p>
            <p className="text-white text-xs mt-1">Please check back soon!</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
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
            <div className="flex items-center justify-between px-5 py-3 gap-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
              <p className="text-sm font-semibold text-white truncate flex-1">{playingVideo.title}</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handlePopOut}
                  title="Pop out to floating window"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
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
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {playingVideo.isHosted ? (
                <video controls autoPlay className="absolute inset-0 w-full h-full" style={{ background: "#000", border: "none" }}>
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
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid #2a2a2a", background: "#0d0f14" }}>
              <p className="text-xs text-gray-500">Click outside or press Esc to close</p>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <PictureInPicture2 size={11} />
                Pop out to keep watching while you browse
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating video player */}
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
