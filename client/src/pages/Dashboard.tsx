import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  GraduationCap,
  Video,
  FileText,
  LifeBuoy,
  FlaskConical,
  Play,
  Clock,
  Sparkles,
  TrendingUp,
  Star,
  Rocket,
  Wrench,
  Lightbulb,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { Link } from "wouter";

// ─── Static "Continue" items ──────────────────────────────────────────────────
const CONTINUE_ITEMS = [
  {
    type: "Course",
    title: "Getting Started with WAVV Dialer",
    progress: 65,
    lastAccessed: "2 hours ago",
    href: "/academy/category/Onboarding",
    color: "#0074F4",
    icon: GraduationCap,
  },
  {
    type: "Webinar Recording",
    title: "Power Dialer Best Practices — May 2026",
    progress: 40,
    lastAccessed: "Yesterday",
    href: "/webinars",
    color: "#00A9E2",
    icon: Video,
  },
  {
    type: "Course",
    title: "CRM Integration Setup Guide",
    progress: 20,
    lastAccessed: "3 days ago",
    href: "/academy/category/How-To",
    color: "#67C728",
    icon: FileText,
  },
];

// ─── New Releases (static — will be DB-driven when admin marks "New") ─────────
const NEW_RELEASES = [
  {
    title: "Welcome To The How-To Section",
    category: "How-To",
    href: "/academy/category/How-To",
    icon: Wrench,
    color: "#00A9E2",
    badge: "NEW",
  },
  {
    title: "Welcome To The Strategy & Best Practices Section",
    category: "Strategy & Best Practices",
    href: "/academy/category/Strategy and Best Practices",
    icon: Lightbulb,
    color: "#67C728",
    badge: "NEW",
  },
  {
    title: "Spam Protection",
    category: "How-To",
    href: "/academy/category/How-To",
    icon: Wrench,
    color: "#f97316",
    badge: "MUST WATCH",
  },
  {
    title: "Connection Rates",
    category: "Strategy & Best Practices",
    href: "/academy/category/Strategy and Best Practices",
    icon: Lightbulb,
    color: "#a855f7",
    badge: "MOST POPULAR",
  },
];

// ─── Recommended ──────────────────────────────────────────────────────────────
const RECOMMENDED = [
  {
    title: "WAVV Onboarding — Full Series",
    description: "Everything you need to get up and running with WAVV in one place.",
    href: "/academy/category/Onboarding",
    icon: Rocket,
    color: "#0074F4",
  },
  {
    title: "Nuisance Protection",
    description: "Learn how to protect your numbers and stay compliant.",
    href: "/academy/category/How-To",
    icon: Wrench,
    color: "#f97316",
  },
  {
    title: "WAVV Phone Numbers Tab",
    description: "Understand number health, rotation, and spam visibility.",
    href: "/academy/category/Strategy and Best Practices",
    icon: Lightbulb,
    color: "#67C728",
  },
];

