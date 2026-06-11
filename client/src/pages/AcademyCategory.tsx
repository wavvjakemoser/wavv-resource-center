import { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "wouter";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Rocket,
  Wrench,
  Lightbulb,
  Play,
  Lock,
  GraduationCap,
  Download,
  Bookmark,
  BookmarkCheck,
  Filter,
  X,
  PictureInPicture2,
} from "lucide-react";
import FloatingVideoPlayer from "@/components/FloatingVideoPlayer";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Onboarding: Rocket,
  "How-To": Wrench,
  "Strategy and Best Practices": Lightbulb,
  "Strategy & Best Practices": Lightbulb,
};

// Tag color map (matches admin preset tags)
const TAG_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  "Most Popular":    { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.35)" },
  "Must Watch":      { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)" },
  "New":             { color: "#4ade80", bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.35)" },
  "Featured":        { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.35)" },
  "Spam Protection": { color: "#fb923c", bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.35)" },
  "Connection Rates":{ color: "#c084fc", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.35)" },
};

const NEW_BADGE = { color: "#4ade80", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.35)" };
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Stable numeric hash for a string (used as bookmark contentId for static videos)
function hashTitle(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function isNewLesson(createdAt: Date | string | null | undefined): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < THIRTY_DAYS_MS;
}

// ─── Section / video data ─────────────────────────────────────────────────────

interface VideoItem {
  id: string;
  title: string;
  duration?: string;
  status: "available" | "coming_soon";
  loopUrl?: string;
  downloadFile?: { url: string; label: string };
}

interface Section {
  id: string;
  title: string;
  videos: VideoItem[];
}

interface CategoryData {
  key: string;
  label: string;
  subtitle: string;
  color: string;
  thumbnail: string;
  sections: Section[];
}

