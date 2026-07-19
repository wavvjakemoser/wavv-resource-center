import { useState, useEffect, useMemo } from "react";
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
  Clapperboard, MonitorPlay, ExternalLink, PictureInPicture2, X, ArrowLeft, Gem,
  type LucideIcon,
} from "lucide-react";
import FloatingVideoPlayer from "@/components/FloatingVideoPlayer";

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
const ACCENT = "#67C728";
const BANNER_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-diamond-green-kJkuBhauSZkpAuqKMkTrq5.webp";

const ICON_MAP: Record<string, LucideIcon> = {
  Video, Play, Mic, Radio, Users, UserCheck, GraduationCap,
  BarChart3, TrendingUp, Activity, Target, Zap,
  Phone, PhoneCall, Headphones, MessageSquare, Mail,
  BookOpen, FileText, Lightbulb, Star, Award, Trophy, Rocket,
  PhoneOutgoing, PhoneMissed, PhoneOff, ListChecks, ClipboardList,
  Crosshair, Megaphone, Repeat, RotateCcw, Shuffle,
  Clapperboard, MonitorPlay, PlayCircle,
};

// ─── WebinarRow ──────────────────────────────────────────────────────────────
function WebinarRow({
  webinar,
  onPlay,
}: {
  webinar: { id: number; title: string; description?: string | null; host?: string | null; videoUrl?: string | null; registrationUrl?: string | null; iconName?: string | null; viewCount?: number | null };
  onPlay?: (embedUrl: string, title: string) => void;
}) {
  const watchMutation = trpc.webinars.watch.useMutation();
  const trackAnon = trpc.analytics.trackAnon.useMutation({ onError: () => {} });

  const embedUrl = webinar.videoUrl ? getEmbedUrl(webinar.videoUrl) : null;
  const isHostedVideo = webinar.videoUrl?.startsWith("/manus-storage") ?? false;
  const CardIcon: LucideIcon | undefined = webinar.iconName ? ICON_MAP[webinar.iconName] : Gem;

  function handleWatchClick() {
    const playUrl = embedUrl ?? (isHostedVideo ? webinar.videoUrl! : null);
    if (!playUrl) return;
    watchMutation.mutate({ webinarId: webinar.id });
    trackAnon.mutate({
      eventType: "webinar_watch",
      resourceType: "webinar",
      metadata: JSON.stringify({ id: webinar.id, title: webinar.title, type: "recording" }),
    });
    onPlay?.(playUrl, webinar.title);
  }

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl transition-all duration-150 hover:scale-[1.005]"
      style={{ background: "#111318", border: `1px solid ${ACCENT}20` }}
    >
      {/* Play button / Icon */}
      <button
        type="button"
        onClick={(embedUrl || isHostedVideo) ? handleWatchClick : undefined}
        disabled={!embedUrl && !isHostedVideo}
        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all"
        style={{
          background: (embedUrl || isHostedVideo) ? `${ACCENT}18` : "rgba(255,255,255,0.04)",
          border: `1px solid ${(embedUrl || isHostedVideo) ? `${ACCENT}40` : "rgba(255,255,255,0.08)"}`,
          cursor: (embedUrl || isHostedVideo) ? "pointer" : "default",
        }}
      >
        {(embedUrl || isHostedVideo) ? (
          <Play size={18} style={{ color: ACCENT }} fill={ACCENT} />
        ) : CardIcon ? (
          <CardIcon size={18} style={{ color: "rgba(255,255,255,0.4)" }} />
        ) : null}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-white leading-tight truncate">{webinar.title}</h3>
        {webinar.host && (
          <p className="text-xs mt-0.5" style={{ color: `${ACCENT}cc` }}>Hosted by {webinar.host}</p>
        )}
        {webinar.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{webinar.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {(embedUrl || isHostedVideo) && (
          <button
            type="button"
            onClick={handleWatchClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
          >
            <PlayCircle size={13} /> Watch Now
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WebinarExclusiveOnDemand() {
  const { data: webinars, isLoading } = trpc.webinars.list.useQuery({ type: "recording" });

  const autoPlayId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("play");
    return v ? parseInt(v, 10) : null;
  }, []);

  const [autoPlayFired, setAutoPlayFired] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<{ embedUrl: string; title: string; isHosted?: boolean } | null>(null);
  const [floatingVideo, setFloatingVideo] = useState<{ embedUrl: string; title: string } | null>(null);

  function handlePlay(embedUrl: string, title: string) {
    setFloatingVideo(null);
    const isHosted = embedUrl.startsWith("/manus-storage");
    setPlayingVideo({ embedUrl, title, isHosted });
  }

  function handleCloseModal() { setPlayingVideo(null); }
  function handlePopOut() {
    if (!playingVideo) return;
    setFloatingVideo({ embedUrl: playingVideo.embedUrl, title: playingVideo.title });
    handleCloseModal();
  }

  useEffect(() => {
    if (autoPlayFired || !autoPlayId || !webinars || webinars.length === 0) return;
    const target = webinars.find((w: any) => w.id === autoPlayId);
    if (!target || !target.videoUrl) return;
    const eUrl = getEmbedUrl(target.videoUrl);
    if (!eUrl && !target.videoUrl.startsWith("/manus-storage")) return;
    handlePlay(eUrl ?? target.videoUrl, target.title);
    setAutoPlayFired(true);
  }, [autoPlayId, webinars, autoPlayFired]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setPlayingVideo(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <PortalLayout title="Exclusive On-Demand">
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb */}
        <Link href="/webinars" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          Back to WAVV Webinars
        </Link>

        {/* Hero banner with neon icon image */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ height: "200px", border: `1px solid ${ACCENT}40`, boxShadow: `0 0 0 1px ${ACCENT}20, 0 4px 32px ${ACCENT}18` }}
        >
          <div className="absolute inset-0" style={{ background: "#000" }} />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit-exclusive" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={ACCENT} strokeWidth="0.8" fill="none"/>
                <circle cx="10" cy="10" r="2" fill={ACCENT}/>
                <circle cx="50" cy="10" r="2" fill={ACCENT}/>
                <circle cx="50" cy="50" r="2" fill={ACCENT}/>
                <circle cx="30" cy="30" r="1.5" fill={ACCENT}/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-exclusive)"/>
          </svg>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${BANNER_URL})`,
              backgroundSize: "100% auto",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              opacity: 0.85,
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)" }}
          />
          <div className="relative flex flex-col justify-center h-full px-8 py-6 gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>WAVV Webinars</p>
            <h1 className="text-2xl font-extrabold text-white leading-tight">WAVV Exclusive On-Demand Webinars</h1>
            <p className="text-sm text-gray-300 mb-2">Watch past exclusive webinars and sessions — premium replays available on demand.</p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: `${ACCENT}35`, color: ACCENT, border: `1px solid ${ACCENT}` }}>
                {(webinars ?? []).length} {(webinars ?? []).length === 1 ? "webinar" : "webinars"}
              </span>
            </div>
          </div>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "#1d2230" }} />
            ))}
          </div>
        ) : (webinars ?? []).length > 0 ? (
          <div className="space-y-3">
            {(webinars ?? []).map((w) => (
              <WebinarRow key={w.id} webinar={w} onPlay={handlePlay} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl text-center" style={{ background: "#111", border: "1px dashed #2a2a2a" }}>
            <Gem size={32} className="text-gray-700 mb-3" />
            <p className="text-white text-sm font-bold">No Exclusive On-Demand Webinars yet.</p>
            <p className="text-white text-xs mt-1">Check back soon for premium replays!</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.88)" }} onClick={handleCloseModal}>
          <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid #2a2a2a", boxShadow: "0 25px 80px rgba(0,0,0,0.7)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 gap-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
              <p className="text-sm font-semibold text-white truncate flex-1">{playingVideo.title}</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button type="button" onClick={handlePopOut} title="Pop out" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80" style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` }}>
                  <PictureInPicture2 size={13} /><span className="hidden sm:inline">Pop out</span>
                </button>
                <button type="button" onClick={handleCloseModal} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors" aria-label="Close video"><X size={16} /></button>
              </div>
            </div>
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {playingVideo.isHosted ? (
                <video controls autoPlay className="absolute inset-0 w-full h-full" style={{ background: "#000", border: "none" }}><source src={playingVideo.embedUrl} /></video>
              ) : (
                <iframe src={playingVideo.embedUrl} title={playingVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation allow-forms" className="absolute inset-0 w-full h-full" style={{ border: "none" }} />
              )}
            </div>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid #2a2a2a", background: "#0d0f14" }}>
              <p className="text-xs text-gray-500">Click outside or press Esc to close</p>
              <p className="text-xs text-gray-600 flex items-center gap-1"><PictureInPicture2 size={11} />Pop out to keep watching</p>
            </div>
          </div>
        </div>
      )}

      {floatingVideo && (
        <FloatingVideoPlayer title={floatingVideo.title} embedUrl={floatingVideo.embedUrl} onClose={() => setFloatingVideo(null)} />
      )}
    </PortalLayout>
  );
}
