import PortalLayout from "@/components/PortalLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  GraduationCap,
  Video,
  FileText,
  Headphones,
  FlaskConical,
  Play,
  Clock,
  Sparkles,
  TrendingUp,
  Rocket,
  Wrench,
  Lightbulb,
  ExternalLink,
  BookOpen,
  ChevronRight,
  Zap,
  Target,
  Award,
} from "lucide-react";
import { Link } from "wouter";

// ─── Quick-access tiles (matches sidebar order) ───────────────────────────────
const NAV_TILES = [
  { href: "/academy", label: "WAVV Academy", icon: GraduationCap, color: "#0074F4" },
  { href: "/webinars", label: "WAVV Webinars", icon: Video, color: "#00A9E2" },
  { href: "/guides", label: "WAVV Guides & Docs", icon: FileText, color: "#67C728" },
  { href: "/hands-on", label: "WAVV Playground", icon: FlaskConical, color: "#a855f7" },
  { href: "/support", label: "WAVV Support", icon: Headphones, color: "#FF9900" },
];

// ─── Featured content (hero card + 2 side cards) ─────────────────────────────
const FEATURED_HERO = {
  label: "START HERE",
  title: "WAVV Onboarding — Full Series",
  description: "The complete guide to getting your team dialing. 6 sections, 12 videos — everything from setup to your first campaign.",
  href: "/academy/category/Onboarding",
  color: "#0074F4",
  icon: Rocket,
  tag: "Onboarding",
  duration: "~45 min",
};

const FEATURED_SIDE = [
  {
    title: "Spam Protection & Number Health",
    description: "Keep your numbers clean and your connection rates high.",
    href: "/academy/category/How-To",
    color: "#f97316",
    icon: Target,
    tag: "How-To",
    badge: "MUST WATCH",
  },
  {
    title: "Connection Rates Masterclass",
    description: "Understand what drives connection rates and how to improve them.",
    href: "/academy/category/Strategy and Best Practices",
    color: "#67C728",
    icon: TrendingUp,
    tag: "Strategy",
    badge: "MOST POPULAR",
  },
];

// ─── Continue learning ────────────────────────────────────────────────────────
// Color + icon mapping per category
const CATEGORY_META: Record<string, { color: string; icon: typeof GraduationCap }> = {
  "Onboarding": { color: "#0074F4", icon: GraduationCap },
  "How-To": { color: "#00A9E2", icon: Wrench },
  "Strategy and Best Practices": { color: "#67C728", icon: TrendingUp },
  "Dialer Setup": { color: "#f97316", icon: Zap },
  "CRM Integrations": { color: "#a855f7", icon: Target },
  "Spam Protection": { color: "#FF9900", icon: Award },
};