// ─── Trending ─────────────────────────────────────────────────────────────────
const TRENDING = [
  { title: "Spam Protection", href: "/academy/category/How-To", rank: 1 },
  { title: "Connection Rates", href: "/academy/category/Strategy and Best Practices", rank: 2 },
  { title: "Making Calls With WAVV", href: "/academy/category/How-To", rank: 3 },
  { title: "WAVV Call Campaigns", href: "/academy/category/How-To", rank: 4 },
  { title: "Number Rotation Strategy", href: "/academy/category/Strategy and Best Practices", rank: 5 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  // Quick-access nav tiles
  const navTiles = [
    { href: "/academy", label: "Academy", icon: GraduationCap, color: "#0074F4" },
    { href: "/webinars", label: "Webinars", icon: Video, color: "#00A9E2" },
    { href: "/guides", label: "Guides & Docs", icon: FileText, color: "#67C728" },
    { href: "/support", label: "Support", icon: LifeBuoy, color: "#FF9900" },
    { href: "/hands-on", label: "Hands-On", icon: FlaskConical, color: "#a855f7" },
  ];

  return (
    <PortalLayout title="Home">
      <div className="px-4 lg:px-6 py-6 max-w-6xl mx-auto space-y-8">

        {/* ── Welcome banner ── */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
          style={{
            background: "linear-gradient(135deg, #001B28 0%, #0d1f35 50%, #0a1a10 100%)",
            border: "1px solid rgba(0, 116, 244, 0.2)",
          }}
        >
          <div className="relative z-10">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Welcome back, {firstName}!
            </h1>
            <p className="text-gray-400 text-sm max-w-xl">
              Everything you need to succeed with WAVV starts here.
            </p>
          </div>
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #0074F4, transparent)", transform: "translate(30%, -30%)" }}
          />
          <div
            className="absolute bottom-0 right-20 w-32 h-32 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #67C728, transparent)", transform: "translateY(30%)" }}
          />
        </div>

        {/* ── Continue Where You Left Off ── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Pick Up Where You Left Off
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONTINUE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex flex-col p-4 rounded-xl transition-all cursor-pointer"
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.color;
                    e.currentTarget.style.boxShadow = `0 4px 20px ${item.color}18`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#2a2a2a";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: `${item.color}20` }}
                    >
                      <Icon size={18} style={{ color: item.color }} />
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${item.color}15`, color: item.color }}
                    >
                      {item.type}
                    </span>
                  </div>
                  <h3 className="text-white text-sm font-medium leading-snug mb-3 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        {item.lastAccessed}
                      </span>
                      <span className="text-[10px] font-semibold" style={{ color: item.color }}>
                        {item.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: "#2a2a2a" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.progress}%`, background: item.color }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 text-gray-500 group-hover:text-white transition-colors">
                    <Play size={12} />
                    <span className="text-xs font-medium">Resume</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── New Releases ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} style={{ color: "#0074F4" }} />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              New Releases
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {NEW_RELEASES.map((item) => {
              const Icon = item.icon;
              const badgeColor =
                item.badge === "NEW" ? "#0074F4" :
                item.badge === "MUST WATCH" ? "#ef4444" :
                item.badge === "MOST POPULAR" ? "#f97316" : "#64748b";
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex flex-col gap-3 p-4 rounded-xl transition-all"
                  style={{ background: "#111", border: "1px solid #222", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.color;
                    e.currentTarget.style.boxShadow = `0 4px 20px ${item.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#222";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${item.color}18` }}
                    >
                      <Icon size={15} style={{ color: item.color }} />
                    </div>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}30` }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{item.title}</p>
                    <p className="text-gray-600 text-[10px] mt-0.5">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 group-hover:text-gray-400 transition-colors mt-auto">
                    <ExternalLink size={10} />
                    <span className="text-[10px]">View</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Recommended ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star size={15} style={{ color: "#fbbf24" }} />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Recommended for You
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {RECOMMENDED.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-start gap-4 p-4 rounded-xl transition-all"
                  style={{ background: "#111", border: "1px solid #222", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.color;
                    e.currentTarget.style.boxShadow = `0 4px 20px ${item.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#222";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}18` }}
                  >
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold leading-snug">{item.title}</p>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Trending ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} style={{ color: "#67C728" }} />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Trending Now
            </h2>
          </div>
          <div
            className="rounded-xl overflow-hidden divide-y"
            style={{ background: "#111", border: "1px solid #222", borderColor: "#222" }}
          >
            {TRENDING.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                style={{ textDecoration: "none" }}
              >
                <span
                  className="text-xs font-bold w-6 text-center flex-shrink-0"
                  style={{ color: item.rank <= 3 ? "#67C728" : "#4b5563" }}
                >
                  #{item.rank}
                </span>
                <BookOpen size={13} className="text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">
                  {item.title}
                </span>
                <TrendingUp size={12} className="text-gray-700 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Quick navigation tiles ── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Navigate
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {navTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <Link
                  key={tile.href}
                  href={tile.href}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl text-center transition-all cursor-pointer"
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", textDecoration: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = tile.color;
                    e.currentTarget.style.boxShadow = `0 4px 20px ${tile.color}18`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#2a2a2a";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${tile.color}20` }}
                  >
                    <Icon size={20} style={{ color: tile.color }} />
                  </div>
                  <span className="text-white text-xs font-semibold">{tile.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
