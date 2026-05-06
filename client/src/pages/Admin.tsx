import { useState, useMemo, useEffect } from "react";
import React from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PortalLayout from "@/components/PortalLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  Users,
  UserCircle,
  LogIn,
  GraduationCap,
  MessageSquare,
  Search,
  TrendingUp,
  Activity,
  Eye,
  Download,
  Ticket,
  FileDown,
  Shield,
  ShieldOff,
  UserPlus,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Tag,
  FolderOpen,
  Layers,
  FlaskConical,
  Bell,
  Video,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Headphones,
  AlertCircle,
  Clock,
  CheckCircle2,
  Star,
  EyeOff,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";

type AdminTab = "analytics" | "users" | "academy" | "webinars" | "guides" | "playground" | "support" | "content_requests" | "notifications";
type TimeRange = 7 | 30 | 90 | 365;

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function Admin() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  // Read ?tab= from the URL to set the initial active tab
  const initialTab = (): AdminTab => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "users") return "users";
    if (t === "academy" || t === "content") return "academy";
    if (t === "webinars") return "webinars";
    if (t === "guides") return "guides";
    if (t === "playground") return "playground";
    if (t === "support") return "support";
    if (t === "content_requests") return "content_requests";
    if (t === "notifications") return "notifications";
    return "analytics";
  };
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  // Sync tab when the URL changes (e.g., sidebar link clicked while already on /admin)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "users") setActiveTab("users");
    else if (t === "academy" || t === "content") setActiveTab("academy");
    else if (t === "webinars") setActiveTab("webinars");
    else if (t === "guides") setActiveTab("guides");
    else if (t === "playground") setActiveTab("playground");
    else if (t === "support") setActiveTab("support");
    else if (t === "content_requests") setActiveTab("content_requests");
    else if (t === "notifications") setActiveTab("notifications");
    else setActiveTab("analytics");
  }, [location]);
  if (!loading && user && user.role !== "admin" && user.role !== "super_admin") {
    navigate("/dashboard");
    return null;
  }

  if (loading) {
    return (
      <PortalLayout title="Admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[#0074F4] border-t-transparent rounded-full" />
        </div>
      </PortalLayout>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "analytics",        label: "Analytics",         icon: <BarChart3 size={13} /> },
    { id: "users",            label: "Users",             icon: <UserCircle size={13} /> },
    { id: "academy",          label: "Academy",           icon: <GraduationCap size={13} /> },
    { id: "webinars",         label: "Webinars",          icon: <Video size={13} /> },
    { id: "guides",           label: "Guides",            icon: <FileText size={13} /> },
    { id: "playground",       label: "Playground",        icon: <FlaskConical size={13} /> },
    { id: "support",          label: "Support",           icon: <Headphones size={13} /> },
    { id: "content_requests", label: "Requests",          icon: <MessageSquare size={13} /> },
    { id: "notifications",    label: "Notifications",     icon: <Bell size={13} /> },
  ];

  return (
    <PortalLayout title="Admin">
      <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Admin</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Visible to admins only
            </p>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div
          className="flex items-center gap-0.5 p-1 rounded-xl"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-w-0"
              style={
                activeTab === tab.id
                  ? { background: "#0074F4", color: "#fff" }
                  : { color: "#9ca3af" }
              }
            >
              <span className="flex-shrink-0" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "academy" && <ContentTab />}
        {activeTab === "webinars" && <WebinarsTab />}
        {activeTab === "guides" && <GuidesTab />}
        {activeTab === "playground" && <PlaygroundTab />}
        {activeTab === "support" && <SupportTab />}
        {activeTab === "content_requests" && <ContentRequestsTab />}
        {activeTab === "notifications" && <NotificationsTab />}

      </div>
    </PortalLayout>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [days, setDays] = useState<TimeRange>(30);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold text-white">Analytics Dashboard</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportCSV(days)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition"
            style={{
              background: "rgba(6,182,212,0.1)",
              color: "#22d3ee",
              border: "1px solid rgba(6,182,212,0.2)",
            }}
          >
            <FileDown size={14} />
            Export CSV
          </button>
          <div
            className="flex items-center gap-1 p-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            {([7, 30, 90, 365] as TimeRange[]).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className="px-3 py-1.5 text-xs font-medium rounded-md transition"
                style={
                  days === d
                    ? { background: "rgba(6,182,212,0.2)", color: "#22d3ee" }
                    : { color: "#9ca3af" }
                }
              >
                {d === 365 ? "1Y" : `${d}D`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnalyticsContent days={days} />
    </div>
  );
}

// ─── Reusable chart card wrapper with per-chart time range + expand ────────────
function ChartCard({
  title, icon, iconColor, children, chartDays, onDaysChange, expanded, onExpand,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  children: (days: number, height: number) => React.ReactNode;
  chartDays: TimeRange;
  onDaysChange: (d: TimeRange) => void;
  expanded: boolean;
  onExpand: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onExpand(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expanded, onExpand]);

  const rangeSelector = (
    <div className="flex items-center gap-1">
      {([7, 30, 90, 365] as TimeRange[]).map((d) => (
        <button
          key={d}
          onClick={(e) => { e.stopPropagation(); onDaysChange(d); }}
          className="px-2 py-0.5 text-[10px] font-medium rounded transition"
          style={chartDays === d
            ? { background: "rgba(6,182,212,0.2)", color: "#22d3ee" }
            : { color: "#6b7280" }
          }
        >{d === 365 ? "1Y" : `${d}D`}</button>
      ))}
      <button
        onClick={(e) => { e.stopPropagation(); onExpand(); }}
        className="ml-1 p-1 rounded transition hover:bg-white/10"
        title="Expand"
        style={{ color: "#6b7280" }}
      >
        <Maximize2 size={12} />
      </button>
    </div>
  );

  return (
    <>
      {/* Normal card */}
      <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span style={{ color: iconColor }}>{icon}</span> {title}
          </h3>
          {rangeSelector}
        </div>
        {children(chartDays, 208)}
      </div>

      {/* Fullscreen modal */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={onExpand}
        >
          <div
            className="relative w-full max-w-5xl rounded-2xl p-6"
            style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.15)", maxHeight: "90vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span style={{ color: iconColor }}>{icon}</span> {title}
              </h3>
              <div className="flex items-center gap-2">
                {rangeSelector}
                <button onClick={onExpand} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: "#9ca3af" }}>
                  <X size={16} />
                </button>
              </div>
            </div>
            {children(chartDays, 480)}
          </div>
        </div>
      )}
    </>
  );
}

