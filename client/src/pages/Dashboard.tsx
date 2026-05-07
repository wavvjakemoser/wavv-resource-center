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

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const { data: recentProgress, isLoading: progressLoading } = trpc.academy.getRecentProgress.useQuery({ limit: 3 });
  const { data: upcomingWebinars } = trpc.webinars.list.useQuery({ type: "upcoming" });
  const { data: evergreenWebinars } = trpc.webinars.list.useQuery({ type: "evergreen" });
  const { data: exclusiveWebinars } = trpc.webinars.list.useQuery({ type: "exclusive" });

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

              {/* CTA — Start your first course */}
              <Link
                href="/academy"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #0074F4, #00A9E2)",
                  boxShadow: "0 4px 20px rgba(0,116,244,0.3)",
                  textDecoration: "none",
                }}
              >
                <GraduationCap size={15} />
                Start Your First Course
              </Link>
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
                    <p className="text-white text-xs font-semibold leading-snug flex-1">{tile.label}</p>
                    <ChevronRight size={12} className="text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

\        {/* ── Quick Category Access ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "START HERE", title: "WAVV Onboarding", desc: "6 sections, 12 videos — everything from setup to your first campaign.", href: "/academy/category/Onboarding", color: "#0074F4", icon: Rocket },
            { label: "MUST WATCH", title: "Spam Protection & Number Health", desc: "Keep your numbers clean and your connection rates high.", href: "/academy/category/How-To", color: "#f97316", icon: Target },
            { label: "MOST POPULAR", title: "Connection Rates Masterclass", desc: "Understand what drives connection rates and how to improve them.", href: "/academy/category/Strategy and Best Practices", color: "#67C728", icon: TrendingUp },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative overflow-hidden rounded-xl p-4 flex items-start gap-3 transition-all"
                style={{ background: `linear-gradient(135deg, ${item.color}12 0%, #0d1520 100%)`, border: `1px solid ${item.color}25`, textDecoration: "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${item.color}55`; e.currentTarget.style.boxShadow = `0 4px 20px ${item.color}18`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${item.color}25`; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}20` }}>
                  <Icon size={16} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold tracking-wide" style={{ color: item.color }}>{item.label}</span>
                  <p className="text-white text-xs font-semibold leading-snug mt-0.5">{item.title}</p>
                  <p className="text-gray-500 text-[11px] mt-1 leading-relaxed line-clamp-2">{item.desc}</p>
                </div>
                <ChevronRight size={13} className="text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-1" />
              </Link>
            );
          })}
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
\        {/* ── Exclusive Live Webinars ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: "#a855f7" }} />
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Exclusive Live Webinars</h2>
            </div>
            <Link href="/webinars" className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1" style={{ textDecoration: "none" }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {(() => {
            const exclusive = (exclusiveWebinars ?? []).filter((w) => !w.scheduledAt || new Date(w.scheduledAt) >= new Date()).slice(0, 4);
            if (exclusive.length === 0) {
              return (
                <div className="flex items-center justify-center py-6 rounded-xl text-gray-600 text-xs gap-2"
                  style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                  <Sparkles size={14} className="text-gray-700" />
                  No exclusive webinars scheduled — check back soon
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {exclusive.map((w) => (
                  <Link
                    key={w.id}
                    href="/webinars"
                    className="group flex flex-col gap-2 rounded-xl p-3.5 transition-all"
                    style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, #0d1520 100%)", border: "1px solid rgba(168,85,247,0.2)", textDecoration: "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.45)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(168,85,247,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)" }}>
                        <Sparkles size={13} style={{ color: "#a855f7" }} />
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.25)" }}>
                        EXCLUSIVE
                      </span>
                    </div>
                    <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{w.title}</p>
                    <p className="text-[10px] font-medium mt-auto" style={{ color: "rgba(168,85,247,0.7)" }}>
                      {w.scheduledAt ? new Date(w.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date TBD"}
                    </p>
                  </Link>
                ))}
              </div>
            );
          })()}
        </div>
        {/* ── On-Demand Webinars ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Video size={14} style={{ color: "#00A9E2" }} />
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">On-Demand Webinars</h2>
            </div>
            <Link href="/webinars" className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1" style={{ textDecoration: "none" }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {(() => {
            const onDemand = [
              ...(upcomingWebinars ?? []).slice(0, 2),
              ...(evergreenWebinars ?? []).slice(0, 4),
            ].slice(0, 4);
            if (onDemand.length === 0) {
              return (
                <div className="flex items-center justify-center py-6 rounded-xl text-gray-600 text-xs gap-2"
                  style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                  <Video size={14} className="text-gray-700" />
                  No recordings available yet
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {onDemand.map((w) => (
                  <Link
                    key={w.id}
                    href="/webinars"
                    className="group flex flex-col gap-2 rounded-xl p-3.5 transition-all"
                    style={{ background: "linear-gradient(135deg, rgba(0,169,226,0.08) 0%, #0d1520 100%)", border: "1px solid rgba(0,169,226,0.2)", textDecoration: "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,169,226,0.45)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,169,226,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,169,226,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,169,226,0.15)" }}>
                        <Video size={13} style={{ color: "#00A9E2" }} />
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,169,226,0.12)", color: "#00A9E2", border: "1px solid rgba(0,169,226,0.25)" }}>
                        {w.type === "evergreen" ? "ON-DEMAND" : "UPCOMING"}
                      </span>
                    </div>
                    <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{w.title}</p>
                    <p className="text-[10px] font-medium mt-auto" style={{ color: "rgba(0,169,226,0.7)" }}>
                      {w.type === "evergreen" ? "Watch anytime" : w.scheduledAt ? new Date(w.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Upcoming"}
                    </p>
                  </Link>
                ))}
              </div>
            );
          })()}
        </div>

      </div>
    </PortalLayout>
  );
}
