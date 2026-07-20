import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Compass,
  Play,
  Lock,
  Wrench,
  Lightbulb,
  Video,
  Send,
  CheckCircle2,
  Sparkles,
  GraduationCap as GradCap,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── 3 canonical categories ───────────────────────────────────────────────
const CATEGORIES = [
  {
    key: "Onboarding",
    label: "Onboarding",
    subtitle: "Everything you need to hit the ground running — from day one to fully dialing.",
    color: "#0074F4",
    icon: Compass,
    bgPosition: "center center",
    bgSize: "100% auto",
    thumbnail: "/manus-storage/academy-compass-final-v2_3487d992.png",
    placeholders: [
      {
        id: "p-onb-1",
        title: "Welcome to WAVV — Platform Overview",
        description:
          "A high-level tour of the WAVV dialer, dashboard, and core navigation to get you oriented fast.",
        duration: "8 min",
        status: "coming_soon" as const,
      },
      {
        id: "p-onb-2",
        title: "Setting Up Your First Campaign",
        description:
          "Step-by-step walkthrough of creating your first dialing campaign, uploading contacts, and launching.",
        duration: "12 min",
        status: "coming_soon" as const,
      },
      {
        id: "p-onb-3",
        title: "Connecting Your CRM",
        description:
          "How to integrate WAVV with your CRM so call data, dispositions, and notes sync automatically.",
        duration: "10 min",
        status: "coming_soon" as const,
      },
    ],
  },
  {
    key: "How-To",
    label: "How-To",
    subtitle: "Step-by-step walkthroughs for the features you use most.",
    color: "#00A9E2",
    icon: Wrench,
    bgPosition: "center center",
    bgSize: "100% auto",
    thumbnail: "/manus-storage/academy-gear-final-v2_007ed77c.png",
    placeholders: [
      {
        id: "p-how-1",
        title: "Using Call Boards Effectively",
        description:
          "Learn how to set up, manage, and monitor Call Boards to keep your team dialing consistently.",
        duration: "9 min",
        status: "coming_soon" as const,
      },
      {
        id: "p-how-2",
        title: "Managing Dispositions & Stages",
        description:
          "Configure custom dispositions and pipeline stages so your data stays clean and actionable.",
        duration: "7 min",
        status: "coming_soon" as const,
      },
      {
        id: "p-how-3",
        title: "Number Rotation & SPAM Visibility",
        description:
          "How to use number rotation to protect connection rates and flag numbers showing SPAM labels.",
        duration: "11 min",
        status: "coming_soon" as const,
      },
    ],
  },
  {
    key: "Strategy and Best Practices",
    label: "Strategy & Best Practices",
    subtitle: "Dial smarter, not harder. Frameworks and tactics to get more out of every session.",
    color: "#67C728",
    icon: Lightbulb,
    bgPosition: "center center",
    bgSize: "100% auto",
    thumbnail: "/manus-storage/academy-target-final-v2_b4297674.png",
    placeholders: [
      {
        id: "p-str-1",
        title: "Building a High-Performance Dialing Cadence",
        description:
          "Proven frameworks for structuring your outreach cadence to maximize live conversations.",
        duration: "14 min",
        status: "coming_soon" as const,
      },
      {
        id: "p-str-2",
        title: "Voicemail & Follow-Up Strategy",
        description:
          "When to leave voicemails, what to say, and how to sequence follow-up touches for best results.",
        duration: "10 min",
        status: "coming_soon" as const,
      },
      {
        id: "p-str-3",
        title: "Coaching Your Team with WAVV Data",
        description:
          "Use call analytics, connection rates, and disposition data to coach reps and improve outcomes.",
        duration: "13 min",
        status: "coming_soon" as const,
      },
    ],
  },
];

