import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PortalLayout from "@/components/PortalLayout";
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
  Users,
  LogIn,
  BookOpen,
  MessageSquare,
  Search,
  TrendingUp,
  Activity,
  Eye,
  Download,
  Ticket,
  ArrowLeft,
  FileDown,
} from "lucide-react";

type TimeRange = 7 | 30 | 90 | 365;

export default function AdminAnalytics() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [days, setDays] = useState<TimeRange>(30);

  // Redirect non-admin users
  if (!loading && user && user.role !== "admin") {
    navigate("/home");
    return null;
  }

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/home")}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-sm text-gray-400">
                Internal metrics — visible to admins only
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportCSV(days)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 transition"
            >
              <FileDown size={14} />
              Export CSV
            </button>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
              {([7, 30, 90, 365] as TimeRange[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                    days === d
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {d === 365 ? "1Y" : `${d}D`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats + Charts */}
        <AnalyticsContent days={days} />
      </div>
    </PortalLayout>
  );
}

function AnalyticsContent({ days }: { days: TimeRange }) {
  const { data: summary, isLoading: summaryLoading } =
    trpc.analytics.getSummary.useQuery();
  const { data: eventCounts, isLoading: eventsLoading } =
    trpc.analytics.getEventCounts.useQuery({ days });
  const { data: signInTrend } =
    trpc.analytics.getSignInTrend.useQuery({ days });
  const { data: activeUsers } =
    trpc.analytics.getActiveUsers.useQuery({ days });
  const { data: topContent } =
    trpc.analytics.getTopContent.useQuery({ days, limit: 10 });
  const { data: recentEvents } =
    trpc.analytics.getRecentEvents.useQuery({ days: Math.min(days, 7), limit: 30 });

  // Derive stat counts from eventCounts
  const stats = useMemo(() => {
    if (!eventCounts) return null;
    const countMap: Record<string, number> = {};
    eventCounts.forEach((e) => {
      countMap[e.eventType] = e.count;
    });
    return {
      logins: countMap["login"] ?? 0,
      lessonCompleted: countMap["lesson_completed"] ?? 0,
      webinarWatched: countMap["webinar_watched"] ?? 0,
      webinarRegistered: countMap["webinar_registered"] ?? 0,
      guideDownloaded: countMap["guide_downloaded"] ?? 0,
      aiChats: countMap["ai_chat"] ?? 0,
      searches: countMap["search"] ?? 0,
      ticketsSubmitted: countMap["ticket_submitted"] ?? 0,
    };
  }, [eventCounts]);

  const isLoading = summaryLoading || eventsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse h-28"
          />
        ))}
      </div>
    );
  }

  const COLORS = [
    "#06b6d4",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  // Pie chart data for event distribution
  const pieData = eventCounts
    ?.filter((e) => e.count > 0)
    .map((e) => ({
      name: formatEventType(e.eventType),
      value: e.count,
    })) ?? [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={18} />}
          label="Total Users"
          value={summary?.totalUsers ?? 0}
          color="cyan"
        />
        <StatCard
          icon={<Activity size={18} />}
          label="Active Users"
          value={activeUsers?.count ?? 0}
          color="green"
          subtitle={`last ${days}d`}
        />
        <StatCard
          icon={<LogIn size={18} />}
          label="Sign-Ins"
          value={stats?.logins ?? 0}
          color="blue"
          subtitle={`last ${days}d`}
        />
        <StatCard
          icon={<MessageSquare size={18} />}
          label="AI Conversations"
          value={stats?.aiChats ?? 0}
          color="purple"
          subtitle={`last ${days}d`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen size={18} />}
          label="Lessons Completed"
          value={stats?.lessonCompleted ?? 0}
          color="emerald"
          subtitle={`last ${days}d`}
        />
        <StatCard
          icon={<Eye size={18} />}
          label="Webinars Watched"
          value={stats?.webinarWatched ?? 0}
          color="amber"
          subtitle={`last ${days}d`}
        />
        <StatCard
          icon={<Download size={18} />}
          label="Guide Downloads"
          value={stats?.guideDownloaded ?? 0}
          color="teal"
          subtitle={`last ${days}d`}
        />
        <StatCard
          icon={<Ticket size={18} />}
          label="Tickets Submitted"
          value={stats?.ticketsSubmitted ?? 0}
          color="red"
          subtitle={`last ${days}d`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Search size={18} />}
          label="Total Searches"
          value={stats?.searches ?? 0}
          color="teal"
          subtitle={`last ${days}d`}
        />
        <StatCard
          icon={<Eye size={18} />}
          label="Webinar Registrations"
          value={stats?.webinarRegistered ?? 0}
          color="amber"
          subtitle={`last ${days}d`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sign-In Trend */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-cyan-400" />
            Sign-In Trend
          </h3>
          <div className="h-52">
            {signInTrend && signInTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signInTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#1f2937",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                No sign-in data for this period
              </div>
            )}
          </div>
        </div>

        {/* Event Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={15} className="text-purple-400" />
            Event Distribution
          </h3>
          <div className="h-52">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1f2937",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                No events recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Content + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Content */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Search size={15} className="text-amber-400" />
            Top Content (by interactions)
          </h3>
          {topContent && topContent.length > 0 ? (
            <div className="space-y-2">
              {topContent.slice(0, 8).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/3 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-5 text-right">{idx + 1}.</span>
                    <span className="text-gray-300 capitalize">
                      {item.resourceType ?? "unknown"}
                    </span>
                    <span className="text-gray-500">#{item.resourceId}</span>
                    <span className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                      {formatEventType(item.eventType)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm text-center py-8">
              No content interactions yet
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={15} className="text-green-400" />
            Recent Activity
          </h3>
          {recentEvents && recentEvents.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/3"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    <span className="text-gray-300">
                      {formatEventType(event.eventType)}
                    </span>
                    {event.resourceType && (
                      <span className="text-xs text-gray-500">
                        ({event.resourceType} #{event.resourceId})
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">
                    {formatTimeAgo(event.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm text-center py-8">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* Search Activity Chart */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Search size={15} className="text-teal-400" />
          Search & AI Usage Trend
        </h3>
        <SearchAIChart days={days} />
      </div>
    </div>
  );
}

function SearchAIChart({ days }: { days: number }) {
  const { data: searchTrend } = trpc.analytics.getDailyEvents.useQuery({
    eventType: "search",
    days,
  });
  const { data: aiTrend } = trpc.analytics.getDailyEvents.useQuery({
    eventType: "ai_chat",
    days,
  });

  // Merge the two datasets by date
  const mergedData = useMemo(() => {
    if (!searchTrend && !aiTrend) return [];
    const dateMap: Record<string, { date: string; searches: number; aiChats: number }> = {};
    searchTrend?.forEach((d) => {
      dateMap[d.date] = { date: d.date, searches: d.count, aiChats: 0 };
    });
    aiTrend?.forEach((d) => {
      if (dateMap[d.date]) {
        dateMap[d.date].aiChats = d.count;
      } else {
        dateMap[d.date] = { date: d.date, searches: 0, aiChats: d.count };
      }
    });
    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [searchTrend, aiTrend]);

  if (mergedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
        No search or AI data for this period
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "#1f2937",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Bar dataKey="searches" fill="#14b8a6" name="Searches" radius={[2, 2, 0, 0]} />
          <Bar dataKey="aiChats" fill="#8b5cf6" name="AI Chats" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  color,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  subtitle?: string;
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
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg ${colorMap[color] ?? "text-gray-400 bg-gray-400/10"}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 truncate">{label}</p>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        {subtitle && <p className="text-[10px] text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatEventType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function exportCSV(days: number) {
  try {
    const url = `/api/trpc/analytics.exportCSV?input=${encodeURIComponent(JSON.stringify({ json: { days } }))}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error("Export failed");
    const json = await res.json();
    // tRPC wraps the result in { result: { data: { json: "..." } } }
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
