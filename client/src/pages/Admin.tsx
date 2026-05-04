import { useState, useMemo, useEffect } from "react";
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
  LogIn,
  BookOpen,
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
} from "lucide-react";
import { toast } from "sonner";

type AdminTab = "analytics" | "users" | "content";
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
    if (t === "content") return "content";
    return "analytics";
  };
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  // Sync tab when the URL changes (e.g., sidebar link clicked while already on /admin)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "users") setActiveTab("users");
    else if (t === "content") setActiveTab("content");
    else setActiveTab("analytics");
  }, [location]);

  if (!loading && user && user.role !== "admin") {
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
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={15} /> },
    { id: "users", label: "Users", icon: <Users size={15} /> },
    { id: "content", label: "Content", icon: <BookOpen size={15} /> },
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
          className="flex items-center gap-1 p-1 rounded-xl w-fit"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === tab.id
                  ? {
                      background: "#0074F4",
                      color: "#fff",
                    }
                  : {
                      color: "#9ca3af",
                    }
              }
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "content" && <ContentTab />}

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

  const stats = useMemo(() => {
    if (!eventCounts) return null;
    const countMap: Record<string, number> = {};
    eventCounts.forEach((e) => { countMap[e.eventType] = e.count; });
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
          <div key={i} className="rounded-xl p-5 animate-pulse h-28"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
        ))}
      </div>
    );
  }

  const COLORS = ["#06b6d4","#22c55e","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316"];

  const pieData = eventCounts
    ?.filter((e) => e.count > 0)
    .map((e) => ({ name: formatEventType(e.eventType), value: e.count })) ?? [];

  return (
    <div className="space-y-6">
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18} />} label="Total Users" value={summary?.totalUsers ?? 0} color="cyan" />
        <StatCard icon={<Activity size={18} />} label="Active Users" value={activeUsers?.count ?? 0} color="green" subtitle={`last ${days}d`} />
        <StatCard icon={<LogIn size={18} />} label="Sign-Ins" value={stats?.logins ?? 0} color="blue" subtitle={`last ${days}d`} />
        <StatCard icon={<MessageSquare size={18} />} label="AI Conversations" value={stats?.aiChats ?? 0} color="purple" subtitle={`last ${days}d`} />
      </div>
      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen size={18} />} label="Lessons Completed" value={stats?.lessonCompleted ?? 0} color="emerald" subtitle={`last ${days}d`} />
        <StatCard icon={<Eye size={18} />} label="Webinars Watched" value={stats?.webinarWatched ?? 0} color="amber" subtitle={`last ${days}d`} />
        <StatCard icon={<Download size={18} />} label="Guide Downloads" value={stats?.guideDownloaded ?? 0} color="teal" subtitle={`last ${days}d`} />
        <StatCard icon={<Ticket size={18} />} label="Tickets Submitted" value={stats?.ticketsSubmitted ?? 0} color="red" subtitle={`last ${days}d`} />
      </div>
      {/* Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Search size={18} />} label="Total Searches" value={stats?.searches ?? 0} color="teal" subtitle={`last ${days}d`} />
        <StatCard icon={<Eye size={18} />} label="Webinar Registrations" value={stats?.webinarRegistered ?? 0} color="amber" subtitle={`last ${days}d`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-cyan-400" /> Sign-In Trend
          </h3>
          <div className="h-52">
            {signInTrend && signInTrend.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">No sign-in data for this period</div>
            )}
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={15} className="text-purple-400" /> Event Distribution
          </h3>
          <div className="h-52">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">No events recorded yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Content + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Search size={15} className="text-amber-400" /> Top Content (by interactions)
          </h3>
          {topContent && topContent.length > 0 ? (
            <div className="space-y-2">
              {topContent.slice(0, 8).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-5 text-right">{idx + 1}.</span>
                    <span className="text-gray-300 capitalize">{item.resourceType ?? "unknown"}</span>
                    <span className="text-gray-500">#{item.resourceId}</span>
                    <span className="text-xs text-gray-500 px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)" }}>
                      {formatEventType(item.eventType)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm text-center py-8">No content interactions yet</div>
          )}
        </div>

        <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={15} className="text-green-400" /> Recent Activity
          </h3>
          {recentEvents && recentEvents.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2 px-3 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    <span className="text-gray-300">{formatEventType(event.eventType)}</span>
                    {event.resourceType && (
                      <span className="text-xs text-gray-500">({event.resourceType} #{event.resourceId})</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{formatTimeAgo(event.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm text-center py-8">No recent activity</div>
          )}
        </div>
      </div>

      {/* Search & AI chart */}
      <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Search size={15} className="text-teal-400" /> Search & AI Usage Trend
        </h3>
        <SearchAIChart days={days} />
      </div>
    </div>
  );
}