// ─── Course card (live data from DB) ────────────────────────────────────────────────────
function LiveCourseCard({
  course,
  accentColor,
  completedCount,
}: {
  course: {
    id: number;
    title: string;
    description: string | null;
    durationMinutes: number | null;
    thumbnailUrl: string | null;
  };
  accentColor: string;
  completedCount: number;
}) {
  return (
    <Link
      href={`/academy/${course.id}`}
      className="group flex flex-col rounded-xl overflow-hidden transition-all cursor-pointer hover:scale-[1.01]"
      style={{
        background: "#1d2230",
        border: "1px solid #2a2a2a",
        textDecoration: "none",
      }}
    >
      {/* Thumbnail or color strip */}
      {course.thumbnailUrl ? (
        <div className="relative h-36 overflow-hidden">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <Play size={9} />
            Watch
          </div>
        </div>
      ) : (
        <div
          className="h-2 w-full"
          style={{ background: accentColor }}
        />
      )}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-white font-semibold text-sm leading-snug mb-1">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-gray-300 text-xs leading-relaxed line-clamp-2 mb-3">
            {course.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
          <span />
          <ChevronRight
            size={14}
            className="text-gray-600 group-hover:text-gray-400 transition-colors"
          />
        </div>
      </div>
    </Link>
  );
}

// ─── Placeholder course card ──────────────────────────────────────────────
function PlaceholderCourseCard({
  title,
  description,
  duration,
  accentColor,
}: {
  title: string;
  description: string;
  duration: string;
  accentColor: string;
}) {
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden opacity-80"
      style={{
        background: "#1d2230",
        border: "1px solid #2a2a2a",
      }}
    >
      {/* Color strip */}
      <div className="h-2 w-full" style={{ background: accentColor }} />
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between mb-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}20` }}
          >
            <BookOpen size={13} style={{ color: accentColor }} />
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{
              background: "rgba(245,158,11,0.12)",
              color: "#f59e0b",
              border: "1px solid rgba(245,158,11,0.3)",
            }}
          >
            <Lock size={9} />
            Coming Soon
          </span>
        </div>
        <h3 className="text-white font-semibold text-sm leading-snug mb-1">
          {title}
        </h3>
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
          {description}
        </p>
        <div className="mt-auto" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
export default function Academy() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? null;
  const { data: courses, isLoading } = trpc.academy.getCourses.useQuery();
  const { data: progress } = trpc.academy.getProgress.useQuery({}, { enabled: !!user });

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lessonId)
  );

  // Group live (published) courses by category key
  // getCourses already filters to published=true and includes lessonCount (published lessons only)
  const coursesByCategory = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.key] = (courses ?? []).filter((c) => c.category === cat.key);
      return acc;
    },
    {} as Record<string, NonNullable<typeof courses>>
  );

  // DB-driven counts: sections = published courses in category, videos = sum of published lesson counts
  const dbCounts = CATEGORIES.reduce(
    (acc, cat) => {
      const catCourses = coursesByCategory[cat.key] ?? [];
      acc[cat.key] = {
        sections: catCourses.length,
        videos: catCourses.reduce((sum, c) => sum + ((c as any).lessonCount ?? 0), 0),
      };
      return acc;
    },
    {} as Record<string, { sections: number; videos: number }>
  );

  return (
    <PortalLayout title="WAVV Academy">
      <div className="px-4 lg:px-8 py-6 space-y-8">
        {/* Spacer for consistent vertical alignment with pages that have toggle bars */}
        <div style={{ minHeight: "32px" }} />

        {/* ── Hero header ── */}
        <div className="px-4 sm:px-6 lg:px-16 py-8 sm:py-12 text-center flex flex-col items-center justify-center" style={{ minHeight: "220px" }}>
            {/* Headline */}
            <h1 className="font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}>
              <span style={{ background: "linear-gradient(135deg, #ffffff 0%, #bae6fd 30%, #7dd3fc 60%, #67C728 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                WAVV Academy
              </span>
            </h1>
            {/* Accent line */}
            <div className="flex justify-center mb-5">
              <div style={{ width: "200px", height: "3px", borderRadius: "2px", background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)" }} />
            </div>
            {/* Subline */}
            <p className="mx-auto leading-relaxed" style={{ color: "#ffffff", fontSize: "clamp(0.88rem, 1.6vw, 1rem)", maxWidth: "560px" }}>
              Every lesson is built around a specific outcome — faster onboarding, sharper skills, better team performance. Start anywhere, go at your own pace.
            </p>
        </div>

        {/* ── Loading skeletons ── */}
        {isLoading && (
          <div className="space-y-10">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-40 rounded-2xl animate-pulse" style={{ background: "#1d2230" }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="h-36 rounded-xl animate-pulse" style={{ background: "#1d2230" }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state when no courses are published ── */}
        {!isLoading && (courses ?? []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(0,116,244,0.1)", border: "1px solid rgba(0,116,244,0.2)" }}>
              <GraduationCap size={32} style={{ color: "#0074F4" }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Content Coming Soon</h3>
            <p className="text-gray-300 text-sm max-w-sm">
              The WAVV Academy is being set up. Check back soon — structured learning paths and video lessons will be available here.
            </p>
          </div>
        )}

        {/* ── 3 Category sections ── */}
        {!isLoading &&
          CATEGORIES.map((cat) => {
            const liveCourses = coursesByCategory[cat.key] ?? [];

            return (
              <section key={cat.key}>
                {/* Category banner — fully clickable, navigates into the category */}
                <Link
                  href={`/academy/category/${encodeURIComponent(cat.key)}`}
                  className="group relative overflow-hidden rounded-2xl block cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    textDecoration: "none",
                    border: `1px solid ${cat.color}60`,
                    height: "260px",
                    boxShadow: `0 0 0 1px ${cat.color}20, 0 4px 32px ${cat.color}18`,
                  }}
                >
                  {/* Deep space black base */}
                  <div className="absolute inset-0" style={{ background: "#000" }} />

                  {/* Circuit board SVG pattern */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`circuit-${cat.key}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={cat.color} strokeWidth="0.8" fill="none"/>
                        <circle cx="10" cy="10" r="2" fill={cat.color}/>
                        <circle cx="50" cy="10" r="2" fill={cat.color}/>
                        <circle cx="50" cy="50" r="2" fill={cat.color}/>
                        <circle cx="30" cy="30" r="1.5" fill={cat.color}/>
                        <path d="M0 30 L10 30 M60 50 L50 50" stroke={cat.color} strokeWidth="0.6" fill="none"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#circuit-${cat.key})`}/>
                  </svg>

                  {/* Full-width radial color glow — centered across entire tile */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse 120% 100% at 70% 50%, ${cat.color}28 0%, ${cat.color}10 45%, transparent 75%)`,
                    }}
                  />

                  {/* Secondary glow — left edge so effects bleed across full width */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse 60% 80% at 15% 50%, ${cat.color}12 0%, transparent 60%)`,
                    }}
                  />

                  {/* Neon scan line — full width */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, ${cat.color}06 0%, ${cat.color}12 50%, ${cat.color}06 100%)`,
                    }}
                  />

                  {/* Top edge neon line */}
                  <div
                    className="absolute top-0 left-0 right-0 pointer-events-none"
                    style={{ height: "1px", background: `linear-gradient(to right, transparent 0%, ${cat.color}60 30%, ${cat.color}90 60%, transparent 100%)` }}
                  />

                  {/* Full-bleed thumbnail — covers entire tile as background */}
                  <img src={cat.thumbnail} alt="" loading="eager" fetchPriority="high" className="hidden" />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `url(${cat.thumbnail})`,
                      backgroundSize: (cat as any).bgSize ?? "100% auto",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: cat.bgPosition ?? "center center",
                      opacity: 0.85,
                    }}
                  />

                  {/* Dark gradient overlay — left side for text legibility */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)" }}
                  />

                  {/* Hover neon border pulse */}
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `inset 0 0 0 1px ${cat.color}80, 0 0 24px ${cat.color}30` }}
                  />

                  {/* Content overlay — category label, subtitle, and count badges */}
                  <div className="relative flex flex-col justify-center h-full px-8 py-6 gap-1">
                    <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: cat.color }}>
                      WAVV Academy
                    </p>
                    <h2 className="text-4xl font-extrabold text-white leading-tight mb-1">
                      {cat.label}
                    </h2>
                    <p className="text-base text-white mb-3">{cat.subtitle}</p>
                    {(() => {
                      const counts = dbCounts[cat.key];
                      if (!counts) return null;
                      return (
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[11px] font-bold px-3 py-1 rounded-full"
                            style={{ background: `${cat.color}35`, color: cat.color, border: `1px solid ${cat.color}` }}
                          >
                            {counts.sections} {counts.sections === 1 ? "section" : "sections"}
                          </span>
                          <span
                            className="text-[11px] font-bold px-3 py-1 rounded-full"
                            style={{ background: "rgba(255,255,255,0.15)", color: "#f3f4f6", border: "1px solid rgba(255,255,255,0.35)" }}
                          >
                            {counts.videos} {counts.videos === 1 ? "video" : "videos"}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </Link>
              </section>
            );
          })}

      </div>

      {/* ── Request a Video CTA ── */}
      <div className="px-4 lg:px-8 pb-10">
        <ContentRequestCTA requestType="video" accentColor="#ffffff" />
      </div>
    </PortalLayout>
  );
}

// ─── CTA Strip (triggers modal) ─────────────────────────────────────────────
export function ContentRequestCTA({
  requestType,
  accentColor,
}: {
  requestType: "video" | "guide" | "webinar";
  accentColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: allSettings = {} } = trpc.siteSettings.getAll.useQuery();
  const settingsMap = allSettings as Record<string, unknown>;
  // Check the toggle for this request type — default true (visible)
  const settingKey = requestType === "video" ? "video_requests_enabled" : requestType === "guide" ? "guide_requests_enabled" : "webinar_requests_enabled";
  const isEnabled = settingsMap[settingKey] !== false;
  const accent = accentColor ?? (requestType === "video" ? "#0074F4" : requestType === "guide" ? "#00A9E2" : "#10b981");
  const typeLabel = requestType === "video" ? "Video" : requestType === "guide" ? "Resource" : "Webinar";
  // Match the sidebar emblem for each section
  const CtaIcon = requestType === "video" ? GradCap : requestType === "guide" ? FileText : Video;
  const tagline = requestType === "video"
    ? "Don't see what you need? Help us build what matters most to you."
    : requestType === "guide"
    ? "Missing a resource, playbook, or reference doc? Tell us what would help your team."
    : "Want a session on a specific topic? Let us know what to cover next.";

  // If the owner has disabled this request type, render nothing
  if (!isEnabled) return null;

  return (
    <>
      {/* Divider */}
      <div className="mb-6" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
      <div
        className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl px-6 py-5"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm mb-0.5">Request a {typeLabel}</p>
          <p className="text-[#94a3b8] text-xs leading-relaxed">{tagline}</p>
        </div>
        {/* CTA button */}
        <button
          onClick={() => setOpen(true)}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
          style={{ background: "transparent", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          Request a {typeLabel}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-lg"
          style={{ background: "#0d1117", border: `1px solid ${accent}30`, color: "white" }}
        >
          <DialogHeader>
            <DialogTitle className="text-white text-base font-bold">Request a {typeLabel}</DialogTitle>
          </DialogHeader>
          <ContentRequestForm
            requestType={requestType}
            accentColor={accent}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Reusable Content Request Form ───────────────────────────────────────────
export function ContentRequestForm({
  requestType,
  accentColor,
  onSuccess,
}: {
  requestType: "video" | "guide" | "webinar";
  accentColor?: string;
  onSuccess?: () => void;
}) {
  const accent = accentColor ?? (requestType === "video" ? "#0074F4" : requestType === "guide" ? "#00A9E2" : "#10b981");
  const typeLabel = requestType === "video" ? "Video" : requestType === "guide" ? "Resource" : "Webinar";
  const typeIcon = requestType === "video" ? Video : requestType === "guide" ? BookOpen : GraduationCap;
  const TypeIcon = typeIcon;

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = trpc.contentRequests.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      if (onSuccess) setTimeout(onSuccess, 1800);
    },
  });

  if (submitted) {
    return (
      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
        style={{ background: "#0f1623", border: `1px solid ${accent}40` }}
      >
        <CheckCircle2 size={36} style={{ color: accent }} />
        <h3 className="text-white font-bold text-lg">Request Submitted</h3>
        <p className="text-gray-200 text-sm">
          Thanks for the suggestion. We review all requests and prioritize based on demand.
        </p>
        <button
          onClick={() => { setSubmitted(false); setTopic(""); setDescription(""); }}
          className="text-xs mt-1 underline"
          style={{ color: accent }}
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{ background: "#0f1623", border: `1px solid ${accent}30` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ background: `${accent}18` }}>
          <TypeIcon size={18} style={{ color: accent }} />
        </div>
        <div>
          <h3 className="text-white font-bold text-base">Request a {typeLabel}</h3>
          <p className="text-gray-300 text-xs">Don't see what you need? Let us know what to build next.</p>
        </div>
      </div>

      {/* Topic */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Topic *</label>
        <input
          type="text"
          placeholder={`e.g. ${requestType === "video" ? "How to set up call boards" : requestType === "guide" ? "CRM integration checklist" : "Advanced dialing strategies"}`}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={255}
          className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:ring-1"
          style={{ background: "#161d2e", border: "1px solid #2a3347" }}
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {requestType === "video" ? "What do you want to learn?" : requestType === "guide" ? "What problem are you solving?" : "What should we cover?"}
        </label>
        <textarea
          placeholder="Describe the specific use case, problem, or outcome you're looking for..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none resize-none"
          style={{ background: "#161d2e", border: "1px solid #2a3347" }}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (!topic.trim()) return;
            submit.mutate({ requestType, topic: topic.trim(), description: description.trim() || undefined });
          }}
          disabled={!topic.trim() || submit.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: accent, color: "#000" }}
        >
          <Send size={14} />
          {submit.isPending ? "Submitting..." : "Submit Request"}
        </button>
      </div>
      {submit.isError && (
        <p className="text-red-400 text-xs">{submit.error?.message ?? "Something went wrong. Please try again."}</p>
      )}
    </div>
  );
}