const CATEGORY_DATA: CategoryData[] = [
  {
    key: "Onboarding",
    label: "Onboarding",
    subtitle: "Get your team up and running with WAVV quickly and effectively.",
    color: "#0074F4",
    thumbnail: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663417013740/JHIRajYPPlnohilQ.png",
    sections: [
      {
        id: "onb-1",
        title: "1. Welcome To The Onboarding Section",
        videos: [
          {
            id: "onb-1-1",
            title: "Welcome to the Onboarding Section",
            status: "available" as const,
            loopUrl: "https://www.loom.com/share/120f6c99ba1245e288ec5c486c146524",
          },
        ],
      },
      {
        id: "onb-2",
        title: "2. NEW: WAVV Wallet",
        videos: [
          {
            id: "onb-2-1",
            title: "Introducing WAVV Wallet",
            status: "available" as const,
            loopUrl: "https://www.loom.com/share/f8163ba9c8ae4bc2a90d789a77523248",
          },
        ],
      },
      {
        id: "onb-3",
        title: "3. Individual Single Line Dialer Onboarding",
        videos: [
          {
            id: "onb-3-1",
            title: "Getting Started With Your Single Line Dialer",
            status: "available" as const,
            loopUrl: "https://www.loom.com/share/5ff763a76caa4ec68d764d06cfe798f1",
          },
        ],
      },
      {
        id: "onb-4",
        title: "4. Individual Multi Line Dialer Onboarding",
        videos: [
          {
            id: "onb-4-1",
            title: "Getting Started With Your Multi Line Dialer",
            status: "available" as const,
            loopUrl: "https://www.loom.com/share/bb53e452362346e48510619256bfda1b",
          },
        ],
      },
      {
        id: "onb-5",
        title: "5. Team Onboarding",
        videos: [
          {
            id: "onb-5-1",
            title: "Team Onboarding - Intro",
            status: "available" as const,
            loopUrl: "https://www.loom.com/share/306c20a4bd97470aaa2911eb18e5a2ea",
          },
          {
            id: "onb-5-2",
            title: "Manager/Billing Owner Onboarding",
            status: "available" as const,
            loopUrl: "https://www.loom.com/share/54c64029a8504929abceac46acee752c",
          },
          {
            id: "onb-5-3",
            title: "Settings Lock",
            status: "available" as const,
            loopUrl: "https://www.loom.com/share/ec6a9741c531470aa8835347c9e1fc58",
          },
          {
            id: "onb-5-4",
            title: "Understanding User Roles",
            status: "available" as const,
            loopUrl: "https://www.loom.com/share/4482c88a456c457c8e98ff73171dd873",
          },
          {
            id: "onb-5-5",
            title: "Agent Onboarding",
            status: "available" as const,
            loopUrl: "https://www.loom.com/share/c22c59b083fb408b9cc8bef1ecab4250",
          },
        ],
      },
    ],
  },
  {
    key: "How-To",
    label: "How-To",
    subtitle: "Step-by-step guides for every core WAVV feature.",
    color: "#00A9E2",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/banner-howto-v6-K3TYV9Xeg5ZaWLpmZiJwHh.webp",
    sections: [
      {
        id: "how-1",
        title: "1. Welcome To The How-To Section",
        videos: [
          { id: "how-1-1", title: "Welcome to the How-To Section", status: "available" as const, loopUrl: "https://www.loom.com/share/31c2aacc6f9c4a0593bb4d173e8142c0" },
        ],
      },
      {
        id: "how-2",
        title: "2. Making Calls With WAVV",
        videos: [
          { id: "how-2-1", title: "Different Ways to Make Calls With WAVV", status: "available" as const, loopUrl: "https://www.loom.com/share/f4bbb4ff9b0743f1a8e41e613b26adb3" },
        ],
      },
      {
        id: "how-3",
        title: "3. Voicemails",
        videos: [
          { id: "how-3-1", title: "Understanding the Voicemail Tab and Incoming Voicemails", status: "available" as const, loopUrl: "https://www.loom.com/share/74809218f7514cfda22a8136dc0c8aeb" },
          { id: "how-3-2", title: "How to Use Outbound Voicemails Within Your WAVV Dialer", status: "available" as const, loopUrl: "https://www.loom.com/share/74809218f7514cfda22a8136dc0c8aeb" },
        ],
      },
      {
        id: "how-4",
        title: "4. WAVV Call Campaigns",
        videos: [
          { id: "how-4-1", title: "Resuming a WAVV Call Campaign", status: "available" as const, loopUrl: "https://www.loom.com/share/386827621d2045a098a3b5958694a437" },
        ],
      },
      {
        id: "how-5",
        title: "5. Nuisance Protection",
        videos: [
          { id: "how-5-1", title: "Understanding the Nuisance Protection Feature", status: "available" as const, loopUrl: "https://www.loom.com/share/3138552497fc4b8fb73b0b0618ac58e0" },
        ],
      },
      {
        id: "how-6",
        title: "6. Call Transfers",
        videos: [
          { id: "how-6-1", title: "How to Transfer Calls Within WAVV", status: "available" as const, loopUrl: "https://www.loom.com/share/1fb002c3ce8646cfb5227c0ba911fbdf" },
        ],
      },
      {
        id: "how-7",
        title: "7. Audio Source",
        videos: [
          { id: "how-7-1", title: "Understanding Your Audio Source", status: "available" as const, loopUrl: "https://www.loom.com/share/40096adc8e19414383bd8be6e27c2028" },
        ],
      },
      {
        id: "how-8",
        title: "8. Spam Protection",
        videos: [
          { id: "how-8-1", title: "How to Add Spam Protection", status: "available" as const, loopUrl: "https://www.loom.com/share/34bc6fb91674441897d7e4e1af3ddac0" },
        ],
      },
    ],
  },
  {
    key: "Strategy and Best Practices",
    label: "Strategy & Best Practices",
    subtitle: "Maximize connection rates, conversions, and team performance.",
    color: "#67C728",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/banner-strategy-v7-h4rfU3p4xkyGFotsGxeuPW.webp",
    sections: [
      {
        id: "str-1",
        title: "1. Welcome To The Strategy & Best Practices Section",
        videos: [
          { id: "str-1-1", title: "Welcome to Strategy & Best Practices", status: "available" as const, loopUrl: "https://www.loom.com/share/dfe22925928c4e3585739d0c4cde3607" },
        ],
      },
      {
        id: "str-2",
        title: "2. WAVV Phone Numbers Tab",
        videos: [
          { id: "str-2-1", title: "Understanding the WAVV Phone Numbers Tab", status: "available" as const, loopUrl: "https://www.loom.com/share/405084a41eef425c9ec1d827b476d3e6" },
        ],
      },
      {
        id: "str-3",
        title: "3. Connection Rates",
        videos: [
          { id: "str-3-1", title: "Overview of Connection Rates", status: "available" as const, loopUrl: "https://www.loom.com/share/fb5a30d1e0aa4a18b9f6524d55d76d7c" },
          { id: "str-3-2", title: "Connection Rates vs Conversion Rates", status: "available" as const, loopUrl: "https://www.loom.com/share/8273b292095c473db9b7a2da03bcb832" },
          { id: "str-3-3", title: "Using the Reports Tab to Track Connection Rates", status: "available" as const, loopUrl: "https://www.loom.com/share/a975028bb8944a07b008ee8d325c46df" },
          { id: "str-3-5", title: "Beginner Foundational Setup", status: "available" as const, loopUrl: "https://www.loom.com/share/144e92518ee242469a3fa9d4e0510aae" },
          { id: "str-3-5b", title: "Intermediate Foundational Setup", status: "available" as const, loopUrl: "https://www.loom.com/share/144e92518ee242469a3fa9d4e0510aae" },
          { id: "str-3-6", title: "Advanced Foundational Setup", status: "available" as const, loopUrl: "https://www.loom.com/share/e6d749ab3fa9496a99092ee5c754166a" },
        ],
      },
    ],
  },
];