function formatRelative(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

// ─── What's new ───────────────────────────────────────────────────────────────
const WHATS_NEW = [
  {
    title: "How-To Section — Full Guide",
    category: "How-To",
    href: "/academy/category/How-To",
    icon: Wrench,
    color: "#00A9E2",
    badge: "NEW",
    badgeColor: "#0074F4",
    description: "8 sections covering every core WAVV feature with step-by-step walkthroughs.",
  },
  {
    title: "Strategy & Best Practices",
    category: "Strategy",
    href: "/academy/category/Strategy and Best Practices",
    icon: Lightbulb,
    color: "#67C728",
    badge: "NEW",
    badgeColor: "#0074F4",
    description: "3 sections on maximizing connection rates, conversions, and team performance.",
  },
  {
    title: "Nuisance Protection Deep Dive",
    category: "How-To",
    href: "/academy/category/How-To",
    icon: Target,
    color: "#f97316",
    badge: "UPDATED",
    badgeColor: "#f97316",
    description: "Updated guide on protecting your numbers and staying compliant.",
  },
  {
    title: "Number Rotation Strategy",
    category: "Strategy",
    href: "/academy/category/Strategy and Best Practices",
    icon: Award,
    color: "#a855f7",
    badge: "POPULAR",
    badgeColor: "#a855f7",
    description: "How to use number rotation to maintain healthy connection rates.",
  },
];

// ─── Trending ─────────────────────────────────────────────────────────────────
const TRENDING = [
  { title: "Spam Protection", href: "/academy/category/How-To", rank: 1, category: "How-To", color: "#f97316" },
  { title: "Connection Rates Overview", href: "/academy/category/Strategy and Best Practices", rank: 2, category: "Strategy", color: "#67C728" },
  { title: "Making Calls With WAVV", href: "/academy/category/How-To", rank: 3, category: "How-To", color: "#00A9E2" },
  { title: "WAVV Call Campaigns", href: "/academy/category/How-To", rank: 4, category: "How-To", color: "#00A9E2" },
  { title: "Number Rotation Strategy", href: "/academy/category/Strategy and Best Practices", rank: 5, category: "Strategy", color: "#67C728" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const { data: recentProgress, isLoading: progressLoading } = trpc.academy.getRecentProgress.useQuery({ limit: 3 });

  return (
    <PortalLayout title="Home">
      <div className="px-4 lg:px-6 py-6 max-w-6xl mx-auto space-y-8">

        {/* ── Hero banner ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #001020 0%, #001B38 40%, #001a10 100%)",
            border: "1px solid rgba(0, 116, 244, 0.25)",
          }}
        >
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none opacity-[0.08]"
            style={{ background: "radial-gradient(circle, #0074F4, transparent)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full pointer-events-none opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #67C728, transparent)", transform: "translateY(40%)" }} />

          <div className="relative z-10 p-6 lg:p-8">
            {/* Top row: greeting + progress strip */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">WAVV Success Center</p>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  Welcome back, {firstName}!
                </h1>
                <p className="text-gray-400 text-sm max-w-lg">
                  Everything you need to get more out of WAVV — faster.
                </p>
              </div>

              {/* Progress strip — PLACEHOLDER: wired to real per-user category progress once lesson-level tracking is complete */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <div className="flex gap-4 lg:gap-6">
                  {[
                    { label: "Onboarding", pct: 33, color: "#0074F4" },
                    { label: "How-To", pct: 0, color: "#00A9E2" },
                    { label: "Strategy", pct: 0, color: "#67C728" },
                  ].map((track) => (
                    <div key={track.label} className="flex flex-col items-center gap-2 min-w-[72px]">
                      <div className="relative w-12 h-12">
                        <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a2a3a" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15.9" fill="none"
                            stroke={track.color} strokeWidth="3"
                            strokeDasharray={`${track.pct} ${100 - track.pct}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                          {track.pct}%
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 text-center leading-tight">{track.label}</span>
                    </div>
                  ))}
                </div>
                <span
                  className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}
                >
                  ⚠ Placeholder data
                </span>
              </div>
            </div>

            {/* Quick-access bar */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {NAV_TILES.map((tile) => {
                const Icon = tile.icon;
                return (
                  <Link
                    key={tile.href}
                    href={tile.href}
                    className="group flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${tile.color}12`;
                      e.currentTarget.style.borderColor = `${tile.color}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${tile.color}20` }}>
                      <Icon size={15} style={{ color: tile.color }} />
                    </div>
                    <p className="text-white text-xs font-semibold leading-none truncate flex-1">{tile.label}</p>
                    <ChevronRight size={12} className="text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Featured Content ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={15} style={{ color: "#0074F4" }} />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Featured</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Hero card */}
            <Link
              href={FEATURED_HERO.href}
              className="group lg:col-span-2 relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between min-h-[200px] transition-all"
              style={{
                background: `linear-gradient(135deg, ${FEATURED_HERO.color}18 0%, #0d1520 100%)`,
                border: `1px solid ${FEATURED_HERO.color}30`,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${FEATURED_HERO.color}70`;
                e.currentTarget.style.boxShadow = `0 8px 32px ${FEATURED_HERO.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${FEATURED_HERO.color}30`;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none opacity-10"
                style={{ background: `radial-gradient(circle, ${FEATURED_HERO.color}, transparent)`, transform: "translate(30%, -30%)" }} />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: `${FEATURED_HERO.color}20`, color: FEATURED_HERO.color, border: `1px solid ${FEATURED_HERO.color}40` }}>
                    {FEATURED_HERO.label}
                  </span>
                  <span className="text-[10px] text-gray-600">{FEATURED_HERO.tag}</span>
                </div>
                <h3 className="text-white text-xl font-bold leading-snug mb-2">{FEATURED_HERO.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-md">{FEATURED_HERO.description}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock size={12} />
                  <span className="text-xs">{FEATURED_HERO.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white group-hover:gap-2.5 transition-all">
                  <Play size={14} style={{ color: FEATURED_HERO.color }} />
                  <span className="text-sm font-semibold" style={{ color: FEATURED_HERO.color }}>Start Learning</span>
                  <ChevronRight size={14} style={{ color: FEATURED_HERO.color }} />
                </div>
              </div>
            </Link>

            {/* Side cards */}
            <div className="flex flex-col gap-4">
              {FEATURED_SIDE.map((item) => {
                const Icon = item.icon;
                const badgeColor = item.badge === "MUST WATCH" ? "#ef4444" : "#f97316";
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group relative overflow-hidden rounded-xl p-4 flex flex-col gap-3 flex-1 transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}10 0%, #0d1520 100%)`,
                      border: `1px solid ${item.color}25`,
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${item.color}60`;
                      e.currentTarget.style.boxShadow = `0 4px 20px ${item.color}18`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${item.color}25`;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${item.color}20` }}>
                        <Icon size={15} style={{ color: item.color }} />
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}30` }}>
                        {item.badge}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold leading-snug">{item.title}</p>
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 group-hover:text-gray-300 transition-colors mt-auto">
                      <ExternalLink size={10} />
                      <span className="text-[10px]">View lesson</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Continue Learning ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Play size={15} style={{ color: "#0074F4" }} />
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Continue Learning</h2>
            </div>
            <Link href="/academy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1" style={{ textDecoration: "none" }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {/* Loading skeleton */}
          {progressLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: "#141414", border: "1px solid #222" }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!progressLoading && (!recentProgress || recentProgress.length === 0) && (
            <div
              className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl text-center"
              style={{ background: "#141414", border: "1px solid #222" }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#0074F418" }}>
                <BookOpen size={22} style={{ color: "#0074F4" }} />
              </div>
              <p className="text-white text-sm font-semibold">You're all caught up!</p>
              <p className="text-gray-500 text-xs max-w-xs">
                Explore the WAVV Success Center for more helpful resources
              </p>
              <Link
                href="/academy"
                className="mt-1 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                style={{ background: "#0074F418", color: "#0074F4", textDecoration: "none", border: "1px solid #0074F430" }}
              >
                Browse Academy
              </Link>
            </div>
          )}

          {/* Real progress cards */}
          {!progressLoading && recentProgress && recentProgress.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentProgress.map((item) => {
                const meta = CATEGORY_META[item.category] ?? { color: "#0074F4", icon: GraduationCap };
                const Icon = meta.icon;
                const color = meta.color;
                return (
                  <Link
                    key={item.courseId}
                    href={`/academy/${item.courseId}`}
                    className="group flex flex-col p-5 rounded-xl transition-all"
                    style={{ background: "#141414", border: "1px solid #222", textDecoration: "none" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = color;
                      e.currentTarget.style.boxShadow = `0 4px 24px ${color}18`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#222";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${color}18` }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: `${color}12`, color }}>
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-white text-sm font-semibold leading-snug mb-4 line-clamp-2 flex-1">
                      {item.courseTitle}
                    </h3>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Clock size={10} /> {formatRelative(new Date(item.lastUpdatedAt))}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color }}>{item.progressPct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#2a2a2a]">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${item.progressPct}%`, background: color }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-4 text-gray-600 group-hover:text-white transition-colors">
                      <Play size={12} />
                      <span className="text-xs font-medium">Resume</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── What's New + Trending (side by side) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* What's New — 3/5 width */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={15} style={{ color: "#0074F4" }} />
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">What's New</h2>
              </div>
              <span
                className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}
              >
                ⚠ Placeholder — editorial content
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WHATS_NEW.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex flex-col gap-3 p-4 rounded-xl transition-all"
                    style={{ background: "#111", border: "1px solid #1e1e1e", textDecoration: "none" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = item.color;
                      e.currentTarget.style.boxShadow = `0 4px 20px ${item.color}12`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#1e1e1e";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${item.color}18` }}>
                        <Icon size={14} style={{ color: item.color }} />
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${item.badgeColor}15`, color: item.badgeColor, border: `1px solid ${item.badgeColor}30` }}>
                        {item.badge}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold leading-snug">{item.title}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5 font-medium">{item.category}</p>
                      <p className="text-gray-500 text-[11px] mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-700 group-hover:text-gray-400 transition-colors mt-auto">
                      <ExternalLink size={10} />
                      <span className="text-[10px]">View</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Trending — 2/5 width */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} style={{ color: "#67C728" }} />
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Trending Now</h2>
              </div>
              <span
                className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}
              >
                ⚠ Placeholder
              </span>
            </div>
            <div className="rounded-xl overflow-hidden divide-y divide-[#1a1a1a]"
              style={{ background: "#111", border: "1px solid #1e1e1e" }}>
              {TRENDING.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  {/* Rank badge */}
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: item.rank <= 3 ? `${item.color}18` : "#1a1a1a",
                      border: `1px solid ${item.rank <= 3 ? item.color + "30" : "#2a2a2a"}`,
                    }}>
                    <span className="text-[10px] font-bold"
                      style={{ color: item.rank <= 3 ? item.color : "#4b5563" }}>
                      #{item.rank}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-xs font-medium group-hover:text-white transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] mt-0.5 font-medium" style={{ color: item.color + "99" }}>
                      {item.category}
                    </p>
                  </div>
                  <BookOpen size={12} className="text-gray-700 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