function AnalyticsContent({ days }: { days: TimeRange }) {
  const { data: eventCounts, isLoading: eventsLoading } =
    trpc.analytics.getEventCounts.useQuery({ days });

  // Per-chart independent time ranges
  const [signInDays, setSignInDays] = useState<TimeRange>(30);
  const [distDays, setDistDays] = useState<TimeRange>(30);
  const [topDays, setTopDays] = useState<TimeRange>(30);
  const [searchDays, setSearchDays] = useState<TimeRange>(30);

  // Per-chart expand state
  const [expandedChart, setExpandedChart] = useState<"signin" | "dist" | "top" | "search" | null>(null);

  const { data: signInTrend } = trpc.analytics.getSignInTrend.useQuery({ days: signInDays });
  const { data: topContent } = trpc.analytics.getTopContent.useQuery({ days: topDays, limit: 30 });

  // Top-content section tab
  const [topSection, setTopSection] = useState<"academy" | "webinars" | "guides">("academy");

  const stats = useMemo(() => {
    if (!eventCounts) return null;
    const c: Record<string, number> = {};
    eventCounts.forEach((e) => { c[e.eventType] = e.count; });
    return {
      logins:              c["login"] ?? 0,
      lessonCompleted:     c["lesson_completed"] ?? 0,
      evergreenWatched:    c["webinar_evergreen_watched"] ?? 0,
      exclusiveReg:        c["webinar_registered"] ?? 0,
      ondemandWatched:     (c["webinar_ondemand_watched"] ?? 0) + (c["webinar_watched"] ?? 0), // legacy compat
      guideDownloaded:     c["guide_downloaded"] ?? 0,
      searches:            c["search"] ?? 0,
      aiChats:             c["ai_chat"] ?? 0,
    };
  }, [eventCounts]);

  if (eventsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 animate-pulse h-28"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
        ))}
      </div>
    );
  }

  // Donut chart data — right-side legend
  const CHART_COLORS = ["#06b6d4","#22c55e","#f59e0b","#8b5cf6","#ec4899","#14b8a6","#f97316","#ef4444"];
  const pieData = eventCounts
    ?.filter((e) => e.count > 0)
    .map((e, idx) => ({ name: formatEventType(e.eventType), value: e.count, fill: CHART_COLORS[idx % CHART_COLORS.length] })) ?? [];
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  // Top content filtered by section
  const academyContent = (topContent ?? []).filter((i) => i.resourceType === "lesson" || i.resourceType === "course");
  const webinarContent = (topContent ?? []).filter((i) => i.resourceType === "webinar");
  const guideContent   = (topContent ?? []).filter((i) => i.resourceType === "guide");
  const sectionContent = topSection === "academy" ? academyContent : topSection === "webinars" ? webinarContent : guideContent;

  const SECTION_TABS: { key: "academy" | "webinars" | "guides"; label: string; color: string }[] = [
    { key: "academy",  label: "WAVV Academy",    color: "#22d3ee" },
    { key: "webinars", label: "Webinars",         color: "#f59e0b" },
    { key: "guides",   label: "Guides & Docs",    color: "#4ade80" },
  ];

  return (
    <div className="space-y-6">
      {/* 8 Stat Cards in 2 rows of 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sign-Ins: blue (matches portal sign-in) */}
        <StatCard icon={<LogIn size={18} />}         label="Sign-Ins"                         value={stats?.logins ?? 0}           color="blue"    subtitle={`last ${days}d`} />
        {/* Academy: cyan (matches WAVV Academy landing accent) */}
        <StatCard icon={<GraduationCap size={18} />} label="Academy Lessons Completed"        value={stats?.lessonCompleted ?? 0}  color="cyan"    subtitle={`last ${days}d`} />
        {/* Evergreen Webinars: amber (matches Webinars landing accent) */}
        <StatCard icon={<Eye size={18} />}           label="Evergreen Webinars Watched"       value={stats?.evergreenWatched ?? 0} color="amber"   subtitle={`last ${days}d`} />
        {/* Exclusive Registrations: purple (exclusive badge color) */}
        <StatCard icon={<Star size={18} />}          label="Exclusive Webinar Registrations" value={stats?.exclusiveReg ?? 0}     color="purple"  subtitle={`last ${days}d`} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* On-Demand: amber (same webinar family) */}
        <StatCard icon={<Video size={18} />}         label="On-Demand Webinars Watched"       value={stats?.ondemandWatched ?? 0}  color="amber"   subtitle={`last ${days}d`} />
        {/* Guides & Docs: green (matches Guides landing accent) */}
        <StatCard icon={<Download size={18} />}      label="Guides & Docs Downloads"          value={stats?.guideDownloaded ?? 0}  color="green"   subtitle={`last ${days}d`} />
        {/* Total Searches: teal (matches search/AI page accent) */}
        <StatCard icon={<Search size={18} />}        label="Total Searches"                   value={stats?.searches ?? 0}         color="teal"    subtitle={`last ${days}d`} />
        {/* WAVV AI: purple (matches AI/Playground accent) */}
        <StatCard icon={<MessageSquare size={18} />} label="WAVV AI Conversations"            value={stats?.aiChats ?? 0}          color="purple"  subtitle={`last ${days}d`} />
      </div>

      {/* Charts row: Sign-In Trend + Event Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Sign-In Trend"
          icon={<TrendingUp size={15} />}
          iconColor="#22d3ee"
          chartDays={signInDays}
          onDaysChange={setSignInDays}
          expanded={expandedChart === "signin"}
          onExpand={() => setExpandedChart(expandedChart === "signin" ? null : "signin")}
        >
          {(d, h) => <SignInTrendChart days={d} height={h} />}
        </ChartCard>

        <ChartCard
          title="Event Distribution"
          icon={<Activity size={15} />}
          iconColor="#a78bfa"
          chartDays={distDays}
          onDaysChange={setDistDays}
          expanded={expandedChart === "dist"}
          onExpand={() => setExpandedChart(expandedChart === "dist" ? null : "dist")}
        >
          {(d, h) => <EventDistChart days={d} height={h} />}
        </ChartCard>
      </div>

      {/* Top Content by Section + Search & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Top Content"
          icon={<Search size={15} />}
          iconColor="#fbbf24"
          chartDays={topDays}
          onDaysChange={setTopDays}
          expanded={expandedChart === "top"}
          onExpand={() => setExpandedChart(expandedChart === "top" ? null : "top")}
        >
          {(d, _h) => (
            <TopContentPanel days={d} section={topSection} onSectionChange={setTopSection} sectionTabs={SECTION_TABS} />
          )}
        </ChartCard>

        <ChartCard
          title="Search & AI Usage Trend"
          icon={<Search size={15} />}
          iconColor="#2dd4bf"
          chartDays={searchDays}
          onDaysChange={setSearchDays}
          expanded={expandedChart === "search"}
          onExpand={() => setExpandedChart(expandedChart === "search" ? null : "search")}
        >
          {(d, h) => <SearchAIChart days={d} height={h} />}
        </ChartCard>
      </div>
    </div>
  );
}

// ─── Chart sub-components (height-aware for expand modal) ───────────────────
function SignInTrendChart({ days, height = 208 }: { days: number; height?: number }) {
  const { data: signInTrend } = trpc.analytics.getSignInTrend.useQuery({ days });
  if (!signInTrend || signInTrend.length === 0)
    return <div className="flex items-center justify-center text-gray-500 text-sm" style={{ height }}>No sign-in data for this period</div>;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={signInTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}`; }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
          <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function EventDistChart({ days, height = 208 }: { days: number; height?: number }) {
  const { data: eventCounts } = trpc.analytics.getEventCounts.useQuery({ days });
  const CHART_COLORS = ["#06b6d4","#22c55e","#f59e0b","#8b5cf6","#ec4899","#14b8a6","#f97316","#ef4444"];
  const pieData = (eventCounts ?? [])
    .filter((e) => e.count > 0)
    .map((e, idx) => ({ name: formatEventType(e.eventType), value: e.count, fill: CHART_COLORS[idx % CHART_COLORS.length] }));
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);
  const donutSize = Math.min(height - 20, 200);
  if (pieData.length === 0)
    return <div className="flex items-center justify-center text-gray-500 text-sm" style={{ height }}>No events recorded yet</div>;
  return (
    <div className="flex items-center gap-4" style={{ height }}>
      <div className="shrink-0" style={{ width: donutSize, height: donutSize }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%"
              innerRadius={donutSize * 0.28} outerRadius={donutSize * 0.44}
              dataKey="value" labelLine={false} label={false}>
              {pieData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
              formatter={(value: number, name: string) => [`${value} (${pieTotal > 0 ? ((value/pieTotal)*100).toFixed(1) : 0}%)`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-1" style={{ maxHeight: height }}>
        {pieData.map((entry, idx) => {
          const pct = pieTotal > 0 ? ((entry.value / pieTotal) * 100).toFixed(1) : "0.0";
          return (
            <div key={idx} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.fill }} />
                <span className="text-gray-300 truncate">{entry.name}</span>
              </div>
              <span className="text-gray-400 shrink-0 font-medium">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopContentPanel({
  days, section, onSectionChange, sectionTabs,
}: {
  days: number;
  section: "academy" | "webinars" | "guides";
  onSectionChange: (s: "academy" | "webinars" | "guides") => void;
  sectionTabs: { key: "academy" | "webinars" | "guides"; label: string; color: string }[];
}) {
  const { data: topContent } = trpc.analytics.getTopContent.useQuery({ days, limit: 30 });
  const academyContent = (topContent ?? []).filter((i) => i.resourceType === "lesson" || i.resourceType === "course");
  const webinarContent = (topContent ?? []).filter((i) => i.resourceType === "webinar");
  const guideContent   = (topContent ?? []).filter((i) => i.resourceType === "guide");
  const sectionContent = section === "academy" ? academyContent : section === "webinars" ? webinarContent : guideContent;
  return (
    <div>
      <div className="flex gap-1 mb-3 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
        {sectionTabs.map((t) => (
          <button key={t.key} onClick={() => onSectionChange(t.key)}
            className="flex-1 py-1 text-xs font-medium rounded-md transition"
            style={section === t.key ? { background: "rgba(255,255,255,0.1)", color: t.color } : { color: "#6b7280" }}>
            {t.label}
          </button>
        ))}
      </div>
      {sectionContent.length > 0 ? (
        <div className="space-y-1.5">
          {sectionContent.slice(0, 10).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="flex items-center gap-2 text-sm min-w-0">
                <span className="text-gray-500 w-5 shrink-0 text-right">{idx + 1}.</span>
                <span className="text-gray-300 capitalize truncate">{item.resourceType ?? "unknown"} #{item.resourceId}</span>
                <span className="text-xs text-gray-500 px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)" }}>{formatEventType(item.eventType)}</span>
              </div>
              <span className="text-sm font-semibold text-white shrink-0 ml-2">{item.count}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm text-center py-8">No interactions yet for this section</div>
      )}
    </div>
  );
}

function SearchAIChart({ days, height = 192 }: { days: number; height?: number }) {
  const { data: searchTrend } = trpc.analytics.getDailyEvents.useQuery({ eventType: "search", days });
  const { data: aiTrend } = trpc.analytics.getDailyEvents.useQuery({ eventType: "ai_chat", days });

  const mergedData = useMemo(() => {
    if (!searchTrend && !aiTrend) return [];
    const dateMap: Record<string, { date: string; searches: number; aiChats: number }> = {};
    searchTrend?.forEach((d) => { dateMap[d.date] = { date: d.date, searches: d.count, aiChats: 0 }; });
    aiTrend?.forEach((d) => {
      if (dateMap[d.date]) { dateMap[d.date].aiChats = d.count; }
      else { dateMap[d.date] = { date: d.date, searches: 0, aiChats: d.count }; }
    });
    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [searchTrend, aiTrend]);

  if (mergedData.length === 0) {
    return <div className="flex items-center justify-center h-40 text-gray-500 text-sm">No search or AI data for this period</div>;
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}`; }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
          <Bar dataKey="searches" fill="#14b8a6" name="Searches" radius={[2,2,0,0]} />
          <Bar dataKey="aiChats" fill="#8b5cf6" name="AI Chats" radius={[2,2,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
type RoleFilter = "all" | "super_admin" | "admin" | "user";

// Super Admin icon: plain Shield in fuchsia, matching Admin amber shield style
function SuperAdminIcon({ size = 14 }: { size?: number }) {
  return <Shield style={{ width: size, height: size, color: "#e879f9" }} />;
}

function UsersTab() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: number;
    userName: string;
    currentRole: string;
    action: "promote_admin" | "promote_super" | "demote" | "remove";
  } | null>(null);

  const { data: users, isLoading, refetch } = trpc.admin.listUsers.useQuery(undefined, {
    enabled: currentUser?.role === "admin" || currentUser?.role === "super_admin",
  });

  const updateRole = trpc.admin.updateRole.useMutation({
    onSuccess: () => {
      const action = confirmDialog?.action;
      const label = action === "promote_super" ? "a Super Admin" : action === "promote_admin" ? "an Admin" : "a Standard User";
      toast.success(`${confirmDialog?.userName} is now ${label}.`);
      setConfirmDialog(null);
      refetch();
    },
    onError: (err) => { toast.error(err.message); },
  });

  const removeUser = trpc.admin.removeUser.useMutation({
    onSuccess: () => {
      toast.success(`${confirmDialog?.userName} has been removed.`);
      setConfirmDialog(null);
      refetch();
    },
    onError: (err) => { toast.error(err.message); },
  });

  const isPendingPromotion = (email: string | null | undefined) => {
    if (!email) return false;
    return /^[a-z]+\.[a-z]+@wavv\.com$/.test(email.toLowerCase());
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    let list = users;
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (u) => (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)
    );
  }, [users, search, roleFilter]);

  const superAdminCount = useMemo(() => (users ?? []).filter((u) => u.role === "super_admin").length, [users]);
  const adminCount = useMemo(() => (users ?? []).filter((u) => u.role === "admin").length, [users]);
  const userCount = useMemo(() => (users ?? []).filter((u) => u.role === "user").length, [users]);
  const totalCount = users?.length ?? 0;
  const pendingCount = useMemo(() => isSuperAdmin ? (users ?? []).filter((u) => u.role === "user" && isPendingPromotion(u.email)).length : 0, [users, isSuperAdmin]);

  const statCards: { filter: RoleFilter; label: string; value: number; iconEl: React.ReactNode; color: string; bg: string; activeBorder: string }[] = [
    {
      filter: "all",
      label: "Total Users",
      value: totalCount,
      iconEl: <Users className="h-5 w-5" style={{ color: "#38bdf8" }} />,
      color: "#38bdf8",
      bg: "rgba(56,189,248,0.1)",
      activeBorder: "#38bdf8",
    },
    {
      filter: "super_admin",
      label: "Super Admins",
      value: superAdminCount,
      iconEl: <SuperAdminIcon size={20} />,
      color: "#e879f9",
      bg: "rgba(232,121,249,0.1)",
      activeBorder: "#e879f9",
    },
    {
      filter: "admin",
      label: "Admins",
      value: adminCount,
      iconEl: <Shield className="h-5 w-5" style={{ color: "#fbbf24" }} />,
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.1)",
      activeBorder: "#fbbf24",
    },
    {
      filter: "user",
      label: "Standard Users",
      value: userCount,
      iconEl: <UserPlus className="h-5 w-5" style={{ color: "#4ade80" }} />,
      color: "#4ade80",
      bg: "rgba(74,222,128,0.1)",
      activeBorder: "#4ade80",
    },
  ];

  function handleConfirm() {
    if (!confirmDialog) return;
    if (confirmDialog.action === "remove") {
      removeUser.mutate({ userId: confirmDialog.userId });
    } else {
      const role = confirmDialog.action === "promote_super" ? "super_admin" : confirmDialog.action === "promote_admin" ? "admin" : "user";
      updateRole.mutate({ userId: confirmDialog.userId, role });
    }
  }

  const isPending = updateRole.isPending || removeUser.isPending;

  // Export users filtered by current roleFilter
  function exportUsersCSV() {
    const list = roleFilter === "all" ? (users ?? []) : (users ?? []).filter((u) => u.role === roleFilter);
    const header = ["Name", "Email", "Role", "Registered"].join(",");
    const rows = list.map((u) =>
      [
        `"${(u.name ?? "").replace(/"/g, '""')}"`,
        `"${(u.email ?? "").replace(/"/g, '""')}"`,
        u.role,
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const label = roleFilter === "all" ? "all-users" : roleFilter.replace("_", "-");
    a.href = url;
    a.download = `wavv-users-${label}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-semibold text-white">User Management</h2>
        <div className="flex items-center gap-2">
          {isSuperAdmin && pendingCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.3)" }}>
              <Bell className="h-3 w-3" /> {pendingCount} pending promotion{pendingCount > 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={exportUsersCSV}
            disabled={!users || users.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition disabled:opacity-40"
            style={{ background: "rgba(6,182,212,0.1)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.2)" }}
          >
            <FileDown size={13} />
            Export{roleFilter !== "all" ? ` ${roleFilter === "super_admin" ? "Super Admins" : roleFilter === "admin" ? "Admins" : "Users"}` : " All"}
          </button>
        </div>
      </div>

      {/* Clickable stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s) => {
          const active = roleFilter === s.filter;
          return (
            <button
              key={s.filter}
              onClick={() => setRoleFilter(active ? "all" : s.filter)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: "#1a1a1a",
                border: active ? `1.5px solid ${s.activeBorder}` : "1px solid #2a2a2a",
                boxShadow: active ? `0 0 12px ${s.activeBorder}33` : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                  {s.iconEl}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold" style={{ color: active ? s.color : "#fff" }}>{s.value}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff" }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
        <Table>
          <TableHeader>
            <TableRow style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a" }}>
              <TableHead className="text-gray-400 w-[240px]">Name</TableHead>
              <TableHead className="text-gray-400 w-[260px]">Email</TableHead>
              <TableHead className="text-gray-400 w-[160px]">Role</TableHead>
              <TableHead className="text-gray-400 w-[160px]">Registered</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">Loading users...</TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  {search || roleFilter !== "all" ? "No users match your filter." : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const initials = (u.name ?? "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
                const pending = isSuperAdmin && u.role === "user" && isPendingPromotion(u.email);
                return (
                  <TableRow key={u.id} style={{ borderBottom: "1px solid #1e1e1e", background: isSelf ? "rgba(0,116,244,0.05)" : "transparent" }}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: "linear-gradient(135deg, #0074F4, #67C728)" }}>
                          {initials}
                        </div>
                        <span className="font-medium text-white">
                          {u.name ?? "—"}
                          {isSelf && <span className="ml-2 text-xs text-gray-500">(you)</span>}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">{u.email ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {u.role === "super_admin" ? (
                          <Badge className="text-[10px] flex items-center gap-1" style={{ background: "rgba(232,121,249,0.15)", color: "#e879f9", border: "1px solid rgba(232,121,249,0.4)", boxShadow: "0 0 8px rgba(232,121,249,0.2)" }}>
                            <SuperAdminIcon size={12} />
                            Super Admin
                          </Badge>
                        ) : u.role === "admin" ? (
                          <Badge className="text-[10px] flex items-center gap-1" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                            <Shield className="h-3 w-3" /> Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">User</Badge>
                        )}
                        {pending && (
                          <Badge className="text-[10px]" style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.3)" }}>
                            Pending Promotion
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isSelf ? (
                        <span className="text-xs text-gray-600">—</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {/* Super admin actions */}
                          {isSuperAdmin && u.role === "user" && (
                            <Button variant="ghost" size="sm"
                              className="text-xs h-7 px-2"
                              style={{ color: "#fbbf24" }}
                              onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, action: "promote_admin" })}>
                              <Shield className="h-3 w-3 mr-1" /> Make Admin
                            </Button>
                          )}
                          {isSuperAdmin && u.role === "admin" && (
                            <>
                              <Button variant="ghost" size="sm"
                                className="text-xs h-7 px-2"
                                style={{ color: "#e879f9" }}
                                onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, action: "promote_super" })}>
                                <SuperAdminIcon size={12} />
                                <span className="ml-1">Super Admin</span>
                              </Button>
                              <Button variant="ghost" size="sm"
                                className="text-xs h-7 px-2 text-gray-400 hover:text-white"
                                onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, action: "demote" })}>
                                <ShieldOff className="h-3 w-3 mr-1" /> Demote
                              </Button>
                            </>
                          )}
                          {isSuperAdmin && u.role === "super_admin" && (
                            <Button variant="ghost" size="sm"
                              className="text-xs h-7 px-2 text-gray-400 hover:text-white"
                              onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, action: "demote" })}>
                              <ShieldOff className="h-3 w-3 mr-1" /> Demote
                            </Button>
                          )}
                          {/* Remove button — super_admin can remove anyone; admin can only remove users */}
                          {(isSuperAdmin || (!isSuperAdmin && u.role === "user")) && (
                            <Button variant="ghost" size="sm"
                              className="text-xs h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, action: "remove" })}>
                              <Trash2 className="h-3 w-3 mr-1" /> Remove
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!confirmDialog?.open} onOpenChange={(open) => { if (!open) setConfirmDialog(null); }}>
        <DialogContent style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white">
              {confirmDialog?.action === "promote_super" && "Promote to Super Admin"}
              {confirmDialog?.action === "promote_admin" && "Promote to Admin"}
              {confirmDialog?.action === "demote" && "Demote User"}
              {confirmDialog?.action === "remove" && "Remove User"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {confirmDialog?.action === "promote_super" && (
                <><strong className="text-white">{confirmDialog.userName}</strong> will become a Super Admin with full access to all admin tools and user management.</>
              )}
              {confirmDialog?.action === "promote_admin" && (
                <><strong className="text-white">{confirmDialog.userName}</strong> will gain access to the admin dashboard and content management tools.</>
              )}
              {confirmDialog?.action === "demote" && (
                <><strong className="text-white">{confirmDialog?.userName}</strong> will be demoted to a standard user and lose all admin access.</>
              )}
              {confirmDialog?.action === "remove" && (
                <><strong className="text-white">{confirmDialog?.userName}</strong> will be permanently removed from the platform. This cannot be undone.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog(null)} disabled={isPending}>Cancel</Button>
            <Button
              variant={confirmDialog?.action === "remove" || confirmDialog?.action === "demote" ? "destructive" : "default"}
              style={confirmDialog?.action === "promote_super" ? { background: "#c026d3", color: "#fff" } : undefined}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "Processing..." : (
                <>
                  {confirmDialog?.action === "promote_super" && "Promote to Super Admin"}
                  {confirmDialog?.action === "promote_admin" && "Promote to Admin"}
                  {confirmDialog?.action === "demote" && "Demote to User"}
                  {confirmDialog?.action === "remove" && "Remove User"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, subtitle }: {
  icon: React.ReactNode; label: string; value: number; color: string; subtitle?: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-400/10",
    green: "text-green-400 bg-green-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    purple: "text-purple-400 bg-purple-400/10",
    emerald: "text-emerald-400 bg-emerald-400/10",
    amber: "text-amber-400 bg-amber-400/10",
    teal: "text-teal-400 bg-teal-400/10",
    red: "text-red-400 bg-red-400/10",
  };
  return (
    <div className="rounded-xl p-4 flex items-start gap-3"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className={`p-2 rounded-lg ${colorMap[color] ?? "text-gray-400 bg-gray-400/10"}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{label}</p>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        {subtitle && <p className="text-[10px] text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function formatEventType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function exportCSV(days: number) {
  try {
    const url = `/api/trpc/analytics.exportCSV?input=${encodeURIComponent(JSON.stringify({ json: { days } }))}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error("Export failed");
    const json = await res.json();
    const csvText = json?.result?.data?.json ?? json?.result?.data ?? "";
    const blob = new Blob([csvText], { type: "text/csv" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `wavv-analytics-${days}d-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    alert("Failed to export analytics. Please try again.");
  }
}

function formatTimeAgo(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

// ─── Content Management Tab ───────────────────────────────────────────────────
// ─── Section-level tag editor (inline, same as LessonRow tag editor) ──────────
function SectionTagEditor({
  courseId,
  currentTags,
  onClose,
}: {
  courseId: number;
  currentTags: string | null | undefined;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [activeTags, setActiveTags] = React.useState<string[]>(() => parseTagList(currentTags));
  const [customTagInput, setCustomTagInput] = React.useState("");

  const updateCourse = trpc.academy.adminUpdateCourse.useMutation({
    onSuccess: () => {
      toast.success("Section tags updated");
      utils.academy.adminGetAllCourses.invalidate();
      onClose();
    },
    onError: () => toast.error("Failed to update section tags"),
  });

  const toggleTag = (label: string) => {
    setActiveTags((prev) => prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]);
  };

  const addCustomTag = () => {
    const tag = customTagInput.trim();
    if (!tag || activeTags.includes(tag)) { setCustomTagInput(""); return; }
    setActiveTags((prev) => [...prev, tag]);
    setCustomTagInput("");
  };

  return (
    <div className="mt-2 p-3 rounded-lg space-y-2" style={{ background: "#111", border: "1px solid #333" }}>
      <p className="text-[11px] text-gray-500 mb-1.5">Section tags — click to toggle</p>
      <div className="flex flex-wrap gap-1.5">
        {PRESET_TAGS.map((tag) => {
          const active = activeTags.includes(tag.label);
          return (
            <button
              key={tag.label}
              type="button"
              onClick={() => toggleTag(tag.label)}
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-all"
              style={{
                background: active ? tag.bg : "rgba(255,255,255,0.04)",
                color: active ? tag.color : "#6b7280",
                border: `1px solid ${active ? tag.border : "#333"}`,
                boxShadow: active ? `0 0 8px ${tag.bg}` : "none",
              }}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
      {/* Custom tags */}
      {activeTags.filter((t) => !PRESET_TAGS.find((p) => p.label === t)).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeTags.filter((t) => !PRESET_TAGS.find((p) => p.label === t)).map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.07)", color: "#d1d5db", border: "1px solid #444" }}
            >
              {tag}
              <button type="button" onClick={() => setActiveTags((prev) => prev.filter((t2) => t2 !== tag))} className="ml-0.5 hover:text-red-400">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        <input
          className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-2.5 py-1 text-[11px] text-white outline-none focus:border-blue-500"
          value={customTagInput}
          onChange={(e) => setCustomTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
          placeholder="Add custom tag…"
        />
        <button type="button" onClick={addCustomTag} disabled={!customTagInput.trim()}
          className="text-[11px] px-2.5 py-1 rounded-lg transition hover:opacity-80 disabled:opacity-40"
          style={{ background: "rgba(255,255,255,0.07)", color: "#9ca3af", border: "1px solid #333" }}
        >Add</button>
      </div>
      <div className="flex items-center gap-2 justify-end pt-1">
        <button onClick={onClose}
          className="text-[11px] px-2.5 py-1 rounded-lg transition hover:opacity-80"
          style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid #333" }}
        >Cancel</button>
        <button
          onClick={() => updateCourse.mutate({ id: courseId, data: { tags: activeTags.join(",") || null } })}
          disabled={updateCourse.isPending}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition hover:opacity-80 disabled:opacity-50"
          style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}
        >
          <Check size={12} /> {updateCourse.isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ─── Section row (course) with collapsible lessons ────────────────────────────
function SectionRow2({
  course,
  lessons,
  onDeactivateLesson,
  onActivateLesson,
}: {
  course: { id: number; title: string; category: string; published: boolean; tags?: string | null };
  lessons: Array<{
    id: number; title: string; description?: string | null; courseTitle?: string;
    courseCategory?: string; inactiveReason?: string | null; videoUrl?: string | null;
    fileUrl?: string | null; tags?: string | null; published: boolean;
  }>;
  onDeactivateLesson: (lesson: { id: number; title: string }) => void;
  onActivateLesson: (id: number) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [editingTags, setEditingTags] = React.useState(false);
  const utils = trpc.useUtils();
  const updateCourse = trpc.academy.adminUpdateCourse.useMutation({
    onSuccess: () => {
      utils.academy.adminGetAllCourses.invalidate();
      toast.success("Section updated");
    },
    onError: () => toast.error("Failed to update section"),
  });

  const sectionTags = parseTagList(course.tags);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
      {/* Section header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        style={{ background: "#1a1a1a" }}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Expand chevron */}
        <div className="flex-shrink-0 text-gray-500">
          {open ? <ChevronDown size={14} /> : <ChevronRightIcon size={14} />}
        </div>
        {/* Published dot */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: course.published ? "#22c55e" : "#4b5563" }}
        />
        {/* Title + tags */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white">{course.title}</p>
            {sectionTags.map((tag) => {
              const def = PRESET_TAGS.find((t) => t.label === tag);
              return def ? (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: def.bg, color: def.color, border: `1px solid ${def.border}` }}>
                  {tag}
                </span>
              ) : (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.07)", color: "#d1d5db", border: "1px solid #444" }}>
                  {tag}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(0,116,244,0.15)", color: "#60a5fa", border: "1px solid rgba(0,116,244,0.3)" }}>
              {lessons.length} video{lessons.length !== 1 ? "s" : ""}
            </span>
            {!course.published && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
                Hidden
              </span>
            )}
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Tag section */}
          <button
            type="button"
            onClick={() => setEditingTags((v) => !v)}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg transition hover:opacity-80"
            style={{ background: editingTags ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)", color: editingTags ? "#fbbf24" : "#9ca3af", border: `1px solid ${editingTags ? "rgba(251,191,36,0.3)" : "#2a2a2a"}` }}
            title="Edit section tags"
          >
            <Tag size={11} /> Tags
          </button>
          {/* Hide/Show */}
          <button
            type="button"
            onClick={() => updateCourse.mutate({ id: course.id, data: { published: !course.published } })}
            disabled={updateCourse.isPending}
            className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition hover:opacity-80 disabled:opacity-50"
            style={course.published
              ? { background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }
              : { background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }
            }
          >
            {course.published ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Section tag editor (inline, below header) */}
      {editingTags && (
        <div className="px-4 pb-3" style={{ background: "#1a1a1a" }}>
          <SectionTagEditor
            courseId={course.id}
            currentTags={course.tags}
            onClose={() => setEditingTags(false)}
          />
        </div>
      )}

      {/* Lesson rows */}
      {open && (
        <div className="divide-y" style={{ borderTop: "1px solid #222", borderColor: "#222" }}>
          {lessons.length === 0 ? (
            <p className="text-xs text-gray-600 px-4 py-3">No videos in this section.</p>
          ) : (
            lessons.map((lesson) => (
              <div key={lesson.id} className="px-3 py-2" style={{ background: "#141414" }}>
                <LessonRow
                  lesson={lesson}
                  isActive={lesson.published}
                  onDeactivate={() => onDeactivateLesson({ id: lesson.id, title: lesson.title })}
                  onActivate={() => onActivateLesson(lesson.id)}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Category block (groups sections) ────────────────────────────────────────
function CategoryBlock({
  categoryKey,
  categoryLabel,
  categoryBanner,
  categorySubtitle,
  videoCount,
  courses,
  allLessons,
  onDeactivateLesson,
  onActivateLesson,
  accentColor,
}: {
  categoryKey: string;
  categoryLabel?: string;
  categoryBanner?: string;
  categorySubtitle?: string;
  videoCount?: number;
  courses: Array<{ id: number; title: string; category: string; published: boolean; tags?: string | null }>;
  allLessons: Array<any>;
  onDeactivateLesson: (lesson: { id: number; title: string }) => void;
  onActivateLesson: (id: number) => void;
  accentColor: string;
}) {
  const [open, setOpen] = React.useState(true);
  const displayLabel = categoryLabel ?? categoryKey;

  return (
    <div>
      {/* Category banner header — mirrors Academy landing page */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full relative overflow-hidden rounded-xl mb-3 group"
        style={{ border: `1px solid ${accentColor}40`, minHeight: "110px" }}
      >
        {/* Banner image */}
        {categoryBanner && (
          <img src={categoryBanner} alt={displayLabel} className="absolute inset-0 w-full h-full object-cover" aria-hidden />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.50) 100%)` }} />
        {/* Colour glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 85% 50%, ${accentColor}22 0%, transparent 60%)` }} />
        {/* Content — mirrors Academy landing page: WAVV ACADEMY label, title, subtitle, section+video badges */}
        <div className="relative flex flex-col justify-center h-full px-6 py-4 gap-0.5 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: accentColor }}>WAVV Academy</p>
          <div className="flex items-center gap-2">
            {open ? <ChevronDown size={13} style={{ color: accentColor }} /> : <ChevronRightIcon size={13} style={{ color: accentColor }} />}
            <h2 className="text-xl font-extrabold text-white leading-tight">{displayLabel}</h2>
          </div>
          {categorySubtitle && <p className="text-xs text-gray-300 mb-1">{categorySubtitle}</p>}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: `${accentColor}25`, color: accentColor, border: `1px solid ${accentColor}50` }}>
              {courses.length} section{courses.length !== 1 ? "s" : ""}
            </span>
            {videoCount !== undefined && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)", color: "#aaa", border: "1px solid #333" }}>
                {videoCount} video{videoCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </button>
      {open && (
        <div className="space-y-2 ml-8">
          {courses.map((course) => {
            const courseLessons = allLessons.filter((l) => l.courseId === course.id);
            return (
              <SectionRow2
                key={course.id}
                course={course}
                lessons={courseLessons}
                onDeactivateLesson={onDeactivateLesson}
                onActivateLesson={onActivateLesson}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContentTab() {
  const utils = trpc.useUtils();
  const { data: lessons = [], isLoading: lessonsLoading } = trpc.academy.adminGetAllLessons.useQuery();
  const { data: courses = [], isLoading: coursesLoading } = trpc.academy.adminGetAllCourses.useQuery();
  const updateLesson = trpc.academy.adminUpdateLesson.useMutation({
    onSuccess: () => {
      utils.academy.adminGetAllLessons.invalidate();
      toast.success("Content status updated");
    },
    onError: () => toast.error("Failed to update content status"),
  });

  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [pendingLesson, setPendingLesson] = useState<{ id: number; title: string } | null>(null);
  const [reasonInput, setReasonInput] = useState("");

  function handleDeactivate(lesson: { id: number; title: string }) {
    setPendingLesson(lesson);
    setReasonInput("");
    setReasonDialogOpen(true);
  }

  function confirmDeactivate() {
    if (!pendingLesson) return;
    updateLesson.mutate({
      id: pendingLesson.id,
      data: { published: false, inactiveReason: reasonInput.trim() || null },
    });
    setReasonDialogOpen(false);
    setPendingLesson(null);
  }

  function handleActivate(id: number) {
    updateLesson.mutate({ id, data: { published: true, inactiveReason: null } });
  }

  // Group courses by category
  const byCategory = useMemo(() => {
    const map: Record<string, typeof courses> = {};
    for (const c of courses) {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    }
    return map;
  }, [courses]);

  // Mirror the exact Academy category order, display names, colors, banners, subtitles, and video counts
  const ACADEMY_CATEGORIES = [
    {
      key: "Onboarding",
      label: "Onboarding",
      subtitle: "Get your team up and running with WAVV",
      color: "#0074F4",
      banner: "/manus-storage/banner-onboarding-v2_ddea462f.png",
      videoCount: 12,
    },
    {
      key: "How-To",
      label: "How-To",
      subtitle: "Step-by-step guides for core WAVV features",
      color: "#00A9E2",
      banner: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/banner-howto-v6-K3TYV9Xeg5ZaWLpmZiJwHh.webp",
      videoCount: 9,
    },
    {
      key: "Strategy and Best Practices",
      label: "Strategy & Best Practices",
      subtitle: "Maximize connection rates, conversions, and team performance",
      color: "#67C728",
      banner: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/banner-strategy-v7-h4rfU3p4xkyGFotsGxeuPW.webp",
      videoCount: 8,
    },
  ];

  // Inactive: courses with published=false OR lessons with published=false
  // MUST be declared before any early return to satisfy Rules of Hooks
  const inactiveCourses = useMemo(() => courses.filter((c) => !c.published), [courses]);
  const inactiveLessons = useMemo(() => lessons.filter((l) => !l.published), [lessons]);
  const hasInactive = inactiveCourses.length > 0 || inactiveLessons.length > 0;

  if (lessonsLoading || coursesLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin w-6 h-6 border-2 border-[#0074F4] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Section 1: Live Sections & Courses ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
          <h2 className="text-sm font-semibold text-white">Live Sections &amp; Courses</h2>
          <span className="text-xs text-gray-500">Everything currently visible on WAVV Academy</span>
        </div>
        <div className="space-y-6">
          {ACADEMY_CATEGORIES.map(({ key, label, subtitle, color, banner, videoCount }) => {
            // All published courses for this category = the live sections
            const categoryCourses = (byCategory[key] ?? []).filter((c) => c.published);
            return (
              <CategoryBlock
                key={key}
                categoryKey={key}
                categoryLabel={label}
                categoryBanner={banner}
                categorySubtitle={subtitle}
                videoCount={videoCount}
                courses={categoryCourses}
                allLessons={lessons}
                onDeactivateLesson={handleDeactivate}
                onActivateLesson={handleActivate}
                accentColor={color}
              />
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Inactive Sections / Videos ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ background: "#4b5563" }} />
          <h2 className="text-sm font-semibold text-white">Inactive Sections / Videos</h2>
          <span className="text-xs text-gray-500">Hidden from users — sections or videos that have been deactivated</span>
        </div>
        {!hasInactive ? (
          <div
            className="rounded-xl px-5 py-6 text-center"
            style={{ background: "#141414", border: "1px solid #2a2a2a" }}
          >
            <p className="text-sm text-gray-500">No inactive sections or videos.</p>
            <p className="text-xs text-gray-600 mt-1">Use the Hide/Deactivate controls on any section or video above to move it here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Inactive sections (courses with published=false) */}
            {inactiveCourses.length > 0 && (
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #2a2a2a" }}
              >
                <div className="px-4 py-2" style={{ background: "#1a1a1a", borderBottom: "1px solid #222" }}>
                  <p className="text-[11px] font-semibold text-gray-400">Hidden Sections ({inactiveCourses.length})</p>
                </div>
                <div className="divide-y" style={{ borderColor: "#222" }}>
                  {inactiveCourses.map((course) => {
                    const courseLessons = lessons.filter((l) => l.courseId === course.id);
                    return (
                      <div key={course.id} className="px-4 py-3" style={{ background: "#141414" }}>
                        <SectionRow2
                          course={course}
                          lessons={courseLessons}
                          onDeactivateLesson={handleDeactivate}
                          onActivateLesson={handleActivate}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Inactive videos (lessons with published=false) */}
            {inactiveLessons.length > 0 && (
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #2a2a2a" }}
              >
                <div className="px-4 py-2" style={{ background: "#1a1a1a", borderBottom: "1px solid #222" }}>
                  <p className="text-[11px] font-semibold text-gray-400">Deactivated Videos ({inactiveLessons.length})</p>
                </div>
                <div className="divide-y" style={{ borderColor: "#222" }}>
                  {inactiveLessons.map((lesson) => (
                    <div key={lesson.id} className="px-4 py-3" style={{ background: "#141414" }}>
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                          style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
                          Inactive
                        </span>
                        <span className="text-[10px] text-gray-500">{lesson.courseTitle ?? ""}</span>
                      </div>
                      <LessonRow
                        lesson={lesson}
                        isActive={false}
                        onActivate={() => handleActivate(lesson.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Tags Management panel ── */}
      <TagsManagementPanel />

      {/* ── Deactivate reason dialog ── */}
      <Dialog open={reasonDialogOpen} onOpenChange={setReasonDialogOpen}>
        <DialogContent style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Deactivate Content</DialogTitle>
            <DialogDescription className="text-gray-400">
              <span className="font-medium text-gray-300">{pendingLesson?.title}</span> will be hidden from users.
              Optionally add a reason so your team knows why it was pulled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Reason (e.g. Outdated, Feature removed, Needs update)"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="bg-black/30 border-white/10 text-white placeholder:text-gray-600"
              onKeyDown={(e) => e.key === "Enter" && confirmDeactivate()}
            />
            <p className="text-xs text-gray-600">Leave blank to deactivate without a reason.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReasonDialogOpen(false)} className="text-gray-400">
              Cancel
            </Button>
            <Button
              onClick={confirmDeactivate}
              style={{ background: "#ef4444" }}
              className="text-white hover:opacity-90"
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tags Management Panel ─────────────────────────────────────────────────
function TagsManagementPanel() {
  const utils = trpc.useUtils();
  const { data: usedTags = [], isLoading } = trpc.academy.adminGetAllUsedTags.useQuery();
  const removeTag = trpc.academy.adminRemoveTagFromAll.useMutation({
    onSuccess: (res) => {
      toast.success(`Tag removed from ${res.updated} lesson(s)`);
      utils.academy.adminGetAllUsedTags.invalidate();
      utils.academy.adminGetAllLessons.invalidate();
    },
    onError: () => toast.error("Failed to remove tag"),
  });
  const [confirmTag, setConfirmTag] = React.useState<string | null>(null);

  if (isLoading || usedTags.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: "#fbbf24" }} />
        <h2 className="text-sm font-semibold text-white">Tag Management</h2>
        <span className="text-xs text-gray-500">Remove a tag from all lessons at once</span>
      </div>
      <div
        className="rounded-xl p-4"
        style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
      >
        <div className="flex flex-wrap gap-2">
          {usedTags.map((tag) => (
            <div key={tag} className="flex items-center gap-1">
              <span
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.07)", color: "#d1d5db", border: "1px solid #444" }}
              >
                {tag}
              </span>
              <button
                type="button"
                onClick={() => setConfirmTag(tag)}
                className="w-5 h-5 rounded-full flex items-center justify-center transition hover:opacity-80"
                style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}
                title={`Remove "${tag}" from all lessons`}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-3">Clicking × removes the tag from every lesson. This cannot be undone.</p>
      </div>
      {/* Confirm dialog */}
      <Dialog open={!!confirmTag} onOpenChange={() => setConfirmTag(null)}>
        <DialogContent style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Remove Tag</DialogTitle>
            <DialogDescription className="text-gray-400">
              Remove <span className="font-semibold text-gray-200">"{confirmTag}"</span> from all lessons?
              This will delete the tag everywhere it is applied.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmTag(null)} className="text-gray-400">Cancel</Button>
            <Button
              onClick={() => { if (confirmTag) { removeTag.mutate({ tag: confirmTag }); setConfirmTag(null); } }}
              disabled={removeTag.isPending}
              style={{ background: "#ef4444" }}
              className="text-white hover:opacity-90"
            >
              Remove Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Preset tag definitions ──────────────────────────────────────────────────
const PRESET_TAGS: { label: string; color: string; bg: string; border: string }[] = [
  { label: "Most Popular",    color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.35)" },
  { label: "Must Watch",      color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)" },
  { label: "New",             color: "#4ade80", bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.35)" },
  { label: "Featured",        color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.35)" },
  { label: "Spam Protection", color: "#fb923c", bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.35)" },
  { label: "Connection Rates",color: "#c084fc", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.35)" },
];

function parseTagList(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

// ─── Lesson row sub-component ─────────────────────────────────────────────────
function LessonRow({
  lesson,
  isActive,
  onDeactivate,
  onActivate,
}: {
  lesson: {
    id: number;
    title: string;
    description?: string | null;
    courseTitle?: string;
    courseCategory?: string;
    inactiveReason?: string | null;
    videoUrl?: string | null;
    fileUrl?: string | null;
    tags?: string | null;
    starred?: boolean | null;
    hidden?: boolean | null;
  };
  isActive: boolean;
  onDeactivate?: () => void;
  onActivate?: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(lesson.title);
  const [editDesc, setEditDesc] = React.useState(lesson.description ?? "");
  const [editVideoUrl, setEditVideoUrl] = React.useState(lesson.videoUrl ?? "");
  const [editFileUrl, setEditFileUrl] = React.useState(lesson.fileUrl ?? "");
  const [activeTags, setActiveTags] = React.useState<string[]>(() => parseTagList(lesson.tags));
  const [customTagInput, setCustomTagInput] = React.useState("");
  const [isStarred, setIsStarred] = React.useState(!!lesson.starred);
  const [isHidden, setIsHidden] = React.useState(!!lesson.hidden);
  const utils = trpc.useUtils();

  const updateLesson = trpc.academy.adminUpdateLesson.useMutation({
    onSuccess: () => {
      toast.success("Lesson updated");
      utils.academy.adminGetAllLessons.invalidate();
      setEditing(false);
    },
    onError: () => toast.error("Failed to update lesson"),
  });

  const toggleStar = trpc.academy.adminUpdateLesson.useMutation({
    onMutate: () => setIsStarred((v) => !v),
    onError: () => { setIsStarred((v) => !v); toast.error("Failed to update star"); },
    onSuccess: () => utils.academy.adminGetAllLessons.invalidate(),
  });

  const toggleHide = trpc.academy.adminUpdateLesson.useMutation({
    onMutate: () => setIsHidden((v) => !v),
    onError: () => { setIsHidden((v) => !v); toast.error("Failed to update visibility"); },
    onSuccess: () => utils.academy.adminGetAllLessons.invalidate(),
  });

  const handleSave = () => {
    updateLesson.mutate({
      id: lesson.id,
      data: {
        title: editTitle.trim() || lesson.title,
        description: editDesc.trim() || undefined,
        videoUrl: editVideoUrl.trim() || undefined,
        fileUrl: editFileUrl.trim() || null,
        tags: activeTags.join(",") || null,
      },
    });
  };

  const handleCancel = () => {
    setEditTitle(lesson.title);
    setEditDesc(lesson.description ?? "");
    setEditVideoUrl(lesson.videoUrl ?? "");
    setEditFileUrl(lesson.fileUrl ?? "");
    setActiveTags(parseTagList(lesson.tags));
    setCustomTagInput("");
    setEditing(false);
  };

  const addCustomTag = () => {
    const tag = customTagInput.trim();
    if (!tag || activeTags.includes(tag)) { setCustomTagInput(""); return; }
    setActiveTags((prev) => [...prev, tag]);
    setCustomTagInput("");
  };

  const toggleTag = (label: string) => {
    setActiveTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  };

  return (
    <div
      className="px-4 py-3 rounded-xl"
      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
    >
      {editing ? (
        /* ── Edit mode ── */
        <div className="flex flex-col gap-2">
          <input
            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Video title"
          />
          <textarea
            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-gray-300 outline-none focus:border-blue-500 resize-none"
            rows={2}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Description (optional)"
          />
          {/* Video URL field */}
          <input
            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-gray-300 outline-none focus:border-blue-500 font-mono"
            value={editVideoUrl}
            onChange={(e) => setEditVideoUrl(e.target.value)}
            placeholder="Video URL (Loom, YouTube, etc.)"
          />
          {/* Downloadable file URL field */}
          <input
            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-gray-300 outline-none focus:border-blue-500 font-mono"
            value={editFileUrl}
            onChange={(e) => setEditFileUrl(e.target.value)}
            placeholder="Downloadable file URL (PDF, etc.) — leave blank to remove"
          />
          {/* Tag editor */}
          <div>
            <p className="text-[11px] text-gray-500 mb-1.5">Tags — click to toggle presets, or type a custom tag</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_TAGS.map((tag) => {
                const active = activeTags.includes(tag.label);
                return (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-all"
                    style={{
                      background: active ? tag.bg : "rgba(255,255,255,0.04)",
                      color: active ? tag.color : "#6b7280",
                      border: `1px solid ${active ? tag.border : "#333"}`,
                      boxShadow: active ? `0 0 8px ${tag.bg}` : "none",
                    }}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
            {/* Active custom tags */}
            {activeTags.filter((t) => !PRESET_TAGS.find((p) => p.label === t)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {activeTags.filter((t) => !PRESET_TAGS.find((p) => p.label === t)).map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.07)", color: "#d1d5db", border: "1px solid #444" }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setActiveTags((prev) => prev.filter((t2) => t2 !== tag))}
                      className="ml-0.5 hover:text-red-400 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Custom tag input */}
            <div className="flex gap-1.5">
              <input
                className="flex-1 bg-[#111] border border-[#333] rounded-lg px-2.5 py-1 text-[11px] text-white outline-none focus:border-blue-500"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                placeholder="Add custom tag…"
              />
              <button
                type="button"
                onClick={addCustomTag}
                disabled={!customTagInput.trim()}
                className="text-[11px] px-2.5 py-1 rounded-lg transition hover:opacity-80 disabled:opacity-40"
                style={{ background: "rgba(255,255,255,0.07)", color: "#9ca3af", border: "1px solid #333" }}
              >
                Add
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid #333" }}
            >
              <X size={12} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateLesson.isPending}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition hover:opacity-80 disabled:opacity-50"
              style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              <Check size={12} /> {updateLesson.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        /* ── View mode ── */
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: isActive ? "#22c55e" : "#4b5563" }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{lesson.title}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {lesson.courseTitle && (
                <span className="text-[11px] text-gray-500">{lesson.courseTitle}</span>
              )}
              {lesson.courseCategory && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid #333" }}
                >
                  {lesson.courseCategory}
                </span>
              )}
              {!isActive && lesson.inactiveReason && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  {lesson.inactiveReason}
                </span>
              )}
              {/* Applied tags (view mode) */}
              {activeTags.map((tag) => {
                const def = PRESET_TAGS.find((t) => t.label === tag);
                if (!def) return null;
                return (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: def.bg, color: def.color, border: `1px solid ${def.border}` }}
                  >
                    {tag}
                  </span>
                );
              })}
              {/* Starred indicator */}
              {isStarred && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
                >
                  <Star size={9} fill="#fbbf24" /> Starred
                </span>
              )}
              {/* Hidden indicator */}
              {isHidden && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <EyeOff size={9} /> Hidden
                </span>
              )}
              {/* File URL indicator */}
              {lesson.fileUrl && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}
                  title={lesson.fileUrl}
                >
                  <Download size={9} /> PDF
                </span>
              )}
            </div>
          </div>
          {/* Edit icon */}
          <button
            onClick={() => setEditing(true)}
            className="flex-shrink-0 p-1.5 rounded-lg transition hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid #2a2a2a" }}
            title="Edit title / description"
          >
            <Pencil size={13} />
          </button>
          {/* Star toggle */}
          <button
            onClick={() => toggleStar.mutate({ id: lesson.id, data: { starred: !isStarred } })}
            disabled={toggleStar.isPending}
            className="flex-shrink-0 p-1.5 rounded-lg transition hover:opacity-80 disabled:opacity-50"
            style={isStarred
              ? { background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.35)" }
              : { background: "rgba(255,255,255,0.05)", color: "#4b5563", border: "1px solid #2a2a2a" }
            }
            title={isStarred ? "Unstar lesson" : "Star lesson (featured)"}
          >
            <Star size={13} fill={isStarred ? "#fbbf24" : "none"} />
          </button>
          {/* Hide toggle */}
          <button
            onClick={() => toggleHide.mutate({ id: lesson.id, data: { hidden: !isHidden } })}
            disabled={toggleHide.isPending}
            className="flex-shrink-0 p-1.5 rounded-lg transition hover:opacity-80 disabled:opacity-50"
            style={isHidden
              ? { background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }
              : { background: "rgba(255,255,255,0.05)", color: "#4b5563", border: "1px solid #2a2a2a" }
            }
            title={isHidden ? "Show lesson (currently hidden)" : "Hide lesson from users"}
          >
            <EyeOff size={13} />
          </button>
          {/* Activate / Deactivate */}
          {isActive ? (
            <button
              onClick={onDeactivate}
              className="flex-shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-lg transition hover:opacity-80"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              Deactivate
            </button>
          ) : (
            <button
              onClick={onActivate}
              className="flex-shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-lg transition hover:opacity-80"
              style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              Activate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Playground Tab ───────────────────────────────────────────────────────────
function PlaygroundTab() {
  const { data: stats, isLoading: statsLoading } = trpc.playground.getStats.useQuery();
  const { data: requests, isLoading: reqLoading } = trpc.playground.getRequests.useQuery();

  function exportCSVRequests() {
    if (!requests || requests.length === 0) { toast.error("No requests to export"); return; }
    const header = ["Name", "Email", "Playground", "Notes", "Date"];
    const rows = requests.map(r => [
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.playground}"`,
      `"${(r.message ?? "").replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toLocaleDateString()}"`,
    ]);
    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "playground-requests.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const PLAYGROUND_COLORS: Record<string, string> = {
    "WAVV Dialer Playground": "#0074F4",
    "WAVV Call Boards Playground": "#00A9E2",
    "WAVV Settings Playground": "#67C728",
    "Other / General Feedback": "#a855f7",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Playground & Support</h2>
        <button
          onClick={exportCSVRequests}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition"
          style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.2)" }}
        >
          <FileDown size={13} /> Export Requests CSV
        </button>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total requests */}
        <div
          className="rounded-xl p-4"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell size={14} style={{ color: "#a855f7" }} />
            <span className="text-xs text-gray-400 font-medium">Total Requests</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {statsLoading ? "—" : (stats?.total ?? 0)}
          </p>
        </div>

        {/* Per-playground breakdown */}
        {statsLoading
          ? null
          : (stats?.byPlayground ?? []).slice(0, 3).map((item) => (
              <div
                key={item.playground}
                className="rounded-xl p-4"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical
                    size={14}
                    style={{ color: PLAYGROUND_COLORS[item.playground] ?? "#9ca3af" }}
                  />
                  <span className="text-xs text-gray-400 font-medium truncate" title={item.playground}>
                    {item.playground.replace(" Playground", "").replace("WAVV ", "")}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{item.count}</p>
                <p className="text-xs text-gray-600 mt-0.5">requests</p>
              </div>
            ))}
      </div>

      {/* ── Bar chart ── */}
      {!statsLoading && (stats?.byPlayground ?? []).length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
        >
          <h3 className="text-sm font-semibold text-white mb-4">Requests by Playground</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats!.byPlayground} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="playground"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                tickFormatter={(v: string) =>
                  v.replace(" Playground", "").replace("WAVV ", "").replace("Other / General Feedback", "Other")
                }
              />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px" }}
                labelStyle={{ color: "#fff", fontSize: 12 }}
                itemStyle={{ color: "#a855f7" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(stats?.byPlayground ?? []).map((entry) => (
                  <Cell
                    key={entry.playground}
                    fill={PLAYGROUND_COLORS[entry.playground] ?? "#a855f7"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Requests table ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
      >
        <div className="px-5 py-3 border-b border-[#2a2a2a] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">All Requests</h3>
          <span className="text-xs text-gray-500">{requests?.length ?? 0} total</span>
        </div>
        {reqLoading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin w-6 h-6 border-2 border-[#a855f7] border-t-transparent rounded-full" />
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FlaskConical size={28} className="text-gray-600 mb-2" />
            <p className="text-gray-500 text-sm">No requests yet</p>
            <p className="text-gray-600 text-xs mt-1">Submissions will appear here once users click "Notify Me"</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#2a2a2a" }}>
                <TableHead className="text-gray-400 text-xs">Name</TableHead>
                <TableHead className="text-gray-400 text-xs">Email</TableHead>
                <TableHead className="text-gray-400 text-xs">Playground</TableHead>
                <TableHead className="text-gray-400 text-xs">Notes</TableHead>
                <TableHead className="text-gray-400 text-xs">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id} style={{ borderColor: "#2a2a2a" }}>
                  <TableCell className="text-white text-sm font-medium">{req.name}</TableCell>
                  <TableCell className="text-gray-400 text-xs">{req.email}</TableCell>
                  <TableCell>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: `${PLAYGROUND_COLORS[req.playground] ?? "#a855f7"}20`,
                        color: PLAYGROUND_COLORS[req.playground] ?? "#a855f7",
                      }}
                    >
                      {req.playground.replace(" Playground", "").replace("WAVV ", "")}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs max-w-xs truncate">
                    {req.message ?? <span className="text-gray-700">—</span>}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

    </div>
  );
}

// ─── Webinars Tab ─────────────────────────────────────────────────────────────
function WebinarsTab() {
  const utils = trpc.useUtils();
  const { data: webinars = [], isLoading } = trpc.webinars.adminList.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    host: "",
    type: "upcoming" as "upcoming" | "recording" | "exclusive" | "evergreen",
    registrationUrl: "",
    videoUrl: "",
  });

  const createMutation = trpc.webinars.adminCreate.useMutation({
    onSuccess: () => { utils.webinars.adminList.invalidate(); setShowForm(false); resetForm(); toast.success("Webinar created"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.webinars.adminUpdate.useMutation({
    onSuccess: () => { utils.webinars.adminList.invalidate(); setShowForm(false); setEditId(null); resetForm(); toast.success("Webinar updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.webinars.adminDelete.useMutation({
    onSuccess: () => { utils.webinars.adminList.invalidate(); toast.success("Webinar deleted"); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() { setForm({ title: "", description: "", host: "", type: "upcoming" as "upcoming" | "recording" | "exclusive" | "evergreen", registrationUrl: "", videoUrl: "" }); }

  function startEdit(w: typeof webinars[0]) {
    setEditId(w.id);
    setForm({ title: w.title, description: w.description ?? "", host: w.host ?? "", type: w.type as "upcoming" | "recording" | "exclusive" | "evergreen", registrationUrl: w.registrationUrl ?? "", videoUrl: w.videoUrl ?? "" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (editId !== null) {
      updateMutation.mutate({ id: editId, data: { ...form, description: form.description || undefined, host: form.host || undefined, registrationUrl: form.registrationUrl || undefined, videoUrl: form.videoUrl || undefined } });
    } else {
      createMutation.mutate({ ...form, description: form.description || undefined, host: form.host || undefined, registrationUrl: form.registrationUrl || undefined, videoUrl: form.videoUrl || undefined });
    }
  }

  const inputStyle: React.CSSProperties = { background: "#111", border: "1px solid #2a2a2a", color: "#fff", borderRadius: "8px", padding: "8px 10px", fontSize: "13px", width: "100%", outline: "none" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">WAVV Webinars</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const rows = await utils.webinars.adminExportRegistrants.fetch();
              if (!rows?.length) { toast.error("No registrants to export"); return; }
              const headers = ["Name","Email","Webinar","Registered At"];
              const csv = [headers.join(","), ...rows.map(r => [r.userName ?? "", r.userEmail ?? "", r.webinarTitle ?? "", r.registeredAt ? new Date(r.registeredAt).toLocaleString() : ""].map(v => `"${v}"`).join(","))].join("\n");
              const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "webinar-registrants.csv"; a.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#67C728" }}
          >
            <FileDown size={13} /> Export Registrants
          </button>
          <button
            onClick={() => { setEditId(null); resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
            style={{ background: "#0074F4" }}
          >
            <Plus size={13} /> Add Webinar
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <h3 className="text-sm font-semibold text-white">{editId !== null ? "Edit Webinar" : "New Webinar"}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Webinar title" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Host</label>
                <input style={inputStyle} value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} placeholder="Host name" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea rows={2} style={{ ...inputStyle, resize: "vertical" as const }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <select style={{ ...inputStyle, appearance: "none" as const }} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "upcoming" | "recording" | "exclusive" | "evergreen" }))}>
                  <option value="exclusive">Upcoming Exclusive</option>
                  <option value="evergreen">Evergreen</option>
                  <option value="recording">On-Demand Recording</option>
                  <option value="upcoming">Upcoming (Legacy)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{form.type === "recording" ? "Video URL" : "Registration URL"}</label>
                <input style={inputStyle} value={form.type === "recording" ? form.videoUrl : form.registrationUrl} onChange={e => setForm(f => form.type === "recording" ? { ...f, videoUrl: e.target.value } : { ...f, registrationUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); resetForm(); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition" style={{ background: "#2a2a2a" }}>Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#0074F4" }}>
                {editId !== null ? "Save Changes" : "Create Webinar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grouped sections */}
      {isLoading ? (
        <div className="flex items-center justify-center h-24"><div className="animate-spin w-6 h-6 border-2 border-[#0074F4] border-t-transparent rounded-full" /></div>
      ) : (
        <WebinarGroups
          webinars={webinars}
          onEdit={startEdit}
          onDelete={(id) => { if (confirm("Delete this webinar?")) deleteMutation.mutate({ id }); }}
        />
      )}
    </div>
  );
}

const WEBINAR_GROUP_META: Record<string, { label: string; color: string; description: string }> = {
  evergreen:  { label: "Evergreen",           color: "#67C728", description: "Always-available training content" },
  exclusive:  { label: "Exclusive / Upcoming", color: "#0074F4", description: "Live or invite-only sessions" },
  recording:  { label: "On Demand",            color: "#FF9900", description: "Recorded sessions available anytime" },
  upcoming:   { label: "Upcoming (Legacy)",    color: "#6b7280", description: "Legacy upcoming entries" },
};

function WebinarGroups({
  webinars,
  onEdit,
  onDelete,
}: {
  webinars: import("../../../drizzle/schema").Webinar[];
  onEdit: (w: import("../../../drizzle/schema").Webinar) => void;
  onDelete: (id: number) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const groupOrder = ["evergreen", "exclusive", "recording", "upcoming"];
  const grouped = groupOrder.reduce((acc, type) => {
    acc[type] = webinars.filter(w => w.type === type);
    return acc;
  }, {} as Record<string, typeof webinars>);

  return (
    <div className="space-y-4">
      {groupOrder.map((type) => {
        const group = grouped[type];
        if (group.length === 0 && type === "upcoming") return null; // hide empty legacy
        const meta = WEBINAR_GROUP_META[type];
        const isCollapsed = collapsed[type];
        return (
          <div key={type} className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
            <button
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition"
              style={{ background: "#1a1a1a" }}
              onClick={() => setCollapsed(c => ({ ...c, [type]: !c[type] }))}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                <span className="text-sm font-semibold text-white">{meta.label}</span>
                <span className="text-xs text-gray-500">{meta.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${meta.color}20`, color: meta.color }}>{group.length}</span>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
              </div>
            </button>
            {!isCollapsed && (
              group.length === 0 ? (
                <div className="px-5 py-8 text-center" style={{ background: "#111" }}>
                  <p className="text-gray-600 text-xs">No {meta.label.toLowerCase()} webinars yet. Click "Add Webinar" above and set the type.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: "#111", borderColor: "#2a2a2a" }}>
                      <TableHead className="text-gray-400 text-xs">Title</TableHead>
                      <TableHead className="text-gray-400 text-xs">Host</TableHead>
                      <TableHead className="text-gray-400 text-xs">Views</TableHead>
                      <TableHead className="text-gray-400 text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.map((w) => (
                      <TableRow key={w.id} style={{ borderColor: "#2a2a2a" }}>
                        <TableCell className="text-white text-sm font-medium max-w-xs truncate">{w.title}</TableCell>
                        <TableCell className="text-gray-400 text-xs">{w.host ?? "—"}</TableCell>
                        <TableCell className="text-gray-400 text-xs">{w.viewCount ?? 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {(w.registrationUrl || w.videoUrl) && (
                              <a href={(w.registrationUrl || w.videoUrl)!} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0074F4] transition"><ExternalLink size={13} /></a>
                            )}
                            <button onClick={() => onEdit(w as Parameters<typeof onEdit>[0])} className="text-gray-500 hover:text-white transition"><Pencil size={13} /></button>
                            <button onClick={() => onDelete(w.id)} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={13} /></button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Guides & Docs Tab ────────────────────────────────────────────────────────
function GuidesTab() {
  const utils = trpc.useUtils();
  const { data: guides = [], isLoading } = trpc.guides.adminList.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    fileUrl: "",
    fileType: "pdf" as "pdf" | "checklist" | "playbook" | "other",
  });

  const createMutation = trpc.guides.adminCreate.useMutation({
    onSuccess: () => { utils.guides.adminList.invalidate(); setShowForm(false); resetForm(); toast.success("Guide created"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.guides.adminUpdate.useMutation({
    onSuccess: () => { utils.guides.adminList.invalidate(); setShowForm(false); setEditId(null); resetForm(); toast.success("Guide updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.guides.adminDelete.useMutation({
    onSuccess: () => { utils.guides.adminList.invalidate(); toast.success("Guide deleted"); },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() { setForm({ title: "", description: "", category: "", fileUrl: "", fileType: "pdf" }); }

  function startEdit(g: typeof guides[0]) {
    setEditId(g.id);
    setForm({ title: g.title, description: g.description ?? "", category: g.category ?? "", fileUrl: g.fileUrl ?? "", fileType: (g.fileType as "pdf" | "checklist" | "playbook" | "other") ?? "pdf" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (editId !== null) {
      updateMutation.mutate({ id: editId, data: { ...form, description: form.description || undefined, category: form.category || undefined, fileUrl: form.fileUrl || undefined } });
    } else {
      createMutation.mutate({ ...form, description: form.description || undefined, category: form.category || undefined, fileUrl: form.fileUrl || undefined });
    }
  }

  const FILE_TYPE_COLORS: Record<string, string> = { pdf: "#ef4444", checklist: "#0074F4", playbook: "#67C728", other: "#9ca3af" };
  const inputStyle: React.CSSProperties = { background: "#111", border: "1px solid #2a2a2a", color: "#fff", borderRadius: "8px", padding: "8px 10px", fontSize: "13px", width: "100%", outline: "none" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">WAVV Guides & Docs</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const rows = await utils.guides.adminExportDownloaders.fetch();
              if (!rows?.length) { toast.error("No downloads to export"); return; }
              const headers = ["Name","Email","Guide","Category","Downloaded At"];
              const csv = [headers.join(","), ...rows.map(r => [r.userName ?? "", r.userEmail ?? "", r.guideTitle ?? "", r.guideCategory ?? "", r.createdAt ? new Date(r.createdAt).toLocaleString() : ""].map(v => `"${v}"`).join(","))].join("\n");
              const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "guide-downloaders.csv"; a.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#67C728" }}
          >
            <FileDown size={13} /> Export Downloaders
          </button>
          <button
            onClick={() => { setEditId(null); resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
            style={{ background: "#0074F4" }}
          >
            <Plus size={13} /> Add Guide
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <h3 className="text-sm font-semibold text-white">{editId !== null ? "Edit Guide" : "New Guide"}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Guide title" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Category</label>
                <input style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Onboarding, Connection Rates" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea rows={2} style={{ ...inputStyle, resize: "vertical" as const }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">File Type</label>
                <select style={{ ...inputStyle, appearance: "none" as const }} value={form.fileType} onChange={e => setForm(f => ({ ...f, fileType: e.target.value as "pdf" | "checklist" | "playbook" | "other" }))}>
                  <option value="pdf">PDF</option>
                  <option value="checklist">Checklist</option>
                  <option value="playbook">Playbook</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">File URL</label>
                <input style={inputStyle} value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); resetForm(); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition" style={{ background: "#2a2a2a" }}>Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#0074F4" }}>
                {editId !== null ? "Save Changes" : "Create Guide"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grouped by file type */}
      {isLoading ? (
        <div className="flex items-center justify-center h-24"><div className="animate-spin w-6 h-6 border-2 border-[#0074F4] border-t-transparent rounded-full" /></div>
      ) : (
        <GuideGroups
          guides={guides}
          onEdit={startEdit}
          onDelete={(id) => { if (confirm("Delete this guide?")) deleteMutation.mutate({ id }); }}
        />
      )}
    </div>
  );
}

const GUIDE_GROUP_META: Record<string, { label: string; color: string; description: string }> = {
  pdf:       { label: "PDF",       color: "#ef4444", description: "Downloadable PDF documents" },
  checklist: { label: "Checklist", color: "#67C728", description: "Step-by-step checklists" },
  playbook:  { label: "Playbook",  color: "#0074F4", description: "Strategy and process playbooks" },
  resource:  { label: "Resource",  color: "#FF9900", description: "Reference materials and templates" },
  other:     { label: "Other",     color: "#6b7280", description: "Miscellaneous guides" },
};

function GuideGroups({
  guides,
  onEdit,
  onDelete,
}: {
  guides: import("../../../drizzle/schema").Guide[];
  onEdit: (g: import("../../../drizzle/schema").Guide) => void;
  onDelete: (id: number) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const groupOrder = ["pdf", "checklist", "playbook", "resource", "other"];
  const grouped = groupOrder.reduce((acc, type) => {
    acc[type] = guides.filter(g => (g.fileType ?? "other") === type);
    return acc;
  }, {} as Record<string, typeof guides>);

  return (
    <div className="space-y-4">
      {groupOrder.map((type) => {
        const group = grouped[type];
        if (group.length === 0 && type === "other") return null;
        const meta = GUIDE_GROUP_META[type];
        const isCollapsed = collapsed[type];
        return (
          <div key={type} className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
            <button
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition"
              style={{ background: "#1a1a1a" }}
              onClick={() => setCollapsed(c => ({ ...c, [type]: !c[type] }))}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                <span className="text-sm font-semibold text-white">{meta.label}</span>
                <span className="text-xs text-gray-500">{meta.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${meta.color}20`, color: meta.color }}>{group.length}</span>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
              </div>
            </button>
            {!isCollapsed && (
              group.length === 0 ? (
                <div className="px-5 py-8 text-center" style={{ background: "#111" }}>
                  <p className="text-gray-600 text-xs">No {meta.label.toLowerCase()} guides yet. Click "Add Guide" above and set the type.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: "#111", borderColor: "#2a2a2a" }}>
                      <TableHead className="text-gray-400 text-xs">Title</TableHead>
                      <TableHead className="text-gray-400 text-xs">Category</TableHead>
                      <TableHead className="text-gray-400 text-xs">Downloads</TableHead>
                      <TableHead className="text-gray-400 text-xs">Status</TableHead>
                      <TableHead className="text-gray-400 text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.map((g) => (
                      <TableRow key={g.id} style={{ borderColor: "#2a2a2a" }}>
                        <TableCell className="text-white text-sm font-medium max-w-xs truncate">{g.title}</TableCell>
                        <TableCell className="text-gray-400 text-xs">{g.category ?? "—"}</TableCell>
                        <TableCell className="text-gray-400 text-xs">{g.downloadCount ?? 0}</TableCell>
                        <TableCell>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: g.published ? "rgba(103,199,40,0.15)" : "rgba(239,68,68,0.15)", color: g.published ? "#67C728" : "#f87171" }}>
                            {g.published ? "Published" : "Hidden"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {g.fileUrl && (
                              <a href={g.fileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0074F4] transition"><ExternalLink size={13} /></a>
                            )}
                            <button onClick={() => onEdit(g)} className="text-gray-500 hover:text-white transition"><Pencil size={13} /></button>
                            <button onClick={() => onDelete(g.id)} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={13} /></button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Support section (used inside PlaygroundTab) ──────────────────────────────
function SupportSection() {
  const utils = trpc.useUtils();
  const { data: tickets = [], isLoading } = trpc.support.adminGetAll.useQuery();
  const updateStatus = trpc.support.adminUpdateStatus.useMutation({
    onSuccess: () => { utils.support.adminGetAll.invalidate(); toast.success("Status updated"); },
    onError: (e) => toast.error(e.message),
  });

  const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    open: { label: "Open", color: "#f87171", bg: "rgba(239,68,68,0.15)", icon: <AlertCircle size={11} /> },
    in_progress: { label: "In Progress", color: "#fbbf24", bg: "rgba(251,191,36,0.15)", icon: <Clock size={11} /> },
    resolved: { label: "Resolved", color: "#67C728", bg: "rgba(103,199,40,0.15)", icon: <CheckCircle2 size={11} /> },
    closed: { label: "Closed", color: "#6b7280", bg: "rgba(107,114,128,0.15)", icon: <X size={11} /> },
  };

  const PRIORITY_COLOR: Record<string, string> = { low: "#6b7280", medium: "#fbbf24", high: "#f97316", urgent: "#ef4444" };

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Headphones size={16} style={{ color: "#0074F4" }} />
        <h3 className="text-sm font-semibold text-white">Support Tickets</h3>
        {openCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
            {openCount} open
          </span>
        )}
        {inProgressCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
            {inProgressCount} in progress
          </span>
        )}
        <button
          onClick={async () => {
            const rows = await utils.support.adminExportSubmitters.fetch();
            if (!rows?.length) { toast.error("No tickets to export"); return; }
            const headers = ["Name","Email","Subject","Category","Priority","Status","Submitted At"];
            const csv = [headers.join(","), ...rows.map(r => [r.userName ?? "", r.userEmail ?? "", r.subject ?? "", r.category ?? "", r.priority ?? "", r.status ?? "", r.createdAt ? new Date(r.createdAt).toLocaleString() : ""].map(v => `"${v}"`).join(","))].join("\n");
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "support-submitters.csv"; a.click();
          }}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#67C728" }}
        >
          <FileDown size={13} /> Export Tickets
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-24"><div className="animate-spin w-6 h-6 border-2 border-[#0074F4] border-t-transparent rounded-full" /></div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl" style={{ background: "#111", border: "1px dashed #2a2a2a" }}>
          <Headphones size={28} className="text-gray-600 mb-2" />
          <p className="text-gray-500 text-sm">No tickets yet</p>
        </div>
      ) : (
        <TicketGroups tickets={tickets} STATUS_CONFIG={STATUS_CONFIG} PRIORITY_COLOR={PRIORITY_COLOR} onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })} />
      )}
    </div>
  );
}

const TICKET_CATEGORY_META: Record<string, { label: string; color: string }> = {
  "Technical Issue":  { label: "Technical Issue",  color: "#ef4444" },
  "Billing":          { label: "Billing",           color: "#fbbf24" },
  "Feature Request":  { label: "Feature Request",  color: "#0074F4" },
  "Onboarding":       { label: "Onboarding",        color: "#67C728" },
  "General Question": { label: "General Question", color: "#9ca3af" },
  "Other":            { label: "Other",             color: "#6b7280" },
};

function TicketGroups({
  tickets,
  STATUS_CONFIG,
  PRIORITY_COLOR,
  onUpdateStatus,
}: {
  tickets: Array<{ id: number; subject: string; category: string; priority: string; status: string; createdAt: Date | string }>;
  STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }>;
  PRIORITY_COLOR: Record<string, string>;
  onUpdateStatus: (id: number, status: "open" | "in_progress" | "resolved" | "closed") => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
  const PREVIEW_COUNT = 5;

  const categories = Object.keys(TICKET_CATEGORY_META);
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = tickets.filter(t => t.category === cat);
    return acc;
  }, {} as Record<string, typeof tickets>);
  // Catch-all for tickets with unknown categories
  const unknownCat = tickets.filter(t => !categories.includes(t.category));
  if (unknownCat.length > 0) grouped["Other"] = [...(grouped["Other"] ?? []), ...unknownCat];

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const group = grouped[cat] ?? [];
        if (group.length === 0) return null;
        const meta = TICKET_CATEGORY_META[cat];
        const isCollapsed = collapsed[cat];
        const isShowAll = showAll[cat];
        const displayed = isShowAll ? group : group.slice(0, PREVIEW_COUNT);
        return (
          <div key={cat} className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
            <button
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition"
              style={{ background: "#1a1a1a" }}
              onClick={() => setCollapsed(c => ({ ...c, [cat]: !c[cat] }))}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                <span className="text-sm font-semibold text-white">{meta.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${meta.color}20`, color: meta.color }}>{group.length}</span>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
              </div>
            </button>
            {!isCollapsed && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: "#111", borderColor: "#2a2a2a" }}>
                      <TableHead className="text-gray-400 text-xs">Subject</TableHead>
                      <TableHead className="text-gray-400 text-xs">Priority</TableHead>
                      <TableHead className="text-gray-400 text-xs">Status</TableHead>
                      <TableHead className="text-gray-400 text-xs">Date</TableHead>
                      <TableHead className="text-gray-400 text-xs">Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayed.map((t) => {
                      const sc = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.open;
                      return (
                        <TableRow key={t.id} style={{ borderColor: "#2a2a2a" }}>
                          <TableCell className="text-white text-sm font-medium max-w-xs truncate">{t.subject}</TableCell>
                          <TableCell>
                            <span className="text-[10px] font-semibold uppercase" style={{ color: PRIORITY_COLOR[t.priority] ?? "#9ca3af" }}>{t.priority}</span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold w-fit" style={{ background: sc.bg, color: sc.color }}>
                              {sc.icon}{sc.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <select
                              value={t.status}
                              onChange={e => onUpdateStatus(t.id, e.target.value as "open" | "in_progress" | "resolved" | "closed")}
                              style={{ background: "#111", border: "1px solid #2a2a2a", color: "#9ca3af", borderRadius: "6px", padding: "3px 6px", fontSize: "11px", outline: "none", appearance: "none" as const }}
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {group.length > PREVIEW_COUNT && (
                  <div className="px-5 py-2 border-t border-[#2a2a2a]" style={{ background: "#111" }}>
                    <button
                      onClick={() => setShowAll(s => ({ ...s, [cat]: !s[cat] }))}
                      className="text-xs text-gray-500 hover:text-white transition"
                    >
                      {isShowAll ? "Show less" : `View all ${group.length} tickets`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Support Tab ──────────────────────────────────────────────────────────────
function SupportTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,116,244,0.15)" }}>
          <Headphones size={18} style={{ color: "#0074F4" }} />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">WAVV Support</h2>
          <p className="text-xs text-gray-500">Manage and respond to customer support tickets</p>
        </div>
      </div>
      <SupportSection />
    </div>
  );
}

// ─── Content Requests Tab ─────────────────────────────────────────────────────
function ContentRequestsTab() {
  const [filterType, setFilterType] = useState<"video" | "guide" | "webinar" | "">("");
  const { data: requests, isLoading } = trpc.contentRequests.adminList.useQuery({
    requestType: filterType || undefined,
  });

  const TYPE_COLOR: Record<string, string> = {
    video: "#0074F4",
    guide: "#00A9E2",
    webinar: "#67C728",
  };
  const PRIORITY_COLOR: Record<string, string> = {
    high: "#ef4444",
    medium: "#FBBF24",
    low: "#9ca3af",
  };

  function exportCSV() {
    if (!requests || requests.length === 0) { toast.error("No requests to export"); return; }
    const header = "Date,Type,Topic,Category,Format Preference,Priority,User,Email,Description";
    const lines = (requests as Array<{
      createdAt: Date | string;
      requestType: string;
      topic: string;
      category?: string | null;
      formatPreference?: string | null;
      priority: string;
      userName?: string | null;
      userEmail?: string | null;
      description?: string | null;
    }>).map((r) => {
      const date = r.createdAt ? new Date(r.createdAt).toISOString() : "";
      const desc = r.description ? `"${String(r.description).replace(/"/g, '""')}"` : "";
      return `${date},${r.requestType},"${r.topic}",${r.category ?? ""},${r.formatPreference ?? ""},${r.priority},${r.userName ?? ""},${r.userEmail ?? ""},${desc}`;
    });
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "content-requests.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,116,244,0.15)" }}>
            <Bell size={18} style={{ color: "#0074F4" }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Content Requests</h2>
            <p className="text-xs text-gray-500">User-submitted requests for videos, guides, and webinars</p>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition"
          style={{ background: "rgba(0,116,244,0.1)", color: "#0074F4", border: "1px solid rgba(0,116,244,0.2)" }}
        >
          <FileDown size={13} /> Export CSV
        </button>
      </div>

      {/* Grouped by request type */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "#1a1a1a" }} />
          ))}
        </div>
      ) : !requests || requests.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: "#111", border: "1px dashed #2a2a2a" }}>
          <Bell size={32} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">No content requests yet.</p>
          <p className="text-gray-600 text-xs mt-1">Requests submitted by users will appear here.</p>
        </div>
      ) : (
        <ContentRequestGroups requests={requests as Array<{
          id: number;
          createdAt: Date | string;
          requestType: string;
          topic: string;
          description?: string | null;
          category?: string | null;
          formatPreference?: string | null;
          priority: string;
          userName?: string | null;
          userEmail?: string | null;
        }>} TYPE_COLOR={TYPE_COLOR} PRIORITY_COLOR={PRIORITY_COLOR} />
      )}
    </div>
  );
}

const CONTENT_REQUEST_GROUPS: Array<{ key: string; label: string; description: string }> = [
  { key: "video",   label: "Video Requests",   description: "Academy lesson and tutorial requests" },
  { key: "webinar", label: "Webinar Requests",  description: "Live and on-demand webinar requests" },
  { key: "guide",   label: "Guide Requests",    description: "Playbook, checklist, and doc requests" },
];

function ContentRequestGroups({
  requests,
  TYPE_COLOR,
  PRIORITY_COLOR,
}: {
  requests: Array<{
    id: number;
    createdAt: Date | string;
    requestType: string;
    topic: string;
    description?: string | null;
    category?: string | null;
    formatPreference?: string | null;
    priority: string;
    userName?: string | null;
    userEmail?: string | null;
  }>;
  TYPE_COLOR: Record<string, string>;
  PRIORITY_COLOR: Record<string, string>;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
  const PREVIEW_COUNT = 5;

  const grouped = CONTENT_REQUEST_GROUPS.reduce((acc, g) => {
    acc[g.key] = requests.filter(r => r.requestType === g.key);
    return acc;
  }, {} as Record<string, typeof requests>);
  // Catch-all for unknown types
  const knownKeys = CONTENT_REQUEST_GROUPS.map(g => g.key);
  const otherRequests = requests.filter(r => !knownKeys.includes(r.requestType));

  const allGroups = [
    ...CONTENT_REQUEST_GROUPS,
    ...(otherRequests.length > 0 ? [{ key: "other", label: "Other", description: "Miscellaneous requests" }] : []),
  ];
  if (otherRequests.length > 0) grouped["other"] = otherRequests;

  return (
    <div className="space-y-3">
      {allGroups.map(({ key, label, description }) => {
        const group = grouped[key] ?? [];
        if (group.length === 0) return null;
        const color = TYPE_COLOR[key] ?? "#9ca3af";
        const isCollapsed = collapsed[key];
        const isShowAll = showAll[key];
        const displayed = isShowAll ? group : group.slice(0, PREVIEW_COUNT);
        return (
          <div key={key} className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
            <button
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition"
              style={{ background: "#1a1a1a" }}
              onClick={() => setCollapsed(c => ({ ...c, [key]: !c[key] }))}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-sm font-semibold text-white">{label}</span>
                <span className="text-xs text-gray-500">{description}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${color}20`, color }}>{group.length}</span>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
              </div>
            </button>
            {!isCollapsed && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: "#111", borderColor: "#2a2a2a" }}>
                      <TableHead className="text-gray-400 text-xs">Date</TableHead>
                      <TableHead className="text-gray-400 text-xs">Topic</TableHead>
                      <TableHead className="text-gray-400 text-xs">Category</TableHead>
                      <TableHead className="text-gray-400 text-xs">Format</TableHead>
                      <TableHead className="text-gray-400 text-xs">Priority</TableHead>
                      <TableHead className="text-gray-400 text-xs">User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayed.map((r) => (
                      <TableRow key={r.id} style={{ borderColor: "#2a2a2a" }}>
                        <TableCell className="text-gray-500 text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-white text-xs max-w-[200px]">
                          <div className="truncate" title={r.topic}>{r.topic}</div>
                          {r.description && (
                            <div className="text-gray-600 text-[10px] truncate mt-0.5" title={r.description}>{r.description}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-400 text-xs">{r.category ?? "—"}</TableCell>
                        <TableCell className="text-gray-400 text-xs">{r.formatPreference ?? "—"}</TableCell>
                        <TableCell>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: `${PRIORITY_COLOR[r.priority] ?? "#9ca3af"}20`, color: PRIORITY_COLOR[r.priority] ?? "#9ca3af" }}>
                            {r.priority}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-400 text-xs">
                          <div>{r.userName ?? "—"}</div>
                          {r.userEmail && <div className="text-gray-600 text-[10px]">{r.userEmail}</div>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {group.length > PREVIEW_COUNT && (
                  <div className="px-5 py-2 border-t border-[#2a2a2a]" style={{ background: "#111" }}>
                    <button
                      onClick={() => setShowAll(s => ({ ...s, [key]: !s[key] }))}
                      className="text-xs text-gray-500 hover:text-white transition"
                    >
                      {isShowAll ? "Show less" : `View all ${group.length} requests`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const utils = trpc.useUtils();
  const { data: notifications = [], isLoading } = trpc.admin.listNotifications.useQuery();
  const { data: allUsers = [] } = trpc.admin.listUsers.useQuery();

  const createMutation = trpc.admin.createNotification.useMutation({
    onSuccess: () => {
      toast.success("Notification sent");
      utils.admin.listNotifications.invalidate();
      setForm({ title: "", message: "", type: "info", userId: undefined, link: "", linkLabel: "" });
      setShowForm(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.deleteNotification.useMutation({
    onSuccess: () => {
      toast.success("Notification deleted");
      utils.admin.listNotifications.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "announcement";
    userId?: number;
    link: string;
    linkLabel: string;
  }>({ title: "", message: "", type: "info", userId: undefined, link: "", linkLabel: "" });

  const typeColors: Record<string, string> = {
    info: "#38bdf8",
    success: "#4ade80",
    warning: "#fbbf24",
    announcement: "#e879f9",
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    createMutation.mutate({
      title: form.title.trim(),
      message: form.message.trim(),
      type: form.type,
      userId: form.userId,
      link: form.link.trim() || undefined,
      linkLabel: form.linkLabel.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Notifications</h2>
          <p className="text-xs text-gray-500 mt-0.5">Push notifications to all users or specific individuals</p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 text-sm"
          style={{ background: "#0074F4", color: "#fff" }}
        >
          <Plus size={14} />
          {showForm ? "Cancel" : "New Notification"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl p-5 space-y-4" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <h3 className="text-sm font-semibold text-white">Create Notification</h3>

          {/* Type selector */}
          <div className="flex gap-2 flex-wrap">
            {(["info", "success", "warning", "announcement"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                style={{
                  background: form.type === t ? typeColors[t] + "22" : "rgba(255,255,255,0.05)",
                  color: form.type === t ? typeColors[t] : "#9ca3af",
                  border: `1px solid ${form.type === t ? typeColors[t] + "55" : "transparent"}`,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Audience */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Audience</label>
            <select
              className="w-full px-3 py-2 rounded-lg text-sm text-white"
              style={{ background: "#111", border: "1px solid #2a2a2a" }}
              value={form.userId ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">All users (broadcast)</option>
              {allUsers.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name ?? u.email ?? `User #${u.id}`}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Title <span className="text-red-400">*</span></label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. New feature available"
              className="bg-[#111] border-[#2a2a2a] text-white"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Message <span className="text-red-400">*</span></label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Notification body text..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm text-white resize-none"
              style={{ background: "#111", border: "1px solid #2a2a2a", outline: "none" }}
            />
          </div>

          {/* Optional link */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Link URL (optional)</label>
              <Input
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                placeholder="https://..."
                className="bg-[#111] border-[#2a2a2a] text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Link label (optional)</label>
              <Input
                value={form.linkLabel}
                onChange={(e) => setForm((f) => ({ ...f, linkLabel: e.target.value }))}
                placeholder="e.g. Learn more"
                className="bg-[#111] border-[#2a2a2a] text-white"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="w-full"
            style={{ background: "#0074F4", color: "#fff" }}
          >
            {createMutation.isPending ? "Sending..." : "Send Notification"}
          </Button>
        </div>
      )}

      {/* Existing notifications list */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a" }}>
          <span className="text-sm font-semibold text-white">Sent Notifications</span>
          <span className="text-xs text-gray-500">{notifications.length} total</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-[#0074F4] border-t-transparent rounded-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Bell size={28} className="text-gray-600" />
            <p className="text-sm text-gray-400">No notifications sent yet.</p>
          </div>
        ) : (
          <div>
            {notifications.map((n: any) => (
              <div
                key={n.id}
                className="flex items-start gap-3 px-4 py-3"
                style={{ borderBottom: "1px solid #1e1e1e" }}
              >
                <span
                  className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: typeColors[n.type] ?? "#38bdf8", marginTop: "6px" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full capitalize font-medium"
                      style={{ background: (typeColors[n.type] ?? "#38bdf8") + "22", color: typeColors[n.type] ?? "#38bdf8" }}
                    >
                      {n.type}
                    </span>
                    {n.userId ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400">
                        Targeted
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400">
                        Broadcast
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                  {n.link && (
                    <a href={n.link} className="text-xs text-blue-400 mt-0.5 inline-block hover:text-blue-300">
                      {n.linkLabel ?? n.link}
                    </a>
                  )}
                  <p className="text-[10px] text-gray-600 mt-1">
                    {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate({ id: n.id })}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
                  title="Delete notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