function SearchAIChart({ days }: { days: number }) {
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
function UsersTab() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: number;
    userName: string;
    currentRole: string;
    newRole: "user" | "admin";
  } | null>(null);

  const { data: users, isLoading, refetch } = trpc.admin.listUsers.useQuery(undefined, {
    enabled: currentUser?.role === "admin",
  });

  const updateRole = trpc.admin.updateRole.useMutation({
    onSuccess: () => {
      toast.success(`${confirmDialog?.userName} is now ${confirmDialog?.newRole === "admin" ? "an admin" : "a standard user"}.`);
      setConfirmDialog(null);
      refetch();
    },
    onError: (err) => { toast.error(err.message); },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) => (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const adminCount = useMemo(() => (users ?? []).filter((u) => u.role === "admin").length, [users]);
  const totalCount = users?.length ?? 0;

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-white">User Management</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Users className="h-5 w-5 text-blue-400" />, label: "Total Users", value: totalCount, bg: "rgba(59,130,246,0.1)" },
          { icon: <Shield className="h-5 w-5 text-amber-400" />, label: "Admins", value: adminCount, bg: "rgba(245,158,11,0.1)" },
          { icon: <UserPlus className="h-5 w-5 text-green-400" />, label: "Standard Users", value: totalCount - adminCount, bg: "rgba(34,197,94,0.1)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: s.bg }}>{s.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
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
              <TableHead className="text-gray-400 w-[250px]">Name</TableHead>
              <TableHead className="text-gray-400 w-[300px]">Email</TableHead>
              <TableHead className="text-gray-400 w-[120px]">Role</TableHead>
              <TableHead className="text-gray-400 w-[180px]">Registered</TableHead>
              <TableHead className="text-gray-400 w-[120px] text-right">Actions</TableHead>
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
                  {search ? "No users match your search." : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const initials = (u.name ?? "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
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
                    <TableCell className="text-gray-400">{u.email ?? "—"}</TableCell>
                    <TableCell>
                      {u.role === "admin" ? (
                        <Badge className="text-[10px]" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                          <Shield className="h-3 w-3 mr-1" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isSelf ? (
                        <span className="text-xs text-gray-600">—</span>
                      ) : u.role === "admin" ? (
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, newRole: "user" })}>
                          <ShieldOff className="h-4 w-4 mr-1" /> Revoke
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                          onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, newRole: "admin" })}>
                          <Shield className="h-4 w-4 mr-1" /> Promote
                        </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog?.newRole === "admin" ? "Promote to Admin" : "Revoke Admin Access"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog?.newRole === "admin" ? (
                <><strong>{confirmDialog.userName}</strong> will gain access to the admin analytics dashboard, user management, and content management tools.</>
              ) : (
                <><strong>{confirmDialog?.userName}</strong> will lose access to admin tools. They will retain standard user access to all learning content.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button
              variant={confirmDialog?.newRole === "admin" ? "default" : "destructive"}
              onClick={() => { if (confirmDialog) updateRole.mutate({ userId: confirmDialog.userId, role: confirmDialog.newRole }); }}
              disabled={updateRole.isPending}
            >
              {updateRole.isPending ? "Updating..." : confirmDialog?.newRole === "admin" ? "Promote to Admin" : "Revoke Admin"}
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
        <p className="text-xs text-gray-400 truncate">{label}</p>
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
function ContentTab() {
  const utils = trpc.useUtils();
  const { data: lessons = [], isLoading } = trpc.academy.adminGetAllLessons.useQuery();
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

  const activeLessons = lessons.filter((l) => l.published);
  const inactiveLessons = lessons.filter((l) => !l.published);

  function handleDeactivate(lesson: { id: number; title: string }) {
    setPendingLesson(lesson);
    setReasonInput("");
    setReasonDialogOpen(true);
  }

  function confirmDeactivate() {
    if (!pendingLesson) return;
    updateLesson.mutate({
      id: pendingLesson.id,
      data: {
        published: false,
        inactiveReason: reasonInput.trim() || null,
      },
    });
    setReasonDialogOpen(false);
    setPendingLesson(null);
  }

  function handleActivate(id: number) {
    updateLesson.mutate({
      id,
      data: { published: true, inactiveReason: null },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin w-6 h-6 border-2 border-[#0074F4] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Active content ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h2 className="text-sm font-semibold text-white">
            Active ({activeLessons.length})
          </h2>
          <span className="text-xs text-gray-500">Visible to users</span>
        </div>
        {activeLessons.length === 0 ? (
          <p className="text-sm text-gray-600 py-4">No active lessons.</p>
        ) : (
          <div className="space-y-2">
            {activeLessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                isActive
                onDeactivate={() => handleDeactivate({ id: lesson.id, title: lesson.title })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Inactive content ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <h2 className="text-sm font-semibold text-white">
            Inactive ({inactiveLessons.length})
          </h2>
          <span className="text-xs text-gray-500">Hidden from users</span>
        </div>
        {inactiveLessons.length === 0 ? (
          <p className="text-sm text-gray-600 py-4">No inactive lessons.</p>
        ) : (
          <div className="space-y-2">
            {inactiveLessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                isActive={false}
                onActivate={() => handleActivate(lesson.id)}
              />
            ))}
          </div>
        )}
      </div>

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
    courseTitle?: string;
    courseCategory?: string;
    inactiveReason?: string | null;
    videoUrl?: string | null;
  };
  isActive: boolean;
  onDeactivate?: () => void;
  onActivate?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
    >
      {/* Status dot */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: isActive ? "#22c55e" : "#4b5563" }}
      />

      {/* Title + meta */}
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
        </div>
      </div>

      {/* Action button */}
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
  );
}