/// DB lesson metadata (tags, createdAt) keyed by normalized title
type DbLessonMeta = { id: number; courseId: number; tags: string | null; createdAt: Date | string; fileUrl?: string | null };

// ─── Expandable section row ───────────────────────────────────────────────
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const loomShare = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomShare) return `https://www.loom.com/embed/${loomShare[1]}?hide_share=true&hide_owner=true&hideEmojiReactions=true`;
  const loomEmbed = url.match(/loom\.com\/embed\/([a-zA-Z0-9]+)/);
  if (loomEmbed) return `https://www.loom.com/embed/${loomEmbed[1]}?hide_share=true&hide_owner=true&hideEmojiReactions=true`;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

interface SectionPdf {
  id: number;
  label: string;
  fileUrl: string;
  fileName: string;
}

function SectionRow({
  section,
  accentColor,
  categoryKey,
  defaultOpen = false,
  dbLessonMap = {},
  courseTags = [] as string[],
  onPlay,
  sectionPdfs = [],
}: {
  section: Section;
  accentColor: string;
  categoryKey: string;
  defaultOpen?: boolean;
  dbLessonMap?: Record<string, DbLessonMeta>;
  courseTags?: string[];
  onPlay?: (embedUrl: string, title: string, sectionTitle: string, lessonId?: string) => void;
  sectionPdfs?: SectionPdf[];
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "#1d2230", border: `1px solid ${accentColor}30` }}
    >
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all"
        style={{ background: open ? `${accentColor}12` : `${accentColor}07` }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${accentColor}16`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = open ? `${accentColor}12` : `${accentColor}07`; }}
      >
        {(() => { const Icon = CATEGORY_ICONS[categoryKey] ?? Rocket; return <Icon size={16} style={{ color: accentColor, flexShrink: 0 }} />; })()}
        <span className="text-sm font-bold text-white tracking-tight">{section.title}</span>
        {courseTags.length > 0 && (
          <div className="flex flex-wrap gap-1 ml-1">
            {courseTags.map((tag) => {
              const def = TAG_COLORS[tag];
              if (!def) return null;
              return (
                <span
                  key={tag}
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: def.bg, color: def.color, border: `1px solid ${def.border}` }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}
        <span className="flex-1" />
        <span className="text-[11px] text-gray-500 mr-2">
          {section.videos.length} video{section.videos.length !== 1 ? "s" : ""}
        </span>
        <ChevronDown
          size={16}
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0, color: accentColor }}
        />
      </button>

      {/* Video sub-items */}
      {open && (
        <div
          className="border-t"
          style={{ borderColor: "#252d3d" }}
        >
          {section.videos.map((video, idx) => {
            const rowStyle = {
              borderBottom: idx < section.videos.length - 1 ? "1px solid #222" : "none",
              textDecoration: "none" as const,
            };
            const rowClass = "flex items-center gap-3 px-5 py-3.5 transition-all";
            // Look up DB metadata by title (case-insensitive)
            const dbMeta = dbLessonMap[video.title.toLowerCase().trim()];
            const tagList = dbMeta?.tags ? dbMeta.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
            const showNew = dbMeta ? isNewLesson(dbMeta.createdAt) : false;
            // Use DB fileUrl as override if set, otherwise fall back to static downloadFile
            const effectiveDownloadFile = dbMeta?.fileUrl
              ? { url: dbMeta.fileUrl, label: video.downloadFile?.label ?? video.title + " Resource" }
              : video.downloadFile;
            const inner = (
              <>
                {/* Play / lock icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: video.status === "available" ? `${accentColor}25` : "rgba(255,255,255,0.04)", border: video.status === "available" ? `1px solid ${accentColor}50` : "1px solid #333" }}
                >
                  {video.status === "available" ? (
                    <Play size={13} style={{ color: accentColor }} />
                  ) : (
                    <Lock size={11} className="text-gray-600" />
                  )}
                </div>
                {/* Title + tag pills */}
                <div className="flex-1 min-w-0">
                  <span
                    className="text-sm font-medium"
                    style={{ color: video.status === "available" ? "#f3f4f6" : "#6b7280" }}
                  >
                    {video.title}
                  </span>
                  {(tagList.length > 0 || showNew) && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {showNew && !tagList.includes("New") && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: NEW_BADGE.bg, color: NEW_BADGE.color, border: `1px solid ${NEW_BADGE.border}` }}
                        >
                          NEW
                        </span>
                      )}
                      {tagList.map((tag) => {
                        const def = TAG_COLORS[tag];
                        if (!def) return null;
                        return (
                          <span
                            key={tag}
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: def.bg, color: def.color, border: `1px solid ${def.border}` }}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Badge / arrow / bookmark */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {video.duration && (
                    <span className="text-[11px] text-gray-600">{video.duration}</span>
                  )}
                  {video.status === "coming_soon" && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#555", border: "1px solid #333" }}
                    >
                      Coming Soon
                    </span>
                  )}
                  {video.status === "available" && (
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 flex-shrink-0"
                      style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}40` }}
                    >
                      <Play size={9} style={{ color: accentColor }} />
                      Watch
                    </span>
                  )}
                  {/* bookmark removed — not tied to users */}
                </div>
              </>
            );
            const embedUrl = video.loopUrl ? getEmbedUrl(video.loopUrl) : null;
            const videoRow = embedUrl && video.status === "available" ? (
              <div
                key={video.id}
                role="button"
                tabIndex={0}
                onClick={() => onPlay?.(embedUrl, video.title, section.title, video.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPlay?.(embedUrl, video.title, section.title, video.id); } }}
                className={rowClass + " cursor-pointer"}
                style={effectiveDownloadFile ? { ...rowStyle, borderBottom: "none" } : rowStyle}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = `${accentColor}0a`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
              >
                {inner}
              </div>
            ) : (
              <div key={video.id} className={rowClass} style={effectiveDownloadFile ? { ...rowStyle, borderBottom: "none" } : rowStyle}>
                {inner}
              </div>
            );
            return (
              <div key={video.id}>
                {videoRow}
                {effectiveDownloadFile && (
                  <a
                    href={effectiveDownloadFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-5 py-2 transition-colors hover:bg-white/5"
                    style={{ borderBottom: idx < section.videos.length - 1 ? "1px solid #222" : "none", textDecoration: "none" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)" }}
                    >
                      <Download size={11} style={{ color: "#60a5fa" }} />
                    </div>
                    <span className="text-xs text-blue-400 hover:text-blue-300 transition-colors">{effectiveDownloadFile.label}</span>
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full ml-auto"
                      style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}
                    >
                      PDF
                    </span>
                  </a>
                )}
              </div>
            );
          })}
          {/* ── Section PDF Resources ── */}
          {sectionPdfs.length > 0 && (
            <div className="border-t" style={{ borderColor: "#252d3d" }}>
              <div className="px-5 py-2" style={{ background: "rgba(96,165,250,0.04)", borderBottom: "1px solid #252d3d" }}>
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#60a5fa" }}>Resources</span>
              </div>
              {sectionPdfs.map((pdf) => (
                <a
                  key={pdf.id}
                  href={pdf.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/5"
                  style={{ borderBottom: "1px solid #1a1f2e", textDecoration: "none" }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)" }}
                  >
                    <Download size={12} style={{ color: "#60a5fa" }} />
                  </div>
                  <span className="text-sm text-blue-300 hover:text-blue-200 transition-colors flex-1 truncate">{pdf.label}</span>
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}
                  >
                    PDF
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────
export default function AcademyCategory() {
  const params = useParams<{ categoryKey: string }>();
  const categoryKey = decodeURIComponent(params.categoryKey ?? "");

  // Get current user — bookmarks are only fetched when authenticated
  const { data: currentUser } = trpc.auth.me.useQuery(undefined, { retry: false });

  const cat = CATEGORY_DATA.find((c) => c.key === categoryKey);

  // Active filter pill (null = All)
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Video player modal state
  const [playingVideo, setPlayingVideo] = useState<{ embedUrl: string; title: string } | null>(null);
  const [floatingVideo, setFloatingVideo] = useState<{ embedUrl: string; title: string } | null>(null);

  function handlePopOut() {
    if (!playingVideo) return;
    setFloatingVideo({ embedUrl: playingVideo.embedUrl, title: playingVideo.title });
    handleClosePlayer();
  }
  const trackAnon = trpc.analytics.trackAnon.useMutation({ onError: () => {} });
  const handlePlay = (embedUrl: string, title: string, sectionTitle: string, lessonId?: string) => {
    setPlayingVideo({ embedUrl, title });
    trackAnon.mutate({
      eventType: "academy_video_play",
      resourceType: "lesson",
      metadata: JSON.stringify({ title, section: sectionTitle, category: cat?.key ?? "", lessonId }),
    });
    trackAnon.mutate({
      eventType: "lesson_started",
      resourceType: "lesson",
      metadata: JSON.stringify({ title, section: sectionTitle, category: cat?.key ?? "", lessonId }),
    });
  };
  const handleClosePlayer = () => { setPlayingVideo(null); };

  // Fetch DB lessons for this category to get tags + createdAt
  const { data: dbLessons = [] } = trpc.academy.getLessonsByCategory.useQuery(
    { category: cat?.key ?? "" },
    { enabled: !!cat }
  );

  // Fetch DB courses (sections) for this category to get section-level tags
  // Only published courses are returned by getCoursesByCategory (server filters published=true)
  const { data: dbCourses = [], isLoading: dbCoursesLoading } = trpc.academy.getCoursesByCategory.useQuery(
    { category: cat?.key ?? "" },
    { enabled: !!cat }
  );

  // Fetch standalone PDF resources for this category
  const { data: sectionResources = [] } = trpc.academy.getSectionResourcesByCategory.useQuery(
    { category: cat?.key ?? "" },
    { enabled: !!cat }
  );

  // Build a map: normalized course title -> courseId (for PDF resource lookup)
  const courseTitleToId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of dbCourses) {
      map[c.title.toLowerCase().trim()] = c.id;
    }
    return map;
  }, [dbCourses]);

  // Build a map: courseId -> SectionPdf[]
  const pdfsByCourseId = useMemo(() => {
    const map: Record<number, SectionPdf[]> = {};
    for (const r of sectionResources) {
      if (!map[r.courseId]) map[r.courseId] = [];
      map[r.courseId].push({ id: r.id, label: r.label, fileUrl: r.fileUrl, fileName: r.fileName });
    }
    return map;
  }, [sectionResources]);

  // Fetch user bookmarks — only when logged in to avoid unauthorized redirect
  const utils = trpc.useUtils();
  const { data: userBookmarks = [] } = trpc.bookmarks.getAll.useQuery(
    undefined,
    { enabled: !!currentUser, retry: false }
  );
  const addBookmarkMut = trpc.bookmarks.add.useMutation({
    onSuccess: () => utils.bookmarks.getAll.invalidate(),
  });
  const removeBookmarkMut = trpc.bookmarks.remove.useMutation({
    onSuccess: () => utils.bookmarks.getAll.invalidate(),
  });

  // Set of bookmarked contentIds (hashed titles)
  const bookmarkedIds = useMemo(() => {
    const s = new Set<number>();
    for (const b of userBookmarks) {
      if (b.contentType === "lesson") s.add(b.contentId);
    }
    return s;
  }, [userBookmarks]);

  function handleToggleBookmark(contentId: number, title: string, isCurrentlyBookmarked: boolean) {
    if (isCurrentlyBookmarked) {
      removeBookmarkMut.mutate({ contentType: "lesson", contentId });
    } else {
      addBookmarkMut.mutate({ contentType: "lesson", contentId, contentTitle: title });
    }
  }

  // Build a map: normalized course title -> { tags }
  // Only published courses are in dbCourses (server filters published=true)
  const dbCourseMap = useMemo(() => {
    const map: Record<string, { tags: string | null }> = {};
    for (const c of dbCourses) {
      map[c.title.toLowerCase().trim()] = { tags: c.tags ?? null };
    }
    return map;
  }, [dbCourses]);

  // Set of published section titles (normalized) — used to hide deactivated sections
  const publishedSectionTitles = useMemo(
    () => new Set(dbCourses.map((c) => c.title.toLowerCase().trim())),
    [dbCourses]
  );

  // Build a map: normalized title -> { tags, createdAt }
  const dbLessonMap = useMemo(() => {
    const map: Record<string, DbLessonMeta> = {};
    for (const l of dbLessons) {
      map[l.title.toLowerCase().trim()] = { id: l.id, courseId: l.courseId, tags: l.tags ?? null, createdAt: l.createdAt, fileUrl: (l as any).fileUrl ?? null };
    }
    return map;
  }, [dbLessons]);



  // Collect all tags present in this category for the filter bar
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const meta of Object.values(dbLessonMap)) {
      if (meta.tags) meta.tags.split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => tagSet.add(t));
    }
    return Array.from(tagSet);
  }, [dbLessonMap]);

  // Filter sections: hide videos that don't match the active filter
  const filteredSections = useMemo(() => {
    if (!cat) return [];
    // Hide sections whose DB course is deactivated (not in publishedSectionTitles)
    // Only apply this filter once dbCourses has loaded (to avoid flash-hiding during load)
    const visibleSections = dbCoursesLoading
      ? cat.sections
      : cat.sections.filter((s) => publishedSectionTitles.has(s.title.toLowerCase().trim()));
    if (!activeFilter) return visibleSections;
    return visibleSections
      .map((section) => ({
        ...section,
        videos: section.videos.filter((v) => {
          if (activeFilter === "Bookmarked") return bookmarkedIds.has(hashTitle(v.title));
          const meta = dbLessonMap[v.title.toLowerCase().trim()];
          if (!meta) return false;
          const tags = meta.tags ? meta.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
          if (activeFilter === "New") return isNewLesson(meta.createdAt);
          return tags.includes(activeFilter);
        }),
      }))
      .filter((s) => s.videos.length > 0);
  }, [cat, activeFilter, dbLessonMap, bookmarkedIds]);

  if (!cat) {
    return (
      <PortalLayout title="WAVV Academy">
        <div className="px-4 lg:px-6 py-12 max-w-3xl mx-auto text-center">
          <GraduationCap size={40} className="text-gray-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Category Not Found</h1>
          <p className="text-gray-500 text-sm mb-6">
            This category doesn't exist yet. Head back to WAVV Academy to browse available content.
          </p>
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "#0074F4" }}
          >
            <ChevronLeft size={15} /> Back to Academy
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const totalVideos = cat.sections.reduce((sum, s) => sum + s.videos.length, 0);

  return (
    <>
    <PortalLayout title={`WAVV Academy — ${cat.label}`}>
      <div className="px-4 lg:px-8 py-6 space-y-6">

        {/* ── Back breadcrumb ── */}
        <Link
          href="/academy"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ChevronLeft size={15} />
          WAVV Academy
        </Link>

        {/* ── Category hero banner — simple gradient + icon (matches Academy.tsx cards) ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ height: "160px", border: `1px solid ${cat.color}40` }}
        >
          {/* Background gradient — no image, clean dark card with colour accent */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, rgba(8,10,16,1) 0%, rgba(8,10,16,0.95) 60%, ${cat.color}18 100%)` }}
          />
          {/* Large icon watermark — right side */}
          {(() => { const HeroIcon = CATEGORY_ICONS[cat.key] ?? Rocket; return (
            <div
              className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ opacity: 0.35, color: cat.color }}
            >
              <HeroIcon size={100} strokeWidth={1.2} />
            </div>
          ); })()}
          {/* Colour accent glow — subtle, centre-right */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 80% 50%, ${cat.color}14 0%, transparent 55%)` }}
          />
          {/* Content overlay */}
          <div className="relative flex flex-col justify-center h-full px-8 py-6 gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: cat.color }}>
              WAVV Academy
            </p>
            <h1 className="text-2xl font-extrabold text-white leading-tight">{cat.label}</h1>
            <p className="text-sm text-gray-300 mb-2">{cat.subtitle}</p>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: `${cat.color}35`, color: cat.color, border: `1px solid ${cat.color}` }}
              >
                {cat.sections.length} {cat.sections.length === 1 ? "section" : "sections"}
              </span>
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.15)", color: "#f3f4f6", border: "1px solid rgba(255,255,255,0.35)" }}
              >
                {totalVideos} {totalVideos === 1 ? "video" : "videos"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Section list ── */}
        <div className="space-y-3">
          {filteredSections.length === 0 && !dbCoursesLoading && (
            <div
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-center justify-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
            >
              <GraduationCap size={16} className="text-gray-600 flex-shrink-0" />
              <p className="text-sm text-gray-500">No Videos yet. Please check back soon!</p>
            </div>
          )}
          {filteredSections.map((section, idx) => (
            <SectionRow
              key={section.id}
              section={section}
              accentColor={cat.color}
              categoryKey={cat.key}
              defaultOpen={false}
              dbLessonMap={dbLessonMap}
              courseTags={
                dbCourseMap[section.title.toLowerCase().trim()]?.tags
                  ?.split(",")
                  .map((t) => t.trim())
                  .filter(Boolean) ?? []
              }
              onPlay={handlePlay}
              sectionPdfs={pdfsByCourseId[courseTitleToId[section.title.toLowerCase().trim()] ?? -1] ?? []}
            />
          ))}
        </div>

      </div>

      {/* ── Inline video player modal ── */}
      {playingVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={handleClosePlayer}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
            style={{ background: "#111", border: "1px solid #2a2a2a", boxShadow: "0 25px 80px rgba(0,0,0,0.7)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
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
                  style={{ background: "rgba(0,116,244,0.15)", color: "#60a5fa", border: "1px solid rgba(0,116,244,0.3)" }}
                >
                  <PictureInPicture2 size={13} />
                  <span className="hidden sm:inline">Pop out</span>
                </button>
                <button
                  type="button"
                  onClick={handleClosePlayer}
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
                src={playingVideo.embedUrl}
                title={playingVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
              />
            </div>
            {/* Modal footer */}
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

    </PortalLayout>

      {/* ── Floating video player (persists while browsing within the page) ── */}
      {floatingVideo && (
        <FloatingVideoPlayer
          title={floatingVideo.title}
          embedUrl={floatingVideo.embedUrl}
          onClose={() => setFloatingVideo(null)}
        />
      )}
    </>
  );
}

