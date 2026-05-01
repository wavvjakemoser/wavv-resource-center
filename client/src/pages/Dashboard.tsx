import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  GraduationCap,
  Video,
  FileText,
  LifeBuoy,
  CheckCircle,
  Sparkles,
  LogIn,
  Search,
  MessageSquare,
  Ticket,
  CalendarCheck,
  TrendingUp,
  FlaskConical,
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: courses } = trpc.academy.getCourses.useQuery();
  const { data: progress } = trpc.academy.getProgress.useQuery({});
  const { data: webinars } = trpc.webinars.list.useQuery({});
  const { data: tickets } = trpc.support.getMyTickets.useQuery();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lessonId)
  );

  const upcomingWebinars = (webinars ?? []).filter((w) => w.type === "upcoming");
  const openTickets = (tickets ?? []).filter(
    (t) => t.status === "open" || t.status === "in_progress"
  );

  // Usage stats — real data where available, placeholder zeros for metrics not yet tracked
  const usageStats = [
    {
      label: "Lessons Completed",
      value: completedLessonIds.size,
      icon: CheckCircle,
      color: "#67C728",
      sub: "all time",
    },
    {
      label: "Courses Available",
      value: courses?.length ?? 0,
      icon: GraduationCap,
      color: "#0074F4",
      sub: "in your library",
    },
    {
      label: "Registered Webinars",
      value: upcomingWebinars.length,
      icon: CalendarCheck,
      color: "#00A9E2",
      sub: "upcoming",
    },
    {
      label: "Open Tickets",
      value: openTickets.length,
      icon: Ticket,
      color: "#FF9900",
      sub: "awaiting response",
    },
    {
      label: "AI Conversations",
      value: 0,
      icon: MessageSquare,
      color: "#a855f7",
      sub: "coming soon",
      placeholder: true,
    },
    {
      label: "Total Searches",
      value: 0,
      icon: Search,
      color: "#06b6d4",
      sub: "coming soon",
      placeholder: true,
    },
    {
      label: "Logins This Month",
      value: 0,
      icon: LogIn,
      color: "#f59e0b",
      sub: "coming soon",
      placeholder: true,
    },
    {
      label: "Progress Score",
      value: courses?.length
        ? `${Math.round((completedLessonIds.size / Math.max(1, (courses.length * 3))) * 100)}%`
        : "0%",
      icon: TrendingUp,
      color: "#67C728",
      sub: "estimated",
    },
  ];

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
            <p className="text-gray-400 text-sm mb-1">{greeting},</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              {user?.name ?? "Welcome back"} 👋
            </h1>
            <p className="text-gray-400 text-sm max-w-xl">
              Your WAVV Success Center — training, webinars, guides, and AI-powered support in one place.
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

        {/* ── Usage stats grid ── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Your Activity
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {usageStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl flex flex-col gap-2"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    opacity: stat.placeholder ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 leading-tight">{stat.label}</p>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${stat.color}20` }}
                    >
                      <Icon size={13} style={{ color: stat.color }} />
                    </div>
                  </div>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: stat.placeholder ? "#4b5563" : "white" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-gray-600">{stat.sub}</p>
                </div>
              );
            })}
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

        {/* ── WAVV AI CTA ── */}
        <div
          className="flex items-center gap-4 p-5 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(0,116,244,0.1), rgba(103,199,40,0.05))",
            border: "1px solid rgba(0, 116, 244, 0.2)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
          >
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">WAVV AI is here to help</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Get instant answers to product questions, troubleshoot issues, and find the right resources — without waiting for support.
            </p>
          </div>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
            onClick={() => {
              document.querySelector<HTMLButtonElement>("[data-wavv-ai-trigger]")?.click();
            }}
          >
            Ask WAVV AI
          </button>
        </div>
      </div>
    </PortalLayout>
  );
}
