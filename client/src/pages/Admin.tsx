import { useState, useMemo, useEffect } from "react";
import React, { useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PortalLayout from "@/components/PortalLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  AlertTriangle,
  ArrowUp,
  FileUp,
  ArrowDown,
  ChevronUp,
  Flag,
  Upload,
  Paperclip,
  Lock,
  Sparkles,
  Bot,
  Send,
} from "lucide-react";
import { toast } from "sonner";

type AdminTab = "knowledge" | "analytics" | "users" | "academy" | "webinars" | "guides" | "playground" | "support" | "content_requests";
type TimeRange = 7 | 30 | 90 | 365;

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function Admin() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  const isSuperAdmin = user?.role === "super_admin";

  // Read ?tab= from the URL to set the initial active tab
  const initialTab = (): AdminTab => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "knowledge") return "knowledge";
    if (t === "users" && isSuperAdmin) return "users";
    if ((t === "academy" || t === "content") && isSuperAdmin) return "academy";
    if (t === "webinars" && isSuperAdmin) return "webinars";
    if (t === "guides" && isSuperAdmin) return "guides";
    if (t === "playground" && isSuperAdmin) return "playground";
    if (t === "support" && isSuperAdmin) return "support";
    if (t === "content_requests" && isSuperAdmin) return "content_requests";
    if (t === "analytics" && isSuperAdmin) return "analytics";
    // Regular admins always land on knowledge
    return isSuperAdmin ? "analytics" : "knowledge";
  };
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  // Sync tab when the URL changes (e.g., sidebar link clicked while already on /admin)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "knowledge") setActiveTab("knowledge");
    else if (t === "users" && isSuperAdmin) setActiveTab("users");
    else if ((t === "academy" || t === "content") && isSuperAdmin) setActiveTab("academy");
    else if (t === "webinars" && isSuperAdmin) setActiveTab("webinars");
    else if (t === "guides" && isSuperAdmin) setActiveTab("guides");
    else if (t === "playground" && isSuperAdmin) setActiveTab("playground");
    else if (t === "support" && isSuperAdmin) setActiveTab("support");
    else if (t === "content_requests" && isSuperAdmin) setActiveTab("content_requests");
    else if (t === "analytics" && isSuperAdmin) setActiveTab("analytics");
    else setActiveTab(isSuperAdmin ? "analytics" : "knowledge");
  }, [location]);
  // Not logged in at all → send to /login with ?next=/admin
  if (!loading && !user) {
    navigate("/login?next=/admin");
    return null;
  }
  // Logged in but not an admin → send back to dashboard
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

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; superAdminOnly?: boolean }[] = [
    { id: "knowledge",        label: "WAVV Knowledge",    icon: <Sparkles size={13} />,       superAdminOnly: false },
    { id: "analytics",        label: "Analytics",         icon: <BarChart3 size={13} />,      superAdminOnly: true },
    { id: "users",            label: "Team Access",       icon: <Shield size={13} />,         superAdminOnly: true },
    { id: "academy",          label: "Academy",           icon: <GraduationCap size={13} />,  superAdminOnly: true },
    { id: "webinars",         label: "Webinars",          icon: <Video size={13} />,          superAdminOnly: true },
    { id: "guides",           label: "Guides",            icon: <FileText size={13} />,       superAdminOnly: true },
    { id: "playground",       label: "Playground",        icon: <FlaskConical size={13} />,   superAdminOnly: true },
    { id: "support",          label: "Support",           icon: <Headphones size={13} />,     superAdminOnly: true },
    { id: "content_requests", label: "Requests",          icon: <MessageSquare size={13} />,  superAdminOnly: true },
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
          style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
        >
          {tabs.map((tab) => {
            const locked = tab.superAdminOnly && !isSuperAdmin;
            return (
              <button
                key={tab.id}
                onClick={() => { if (!locked) setActiveTab(tab.id); }}
                title={locked ? "Super admin access required" : undefined}
                className="flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-w-0"
                style={
                  locked
                    ? { color: "rgba(255,255,255,0.2)", cursor: "not-allowed" }
                    : activeTab === tab.id
                    ? { background: "#0074F4", color: "#fff" }
                    : { color: "#9ca3af" }
                }
              >
                <span className="flex-shrink-0" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {tab.icon}
                </span>
                {tab.label}
                {locked && <Lock size={10} style={{ marginLeft: 2, opacity: 0.5 }} />}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "knowledge" && <WavvKnowledgeTab />}
        {activeTab === "analytics" && isSuperAdmin && <AnalyticsTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "academy" && <ContentTab />}
        {activeTab === "webinars" && <WebinarsTab />}
        {activeTab === "guides" && <GuidesTab />}
        {activeTab === "playground" && <PlaygroundTab />}
        {activeTab === "support" && <SupportTab />}
        {activeTab === "content_requests" && <ContentRequestsTab />}
      </div>
    </PortalLayout>
  );
}

// ─── WAVV Knowledge Tab ──────────────────────────────────────────────────────
function WavvKnowledgeTab() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatMutation = trpc.wavvAi.chat.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    const userMsg = { role: "user" as const, content: content.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    try {
      const response = await chatMutation.mutateAsync({ messages: newMessages });
      const aiContent = typeof response.content === "string" ? response.content : String(response.content);
      setMessages([...newMessages, { role: "assistant", content: aiContent }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Unable to connect. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#141414", border: "1px solid #2a2a2a", height: "600px", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ background: "linear-gradient(135deg, #1a1f2e, #1d2230)", borderBottom: "1px solid #2a2a2a" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}>
          <Sparkles size={17} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">WAVV Knowledge</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Internal knowledge base — admin access only</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,116,244,0.1)", border: "1px solid rgba(0,116,244,0.2)" }}>
              <Sparkles size={24} style={{ color: "#0074F4" }} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-1">WAVV Knowledge</p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)", maxWidth: "320px" }}>
                Your internal knowledge base is being set up. Once content is curated, this will be your go-to for finding answers without digging through Slack or Google Drive.
              </p>
            </div>
            <div className="px-4 py-2 rounded-lg text-xs" style={{ background: "rgba(0,116,244,0.08)", border: "1px solid rgba(0,116,244,0.15)", color: "rgba(255,255,255,0.5)" }}>
              Content curation coming soon
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: msg.role === "user" ? "linear-gradient(135deg, #67C728, #00A9E2)" : "linear-gradient(135deg, #0074F4, #00A9E2)" }}>
              {msg.role === "user" ? <Users size={13} className="text-white" /> : <Bot size={13} className="text-white" />}
            </div>
            <div className="rounded-2xl px-4 py-3 text-sm" style={{
              background: msg.role === "user" ? "rgba(0,116,244,0.12)" : "#1e1e1e",
              border: msg.role === "user" ? "1px solid rgba(0,116,244,0.25)" : "1px solid #2a2a2a",
              color: "#e5e7eb", maxWidth: "80%",
              borderRadius: msg.role === "user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
            }}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}>
              <Bot size={13} className="text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}>
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid #2a2a2a" }}>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="Search the WAVV knowledge base..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            disabled={isLoading}
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: "#0074F4" }}>
            <Send size={13} className="text-white" />
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>WAVV Knowledge · Internal use only</p>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [days, setDays] = useState<TimeRange>(30);
  const [resetStep, setResetStep] = useState<0 | 1 | 2 | 3>(0);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const utils = trpc.useUtils();
  const { user: analyticsUser } = useAuth();
  const isSuperAdmin = analyticsUser?.role === "super_admin";

  const resetAnalytics = trpc.analytics.resetAnalytics.useMutation({
    onSuccess: () => {
      toast.success("Analytics data has been cleared.");
      setResetStep(0);
      setResetConfirmText("");
      utils.analytics.getSummary.invalidate();
      utils.analytics.getEventCounts.invalidate();
      utils.analytics.getDailyEvents.invalidate();
      utils.analytics.getActiveUsers.invalidate();
      utils.analytics.getTopContent.invalidate();
      utils.analytics.getRecentEvents.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      {/* Reset confirmation dialog — triple confirmation */}
      <Dialog open={resetStep > 0} onOpenChange={(open) => { if (!open) { setResetStep(0); setResetConfirmText(""); } }}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle size={18} style={{ color: "#ef4444" }} />
              Reset All Analytics
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {resetStep === 1 && "This will permanently erase all analytics event data. This action cannot be undone."}
              {resetStep === 2 && "Are you absolutely sure? All historical analytics data will be lost."}
              {resetStep === 3 && "Type RESET below to confirm. This is your last chance to cancel."}
            </DialogDescription>
          </DialogHeader>
          {resetStep === 3 && (
            <div className="py-2">
              <Input
                placeholder="Type RESET to confirm"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                className="bg-black/30 border-red-500/30 text-white placeholder:text-gray-600"
                autoFocus
              />
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => { setResetStep(0); setResetConfirmText(""); }} className="text-gray-400">Cancel</Button>
            {resetStep < 3 ? (
              <Button
                variant="destructive"
                onClick={() => setResetStep((s) => (s + 1) as 1 | 2 | 3)}
              >
                {resetStep === 1 ? "Yes, I understand" : "Yes, erase all data"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                disabled={resetConfirmText !== "RESET" || resetAnalytics.isPending}
                onClick={() => resetAnalytics.mutate()}
              >
                {resetAnalytics.isPending ? "Resetting..." : "Confirm Reset"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold text-white">Analytics Dashboard</h2>
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => setResetStep(1)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition"
              style={{
                background: "rgba(239,68,68,0.08)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <Trash2 size={13} />
              Reset Data
            </button>
          )}
          {isSuperAdmin && (
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
          )}
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

// ─── StatDetailDrawer ───────────────────────────────────────────────────────
function StatDetailDrawer({
  label, eventTypes, color, days, onClose,
}: {
  label: string;
  eventTypes: string[];
  color: string;
  days: number;
  onClose: () => void;
}) {
  const { data: rows = [], isLoading } = trpc.analytics.getStatDetail.useQuery(
    { eventTypes, days, limit: 200 },
    { staleTime: 30_000 }
  );

  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const sorted = useMemo(
    () => [...rows].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortDir === "desc" ? tb - ta : ta - tb;
    }),
    [rows, sortDir]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
        style={{
          width: "min(680px, 95vw)",
          background: "#0f1117",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>Detail View</p>
            <h2 className="text-lg font-bold text-white">{label}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Last {days} days · {rows.length} events</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportTileCSV(label, rows, days)}
              disabled={rows.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
              style={{ color, border: `1px solid ${color}40` }}
              title="Export this data as CSV"
            >
              <FileDown size={13} />
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition"
              style={{ color: "#9ca3af" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sort control */}
        <div className="px-6 py-3 shrink-0 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-xs text-gray-500">Sort by date:</span>
          <button
            onClick={() => setSortDir((d) => d === "desc" ? "asc" : "desc")}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition hover:bg-white/10"
            style={{ color, border: `1px solid ${color}40` }}
          >
            {sortDir === "desc" ? "Newest first" : "Oldest first"}
            <ChevronDown size={12} className={`transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: color }} />
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className="text-gray-500 text-sm">No events recorded in this period</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0" style={{ background: "#0f1117", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <tr>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">When</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {sorted.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-3">
                      <div className="font-medium text-white text-sm leading-tight">{row.userName ?? "Anonymous"}</div>
                      {row.userEmail && <div className="text-[11px] text-gray-500 mt-0.5">{row.userEmail}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                        {formatEventType(row.eventType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {row.resourceType ? `${row.resourceType}${row.resourceId ? ` #${row.resourceId}` : ""}` : "—"}
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-gray-500 whitespace-nowrap">
                      {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
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

  // Stat detail drawer
  const [drawerMeta, setDrawerMeta] = useState<{ label: string; eventTypes: string[]; color: string } | null>(null);
  const openDrawer = (label: string, eventTypes: string[], color: string) =>
    setDrawerMeta({ label, eventTypes, color });

  const stats = useMemo(() => {
    if (!eventCounts) return null;
    const c: Record<string, number> = {};
    eventCounts.forEach((e) => { c[e.eventType] = e.count; });
    return {
      pageViews:           c["page_view"] ?? 0,
      lessonCompleted:     c["lesson_completed"] ?? 0,
      regClicks:           c["webinar_registration_click"] ?? 0,
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
      {/* Stat Cards — public model: site engagement + content interactions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Eye size={18} />}           label="Page Views"                     value={stats?.pageViews ?? 0}        color="blue"   subtitle={`last ${days}d`} onClick={() => openDrawer("Page Views",                     ["page_view"],                                               "#60a5fa")} />
        <StatCard icon={<GraduationCap size={18} />} label="Academy Lessons Completed"      value={stats?.lessonCompleted ?? 0}  color="cyan"   subtitle={`last ${days}d`} onClick={() => openDrawer("Academy Lessons Completed",       ["lesson_completed"],                                        "#22d3ee")} />
        <StatCard icon={<ExternalLink size={18} />}  label="Webinar Register Clicks"         value={stats?.regClicks ?? 0}        color="amber"  subtitle={`last ${days}d`} onClick={() => openDrawer("Webinar Register Clicks",         ["webinar_registration_click"],                              "#f59e0b")} />
        <StatCard icon={<Video size={18} />}         label="On-Demand Webinars Watched"     value={stats?.ondemandWatched ?? 0}  color="purple" subtitle={`last ${days}d`} onClick={() => openDrawer("On-Demand Webinars Watched",      ["webinar_ondemand_watched", "webinar_watched"],             "#a78bfa")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Download size={18} />}      label="Guides & Docs Downloads"        value={stats?.guideDownloaded ?? 0}  color="green"  subtitle={`last ${days}d`} onClick={() => openDrawer("Guides & Docs Downloads",         ["guide_downloaded"],                                        "#4ade80")} />
        <StatCard icon={<Search size={18} />}        label="Total Searches"                 value={stats?.searches ?? 0}         color="teal"   subtitle={`last ${days}d`} onClick={() => openDrawer("Total Searches",                  ["search"],                                                  "#2dd4bf")} />
        <StatCard icon={<MessageSquare size={18} />} label="WAVV AI Conversations"          value={stats?.aiChats ?? 0}          color="purple" subtitle={`last ${days}d`} onClick={() => openDrawer("WAVV AI Conversations",           ["ai_chat"],                                                 "#a78bfa")} />
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

      {/* ── Stat Detail Drawer ── */}
      {drawerMeta && (
        <StatDetailDrawer
          label={drawerMeta.label}
          eventTypes={drawerMeta.eventTypes}
          color={drawerMeta.color}
          days={days}
          onClose={() => setDrawerMeta(null)}
        />
      )}
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

// ─── User Profile Drawer ─────────────────────────────────────────────────────
function UserProfileDrawer({
  userId,
  onClose,
  onAction,
  isSuperAdmin,
  isSelf,
}: {
  userId: number;
  onClose: () => void;
  onAction: (action: "promote_admin" | "promote_super" | "demote" | "remove", userId: number, userName: string, currentRole: string) => void;
  isSuperAdmin: boolean;
  isSelf: boolean;
}) {
  const { data: stats, isLoading } = trpc.admin.getUserStats.useQuery({ userId });

  const initials = stats?.name ? stats.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  const statItems = stats ? [
    { label: "Lessons Started", value: stats.lessonsStarted, color: "#38bdf8" },
    { label: "Lessons Completed", value: stats.lessonsCompleted, color: "#4ade80" },
    { label: "Courses Started", value: stats.coursesStarted, color: "#f59e0b" },
  ] : [];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
        <DialogHeader>
          <DialogTitle className="text-white">User Profile</DialogTitle>
          <DialogDescription className="text-gray-500 text-xs">Activity and account details</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin w-6 h-6 border-2 border-[#0074F4] border-t-transparent rounded-full" />
          </div>
        ) : stats ? (
          <div className="space-y-5 py-2">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0074F4, #67C728)" }}
              >
                {initials}
              </div>
              <div>
                <p className="text-white font-semibold text-base">{stats.name ?? "—"}</p>
                <p className="text-gray-400 text-xs">{stats.email ?? "—"}</p>
                <div className="mt-1">
                  {stats.role === "super_admin" ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(232,121,249,0.15)", color: "#e879f9" }}>Super Admin</span>
                  ) : stats.role === "admin" ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>Admin</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(156,163,175,0.15)", color: "#9ca3af" }}>User</span>
                  )}
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-gray-500 mb-0.5">Member Since</p>
                <p className="text-white font-medium">{stats.createdAt ? new Date(stats.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</p>
              </div>
              <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-gray-500 mb-0.5">Last Active</p>
                <p className="text-white font-medium">{stats.lastSignedIn ? new Date(stats.lastSignedIn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</p>
              </div>
            </div>

            {/* Activity stats */}
            <div className="grid grid-cols-3 gap-2">
              {statItems.map(({ label, value, color }) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* Actions — always show for non-self; Demote only for super_admin */}
            {!isSelf && (
              <div className="flex flex-wrap gap-2 pt-1">
                {isSuperAdmin && stats.role === "user" && (
                  <Button size="sm" className="text-xs h-7 px-3" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
                    onClick={() => { onAction("promote_admin", stats.id, stats.name ?? stats.email ?? "User", stats.role); onClose(); }}>
                    <Shield className="h-3 w-3 mr-1" /> Make Admin
                  </Button>
                )}
                {stats.role === "admin" && (
                  <>
                    {isSuperAdmin && (
                      <Button size="sm" className="text-xs h-7 px-3" style={{ background: "rgba(232,121,249,0.15)", color: "#e879f9", border: "1px solid rgba(232,121,249,0.3)" }}
                        onClick={() => { onAction("promote_super", stats.id, stats.name ?? stats.email ?? "User", stats.role); onClose(); }}>
                        <SuperAdminIcon size={12} /><span className="ml-1">Promote to Super Admin</span>
                      </Button>
                    )}
                    {/* Demote is only available to super_admin — regular admin sees Remove only */}
                    {isSuperAdmin && (
                      <Button size="sm" className="text-xs h-7 px-3 text-gray-400 hover:text-white" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                        onClick={() => { onAction("demote", stats.id, stats.name ?? stats.email ?? "User", stats.role); onClose(); }}>
                        <ShieldOff className="h-3 w-3 mr-1" /> Demote
                      </Button>
                    )}
                  </>
                )}
                {stats.role === "super_admin" && isSuperAdmin && (
                  <Button size="sm" className="text-xs h-7 px-3 text-gray-400 hover:text-white" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onClick={() => { onAction("demote", stats.id, stats.name ?? stats.email ?? "User", stats.role); onClose(); }}>
                    <ShieldOff className="h-3 w-3 mr-1" /> Demote
                  </Button>
                )}
                <Button size="sm" className="text-xs h-7 px-3 text-red-400 hover:text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
                  onClick={() => { onAction("remove", stats.id, stats.name ?? stats.email ?? "User", stats.role); onClose(); }}>
                  <Trash2 className="h-3 w-3 mr-1" /> Remove
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-6 text-center">User not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function UsersTab() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [profileUserId, setProfileUserId] = useState<number | null>(null);
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

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ name: "", email: "", role: "user" as "user" | "admin" | "super_admin" });
  const [inviteLinkModal, setInviteLinkModal] = useState<{ open: boolean; url: string; name: string }>({
    open: false, url: "", name: "",
  });
  const addUserMutation = trpc.admin.addUser.useMutation({
    onSuccess: (data) => {
      const userName = addUserForm.name;
      setAddUserOpen(false);
      setAddUserForm({ name: "", email: "", role: "user" });
      refetch();
      if (data.inviteUrl) {
        setInviteLinkModal({ open: true, url: data.inviteUrl, name: userName });
      } else {
        toast.success(`User ${userName} added successfully.`);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  // Magic link invite
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" });
  const [inviteResult, setInviteResult] = useState<{ link: string; name: string } | null>(null);
  const inviteTeamMember = trpc.admin.inviteTeamMember.useMutation({
    onSuccess: (data) => {
      setInviteResult({ link: data.inviteLink, name: inviteForm.name });
      setInviteForm({ name: "", email: "" });
      refetch();
    },
    onError: (e) => toast.error(e.message),
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
    // Only show admins and super_admins — no public users in this panel
    let list = (users ?? []).filter((u) => u.role === "admin" || u.role === "super_admin");
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (u) => (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)
    );
  }, [users, search, roleFilter]);

  const superAdminCount = useMemo(() => (users ?? []).filter((u) => u.role === "super_admin").length, [users]);
  const adminCount = useMemo(() => (users ?? []).filter((u) => u.role === "admin").length, [users]);
  const statCards: { filter: RoleFilter; label: string; value: number; iconEl: React.ReactNode; color: string; bg: string; activeBorder: string }[] = [
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
        <h2 className="text-base font-semibold text-white">Team Access</h2>
        <div className="flex items-center gap-2">

          <button
            onClick={exportUsersCSV}
            disabled={!users || users.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition disabled:opacity-40"
            style={{ background: "rgba(6,182,212,0.1)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.2)" }}
          >
            <FileDown size={13} />
            Export{roleFilter !== "all" ? ` ${roleFilter === "super_admin" ? "Super Admins" : roleFilter === "admin" ? "Admins" : "Users"}` : " All"}
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => { setInviteOpen(true); setInviteResult(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition hover:opacity-90"
              style={{ background: "rgba(0,116,244,0.12)", color: "#60a5fa", border: "1px solid rgba(0,116,244,0.25)" }}
            >
              <UserPlus size={13} /> Invite Team Member
            </button>
          )}
        </div>
      </div>

      {/* Clickable stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s) => {
          const active = roleFilter === s.filter;
          return (
            <button
              key={s.filter}
              onClick={() => setRoleFilter(active ? "all" : s.filter)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: "#1d2230",
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
          style={{ background: "#1d2230", border: "1px solid #2a2a2a", color: "#fff" }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
        <Table>
          <TableHeader>
            <TableRow style={{ background: "#1d2230", borderBottom: "1px solid #2a2a2a" }}>
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
                  <TableRow key={u.id} className="cursor-pointer hover:bg-white/5 transition" onClick={() => setProfileUserId(u.id)} style={{ borderBottom: "1px solid #1e1e1e", background: isSelf ? "rgba(0,116,244,0.05)" : "transparent" }}>
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

                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell>
                      {isSelf ? (
                        <span className="text-xs text-gray-600">—</span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">

                          {isSuperAdmin && u.role === "admin" && (
                            <>
                              <button
                                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors"
                                style={{ background: "rgba(232,121,249,0.12)", color: "#e879f9", border: "1px solid rgba(232,121,249,0.25)" }}
                                onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, action: "promote_super" })}>
                                <SuperAdminIcon size={12} />
                                <span>Promote to Super Admin</span>
                              </button>
                              <button
                                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors"
                                style={{ background: "rgba(156,163,175,0.1)", color: "#9ca3af", border: "1px solid rgba(156,163,175,0.2)" }}
                                onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, action: "demote" })}>
                                <ShieldOff className="h-3 w-3 flex-shrink-0" /> Demote
                              </button>
                            </>
                          )}
                          {isSuperAdmin && u.role === "super_admin" && (
                            <button
                              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors"
                              style={{ background: "rgba(156,163,175,0.1)", color: "#9ca3af", border: "1px solid rgba(156,163,175,0.2)" }}
                              onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, action: "demote" })}>
                              <ShieldOff className="h-3 w-3 flex-shrink-0" /> Demote
                            </button>
                          )}
                          {/* Remove button — super_admin only */}
                          {isSuperAdmin && (
                            <button
                              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                              onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, action: "remove" })}>
                              <Trash2 className="h-3 w-3 flex-shrink-0" /> Remove
                            </button>
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

      {/* User Profile Drawer */}
      {profileUserId !== null && (
        <UserProfileDrawer
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
          isSuperAdmin={isSuperAdmin}
          isSelf={profileUserId === currentUser?.id}
          onAction={(action, userId, userName, currentRole) => {
            setConfirmDialog({ open: true, userId, userName, currentRole, action });
          }}
        />
      )}

      {/* Confirm dialog */}
      <Dialog open={!!confirmDialog?.open} onOpenChange={(open) => { if (!open) setConfirmDialog(null); }}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
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

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={(open) => { if (!open) { setAddUserOpen(false); setAddUserForm({ name: "", email: "", role: "user" }); } }}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Add User</DialogTitle>
            <DialogDescription className="text-gray-400">Manually create a user account. An invite link will be generated for them to set their password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Full Name</label>
              <Input
                value={addUserForm.name}
                onChange={(e) => setAddUserForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Jane Smith"
                className="bg-[#111] border-[#2a2a2a] text-white placeholder:text-gray-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email Address</label>
              <Input
                type="email"
                value={addUserForm.email}
                onChange={(e) => setAddUserForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
                className="bg-[#111] border-[#2a2a2a] text-white placeholder:text-gray-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</label>
              <select
                value={addUserForm.role}
                onChange={(e) => setAddUserForm(f => ({ ...f, role: e.target.value as "user" | "admin" | "super_admin" }))}
                className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: "#111", border: "1px solid #2a2a2a" }}
              >
                <option value="user">Standard User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddUserOpen(false)} className="text-gray-400">Cancel</Button>
            <Button
              onClick={() => {
                if (!addUserForm.name.trim() || !addUserForm.email.trim()) { toast.error("Name and email are required."); return; }
                addUserMutation.mutate({ ...addUserForm, origin: window.location.origin });
              }}
              disabled={addUserMutation.isPending || !addUserForm.name.trim() || !addUserForm.email.trim()}
              style={{ background: "#4ade80", color: "#000" }}
              className="font-semibold hover:opacity-90"
            >
              {addUserMutation.isPending ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Invite Link Modal ── */}
      <Dialog open={inviteLinkModal.open} onOpenChange={(open) => { if (!open) setInviteLinkModal({ open: false, url: "", name: "" }); }}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus size={18} style={{ color: "#4ade80" }} />
              User Added — Share Invite Link
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              <strong className="text-white">{inviteLinkModal.name}</strong> has been added. Send them this link to claim their account and set a password. It expires in 72 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div
              className="flex items-center gap-2 p-3 rounded-lg text-xs font-mono break-all"
              style={{ background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#60a5fa" }}
            >
              <span className="flex-1 select-all">{inviteLinkModal.url}</span>
            </div>
            <Button
              className="w-full font-semibold"
              style={{ background: "#0074F4", color: "#fff" }}
              onClick={() => {
                navigator.clipboard.writeText(inviteLinkModal.url);
                toast.success("Invite link copied to clipboard!");
              }}
            >
              Copy Invite Link
            </Button>
            <p className="text-xs text-gray-500 text-center">Paste this link in Slack, email, or any message to the user.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteLinkModal({ open: false, url: "", name: "" })} className="text-gray-400">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Invite Team Member Dialog (magic link) ── */}
      <Dialog open={inviteOpen} onOpenChange={(open) => { if (!open) { setInviteOpen(false); setInviteResult(null); setInviteForm({ name: "", email: "" }); } }}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus size={18} style={{ color: "#60a5fa" }} />
              Invite Team Member
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter their name and email. They'll receive a one-click login link — no password needed.
            </DialogDescription>
          </DialogHeader>

          {inviteResult ? (
            <div className="py-2 space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "rgba(103,199,40,0.08)", border: "1px solid rgba(103,199,40,0.2)" }}>
                <CheckCircle2 size={16} style={{ color: "#67C728", flexShrink: 0 }} />
                <p className="text-sm text-white"><strong>{inviteResult.name}</strong> has been added as an admin.</p>
              </div>
              <p className="text-xs text-gray-400">Copy this login link and send it to them via Slack or email. It expires in 24 hours and can only be used once.</p>
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-xs font-mono break-all"
                style={{ background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#60a5fa" }}
              >
                <span className="flex-1 select-all">{inviteResult.link}</span>
              </div>
              <Button
                className="w-full font-semibold"
                style={{ background: "#0074F4", color: "#fff" }}
                onClick={() => {
                  navigator.clipboard.writeText(inviteResult!.link);
                  toast.success("Login link copied to clipboard!");
                }}
              >
                Copy Login Link
              </Button>
            </div>
          ) : (
            <div className="py-2 space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Full Name</label>
                <Input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. John Smith"
                  className="bg-black/30 border-white/10 text-white placeholder:text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Work Email</label>
                <Input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. john@wavv.com"
                  className="bg-black/30 border-white/10 text-white placeholder:text-gray-600"
                />
              </div>
              <p className="text-xs text-gray-500">They will be added as an <strong className="text-gray-300">Admin</strong> with full content management access.</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => { setInviteOpen(false); setInviteResult(null); setInviteForm({ name: "", email: "" }); }} className="text-gray-400">Close</Button>
            {!inviteResult && (
              <Button
                disabled={inviteTeamMember.isPending || !inviteForm.name.trim() || !inviteForm.email.trim()}
                onClick={() => {
                  if (!inviteForm.name.trim() || !inviteForm.email.trim()) { toast.error("Name and email are required."); return; }
                  inviteTeamMember.mutate({ name: inviteForm.name.trim(), email: inviteForm.email.trim().toLowerCase() });
                }}
                style={{ background: "#0074F4", color: "#fff" }}
              >
                {inviteTeamMember.isPending ? "Sending…" : "Send Login Link"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// ─── Shared helpers ────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, subtitle, onClick }: {
  icon: React.ReactNode; label: string; value: number; color: string; subtitle?: string;
  onClick?: () => void;
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
    <div
      className={`rounded-xl p-4 flex items-start gap-3 transition-all${onClick ? " cursor-pointer hover:ring-2 hover:ring-white/20 hover:scale-[1.02] active:scale-[0.99]" : ""}`}
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
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

function exportTileCSV(
  label: string,
  rows: Array<{
    id: number;
    eventType: string;
    resourceType: string | null;
    resourceId: number | null;
    metadata: string | null;
    createdAt: Date | null;
    userId: number | null;
    userName: string | null;
    userEmail: string | null;
  }>,
  days: number
) {
  const safeName = label.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const lines: string[] = [];
  lines.push(`WAVV Analytics Export: ${label}`);
  lines.push(`Period: Last ${days} days`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push(`Total Events: ${rows.length}`);
  lines.push("");
  lines.push("Timestamp,User Name,User Email,Event Type,Resource Type,Resource ID,Metadata");
  rows.forEach((row) => {
    const ts = row.createdAt ? new Date(row.createdAt).toLocaleString() : "";
    const name = (row.userName ?? "Anonymous").replace(/,/g, " ");
    const email = row.userEmail ?? "";
    const evtType = row.eventType.replace(/_/g, " ");
    const resType = row.resourceType ?? "";
    const resId = row.resourceId != null ? String(row.resourceId) : "";
    const meta = row.metadata ? `"${String(row.metadata).replace(/"/g, '""')}"` : "";
    lines.push(`${ts},${name},${email},${evtType},${resType},${resId},${meta}`);
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wavv-${safeName}-${days}d-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
  onDeleteCourse,
  onAddVideo,
  onReorderLesson,
}: {
  course: { id: number; title: string; category: string; published: boolean; tags?: string | null };
  lessons: Array<{
    id: number; title: string; description?: string | null; courseTitle?: string;
    courseCategory?: string; inactiveReason?: string | null; videoUrl?: string | null;
    fileUrl?: string | null; tags?: string | null; published: boolean;
  }>;
  onDeactivateLesson: (lesson: { id: number; title: string }) => void;
  onActivateLesson: (id: number) => void;
  onDeleteCourse?: (id: number, title: string) => void;
  onAddVideo?: () => void;
  onReorderLesson?: (id: number, direction: "up" | "down", siblingId: number) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [editingTags, setEditingTags] = React.useState(false);
  const [renamingTitle, setRenamingTitle] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState(course.title);
  const utils = trpc.useUtils();
  const updateCourse = trpc.academy.adminUpdateCourse.useMutation({
    onSuccess: () => {
      utils.academy.adminGetAllCourses.invalidate();
      toast.success("Section updated");
    },
    onError: () => toast.error("Failed to update section"),
  });

  const sectionTags = parseTagList(course.tags);

  function saveRename() {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === course.title) { setRenamingTitle(false); return; }
    updateCourse.mutate({ id: course.id, data: { title: trimmed } });
    setRenamingTitle(false);
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
      {/* Section header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        style={{ background: "#1d2230" }}
        onClick={() => !renamingTitle && setOpen((v) => !v)}
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
        <div className="flex-1 min-w-0" onClick={(e) => renamingTitle && e.stopPropagation()}>
          {renamingTitle ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                className="flex-1 bg-[#111] border border-blue-500 rounded-lg px-2.5 py-1 text-sm text-white outline-none"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") { setRenamingTitle(false); setRenameValue(course.title); } }}
                onClick={(e) => e.stopPropagation()}
              />
              <button type="button" onClick={(e) => { e.stopPropagation(); saveRename(); }}
                className="p-1.5 rounded-lg transition hover:opacity-80"
                style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}
                title="Save rename"
              ><Check size={13} /></button>
              <button type="button" onClick={(e) => { e.stopPropagation(); setRenamingTitle(false); setRenameValue(course.title); }}
                className="p-1.5 rounded-lg transition hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid #2a2a2a" }}
                title="Cancel"
              ><X size={13} /></button>
            </div>
          ) : (
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
          )}
          {!renamingTitle && (
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
          )}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Rename */}
          <button
            type="button"
            onClick={() => { setRenamingTitle(true); setRenameValue(course.title); }}
            className="p-1.5 rounded-lg transition hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid #2a2a2a" }}
            title="Rename section"
          >
            <Pencil size={13} />
          </button>
          {/* Tag section */}
          <button
            type="button"
            onClick={() => setEditingTags((v) => !v)}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg transition hover:opacity-80"
            style={{ background: editingTags ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)", color: editingTags ? "#fbbf24" : "#9ca3af", border: `1px solid ${editingTags ? "rgba(251,191,36,0.3)" : "#252d3d"}` }}
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
          {/* Delete — only shown for inactive (hidden) sections */}
          {!course.published && onDeleteCourse && (
            <button
              type="button"
              onClick={() => onDeleteCourse(course.id, course.title)}
              className="p-1.5 rounded-lg transition hover:opacity-80"
              style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
              title="Permanently delete this section"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Section tag editor (inline, below header) */}
      {editingTags && (
        <div className="px-4 pb-3" style={{ background: "#1d2230" }}>
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
            lessons.map((lesson, lessonIdx) => {
              const prevLesson = lessons[lessonIdx - 1];
              const nextLesson = lessons[lessonIdx + 1];
              return (
                <div key={lesson.id} className="relative group/lesson px-3 py-2" style={{ background: "#141414" }}>
                  {/* Lesson reorder arrows */}
                  {onReorderLesson && (
                    <div className="absolute -left-5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                      <button
                        type="button"
                        disabled={!prevLesson}
                        onClick={() => prevLesson && onReorderLesson(lesson.id, "up", prevLesson.id)}
                        className="p-0.5 rounded text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition"
                        title="Move video up"
                      ><ArrowUp size={10} /></button>
                      <button
                        type="button"
                        disabled={!nextLesson}
                        onClick={() => nextLesson && onReorderLesson(lesson.id, "down", nextLesson.id)}
                        className="p-0.5 rounded text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition"
                        title="Move video down"
                      ><ArrowDown size={10} /></button>
                    </div>
                  )}
                  <LessonRow
                    lesson={lesson}
                    isActive={lesson.published}
                    onDeactivate={() => onDeactivateLesson({ id: lesson.id, title: lesson.title })}
                    onActivate={() => onActivateLesson(lesson.id)}
                  />
                </div>
              );
            })
          )}
          {/* Add Video button */}
          {onAddVideo && (
            <div className="px-3 py-2" style={{ background: "#141414" }}>
              <button
                type="button"
                onClick={onAddVideo}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition hover:opacity-90"
                style={{ background: "rgba(0,116,244,0.12)", color: "#60a5fa", border: "1px dashed rgba(0,116,244,0.4)" }}
              >
                <Plus size={11} /> Add Video
              </button>
            </div>
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
  onAddSection,
  onAddVideo,
  onReorderCourse,
  onReorderLesson,
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
  onAddSection?: (categoryKey: string) => void;
  onAddVideo?: (courseId: number, courseTitle: string) => void;
  onReorderCourse?: (id: number, direction: "up" | "down", siblingId: number) => void;
  onReorderLesson?: (id: number, direction: "up" | "down", siblingId: number) => void;
  accentColor: string;
}) {
  const [open, setOpen] = React.useState(false);
  const displayLabel = categoryLabel ?? categoryKey;

  return (
    <div>
      {/* Category banner header — mirrors Academy landing page */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full relative overflow-hidden rounded-xl mb-3 group"
        style={{ border: `1px solid ${accentColor}55`, minHeight: "140px" }}
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
        <div className="relative flex flex-col justify-center h-full px-8 py-5 gap-1 text-left">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>WAVV Academy</p>
          <div className="flex items-center gap-2">
            {open ? <ChevronDown size={15} style={{ color: accentColor }} /> : <ChevronRightIcon size={15} style={{ color: accentColor }} />}
            <h2 className="text-2xl font-extrabold text-white leading-tight">{displayLabel}</h2>
          </div>
          {categorySubtitle && <p className="text-sm text-gray-300 mb-1">{categorySubtitle}</p>}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: `${accentColor}25`, color: accentColor, border: `1px solid ${accentColor}50` }}>
              {courses.length} section{courses.length !== 1 ? "s" : ""}
            </span>
            {videoCount !== undefined && (
              <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)", color: "#aaa", border: "1px solid #333" }}>
                {videoCount} video{videoCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </button>
      {open && (
        <div className="space-y-2 ml-8">
          {courses.map((course, idx) => {
            const courseLessons = allLessons.filter((l) => l.courseId === course.id);
            const prevCourse = courses[idx - 1];
            const nextCourse = courses[idx + 1];
            return (
              <div key={course.id} className="relative group/section">
                {/* Reorder arrows — super_admin only, shown on hover */}
                {onReorderCourse && (
                  <div className="absolute -left-7 top-2 flex flex-col gap-0.5 opacity-0 group-hover/section:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={!prevCourse}
                      onClick={() => prevCourse && onReorderCourse(course.id, "up", prevCourse.id)}
                      className="p-0.5 rounded text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition"
                      title="Move section up"
                    ><ArrowUp size={12} /></button>
                    <button
                      type="button"
                      disabled={!nextCourse}
                      onClick={() => nextCourse && onReorderCourse(course.id, "down", nextCourse.id)}
                      className="p-0.5 rounded text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition"
                      title="Move section down"
                    ><ArrowDown size={12} /></button>
                  </div>
                )}
                <SectionRow2
                  course={course}
                  lessons={courseLessons}
                  onDeactivateLesson={onDeactivateLesson}
                  onActivateLesson={onActivateLesson}
                  onAddVideo={onAddVideo ? () => onAddVideo(course.id, course.title) : undefined}
                  onReorderLesson={onReorderLesson}
                />
              </div>
            );
          })}
          {/* Add Section button */}
          {onAddSection && (
            <button
              type="button"
              onClick={() => onAddSection(categoryKey)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium transition hover:opacity-90"
              style={{ background: `${accentColor}12`, color: accentColor, border: `1px dashed ${accentColor}40` }}
            >
              <Plus size={13} /> Add Section
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── InactiveCategoryBlock ────────────────────────────────────────────────
// Extracted so useState can be called at top level (Rules of Hooks)
function InactiveCategoryBlock({
  categoryKey, label, subtitle, color, banner,
  inactiveCourses, inactiveLessons, allLessons,
  onDeactivateLesson, onActivateLesson, onDeleteCourse, onDeleteLesson,
}: {
  categoryKey: string; label: string; subtitle?: string; color: string; banner?: string;
  inactiveCourses: Array<{ id: number; title: string; category: string; published: boolean; sortOrder: number | null }>;
  inactiveLessons: Array<{ id: number; title: string; courseId: number; published: boolean; courseTitle?: string | null; [key: string]: unknown }>;
  allLessons: Array<{
    id: number; title: string; description?: string | null; courseTitle?: string;
    courseCategory?: string; inactiveReason?: string | null; videoUrl?: string | null;
    fileUrl?: string | null; tags?: string | null; published: boolean; courseId: number;
  }>;
  onDeactivateLesson: (lesson: { id: number; title: string }) => void;
  onActivateLesson: (id: number) => void;
  onDeleteCourse: (id: number, title: string) => void;
  onDeleteLesson: (id: number, title: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const totalInactive = inactiveCourses.length + inactiveLessons.length;
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full relative overflow-hidden rounded-xl mb-3 group"
        style={{ border: `1px solid ${color}30`, minHeight: "110px", opacity: 0.80 }}
      >
        {banner && <img src={banner} alt={label} className="absolute inset-0 w-full h-full object-cover" aria-hidden />}
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.80) 60%, rgba(0,0,0,0.60) 100%)` }} />
        <div className="relative flex flex-col justify-center h-full px-8 py-5 gap-1 text-left">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>WAVV Academy</p>
          <div className="flex items-center gap-2">
            {open ? <ChevronDown size={15} style={{ color }} /> : <ChevronRightIcon size={15} style={{ color }} />}
            <h2 className="text-2xl font-extrabold text-white leading-tight">{label}</h2>
          </div>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] font-semibold px-3 py-1 rounded-full"
              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
              {totalInactive} inactive
            </span>
          </div>
        </div>
      </button>
      {open && (
        <div className="space-y-2 ml-8">
          {inactiveCourses.map((course) => {
            const courseLessons = allLessons.filter((l) => l.courseId === course.id);
            return (
              <SectionRow2
                key={course.id}
                course={course}
                lessons={courseLessons}
                onDeactivateLesson={onDeactivateLesson}
                onActivateLesson={onActivateLesson}
                onDeleteCourse={onDeleteCourse}
              />
            );
          })}
          {inactiveLessons.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
              <div className="px-4 py-2" style={{ background: "#1d2230", borderBottom: "1px solid #222" }}>
                <p className="text-[11px] font-semibold text-gray-400">Deactivated Videos ({inactiveLessons.length})</p>
              </div>
              <div className="divide-y" style={{ borderColor: "#222" }}>
                {inactiveLessons.map((lesson) => (
                  <div key={lesson.id} className="px-4 py-3" style={{ background: "#141414" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
                        Inactive
                      </span>
                      <span className="text-[10px] text-gray-500">{lesson.courseTitle ?? ""}</span>
                    </div>
                    <LessonRow
                      lesson={lesson as Parameters<typeof LessonRow>[0]["lesson"]}
                      isActive={false}
                      onActivate={() => onActivateLesson(lesson.id)}
                      onDelete={() => onDeleteLesson(lesson.id, lesson.title)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
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
  const deleteLesson = trpc.academy.adminDeleteLesson.useMutation({
    onSuccess: () => {
      utils.academy.adminGetAllLessons.invalidate();
      toast.success("Video permanently deleted");
    },
    onError: () => toast.error("Failed to delete video"),
  });
  const deleteCourse = trpc.academy.adminDeleteCourse.useMutation({
    onSuccess: () => {
      utils.academy.adminGetAllCourses.invalidate();
      toast.success("Section permanently deleted");
    },
    onError: () => toast.error("Failed to delete section"),
  });

  // Create section mutation
  const createCourse = trpc.academy.adminCreateCourse.useMutation({
    onSuccess: () => {
      utils.academy.adminGetAllCourses.invalidate();
      toast.success("Section created");
      setAddSectionDialog(null);
    },
    onError: () => toast.error("Failed to create section"),
  });

  // Create lesson mutation
  const createLesson = trpc.academy.adminCreateLesson.useMutation({
    onSuccess: () => {
      utils.academy.adminGetAllLessons.invalidate();
      toast.success("Video added");
      setAddVideoDialog(null);
    },
    onError: () => toast.error("Failed to add video"),
  });

  // Reorder mutations
  const reorderCourse = trpc.academy.reorderCourses.useMutation({
    onSuccess: () => utils.academy.adminGetAllCourses.invalidate(),
    onError: () => toast.error("Failed to reorder section"),
  });
  const reorderLesson = trpc.academy.reorderLessons.useMutation({
    onSuccess: () => utils.academy.adminGetAllLessons.invalidate(),
    onError: () => toast.error("Failed to reorder video"),
  });

  // Dialog state: Add Section
  const [addSectionDialog, setAddSectionDialog] = useState<{ categoryKey: string } | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");

  // Dialog state: Add Video
  const [addVideoDialog, setAddVideoDialog] = useState<{ courseId: number; courseTitle: string } | null>(null);
  const [newVideoForm, setNewVideoForm] = useState({ title: "", videoUrl: "", description: "", durationMinutes: "", tags: "" });

  // Derive a Loom embed URL from a share URL for preview
  function getLoomEmbedUrl(url: string): string | null {
    const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (match) return `https://www.loom.com/embed/${match[1]}`;
    return null;
  }

  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [pendingLesson, setPendingLesson] = useState<{ id: number; title: string } | null>(null);
  const [reasonInput, setReasonInput] = useState("");

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState<{ type: "lesson" | "course"; id: number; title: string } | null>(null);
  // Inactive panel collapsed by default
  const [showInactive, setShowInactive] = useState(false);

  function handleAddSection(categoryKey: string) {
    setNewSectionTitle("");
    setNewSectionDescription("");
    setAddSectionDialog({ categoryKey });
  }

  function confirmAddSection() {
    if (!addSectionDialog || !newSectionTitle.trim()) return;
    createCourse.mutate({
      title: newSectionTitle.trim(),
      category: addSectionDialog.categoryKey as "Onboarding" | "How-To" | "Strategy and Best Practices",
      description: newSectionDescription.trim() || "",
      sortOrder: 99,
    });
  }

  function handleAddVideo(courseId: number, courseTitle: string) {
    setNewVideoForm({ title: "", videoUrl: "", description: "", durationMinutes: "", tags: "" });
    setAddVideoDialog({ courseId, courseTitle });
  }

  function confirmAddVideo() {
    if (!addVideoDialog || !newVideoForm.title.trim()) return;
    createLesson.mutate({
      courseId: addVideoDialog.courseId,
      title: newVideoForm.title.trim(),
      videoUrl: newVideoForm.videoUrl.trim() || undefined,
      description: newVideoForm.description.trim() || undefined,
      durationMinutes: newVideoForm.durationMinutes ? parseInt(newVideoForm.durationMinutes) : undefined,
      sortOrder: 99,
    });
  }

  function handleReorderCourse(id: number, _direction: "up" | "down", siblingId: number) {
    reorderCourse.mutate({ id1: id, id2: siblingId });
  }

  function handleReorderLesson(id: number, _direction: "up" | "down", siblingId: number) {
    reorderLesson.mutate({ id1: id, id2: siblingId });
  }

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

  function handleDeleteLesson(id: number, title: string) {
    setDeleteDialog({ type: "lesson", id, title });
  }

  function handleDeleteCourse(id: number, title: string) {
    setDeleteDialog({ type: "course", id, title });
  }

  function confirmDelete() {
    if (!deleteDialog) return;
    if (deleteDialog.type === "lesson") deleteLesson.mutate({ id: deleteDialog.id });
    else deleteCourse.mutate({ id: deleteDialog.id });
    setDeleteDialog(null);
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
      banner: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663417013740/JHIRajYPPlnohilQ.png",
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
    <div className="space-y-0">
      {/* ── Top-level Add Section bar ── */}
      <div className="flex items-center gap-3 mb-6 p-3 rounded-xl" style={{ background: "rgba(0,116,244,0.06)", border: "1px solid rgba(0,116,244,0.18)" }}>
        <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">Add Section to:</span>
        <div className="flex flex-wrap gap-2 flex-1">
          {ACADEMY_CATEGORIES.map(({ key, label, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleAddSection(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
              style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
            >
              <Plus size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 1: Live Sections & Courses ── */}
      <div className="pb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e80" }} />
            <h2 className="text-base font-bold text-white tracking-tight">Live Sections &amp; Courses</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">Everything currently visible on WAVV Academy</span>
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
                onAddSection={handleAddSection}
                onAddVideo={handleAddVideo}
                onReorderCourse={handleReorderCourse}
                onReorderLesson={handleReorderLesson}
                accentColor={color}
              />
            );
          })}
        </div>
      </div>

      {/* ── Divider between Live and Inactive ── */}
      <div className="relative flex items-center py-6">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #2a2a2a 20%, #3a3a3a 50%, #2a2a2a 80%, transparent)" }} />
        <div className="mx-4 flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4b5563" }} />
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Inactive</span>
        </div>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #2a2a2a 20%, #3a3a3a 50%, #2a2a2a 80%, transparent)" }} />
      </div>

      {/* ── Section 2: Inactive Sections / Videos ── */}
      <div className="pt-2">
        {/* Collapsible header — closed by default */}
        <button
          onClick={() => setShowInactive((v) => !v)}
          className="flex items-center gap-3 mb-5 w-full text-left"
        >
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "#4b5563" }} />
          <h2 className="text-base font-bold text-white tracking-tight flex-shrink-0">Inactive Sections / Videos</h2>
          <span className="text-xs text-gray-500 font-medium ml-2">Hidden from users — deactivate first, then delete permanently</span>
          <span className="ml-auto flex-shrink-0" style={{ color: "#6b7280" }}>
            {showInactive ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </button>
        {showInactive && (
          <>
            {!hasInactive ? (
              <div
                className="rounded-xl px-5 py-6 text-center"
                style={{ background: "#141414", border: "1px solid #2a2a2a" }}
              >
                <p className="text-sm text-gray-500">No inactive sections or videos.</p>
                <p className="text-xs text-gray-600 mt-1">Use the Hide/Deactivate controls on any section or video above to move it here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {ACADEMY_CATEGORIES.map(({ key, label, subtitle, color, banner }) => {
                  const catInactiveCourses = inactiveCourses.filter((c) => c.category === key);
                  const catCourseIds = new Set([...(byCategory[key] ?? []).map((c) => c.id), ...catInactiveCourses.map((c) => c.id)]);
                  const catInactiveLessons = inactiveLessons.filter((l) => catCourseIds.has(l.courseId));
                  return (
                    <InactiveCategoryBlock
                      key={key}
                      categoryKey={key}
                      label={label}
                      subtitle={subtitle}
                      color={color}
                      banner={banner}
                      inactiveCourses={catInactiveCourses}
                      inactiveLessons={catInactiveLessons}
                      allLessons={lessons}
                      onDeactivateLesson={handleDeactivate}
                      onActivateLesson={handleActivate}
                      onDeleteCourse={handleDeleteCourse}
                      onDeleteLesson={handleDeleteLesson}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Add Section dialog ── */}
      <Dialog open={!!addSectionDialog} onOpenChange={(open) => !open && setAddSectionDialog(null)}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Add New Section</DialogTitle>
            <DialogDescription className="text-gray-400">
              Adding to <span className="font-medium text-gray-300">{addSectionDialog?.categoryKey}</span>. The section will be live immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Section Title <span className="text-red-400">*</span></label>
              <Input
                placeholder="e.g. Getting Started, Advanced Settings"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="bg-black/30 border-white/10 text-white placeholder:text-gray-600"
                onKeyDown={(e) => e.key === "Enter" && confirmAddSection()}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description (optional)</label>
              <textarea
                placeholder="Brief description of what this section covers"
                value={newSectionDescription}
                onChange={(e) => setNewSectionDescription(e.target.value)}
                rows={2}
                className="w-full rounded-md px-3 py-2 text-sm bg-black/30 border border-white/10 text-white placeholder:text-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddSectionDialog(null)} className="text-gray-400">Cancel</Button>
            <Button
              onClick={confirmAddSection}
              disabled={!newSectionTitle.trim() || createCourse.isPending}
              style={{ background: "#0074F4" }}
              className="text-white hover:opacity-90 disabled:opacity-50"
            >
              {createCourse.isPending ? "Creating..." : "Create Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Video dialog ── */}
      <Dialog open={!!addVideoDialog} onOpenChange={(open) => !open && setAddVideoDialog(null)}>
        <DialogContent className="max-w-lg" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Add Video</DialogTitle>
            <DialogDescription className="text-gray-400">
              Adding to section: <span className="font-medium text-gray-300">{addVideoDialog?.courseTitle}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {/* Title */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Video Title <span className="text-red-400">*</span></label>
              <Input
                placeholder="e.g. Getting Started With Your Single Line Dialer"
                value={newVideoForm.title}
                onChange={(e) => setNewVideoForm((f) => ({ ...f, title: e.target.value }))}
                className="bg-black/30 border-white/10 text-white placeholder:text-gray-600"
                autoFocus
              />
            </div>
            {/* Loom / Video URL + live embed preview */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Loom / Video URL</label>
              <Input
                placeholder="https://www.loom.com/share/abc123..."
                value={newVideoForm.videoUrl}
                onChange={(e) => setNewVideoForm((f) => ({ ...f, videoUrl: e.target.value }))}
                className="bg-black/30 border-white/10 text-white placeholder:text-gray-600"
              />
              {/* Live embed preview — shows as soon as a valid Loom URL is detected */}
              {newVideoForm.videoUrl && getLoomEmbedUrl(newVideoForm.videoUrl) && (
                <div className="mt-2 rounded-lg overflow-hidden" style={{ aspectRatio: "16/9", background: "#000" }}>
                  <iframe
                    src={getLoomEmbedUrl(newVideoForm.videoUrl)!}
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full"
                    title="Loom preview"
                  />
                </div>
              )}
              {newVideoForm.videoUrl && !getLoomEmbedUrl(newVideoForm.videoUrl) && (
                <p className="text-xs text-amber-400 mt-1">Non-Loom URL — will be stored as a link (no embed preview).</p>
              )}
            </div>
            {/* Description */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description (optional)</label>
              <textarea
                placeholder="Brief description of what this video covers"
                value={newVideoForm.description}
                onChange={(e) => setNewVideoForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full rounded-md px-3 py-2 text-sm bg-black/30 border border-white/10 text-white placeholder:text-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* Duration + Tags row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Duration (minutes)</label>
                <Input
                  type="number"
                  placeholder="e.g. 8"
                  min={1}
                  value={newVideoForm.durationMinutes}
                  onChange={(e) => setNewVideoForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                  className="bg-black/30 border-white/10 text-white placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tags (comma-separated)</label>
                <Input
                  placeholder="NEW, MUST WATCH"
                  value={newVideoForm.tags}
                  onChange={(e) => setNewVideoForm((f) => ({ ...f, tags: e.target.value }))}
                  className="bg-black/30 border-white/10 text-white placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddVideoDialog(null)} className="text-gray-400">Cancel</Button>
            <Button
              onClick={confirmAddVideo}
              disabled={!newVideoForm.title.trim() || createLesson.isPending}
              style={{ background: "#0074F4" }}
              className="text-white hover:opacity-90 disabled:opacity-50"
            >
              {createLesson.isPending ? "Adding..." : "Add Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Tags Management panel ── */}
      <TagsManagementPanel />

      {/* ── Deactivate reason dialog ── */}
      <Dialog open={reasonDialogOpen} onOpenChange={setReasonDialogOpen}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
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

      {/* ── PDF Resources Section ── */}
      <SectionResourcesPanel courses={courses} />

      {/* ── Permanent delete confirmation dialog ── */}
      <Dialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #3a1a1a" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle size={16} style={{ color: "#f87171" }} />
              Permanently Delete {deleteDialog?.type === "course" ? "Section" : "Video"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              <span className="font-medium text-gray-200">"{deleteDialog?.title}"</span> will be permanently removed.
              {deleteDialog?.type === "course" && " All videos in this section will also be deleted."}
              {" "}This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialog(null)} className="text-gray-400">
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteLesson.isPending || deleteCourse.isPending}
              style={{ background: "#dc2626" }}
              className="text-white hover:opacity-90 disabled:opacity-50"
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// ─── Section Resources Panel ──────────────────────────────────────────────────
function SectionResourcesPanel({
  courses,
}: {
  courses: Array<{ id: number; title: string; category: string; published: boolean }>;
}) {
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const { data: resources = [], isLoading } = trpc.academy.adminGetSectionResources.useQuery();

  // Upload dialog state
  const [uploadDialog, setUploadDialog] = React.useState(false);
  const [uploadForm, setUploadForm] = React.useState({ courseId: "", label: "", fileName: "", base64: "", mimeType: "" });
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Edit dialog state
  const [editDialog, setEditDialog] = React.useState<{ id: number; label: string; courseId: number } | null>(null);
  const [editLabel, setEditLabel] = React.useState("");
  const [editCourseId, setEditCourseId] = React.useState("");

  const uploadMut = trpc.academy.adminUploadSectionResource.useMutation({
    onSuccess: () => {
      utils.academy.adminGetSectionResources.invalidate();
      toast.success("PDF resource uploaded");
      setUploadDialog(false);
      setUploadForm({ courseId: "", label: "", fileName: "", base64: "", mimeType: "" });
    },
    onError: (e) => toast.error("Upload failed: " + e.message),
  });

  const updateMut = trpc.academy.adminUpdateSectionResource.useMutation({
    onSuccess: () => {
      utils.academy.adminGetSectionResources.invalidate();
      toast.success("PDF resource updated");
      setEditDialog(null);
    },
    onError: () => toast.error("Failed to update"),
  });

  const deleteMut = trpc.academy.adminDeleteSectionResource.useMutation({
    onSuccess: () => {
      utils.academy.adminGetSectionResources.invalidate();
      toast.success("PDF resource deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const reorderMut = trpc.academy.adminReorderSectionResources.useMutation({
    onSuccess: () => utils.academy.adminGetSectionResources.invalidate(),
    onError: () => toast.error("Failed to reorder"),
  });

  const toggleVisibilityMut = trpc.academy.adminToggleSectionResourceVisibility.useMutation({
    onSuccess: () => utils.academy.adminGetSectionResources.invalidate(),
    onError: () => toast.error("Failed to update visibility"),
  });

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!allowed.includes(file.type)) { toast.error("Only PDF, DOCX, or XLSX files are supported"); return; }
    if (file.size > 16 * 1024 * 1024) { toast.error("File must be under 16 MB"); return; }
    const buf = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...Array.from(new Uint8Array(buf))));
    const label = uploadForm.label || file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
    setUploadForm((f) => ({ ...f, fileName: file.name, base64, mimeType: file.type, label }));
    e.target.value = "";
  }

  async function confirmUpload() {
    if (!uploadForm.courseId || !uploadForm.label.trim() || !uploadForm.base64) return;
    setUploading(true);
    try {
      await uploadMut.mutateAsync({
        courseId: parseInt(uploadForm.courseId),
        label: uploadForm.label.trim(),
        base64: uploadForm.base64,
        mimeType: uploadForm.mimeType,
        fileName: uploadForm.fileName,
      });
    } catch { /* handled by onError */ } finally { setUploading(false); }
  }

  function openEditDialog(r: { id: number; label: string; courseId: number }) {
    setEditDialog(r);
    setEditLabel(r.label);
    setEditCourseId(String(r.courseId));
  }

  // Group resources by courseId for display
  const resourcesByCourse = React.useMemo(() => {
    const map: Record<number, typeof resources> = {};
    for (const r of resources) {
      if (!map[r.courseId]) map[r.courseId] = [];
      map[r.courseId].push(r);
    }
    return map;
  }, [resources]);

  // All courses (published + unpublished), sorted by category order — so PDFs on any course are visible
  const CATEGORY_ORDER = ["Onboarding", "How-To", "Strategy and Best Practices"];
  const publishedCourses = courses
    .sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.category);
      const bi = CATEGORY_ORDER.indexOf(b.category);
      return ai !== bi ? ai - bi : a.title.localeCompare(b.title);
    });

  return (
    <div className="mt-10">
      {/* Divider */}
      <div className="relative flex items-center py-6">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #2a2a2a 20%, #3a3a3a 50%, #2a2a2a 80%, transparent)" }} />
        <div className="mx-4 flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#60a5fa" }} />
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">PDF Resources</span>
        </div>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #2a2a2a 20%, #3a3a3a 50%, #2a2a2a 80%, transparent)" }} />
      </div>

      {/* Header + Upload button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white">Section PDF Resources</h2>
          <p className="text-xs text-gray-500 mt-0.5">Standalone PDFs attached to a section — shown below the video list on the Academy page</p>
        </div>
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => { setUploadForm({ courseId: "", label: "", fileName: "", base64: "", mimeType: "" }); setUploadDialog(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90"
            style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)" }}
          >
            <FileUp size={14} /> Upload PDF Resource
          </button>
        )}
      </div>

      {/* Resource list grouped by section */}
      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-xl px-5 py-8 text-center" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <FileText size={28} className="text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No PDF resources yet.</p>
          <p className="text-xs text-gray-600 mt-1">Click “Upload PDF Resource” to add a standalone PDF to any section.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {publishedCourses
            .filter((c) => resourcesByCourse[c.id]?.length > 0)
            .map((course) => {
              const courseResources = resourcesByCourse[course.id] ?? [];
              return (
                <div key={course.id} className="rounded-xl overflow-hidden" style={{ background: "#1d2230", border: "1px solid #252d3d" }}>
                  {/* Section header */}
                  <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(96,165,250,0.06)", borderBottom: "1px solid #252d3d" }}>
                    <FolderOpen size={13} style={{ color: "#60a5fa" }} />
                    <span className="text-xs font-semibold text-gray-300">{course.title}</span>
                    <span className="text-[10px] text-gray-500 ml-auto">{courseResources.length} PDF{courseResources.length !== 1 ? "s" : ""}</span>
                  </div>
                  {/* Resource rows */}
                  <div className="divide-y" style={{ borderColor: "#252d3d" }}>
                    {courseResources.map((r, idx) => {
                      const prev = courseResources[idx - 1];
                      const next = courseResources[idx + 1];
                      return (
                        <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 group/row">
                          {/* Reorder arrows */}
                          {isSuperAdmin && (
                            <div className="flex flex-col gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                              <button
                                type="button"
                                disabled={!prev}
                                onClick={() => prev && reorderMut.mutate({ id1: r.id, id2: prev.id })}
                                className="p-0.5 rounded text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition"
                                title="Move up"
                              ><ArrowUp size={11} /></button>
                              <button
                                type="button"
                                disabled={!next}
                                onClick={() => next && reorderMut.mutate({ id1: r.id, id2: next.id })}
                                className="p-0.5 rounded text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition"
                                title="Move down"
                              ><ArrowDown size={11} /></button>
                            </div>
                          )}
                          {/* PDF icon */}
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
                            <Download size={12} style={{ color: "#60a5fa" }} />
                          </div>
                          {/* Label + filename */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{r.label}</p>
                            <p className="text-[10px] text-gray-500 truncate">{r.fileName}</p>
                          </div>
                          {/* Preview link */}
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg transition hover:opacity-80"
                            style={{ background: "rgba(255,255,255,0.04)", color: "#9ca3af", border: "1px solid #2a2a2a" }}
                            title="Open PDF"
                          >
                            <ExternalLink size={12} />
                          </a>
                          {/* Visibility toggle */}
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => toggleVisibilityMut.mutate({ id: r.id, isHidden: !r.isHidden })}
                              disabled={toggleVisibilityMut.isPending}
                              className="p-1.5 rounded-lg transition hover:opacity-80 disabled:opacity-50"
                              style={r.isHidden
                                ? { background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }
                                : { background: "rgba(255,255,255,0.04)", color: "#9ca3af", border: "1px solid #2a2a2a" }
                              }
                              title={r.isHidden ? "Hidden from users — click to show" : "Visible to users — click to hide"}
                            >
                              {r.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          )}
                          {/* Edit */}
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => openEditDialog({ id: r.id, label: r.label, courseId: r.courseId })}
                              className="p-1.5 rounded-lg transition hover:opacity-80"
                              style={{ background: "rgba(255,255,255,0.04)", color: "#9ca3af", border: "1px solid #2a2a2a" }}
                              title="Edit label / move section"
                            >
                              <Pencil size={12} />
                            </button>
                          )}
                          {/* Delete */}
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => deleteMut.mutate({ id: r.id })}
                              disabled={deleteMut.isPending}
                              className="p-1.5 rounded-lg transition hover:opacity-80 disabled:opacity-50"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                              title="Delete PDF resource"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ── Upload PDF Resource dialog ── */}
      <Dialog open={uploadDialog} onOpenChange={(open) => !open && setUploadDialog(false)}>
        <DialogContent className="max-w-md" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileUp size={16} style={{ color: "#60a5fa" }} /> Upload PDF Resource
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Upload a standalone PDF and assign it to a section. It will appear below the video list on the Academy page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Section picker */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Section <span className="text-red-400">*</span></label>
              <Select value={uploadForm.courseId} onValueChange={(v) => setUploadForm((f) => ({ ...f, courseId: v }))}>
                <SelectTrigger className="bg-black/30 border-white/10 text-white">
                  <SelectValue placeholder="Select a section..." />
                </SelectTrigger>
                <SelectContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
                  {CATEGORY_ORDER.map((cat) => {
                    const catCourses = publishedCourses.filter((c) => c.category === cat);
                    if (catCourses.length === 0) return null;
                    return (
                      <React.Fragment key={cat}>
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">{cat}</div>
                        {catCourses.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)} className="text-white">
                            {c.title}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Label */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Display Label <span className="text-red-400">*</span></label>
              <Input
                placeholder="e.g. Connection Rates vs Conversion Rates Flowchart"
                value={uploadForm.label}
                onChange={(e) => setUploadForm((f) => ({ ...f, label: e.target.value }))}
                className="bg-black/30 border-white/10 text-white placeholder:text-gray-600"
              />
            </div>

            {/* File picker */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">File <span className="text-red-400">*</span></label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.xlsx"
                className="hidden"
                onChange={handleFileSelect}
              />
              {uploadForm.fileName ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.25)" }}>
                  <Download size={13} style={{ color: "#60a5fa" }} />
                  <span className="text-sm text-blue-300 flex-1 truncate">{uploadForm.fileName}</span>
                  <button
                    type="button"
                    onClick={() => { setUploadForm((f) => ({ ...f, fileName: "", base64: "", mimeType: "" })); }}
                    className="text-gray-500 hover:text-gray-300 transition"
                  ><X size={13} /></button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm text-gray-400 transition hover:text-gray-200 hover:border-gray-500"
                  style={{ border: "2px dashed #2a2a2a" }}
                >
                  <Upload size={15} /> Choose PDF / DOCX / XLSX (max 16 MB)
                </button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUploadDialog(false)} className="text-gray-400">Cancel</Button>
            <Button
              onClick={confirmUpload}
              disabled={!uploadForm.courseId || !uploadForm.label.trim() || !uploadForm.base64 || uploading || uploadMut.isPending}
              style={{ background: "#60a5fa" }}
              className="text-white hover:opacity-90 disabled:opacity-50"
            >
              {uploading || uploadMut.isPending ? "Uploading..." : "Upload PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit label / move section dialog ── */}
      <Dialog open={!!editDialog} onOpenChange={(open) => !open && setEditDialog(null)}>
        <DialogContent className="max-w-md" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Edit PDF Resource</DialogTitle>
            <DialogDescription className="text-gray-400">Update the display label or move this PDF to a different section.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Display Label</label>
              <Input
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Section</label>
              <Select value={editCourseId} onValueChange={setEditCourseId}>
                <SelectTrigger className="bg-black/30 border-white/10 text-white">
                  <SelectValue placeholder="Select a section..." />
                </SelectTrigger>
                <SelectContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
                  {CATEGORY_ORDER.map((cat) => {
                    const catCourses = publishedCourses.filter((c) => c.category === cat);
                    if (catCourses.length === 0) return null;
                    return (
                      <React.Fragment key={cat}>
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">{cat}</div>
                        {catCourses.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)} className="text-white">
                            {c.title}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDialog(null)} className="text-gray-400">Cancel</Button>
            <Button
              onClick={() => {
                if (!editDialog) return;
                updateMut.mutate({ id: editDialog.id, label: editLabel.trim() || editDialog.label, courseId: editCourseId ? parseInt(editCourseId) : undefined });
              }}
              disabled={updateMut.isPending}
              style={{ background: "#0074F4" }}
              className="text-white hover:opacity-90 disabled:opacity-50"
            >
              {updateMut.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tags Management Panel ──────────────────────────────────────────────────
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
        style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
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
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
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
  onDelete,
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
  onDelete?: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(lesson.title);
  const [editDesc, setEditDesc] = React.useState(lesson.description ?? "");
  const [editVideoUrl, setEditVideoUrl] = React.useState(lesson.videoUrl ?? "");
  const [editFileUrl, setEditFileUrl] = React.useState(lesson.fileUrl ?? "");
  const [editFileName, setEditFileName] = React.useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = React.useState(false);
  const uploadLessonFileMut = trpc.academy.adminUploadLessonFile.useMutation({
    onSuccess: (res) => { setEditFileUrl(res.url); setEditFileName(res.fileName); toast.success("File uploaded"); },
    onError: (e) => toast.error("Upload failed: " + e.message),
  });
  async function handleLessonFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!allowed.includes(file.type)) { toast.error("Only PDF, DOCX, or XLSX files are supported"); return; }
    if (file.size > 16 * 1024 * 1024) { toast.error("File must be under 16 MB"); return; }
    setUploadingFile(true);
    try {
      const buf = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...Array.from(new Uint8Array(buf))));
      await uploadLessonFileMut.mutateAsync({ base64, mimeType: file.type, fileName: file.name });
    } catch { /* handled by onError */ } finally { setUploadingFile(false); }
    e.target.value = "";
  }
  const [activeTags, setActiveTags] = React.useState<string[]>(() => parseTagList(lesson.tags));
  const [customTagInput, setCustomTagInput] = React.useState("");
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
    setEditFileName(null);
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
      style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
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
          {/* Downloadable file attachment */}
          <div className="rounded-lg p-2.5 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #2a2a2a" }}>
            <p className="text-[11px] text-gray-500 font-medium">Downloadable Attachment (PDF, DOCX, XLSX)</p>
            {editFileUrl ? (
              <div className="flex items-center gap-2">
                <Paperclip size={12} className="text-blue-400 flex-shrink-0" />
                <span className="text-xs text-blue-300 truncate flex-1">{editFileName ?? editFileUrl.split("/").pop() ?? "Attached file"}</span>
                <a href={editFileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-gray-500 hover:text-gray-300 underline flex-shrink-0">Preview</a>
                <button type="button" onClick={() => { setEditFileUrl(""); setEditFileName(null); }} className="text-[10px] text-red-400 hover:text-red-300 flex-shrink-0 flex items-center gap-0.5">
                  <X size={10} /> Remove
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-gray-600 italic">No file attached</p>
            )}
            <label className="inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: "rgba(0,116,244,0.15)", border: "1px solid rgba(0,116,244,0.3)", color: "#60a5fa" }}>
              {uploadingFile ? <span className="animate-spin w-3 h-3 border border-blue-400 border-t-transparent rounded-full" /> : <Upload size={12} />}
              {uploadingFile ? "Uploading..." : editFileUrl ? "Replace File" : "Upload File"}
              <input type="file" accept=".pdf,.docx,.xlsx" className="hidden" onChange={handleLessonFileUpload} disabled={uploadingFile} />
            </label>
          </div>
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
            <>
              <button
                onClick={onActivate}
                className="flex-shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-lg transition hover:opacity-80"
                style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                Activate
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="flex-shrink-0 p-1.5 rounded-lg transition hover:opacity-80"
                  style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
                  title="Permanently delete this video"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Playground Tab ───────────────────────────────────────────────────────────
function PlaygroundTab() {
  const utils = trpc.useUtils();
  const { data: stats, isLoading: statsLoading } = trpc.playground.getStats.useQuery();
  const { data: requests, isLoading: reqLoading } = trpc.playground.getRequests.useQuery();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const deleteRequestMutation = trpc.playground.deleteRequest.useMutation({
    onSuccess: () => {
      toast.success("Request deleted.");
      setDeleteConfirmId(null);
      utils.playground.getRequests.invalidate();
      utils.playground.getStats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

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
          style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
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
                style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
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
          style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
        >
          <h3 className="text-sm font-semibold text-white mb-4">Requests by Playground</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats!.byPlayground} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252d3d" />
              <XAxis
                dataKey="playground"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                tickFormatter={(v: string) =>
                  v.replace(" Playground", "").replace("WAVV ", "").replace("Other / General Feedback", "Other")
                }
              />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1d2230", border: "1px solid #2a2a2a", borderRadius: "8px" }}
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
        style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
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
              <TableRow style={{ borderColor: "#252d3d" }}>
                <TableHead className="text-gray-400 text-xs">Name</TableHead>
                <TableHead className="text-gray-400 text-xs">Email</TableHead>
                <TableHead className="text-gray-400 text-xs">Playground</TableHead>
                <TableHead className="text-gray-400 text-xs">Notes</TableHead>
                <TableHead className="text-gray-400 text-xs">Date</TableHead>
                <TableHead className="text-gray-400 text-xs w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id} style={{ borderColor: "#252d3d" }}>
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
                  <TableCell>
                    {deleteConfirmId === req.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteRequestMutation.mutate({ id: req.id })}
                          disabled={deleteRequestMutation.isPending}
                          className="text-[10px] px-2 py-0.5 rounded font-semibold"
                          style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
                        >
                          {deleteRequestMutation.isPending ? "..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-[10px] px-2 py-0.5 rounded font-semibold text-gray-500 hover:text-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(req.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                        title="Delete request"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
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
  const { data: visibilityRaw } = trpc.siteSettings.get.useQuery({ key: "webinar_sections_visibility" });
  const visibility: Record<string, boolean> = (visibilityRaw as Record<string, boolean> | null) ?? { evergreen: true, exclusive: true, recordings: true };
  const updateVisibility = trpc.siteSettings.update.useMutation({
    onSuccess: () => { utils.siteSettings.get.invalidate(); toast.success("Visibility updated"); },
    onError: (e) => toast.error(e.message),
  });
  function toggleSection(key: string) {
    updateVisibility.mutate({ key: "webinar_sections_visibility", value: { ...visibility, [key]: !visibility[key] } });
  }
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    host: "",
    type: "exclusive" as "upcoming" | "recording" | "exclusive" | "evergreen",
    registrationUrl: "",
    videoUrl: "",
    scheduledAt: "",
    accentColor: "#0074F4",
    thumbnailUrl: "",
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

  function resetForm() { setForm({ title: "", description: "", host: "", type: "exclusive" as "upcoming" | "recording" | "exclusive" | "evergreen", registrationUrl: "", videoUrl: "", scheduledAt: "", accentColor: "#0074F4", thumbnailUrl: "" }); }

  function startEdit(w: typeof webinars[0]) {
    setEditId(w.id);
    setForm({
      title: w.title,
      description: w.description ?? "",
      host: w.host ?? "",
      type: w.type as "upcoming" | "recording" | "exclusive" | "evergreen",
      registrationUrl: w.registrationUrl ?? "",
      videoUrl: w.videoUrl ?? "",
      scheduledAt: w.scheduledAt ? new Date(w.scheduledAt).toISOString().slice(0, 16) : "",
      accentColor: (w as { accentColor?: string | null }).accentColor ?? "#0074F4",
      thumbnailUrl: w.thumbnailUrl ?? "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const scheduledAtDate = form.scheduledAt ? new Date(form.scheduledAt) : undefined;
    if (editId !== null) {
      updateMutation.mutate({ id: editId, data: {
        title: form.title,
        description: form.description || undefined,
        host: form.host || undefined,
        type: form.type,
        registrationUrl: form.registrationUrl || undefined,
        videoUrl: form.videoUrl || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        accentColor: form.accentColor || undefined,
        scheduledAt: scheduledAtDate,
      }});
    } else {
      createMutation.mutate({
        title: form.title,
        description: form.description || undefined,
        host: form.host || undefined,
        type: form.type,
        registrationUrl: form.registrationUrl || undefined,
        videoUrl: form.videoUrl || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        accentColor: form.accentColor || undefined,
        scheduledAt: scheduledAtDate,
      });
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
            style={{ background: "#1d2230", border: "1px solid #2a2a2a", color: "#67C728" }}
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
        <div className="rounded-xl p-5 space-y-3" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
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
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{form.type === "recording" ? "Video URL" : "Registration URL"}</label>
                <input style={inputStyle} value={form.type === "recording" ? form.videoUrl : form.registrationUrl} onChange={e => setForm(f => form.type === "recording" ? { ...f, videoUrl: e.target.value } : { ...f, registrationUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            {/* Scheduled date — only for exclusive/upcoming */}
            {(form.type === "exclusive" || form.type === "upcoming") && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Scheduled Date &amp; Time</label>
                <input
                  type="datetime-local"
                  style={inputStyle}
                  value={form.scheduledAt}
                  onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))}
                    className="w-10 h-9 rounded cursor-pointer border-0 p-0.5"
                    style={{ background: "#111", border: "1px solid #2a2a2a" }}
                  />
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={form.accentColor}
                    onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))}
                    placeholder="#0074F4"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Thumbnail URL <span className="text-gray-600">(optional)</span></label>
                <input style={inputStyle} value={form.thumbnailUrl} onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); resetForm(); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition" style={{ background: "#252d3d" }}>Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#0074F4" }}>
                {editId !== null ? "Save Changes" : "Create Webinar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Section Visibility Toggles */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center gap-2 mb-1">
          <Eye size={13} style={{ color: "#9ca3af" }} />
          <span className="text-xs font-semibold text-gray-300">Section Visibility</span>
          <span className="text-xs text-gray-500 ml-1">— toggle to show/hide sections from users</span>
        </div>
        {[
          { key: "evergreen",  label: "Evergreen Webinars",       color: "#67C728" },
          { key: "exclusive",  label: "Exclusive / Upcoming",      color: "#0074F4" },
          { key: "recordings", label: "On-Demand Recordings",      color: "#FF9900" },
        ].map(({ key, label, color }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-xs text-gray-300">{label}</span>
            </div>
            <button
              onClick={() => toggleSection(key)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition"
              style={visibility[key] !== false
                ? { background: "rgba(103,199,40,0.15)", color: "#67C728", border: "1px solid rgba(103,199,40,0.3)" }
                : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid #2a2a2a" }
              }
            >
              {visibility[key] !== false ? <><Eye size={11} /> Visible</> : <><EyeOff size={11} /> Hidden</>}
            </button>
          </div>
        ))}
      </div>
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
      {/* Completed Exclusive Webinars (auto-archived) */}
      <CompletedExclusiveWebinars />
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
              style={{ background: "#1d2230" }}
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
                    <TableRow style={{ background: "#111", borderColor: "#252d3d" }}>
                      <TableHead className="text-gray-400 text-xs">Title</TableHead>
                      <TableHead className="text-gray-400 text-xs">Host</TableHead>
                      <TableHead className="text-gray-400 text-xs">Views</TableHead>
                      <TableHead className="text-gray-400 text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.map((w) => (
                      <TableRow key={w.id} style={{ borderColor: "#252d3d" }}>
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
// ─── Completed Exclusive Webinars (auto-archived) ────────────────────────────
function CompletedExclusiveWebinars() {
  const utils = trpc.useUtils();
  const [collapsed, setCollapsed] = React.useState(true);
  const { data: archived = [], isLoading } = trpc.webinars.archivedExclusive.useQuery();

  const publishMutation = trpc.webinars.publishToOnDemand.useMutation({
    onSuccess: () => {
      toast.success("Published to On-Demand recordings.");
      utils.webinars.archivedExclusive.invalidate();
      utils.webinars.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const keepMutation = trpc.webinars.keepArchived.useMutation({
    onSuccess: () => {
      toast.success("Webinar kept archived (hidden from users).");
      utils.webinars.archivedExclusive.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl overflow-hidden mt-4" style={{ border: "1px solid #2a2a2a" }}>
      <button
        className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition"
        style={{ background: "#1d2230" }}
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#6b7280" }} />
          <span className="text-sm font-semibold text-gray-400">Completed Exclusive Webinars</span>
          <span className="text-xs text-gray-600">Past-dated exclusive sessions — publish to On-Demand or keep archived</span>
        </div>
        <div className="flex items-center gap-2">
          {!isLoading && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(107,114,128,0.15)", color: "#9ca3af" }}>{archived.length}</span>
          )}
          <ChevronDown size={14} className={`text-gray-500 transition-transform ${collapsed ? "" : "rotate-180"}`} />
        </div>
      </button>
      {!collapsed && (
        isLoading ? (
          <div className="flex items-center justify-center h-16" style={{ background: "#111" }}>
            <div className="animate-spin w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full" />
          </div>
        ) : archived.length === 0 ? (
          <div className="px-5 py-8 text-center" style={{ background: "#111" }}>
            <p className="text-gray-600 text-xs">No completed exclusive webinars yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow style={{ background: "#111", borderColor: "#252d3d" }}>
                <TableHead className="text-gray-400 text-xs">Title</TableHead>
                <TableHead className="text-gray-400 text-xs">Host</TableHead>
                <TableHead className="text-gray-400 text-xs">Scheduled Date</TableHead>
                <TableHead className="text-gray-400 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {archived.map((w) => (
                <TableRow key={w.id} style={{ borderColor: "#252d3d" }}>
                  <TableCell className="text-gray-300 text-sm font-medium max-w-xs truncate">{w.title}</TableCell>
                  <TableCell className="text-gray-500 text-xs">{w.host ?? "—"}</TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {w.scheduledAt ? new Date(w.scheduledAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => publishMutation.mutate({ id: w.id })}
                        disabled={publishMutation.isPending}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition"
                        style={{ background: "rgba(255,153,0,0.12)", color: "#FF9900", border: "1px solid rgba(255,153,0,0.25)" }}
                      >
                        <Video size={11} />
                        Publish to On-Demand
                      </button>
                      <button
                        onClick={() => keepMutation.mutate({ id: w.id })}
                        disabled={keepMutation.isPending}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition"
                        style={{ background: "rgba(107,114,128,0.12)", color: "#9ca3af", border: "1px solid rgba(107,114,128,0.25)" }}
                      >
                        <EyeOff size={11} />
                        Keep Archived
                      </button>
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
}

// ─── Guides & Docs Tab ────────────────────────────────────────────────────────
function GuidesTab() {
  const utils = trpc.useUtils();
  const { data: guides = [], isLoading } = trpc.guides.adminList.useQuery();
  const { data: guideVisRaw } = trpc.siteSettings.get.useQuery({ key: "guides_sections_visibility" });
  const guideVisibility: Record<string, boolean> = (guideVisRaw as Record<string, boolean> | null) ?? { pdf: true, checklist: true, playbook: true, resource: true };
  const updateGuideVisibility = trpc.siteSettings.update.useMutation({
    onSuccess: () => { utils.siteSettings.get.invalidate(); toast.success("Visibility updated"); },
    onError: (e) => toast.error(e.message),
  });
  function toggleGuideSection(key: string) {
    updateGuideVisibility.mutate({ key: "guides_sections_visibility", value: { ...guideVisibility, [key]: !guideVisibility[key] } });
  }
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    // fileType = the section/category this guide belongs to
    fileType: "pdf" as "pdf" | "checklist" | "playbook" | "other",
  });
  const uploadFileMutation = trpc.guides.uploadFile.useMutation({
    onError: (e) => toast.error("Upload failed: " + e.message),
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
  function resetForm() { setForm({ title: "", description: "", fileUrl: "", fileType: "pdf" }); }
  function startEdit(g: typeof guides[0]) {
    setEditId(g.id);
    setForm({ title: g.title, description: g.description ?? "", fileUrl: g.fileUrl ?? "", fileType: (g.fileType as "pdf" | "checklist" | "playbook" | "other") ?? "pdf" });
    setShowForm(true);
  }
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 16 * 1024 * 1024) { toast.error("File too large — max 16 MB"); return; }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    type AllowedMime = "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const mimeMap: Record<string, AllowedMime> = {
      pdf:  "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    const mimeType = mimeMap[ext];
    if (!mimeType) { toast.error("Unsupported format — use PDF, DOCX, or XLSX"); return; }
    setUploadingFile(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadFileMutation.mutateAsync({ base64, mimeType, fileName: file.name });
      setForm(f => ({ ...f, fileUrl: result.url }));
      toast.success("File uploaded — URL masked by portal storage");
    } catch { /* handled by onError */ } finally { setUploadingFile(false); }
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (editId !== null) {
      updateMutation.mutate({ id: editId, data: { title: form.title, description: form.description || undefined, fileType: form.fileType, fileUrl: form.fileUrl || undefined } });
    } else {
      createMutation.mutate({ title: form.title, description: form.description || undefined, fileType: form.fileType, fileUrl: form.fileUrl || undefined });
    }
  }
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
            style={{ background: "#1d2230", border: "1px solid #2a2a2a", color: "#67C728" }}
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
        <div className="rounded-xl p-5 space-y-3" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <h3 className="text-sm font-semibold text-white">{editId !== null ? "Edit Guide" : "New Guide"}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Row 1: Title + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Guide title" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Category (Section)</label>
                <select style={{ ...inputStyle, appearance: "none" as const }} value={form.fileType} onChange={e => setForm(f => ({ ...f, fileType: e.target.value as "pdf" | "checklist" | "playbook" | "other" }))}>
                  <option value="pdf">PDF</option>
                  <option value="checklist">Checklist</option>
                  <option value="playbook">Playbook</option>
                  <option value="other">Resource</option>
                </select>
              </div>
            </div>
            {/* Row 2: Description */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea rows={2} style={{ ...inputStyle, resize: "vertical" as const }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
            </div>
            {/* Row 3: File upload + URL preview */}
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 mb-1">File Attachment <span className="text-gray-600">(PDF, DOCX, or XLSX — max 16 MB)</span></label>
              <div className="flex items-center gap-3">
                <label
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition hover:opacity-90"
                  style={{ background: uploadingFile ? "#252d3d" : "#1d2230", border: "1px solid #3a3a3a", color: uploadingFile ? "#9ca3af" : "#fff" }}
                >
                  {uploadingFile ? (
                    <><span className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full inline-block" /> Uploading...</>
                  ) : (
                    <><FileDown size={13} /> Choose File</>
                  )}
                  <input type="file" accept=".pdf,.docx,.xlsx" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
                </label>
                {form.fileUrl && (
                  <span className="text-xs text-green-400 flex items-center gap-1 truncate max-w-xs">
                    <CheckCircle2 size={12} /> File attached
                    <a href={form.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">Preview</a>
                  </span>
                )}
                {!form.fileUrl && (
                  <span className="text-xs text-gray-600">No file attached</span>
                )}
              </div>
              {/* Fallback: manual URL */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Or paste a URL directly</label>
                <input style={{ ...inputStyle, fontSize: "12px" }} value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); resetForm(); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition" style={{ background: "#252d3d" }}>Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending || uploadingFile} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "#0074F4" }}>
                {editId !== null ? "Save Changes" : "Create Guide"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Section Visibility Toggles */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center gap-2 mb-1">
          <Eye size={13} style={{ color: "#9ca3af" }} />
          <span className="text-xs font-semibold text-gray-300">Section Visibility</span>
          <span className="text-xs text-gray-500 ml-1">— toggle to show/hide sections from users</span>
        </div>
        {[
          { key: "pdf",       label: "PDFs",       color: "#ef4444" },
          { key: "checklist", label: "Checklists", color: "#67C728" },
          { key: "playbook",  label: "Playbooks",  color: "#0074F4" },
          { key: "resource",  label: "Resources",  color: "#FF9900" },
        ].map(({ key, label, color }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-xs text-gray-300">{label}</span>
            </div>
            <button
              onClick={() => toggleGuideSection(key)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition"
              style={guideVisibility[key] !== false
                ? { background: "rgba(103,199,40,0.15)", color: "#67C728", border: "1px solid rgba(103,199,40,0.3)" }
                : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid #2a2a2a" }
              }
            >
              {guideVisibility[key] !== false ? <><Eye size={11} /> Visible</> : <><EyeOff size={11} /> Hidden</>}
            </button>
          </div>
        ))}
      </div>
      {/* Grouped by category */}
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
              style={{ background: "#1d2230" }}
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
                    <TableRow style={{ background: "#111", borderColor: "#252d3d" }}>
                      <TableHead className="text-gray-400 text-xs">Title</TableHead>
                      <TableHead className="text-gray-400 text-xs">Category</TableHead>
                      <TableHead className="text-gray-400 text-xs">Downloads</TableHead>
                      <TableHead className="text-gray-400 text-xs">Status</TableHead>
                      <TableHead className="text-gray-400 text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.map((g) => (
                      <TableRow key={g.id} style={{ borderColor: "#252d3d" }}>
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
          style={{ background: "#1d2230", border: "1px solid #2a2a2a", color: "#67C728" }}
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
              style={{ background: "#1d2230" }}
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
                    <TableRow style={{ background: "#111", borderColor: "#252d3d" }}>
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
                        <TableRow key={t.id} style={{ borderColor: "#252d3d" }}>
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(0,116,244,0.15)" }}
        >
          <Headphones size={18} style={{ color: "#0074F4" }} />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">WAVV Support</h2>
          <p className="text-xs text-gray-500">Support analytics and management tools</p>
        </div>
      </div>

      {/* Under-construction banner */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(245,158,11,0.07)", border: "2px dashed rgba(245,158,11,0.35)" }}
      >
        <div className="flex flex-col items-center justify-center text-center py-16 px-8 gap-5">
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.15)" }}
          >
            <AlertTriangle size={40} style={{ color: "#f59e0b" }} />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Support Analytics
            </h3>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b" }}
            >
              <AlertTriangle size={11} />
              Under Construction
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
            This section will surface <span className="text-white font-medium">AskWAVV AI usage stats</span>,{" "}
            <span className="text-white font-medium">Help Center engagement metrics</span>, and{" "}
            <span className="text-white font-medium">support volume trends</span> once instrumentation
            is complete. Ticket management is handled separately outside this portal.
          </p>

          {/* Upcoming features list */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mt-2"
          >
            {[
              { icon: <Activity size={14} />, label: "AskWAVV AI Stats" },
              { icon: <TrendingUp size={14} />, label: "Help Center Metrics" },
              { icon: <BarChart3 size={14} />, label: "Support Volume Trends" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}
              >
                <span style={{ color: "#f59e0b" }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Content Requests Tab ─────────────────────────────────────────────────────
function ContentRequestsTab() {
  const utils = trpc.useUtils();
  const [filterType, setFilterType] = useState<"video" | "guide" | "webinar" | "">("")
  const { data: requests, isLoading } = trpc.contentRequests.adminList.useQuery({
    requestType: filterType || undefined,
  });

  const deleteRequest = trpc.contentRequests.adminDelete.useMutation({
    onSuccess: () => { toast.success("Request deleted"); utils.contentRequests.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const flagUser = trpc.contentRequests.adminFlagUser.useMutation({
    onSuccess: (data, vars) => {
      toast.success(`Strike added. User now has ${(data as { strikes: number }).strikes} strike(s).`);
    },
    onError: (e) => toast.error(e.message),
  });

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [flagConfirm, setFlagConfirm] = useState<{ userId: number; userName: string } | null>(null);

  const TYPE_COLOR: Record<string, string> = {
    video: "#0074F4",
    guide: "#00A9E2",
    webinar: "#67C728",
  };

  function exportCSV() {
    if (!requests || requests.length === 0) { toast.error("No requests to export"); return; }
    const header = "Date,Type,Topic,User,Email,Description";
    const lines = (requests as Array<{
      createdAt: Date | string;
      requestType: string;
      topic: string;
      userName?: string | null;
      userEmail?: string | null;
      description?: string | null;
    }>).map((r) => {
      const date = r.createdAt ? new Date(r.createdAt).toISOString() : "";
      const desc = r.description ? `"${String(r.description).replace(/"/g, '""')}"` : "";
      return `${date},${r.requestType},"${r.topic}",${r.userName ?? ""},${r.userEmail ?? ""},${desc}`;
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
            <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "#1d2230" }} />
          ))}
        </div>
      ) : (
        <ContentRequestGroups
          requests={(requests ?? []) as Array<{
            id: number;
            userId: number;
            createdAt: Date | string;
            requestType: string;
            topic: string;
            description?: string | null;
            userName?: string | null;
            userEmail?: string | null;
          }>}
          TYPE_COLOR={TYPE_COLOR}
          onDelete={(id) => setDeleteConfirm(id)}
          onFlag={(userId, userName) => setFlagConfirm({ userId, userName })}
        />
      )}

      {/* Delete confirm dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Delete Request</DialogTitle>
            <DialogDescription className="text-gray-400">This will permanently remove the request. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-gray-400">Cancel</Button>
            <Button
              onClick={() => { if (deleteConfirm !== null) { deleteRequest.mutate({ id: deleteConfirm }); setDeleteConfirm(null); } }}
              disabled={deleteRequest.isPending}
              style={{ background: "#ef4444" }}
              className="text-white hover:opacity-90"
            >
              {deleteRequest.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag/Strike confirm dialog */}
      <Dialog open={flagConfirm !== null} onOpenChange={(open) => { if (!open) setFlagConfirm(null); }}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Add Strike to User</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will add a strike to <span className="font-medium text-gray-300">{flagConfirm?.userName}</span>'s account. Accumulating strikes may result in access revocation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFlagConfirm(null)} className="text-gray-400">Cancel</Button>
            <Button
              onClick={() => { if (flagConfirm) { flagUser.mutate({ userId: flagConfirm.userId }); setFlagConfirm(null); } }}
              disabled={flagUser.isPending}
              style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
              className="hover:opacity-90"
            >
              {flagUser.isPending ? "Adding Strike..." : "Add Strike"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const CONTENT_REQUEST_GROUPS: Array<{ key: string; label: string; description: string }> = [
  { key: "video",   label: "Video Requests",   description: "Academy lesson and tutorial requests" },
  { key: "webinar", label: "Webinar Requests",  description: "Live and on-demand webinar requests" },
  { key: "guide",   label: "Guide Requests",    description: "Playbook, checklist, and doc requests" },
];

function exportGroupCSV(groupKey: string, groupLabel: string, group: Array<{
  id: number;
  userId: number;
  createdAt: Date | string;
  requestType: string;
  topic: string;
  description?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}>) {
  if (group.length === 0) { toast.error("No requests to export"); return; }
  const header = "Date,Type,Topic,User,Email,Description";
  const lines = group.map((r) => {
    const date = r.createdAt ? new Date(r.createdAt).toISOString() : "";
    const desc = r.description ? `"${String(r.description).replace(/"/g, '""')}"` : "";
    return `${date},${r.requestType},"${r.topic}",${r.userName ?? ""},${r.userEmail ?? ""},${desc}`;
  });
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${groupKey}-requests.csv`; a.click();
  URL.revokeObjectURL(url);
}

function ContentRequestGroups({
  requests,
  TYPE_COLOR,
  onDelete,
  onFlag,
}: {
  requests: Array<{
    id: number;
    userId: number;
    createdAt: Date | string;
    requestType: string;
    topic: string;
    description?: string | null;
    userName?: string | null;
    userEmail?: string | null;
  }>;
  TYPE_COLOR: Record<string, string>;
  onDelete: (id: number) => void;
  onFlag: (userId: number, userName: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
  const PREVIEW_COUNT = 5;

  const grouped = CONTENT_REQUEST_GROUPS.reduce((acc, g) => {
    acc[g.key] = requests.filter(r => r.requestType === g.key);
    return acc;
  }, {} as Record<string, typeof requests>);
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
        const color = TYPE_COLOR[key] ?? "#9ca3af";
        const isCollapsed = collapsed[key];
        const isShowAll = showAll[key];
        const displayed = isShowAll ? group : group.slice(0, PREVIEW_COUNT);
        return (
          <div key={key} className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
            {/* Group header */}
            <div
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition cursor-pointer"
              style={{ background: "#1d2230" }}
              onClick={() => setCollapsed(c => ({ ...c, [key]: !c[key] }))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setCollapsed(c => ({ ...c, [key]: !c[key] })); }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-sm font-semibold text-white">{label}</span>
                <span className="text-xs text-gray-500">{description}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${color}20`, color }}>{group.length}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); exportGroupCSV(key, label, group); }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition hover:opacity-80"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}
                  title={`Export ${label} as CSV`}
                >
                  <FileDown size={10} /> CSV
                </button>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
              </div>
            </div>
            {!isCollapsed && (
              <>
                {group.length === 0 ? (
                  <div className="px-5 py-6 text-center" style={{ background: "#111" }}>
                    <p className="text-xs text-gray-600">No {label.toLowerCase()} submitted yet.</p>
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: "#111", borderColor: "#252d3d" }}>
                      <TableHead className="text-gray-400 text-xs">Date</TableHead>
                      <TableHead className="text-gray-400 text-xs">Topic</TableHead>
                      <TableHead className="text-gray-400 text-xs">Description</TableHead>
                      <TableHead className="text-gray-400 text-xs">User</TableHead>
                      <TableHead className="text-gray-400 text-xs w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayed.map((r) => (
                      <TableRow key={r.id} style={{ borderColor: "#252d3d" }}>
                        <TableCell className="text-gray-500 text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-white text-xs max-w-[180px]">
                          <div className="truncate font-medium" title={r.topic}>{r.topic}</div>
                        </TableCell>
                        <TableCell className="text-gray-400 text-xs max-w-[240px]">
                          {r.description ? (
                            <div className="truncate" title={r.description}>{r.description}</div>
                          ) : <span className="text-gray-600">—</span>}
                        </TableCell>
                        <TableCell className="text-gray-400 text-xs">
                          <div className="font-medium text-gray-300">{r.userName ?? "—"}</div>
                          {r.userEmail && <div className="text-gray-600 text-[10px]">{r.userEmail}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onFlag(r.userId, r.userName ?? r.userEmail ?? "User")}
                              className="p-1 rounded hover:bg-amber-500/10 text-gray-500 hover:text-amber-400 transition"
                              title="Flag user (add strike)"
                            >
                              <Flag size={12} />
                            </button>
                            <button
                              onClick={() => onDelete(r.id)}
                              className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition"
                              title="Delete request"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
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
        <div className="rounded-xl p-5 space-y-4" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
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
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#1d2230", borderBottom: "1px solid #2a2a2a" }}>
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
