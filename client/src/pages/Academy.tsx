import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  BookOpen,
  Clock,
  ChevronRight,
  GraduationCap,
  Play,
  TrendingUp,
  Star,
  Lock,
  Rocket,
  PlayCircle,
  Target,
} from "lucide-react";

// ─── 3 canonical categories ───────────────────────────────────────────────
const CATEGORIES = [
  {
    key: "Onboarding",
    label: "Onboarding",
    subtitle: "Get your team up and running with WAVV",
    color: "#0074F4",
    icon: Rocket,
    thumbnail:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/academy-onboarding-thumb-cy9amSDtDB8FaRgmGumyrX.webp",
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
    subtitle: "Step-by-step guides for core WAVV features",
    color: "#00A9E2",
    icon: PlayCircle,
    thumbnail:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/academy-howto-thumb-iuntTrCa6frsgxgN6pFnCD.webp",
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
    label: "Strategy",
    subtitle: "Maximize connection rates, conversions, and team performance",
    color: "#67C728",
    icon: Target,
    thumbnail:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/academy-strategy-thumb-fKFxPeA2NotYc3dTCL2qLc.webp",
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
] as const;

// ─── Trending placeholder cards ───────────────────────────────────────────
const TRENDING = [
  {
    id: "t-1",
    title: "Welcome to WAVV — Platform Overview",
    category: "Onboarding",
    categoryColor: "#0074F4",
    duration: "8 min",
    views: 142,
  },
  {
    id: "t-2",
    title: "Using Call Boards Effectively",
    category: "How-To",
    categoryColor: "#00A9E2",
    duration: "9 min",
    views: 98,
  },
  {
    id: "t-3",
    title: "Building a High-Performance Dialing Cadence",
    category: "Strategy & Best Practices",
    categoryColor: "#67C728",
    duration: "14 min",
    views: 87,
  },
  {
    id: "t-4",
    title: "Number Rotation & SPAM Visibility",
    category: "How-To",
    categoryColor: "#00A9E2",
    duration: "11 min",
    views: 74,
  },
];

// ─── Course card (live data from DB) ─────────────────────────────────────
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
        background: "#1a1a1a",
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
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
            {course.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between text-xs text-gray-600">
          {course.durationMinutes ? (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {course.durationMinutes} min
            </span>
          ) : (
            <span />
          )}
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
        background: "#1a1a1a",
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
              background: "rgba(255,255,255,0.05)",
              color: "#888",
              border: "1px solid #333",
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
        <div className="mt-auto flex items-center gap-1 text-xs text-gray-600">
          <Clock size={11} />
          {duration}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
export default function Academy() {
  const { data: courses, isLoading } = trpc.academy.getCourses.useQuery();
  const { data: progress } = trpc.academy.getProgress.useQuery({});

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lessonId)
  );

  // Group live courses by category key
  const coursesByCategory = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.key] = (courses ?? []).filter((c) => c.category === cat.key);
      return acc;
    },
    {} as Record<string, NonNullable<typeof courses>>
  );

  return (
    <PortalLayout title="WAVV Academy">
      <div className="px-4 lg:px-6 py-6 max-w-6xl mx-auto space-y-10">

        {/* ── Hero header ── */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #001B28 0%, #0d1f35 100%)",
            border: "1px solid rgba(0, 116, 244, 0.2)",
          }}
        >
          {/* Subtle glow */}
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #0074F4, transparent)" }}
          />
          <div className="flex items-start gap-4 relative">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0, 116, 244, 0.2)" }}
            >
              <GraduationCap size={24} style={{ color: "#0074F4" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-1">WAVV Academy</h1>
              <p className="text-gray-400 text-sm max-w-xl">
                Structured learning paths to help you and your team get the most out of WAVV.
                Every lesson is designed to solve a specific problem — faster onboarding, higher
                connection rates, and better team performance.
              </p>
              {completedLessonIds.size > 0 && (
                <p className="text-[#67C728] text-xs mt-2 font-medium">
                  ✓ {completedLessonIds.size} lesson{completedLessonIds.size !== 1 ? "s" : ""} completed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Loading skeletons ── */}
        {isLoading && (
          <div className="space-y-10">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-40 rounded-2xl animate-pulse" style={{ background: "#1a1a1a" }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="h-36 rounded-xl animate-pulse" style={{ background: "#1a1a1a" }} />
                  ))}
                </div>
              </div>
            ))}
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
                  className="group relative overflow-hidden rounded-2xl block cursor-pointer"
                  style={{ border: `1px solid ${cat.color}30`, textDecoration: "none" }}
                >
                  <img
                    src={cat.thumbnail}
                    alt={cat.label}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ height: "160px" }}
                  />
                  {/* Overlay gradient */}
                  <div
                    className="absolute inset-0 transition-opacity duration-200 group-hover:opacity-80"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
                    }}
                  />
                  {/* Text overlay */}
                  <div className="absolute inset-0 flex items-center justify-between px-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {cat.icon && (
                          <cat.icon size={18} style={{ color: cat.color }} />
                        )}
                        <h2 className="text-lg font-bold text-white">{cat.label}</h2>
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full ml-1"
                          style={{
                            background: "rgba(255,255,255,0.12)",
                            color: "#ffffff",
                            border: "1px solid rgba(255,255,255,0.3)",
                          }}
                        >
                          {liveCourses.length > 0
                            ? (() => {
                                const totalLessons = liveCourses.reduce(
                                  (sum, c) => sum + (c.lessonCount ?? 0),
                                  0
                                );
                                return `${liveCourses.length} section${liveCourses.length !== 1 ? "s" : ""} · ${totalLessons} video${totalLessons !== 1 ? "s" : ""}`;
                              })()
                            : "Coming Soon"}
                        </span>
                      </div>
                      <p className="text-gray-300 text-xs max-w-sm">{cat.subtitle}</p>
                    </div>
                    {/* Arrow CTA */}
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                      style={{ background: `${cat.color}30`, border: `1px solid ${cat.color}50` }}
                    >
                      <ChevronRight size={18} style={{ color: cat.color }} />
                    </div>
                  </div>
                </Link>
              </section>
            );
          })}

        {/* ── Trending This Week ── */}
        {!isLoading && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} style={{ color: "#FBBF24" }} />
              <h2 className="text-base font-bold text-white">Trending This Week</h2>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-1"
                style={{
                  background: "rgba(251,191,36,0.1)",
                  color: "#FBBF24",
                  border: "1px solid rgba(251,191,36,0.25)",
                }}
              >
                Auto-populated
              </span>
            </div>
            <p className="text-gray-500 text-xs -mt-2">
              Most-watched content across all WAVV Academy users this week.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TRENDING.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex flex-col rounded-xl p-4 opacity-75"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-lg font-black"
                      style={{ color: idx === 0 ? "#FBBF24" : "#444" }}
                    >
                      #{idx + 1}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        background: `${item.categoryColor}20`,
                        color: item.categoryColor,
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-white text-xs font-semibold leading-snug mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="mt-auto flex items-center justify-between text-[10px] text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {item.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={10} />
                      {item.views} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </PortalLayout>
  );
}
