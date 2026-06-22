import { useState, useMemo, useEffect } from "react";
import React, { useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  ShieldCheck,
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
  BookOpen,
  Crown,
  Settings,
  ToggleLeft,
  ToggleRight,
  Megaphone,
  Wrench,
  Gauge,
  Info,
  KeyRound,
  Navigation,
  Home,
  GraduationCap as GraduationCapIcon,
  Video as VideoIcon,
  FileText as FileTextIcon,
  Headphones as HeadphonesIcon,
  Users as UsersIcon,
  Play,
  Mic,
  Radio,
  UserCheck,
  Target,
  Zap,
  Phone,
  PhoneCall,
  Mail,
  Lightbulb,
  Award,
  Trophy,
  Rocket,
  PhoneOutgoing,
  PhoneMissed,
  PhoneOff,
  ListChecks,
  ClipboardList,
  Crosshair,
  Repeat,
  RotateCcw,
  Shuffle,
  Image as ImageIcon,
  PlayCircle,
  Clapperboard,
  MonitorPlay,
  HelpCircle,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo,
  Redo,
  Code,
  Quote,
  GripVertical,
} from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import NativeArticleEditor from "@/components/NativeArticleEditor";

type AdminTab = "analytics" | "partner_analytics" | "users" | "academy" | "webinars" | "guides" | "playground" | "support" | "content_requests" | "settings" | "approved_partners" | "partners_content";
type TimeRange = 7 | 30 | 90 | 365;

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function Admin() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  const isOwner = user?.role === "owner";
  const isSuperAdmin = user?.role === "publisher" || isOwner;
  const isPartnerAdmin = user?.role === "partner_manager" || isOwner;

  // Read ?tab= from the URL to set the initial active tab
  const initialTab = (): AdminTab => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "users") return "users";
    if (t === "analytics" && isSuperAdmin) return "analytics";
    if (t === "approved_partners" && (isSuperAdmin || isPartnerAdmin)) return "approved_partners";
    if ((t === "academy" || t === "content") && isSuperAdmin) return "academy";
    if (t === "webinars" && isSuperAdmin) return "webinars";
    if (t === "guides" && isSuperAdmin) return "guides";
    if (t === "playground" && isSuperAdmin) return "playground";
    if (t === "support" && isSuperAdmin) return "support";
    if (t === "content_requests" && isSuperAdmin) return "content_requests";
    if (t === "partners_content" && (isSuperAdmin || isPartnerAdmin)) return "partners_content";
    if (t === "partner_analytics" && (isSuperAdmin || isPartnerAdmin)) return "partner_analytics";
    // defaults by role
    if (isOwner || (isSuperAdmin && !isPartnerAdmin)) return "users";
    if (isPartnerAdmin && !isOwner) return "approved_partners";
    if (user?.role === "viewer") return "users";
    return "users";
  };
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  // Persist analytics time-range across tab switches
  const [analyticsDays, setAnalyticsDays] = useState<AnonTimeRange>(30);

  // Must be called unconditionally before any early returns (Rules of Hooks)
  const { data: adminSettings = {} } = trpc.siteSettings.getAll.useQuery();

  // Sync tab when the URL changes (e.g., sidebar link clicked while already on /admin)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "users") setActiveTab("users");
    else if (t === "analytics" && isSuperAdmin) setActiveTab("analytics");
    else if (t === "approved_partners" && (isSuperAdmin || isPartnerAdmin)) setActiveTab("approved_partners");
    else if ((t === "academy" || t === "content") && isSuperAdmin) setActiveTab("academy");
    else if (t === "webinars" && isSuperAdmin) setActiveTab("webinars");
    else if (t === "guides" && isSuperAdmin) setActiveTab("guides");
    else if (t === "playground" && isSuperAdmin) setActiveTab("playground");
    else if (t === "support" && isSuperAdmin) setActiveTab("support");
    else if (t === "content_requests" && isSuperAdmin) setActiveTab("content_requests");
    else if (t === "partners_content" && (isSuperAdmin || isPartnerAdmin)) setActiveTab("partners_content");
    else if (t === "partner_analytics" && (isSuperAdmin || isPartnerAdmin)) setActiveTab("partner_analytics");
    else if (isOwner || (isSuperAdmin && !isPartnerAdmin)) setActiveTab("users");
    else if (isPartnerAdmin && !isOwner) setActiveTab("approved_partners");
    else setActiveTab("users");
  }, [location]);
  // Show spinner while auth is resolving — MUST come before any redirect checks
  // to prevent the race condition where loading=true + user=null triggers a login redirect
  if (loading) {
    return (
      <PortalLayout title="Command Center">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[#0074F4] border-t-transparent rounded-full" />
        </div>
      </PortalLayout>
    );
  }

  // Not logged in at all → AdminGuard in App.tsx handles this, but keep as safety net
  if (!user) {
    window.location.href = "/api/oauth/login?return_path=/wavvcommandcenter";
    return null;
  }
  // Logged in but not an authorized admin role → redirect to home
  // Explicit allowlist: only owner, publisher, partner_manager get access
  const ADMIN_ROLES = ["owner", "publisher", "partner_manager"];
  if (!ADMIN_ROLES.includes(user.role)) {
    navigate("/");
    return null;
  }

  // ── Tab row definitions ──
  type TabDef = { id: AdminTab; label: string; icon: React.ReactNode; show: boolean };

  const operationsRow: TabDef[] = [
    { id: "users",            label: "Access",            icon: <Shield size={13} />,    show: true },
    { id: "analytics",        label: "Analytics",         icon: <BarChart3 size={13} />, show: isSuperAdmin },
    { id: "settings",         label: "Settings",          icon: <Settings size={13} />,  show: isOwner },
    { id: "approved_partners",label: "Approved Partners", icon: <UserPlus size={13} />,  show: isOwner || (isPartnerAdmin && !isSuperAdmin) },
  ];

  const contentRow: TabDef[] = [
    { id: "academy",          label: "WAVV Academy",      icon: <GraduationCap size={13} />, show: isSuperAdmin },
    { id: "webinars",         label: "WAVV Webinars",     icon: <Video size={13} />,         show: isSuperAdmin },
    { id: "guides",           label: "WAVV Resource Hub", icon: <FileText size={13} />,      show: isSuperAdmin },
    { id: "playground",       label: "WAVV Playground",   icon: <FlaskConical size={13} />,  show: isSuperAdmin },
    { id: "support",          label: "WAVV Support",      icon: <Headphones size={13} />,    show: isSuperAdmin },
    { id: "partners_content", label: "WAVV Partners",     icon: <Users size={13} />,         show: isOwner || (isPartnerAdmin && !isSuperAdmin) },
    { id: "content_requests", label: "Requests",          icon: <MessageSquare size={13} />, show: isSuperAdmin },
  ];

  function TabButton({ tab }: { tab: TabDef }) {
    const active = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
        style={
          active
            ? { background: "#0074F4", color: "#fff" }
            : { color: "#9ca3af" }
        }
      >
        <span className="flex-shrink-0" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {tab.icon}
        </span>
        {tab.label}
      </button>
    );
  }

  return (
    <PortalLayout title="Command Center">
      <div className="px-4 lg:px-6 py-6 space-y-4">

        {/* ── Row 1: Operations ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#4b5563" }}>Operations</p>
          <div
            className="flex items-center gap-0.5 p-1 rounded-xl"
            style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
          >
            {operationsRow.filter(t => t.show).map(tab => <TabButton key={tab.id} tab={tab} />)}
          </div>
        </div>

        {/* ── Row 3: Content Management ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#4b5563" }}>Content Management</p>
          <div
            className="flex items-center gap-0.5 p-1 rounded-xl"
            style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
          >
            {contentRow.filter(t => t.show).map(tab => <TabButton key={tab.id} tab={tab} />)}
          </div>
        </div>

        {/* ── Tab content ── */}
        {activeTab === "analytics" && isSuperAdmin && <AnalyticsTab days={analyticsDays} onDaysChange={setAnalyticsDays} />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "settings" && isOwner && <SettingsTab />}
        {activeTab === "approved_partners" && (isOwner || isPartnerAdmin) && <ApprovedPartnersTab />}
        {activeTab === "academy" && isSuperAdmin && <ContentTab />}
        {activeTab === "webinars" && isSuperAdmin && <WebinarsTab />}
        {activeTab === "guides" && isSuperAdmin && <GuidesTab />}
        {activeTab === "playground" && isSuperAdmin && <PlaygroundTab />}
        {activeTab === "support" && isSuperAdmin && <SupportTab />}
        {activeTab === "partners_content" && (isOwner || isPartnerAdmin) && <PartnersContentTab />}
        {activeTab === "content_requests" && isSuperAdmin && <ContentRequestsTab />}
        {activeTab === "partner_analytics" && (isSuperAdmin || isPartnerAdmin) && <PartnerAnalyticsTab isPartnerAdmin={isPartnerAdmin && !isOwner} />}
      </div>
    </PortalLayout>
  );
}


// ─── Analytics Tab ────────────────────────────────────────────────────────────
type AnonTimeRange = 7 | 30 | 90 | 0; // 0 = All Time

function AnalyticsTab({ days: daysProp, onDaysChange }: { days?: AnonTimeRange; onDaysChange?: (d: AnonTimeRange) => void } = {}) {
  const [localDays, setLocalDays] = useState<AnonTimeRange>(daysProp ?? 30);
  const days = daysProp ?? localDays;
  const setDays = (d: AnonTimeRange) => { setLocalDays(d); onDaysChange?.(d); };
  const [resetOpen, setResetOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const utils = trpc.useUtils();
  const { user: analyticsUser } = useAuth();
  const isSuperAdmin = analyticsUser?.role === "publisher" || analyticsUser?.role === "owner";
  const { data: tabSettings = {} } = trpc.siteSettings.getAll.useQuery();
  const resetAnalytics = trpc.analytics.resetAnalytics.useMutation({
    onSuccess: () => {
      toast.success("All analytics data has been cleared.");
      setResetOpen(false);
      setResetConfirmText("");
      utils.analytics.getAnonOverview.invalidate();
      utils.analytics.getAnonTrend.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const TIME_OPTIONS: { value: AnonTimeRange; label: string }[] = [
    { value: 7,  label: "7D" },
    { value: 30, label: "30D" },
    { value: 90, label: "90D" },
    { value: 0,  label: "All Time" },
  ];

  return (
    <div className="space-y-6">
      {/* Two-step reset confirmation dialog */}
      <Dialog open={resetOpen} onOpenChange={(o) => { setResetOpen(o); if (!o) setResetConfirmText(""); }}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle size={18} style={{ color: "#ef4444" }} />
              Reset All Analytics Data
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This will permanently erase <strong className="text-white">all</strong> anonymous analytics event data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="px-1 py-2">
            <p className="text-xs text-gray-500 mb-2">Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm:</p>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3 py-2 rounded-lg text-sm text-white bg-transparent border outline-none"
              style={{ borderColor: resetConfirmText === "DELETE" ? "#ef4444" : "rgba(255,255,255,0.15)" }}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => { setResetOpen(false); setResetConfirmText(""); }} className="text-gray-400">Cancel</Button>
            <Button
              variant="destructive"
              disabled={resetAnalytics.isPending || resetConfirmText !== "DELETE"}
              onClick={() => resetAnalytics.mutate()}
            >
              {resetAnalytics.isPending ? "Resetting..." : "Confirm Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Analytics Dashboard</h2>
          <p className="text-xs text-gray-500 mt-0.5">Anonymous visitors only — authenticated users are excluded</p>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => setResetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition"
              style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <Trash2 size={13} />
              Reset Data
            </button>
          )}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
            {TIME_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setDays(value)}
                className="px-3 py-1.5 text-xs font-medium rounded-md transition"
                style={days === value ? { background: "rgba(6,182,212,0.2)", color: "#22d3ee" } : { color: "#9ca3af" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnonAnalyticsContent days={days} />
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
              Export
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
    { key: "webinars", label: "WAVV Webinars",     color: "#f59e0b" },
    { key: "guides",   label: "Resource Hub",     color: "#4ade80" },
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
        <StatCard icon={<Download size={18} />}      label="Resource Hub Downloads"         value={stats?.guideDownloaded ?? 0}  color="green"  subtitle={`last ${days}d`} onClick={() => openDrawer("Resource Hub Downloads",          ["guide_downloaded"],                                        "#4ade80")} />
        <StatCard icon={<Search size={18} />}        label="Total Searches"                 value={stats?.searches ?? 0}         color="teal"   subtitle={`last ${days}d`} onClick={() => openDrawer("Total Searches",                  ["search"],                                                  "#2dd4bf")} />
        <StatCard icon={<MessageSquare size={18} />} label="AI Search Sessions"             value={stats?.aiChats ?? 0}          color="purple" subtitle={`last ${days}d`} onClick={() => openDrawer("AI Search Sessions",              ["ai_chat"],                                                 "#a78bfa")} />
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

// ─── Anonymous Analytics Dashboard ──────────────────────────────────────────
// ─── Page name labels for drilldown ────────────────────────────────────────
const PAGE_LABELS: Record<string, string> = {
  "/academy": "WAVV Academy",
  "/webinars": "WAVV Webinars",
  "/guides": "Resource Hub",
  "/playground": "WAVV Playground",
  "/support": "WAVV Support",
  "/wavvpartner": "WAVV Partners",
  "/wavvcommandcenter": "WAVV Command Center",
  "/profile": "My Profile",
  "/search": "Search",
};
function friendlyPage(path: string) {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  // /academy/course/123 → "Academy · Course 123"
  const parts = path.replace(/^\//, "").split("/");
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" › ");
}

function AnonAnalyticsContent({ days }: { days: AnonTimeRange }) {
  const { data: overview, isLoading } = trpc.analytics.getAnonOverview.useQuery({ days });
  const { data: pageTrend } = trpc.analytics.getAnonTrend.useQuery({ eventType: "page_view", days });
  const { data: academyTrend } = trpc.analytics.getAnonTrend.useQuery({ eventType: "academy_video_play", days });
  const { data: webinarTrend } = trpc.analytics.getAnonTrend.useQuery({ eventType: "webinar_video_play", days });
  const { data: guideTrend } = trpc.analytics.getAnonTrend.useQuery({ eventType: "guide_download", days });

  const [activePanel, setActivePanel] = useState<"overview" | "academy" | "webinars" | "guides">("overview");
  const [showPageDrilldown, setShowPageDrilldown] = useState(false);
  const { data: drilldown } = trpc.analytics.getPageViewDrilldown.useQuery({ days }, { enabled: showPageDrilldown });

  const GUIDE_TYPE_LABELS: Record<string, string> = {
    help_article: "Help Articles", pdf: "PDFs", checklist: "Checklists",
    playbook: "Playbooks", other: "Resources",
  };
  const GUIDE_TYPE_COLORS: Record<string, string> = {
    help_article: "#8B5CF6", pdf: "#ef4444", checklist: "#67C728",
    playbook: "#0074F4", other: "#FF9900",
  };
  const WEBINAR_TYPE_COLORS: Record<string, string> = {
    exclusive: "#a78bfa", evergreen: "#22d3ee", recording: "#f59e0b",
  };

  const totalAcademyPlays = (overview?.academyByCategory ?? []).reduce((s, r) => s + (r.count ?? 0), 0);
  const totalWebinarPlays = (overview?.webinarByType ?? []).reduce((s, r) => s + (r.count ?? 0), 0);
  const totalGuideDownloads = (overview?.guidesByType ?? []).reduce((s, r) => s + (r.count ?? 0), 0);

  const PANEL_TABS = [
    { key: "overview" as const, label: "Overview", color: "#22d3ee", icon: <Activity size={13} /> },
    { key: "academy" as const, label: "WAVV Academy",  color: "#22d3ee", icon: <GraduationCap size={13} /> },
    { key: "webinars" as const, label: "WAVV Webinars", color: "#f59e0b", icon: <Video size={13} /> },
    { key: "guides" as const, label: "Resource Hub",   color: "#4ade80", icon: <FileText size={13} /> },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 animate-pulse h-24"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Page Views tile — clickable for drilldown */}
        <div
          className="relative cursor-pointer group"
          onClick={() => setShowPageDrilldown(true)}
          title="Click to see per-page breakdown"
        >
          <StatCard icon={<Eye size={18} />} label="Page Views" value={overview?.totalPageViews ?? 0} color="blue" />
          <span className="absolute bottom-2 right-3 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#60a5fa" }}>View breakdown →</span>
        </div>
        <StatCard icon={<GraduationCap size={18} />} label="Academy Plays"      value={totalAcademyPlays}              color="cyan"   />
        <StatCard icon={<Video size={18} />}         label="Webinar Plays"      value={totalWebinarPlays}              color="amber"  />
        <StatCard icon={<Download size={18} />}      label="Guide Downloads"    value={totalGuideDownloads}            color="green"  />
      </div>

      {/* Page View Drilldown Modal */}
      {showPageDrilldown && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPageDrilldown(false); }}
        >
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "80vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <Eye size={16} style={{ color: "#60a5fa" }} />
                <span className="font-semibold text-white text-sm">Page View Breakdown</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa" }}>
                  {drilldown?.total ?? overview?.totalPageViews ?? 0} total
                </span>
              </div>
              <button onClick={() => setShowPageDrilldown(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            {/* Table */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(80vh - 72px)" }}>
              {!drilldown ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                </div>
              ) : drilldown.pages.length === 0 ? (
                <p className="text-center text-gray-500 py-12 text-sm">No page views recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Page</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Views</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drilldown.pages.map((p, i) => {
                      const pct = drilldown.total > 0 ? Math.round((p.total / drilldown.total) * 100) : 0;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                          className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3">
                            <div className="font-medium text-white">{friendlyPage(p.path ?? "")}</div>
                            <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{p.path}</div>
                          </td>
                          <td className="px-6 py-3 text-right font-semibold text-white">{p.total.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#60a5fa" }} />
                              </div>
                              <span className="text-xs w-8 text-right" style={{ color: "#60a5fa" }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panel tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {PANEL_TABS.map((t) => (
          <button key={t.key} onClick={() => setActivePanel(t.key)}
            className="flex items-center gap-1.5 flex-1 justify-center py-2 text-xs font-medium rounded-lg transition"
            style={activePanel === t.key
              ? { background: "rgba(255,255,255,0.1)", color: t.color }
              : { color: "#6b7280" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview panel */}
      {activePanel === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Page views trend */}
          <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"><Eye size={13} style={{ color: "#60a5fa" }} /> Page Views Trend</p>
            <AnonTrendChart data={pageTrend ?? []} color="#60a5fa" />
          </div>
          {/* Top pages */}
          <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"><Navigation size={13} style={{ color: "#22d3ee" }} /> Top Pages (excl. home)</p>
            <AnonRankedList
              items={(overview?.topPages ?? []).map((p) => ({ label: friendlyPage(p.path ?? "unknown"), count: p.total ?? 0 }))}
              color="#22d3ee"
              emptyText="No page views recorded yet"
            />
          </div>
        </div>
      )}

      {/* Academy panel */}
      {activePanel === "academy" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"><GraduationCap size={13} style={{ color: "#22d3ee" }} /> Plays by Category</p>
            <AnonBarChart
              data={(overview?.academyByCategory ?? []).map((r) => ({ name: r.category ?? "Unknown", count: r.count ?? 0 }))}
              color="#22d3ee"
            />
          </div>
          <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"><Activity size={13} style={{ color: "#22d3ee" }} /> Academy Plays Trend</p>
            <AnonTrendChart data={academyTrend ?? []} color="#22d3ee" />
          </div>
          <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"><Layers size={13} style={{ color: "#22d3ee" }} /> Top Sections</p>
            <AnonRankedList
              items={(overview?.academyBySection ?? []).map((r) => ({ label: r.section ?? "Unknown", sublabel: r.category ?? undefined, count: r.count ?? 0 }))}
              color="#22d3ee"
              emptyText="No academy plays yet"
            />
          </div>
          <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"><Star size={13} style={{ color: "#fbbf24" }} /> Top Individual Lessons</p>
            <AnonRankedList
              items={(overview?.topLessons ?? []).map((r) => ({ label: r.title ?? "Unknown", sublabel: r.section ?? undefined, count: r.count ?? 0 }))}
              color="#fbbf24"
              emptyText="No lesson plays yet"
            />
          </div>
        </div>
      )}

      {/* Webinars panel */}
      {activePanel === "webinars" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"><Video size={13} style={{ color: "#f59e0b" }} /> Plays by Type</p>
            <div className="space-y-2">
              {(overview?.webinarByType ?? []).length === 0
                ? <p className="text-gray-500 text-sm text-center py-6">No webinar plays yet</p>
                : (overview?.webinarByType ?? []).map((r, i) => {
                    const color = WEBINAR_TYPE_COLORS[r.type ?? ""] ?? "#9ca3af";
                    const total = totalWebinarPlays || 1;
                    const pct = Math.round(((r.count ?? 0) / total) * 100);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-300 capitalize">{r.type ?? "unknown"}</span>
                          <span className="font-semibold text-white">{r.count ?? 0} <span className="text-gray-500 font-normal">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
          <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"><Activity size={13} style={{ color: "#f59e0b" }} /> Webinar Plays Trend</p>
            <AnonTrendChart data={webinarTrend ?? []} color="#f59e0b" />
          </div>
          <div className="rounded-xl p-5 space-y-3 lg:col-span-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"><Star size={13} style={{ color: "#fbbf24" }} /> Top Individual Webinars</p>
            <AnonRankedList
              items={(overview?.topWebinars ?? []).map((r) => ({ label: r.title ?? "Unknown", sublabel: r.type ?? undefined, count: r.count ?? 0 }))}
              color="#f59e0b"
              emptyText="No webinar plays yet"
            />
          </div>
        </div>
      )}

      {/* Resource Hub panel */}
      {activePanel === "guides" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"><Download size={13} style={{ color: "#4ade80" }} /> Downloads by Category</p>
            <div className="space-y-2">
              {(overview?.guidesByType ?? []).length === 0
                ? <p className="text-gray-500 text-sm text-center py-6">No guide downloads yet</p>
                : (overview?.guidesByType ?? []).map((r, i) => {
                    const color = GUIDE_TYPE_COLORS[r.fileType ?? ""] ?? "#9ca3af";
                    const label = GUIDE_TYPE_LABELS[r.fileType ?? ""] ?? (r.fileType ?? "Other");
                    const total = totalGuideDownloads || 1;
                    const pct = Math.round(((r.count ?? 0) / total) * 100);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-300">{label}</span>
                          <span className="font-semibold text-white">{r.count ?? 0} <span className="text-gray-500 font-normal">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
          <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"><Activity size={13} style={{ color: "#4ade80" }} /> Downloads Trend</p>
            <AnonTrendChart data={guideTrend ?? []} color="#4ade80" />
          </div>
          <div className="rounded-xl p-5 space-y-3 lg:col-span-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"><Star size={13} style={{ color: "#fbbf24" }} /> Top Individual Guides</p>
            <AnonRankedList
              items={(overview?.topGuides ?? []).map((r) => ({ label: r.title ?? "Unknown", sublabel: GUIDE_TYPE_LABELS[r.fileType ?? ""] ?? r.fileType ?? undefined, count: r.count ?? 0 }))}
              color="#4ade80"
              emptyText="No guide downloads yet"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared mini chart components ────────────────────────────────────────────
function AnonTrendChart({ data, color }: { data: { date: string; count: number }[]; color: string }) {
  if (!data || data.length === 0)
    return <div className="flex items-center justify-center h-32 text-gray-500 text-xs">No data for this period</div>;
  return (
    <div style={{ height: 128 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}`; }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: 12 }} />
          <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AnonBarChart({ data, color }: { data: { name: string; count: number }[]; color: string }) {
  if (!data || data.length === 0)
    return <div className="flex items-center justify-center h-32 text-gray-500 text-xs">No data for this period</div>;
  return (
    <div style={{ height: 128 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 10 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#d1d5db", fontSize: 10 }} width={100} />
          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: 12 }} />
          <Bar dataKey="count" fill={color} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AnonRankedList({ items, color, emptyText }: {
  items: { label: string; sublabel?: string; count: number }[];
  color: string;
  emptyText: string;
}) {
  if (items.length === 0)
    return <p className="text-gray-500 text-sm text-center py-6">{emptyText}</p>;
  const max = items[0]?.count || 1;
  return (
    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition">
          <span className="text-gray-500 text-xs w-5 shrink-0 text-right">{idx + 1}.</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-200 truncate leading-tight">{item.label}</p>
            {item.sublabel && <p className="text-[10px] text-gray-500 truncate">{item.sublabel}</p>}
            <div className="h-1 rounded-full mt-1" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-1 rounded-full" style={{ width: `${Math.round((item.count / max) * 100)}%`, background: color }} />
            </div>
          </div>
          <span className="text-sm font-semibold text-white shrink-0">{item.count.toLocaleString()}</span>
        </div>
      ))}
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
type RoleFilter = "all" | "publisher" | "viewer" | "user" | "owner" | "partner_manager";
type UserRole = "owner" | "publisher" | "partner_manager" | "viewer";

// Super Admin icon: plain Shield in fuchsia, matching Admin amber shield style
function SuperAdminIcon({ size = 14 }: { size?: number }) {
  return <Shield style={{ width: size, height: size, color: "#e879f9" }} />;
}


function UsersTab() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "publisher" || currentUser?.role === "owner";
  const isOwner = currentUser?.role === "owner";
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  // Promote dialog: shows a role picker
  const [promoteDialog, setPromoteDialog] = useState<{
    open: boolean;
    userId: number;
    userName: string;
    currentRole: string;
    selectedRole: UserRole;
    step: 1 | 2;
  } | null>(null);
  // Demote/Remove confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: number;
    userName: string;
    currentRole: string;
    action: "demote" | "remove";
    step: 1 | 2;
  } | null>(null);

  const { data: users, isLoading, refetch } = trpc.admin.listUsers.useQuery(undefined, {
    enabled: currentUser?.role === "viewer" || currentUser?.role === "publisher" || currentUser?.role === "partner_manager" || currentUser?.role === "owner",
  });

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ name: "", email: "", role: "viewer" as "viewer" | "publisher" | "partner_manager" | "owner" });
  const addUserMutation = trpc.admin.addUser.useMutation({
    onSuccess: () => {
      const userName = addUserForm.name;
      setAddUserOpen(false);
      setAddUserForm({ name: "", email: "", role: "viewer" });
      refetch();
      toast.success(`${userName} added. They can sign in via WAVV.`);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateRole = trpc.admin.updateRole.useMutation({
    onSuccess: () => {
      if (promoteDialog) {
        const roleLabels: Record<UserRole, string> = { owner: "an Owner", publisher: "a Publisher", partner_manager: "a Partner Manager", viewer: "a Viewer" };
        toast.success(`${promoteDialog.userName} is now ${roleLabels[promoteDialog.selectedRole]}.`);
        setPromoteDialog(null);
      } else {
        toast.success(`Role updated.`);
        setConfirmDialog(null);
      }
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

  const ROLE_ORDER: Record<string, number> = { owner: 0, content_admin: 1, partner_admin: 2, admin: 3 };
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    // Only show internal team members — no public users or partners in this panel
    let list = (users ?? []).filter((u) => u.role === "viewer" || u.role === "publisher" || u.role === "partner_manager" || u.role === "owner");
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((u) => (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q));
    }
    // Sort by role order: Owner → Publisher → Partner Manager → Viewer
    list = [...list].sort((a, b) => (ROLE_ORDER[a.role ?? ""] ?? 99) - (ROLE_ORDER[b.role ?? ""] ?? 99));
    return list;
  }, [users, search, roleFilter]);

  const ownerCount = useMemo(() => (users ?? []).filter((u) => u.role === "owner").length, [users]);
  const superAdminCount = useMemo(() => (users ?? []).filter((u) => u.role === "publisher").length, [users]);
  const partnerAdminCount = useMemo(() => (users ?? []).filter((u) => u.role === "partner_manager").length, [users]);
  const adminCount = useMemo(() => (users ?? []).filter((u) => u.role === "viewer").length, [users]);
  const totalCount = ownerCount + superAdminCount + partnerAdminCount + adminCount;
  const statCards: { filter: RoleFilter; label: string; value: number; iconEl: React.ReactNode; color: string; bg: string; activeBorder: string; description: string }[] = [
    {
      filter: "all",
      label: "All Users",
      value: totalCount,
      iconEl: <Users className="h-5 w-5" style={{ color: "#60a5fa" }} />,
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.1)",
      activeBorder: "#60a5fa",
      description: "All internal team members across every role.",
    },
    {
      filter: "owner",
      label: "Owners",
      value: ownerCount,
      iconEl: <Crown className="h-5 w-5" style={{ color: "#fb923c" }} />,
      color: "#fb923c",
      bg: "rgba(251,146,60,0.1)",
      activeBorder: "#fb923c",
      description: "Full platform control. Can invite and remove all users, change any role, manage all content, and access every admin tab including Settings.",
    },
    {
      filter: "publisher",
      label: "Publishers",
      value: superAdminCount,
      iconEl: <SuperAdminIcon size={20} />,
      color: "#a78bfa",
      bg: "rgba(139,92,246,0.1)",
      activeBorder: "#a78bfa",
      description: "Can add and manage content in WAVV Academy, WAVV Webinars, and WAVV Resource Hub. Cannot access Partner content, Partner Analytics, or Site Settings.",
    },
    {
      filter: "partner_manager",
      label: "Partner Managers",
      value: partnerAdminCount,
      iconEl: <Shield className="h-5 w-5" style={{ color: "#00A9E2" }} />,
      color: "#00A9E2",
      bg: "rgba(0,169,226,0.1)",
      activeBorder: "#00A9E2",
      description: "Access to WAVV Partners content and the WAVV Partners portal. Can invite and manage WAVV Partner accounts. Read-only access to Access.",
    },
    {
      filter: "viewer",
      label: "Viewers",
      value: adminCount,
      iconEl: <Shield className="h-5 w-5" style={{ color: "#fbbf24" }} />,
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.1)",
      activeBorder: "#fbbf24",
      description: "Support-level access. Can view Access (read-only) to look up users and verify access. Cannot make any changes to users or content.",
    },
  ];

  function handlePromoteConfirm() {
    if (!promoteDialog) return;
    if (promoteDialog.step === 1) {
      // Move to confirmation step
      setPromoteDialog(d => d ? { ...d, step: 2 } : d);
      return;
    }
    updateRole.mutate({ userId: promoteDialog.userId, role: promoteDialog.selectedRole });
  }

  function handleConfirm() {
    if (!confirmDialog) return;
    if (confirmDialog.step === 1) {
      setConfirmDialog(d => d ? { ...d, step: 2 } : d);
      return;
    }
    if (confirmDialog.action === "remove") {
      removeUser.mutate({ userId: confirmDialog.userId });
    } else {
      // demote → drop one level
      const demotedRole: Record<string, string> = { owner: "publisher", publisher: "viewer", partner_manager: "viewer", viewer: "viewer" };
      updateRole.mutate({ userId: confirmDialog.userId, role: (demotedRole[confirmDialog.currentRole] ?? "viewer") as any });
    }
  }

  // Roles the current user can promote someone TO — per defined hierarchy rules:
  // Owner: can promote anyone to owner, content_admin, or partner_admin
  // Super Admin: can promote admin → content_admin only
  // Partner Admin: can promote admin → content_admin or partner_admin; content_admin → partner_admin
  function getPromotableRoles(targetCurrentRole: string): UserRole[] {
    const myRole = currentUser?.role;
    if (myRole === "owner") {
      // Owner can promote to owner, content_admin, or partner_admin (anything above admin, up to owner)
      const all: UserRole[] = ["partner_manager", "publisher", "owner"];
      // Only show roles strictly above the target's current role
      const hierarchy: UserRole[] = ["viewer", "partner_manager", "publisher", "owner"];
      const targetIdx = hierarchy.indexOf(targetCurrentRole as UserRole);
      return all.filter(r => hierarchy.indexOf(r) > targetIdx);
    }
    if (myRole === "publisher") {
      // Super Admin can only promote admin → content_admin
      if (targetCurrentRole === "viewer") return ["publisher"];
      return [];
    }
    if (myRole === "partner_manager") {
      // Partner Admin can promote admin → content_admin or partner_admin; content_admin → partner_admin
      if (targetCurrentRole === "viewer") return ["publisher", "partner_manager"];
      if (targetCurrentRole === "publisher") return ["partner_manager"];
      return [];
    }
    return [];
  }

  const isPending = updateRole.isPending || removeUser.isPending;

  // Export users filtered by current roleFilter
  function exportUsersCSV() {
    const list = roleFilter === "all" ? (users ?? []) : (users ?? []).filter((u) => u.role === roleFilter);
      const header = ["Name", "Email", "Access Level"].join(",");
    const rows = list.map((u) =>
      [
        `"${(u.name ?? "").replace(/"/g, '""')}"`,
        `"${(u.email ?? "").replace(/"/g, '""')}"`,
        u.role,
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

  const [usersSubTab, setUsersSubTab] = useState<"team" | "portal">("team");

  return (
    <div className="space-y-6">
      {/* Sub-tab switcher */}
      <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", width: "fit-content" }}>
        <button
          onClick={() => setUsersSubTab("team")}
          className="px-4 py-1.5 rounded-md text-xs font-medium transition-all"
          style={usersSubTab === "team" ? { background: "#0074F4", color: "#fff" } : { color: "rgba(255,255,255,0.5)" }}
        >
          WAVV Team
        </button>
        <button
          onClick={() => setUsersSubTab("portal")}
          className="px-4 py-1.5 rounded-md text-xs font-medium transition-all"
          style={usersSubTab === "portal" ? { background: "#0074F4", color: "#fff" } : { color: "rgba(255,255,255,0.5)" }}
        >
          WAVV Users
        </button>
      </div>

      {usersSubTab === "portal" && <PortalUsersPanel />}
      {usersSubTab === "team" && <>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-semibold text-white">Access</h2>
        <div className="flex items-center gap-2">

          <button
            onClick={exportUsersCSV}
            disabled={!users || users.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition disabled:opacity-40"
            style={{ background: "rgba(6,182,212,0.1)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.2)" }}
          >
            <FileDown size={13} />
            Export
          </button>
        </div>
      </div>

      {/* Read-only notice for non-owners */}
      {!isOwner && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", color: "#fbbf24" }}
        >
          <Info size={13} style={{ flexShrink: 0 }} />
          <span>You have <strong>read-only</strong> access. Use the search to look up users and verify their access. Contact an Owner to make changes.</span>
        </div>
      )}

      {/* Clickable stat cards */}
      <TooltipProvider delayDuration={200}>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
          {statCards.map((s) => {
            const active = roleFilter === s.filter;
            return (
              <button
                key={s.filter}
                onClick={() => setRoleFilter(active ? "all" : s.filter)}
                className="rounded-xl p-4 text-left transition-all relative"
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
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="text-2xl font-bold" style={{ color: active ? s.color : "#fff" }}>{s.value}</p>
                  </div>
                  {/* Info tooltip — stop propagation so clicking it doesn't toggle the filter */}
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="absolute top-2 right-2 flex items-center justify-center rounded-full cursor-default"
                        style={{ width: 18, height: 18 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Info size={13} style={{ color: "rgba(255,255,255,0.25)" }} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-[220px] text-xs leading-relaxed"
                      style={{ background: "#1d2230", border: "1px solid #3a3a4a", color: "#d1d5db" }}
                    >
                      <p className="font-semibold mb-1" style={{ color: s.color }}>{s.label}</p>
                      {s.description}
                    </TooltipContent>
                  </UITooltip>
                </div>
              </button>
            );
          })}
        </div>
      </TooltipProvider>

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
      <div className="rounded-xl overflow-hidden overflow-x-auto" style={{ border: "1px solid #2a2a2a" }}>
        <Table className="min-w-[560px]">
          <TableHeader>
            <TableRow style={{ background: "#1d2230", borderBottom: "1px solid #2a2a2a" }}>
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-gray-400">Email</TableHead>
              <TableHead className="text-gray-400">Access Level</TableHead>


              {isOwner && <TableHead className="text-gray-400">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isOwner ? 7 : 6} className="text-center py-12 text-gray-500">Loading users...</TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isOwner ? 6 : 5} className="text-center py-12 text-gray-500">
                  {search || roleFilter !== "all" ? "No users match your filter." : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const initials = (u.name ?? "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
                // Guard: only use avatarUrl if it's a non-empty, non-whitespace string
                const rawAvatarUrl = (u.avatarUrl ?? "").trim();
                // Strip any existing Google size suffix (e.g. =s96-c) before appending our own
                const pictureSrc = rawAvatarUrl ? `${rawAvatarUrl.replace(/=s\d+(-c)?$/, "")}=s40-c` : null;
                const pending = isSuperAdmin && u.role === "user" && isPendingPromotion(u.email);
                return (
                  <TableRow key={u.id} className="hover:bg-white/5 transition" style={{ borderBottom: "1px solid #1e1e1e", background: isSelf ? "rgba(0,116,244,0.05)" : "transparent" }}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {pictureSrc ? (
                          <img
                            src={pictureSrc}
                            alt={u.name ?? "Avatar"}
                            className="h-8 w-8 rounded-full object-cover shrink-0"
                            style={{ border: "2px solid rgba(255,255,255,0.1)" }}
                            onError={(e) => {
                              // On load failure, hide img and show sibling initials div
                              const img = e.currentTarget as HTMLImageElement;
                              img.style.display = "none";
                              const fallback = img.nextElementSibling as HTMLElement | null;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: "linear-gradient(135deg, #0074F4, #67C728)", display: pictureSrc ? "none" : "flex" }}
                        >
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
                        {u.role === "owner" ? (
                          <Badge className="text-[10px] flex items-center gap-1" style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.4)" }}>
                            <Crown className="h-3 w-3" /> Owner
                          </Badge>
                        ) : u.role === "publisher" ? (
                          <Badge className="text-[10px] flex items-center gap-1" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.4)" }}>
                            <SuperAdminIcon size={12} />
                            Publisher
                          </Badge>
                        ) : u.role === "partner_manager" ? (
                          <Badge className="text-[10px] flex items-center gap-1" style={{ background: "rgba(0,169,226,0.15)", color: "#00A9E2", border: "1px solid rgba(0,169,226,0.3)" }}>
                            <Users className="h-3 w-3" /> Partner Manager
                          </Badge>
                        ) : u.role === "viewer" ? (
                          <Badge className="text-[10px] flex items-center gap-1" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                            <Shield className="h-3 w-3" /> Viewer
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">User</Badge>
                        )}

                      </div>
                    </TableCell>


                    {isOwner && <TableCell>
                      {isSelf ? (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {/* Col 1: Change Role — triggers confirmation dialog */}
                          <button
                            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors"
                            style={{ background: "rgba(0,116,244,0.12)", color: "#60a5fa", border: "1px solid rgba(0,116,244,0.3)" }}
                            onClick={() => setPromoteDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, selectedRole: u.role as UserRole, step: 1 })}>
                            <ShieldOff className="h-3 w-3 flex-shrink-0" /> Change Role
                          </button>
                          {/* Col 4: Remove — triggers confirmation dialog */}
                          <button
                            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                            onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, action: "remove", step: 1 })}>
                            <Trash2 className="h-3 w-3 flex-shrink-0" /> Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {/* Change Role — owner only, full dropdown for any role */}
                          {isOwner && (
                            <button
                              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors"
                              style={{ background: "rgba(0,116,244,0.12)", color: "#60a5fa", border: "1px solid rgba(0,116,244,0.3)" }}
                              onClick={() => setPromoteDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, selectedRole: u.role as UserRole, step: 1 })}>
                              <ShieldOff className="h-3 w-3 flex-shrink-0" /> Change Role
                            </button>
                          )}
                          {/* Remove — owner only, cannot remove self */}
                          {isOwner && !isSelf && (
                            <button
                              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                              onClick={() => setConfirmDialog({ open: true, userId: u.id, userName: u.name ?? u.email ?? "User", currentRole: u.role, action: "remove", step: 1 })}>
                              <Trash2 className="h-3 w-3 flex-shrink-0" /> Remove
                            </button>
                          )}
                        </div>
                      )}
                    </TableCell>}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>


      {/* Promote dialog — role picker (step 1) + final confirm (step 2) */}
      <Dialog open={!!promoteDialog?.open} onOpenChange={(open) => { if (!open) setPromoteDialog(null); }}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          {promoteDialog?.step === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">Change Role — {promoteDialog?.userName}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Select the new role for <strong className="text-white">{promoteDialog?.userName}</strong>.
                  Current role: <span className="text-gray-300 capitalize">{promoteDialog?.currentRole?.replace(/_/g, " ")}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                {promoteDialog && (["owner", "publisher", "partner_manager", "viewer"] as UserRole[]).map((role) => {
                  const roleConfig: Record<UserRole, { label: string; color: string; bg: string; border: string }> = {
                    owner:        { label: "Owner",          color: "#fb923c", bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.35)" },
                    publisher:      { label: "Publisher",          color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.35)" },
                    partner_manager: { label: "Partner Manager",  color: "#00A9E2", bg: "rgba(0,169,226,0.12)",   border: "rgba(0,169,226,0.35)" },
                    viewer:       { label: "Viewer",              color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.35)" },
                  };
                  const cfg = roleConfig[role];
                  const isSelected = promoteDialog.selectedRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => setPromoteDialog(d => d ? { ...d, selectedRole: role } : d)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                      style={{
                        background: isSelected ? cfg.bg : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isSelected ? cfg.color : "#2a2a2a"}`,
                        color: isSelected ? cfg.color : "#9ca3af",
                      }}
                    >
                      <span className="flex-1">{cfg.label}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4" style={{ color: cfg.color }} />}
                    </button>
                  );
                })}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setPromoteDialog(null)} disabled={isPending}>Cancel</Button>
                <Button
                  onClick={handlePromoteConfirm}
                  disabled={isPending || promoteDialog?.selectedRole === promoteDialog?.currentRole}
                  style={{ background: "#0074F4", color: "#fff" }}
                >
                  {isPending ? "Saving..." : "Continue"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">Confirm Role Change</DialogTitle>
                <DialogDescription className="text-gray-400">
                  You're about to change <strong className="text-white">{promoteDialog?.userName}</strong>'s role from{" "}
                  <span className="text-gray-300 capitalize">{promoteDialog?.currentRole?.replace(/_/g, " ")}</span> to{" "}
                  <span className="text-white font-semibold capitalize">{promoteDialog?.selectedRole?.replace(/_/g, " ")}</span>.
                  This will immediately update their permissions across the platform. Are you sure you want to proceed?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setPromoteDialog(d => d ? { ...d, step: 1 } : d)} disabled={isPending}>Back</Button>
                <Button
                  onClick={handlePromoteConfirm}
                  disabled={isPending}
                  style={{ background: "#0074F4", color: "#fff" }}
                >
                  {isPending ? "Saving..." : `Yes, Change to ${promoteDialog?.selectedRole?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Demote / Remove confirm dialog — two-step */}
      <Dialog open={!!confirmDialog?.open} onOpenChange={(open) => { if (!open) setConfirmDialog(null); }}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          {confirmDialog?.step === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">
                  {confirmDialog?.action === "demote" ? "Change Role" : "Remove User"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {confirmDialog?.action === "demote" && (
                    <>You're about to change the role for <strong className="text-white">{confirmDialog.userName}</strong>. They will be moved down one permission level from <span className="text-gray-300 capitalize">{confirmDialog.currentRole.replace(/_/g, " ")}</span>. Do you want to continue?</>
                  )}
                  {confirmDialog?.action === "remove" && (
                    <>You're about to remove <strong className="text-white">{confirmDialog?.userName}</strong> from the platform. They will immediately lose all access. This action cannot be undone. Do you want to continue?</>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setConfirmDialog(null)} disabled={isPending}>Cancel</Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isPending}
                  style={confirmDialog?.action === "remove" ? { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" } : { background: "#0074F4", color: "#fff" }}
                >
                  {isPending ? "Processing..." : "Yes, Continue"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-white" style={{ color: confirmDialog?.action === "remove" ? "#ef4444" : undefined }}>
                  {confirmDialog?.action === "remove" ? "Are you absolutely sure?" : "Confirm Role Change"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {confirmDialog?.action === "remove" ? (
                    <>This is your final confirmation. <strong className="text-white">{confirmDialog?.userName}</strong> will be permanently removed and will lose all access immediately. There is no undo.</>
                  ) : (
                    <>This is your final confirmation. <strong className="text-white">{confirmDialog?.userName}</strong>'s role will be changed and their permissions will update immediately.</>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setConfirmDialog(d => d ? { ...d, step: 1 } : d)} disabled={isPending}>Back</Button>
                <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
                  {isPending ? "Processing..." : confirmDialog?.action === "demote" ? "Yes, Change Role" : "Yes, Remove User"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={(open) => { if (!open) { setAddUserOpen(false); setAddUserForm({ name: "", email: "", role: "viewer" }); } }}>
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
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Access Level</label>
              <select
                value={addUserForm.role}
                onChange={(e) => setAddUserForm(f => ({ ...f, role: e.target.value as "viewer" | "publisher" | "partner_manager" | "owner" }))}
                className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={{ background: "#111", border: "1px solid #2a2a2a" }}
              >
                <option value="owner">Owner</option>
                <option value="publisher">Publisher</option>
                <option value="partner_manager">Partner Manager</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddUserOpen(false)} className="text-gray-400">Cancel</Button>
            <Button
              onClick={() => {
                if (!addUserForm.name.trim() || !addUserForm.email.trim()) { toast.error("Name and email are required."); return; }
                addUserMutation.mutate({ ...addUserForm });
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
      </> /* end WAVV Team sub-tab */}
    </div>
  );
}
// ─── Portal Users Panel ────────────────────────────────────────────────────────────
const SUBSCRIPTION_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE:            { label: "Active",           color: "#4ade80" },
  TRIALING:          { label: "Trialing",         color: "#60a5fa" },
  SCHEDULED_CANCEL:  { label: "Canceling",        color: "#fb923c" },
  CANCELED:          { label: "Canceled",         color: "#f87171" },
  INCOMPLETE:        { label: "Incomplete",       color: "#fbbf24" },
  NONE:              { label: "No Subscription",  color: "rgba(255,255,255,0.3)" },
};

function PortalUsersPanel() {
  const [accountTypeFilter, setAccountTypeFilter] = useState<"all" | "customer" | "guest">("all");
  const [subStatusFilter, setSubStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = trpc.admin.listPortalUsers.useQuery({
    accountType: accountTypeFilter,
    subscriptionStatus: subStatusFilter === "all" ? undefined : subStatusFilter,
    search: debouncedSearch || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const portalUsers = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const customerCount = portalUsers.filter(u => u.accountType === "customer").length;
  const guestCount = portalUsers.filter(u => u.accountType === "guest").length;

  function exportPortalCSV() {
    if (!portalUsers.length) return;
    const headers = ["Name", "Email", "Account Type", "Subscription Status", "Plan", "WAVV Account ID", "First Seen", "Last Login"];
    const rows = portalUsers.map(u => [
      u.name ?? "",
      u.email ?? "",
      u.accountType ?? "",
      u.subscriptionStatus ?? "",
      u.wavvPlan ?? "",
      u.wavvAccountId ?? "",
      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
      u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString() : "",
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portal-users-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-semibold text-white">Portal Users</h2>
        <div className="flex items-center gap-3">
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {total.toLocaleString()} total users
          </div>
          <button
            onClick={exportPortalCSV}
            disabled={!portalUsers.length}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
            style={{ background: "rgba(0,116,244,0.15)", border: "1px solid rgba(0,116,244,0.3)", color: "#60a5fa" }}
          >
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {/* Stat chips */}
      <div className="flex items-center gap-3 flex-wrap">
        {([
          { key: "all",      label: "All",       count: total },
          { key: "customer", label: "Customers", count: customerCount },
          { key: "guest",    label: "Guests",    count: guestCount },
        ] as const).map(chip => (
          <button
            key={chip.key}
            onClick={() => { setAccountTypeFilter(chip.key); setPage(0); }}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={accountTypeFilter === chip.key
              ? { background: "#0074F4", color: "#fff" }
              : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {chip.label} {chip.count > 0 && <span className="opacity-70">({chip.count})</span>}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name or email..."
          className="px-3 py-1.5 rounded-lg text-xs outline-none w-56"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
        />
        <select
          value={subStatusFilter}
          onChange={e => { setSubStatusFilter(e.target.value); setPage(0); }}
          className="px-3 py-1.5 rounded-lg text-xs outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
        >
          <option value="all">All Subscription Statuses</option>
          {Object.entries(SUBSCRIPTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-[#0074F4] border-t-transparent animate-spin" />
        </div>
      ) : portalUsers.length === 0 ? (
        <div className="text-center py-12 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No users found.</div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                <TableHead className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>User</TableHead>
                <TableHead className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Type</TableHead>
                <TableHead className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Subscription</TableHead>
                <TableHead className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Plan</TableHead>
                <TableHead className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>WAVV Account ID</TableHead>
                <TableHead className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>First Seen</TableHead>
                <TableHead className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Last Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portalUsers.map(u => {
                const sub = u.subscriptionStatus ? SUBSCRIPTION_LABELS[u.subscriptionStatus] : null;
                return (
                  <TableRow key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "rgba(0,116,244,0.2)", color: "#60a5fa" }}>
                            {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-medium text-white">{u.name ?? "—"}</div>
                          <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{u.email ?? "—"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={u.accountType === "customer" ? { background: "rgba(74,222,128,0.1)", color: "#4ade80" } : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                        {u.accountType === "customer" ? "Customer" : "Guest"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {sub ? (
                        <span className="text-xs font-medium" style={{ color: sub.color }}>{sub.label}</span>
                      ) : (
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs" style={{ color: u.wavvPlan ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>
                        {u.wavvPlan ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono" style={{ color: u.wavvAccountId ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}>
                        {u.wavvAccountId ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString() : "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded text-xs disabled:opacity-30 transition"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
            >← Prev</button>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded text-xs disabled:opacity-30 transition"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
            >Next →</button>
          </div>
        </div>
      )}
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
  categoryIcon,
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
  categoryIcon?: React.ElementType;
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
        {/* Dark gradient background */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #0a0c12 0%, ${accentColor}18 100%)` }} />
        {/* Large icon watermark — right side */}
        {categoryIcon && React.createElement(categoryIcon, {
          size: 100, strokeWidth: 1.2,
          className: "absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none",
          style: { opacity: 0.35, color: accentColor }
        })}
        {/* Colour glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 85% 50%, ${accentColor}30 0%, transparent 60%)` }} />
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
                {/* Reorder arrows — content_admin only, shown on hover */}
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
  categoryKey, label, subtitle, color, icon,
  inactiveCourses, inactiveLessons, allLessons,
  onDeactivateLesson, onActivateLesson, onDeleteCourse, onDeleteLesson,
}: {
  categoryKey: string; label: string; subtitle?: string; color: string; icon?: React.ElementType;
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
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #0a0c12 0%, ${color}18 100%)` }} />
        {icon && React.createElement(icon, { size: 100, strokeWidth: 1.2, className: "absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none", style: { opacity: 0.35, color } })}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 85% 50%, ${color}30 0%, transparent 60%)` }} />
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
  // ── Academy Section Visibility ──
  const { data: academyVisRaw } = trpc.siteSettings.get.useQuery({ key: "academy_sections_visibility" });
  const academyVis: Record<string, boolean> = (academyVisRaw as Record<string, boolean> | null) ?? { Onboarding: true, "How-To": true, "Strategy and Best Practices": true };
  const updateAcademyVis = trpc.siteSettings.update.useMutation({
    onSuccess: () => { utils.siteSettings.get.invalidate(); toast.success("Visibility updated"); },
    onError: (e) => toast.error(e.message),
  });
  function toggleAcademySection(key: string) {
    updateAcademyVis.mutate({ key: "academy_sections_visibility", value: { ...academyVis, [key]: !academyVis[key] } });
  }
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
  const [newVideoForm, setNewVideoForm] = useState({ title: "", videoUrl: "", description: "", durationMinutes: "", durationSeconds: 0, tags: "" });
  const [loomFetchStatus, setLoomFetchStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const fetchLoomDurationMutation = trpc.academy.fetchLoomDuration.useMutation();

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
    setNewVideoForm({ title: "", videoUrl: "", description: "", durationMinutes: "", durationSeconds: 0, tags: "" });
    setLoomFetchStatus("idle");
    setAddVideoDialog({ courseId, courseTitle });
  }

  async function handleVideoUrlChange(url: string) {
    setNewVideoForm((f) => ({ ...f, videoUrl: url }));
    if (url.includes("loom.com")) {
      setLoomFetchStatus("loading");
      try {
        const result = await fetchLoomDurationMutation.mutateAsync({ videoUrl: url });
        if (result.durationSeconds != null) {
          const mins = Math.floor(result.durationSeconds / 60);
          const secs = result.durationSeconds % 60;
          setNewVideoForm((f) => ({ ...f, durationMinutes: String(mins), durationSeconds: secs }));
          setLoomFetchStatus("done");
        } else {
          setLoomFetchStatus("error");
        }
      } catch {
        setLoomFetchStatus("error");
      }
    } else {
      setLoomFetchStatus("idle");
    }
  }

  function confirmAddVideo() {
    if (!addVideoDialog || !newVideoForm.title.trim()) return;
    createLesson.mutate({
      courseId: addVideoDialog.courseId,
      title: newVideoForm.title.trim(),
      videoUrl: newVideoForm.videoUrl.trim() || undefined,
      description: newVideoForm.description.trim() || undefined,
      durationMinutes: newVideoForm.durationMinutes ? parseInt(newVideoForm.durationMinutes) : undefined,
      durationSeconds: newVideoForm.durationSeconds || undefined,
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

  // Mirror the exact Academy category order, display names, colors, icons, subtitles, and video counts
  const ACADEMY_CATEGORIES = [
    {
      key: "Onboarding",
      label: "Onboarding",
      subtitle: "Get your team up and running with WAVV",
      color: "#0074F4",
      icon: Rocket,
      videoCount: 12,
    },
    {
      key: "How-To",
      label: "How-To",
      subtitle: "Step-by-step guides for core WAVV features",
      color: "#00A9E2",
      icon: Wrench,
      videoCount: 9,
    },
    {
      key: "Strategy and Best Practices",
      label: "Strategy & Best Practices",
      subtitle: "Maximize connection rates, conversions, and team performance",
      color: "#67C728",
      icon: Lightbulb,
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
      {/* Hero header */}
      <div className="rounded-xl p-4 mb-6 flex items-center gap-3" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,116,244,0.15)" }}>
          <GraduationCap size={18} style={{ color: "#0074F4" }} />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">WAVV Academy</h2>
          <p className="text-xs text-gray-500">Manage courses, lessons, and learning content for all Academy categories</p>
        </div>
      </div>

      {/* ── Section Visibility Divider ── */}
      <div className="flex items-center gap-3 pt-2 mb-3">
        <div className="h-px flex-1" style={{ background: "linear-gradient(to right, #2a2a2a, transparent)" }} />
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#4b5563" }}>Visibility Controls</span>
        <div className="h-px flex-1" style={{ background: "linear-gradient(to left, #2a2a2a, transparent)" }} />
      </div>
      {/* ── Section Visibility ── */}
      <div className="rounded-xl p-4 space-y-3 mb-6" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center gap-2 mb-1">
          <Eye size={13} style={{ color: "#9ca3af" }} />
          <span className="text-xs font-semibold text-gray-300">Section Visibility</span>
          <span className="text-xs text-gray-500 ml-1">— toggle to show/hide categories from users</span>
        </div>
        {[
          { key: "Onboarding",                    label: "Onboarding",                    color: "#0074F4" },
          { key: "How-To",                         label: "How-To",                         color: "#00A9E2" },
          { key: "Strategy and Best Practices",    label: "Strategy & Best Practices",      color: "#67C728" },
        ].map(({ key, label, color }, i, arr) => (
          <React.Fragment key={key}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-xs text-gray-300">{label}</span>
              </div>
              <button
                onClick={() => toggleAcademySection(key)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition"
                style={academyVis[key] !== false
                  ? { background: "rgba(103,199,40,0.15)", color: "#67C728", border: "1px solid rgba(103,199,40,0.3)" }
                  : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid #2a2a2a" }
                }
              >
                {academyVis[key] !== false ? <><Eye size={11} /> Visible</> : <><EyeOff size={11} /> Hidden</>}
              </button>
            </div>
            {i < arr.length - 1 && <div className="h-px" style={{ background: "#2a2a2a" }} />}
          </React.Fragment>
        ))}
      </div>

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
          {ACADEMY_CATEGORIES.map(({ key, label, subtitle, color, icon: CatIcon, videoCount }) => {
            // All published courses for this category = the live sections
            const categoryCourses = (byCategory[key] ?? []).filter((c) => c.published);
            return (
              <CategoryBlock
                key={key}
                categoryKey={key}
                categoryLabel={label}
                categoryIcon={CatIcon}
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
                {ACADEMY_CATEGORIES.map(({ key, label, subtitle, color, icon: CatIcon }) => {
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
                      icon={CatIcon}
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
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                className="bg-black/30 border-white/10 text-white placeholder:text-gray-600"
              />
              {loomFetchStatus === "loading" && <p className="text-xs text-blue-400 mt-1">Fetching duration from Loom…</p>}
              {loomFetchStatus === "done" && <p className="text-xs text-green-400 mt-1">Duration auto-filled from Loom.</p>}
              {loomFetchStatus === "error" && <p className="text-xs text-amber-400 mt-1">Could not fetch duration — enter manually.</p>}
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
  const isSuperAdmin = user?.role === "publisher";

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
    pipEnabled?: boolean | null;
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
  const [editPipEnabled, setEditPipEnabled] = React.useState(lesson.pipEnabled !== false);
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
        pipEnabled: editPipEnabled,
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
    setEditPipEnabled(lesson.pipEnabled !== false);
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
          {/* PiP toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={editPipEnabled}
              onChange={(e) => setEditPipEnabled(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-blue-500"
            />
            <span className="text-xs text-gray-400">Enable Pop-out (Picture-in-Picture) for this video</span>
          </label>
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
  const { data: siteSettings = {} } = trpc.siteSettings.getAll.useQuery();
  const playgroundUnderConstruction = true; // Always under construction in Content Management
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
      {/* ── Under Construction overlay ── */}
      {playgroundUnderConstruction && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(168,85,247,0.07)", border: "2px dashed rgba(168,85,247,0.35)" }}>
          <div className="flex flex-col items-center justify-center text-center py-16 px-8 gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)" }}>
              <AlertTriangle size={40} style={{ color: "#a855f7" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">WAVV Playground</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc" }}>
                <AlertTriangle size={11} />
                Under Construction
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
              The WAVV Playground is currently <span className="text-white font-medium">under construction</span>. Disable this banner in Settings when the Playground is ready to go live.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mt-2">
              {[
                { icon: <FlaskConical size={14} />, label: "Hands-On Demos" },
                { icon: <Bell size={14} />, label: "Session Requests" },
                { icon: <BarChart3 size={14} />, label: "Usage Analytics" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium" style={{ background: "rgba(168,85,247,0.1)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.2)" }}>
                  {icon} {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
            <FlaskConical size={18} style={{ color: "#a855f7" }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">WAVV Playground</h2>
            <p className="text-xs text-gray-500">Playground session requests and hands-on demo management</p>
          </div>
        </div>
        <button
          onClick={exportCSVRequests}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition"
          style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.3)" }}
        >
          <FileDown size={13} /> Export Notify Requests
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
    type: "evergreen" as "upcoming" | "recording" | "exclusive" | "evergreen",
    registrationUrl: "",
    videoUrl: "",
    scheduledAt: "",
    accentColor: "#0074F4",
    iconName: "Video",
    thumbnailUrl: "",
    pipEnabled: true,
    comingSoon: false,
  });

  const createMutation = trpc.webinars.adminCreate.useMutation({
    onSuccess: () => { utils.webinars.adminList.invalidate(); setShowForm(false); resetForm(); toast.success("Webinar created"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.webinars.adminUpdate.useMutation({
    onSuccess: () => { utils.webinars.adminList.invalidate(); setShowForm(false); setEditId(null); resetForm(); toast.success("Webinar updated"); },
    onError: (e) => toast.error(e.message),
  });
  const uploadWebinarThumbnail = trpc.webinars.uploadThumbnail.useMutation();
  const deleteMutation = trpc.webinars.adminDelete.useMutation({
    onSuccess: () => { utils.webinars.adminList.invalidate(); toast.success("Webinar deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const uploadVideoMutation = trpc.webinars.uploadVideo.useMutation({
    onError: (e) => toast.error("Video upload failed: " + e.message),
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) { toast.error(`Image too large — max ${maxMb} MB`); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setUploadingThumb(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadWebinarThumbnail.mutateAsync({ base64, mimeType: file.type });
      setForm(f => ({ ...f, thumbnailUrl: result.url }));
      toast.success("Thumbnail uploaded");
    } catch { toast.error("Thumbnail upload failed"); } finally { setUploadingThumb(false); }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxMb = 500;
    if (file.size > maxMb * 1024 * 1024) { toast.error(`Video too large — max ${maxMb} MB`); return; }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
    type AllowedMime = "video/mp4" | "video/webm" | "video/ogg" | "video/quicktime";
    const mimeMap: Record<string, AllowedMime> = { mp4: "video/mp4", webm: "video/webm", ogg: "video/ogg", mov: "video/quicktime" };
    const mimeType = mimeMap[ext];
    if (!mimeType) { toast.error("Unsupported format — use MP4, WebM, OGG, or MOV"); return; }
    setUploadingVideo(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadVideoMutation.mutateAsync({ base64, mimeType, fileName: file.name });
      setForm(f => ({ ...f, videoUrl: result.url }));
      toast.success("Video uploaded to platform storage");
    } catch { /* handled by onError */ } finally { setUploadingVideo(false); }
  }

  function resetForm() { setForm({ title: "", description: "", host: "", type: "evergreen" as "upcoming" | "recording" | "exclusive" | "evergreen", registrationUrl: "", videoUrl: "", scheduledAt: "", accentColor: "#0074F4", iconName: "Video", thumbnailUrl: "", pipEnabled: true, comingSoon: false }); }

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
      iconName: (w as { iconName?: string | null }).iconName ?? "Video",
      thumbnailUrl: w.thumbnailUrl ?? "",
      pipEnabled: (w as { pipEnabled?: boolean | null }).pipEnabled !== false,
      comingSoon: !!(w as { comingSoon?: boolean | null }).comingSoon,
    });
    setShowForm(true);
  }

  function normalizeUrl(url: string): string | undefined {
    if (!url.trim()) return undefined;
    if (/^https?:\/\//i.test(url.trim())) return url.trim();
    return `https://${url.trim()}`;
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
        registrationUrl: normalizeUrl(form.registrationUrl),
        videoUrl: normalizeUrl(form.videoUrl),
        thumbnailUrl: form.thumbnailUrl || undefined,
        accentColor: form.accentColor || undefined,
        iconName: form.iconName || undefined,
        scheduledAt: scheduledAtDate,
        pipEnabled: form.pipEnabled,
        comingSoon: form.comingSoon,
      }});
    } else {
      createMutation.mutate({
        title: form.title,
        description: form.description || undefined,
        host: form.host || undefined,
        type: form.type,
        registrationUrl: normalizeUrl(form.registrationUrl),
        videoUrl: normalizeUrl(form.videoUrl),
        thumbnailUrl: form.thumbnailUrl || undefined,
        accentColor: form.accentColor || undefined,
        iconName: form.iconName || undefined,
        scheduledAt: scheduledAtDate,
        pipEnabled: form.pipEnabled,
        comingSoon: form.comingSoon,
      });
    }
  }

  const inputStyle: React.CSSProperties = { background: "#111", border: "1px solid #2a2a2a", color: "#fff", borderRadius: "8px", padding: "8px 10px", fontSize: "13px", width: "100%", outline: "none" };

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.15)" }}>
            <VideoIcon size={18} style={{ color: "#10b981" }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">WAVV Webinars</h2>
            <p className="text-xs text-gray-500">Manage on-demand series, exclusive live webinars, and recordings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
                  <option value="exclusive">Upcoming WAVV Exclusive Live Webinars</option>
                   <option value="evergreen">WAVV On-Demand Series</option>
                   <option value="recording">WAVV Exclusive On-Demand Webinars</option>
                </select>
              </div>
              <div>
                {(form.type === "recording" || form.type === "evergreen") ? (
                  <>
                    <label className="block text-xs text-gray-400 mb-1">Video <span className="text-gray-600">(upload or paste URL)</span></label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition hover:opacity-90 flex-shrink-0"
                          style={{ background: uploadingVideo ? "#252d3d" : "#1d2230", border: "1px solid #3a3a3a", color: uploadingVideo ? "#9ca3af" : "#fff" }}
                        >
                          {uploadingVideo ? (
                            <><span className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full inline-block" /> Uploading...</>
                          ) : (
                            <><FileDown size={13} /> Upload Video</>
                          )}
                          <input type="file" accept=".mp4,.webm,.ogg,.mov" className="hidden" onChange={handleVideoUpload} disabled={uploadingVideo} />
                        </label>
                        {form.videoUrl && form.videoUrl.startsWith("/manus-storage") && (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Hosted on platform
                          </span>
                        )}
                      </div>
                      <input style={inputStyle} value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="Or paste external URL (YouTube, Vimeo, etc.)" />
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block text-xs text-gray-400 mb-1">Registration URL</label>
                    <input style={inputStyle} value={form.registrationUrl} onChange={e => setForm(f => ({ ...f, registrationUrl: e.target.value }))} placeholder="https://zoom.us/webinar/register/..." />
                    <p className="text-[11px] text-gray-600 mt-1">Full URL required. If you omit https://, it will be added automatically.</p>
                  </>
                )}
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
            {form.type === "exclusive" ? (
              /* Exclusive Live Webinar: star circuit board is the locked default */
              <div>
                <label className="block text-xs text-gray-400 mb-2">Thumbnail Image <span className="text-gray-600">(star circuit board is the default — upload a custom image to override)</span></label>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative rounded-lg overflow-hidden flex-shrink-0" style={{ width: 80, height: 45, border: form.thumbnailUrl ? "2px solid #1a1a1a" : "2px solid #D4AF37", boxShadow: form.thumbnailUrl ? "none" : "0 0 8px #D4AF3766" }}>
                    <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-thumb-exclusive-v2-gGXX6nYRkYWDJDcBByZ8iX.webp" alt="Default" className="w-full h-full object-contain" style={{ padding: "4px", background: "#0a0c12" }} />
                    {!form.thumbnailUrl && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(212,175,55,0.2)" }}>
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#D4AF37" }}>
                          <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {form.thumbnailUrl ? (
                      <span className="text-amber-400">Custom image set</span>
                    ) : (
                      <span>Default star thumbnail (active)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition hover:opacity-90 flex-shrink-0"
                    style={{ background: uploadingThumb ? "#252d3d" : "#1d2230", border: "1px solid #3a3a3a", color: uploadingThumb ? "#9ca3af" : "#fff" }}
                  >
                    {uploadingThumb ? (
                      <><span className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full inline-block" /> Uploading...</>
                    ) : (
                      <><ImageIcon size={13} /> Upload Custom Image</>
                    )}
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleThumbUpload} disabled={uploadingThumb} />
                  </label>
                  {form.thumbnailUrl && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, thumbnailUrl: "" }))}
                      className="text-xs text-gray-500 hover:text-red-400 transition"
                    >
                      Reset to default
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Non-exclusive: default bg preview + optional custom thumbnail upload */
              <div className="space-y-3">
                {/* Default background preview */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Thumbnail Image <span className="text-gray-600">(section default shown — upload a custom image to override)</span></label>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative rounded-lg overflow-hidden flex-shrink-0" style={{ width: 80, height: 45, border: form.thumbnailUrl ? "2px solid #1a1a1a" : `2px solid ${form.type === "recording" ? "#00A9E2" : "#7C3AED"}`, boxShadow: form.thumbnailUrl ? "none" : `0 0 8px ${form.type === "recording" ? "#00A9E244" : "#7C3AED44"}` }}>
                      <img
                        src={form.type === "recording"
                          ? "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-bg-exclusive-ondemand-clapperboard-XGLnb93SFV6vDUAxePhB3u.webp"
                          : "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-bg-ondemand-playcircle-86q8N7uvwmsgxRr4MDpcr4.webp"}
                        alt="Default"
                        className="w-full h-full object-cover"
                      />
                      {!form.thumbnailUrl && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: `rgba(${form.type === "recording" ? "0,169,226" : "124,58,237"},0.2)` }}>
                          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: form.type === "recording" ? "#00A9E2" : "#7C3AED" }}>
                            <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {form.thumbnailUrl ? (
                        <span style={{ color: form.type === "recording" ? "#00A9E2" : "#7C3AED" }}>Custom image set</span>
                      ) : (
                        <span>Default {form.type === "recording" ? "clapperboard" : "play circle"} thumbnail (active)</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Icon picker — selects the overlay icon shown on the circuit-board background */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Card Icon <span className="text-gray-600">(shown centered on the card background)</span></label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {([
                      { name: "Video",         Icon: Video },
                      { name: "Play",          Icon: Play },
                      { name: "PlayCircle",    Icon: PlayCircle },
                      { name: "Mic",           Icon: Mic },
                      { name: "Radio",         Icon: Radio },
                      { name: "Phone",         Icon: Phone },
                      { name: "PhoneCall",     Icon: PhoneCall },
                      { name: "PhoneOutgoing", Icon: PhoneOutgoing },
                      { name: "PhoneMissed",   Icon: PhoneMissed },
                      { name: "PhoneOff",      Icon: PhoneOff },
                      { name: "Headphones",    Icon: Headphones },
                      { name: "MessageSquare", Icon: MessageSquare },
                      { name: "Mail",          Icon: Mail },
                      { name: "Users",         Icon: Users },
                      { name: "UserCheck",     Icon: UserCheck },
                      { name: "GraduationCap", Icon: GraduationCap },
                      { name: "BookOpen",      Icon: BookOpen },
                      { name: "FileText",      Icon: FileText },
                      { name: "Lightbulb",     Icon: Lightbulb },
                      { name: "Star",          Icon: Star },
                      { name: "Award",         Icon: Award },
                      { name: "Trophy",        Icon: Trophy },
                      { name: "Rocket",        Icon: Rocket },
                      { name: "Target",        Icon: Target },
                      { name: "Zap",           Icon: Zap },
                      { name: "BarChart3",     Icon: BarChart3 },
                      { name: "TrendingUp",    Icon: TrendingUp },
                      { name: "Activity",      Icon: Activity },
                      { name: "ListChecks",    Icon: ListChecks },
                      { name: "ClipboardList", Icon: ClipboardList },
                      { name: "Crosshair",     Icon: Crosshair },
                      { name: "Megaphone",     Icon: Megaphone },
                      { name: "Repeat",        Icon: Repeat },
                      { name: "Shuffle",       Icon: Shuffle },
                      { name: "Clapperboard",  Icon: Clapperboard },
                      { name: "MonitorPlay",   Icon: MonitorPlay },
                    ] as { name: string; Icon: React.ElementType }[]).map(({ name, Icon }) => {
                      const isSelected = form.iconName === name;
                      const sectionAccent = form.type === "recording" ? "#00A9E2" : "#7C3AED";
                      return (
                        <button
                          key={name}
                          type="button"
                          title={name}
                          onClick={() => setForm(f => ({ ...f, iconName: name }))}
                          className="flex items-center justify-center rounded-lg transition-all"
                          style={{
                            aspectRatio: "1",
                            background: isSelected ? `${sectionAccent}22` : "#111",
                            border: isSelected ? `1.5px solid ${sectionAccent}` : "1.5px solid #2a2a2a",
                            boxShadow: isSelected ? `0 0 8px ${sectionAccent}44` : "none",
                            padding: "8px",
                          }}
                        >
                          <Icon size={16} style={{ color: isSelected ? sectionAccent : "#6b7280" }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Optional custom thumbnail — replaces the background entirely when set */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Custom Thumbnail <span className="text-gray-600">(optional — replaces the default background)</span></label>
                  <div className="flex items-center gap-2">
                    <label
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition hover:opacity-90 flex-shrink-0"
                      style={{ background: uploadingThumb ? "#252d3d" : "#1d2230", border: "1px solid #3a3a3a", color: uploadingThumb ? "#9ca3af" : "#fff" }}
                    >
                      {uploadingThumb ? (
                        <><span className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full inline-block" /> Uploading...</>
                      ) : (
                        <><ImageIcon size={13} /> Upload Image</>
                      )}
                      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleThumbUpload} disabled={uploadingThumb} />
                    </label>
                    {form.thumbnailUrl && (
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, thumbnailUrl: "" }))}
                        className="text-xs text-gray-500 hover:text-red-400 transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    style={{ ...inputStyle, marginTop: "8px" }}
                    value={form.thumbnailUrl}
                    onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))}
                    placeholder="Or paste a custom thumbnail URL..."
                  />
                </div>
              </div>
            )}
            {/* Accent color is now hardcoded per section type — no picker needed */}
            {/* PiP toggle — hidden for exclusive live webinars (they link to registration, not video) */}
            <div className="flex flex-col gap-2 mt-1">
              {form.type !== "exclusive" && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.pipEnabled}
                    onChange={(e) => setForm(f => ({ ...f, pipEnabled: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded accent-blue-500"
                  />
                  <span className="text-xs text-gray-400">Enable Pop-out (Picture-in-Picture) for this webinar</span>
                </label>
              )}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.comingSoon}
                  onChange={(e) => setForm(f => ({ ...f, comingSoon: e.target.checked }))}
                  className="w-3.5 h-3.5 rounded accent-yellow-400"
                />
                <span className="text-xs" style={{ color: form.comingSoon ? '#F59E0B' : '#6b7280' }}>
                  Mark as Coming Soon (hides video/register button, shows Coming Soon banner)
                </span>
              </label>
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

      {/* ── Section Visibility Divider ── */}
      <div className="flex items-center gap-3 pt-2 mb-3">
        <div className="h-px flex-1" style={{ background: "linear-gradient(to right, #2a2a2a, transparent)" }} />
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#4b5563" }}>Visibility Controls</span>
        <div className="h-px flex-1" style={{ background: "linear-gradient(to left, #2a2a2a, transparent)" }} />
      </div>
      {/* Section Visibility Toggles */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center gap-2 mb-1">
          <Eye size={13} style={{ color: "#9ca3af" }} />
          <span className="text-xs font-semibold text-gray-300">Section Visibility</span>
          <span className="text-xs text-gray-500 ml-1">— toggle to show/hide sections from users</span>
        </div>
        {[
          { key: "evergreen",  label: "WAVV On-Demand Series",                    color: "#67C728" },
          { key: "exclusive",  label: "Upcoming WAVV Exclusive Live Webinars",     color: "#0074F4" },
          { key: "recordings", label: "WAVV Exclusive On-Demand Webinars",         color: "#FF9900" },
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
  evergreen:  { label: "WAVV On-Demand Series",                color: "#67C728", description: "Always-available training content" },
  exclusive:  { label: "Upcoming WAVV Exclusive Live Webinars", color: "#0074F4", description: "Live or invite-only sessions" },
  recording:  { label: "WAVV Exclusive On-Demand Webinars",    color: "#FF9900", description: "Recorded sessions available anytime" },
  upcoming:   { label: "Upcoming (Legacy)",    color: "#6b7280", description: "Legacy upcoming entries" },
};

// ─── Sortable row wrapper (shared by webinars + guides) ───────────────────────
function SortableTableRow({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <TableRow
      ref={setNodeRef}
      style={{
        borderColor: "#252d3d",
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? "rgba(0,116,244,0.08)" : "transparent",
        cursor: "grab",
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </TableRow>
  );
}

function WebinarGroups({
  webinars,
  onEdit,
  onDelete,
}: {
  webinars: import("../../../drizzle/schema").Webinar[];
  onEdit: (w: import("../../../drizzle/schema").Webinar) => void;
  onDelete: (id: number) => void;
}) {
  const utils = trpc.useUtils();
  const resetViewsMutation = trpc.webinars.adminResetViews.useMutation({
    onSuccess: () => { utils.webinars.adminList.invalidate(); toast.success("Views reset to 0"); },
    onError: (e) => toast.error(e.message),
  });
  const reorderMutation = trpc.webinars.adminReorder.useMutation({
    onSuccess: () => utils.webinars.adminList.invalidate(),
    onError: (e) => toast.error("Reorder failed: " + e.message),
  });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  // Local order state per group for optimistic drag feedback
  const [localOrder, setLocalOrder] = useState<Record<string, number[]>>({});
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const groupOrder = ["evergreen", "exclusive", "recording", "upcoming"];
  const grouped = groupOrder.reduce((acc, type) => {
    acc[type] = webinars.filter(w => w.type === type);
    return acc;
  }, {} as Record<string, typeof webinars>);

  const getOrderedGroup = useCallback((type: string, group: typeof webinars) => {
    const order = localOrder[type];
    if (!order) return [...group].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return order.map(id => group.find(w => w.id === id)).filter(Boolean) as typeof webinars;
  }, [localOrder]);

  function handleDragEnd(type: string, group: typeof webinars, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ordered = getOrderedGroup(type, group);
    const oldIndex = ordered.findIndex(w => w.id === active.id);
    const newIndex = ordered.findIndex(w => w.id === over.id);
    const newOrder = arrayMove(ordered, oldIndex, newIndex);
    setLocalOrder(prev => ({ ...prev, [type]: newOrder.map(w => w.id) }));
    // Persist: swap sortOrder of the two moved items
    reorderMutation.mutate({ id1: Number(active.id), id2: Number(over.id) });
  }

  return (
    <div className="space-y-4">
      {groupOrder.map((type) => {
        const group = grouped[type];
        if (group.length === 0 && type === "upcoming") return null;
        const meta = WEBINAR_GROUP_META[type];
        const isCollapsed = collapsed[type];
        const orderedGroup = getOrderedGroup(type, group);
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
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(type, group, e)}>
                  <SortableContext items={orderedGroup.map(w => w.id)} strategy={verticalListSortingStrategy}>
                    <Table>
                      <TableHeader>
                        <TableRow style={{ background: "#111", borderColor: "#252d3d" }}>
                          <TableHead className="text-gray-400 text-xs w-6"></TableHead>
                          <TableHead className="text-gray-400 text-xs">Title</TableHead>
                          <TableHead className="text-gray-400 text-xs">Host</TableHead>
                          <TableHead className="text-gray-400 text-xs">Views</TableHead>
                          <TableHead className="text-gray-400 text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderedGroup.map((w) => (
                          <SortableTableRow key={w.id} id={w.id}>
                            <TableCell className="text-gray-600 text-xs w-6" style={{ cursor: "grab" }}>⠿</TableCell>
                            <TableCell className="text-white text-sm font-medium max-w-xs truncate">{w.title}</TableCell>
                            <TableCell className="text-gray-400 text-xs">{w.host ?? "—"}</TableCell>
                            <TableCell className="text-gray-400 text-xs">{w.viewCount ?? 0}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2" onPointerDown={e => e.stopPropagation()}>
                                {(w.registrationUrl || w.videoUrl) && (
                                  <a href={(w.registrationUrl || w.videoUrl)!} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0074F4] transition"><ExternalLink size={13} /></a>
                                )}
                                <button
                                  onClick={() => { if (confirm(`Reset views for "${w.title}" to 0?`)) resetViewsMutation.mutate({ id: w.id }); }}
                                  title="Reset view count"
                                  className="text-gray-500 hover:text-amber-400 transition"
                                ><ArrowDown size={13} /></button>
                                <button onClick={() => onEdit(w as Parameters<typeof onEdit>[0])} className="text-gray-500 hover:text-white transition"><Pencil size={13} /></button>
                                <button onClick={() => onDelete(w.id)} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={13} /></button>
                              </div>
                            </TableCell>
                          </SortableTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </SortableContext>
                </DndContext>
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

// ─── Resource Hub Tab ────────────────────────────────────────────────────────
function GuidesTab() {
  const utils = trpc.useUtils();
  const { data: guides = [], isLoading } = trpc.guides.adminList.useQuery();
  const { data: guideVisRaw } = trpc.siteSettings.get.useQuery({ key: "guides_sections_visibility" });
  const guideVisibility: Record<string, boolean> = (guideVisRaw as Record<string, boolean> | null) ?? { help_article: true, pdf: true, faq: true };
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
  const { data: pdfSections = [] } = trpc.guides.listSections.useQuery();
  // PDF sections from dedicated table (DB-backed, shows empty sections immediately)
  const { data: pdfSectionsAdmin = [] } = trpc.guides.listPdfSections.useQuery();
  const renamePdfSectionMutation = trpc.guides.renamePdfSection.useMutation({
    onSuccess: () => { utils.guides.listPdfSections.invalidate(); toast.success("Section renamed"); },
    onError: (e) => toast.error(e.message),
  });
  const togglePdfSectionVisibilityMutation = trpc.guides.togglePdfSectionVisibility.useMutation({
    onSuccess: () => { utils.guides.listPdfSections.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deletePdfSectionMutation = trpc.guides.deletePdfSection.useMutation({
    onSuccess: () => { utils.guides.listPdfSections.invalidate(); toast.success("Section deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const reorderPdfSectionsMutation = trpc.guides.reorderPdfSections.useMutation({
    onError: (e) => toast.error(e.message),
  });
  // Add Help Article Section modal
  const { data: helpArticleSectionsAdmin = [] } = trpc.helpArticles.listSectionsAdmin.useQuery();
  const { data: helpArticlesPublished = [] } = trpc.helpArticles.listPublished.useQuery();
  const toggleSectionVisibilityMutation = trpc.helpArticles.toggleSectionVisibility.useMutation({
    onSuccess: () => { utils.helpArticles.listSectionsAdmin.invalidate(); utils.helpArticles.listSections.invalidate(); toast.success("Visibility updated"); },
    onError: (e) => toast.error(e.message),
  });
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const createSectionMutation = trpc.helpArticles.createSection.useMutation({
    onSuccess: () => {
      utils.helpArticles.listPublished.invalidate();
      utils.helpArticles.listSectionsAdmin.invalidate();
      toast.success("Section created");
      setShowAddSectionModal(false);
      setNewSectionName("");
    },
    onError: (e) => toast.error(e.message),
  });
  // Add PDF Section modal
  const [showAddPdfSectionModal, setShowAddPdfSectionModal] = useState(false);
  const [newPdfSectionName, setNewPdfSectionName] = useState("");
  const createPdfSectionMutation = trpc.guides.createSection.useMutation({
    onSuccess: () => {
      utils.guides.adminList.invalidate();
      utils.guides.listSections.invalidate();
      utils.guides.listPdfSections.invalidate();
      toast.success("PDF section created");
      setShowAddPdfSectionModal(false);
      setNewPdfSectionName("");
    },
    onError: (e) => toast.error(e.message),
  });
  // FAQ section state
  const [showAddFaqSectionModal, setShowAddFaqSectionModal] = useState(false);
  const [newFaqSectionName, setNewFaqSectionName] = useState("");
  const { data: faqSectionsAdmin = [] } = trpc.faq.listSectionsAdmin.useQuery();
  // Global Add FAQ Entry inline form
  const [showAddFaqEntryModal, setShowAddFaqEntryModal] = useState(false);
  const [showAddFaqForm, setShowAddFaqForm] = useState(false);
  const [globalFaqEntry, setGlobalFaqEntry] = useState({ sectionId: 0, question: "", answer: "", fileUrl: "", fileName: "", description: "", linkLabel: "" });
  const [globalFaqUploadingFile, setGlobalFaqUploadingFile] = useState(false);
  const uploadGlobalFaqFileMutation = trpc.faq.uploadEntryFile.useMutation({
    onSuccess: (data) => { setGlobalFaqEntry(v => ({ ...v, fileUrl: data.url, fileName: data.fileName })); setGlobalFaqUploadingFile(false); toast.success("File uploaded"); },
    onError: (e) => { setGlobalFaqUploadingFile(false); toast.error(e.message); },
  });
  const createGlobalFaqEntryMutation = trpc.faq.createEntry.useMutation({
    onSuccess: () => { utils.faq.listSectionsAdmin.invalidate(); utils.faq.listSectionsPublic.invalidate(); toast.success("FAQ entry added"); setShowAddFaqEntryModal(false); setShowAddFaqForm(false); setGlobalFaqEntry({ sectionId: 0, question: "", answer: "", fileUrl: "", fileName: "", description: "", linkLabel: "" }); },
    onError: (e) => toast.error(e.message),
  });
  const createFaqSectionMutation = trpc.faq.createSection.useMutation({
    onSuccess: () => {
      utils.faq.listSectionsAdmin.invalidate();
      utils.faq.listSectionsPublic.invalidate();
      toast.success("FAQ section created");
      setShowAddFaqSectionModal(false);
      setNewFaqSectionName("");
    },
    onError: (e) => toast.error(e.message),
  });
  // Add Help Article (native) inline form
  const [showNativeArticleForm, setShowNativeArticleForm] = useState(false);
  const [editingNativeArticle, setEditingNativeArticle] = useState<{ id: number; title: string; nativeBody: string; sectionName: string } | null>(null);
  const [nativeForm, setNativeForm] = useState({ title: "", sectionName: "", nativeBody: "" });
  const nativeEditor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-400 underline" } })],
    content: "",
    editorProps: { attributes: { class: "prose prose-invert max-w-none min-h-[160px] px-4 py-3 focus:outline-none text-sm text-gray-200" } },
  });
  function resetNativeForm() {
    setNativeForm({ title: "", sectionName: helpArticleSectionsAdmin[0]?.name ?? "", nativeBody: "" });
    nativeEditor?.commands.setContent("");
    setEditingNativeArticle(null);
  }
  const createNativeMutation = trpc.helpArticles.createNativeArticle.useMutation({
    onSuccess: () => {
      utils.helpArticles.listPublished.invalidate();
      utils.helpArticles.listSectionsAdmin.invalidate();
      toast.success("Article published");
      setShowNativeArticleForm(false);
      resetNativeForm();
    },
    onError: (e) => toast.error(e.message),
  });
  const updateNativeMutation = trpc.helpArticles.updateNativeArticle.useMutation({
    onSuccess: () => {
      utils.helpArticles.listPublished.invalidate();
      toast.success("Article updated");
      setShowNativeArticleForm(false);
      resetNativeForm();
    },
    onError: (e) => toast.error(e.message),
  });
  const [form, setForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    linkLabel: "",
    section: "",
    // fileType is always pdf now — Checklist/Playbook/Resource removed
    fileType: "pdf" as "pdf",
  });
  const uploadFileMutation = trpc.guides.uploadFile.useMutation({
    onError: (e) => toast.error("Upload failed: " + e.message),
  });
  const createMutation = trpc.guides.adminCreate.useMutation({
    onSuccess: () => { utils.guides.adminList.invalidate(); utils.guides.listPdfSections.invalidate(); setShowForm(false); resetForm(); toast.success("Guide created"); },
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
  function resetForm() { setForm({ title: "", description: "", fileUrl: "", linkLabel: "", section: "", fileType: "pdf" as "pdf" }); }
  function startEdit(g: typeof guides[0]) {
    setEditId(g.id);
    setForm({ title: g.title, description: g.description ?? "", fileUrl: g.fileUrl ?? "", linkLabel: (g as any).linkLabel ?? "", section: g.category ?? "", fileType: "pdf" as "pdf" });
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
      updateMutation.mutate({ id: editId, data: { title: form.title, description: form.description || undefined, fileType: form.fileType, category: form.section.trim() || undefined, fileUrl: form.fileUrl || undefined, linkLabel: form.linkLabel.trim() || null } });
    } else {
      createMutation.mutate({ title: form.title, description: form.description || undefined, fileType: form.fileType, category: form.section.trim() || undefined, fileUrl: form.fileUrl || undefined, linkLabel: form.linkLabel.trim() || undefined });
    }
  }
  const inputStyle: React.CSSProperties = { background: "#111", border: "1px solid #2a2a2a", color: "#fff", borderRadius: "8px", padding: "8px 10px", fontSize: "13px", width: "100%", outline: "none" };
  return (
    <div className="space-y-6">
      <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(103,199,40,0.15)" }}>
            <FileTextIcon size={18} style={{ color: "#67C728" }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">WAVV Resource Hub</h2>
            <p className="text-xs text-gray-500">Manage PDFs and Help Articles for the Resource Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAddSectionModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
            style={{ background: "rgba(139,92,246,0.15)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.3)" }}
          >
            <Plus size={13} /> Add Help Article Section
          </button>
          <button
            onClick={() => { resetNativeForm(); setShowNativeArticleForm(f => !f); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
            style={{ background: "#8B5CF6" }}
          >
            <Plus size={13} /> Add Help Article
          </button>
          <button
            onClick={() => { setShowAddFaqSectionModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
            style={{ background: "rgba(234,179,8,0.15)", color: "#eab308", border: "1px solid rgba(234,179,8,0.3)" }}
          >
            <Plus size={13} /> Add FAQ Section
          </button>
          <button
            onClick={() => { setGlobalFaqEntry(v => ({ ...v, sectionId: faqSectionsAdmin[0]?.id ?? 0 })); setShowAddFaqForm(f => !f); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
            style={{ background: "#eab308" }}
          >
            <Plus size={13} /> Add FAQ
          </button>
          <button
            onClick={() => { setShowAddPdfSectionModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
            style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <Plus size={13} /> Add PDF Section
          </button>
          <button
            onClick={() => { setEditId(null); resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
            style={{ background: "#ef4444" }}
          >
            <Plus size={13} /> Add PDF
          </button>
        </div>
      </div>
      {/* ── Add FAQ Entry Inline Form ── */}
      {showAddFaqForm && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <h3 className="text-sm font-semibold text-white">New FAQ Entry</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Title *</label>
              <input style={inputStyle} value={globalFaqEntry.question} onChange={e => setGlobalFaqEntry(v => ({ ...v, question: e.target.value }))} placeholder="e.g. How do I set up call boards?" autoFocus />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Section *</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={globalFaqEntry.sectionId} onChange={e => setGlobalFaqEntry(v => ({ ...v, sectionId: Number(e.target.value) }))}>
                {faqSectionsAdmin.length === 0 && <option value={0}>No sections yet — create one first</option>}
                {faqSectionsAdmin.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description <span className="text-gray-600">(optional)</span></label>
            <input style={inputStyle} value={globalFaqEntry.description} onChange={e => setGlobalFaqEntry(v => ({ ...v, description: e.target.value }))} placeholder="Brief description" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Link Display Name <span className="text-gray-600 ml-1">(optional — shown to users instead of the raw URL)</span></label>
            <input style={inputStyle} value={globalFaqEntry.linkLabel} onChange={e => setGlobalFaqEntry(v => ({ ...v, linkLabel: e.target.value }))} placeholder="e.g. WAVV Call Boards FAQ.pdf" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-gray-400 mb-1">File Attachment <span className="text-gray-600">(PDF, DOCX, or XLSX — max 16 MB)</span></label>
            <div className="flex items-center gap-3">
              <label
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition hover:opacity-90"
                style={{ background: globalFaqUploadingFile ? "#252d3d" : "#1d2230", border: "1px solid #3a3a3a", color: globalFaqUploadingFile ? "#9ca3af" : "#fff" }}
              >
                {globalFaqUploadingFile ? (
                  <><span className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full inline-block" /> Uploading...</>
                ) : (
                  <><FileDown size={13} /> Choose File</>
                )}
                <input type="file" accept=".pdf,.docx,.xlsx" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 16 * 1024 * 1024) { toast.error("File too large — max 16 MB"); return; }
                  setGlobalFaqUploadingFile(true);
                  const reader = new FileReader();
                  reader.onload = () => {
                    const base64 = (reader.result as string).split(",")[1];
                    uploadGlobalFaqFileMutation.mutate({ fileName: file.name, fileBase64: base64, mimeType: file.type || "application/pdf" });
                  };
                  reader.readAsDataURL(file);
                }} disabled={globalFaqUploadingFile} />
              </label>
              {globalFaqEntry.fileUrl && (
                <span className="text-xs text-green-400 flex items-center gap-1 truncate max-w-xs">
                  <CheckCircle2 size={12} /> File attached
                  <a href={globalFaqEntry.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">Preview</a>
                  <button onClick={() => setGlobalFaqEntry(v => ({ ...v, fileUrl: "", fileName: "" }))} className="ml-1 text-red-400 hover:text-red-300">Remove</button>
                </span>
              )}
              {!globalFaqEntry.fileUrl && <span className="text-xs text-gray-600">No file attached</span>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Or paste a URL directly</label>
              <input style={{ ...inputStyle, fontSize: "12px" }} value={globalFaqEntry.fileUrl} onChange={e => setGlobalFaqEntry(v => ({ ...v, fileUrl: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowAddFaqForm(false); setGlobalFaqEntry({ sectionId: faqSectionsAdmin[0]?.id ?? 0, question: "", answer: "", fileUrl: "", fileName: "", description: "", linkLabel: "" }); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition" style={{ background: "#252d3d" }}>Cancel</button>
            <button type="button"
              disabled={createGlobalFaqEntryMutation.isPending || globalFaqUploadingFile || !globalFaqEntry.question.trim() || !globalFaqEntry.sectionId}
              onClick={() => {
                if (!globalFaqEntry.question.trim() || !globalFaqEntry.sectionId) { toast.error("Title and section are required"); return; }
                createGlobalFaqEntryMutation.mutate({ sectionId: globalFaqEntry.sectionId, question: globalFaqEntry.question.trim(), answer: globalFaqEntry.description.trim() || "See attached document", fileUrl: globalFaqEntry.fileUrl || undefined, fileName: globalFaqEntry.linkLabel || globalFaqEntry.fileName || undefined });
              }}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "#eab308" }}
            >{createGlobalFaqEntryMutation.isPending ? "Saving…" : "Add FAQ Entry"}</button>
          </div>
        </div>
      )}
      {/* ── Add / Edit Native Help Article Inline Form ── */}
      {showNativeArticleForm && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <h3 className="text-sm font-semibold text-white">{editingNativeArticle ? "Edit Help Article" : "New Help Article"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Title *</label>
              <input style={inputStyle} value={nativeForm.title} onChange={e => setNativeForm(f => ({ ...f, title: e.target.value }))} placeholder="Article title" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Section *</label>
              {helpArticleSectionsAdmin.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {helpArticleSectionsAdmin.map(s => (
                    <button key={s.id} type="button"
                      onClick={() => setNativeForm(f => ({ ...f, sectionName: f.sectionName === s.name ? "" : s.name }))}
                      className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                      style={nativeForm.sectionName === s.name
                        ? { background: "rgba(139,92,246,0.2)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.4)" }
                        : { background: "#1d2230", color: "#9ca3af", border: "1px solid #2a2a2a" }
                      }>{s.name}</button>
                  ))}
                </div>
              )}
              <input style={inputStyle} value={nativeForm.sectionName} onChange={e => setNativeForm(f => ({ ...f, sectionName: e.target.value }))} placeholder={helpArticleSectionsAdmin.length > 0 ? "Or type a new section name…" : "e.g. WAVV Dialer, Call Boards"} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea rows={2} style={{ ...inputStyle, resize: "vertical" as const }} value={nativeForm.nativeBody} onChange={e => setNativeForm(f => ({ ...f, nativeBody: e.target.value }))} placeholder="Brief description" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Link Display Name <span className="text-gray-600 ml-1">(optional — shown to users instead of the raw URL)</span></label>
            <input style={inputStyle} value={(nativeForm as any).linkLabel ?? ""} onChange={e => setNativeForm(f => ({ ...f, linkLabel: e.target.value } as any))} placeholder="e.g. WAVV Call Boards Guide.pdf" />
          </div>
          {/* File Attachment */}
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
                <input type="file" accept=".pdf,.docx,.xlsx" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 16 * 1024 * 1024) { toast.error("File too large — max 16 MB"); return; }
                  const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
                  type AllowedMime = "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                  const mimeMap: Record<string, AllowedMime> = { pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
                  const mimeType = mimeMap[ext];
                  if (!mimeType) { toast.error("Unsupported format — use PDF, DOCX, or XLSX"); return; }
                  setUploadingFile(true);
                  try {
                    const reader = new FileReader();
                    const base64 = await new Promise<string>((resolve, reject) => { reader.onload = () => resolve((reader.result as string).split(",")[1]); reader.onerror = reject; reader.readAsDataURL(file); });
                    const result = await uploadFileMutation.mutateAsync({ base64, mimeType, fileName: file.name });
                    setNativeForm(f => ({ ...f, fileUrl: result.url, linkLabel: file.name } as any));
                  } catch { toast.error("Upload failed"); } finally { setUploadingFile(false); }
                }} disabled={uploadingFile} />
              </label>
              {(nativeForm as any).fileUrl && (
                <span className="text-xs text-green-400 flex items-center gap-1 truncate max-w-xs">
                  <CheckCircle2 size={12} /> File attached
                  <a href={(nativeForm as any).fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">Preview</a>
                </span>
              )}
              {!(nativeForm as any).fileUrl && <span className="text-xs text-gray-600">No file attached</span>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Or paste a URL directly</label>
              <input style={{ ...inputStyle, fontSize: "12px" }} value={(nativeForm as any).fileUrl ?? ""} onChange={e => setNativeForm(f => ({ ...f, fileUrl: e.target.value } as any))} placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowNativeArticleForm(false); resetNativeForm(); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition" style={{ background: "#252d3d" }}>Cancel</button>
            <button type="button"
              disabled={createNativeMutation.isPending || uploadingFile || !nativeForm.title.trim() || !nativeForm.sectionName.trim()}
              onClick={() => {
                const fileUrl = (nativeForm as any).fileUrl ?? "";
                const linkLabel = (nativeForm as any).linkLabel ?? "";
                if (!nativeForm.title.trim() || !nativeForm.sectionName.trim()) { toast.error("Title and section are required"); return; }
                createMutation.mutate({ title: nativeForm.title, description: nativeForm.nativeBody || undefined, fileUrl: fileUrl || undefined, linkLabel: linkLabel || undefined, category: nativeForm.sectionName, fileType: "help_article" });
                setShowNativeArticleForm(false);
                resetNativeForm();
              }}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "#8B5CF6" }}
            >{createNativeMutation.isPending ? "Saving…" : "Add Help Article"}</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
          <h3 className="text-sm font-semibold text-white">{editId !== null ? "Edit Guide" : "New Guide"}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Row 1: Title + Section */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title *</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Guide title" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Section
                  <span className="text-gray-600 ml-1">(optional — groups PDFs)</span>
                </label>
                {/* Existing sections as clickable pills — DB-backed pdf_sections table */}
                {pdfSectionsAdmin.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {pdfSectionsAdmin.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, section: f.section === s.name ? "" : s.name }))}
                        className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                        style={form.section === s.name
                          ? { background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.4)" }
                          : { background: "#1d2230", color: "#9ca3af", border: "1px solid #2a2a2a" }
                        }
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  style={inputStyle}
                  value={form.section}
                  onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                  placeholder={pdfSectionsAdmin.length > 0 ? "Or type a new section name…" : "e.g. WAVV Dialer, Call Boards, Settings"}
                />
              </div>
            </div>
            {/* Row 2: Description */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea rows={2} style={{ ...inputStyle, resize: "vertical" as const }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
            </div>
            {/* Row 3: Link Display Name */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Link Display Name
                <span className="text-gray-600 ml-1">(optional — shown to users instead of the raw URL)</span>
              </label>
              <input
                style={inputStyle}
                value={form.linkLabel}
                onChange={e => setForm(f => ({ ...f, linkLabel: e.target.value }))}
                placeholder="e.g. WAVV Onboarding Checklist.pdf"
              />
              {form.fileUrl && !form.linkLabel && (
                <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                  <span>⚠</span> No display name set — users will see the raw storage URL. Add a friendly name above.
                </p>
              )}
            </div>
            {/* Row 4: File upload + URL preview */}
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
      {/* ── Section Visibility Divider ── */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1" style={{ background: "linear-gradient(to right, #2a2a2a, transparent)" }} />
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#4b5563" }}>Visibility Controls</span>
        <div className="h-px flex-1" style={{ background: "linear-gradient(to left, #2a2a2a, transparent)" }} />
      </div>
      {/* ── Section Visibility ── */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center gap-2 mb-1">
          <Eye size={13} style={{ color: "#9ca3af" }} />
          <span className="text-xs font-semibold text-gray-300">Section Visibility</span>
          <span className="text-xs text-gray-500 ml-1">— toggle to show/hide sections from users</span>
        </div>

        {/* ── Help Articles master toggle ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "#8B5CF6" }} />
            <span className="text-xs text-gray-300 font-medium">Help Articles</span>
          </div>
          <button
            onClick={() => toggleGuideSection("help_article")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition"
            style={guideVisibility.help_article !== false
              ? { background: "rgba(103,199,40,0.15)", color: "#67C728", border: "1px solid rgba(103,199,40,0.3)" }
              : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid #2a2a2a" }
            }
          >
            {guideVisibility.help_article !== false ? <><Eye size={11} /> Visible</> : <><EyeOff size={11} /> Hidden</>}
          </button>
        </div>

        {/* ── Separator ── */}
        <div className="h-px" style={{ background: "#2a2a2a" }} />

        {/* ── PDFs master toggle ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
            <span className="text-xs text-gray-300 font-medium">PDFs</span>
          </div>
          <button
            onClick={() => toggleGuideSection("pdf")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition"
            style={guideVisibility.pdf !== false
              ? { background: "rgba(103,199,40,0.15)", color: "#67C728", border: "1px solid rgba(103,199,40,0.3)" }
              : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid #2a2a2a" }
            }
          >
            {guideVisibility.pdf !== false ? <><Eye size={11} /> Visible</> : <><EyeOff size={11} /> Hidden</>}
          </button>
        </div>
        {/* ── Separator ── */}
        <div className="h-px" style={{ background: "#2a2a2a" }} />
        {/* ── FAQs master toggle ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "#eab308" }} />
            <span className="text-xs text-gray-300 font-medium">FAQs</span>
          </div>
          <button
            onClick={() => toggleGuideSection("faq")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition"
            style={guideVisibility.faq !== false
              ? { background: "rgba(103,199,40,0.15)", color: "#67C728", border: "1px solid rgba(103,199,40,0.3)" }
              : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid #2a2a2a" }
            }
          >
            {guideVisibility.faq !== false ? <><Eye size={11} /> Visible</> : <><EyeOff size={11} /> Hidden</>}
          </button>
        </div>
      </div>

      {/* ── Help Articles category header ── */}
      <div className="flex items-center gap-3 px-1">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#8B5CF6" }} />
        <span className="text-sm font-semibold text-white">Help Articles</span>
        <span className="text-xs text-gray-500">Published help articles grouped by section</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(139,92,246,0.15)", color: "#8B5CF6" }}>{helpArticleSectionsAdmin.length} sections</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(139,92,246,0.15)", color: "#8B5CF6" }}>{helpArticlesPublished.length} articles</span>
        </div>
      </div>

      {/* ── Published Help Articles ── */}
      <PublishedHelpArticlesPanel />

      {/* ── PDF Resources ── */}
      {isLoading ? (
        <div className="flex items-center justify-center h-24"><div className="animate-spin w-6 h-6 border-2 border-[#0074F4] border-t-transparent rounded-full" /></div>
      ) : (
        <PdfSectionsPanel
          guides={guides}
          onEdit={startEdit}
          onDelete={(id) => { if (confirm("Delete this guide?")) deleteMutation.mutate({ id }); }}
        />
      )}

            {/* ── FAQ Sections Panel ── */}
      <FaqSectionsPanel />
      {/* ── Divider ── */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px" style={{ background: "#2a2a2a" }} />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "#1a1f2e", border: "1px solid #2a2a2a" }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#8B5CF6" }} />
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#6b7280" }}>SYNCED HELP ARTICLES</span>
        </div>
        <div className="flex-1 h-px" style={{ background: "#2a2a2a" }} />
      </div>
      {/* ── Synced Help Articles (Intercom source) ── */}
      <SyncedHelpArticlesPanel />

      {/* ── Add Help Article Section Modal ── */}
      <Dialog open={showAddSectionModal} onOpenChange={setShowAddSectionModal}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a", color: "#fff" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Add Help Article Section</DialogTitle>
            <DialogDescription className="text-gray-400">Create a named section to group published help articles for customers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="block text-xs text-gray-400 mb-1">Section Name *</label>
            <input
              style={{ background: "#111", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "8px 10px", fontSize: 13, width: "100%", outline: "none" }}
              placeholder="e.g. Dialer Settings"
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && newSectionName.trim()) createSectionMutation.mutate({ name: newSectionName.trim() }); }}
              autoFocus
            />
            <p className="text-xs text-gray-500">After creating, go to Synced Help Articles below to assign articles to this section.</p>
          </div>
          <DialogFooter>
            <button onClick={() => { setShowAddSectionModal(false); setNewSectionName(""); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition" style={{ background: "#252d3d" }}>Cancel</button>
            <button
              onClick={() => { if (newSectionName.trim()) createSectionMutation.mutate({ name: newSectionName.trim() }); }}
              disabled={!newSectionName.trim() || createSectionMutation.isPending}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "#8B5CF6" }}
            >
              {createSectionMutation.isPending ? "Creating…" : "Create Section"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add PDF Section Modal ── */}
      <Dialog open={showAddPdfSectionModal} onOpenChange={setShowAddPdfSectionModal}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a", color: "#fff" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Add PDF Section</DialogTitle>
            <DialogDescription className="text-gray-400">Create a named section to group PDF documents.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="block text-xs text-gray-400 mb-1">Section Name *</label>
            <input
              style={{ background: "#111", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "8px 10px", fontSize: 13, width: "100%", outline: "none" }}
              placeholder="e.g. WAVV Dialer, Call Boards"
              value={newPdfSectionName}
              onChange={e => setNewPdfSectionName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && newPdfSectionName.trim()) createPdfSectionMutation.mutate({ name: newPdfSectionName.trim() }); }}
              autoFocus
            />
            <p className="text-xs text-gray-500">After creating, use "Add PDF" to add documents to this section.</p>
          </div>
          <DialogFooter>
            <button onClick={() => { setShowAddPdfSectionModal(false); setNewPdfSectionName(""); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition" style={{ background: "#252d3d" }}>Cancel</button>
            <button
              onClick={() => { if (newPdfSectionName.trim()) createPdfSectionMutation.mutate({ name: newPdfSectionName.trim() }); }}
              disabled={!newPdfSectionName.trim() || createPdfSectionMutation.isPending}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "#ef4444" }}
            >
              {createPdfSectionMutation.isPending ? "Creating…" : "Create Section"}
            </button>
                    </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ── Add FAQ Section Modal ── */}
      <Dialog open={showAddFaqSectionModal} onOpenChange={setShowAddFaqSectionModal}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a", color: "#fff" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Add FAQ Section</DialogTitle>
            <DialogDescription className="text-gray-400">Create a named section to group FAQ entries (e.g. "Call Boards", "Number Rotation").</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="block text-xs text-gray-400 mb-1">Section Name *</label>
            <input
              style={{ background: "#252d3d", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "8px 12px", width: "100%", fontSize: 13 }}
              value={newFaqSectionName}
              onChange={e => setNewFaqSectionName(e.target.value)}
              placeholder="e.g. Call Boards"
              onKeyDown={e => { if (e.key === "Enter" && newFaqSectionName.trim()) createFaqSectionMutation.mutate({ name: newFaqSectionName.trim() }); }}
              autoFocus
            />
            <p className="text-xs text-gray-500">After creating, use "Add FAQ Entry" within the section to add Q&amp;A entries.</p>
          </div>
          <DialogFooter>
            <button onClick={() => { setShowAddFaqSectionModal(false); setNewFaqSectionName(""); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition" style={{ background: "#252d3d" }}>Cancel</button>
            <button
              onClick={() => { if (newFaqSectionName.trim()) createFaqSectionMutation.mutate({ name: newFaqSectionName.trim() }); }}
              disabled={!newFaqSectionName.trim() || createFaqSectionMutation.isPending}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "#eab308" }}
            >
              {createFaqSectionMutation.isPending ? "Creating…" : "Create Section"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ── Add FAQ Entry Modal ── */}
      <Dialog open={showAddFaqEntryModal} onOpenChange={setShowAddFaqEntryModal}>
        <DialogContent style={{ background: "#1d2230", border: "1px solid #2a2a2a", color: "#fff" }}>
          <DialogHeader>
            <DialogTitle className="text-white">Add FAQ Entry</DialogTitle>
            <DialogDescription className="text-gray-400">Add a new question and answer to a FAQ section.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Section *</label>
              <select
                style={{ background: "#111", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "8px 10px", fontSize: 13, width: "100%", outline: "none" }}
                value={globalFaqEntry.sectionId}
                onChange={e => setGlobalFaqEntry(v => ({ ...v, sectionId: Number(e.target.value) }))}
              >
                {faqSectionsAdmin.length === 0 && <option value={0}>No sections yet — create one first</option>}
                {faqSectionsAdmin.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Question *</label>
              <input
                style={{ background: "#111", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "8px 10px", fontSize: 13, width: "100%", outline: "none" }}
                placeholder="e.g. How do I set up call boards?"
                value={globalFaqEntry.question}
                onChange={e => setGlobalFaqEntry(v => ({ ...v, question: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Answer *</label>
              <textarea
                style={{ background: "#111", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "8px 10px", fontSize: 13, width: "100%", outline: "none", resize: "vertical" }}
                rows={4}
                placeholder="Provide a clear, concise answer…"
                value={globalFaqEntry.answer}
                onChange={e => setGlobalFaqEntry(v => ({ ...v, answer: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Attachment (optional)</label>
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition w-fit" style={{ background: "#252d3d", color: "#9ca3af", border: "1px solid #2a2a2a" }}>
                <Paperclip size={12} />
                {globalFaqEntry.fileName ? globalFaqEntry.fileName : "Attach PDF (optional)"}
                <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 16 * 1024 * 1024) { toast.error("File too large (max 16MB)"); return; }
                  setGlobalFaqUploadingFile(true);
                  const reader = new FileReader();
                  reader.onload = () => {
                    const base64 = (reader.result as string).split(",")[1];
                    uploadGlobalFaqFileMutation.mutate({ fileName: file.name, fileBase64: base64, mimeType: file.type || "application/pdf" });
                  };
                  reader.readAsDataURL(file);
                }} />
              </label>
              {globalFaqEntry.fileUrl && (
                <button onClick={() => setGlobalFaqEntry(v => ({ ...v, fileUrl: "", fileName: "" }))} className="ml-2 text-xs text-red-400 hover:text-red-300 transition">Remove</button>
              )}
              {globalFaqUploadingFile && <span className="ml-2 text-xs text-gray-500">Uploading…</span>}
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => { setShowAddFaqEntryModal(false); setGlobalFaqEntry({ sectionId: 0, question: "", answer: "", fileUrl: "", fileName: "", description: "", linkLabel: "" }); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition" style={{ background: "#252d3d" }}>Cancel</button>
            <button
              onClick={() => {
                if (!globalFaqEntry.sectionId || !globalFaqEntry.question.trim() || !globalFaqEntry.answer.trim()) { toast.error("Section, question, and answer are required"); return; }
                createGlobalFaqEntryMutation.mutate({ sectionId: globalFaqEntry.sectionId, question: globalFaqEntry.question.trim(), answer: globalFaqEntry.answer.trim(), fileUrl: globalFaqEntry.fileUrl || undefined, fileName: globalFaqEntry.fileName || undefined });
              }}
              disabled={!globalFaqEntry.sectionId || !globalFaqEntry.question.trim() || !globalFaqEntry.answer.trim() || createGlobalFaqEntryMutation.isPending}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "#eab308" }}
            >
              {createGlobalFaqEntryMutation.isPending ? "Saving…" : "Add Entry"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
const GUIDE_GROUP_META: Record<string, { label: string; color: string; description: string }> = {
  help_article: { label: "Help Article", color: "#8B5CF6", description: "Common questions and troubleshooting" },
  pdf:       { label: "PDF",       color: "#ef4444", description: "Downloadable PDF documents" },
  checklist: { label: "Checklist", color: "#67C728", description: "Step-by-step checklists" },
  playbook:  { label: "Playbook",  color: "#0074F4", description: "Strategy and process playbooks" },
  resource:  { label: "Resource",  color: "#FF9900", description: "Reference materials and templates" },
  other:     { label: "Other",     color: "#6b7280", description: "Miscellaneous guides" },
};

function PdfSectionsPanel({
  guides,
  onEdit,
  onDelete,
}: {
  guides: import("../../../drizzle/schema").Guide[];
  onEdit: (g: import("../../../drizzle/schema").Guide) => void;
  onDelete: (id: number) => void;
}) {
  const utils = trpc.useUtils();
  const { data: pdfSections = [] } = trpc.guides.listPdfSections.useQuery();
  const resetDownloadsMutation = trpc.guides.adminResetDownloads.useMutation({
    onSuccess: () => { utils.guides.adminList.invalidate(); toast.success("Downloads reset to 0"); },
    onError: (e) => toast.error(e.message),
  });
  const reorderGuidesMutation = trpc.guides.adminReorder.useMutation({
    onSuccess: () => utils.guides.adminList.invalidate(),
    onError: (e) => toast.error("Reorder failed: " + e.message),
  });
  const reorderSectionsMutation = trpc.guides.reorderPdfSections.useMutation({
    onError: (e) => toast.error("Reorder failed: " + e.message),
  });
  const renameSectionMutation = trpc.guides.renamePdfSection.useMutation({
    onSuccess: () => { utils.guides.listPdfSections.invalidate(); toast.success("Section renamed"); },
    onError: (e) => toast.error(e.message),
  });
  const toggleSectionVisibilityMutation = trpc.guides.togglePdfSectionVisibility.useMutation({
    onSuccess: () => { utils.guides.listPdfSections.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteSectionMutation = trpc.guides.deletePdfSection.useMutation({
    onSuccess: () => { utils.guides.listPdfSections.invalidate(); toast.success("Section deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const [localSectionOrder, setLocalSectionOrder] = useState<number[]>([]);
  const [localGuideOrder, setLocalGuideOrder] = useState<Record<number, number[]>>({});
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionName, setEditingSectionName] = useState("");

  const orderedSections = localSectionOrder.length > 0
    ? localSectionOrder.map(id => pdfSections.find(s => s.id === id)).filter(Boolean) as typeof pdfSections
    : [...pdfSections];

  const pdfGuides = guides.filter(g => (g.fileType ?? "pdf") === "pdf" && !g.title.startsWith("__section__"));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = orderedSections.map(s => s.id);
    const oldIndex = ids.indexOf(Number(active.id));
    const newIndex = ids.indexOf(Number(over.id));
    const newOrder = arrayMove(ids, oldIndex, newIndex);
    setLocalSectionOrder(newOrder);
    reorderSectionsMutation.mutate(newOrder.map((id, i) => ({ id, sortOrder: i })));
  }

  function handleGuideDragEnd(sectionId: number, sectionGuides: typeof pdfGuides, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ordered = getOrderedGuides(sectionId, sectionGuides);
    const oldIndex = ordered.findIndex(g => g.id === active.id);
    const newIndex = ordered.findIndex(g => g.id === over.id);
    const newOrder = arrayMove(ordered, oldIndex, newIndex);
    setLocalGuideOrder(prev => ({ ...prev, [sectionId]: newOrder.map(g => g.id) }));
    reorderGuidesMutation.mutate({ id1: Number(active.id), id2: Number(over.id) });
  }

  function getOrderedGuides(sectionId: number, sectionGuides: typeof pdfGuides) {
    const order = localGuideOrder[sectionId];
    if (!order) return [...sectionGuides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return order.map(id => sectionGuides.find(g => g.id === id)).filter(Boolean) as typeof pdfGuides;
  }

  const PDF_COLOR = "#ef4444";

  return (
    <div className="space-y-4">
      {/* PDF section header */}
      <div className="flex items-center gap-3 px-1">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PDF_COLOR }} />
        <span className="text-sm font-semibold text-white">PDFs</span>
        <span className="text-xs text-gray-500">Viewable and Downloadable PDF documents</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${PDF_COLOR}18`, color: PDF_COLOR }}>{orderedSections.length} sections</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${PDF_COLOR}18`, color: PDF_COLOR }}>{pdfGuides.length} PDFs</span>
        </div>
      </div>
      {pdfSections.length === 0 && pdfGuides.length === 0 && (
        <div className="px-5 py-8 text-center rounded-xl" style={{ background: "#111", border: "1px solid #2a2a2a" }}>
          <p className="text-gray-600 text-xs">No PDF sections yet. Click "Add PDF Section" above to create one.</p>
        </div>
      )}
      {/* DB-backed sections with drag-to-reorder */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={orderedSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {orderedSections.map(section => {
              const sectionGuides = pdfGuides.filter(g => g.category === section.name);
              const isCollapsed = collapsed[section.id] !== false; // default collapsed
              const orderedGuides = getOrderedGuides(section.id, sectionGuides);
              return (
                <SortablePdfSectionRow key={section.id} id={section.id}>
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#1d2230" }}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-gray-600 cursor-grab flex-shrink-0" title="Drag to reorder"><GripVertical size={14} /></span>
                        <button onClick={() => setCollapsed(c => ({ ...c, [section.id]: !isCollapsed }))} className="text-gray-400 hover:text-white transition flex-shrink-0">
                          {isCollapsed ? <ChevronRightIcon size={15} /> : <ChevronDown size={15} />}
                        </button>
                        {editingSectionId === section.id ? (
                          <input
                            className="text-sm font-semibold text-white bg-transparent border-b border-purple-500 outline-none flex-1 min-w-0"
                            value={editingSectionName}
                            onChange={e => setEditingSectionName(e.target.value)}
                            onBlur={() => {
                              if (editingSectionName.trim() && editingSectionName !== section.name) {
                                renameSectionMutation.mutate({ id: section.id, name: editingSectionName.trim() });
                              }
                              setEditingSectionId(null);
                            }}
                            onKeyDown={e => {
                              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                              if (e.key === "Escape") { setEditingSectionId(null); }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm font-semibold text-white truncate">{section.name}</span>
                        )}
                        <button
                          onClick={() => { setEditingSectionId(section.id); setEditingSectionName(section.name); }}
                          className="text-gray-600 hover:text-gray-300 transition flex-shrink-0"
                          title="Rename section"
                        ><Pencil size={12} /></button>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${PDF_COLOR}20`, color: PDF_COLOR }}>{sectionGuides.length}</span>
                        <button
                          onClick={() => toggleSectionVisibilityMutation.mutate({ id: section.id, isVisible: !section.isVisible })}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition"
                          style={section.isVisible
                            ? { background: "rgba(103,199,40,0.15)", color: "#67C728", border: "1px solid rgba(103,199,40,0.3)" }
                            : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid #2a2a2a" }
                          }
                        >
                          {section.isVisible ? <><Eye size={11} /> Visible</> : <><EyeOff size={11} /> Hidden</>}
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete section "${section.name}"? PDFs in this section will become unsectioned.`)) deleteSectionMutation.mutate({ id: section.id }); }}
                          className="text-gray-600 hover:text-red-400 transition"
                          title="Delete section"
                        ><Trash2 size={13} /></button>
                      </div>
                    </div>
                    {!isCollapsed && (
                      sectionGuides.length === 0 ? (
                        <div className="px-5 py-8 text-center" style={{ background: "#111" }}>
                          <p className="text-gray-600 text-xs">No PDFs in this section yet. Use "Add PDF" above and select this section.</p>
                        </div>
                      ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleGuideDragEnd(section.id, sectionGuides, e)}>
                          <SortableContext items={orderedGuides.map(g => g.id)} strategy={verticalListSortingStrategy}>
                            <Table>
                              <TableHeader>
                                <TableRow style={{ background: "#111", borderColor: "#252d3d" }}>
                                  <TableHead className="text-gray-400 text-xs w-6"></TableHead>
                                  <TableHead className="text-gray-400 text-xs">Title</TableHead>
                                  <TableHead className="text-gray-400 text-xs">Link Display Name</TableHead>
                                  <TableHead className="text-gray-400 text-xs">Downloads</TableHead>
                                  <TableHead className="text-gray-400 text-xs">Status</TableHead>
                                  <TableHead className="text-gray-400 text-xs">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {orderedGuides.map((g) => (
                                  <SortableTableRow key={g.id} id={g.id}>
                                    <TableCell className="text-gray-600 text-xs w-6" style={{ cursor: "grab" }}>⠿</TableCell>
                                    <TableCell className="text-white text-sm font-medium max-w-xs truncate">{g.title}</TableCell>
                                    <TableCell className="text-xs max-w-[160px] truncate">
                                      {(g as any).linkLabel
                                        ? <span className="text-green-400">{(g as any).linkLabel}</span>
                                        : <span className="text-gray-600 italic">Not set</span>}
                                    </TableCell>
                                    <TableCell className="text-gray-400 text-xs">{g.downloadCount ?? 0}</TableCell>
                                    <TableCell>
                                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: g.published ? "rgba(103,199,40,0.15)" : "rgba(239,68,68,0.15)", color: g.published ? "#67C728" : "#f87171" }}>
                                        {g.published ? "Published" : "Hidden"}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2" onPointerDown={e => e.stopPropagation()}>
                                        {g.fileUrl && (
                                          <a href={g.fileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0074F4] transition"><ExternalLink size={13} /></a>
                                        )}
                                        <button
                                          onClick={() => { if (confirm(`Reset downloads for "${g.title}" to 0?`)) resetDownloadsMutation.mutate({ id: g.id }); }}
                                          title="Reset download count"
                                          className="text-gray-500 hover:text-amber-400 transition"
                                        ><ArrowDown size={13} /></button>
                                        <button onClick={() => onEdit(g)} className="text-gray-500 hover:text-white transition"><Pencil size={13} /></button>
                                        <button onClick={() => onDelete(g.id)} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={13} /></button>
                                      </div>
                                    </TableCell>
                                  </SortableTableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </SortableContext>
                        </DndContext>
                      )
                    )}
                  </div>
                </SortablePdfSectionRow>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      {/* Unsectioned PDFs */}
      {pdfGuides.filter(g => !g.category || !pdfSections.find(s => s.name === g.category)).length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#1d2230" }}>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#6b7280" }} />
              <span className="text-sm font-semibold text-gray-400">Unsectioned</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(107,114,128,0.2)", color: "#6b7280" }}>
              {pdfGuides.filter(g => !g.category || !pdfSections.find(s => s.name === g.category)).length}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow style={{ background: "#111", borderColor: "#252d3d" }}>
                <TableHead className="text-gray-400 text-xs">Title</TableHead>
                <TableHead className="text-gray-400 text-xs">Link Display Name</TableHead>
                <TableHead className="text-gray-400 text-xs">Downloads</TableHead>
                <TableHead className="text-gray-400 text-xs">Status</TableHead>
                <TableHead className="text-gray-400 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pdfGuides.filter(g => !g.category || !pdfSections.find(s => s.name === g.category)).map(g => (
                <TableRow key={g.id} style={{ borderColor: "#252d3d" }}>
                  <TableCell className="text-white text-sm font-medium max-w-xs truncate">{g.title}</TableCell>
                  <TableCell className="text-xs max-w-[160px] truncate">
                    {(g as any).linkLabel
                      ? <span className="text-green-400">{(g as any).linkLabel}</span>
                      : <span className="text-gray-600 italic">Not set</span>}
                  </TableCell>
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
        </div>
      )}
    </div>
  );
}

function SortablePdfSectionRow({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
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

// ─── FAQ Sections Panel ─────────────────────────────────────────────────────
function FaqSectionsPanel() {
  const utils = trpc.useUtils();
  const { data: sections = [], isLoading } = trpc.faq.listSectionsAdmin.useQuery();
  const renameMutation = trpc.faq.renameSection.useMutation({
    onSuccess: () => { utils.faq.listSectionsAdmin.invalidate(); toast.success("Section renamed"); },
    onError: (e) => toast.error(e.message),
  });
  const toggleVisibilityMutation = trpc.faq.toggleSectionVisibility.useMutation({
    onSuccess: () => { utils.faq.listSectionsAdmin.invalidate(); utils.faq.listSectionsPublic.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteSectionMutation = trpc.faq.deleteSection.useMutation({
    onSuccess: () => { utils.faq.listSectionsAdmin.invalidate(); utils.faq.listSectionsPublic.invalidate(); toast.success("Section deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const createEntryMutation = trpc.faq.createEntry.useMutation({
    onSuccess: () => { utils.faq.listSectionsAdmin.invalidate(); utils.faq.listSectionsPublic.invalidate(); toast.success("FAQ entry added"); },
    onError: (e) => toast.error(e.message),
  });
  const updateEntryMutation = trpc.faq.updateEntry.useMutation({
    onSuccess: () => { utils.faq.listSectionsAdmin.invalidate(); utils.faq.listSectionsPublic.invalidate(); toast.success("FAQ entry updated"); },
    onError: (e) => toast.error(e.message),
  });
  const toggleEntryMutation = trpc.faq.toggleEntryVisibility.useMutation({
    onSuccess: () => { utils.faq.listSectionsAdmin.invalidate(); utils.faq.listSectionsPublic.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteEntryMutation = trpc.faq.deleteEntry.useMutation({
    onSuccess: () => { utils.faq.listSectionsAdmin.invalidate(); utils.faq.listSectionsPublic.invalidate(); toast.success("FAQ entry deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const [renamingSection, setRenamingSection] = useState<{ id: number; name: string } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [addingEntryTo, setAddingEntryTo] = useState<number | null>(null);
  const [newEntry, setNewEntry] = useState({ question: "", answer: "", fileUrl: "", fileName: "" });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [localFaqOrder, setLocalFaqOrder] = useState<number[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const reorderFaqMutation = trpc.faq.reorderSections.useMutation({
    onSuccess: () => { utils.faq.listSectionsAdmin.invalidate(); utils.faq.listSectionsPublic.invalidate(); },
  });
  function handleFaqSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = localFaqOrder.length === sections.length ? localFaqOrder : sections.map(s => s.id);
    const oldIdx = ids.indexOf(active.id as number);
    const newIdx = ids.indexOf(over.id as number);
    const newOrder = arrayMove(ids, oldIdx, newIdx);
    setLocalFaqOrder(newOrder);
    reorderFaqMutation.mutate({ items: newOrder.map((id, i) => ({ id, sortOrder: i })) });
  }
  const uploadEntryFileMutation = trpc.faq.uploadEntryFile.useMutation({
    onSuccess: (data) => { setNewEntry(v => ({ ...v, fileUrl: data.url, fileName: data.fileName })); setUploadingFile(false); toast.success("File uploaded"); },
    onError: (e) => { setUploadingFile(false); toast.error(e.message); },
  });
  const [editingEntry, setEditingEntry] = useState<{ id: number; sectionId: number; question: string; answer: string } | null>(null);

  function toggleExpand(id: number) {
    setExpandedSections(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  if (isLoading) return <div className="flex items-center justify-center h-24"><div className="animate-spin w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-3">
      {/* Section header removed — FAQs flow inline with Help Articles and PDFs */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#eab308" }} />
        <span className="text-sm font-semibold text-white">FAQs</span>
        <span className="text-xs text-gray-500">Frequently asked questions grouped by topic</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(234,179,8,0.15)", color: "#eab308" }}>{sections.length} sections</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(234,179,8,0.15)", color: "#eab308" }}>{sections.reduce((sum, s) => sum + (s.entries?.length ?? 0), 0)} entries</span>
        </div>
      </div>
      {sections.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">No FAQ sections yet. Click "Add FAQ Section" to get started.</div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFaqSectionDragEnd}>
        <SortableContext items={localFaqOrder.length === sections.length ? localFaqOrder : sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
      {(localFaqOrder.length === sections.length ? localFaqOrder.map(id => sections.find(s => s.id === id)!).filter(Boolean) : sections).map(section => (
        <SortableFaqSectionRow key={section.id} id={section.id}>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
          {/* Section row */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#1d2230" }}>
            <span className="text-gray-600 cursor-grab flex-shrink-0" title="Drag to reorder"><GripVertical size={14} /></span>
            <button onClick={() => toggleExpand(section.id)} className="text-gray-400 hover:text-white transition">
              {expandedSections.has(section.id) ? <ChevronDown size={15} /> : <ChevronRightIcon size={15} />}
            </button>
            {renamingSection?.id === section.id ? (
              <input
                className="flex-1 bg-transparent border-b border-yellow-500 text-white text-sm outline-none"
                value={renamingSection.name}
                onChange={e => setRenamingSection(s => s ? { ...s, name: e.target.value } : null)}
                onKeyDown={e => {
                  if (e.key === "Enter" && renamingSection.name.trim()) { renameMutation.mutate({ id: section.id, name: renamingSection.name.trim() }); setRenamingSection(null); }
                  if (e.key === "Escape") setRenamingSection(null);
                }}
                autoFocus
              />
            ) : (
              <span className="flex-1 text-sm font-semibold text-white">{section.name}</span>
            )}
            <span className="text-xs text-gray-500">{section.entries?.length ?? 0} entries</span>
            <button
              onClick={() => toggleVisibilityMutation.mutate({ id: section.id, isVisible: !section.isVisible })}
              className="text-xs px-2 py-0.5 rounded-full font-semibold transition"
              style={section.isVisible
                ? { background: "rgba(103,199,40,0.15)", color: "#67C728", border: "1px solid rgba(103,199,40,0.3)" }
                : { background: "rgba(107,114,128,0.15)", color: "#6b7280", border: "1px solid rgba(107,114,128,0.3)" }
              }
            >{section.isVisible ? "Visible" : "Hidden"}</button>
            <button onClick={() => setRenamingSection({ id: section.id, name: section.name })} className="text-gray-500 hover:text-white transition"><Pencil size={13} /></button>
            <button onClick={() => { if (confirm(`Delete "${section.name}" and all its entries?`)) deleteSectionMutation.mutate({ id: section.id }); }} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={13} /></button>
          </div>
          {/* Entries */}
          {expandedSections.has(section.id) && (
            <div className="divide-y" style={{ borderTop: "1px solid #2a2a2a", background: "#161b27" }}>
              {(section.entries ?? []).map(entry => (
                <div key={entry.id} className="px-5 py-3 space-y-1">
                  {editingEntry?.id === entry.id ? (
                    <div className="space-y-2">
                      <input
                        className="w-full text-sm text-white bg-transparent border-b border-yellow-500 outline-none pb-1"
                        value={editingEntry.question}
                        onChange={e => setEditingEntry(v => v ? { ...v, question: e.target.value } : null)}
                        placeholder="Question"
                      />
                      <textarea
                        className="w-full text-xs text-gray-300 bg-transparent border border-gray-700 rounded p-2 outline-none resize-none"
                        rows={3}
                        value={editingEntry.answer}
                        onChange={e => setEditingEntry(v => v ? { ...v, answer: e.target.value } : null)}
                        placeholder="Answer"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => { updateEntryMutation.mutate({ id: entry.id, question: editingEntry.question, answer: editingEntry.answer }); setEditingEntry(null); }}
                          className="px-3 py-1 rounded text-xs font-semibold text-white" style={{ background: "#eab308" }}
                        >Save</button>
                        <button onClick={() => setEditingEntry(null)} className="px-3 py-1 rounded text-xs text-gray-400 hover:text-white" style={{ background: "#252d3d" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{entry.question}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{entry.answer}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleEntryMutation.mutate({ id: entry.id, isVisible: !entry.isVisible })}
                          className="text-xs px-2 py-0.5 rounded-full font-semibold transition"
                          style={entry.isVisible
                            ? { background: "rgba(103,199,40,0.15)", color: "#67C728", border: "1px solid rgba(103,199,40,0.3)" }
                            : { background: "rgba(107,114,128,0.15)", color: "#6b7280", border: "1px solid rgba(107,114,128,0.3)" }
                          }
                        >{entry.isVisible ? "Visible" : "Hidden"}</button>
                        <button onClick={() => setEditingEntry({ id: entry.id, sectionId: section.id, question: entry.question, answer: entry.answer })} className="text-gray-500 hover:text-white transition"><Pencil size={12} /></button>
                        <button onClick={() => { if (confirm("Delete this FAQ entry?")) deleteEntryMutation.mutate({ id: entry.id }); }} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {/* Add entry form */}
              {addingEntryTo === section.id ? (
                <div className="px-5 py-3 space-y-2">
                  <input
                    style={{ background: "#252d3d", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "7px 10px", width: "100%", fontSize: 13 }}
                    value={newEntry.question}
                    onChange={e => setNewEntry(v => ({ ...v, question: e.target.value }))}
                    placeholder="Question *"
                  />
                  <textarea
                    style={{ background: "#252d3d", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 8, padding: "7px 10px", width: "100%", fontSize: 13, resize: "vertical" }}
                    rows={3}
                    value={newEntry.answer}
                    onChange={e => setNewEntry(v => ({ ...v, answer: e.target.value }))}
                    placeholder="Answer *"
                  />
                  {/* Optional file attachment */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition" style={{ background: "#252d3d", color: "#9ca3af", border: "1px solid #2a2a2a" }}>
                      <Paperclip size={12} />
                      {newEntry.fileName ? newEntry.fileName : "Attach PDF (optional)"}
                      <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 16 * 1024 * 1024) { toast.error("File too large (max 16MB)"); return; }
                        setUploadingFile(true);
                        const reader = new FileReader();
                        reader.onload = () => {
                          const base64 = (reader.result as string).split(",")[1];
                          uploadEntryFileMutation.mutate({ fileName: file.name, fileBase64: base64, mimeType: file.type || "application/pdf" });
                        };
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                    {newEntry.fileUrl && (
                      <button onClick={() => setNewEntry(v => ({ ...v, fileUrl: "", fileName: "" }))} className="text-xs text-red-400 hover:text-red-300 transition">Remove</button>
                    )}
                    {uploadingFile && <span className="text-xs text-gray-500">Uploading…</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (newEntry.question.trim() && newEntry.answer.trim()) {
                          createEntryMutation.mutate({ sectionId: section.id, question: newEntry.question.trim(), answer: newEntry.answer.trim(), fileUrl: newEntry.fileUrl || undefined, fileName: newEntry.fileName || undefined });
                          setNewEntry({ question: "", answer: "", fileUrl: "", fileName: "" });
                          setAddingEntryTo(null);
                        }
                      }}
                      disabled={!newEntry.question.trim() || !newEntry.answer.trim() || createEntryMutation.isPending}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                      style={{ background: "#eab308" }}
                    >{createEntryMutation.isPending ? "Saving…" : "Add Entry"}</button>
                    <button onClick={() => { setAddingEntryTo(null); setNewEntry({ question: "", answer: "", fileUrl: "", fileName: "" }); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white" style={{ background: "#252d3d" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-2">
                  <button
                    onClick={() => { setAddingEntryTo(section.id); setExpandedSections(prev => new Set([...prev, section.id])); }}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-yellow-400 transition"
                  >
                    <Plus size={12} /> Add FAQ Entry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        </SortableFaqSectionRow>
      ))}
        </div>
      </SortableContext>
    </DndContext>
    </div>
  );
}
function SortableFaqSectionRow({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
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
          style={{ background: "rgba(255,153,0,0.15)" }}
        >
          <Headphones size={18} style={{ color: "#FF9900" }} />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">WAVV Support</h2>
          <p className="text-xs text-gray-500">Support analytics and management tools</p>
        </div>
      </div>

      {/* Under-construction banner */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,153,0,0.07)", border: "2px dashed rgba(255,153,0,0.35)" }}
      >
        <div className="flex flex-col items-center justify-center text-center py-16 px-8 gap-5">
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,153,0,0.15)" }}
          >
            <AlertTriangle size={40} style={{ color: "#FF9900" }} />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Support Analytics
            </h3>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{ background: "rgba(255,153,0,0.2)", color: "#FF9900" }}
            >
              <AlertTriangle size={11} />
              Under Construction
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
            This section will surface <span className="text-white font-medium">AI search usage stats</span>,{" "}
            <span className="text-white font-medium">engagement metrics</span>, and{" "}
            <span className="text-white font-medium">support volume trends</span> once instrumentation
            is complete. Ticket management is handled separately outside this portal.
          </p>

          {/* Upcoming features list */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mt-2"
          >
            {[
              { icon: <Activity size={14} />, label: "AI Search Stats" },
              { icon: <TrendingUp size={14} />, label: "Engagement Metrics" },
              { icon: <BarChart3 size={14} />, label: "Support Volume Trends" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}
              >
                <span style={{ color: "#FF9900" }}>{icon}</span>
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
    search_query: "#a855f7",
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
          style={{ background: "rgba(0,116,244,0.15)", color: "#0074F4", border: "1px solid rgba(0,116,244,0.3)" }}
        >
          <FileDown size={13} /> Export All Requests
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
  { key: "video",        label: "Video Requests",          description: "Academy lesson and tutorial requests" },
  { key: "webinar",     label: "Webinar Requests",         description: "Live and on-demand webinar requests" },
  { key: "guide",       label: "Guide Requests",           description: "Playbook, checklist, and doc requests" },
  { key: "search_query", label: "Query Search Requests",  description: "Auto-logged from search bar — no results found" },
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
                  style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
                  title={`Export ${label} as CSV`}
                >
                  <FileDown size={10} /> Export
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

// ─── Partner Analytics Tab ────────────────────────────────────────────────────
function PartnerAnalyticsTab({ isPartnerAdmin = false }: { isPartnerAdmin?: boolean }) {
  const { data: allUsers = [], isLoading, refetch } = trpc.admin.listUsers.useQuery();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [partnerSearch, setPartnerSearch] = useState("");
  const addUserMutation = trpc.admin.addUser.useMutation();
  const toggleStatus = trpc.admin.toggleUserStatus.useMutation({
    onSuccess: () => { refetch(); toast.success("Partner status updated."); },
    onError: (e) => toast.error(e.message),
  });
  const removePartner = trpc.admin.removeUser.useMutation({
    onSuccess: () => { refetch(); toast.success("Partner removed."); },
    onError: (e) => toast.error(e.message),
  });

  // Approved partners = users with partner role (external WAVV Partners)
  const approvedPartners = allUsers.filter((u: any) => u.role === "partner");
  const totalPartnerAccounts = approvedPartners.length;
  const activePartnerCount = approvedPartners.filter((u: any) => u.isActive).length;

  const filteredPartners = useMemo(() => {
    if (!partnerSearch.trim()) return [...approvedPartners].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const q = partnerSearch.trim().toLowerCase();
    return approvedPartners.filter((u: any) => (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q));
  }, [approvedPartners, partnerSearch]);

  const STAT_CARDS = [
    {
      label: "Approved Partners",
      value: totalPartnerAccounts,
      icon: <Users size={18} />,
      color: "#0074F4",
      description: "Active approved WAVV partner accounts",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Users size={16} style={{ color: "#0074F4" }} />
            Partner Analytics
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Track partner accounts, engagement, and program health</p>
        </div>
        <button
          onClick={() => { setShowInvite(true); setInviteEmail(""); setInviteName(""); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: "#0074F4", color: "#fff" }}
        >
          <UserPlus size={13} />
          Invite Partner
        </button>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="rounded-xl p-4 border border-white/10 space-y-3" style={{ background: "rgba(0,116,244,0.05)" }}>
          <h3 className="text-sm font-semibold text-white">Add WAVV Partner</h3>
          <p className="text-xs text-gray-500">They will be able to sign in via WAVV and access the Partners portal.</p>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={{ background: "#0d0d0d", border: "1px solid #333" }}
              placeholder="Full Name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />
            <input
              className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={{ background: "#0d0d0d", border: "1px solid #333" }}
              placeholder="Email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <button
              disabled={addUserMutation.isPending || !inviteEmail.trim() || !inviteName.trim()}
              onClick={async () => {
                try {
                  await addUserMutation.mutateAsync({ name: inviteName.trim(), email: inviteEmail.trim(), role: "partner" });
                  toast.success(`${inviteName.trim()} added as a WAVV Partner.`);
                  setInviteName(""); setInviteEmail(""); setShowInvite(false);
                  refetch();
                } catch (err: any) {
                  toast.error(err?.message ?? "Failed to add partner.");
                }
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
              style={{ background: "#0074F4", color: "#fff" }}
            >
              {addUserMutation.isPending ? "Adding…" : "Add"}
            </button>
            <button onClick={() => setShowInvite(false)} className="rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400">{card.label}</span>
              <span style={{ color: card.color }}>{card.icon}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {isLoading ? "—" : card.value}
            </div>
            <p className="text-xs text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Funnel note */}
      <div
        className="rounded-xl p-5"
        style={{ background: "rgba(0,116,244,0.06)", border: "1px solid rgba(0,116,244,0.15)" }}
      >
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <TrendingUp size={14} style={{ color: "#0074F4" }} />
          Partner Funnel
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "#0074F4" }} />
            <span className="text-gray-400">Applied</span>
            <span className="text-white font-semibold">→ wavv.com/partner-program</span>
          </div>
          <div className="text-gray-600">•</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "#22d3ee" }} />
            <span className="text-gray-400">Approved &amp; in system</span>
            <span className="text-white font-semibold">{totalPartnerAccounts}</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Course completion tracking and referral link analytics will be added once the partner onboarding course is live.
        </p>
      </div>

      {/* Approved Partners list */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#141414", border: "1px solid #2a2a2a" }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #2a2a2a" }}>
          <div>
            <h3 className="text-sm font-semibold text-white">Approved Partners</h3>
            <p className="text-xs text-gray-500 mt-0.5">{activePartnerCount} active · {totalPartnerAccounts} total</p>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs text-white outline-none w-48"
              style={{ background: "#0d0d0d", border: "1px solid #333" }}
              placeholder="Search partners..."
              value={partnerSearch}
              onChange={(e) => setPartnerSearch(e.target.value)}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-[#0074F4] border-t-transparent rounded-full" />
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <Users size={32} className="mb-3" style={{ color: "#374151" }} />
            <p className="text-sm font-medium text-gray-400">{partnerSearch ? "No partners match your search" : "No partner accounts yet"}</p>
            <p className="text-xs text-gray-600 mt-1">
              {partnerSearch ? "" : "Invite approved partners using the \"Invite WAVV Partner\" button above."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table className="min-w-[520px]">
            <TableHeader>
              <TableRow style={{ borderColor: "#2a2a2a" }}>
                <TableHead className="text-gray-500 text-xs">Name</TableHead>
                <TableHead className="text-gray-500 text-xs">Email</TableHead>
                <TableHead className="text-gray-500 text-xs">Joined</TableHead>
                <TableHead className="text-gray-500 text-xs">Status</TableHead>
                <TableHead className="text-gray-500 text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((u: any) => (
                <TableRow key={u.id} style={{ borderColor: "#1f1f1f" }}>
                  <TableCell className="text-white text-xs font-medium">{u.name ?? "—"}</TableCell>
                  <TableCell className="text-gray-400 text-xs">{u.email ?? "—"}</TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="text-[10px] px-2 py-0.5"
                      style={{
                        background: u.isActive ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.12)",
                        color: u.isActive ? "#4ade80" : "#f87171",
                        border: "none",
                      }}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleStatus.mutate({ userId: u.id, isActive: !u.isActive })}
                        disabled={toggleStatus.isPending}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all disabled:opacity-50"
                        style={{
                          background: u.isActive ? "rgba(239,68,68,0.1)" : "rgba(74,222,128,0.1)",
                          color: u.isActive ? "#f87171" : "#4ade80",
                          border: `1px solid ${u.isActive ? "rgba(239,68,68,0.2)" : "rgba(74,222,128,0.2)"}`,
                        }}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => { if (confirm(`Remove ${u.name ?? u.email}?`)) removePartner.mutate({ userId: u.id }); }}
                        disabled={removePartner.isPending}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all disabled:opacity-50"
                        style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}
                      >
                        Remove
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
                        </TableBody>
          </Table>
          </div>
        )}
      </div>
      {/* Placeholder for future metrics */}
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: "#141414", border: "1px solid #2a2a2a" }}
      >
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <AlertTriangle size={20} style={{ color: "#f59e0b" }} />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">Additional Metrics Coming Soon</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Referral link click tracking, course completion rates, and time-to-activation will be available once the partner onboarding course is published.
        </p>
      </div>
    </div>
  );
}

// ─── Settings Tab (Owner Only) ────────────────────────────────────────────────
function SettingsTab() {
  const utils = trpc.useUtils();

  // Load all site settings
  const { data: settings = {}, isLoading } = trpc.siteSettings.getAll.useQuery();

  const updateSetting = trpc.siteSettings.update.useMutation({
    onSuccess: () => {
      utils.siteSettings.getAll.invalidate();
      utils.siteSettings.get.invalidate();
      toast.success("Setting updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const maintenanceMode = settings["maintenance_mode"] === true;
  const intercomEnabled = settings["intercom_enabled"] !== false; // default true
  const approvedPartnersEnabled = settings["approved_partners_enabled"] !== false; // default true
  const announcementText = typeof settings["announcement_text"] === "string" ? settings["announcement_text"] : "";
  const announcementEnabled = settings["announcement_enabled"] === true;
  const navVisibility = (settings["nav_visibility"] ?? {}) as Record<string, boolean>;
  // Request button toggles (default true = enabled)
  const videoRequestsEnabled = settings["video_requests_enabled"] !== false;
  const webinarRequestsEnabled = settings["webinar_requests_enabled"] !== false;
  const guideRequestsEnabled = settings["guide_requests_enabled"] !== false;
  const searchRequestsEnabled = settings["search_requests_enabled"] !== false;

  // Nav items that can be toggled
  const NAV_ITEMS = [
    { href: "/home",        label: "Home",                   icon: Home },
    { href: "/academy",    label: "WAVV Academy",            icon: GraduationCapIcon },
    { href: "/webinars",   label: "WAVV Webinars",           icon: VideoIcon },
    { href: "/guides",     label: "WAVV Resource Hub",         icon: FileTextIcon },
    { href: "/playground",   label: "WAVV Playground",         icon: FlaskConical },
    { href: "/support",    label: "WAVV Support",            icon: HeadphonesIcon },
    { href: "/partners",   label: "WAVV Partners",          icon: UsersIcon },
    { href: "/wavvpartner",label: "WAVV Partner Portal",     icon: UsersIcon },
  ];

  function toggleNavItem(href: string) {
    const current = navVisibility[href] !== false; // default visible
    const updated = { ...navVisibility, [href]: !current };
    updateSetting.mutate({ key: "nav_visibility", value: updated });
  }

  const [localAnnouncement, setLocalAnnouncement] = useState(announcementText);
  // Sync local state when settings load
  useEffect(() => {
    setLocalAnnouncement(typeof settings["announcement_text"] === "string" ? settings["announcement_text"] : "");
  }, [settings]);

  function toggle(key: string, current: boolean) {
    updateSetting.mutate({ key, value: !current });
  }

  function saveAnnouncement() {
    updateSetting.mutate({ key: "announcement_text", value: localAnnouncement });
  }

  const sectionClass = "rounded-xl p-5 space-y-4";
  const sectionStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Settings size={16} style={{ color: "#0074F4" }} />
          Site Settings
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Owner-only controls for site-wide features and configuration</p>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-500">Loading settings…</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

          {/* ── LEFT COLUMN: 5 stacked cards ── */}
          <div className="space-y-4">

            {/* ── Announcement Banner ── */}
            <div className={sectionClass} style={sectionStyle}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(251,191,36,0.12)" }}>
                    <Megaphone size={15} style={{ color: "#fbbf24" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Announcement Banner</p>
                    <p className="text-xs text-gray-500">Show a banner at the top of every page</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle("announcement_enabled", announcementEnabled)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={announcementEnabled
                    ? { background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }
                    : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid #333" }}
                >
                  {announcementEnabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {announcementEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
              <div className="flex gap-2 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <input
                  type="text"
                  placeholder="e.g. New webinar this Friday — register now!"
                  value={localAnnouncement}
                  onChange={(e) => setLocalAnnouncement(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  style={{ background: "#0d0d0d", border: "1px solid #333" }}
                />
                <button
                  onClick={saveAnnouncement}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{ background: "#0074F4", color: "#fff" }}
                >
                  Save
                </button>
              </div>
            </div>

            {/* ── Maintenance Mode ── */}
            <div className={sectionClass} style={sectionStyle}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
                    <Wrench size={15} style={{ color: "#ef4444" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Maintenance Mode</p>
                        <p className="text-xs text-gray-500">Replace the public site with a "Coming soon" message. Owners can still access the Command Center.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!maintenanceMode && !window.confirm("Enable maintenance mode? Public visitors will see a Coming Soon page.")) return;
                    toggle("maintenance_mode", maintenanceMode);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={maintenanceMode
                    ? { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }
                    : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid #333" }}
                >
                  {maintenanceMode ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {maintenanceMode ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>

            {/* ── Intercom / Fin ── */}
            <div className={sectionClass} style={sectionStyle}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,116,244,0.12)" }}>
                    <Bot size={15} style={{ color: "#0074F4" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Intercom / Fin</p>
                    <p className="text-xs text-gray-500">Show or hide the Intercom chat bubble and AI Fin assistant site-wide</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle("intercom_enabled", intercomEnabled)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={intercomEnabled
                    ? { background: "rgba(0,116,244,0.15)", color: "#60a5fa", border: "1px solid rgba(0,116,244,0.3)" }
                    : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid #333" }}
                >
                  {intercomEnabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {intercomEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>

            {/* ── Approved Partners ── */}
            <div className={sectionClass} style={sectionStyle}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,169,226,0.12)" }}>
                    <UserPlus size={15} style={{ color: "#00A9E2" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Approved Partners</p>
                    <p className="text-xs text-gray-500">Controls whether the Approved Partners tab is active. Disable to prevent accidental partner invitations while the Partner Portal is under construction.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (approvedPartnersEnabled && !window.confirm("Disable Approved Partners? The tab will remain visible but locked to prevent accidental invitations.")) return;
                    toggle("approved_partners_enabled", approvedPartnersEnabled);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
                  style={approvedPartnersEnabled
                    ? { background: "rgba(0,169,226,0.15)", color: "#00A9E2", border: "1px solid rgba(0,169,226,0.3)" }
                    : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid #333" }}
                >
                  {approvedPartnersEnabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {approvedPartnersEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>



            {/* ── Request Buttons ── */}
            <div className={sectionClass} style={sectionStyle}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(168,85,247,0.12)" }}>
                  <MessageSquare size={15} style={{ color: "#c084fc" }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Request Buttons</p>
                  <p className="text-xs text-gray-500">Show or hide content request CTAs across the portal</p>
                </div>
              </div>
              <div className="space-y-2 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {([
                  { key: "video_requests_enabled", label: "Video Requests", icon: VideoIcon, enabled: videoRequestsEnabled, color: "#0074F4" },
                  { key: "webinar_requests_enabled", label: "Webinar Requests", icon: MonitorPlay, enabled: webinarRequestsEnabled, color: "#10b981" },
                  { key: "guide_requests_enabled", label: "Guide Requests", icon: FileTextIcon, color: "#67C728", enabled: guideRequestsEnabled },
                  { key: "search_requests_enabled", label: "Search Requests", icon: Search, color: "#f59e0b", enabled: searchRequestsEnabled },
                ] as { key: string; label: string; icon: React.ElementType; enabled: boolean; color: string }[]).map(({ key, label, icon: ReqIcon, enabled, color }) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <ReqIcon size={14} style={{ color: enabled ? color : "#4b5563" }} />
                      <span className="text-xs" style={{ color: enabled ? "#d1d5db" : "#6b7280" }}>{label}</span>
                    </div>
                    <button
                      onClick={() => toggle(key, enabled)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={enabled
                        ? { background: `${color}18`, color, border: `1px solid ${color}35` }
                        : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid #2a2a2a" }}
                    >
                      {enabled ? <ToggleRight size={11} /> : <ToggleLeft size={11} />}
                      {enabled ? "Visible" : "Hidden"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>{/* end left column */}

          {/* ── RIGHT COLUMN: Navigation Visibility (spans full height) ── */}
          <div className={sectionClass} style={sectionStyle}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.12)" }}>
                <Navigation size={15} style={{ color: "#818cf8" }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Navigation Visibility</p>
                <p className="text-xs text-gray-500">Show or hide individual sidebar items for all users</p>
              </div>
            </div>
            <div className="space-y-2 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {NAV_ITEMS.map(({ href, label, icon: NavIcon }) => {
                const isVisible = navVisibility[href] !== false; // default true
                return (
                  <div key={href} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <NavIcon size={14} style={{ color: isVisible ? "#9ca3af" : "#4b5563" }} />
                      <span className="text-xs" style={{ color: isVisible ? "#d1d5db" : "#6b7280" }}>{label}</span>
                    </div>
                    <button
                      onClick={() => toggleNavItem(href)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={isVisible
                        ? { background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)" }
                        : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid #2a2a2a" }}
                    >
                      {isVisible ? <Eye size={11} /> : <EyeOff size={11} />}
                      {isVisible ? "Visible" : "Hidden"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>{/* end right column */}

        </div>
      )}
    </div>
  );
}

// ─── Approved Partners Tab ────────────────────────────────────────────────────
function ApprovedPartnersTab() {
  const { data: settings = {} } = trpc.siteSettings.getAll.useQuery();
  const approvedPartnersEnabled = (settings as Record<string, unknown>)["approved_partners_enabled"] !== false;
  const { data: partners = [], refetch } = trpc.approvedPartners.list.useQuery();
  const [search, setSearch] = useState("");
  const inviteMutation = trpc.approvedPartners.invite.useMutation({
    onSuccess: () => { refetch(); toast.success("Partner added. They can sign in via WAVV."); },
    onError: (e) => toast.error(e.message),
  });
  const deactivateMutation = trpc.approvedPartners.deactivate.useMutation({ onSuccess: () => refetch() });
  const removeMutation = trpc.approvedPartners.remove.useMutation({ onSuccess: () => refetch() });
  const filtered = partners.filter(p =>
    (p.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.email ?? "").toLowerCase().includes(search.toLowerCase())
  );
  function exportCSV() {
    const header = "Name,Email,Status,Joined";
    const rows = filtered.map(p =>
      `"${p.name ?? ""}","${p.email ?? ""}","${p.isActive ? "Active" : "Inactive"}","${new Date(p.createdAt).toLocaleDateString()}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "wavv-partners.csv"; a.click();
    URL.revokeObjectURL(url);
  }
  if (!approvedPartnersEnabled) {
    return (
      <div className="p-6">
        {/* Hero header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,169,226,0.15)" }}>
            <UserPlus size={18} style={{ color: "#00A9E2" }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Approved Partners</h2>
            <p className="text-xs text-gray-500">Invite and manage WAVV Partners who can access the Partner Portal</p>
          </div>
        </div>
        {/* Locked overlay card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(0,169,226,0.07)", border: "2px dashed rgba(0,169,226,0.35)" }}
        >
          <div className="flex flex-col items-center justify-center text-center py-16 px-8 gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,169,226,0.15)" }}>
              <Lock size={40} style={{ color: "#00A9E2" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">Partner Invitations Disabled</h3>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{ background: "rgba(0,169,226,0.2)", color: "#00A9E2" }}
              >
                <AlertTriangle size={11} />
                Access Locked
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
              The Approved Partners feature has been <span className="text-white font-medium">disabled by an owner</span>. This prevents accidental partner invitations while the{" "}
              <span className="text-white font-medium">WAVV Partner Portal</span> is under construction. Re-enable it in{" "}
              <span className="text-white font-medium">Settings → Approved Partners</span>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mt-2">
              {[
                { icon: <UserPlus size={14} />, label: "Partner Invitations" },
                { icon: <Users size={14} />, label: "Partner Management" },
                { icon: <Shield size={14} />, label: "Access Control" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: "rgba(0,169,226,0.08)", border: "1px solid rgba(0,169,226,0.18)", color: "#00A9E2" }}
                >
                  <span style={{ color: "#00A9E2" }}>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hero header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,169,226,0.15)" }}>
            <UserPlus size={18} style={{ color: "#00A9E2" }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Approved Partners</h2>
            <p className="text-xs text-gray-500">Invite and manage WAVV Partners who can access the Partner Portal</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition"
            style={{ background: "rgba(0,169,226,0.15)", color: "#00A9E2", border: "1px solid rgba(0,169,226,0.3)" }}>
            <FileDown size={13} /> Export Partners
          </button>
        </div>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Partners", value: partners.length, color: "#3b82f6" },
          { label: "Active", value: partners.filter(p => p.isActive).length, color: "#22c55e" },
          { label: "Inactive", value: partners.filter(p => !p.isActive).length, color: "#ef4444" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)" }}>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Joined</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500 text-sm">No partners found.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-white font-medium">{p.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-400">{p.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => deactivateMutation.mutate({ userId: p.id })}
                      className="px-2 py-1 rounded text-xs text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                      {p.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                    <button onClick={() => { if (window.confirm(`Remove ${p.name ?? p.email} as a WAVV Partner?`)) removeMutation.mutate({ userId: p.id }); }}
                      className="px-2 py-1 rounded text-xs text-red-400 hover:bg-red-500/10 transition-colors">Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Partners Content Tab ─────────────────────────────────────────────────────
function PartnersContentTab() {
  const utils = trpc.useUtils();
  const [pageTarget, setPageTarget] = useState<"public" | "portal">("public");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingBlock, setAddingBlock] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", linkUrl: "", status: "coming_soon" as "coming_soon" | "live", isLocked: false, isVisible: true, sortOrder: 0 });
  const { data: allContent = [], isLoading } = trpc.partnerContent.list.useQuery({ pageTarget });
  const createMutation = trpc.partnerContent.create.useMutation({ onSuccess: () => { utils.partnerContent.list.invalidate(); setAddingBlock(null); resetForm(); } });
  const updateMutation = trpc.partnerContent.update.useMutation({ onSuccess: () => { utils.partnerContent.list.invalidate(); setEditingId(null); } });
  const deleteMutation = trpc.partnerContent.delete.useMutation({ onSuccess: () => utils.partnerContent.list.invalidate() });
  function resetForm() { setForm({ title: "", description: "", linkUrl: "", status: "coming_soon", isLocked: false, isVisible: true, sortOrder: 0 }); }
  const blockTypes = [
    { type: "hero" as const, label: "Hero / Welcome", icon: "Home" },
    { type: "module" as const, label: "Course Module", icon: "Book" },
    { type: "resource_card" as const, label: "Resource Card", icon: "Card" },
    { type: "quick_link" as const, label: "Quick Link", icon: "Link" },
  ];
  const grouped = blockTypes.map(bt => ({ ...bt, items: allContent.filter(c => c.blockType === bt.type) }));
  function startEdit(item: typeof allContent[0]) {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description ?? "", linkUrl: item.linkUrl ?? "", status: item.status ?? "coming_soon", isLocked: item.isLocked, isVisible: item.isVisible, sortOrder: item.sortOrder });
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,169,226,0.15)" }}
          >
            <Users size={18} style={{ color: "#00A9E2" }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">WAVV Partners Content</h2>
            <p className="text-xs text-gray-500">Manage content for the public Partners page and the WAVV Partners Portal</p>
          </div>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          {(["public", "portal"] as const).map(t => (
            <button key={t} onClick={() => setPageTarget(t)}
              className="px-4 py-1.5 text-xs font-medium transition-all"
              style={pageTarget === t ? { background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", color: "#fff" } : { background: "transparent", color: "#9ca3af" }}>
              {t === "public" ? "WAVV Partners" : "WAVV Partners Portal"}
            </button>
          ))}
        </div>
      </div>
      {/* Under Construction placeholder */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(0,169,226,0.07)", border: "2px dashed rgba(0,169,226,0.35)" }}
      >
        <div className="flex flex-col items-center justify-center text-center py-16 px-8 gap-5">
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(0,169,226,0.15)" }}
          >
            <AlertTriangle size={40} style={{ color: "#00A9E2" }} />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {pageTarget === "public" ? "WAVV Partners" : "WAVV Partners Portal"}
            </h3>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{ background: "rgba(0,169,226,0.2)", color: "#00A9E2" }}
            >
              <AlertTriangle size={11} />
              Under Construction
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
            This section will surface{" "}
            <span className="text-white font-medium">partner onboarding resources</span>,{" "}
            <span className="text-white font-medium">co-sell enablement content</span>, and{" "}
            <span className="text-white font-medium">portal access management</span>{" "}
            once the partner program is ready to launch.
          </p>

          {/* Upcoming features list */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mt-2">
            {[
              { icon: <Users size={14} />, label: "Partner Onboarding" },
              { icon: <FileText size={14} />, label: "Co-Sell Resources" },
              { icon: <BarChart3 size={14} />, label: "Partner Analytics" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}
              >
                <span style={{ color: "#00A9E2" }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
      {false && isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading content...</div>
      ) : false && (
        <div className="space-y-8">
          {grouped.map(group => (
            <div key={group.type} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  {group.label} <span className="text-xs text-gray-600">({group.items.length})</span>
                </h3>
                <button onClick={() => { setAddingBlock(group.type); resetForm(); }}
                  className="px-2.5 py-1 rounded-lg text-xs text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-all flex items-center gap-1">
                  <Plus size={11} /> Add
                </button>
              </div>
              {addingBlock === group.type && (
                <div className="rounded-xl p-4 border border-blue-500/30 space-y-3" style={{ background: "rgba(59,130,246,0.05)" }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Title *</label>
                      <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50" placeholder="Content title" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Description</label>
                      <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50 resize-none" placeholder="Optional description" />
                    </div>
                    {(group.type === "resource_card" || group.type === "quick_link") && (
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Link URL</label>
                        <input value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50" placeholder="https://..." />
                      </div>
                    )}
                    {group.type === "module" && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Status</label>
                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as "coming_soon" | "live" }))}
                          className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none">
                          <option value="coming_soon">Coming Soon</option>
                          <option value="live">Live</option>
                        </select>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      {group.type === "resource_card" && (
                        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                          <input type="checkbox" checked={form.isLocked} onChange={e => setForm(f => ({ ...f, isLocked: e.target.checked }))} className="rounded" /> Locked
                        </label>
                      )}
                      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                        <input type="checkbox" checked={form.isVisible} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))} className="rounded" /> Visible
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => createMutation.mutate({ pageTarget, blockType: group.type, ...form })}
                      disabled={!form.title || createMutation.isPending}
                      className="px-4 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                      {createMutation.isPending ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => setAddingBlock(null)} className="px-4 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white border border-white/10 transition-colors">Cancel</button>
                  </div>
                </div>
              )}
              {group.items.length === 0 && addingBlock !== group.type ? (
                <p className="text-xs text-gray-600 italic pl-1">No {group.label.toLowerCase()} items yet.</p>
              ) : group.items.map(item => (
                <div key={item.id} className="rounded-xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                  {editingId === item.id ? (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Title *</label>
                          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Description</label>
                          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50 resize-none" />
                        </div>
                        {(item.blockType === "resource_card" || item.blockType === "quick_link") && (
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">Link URL</label>
                            <input value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50" placeholder="https://..." />
                          </div>
                        )}
                        {item.blockType === "module" && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Status</label>
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as "coming_soon" | "live" }))}
                              className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none">
                              <option value="coming_soon">Coming Soon</option>
                              <option value="live">Live</option>
                            </select>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          {item.blockType === "resource_card" && (
                            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                              <input type="checkbox" checked={form.isLocked} onChange={e => setForm(f => ({ ...f, isLocked: e.target.checked }))} className="rounded" /> Locked
                            </label>
                          )}
                          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                            <input type="checkbox" checked={form.isVisible} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))} className="rounded" /> Visible
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateMutation.mutate({ id: item.id, ...form })}
                          disabled={!form.title || updateMutation.isPending}
                          className="px-4 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                          {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white border border-white/10 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{item.title}</p>
                          {!item.isVisible && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Hidden</span>}
                          {item.blockType === "module" && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${item.status === "live" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                              {item.status === "live" ? "Live" : "Coming Soon"}
                            </span>
                          )}
                          {item.blockType === "resource_card" && item.isLocked && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Locked</span>
                          )}
                        </div>
                        {item.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>}
                        {item.linkUrl && <p className="text-xs text-blue-400/70 mt-0.5 truncate">{item.linkUrl}</p>}
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <button onClick={() => startEdit(item)} className="px-2 py-1 rounded text-xs text-blue-400 hover:bg-blue-500/10 transition-colors">Edit</button>
                        <button onClick={() => { if (window.confirm("Delete this content block?")) deleteMutation.mutate({ id: item.id }); }}
                          className="px-2 py-1 rounded text-xs text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin Help Articles Section (header + PublishedHelpArticlesPanel) ──────────
function AdminHelpArticlesSection() {
  const ACCENT = "#8B5CF6";
  const { data: adminSections = [] } = trpc.helpArticles.listSectionsAdmin.useQuery();
  const { data: published = [] } = trpc.helpArticles.listPublished.useQuery();
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
      {/* Non-collapsible top-level header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#1d2230", borderBottom: "1px solid #2a2a2a" }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}20` }}>
            <HelpCircle size={14} style={{ color: ACCENT }} />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Help Articles</span>
            <span className="text-xs text-gray-500 ml-2">Customer-facing published articles</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${ACCENT}18`, color: ACCENT }}>{adminSections.length} sections</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${ACCENT}18`, color: ACCENT }}>{published.length} articles</span>
        </div>
      </div>
      <div className="p-4" style={{ background: "#111" }}>
        <PublishedHelpArticlesPanel />
      </div>
    </div>
  );
}

// ─── Published Help Articles Management Panel ─────────────────────────────────
function PublishedHelpArticlesPanel() {
  const ACCENT = "#8B5CF6";
  const utils = trpc.useUtils();
  // Use sections as the source of truth — show all sections even if empty
  const { data: adminSections = [], isLoading: sectionsLoading } = trpc.helpArticles.listSectionsAdmin.useQuery();
  const { data: published = [], isLoading: articlesLoading } = trpc.helpArticles.listPublished.useQuery();
  const unpublishMutation = trpc.helpArticles.unpublish.useMutation({
    onSuccess: () => { utils.helpArticles.listPublished.invalidate(); toast.success("Article removed from Help Articles"); },
    onError: (e) => toast.error(e.message),
  });
  const renameSectionMutation = trpc.helpArticles.renameSection.useMutation({
    onSuccess: () => { utils.helpArticles.listSectionsAdmin.invalidate(); utils.helpArticles.listPublished.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const toggleSectionMutation = trpc.helpArticles.toggleSectionVisibility.useMutation({
    onSuccess: () => { utils.helpArticles.listSectionsAdmin.invalidate(); utils.helpArticles.listSections.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteSectionMutation = trpc.helpArticles.deleteSection.useMutation({
    onSuccess: () => { utils.helpArticles.listSectionsAdmin.invalidate(); utils.helpArticles.listPublished.invalidate(); toast.success("Section deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const reorderMutation = trpc.helpArticles.reorder.useMutation({
    onSuccess: () => utils.helpArticles.listPublished.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const reorderSectionsMutation = trpc.helpArticles.reorderSections.useMutation({
    onSuccess: () => utils.helpArticles.listSectionsAdmin.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  // Build article map keyed by section name
  const bySection = adminSections.reduce((acc, sec) => {
    acc[sec.name] = [...published.filter(a => a.sectionName === sec.name)].sort((a, b) => a.sortOrder - b.sortOrder);
    return acc;
  }, {} as Record<string, typeof published>);
  // Local section order for optimistic drag reorder
  const [localSectionOrder, setLocalSectionOrder] = useState<number[]>([]);
  const orderedSections = localSectionOrder.length === adminSections.length
    ? localSectionOrder.map(id => adminSections.find(s => s.id === id)!).filter(Boolean)
    : adminSections;
  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = orderedSections.map(s => s.id);
    const oldIdx = ids.indexOf(active.id as number);
    const newIdx = ids.indexOf(over.id as number);
    const newOrder = arrayMove(ids, oldIdx, newIdx);
    setLocalSectionOrder(newOrder);
    reorderSectionsMutation.mutate(newOrder.map((id, i) => ({ id, sortOrder: i })));
  }
  // Default all sections to collapsed
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editingSection, setEditingSection] = useState<{ id: number; name: string; value: string } | null>(null);
  // Native article creation
  const [showNativeEditor, setShowNativeEditor] = useState(false);
  const [nativeEditorSection, setNativeEditorSection] = useState<string>("");
  const [editingNativeArticle, setEditingNativeArticle] = useState<{ id: number; title: string; nativeBody: string; sectionName: string } | null>(null);
  const createNativeMutation = trpc.helpArticles.createNativeArticle.useMutation({
    onSuccess: () => { utils.helpArticles.listPublished.invalidate(); setShowNativeEditor(false); toast.success("Native article published"); },
    onError: (e) => toast.error(e.message),
  });
  const updateNativeMutation = trpc.helpArticles.updateNativeArticle.useMutation({
    onSuccess: () => { utils.helpArticles.listPublished.invalidate(); setEditingNativeArticle(null); toast.success("Article updated"); },
    onError: (e) => toast.error(e.message),
  });
  const unpublishByIdMutation = trpc.helpArticles.unpublishById.useMutation({
    onSuccess: () => { utils.helpArticles.listPublished.invalidate(); toast.success("Article removed"); },
    onError: (e) => toast.error(e.message),
  });

  function handleDragEnd(secName: string, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const group = bySection[secName] ?? [];
    const oldIdx = group.findIndex(a => a.intercomArticleId === active.id);
    const newIdx = group.findIndex(a => a.intercomArticleId === over.id);
    const newOrder = arrayMove(group, oldIdx, newIdx);
    const sectionOrder = published.find(a => a.sectionName === secName)?.sectionOrder ?? 0;
    reorderMutation.mutate(newOrder.map((a, i) => ({ intercomArticleId: a.intercomArticleId ?? a.id.toString(), sortOrder: i, sectionOrder })));
  }

  const isLoading = sectionsLoading || articlesLoading;
  if (isLoading) return <div className="flex items-center justify-center py-8"><div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full" /></div>;

  if (adminSections.length === 0) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
        <HelpCircle size={24} className="mx-auto mb-2" style={{ color: ACCENT, opacity: 0.5 }} />
        <p className="text-sm text-gray-400 font-medium">No sections created yet</p>
        <p className="text-xs text-gray-600 mt-1">Click "+ Add Help Article Section" above to create your first section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={orderedSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {orderedSections.map((sec) => {
            const group = bySection[sec.name] ?? [];
            const isCollapsed = collapsed[sec.name] !== false; // default collapsed
            const isVisible = sec.isVisible !== false;
            return (
              <SortableHelpSectionRow key={sec.id} id={sec.id}>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
            <div
              className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition"
              style={{ background: "#1d2230" }}
            >
              <span className="text-gray-600 cursor-grab flex-shrink-0" title="Drag to reorder"><GripVertical size={14} /></span>
              <button onClick={e => { e.stopPropagation(); setCollapsed(c => ({ ...c, [sec.name]: isCollapsed ? false : true })); }} className="text-gray-400 hover:text-white transition flex-shrink-0">
                {isCollapsed ? <ChevronRightIcon size={15} /> : <ChevronDown size={15} />}
              </button>
              <div className="flex-1 flex items-center gap-3 min-w-0">
                {editingSection?.id === sec.id ? (
                  <input
                    className="text-sm font-semibold text-white bg-transparent border-b border-purple-500 outline-none px-1"
                    value={editingSection.value}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setEditingSection(prev => prev ? { ...prev, value: e.target.value } : null)}
                    onBlur={() => {
                      if (editingSection.value.trim() && editingSection.value !== editingSection.name) {
                        renameSectionMutation.mutate({ id: editingSection.id, name: editingSection.value.trim() });
                      }
                      setEditingSection(null);
                    }}
                    onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setEditingSection(null); }}
                    autoFocus
                  />
                ) : (
                  <span className="text-sm font-semibold text-white">{sec.name}</span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); setEditingSection({ id: sec.id, name: sec.name, value: sec.name }); }}
                  className="text-gray-600 hover:text-gray-300 transition"
                  title="Rename section"
                ><Pencil size={11} /></button>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${ACCENT}20`, color: ACCENT }}>{group.length}</span>
                {/* Per-section visibility toggle */}
                <button
                  onClick={() => toggleSectionMutation.mutate({ id: sec.id, isVisible: !isVisible })}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                  style={isVisible
                    ? { background: "rgba(103,199,40,0.15)", color: "#67C728", border: "1px solid rgba(103,199,40,0.3)" }
                    : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid #2a2a2a" }
                  }
                  title={isVisible ? "Hide this section from users" : "Show this section to users"}
                >
                  {isVisible ? <><Eye size={10} /> Visible</> : <><EyeOff size={10} /> Hidden</>}
                </button>
                <button
                  onClick={() => { if (confirm(`Delete section "${sec.name}"? Articles in this section will be unassigned.`)) deleteSectionMutation.mutate({ id: sec.id }); }}
                  className="text-gray-600 hover:text-red-400 transition"
                  title="Delete section"
                ><Trash2 size={13} /></button>
              </div>
            </div>
            {!isCollapsed && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(sec.name, e)}>
                <SortableContext items={group.map(a => a.intercomArticleId ?? a.id.toString())} strategy={verticalListSortingStrategy}>
                  <div style={{ borderTop: "1px solid #2a2a2a", background: "#111" }}>
                    {group.length === 0 ? (
                      <div className="px-4 py-4 text-center">
                        <p className="text-xs text-gray-600">No articles in this section yet. Use Synced Help Articles below to publish articles here.</p>
                      </div>
                    ) : (
                      <div className="divide-y" style={{ borderColor: "#2a2a2a" }}>
                        {group.map((a) => (
                          <SortableHelpArticleRow
                            key={a.intercomArticleId ?? a.id}
                            article={a}
                            onUnpublish={() => {
                              if (a.source === "native") {
                                unpublishByIdMutation.mutate({ id: a.id });
                              } else {
                                unpublishMutation.mutate({ intercomArticleId: a.intercomArticleId ?? a.id.toString() });
                              }
                            }}
                            onEdit={a.source === "native" ? () => setEditingNativeArticle({ id: a.id, title: a.title, nativeBody: a.nativeBody ?? "", sectionName: a.sectionName }) : undefined}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
              </SortableHelpSectionRow>
            );
          })}
        </SortableContext>
      </DndContext>
      {/* Native article editor for per-section + Article button */}
      <NativeArticleEditor
        open={showNativeEditor || editingNativeArticle !== null}
        onClose={() => { setShowNativeEditor(false); setNativeEditorSection(""); setEditingNativeArticle(null); }}
        sections={adminSections.map(s => s.name)}
        mode={editingNativeArticle ? "edit" : "create"}
        initial={editingNativeArticle
          ? { title: editingNativeArticle.title, nativeBody: editingNativeArticle.nativeBody, sectionName: editingNativeArticle.sectionName }
          : nativeEditorSection ? { title: "", nativeBody: "", sectionName: nativeEditorSection } : undefined
        }
        isSaving={createNativeMutation.isPending || updateNativeMutation.isPending}
        onSave={(data) => {
          if (editingNativeArticle) {
            updateNativeMutation.mutate({ id: editingNativeArticle.id, ...data });
          } else {
            createNativeMutation.mutate(data);
          }
        }}
      />
    </div>
  );
}
function SortableHelpSectionRow({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
function SortableHelpArticleRow({ article, onUnpublish, onEdit }: { article: { id: number; intercomArticleId: string | null; source?: string; title: string; url: string | null; sectionName: string; nativeBody?: string | null }; onUnpublish: () => void; onEdit?: () => void }) {
  const ACCENT = "#8B5CF6";
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: article.intercomArticleId ?? article.id.toString() });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const isNative = article.source === "native";
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 px-4 py-2.5">
      <span {...attributes} {...listeners} className="text-gray-600 cursor-grab hover:text-gray-400 transition flex-shrink-0">⠿</span>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <p className="text-xs font-medium text-white truncate">{article.title}</p>
        {isNative && (
          <span className="text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0" style={{ background: `${ACCENT}20`, color: ACCENT, fontSize: "10px" }}>
            Native
          </span>
        )}
      </div>
      {article.url && !isNative && (
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition flex-shrink-0"><ExternalLink size={12} /></a>
      )}
      {isNative && onEdit && (
        <button onClick={onEdit} className="text-gray-600 hover:text-purple-400 transition flex-shrink-0" title="Edit article"><Pencil size={12} /></button>
      )}
      <button onClick={onUnpublish} className="text-gray-600 hover:text-red-400 transition flex-shrink-0" title="Remove from Help Articles"><X size={13} /></button>
    </div>
  );
}

// ─── Synced Help Articles Panel (Intercom → Publish) ─────────────────────────
function HelpArticlesInline() {
  return <SyncedHelpArticlesPanel />;
}

function SyncedHelpArticlesPanel() {
  const ACCENT = "#8B5CF6";
  const utils = trpc.useUtils();
  const { data: collections, isLoading: colLoading } = trpc.helpArticles.adminListCollections.useQuery();
  const { data: articles, isLoading: artLoading } = trpc.helpArticles.adminListAll.useQuery();
  const { data: published = [] } = trpc.helpArticles.listPublished.useQuery();
  const { data: adminSections = [] } = trpc.helpArticles.listSectionsAdmin.useQuery();
  const syncMutation = trpc.helpArticles.sync.useMutation({
    onSuccess: (result) => {
      toast.success(`Sync complete — ${result.synced} articles synced, ${result.skipped} skipped`);
      utils.helpArticles.adminListAll.invalidate();
      utils.helpArticles.adminListCollections.invalidate();
    },
    onError: (err) => toast.error(`Sync failed: ${err.message}`),
  });
  const publishMutation = trpc.helpArticles.publish.useMutation({
    onSuccess: () => { utils.helpArticles.listPublished.invalidate(); toast.success("Article published to Help Articles"); },
    onError: (e) => toast.error(e.message),
  });
  const unpublishMutation = trpc.helpArticles.unpublish.useMutation({
    onSuccess: () => { utils.helpArticles.listPublished.invalidate(); toast.success("Article removed"); },
    onError: (e) => toast.error(e.message),
  });

  const [expandedCol, setExpandedCol] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  // Per-article section assignment state (before publishing) — maps articleId → sectionId (string)
  const [sectionSelects, setSectionSelects] = useState<Record<string, string>>({});

  const isLoading = colLoading || artLoading;
  const publishedIds = new Set(published.map(a => a.intercomArticleId));
  const publishedSections = Array.from(new Set(published.map(a => a.sectionName)));

  const filteredArticles = (articles ?? []).filter(
    (a) => !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.summary ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const colMap = new Map((collections ?? []).map((c) => [c.intercomId, c]));
  const grouped = new Map<string, typeof filteredArticles>();
  const uncategorized: typeof filteredArticles = [];
  for (const a of filteredArticles) {
    const colId = a.collectionId ?? "";
    if (colId) { if (!grouped.has(colId)) grouped.set(colId, []); grouped.get(colId)!.push(a); }
    else uncategorized.push(a);
  }

  const inputStyle: React.CSSProperties = { background: "#111", border: "1px solid #2a2a2a", borderRadius: 6, color: "#fff", padding: "4px 8px", fontSize: 12, outline: "none" };

  function getSelectedSectionName(articleId: string): string {
    const selectedId = sectionSelects[articleId];
    if (selectedId) {
      const found = adminSections.find(s => String(s.id) === selectedId);
      if (found) return found.name;
    }
    // Default to first section if available
    return adminSections[0]?.name ?? "";
  }

  return (
    <div className="space-y-5">
      {/* Sync header */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
            <HelpCircle size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Synced Help Articles</p>
            <p className="text-xs text-gray-500">All Help Articles (New/Updated). Select articles to publish to customers. Syncs every hour.</p>
          </div>
        </div>
        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}35` }}
        >
          {syncMutation.isPending ? <span className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" /> : <RotateCcw size={13} />}
          {syncMutation.isPending ? "Syncing…" : "Sync Now"}
        </button>
      </div>

      {/* Search */}
      <input
        style={{ background: "#1d2230", border: "1px solid #2a2a2a", borderRadius: 8, color: "#fff", padding: "6px 10px", fontSize: 13, outline: "none", width: "100%" }}
        placeholder="Search synced articles…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {(collections ?? []).sort((a, b) => a.sortOrder - b.sortOrder).map((col) => {
            const colArticles = grouped.get(col.intercomId) ?? [];
            const isOpen = expandedCol === col.intercomId;
            const publishedInCol = colArticles.filter(a => publishedIds.has(a.intercomId)).length;
            return (
              <div key={col.intercomId} style={{ background: "#1d2230", border: "1px solid #2a2a2a", borderRadius: 12 }}>
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpandedCol(isOpen ? null : col.intercomId)}>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{col.name}</p>
                    <span className="text-xs text-gray-500 flex-shrink-0">({colArticles.length})</span>
                    {publishedInCol > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: `${ACCENT}20`, color: ACCENT }}>{publishedInCol} published</span>
                    )}
                  </div>
                  {isOpen ? <ChevronUp size={14} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />}
                </div>
                {isOpen && (
                  <div className="px-4 pb-3 space-y-2" style={{ borderTop: "1px solid #2a2a2a" }}>
                    {colArticles.length === 0 ? (
                      <p className="text-xs text-gray-500 py-3">No articles in this collection.</p>
                    ) : (
                      colArticles.map((a) => {
                        const isPublished = publishedIds.has(a.intercomId);
                        return (
                          <div key={a.id} className="flex items-center gap-3 px-3 py-2 rounded-lg mt-2" style={{ background: "#111827", border: `1px solid ${isPublished ? `${ACCENT}30` : "#1f2937"}` }}>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white truncate">{a.title}</p>
                              {a.summary && <p className="text-xs text-gray-500 truncate mt-0.5">{a.summary}</p>}
                            </div>
                            {/* Section select dropdown */}
                            {!isPublished && adminSections.length > 0 && (
                              <div className="flex-shrink-0">
                                <select
                                  style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 6, color: "#fff", padding: "4px 8px", fontSize: 12, outline: "none", cursor: "pointer" }}
                                  value={sectionSelects[a.intercomId] ?? ""}
                                  onChange={e => setSectionSelects(s => ({ ...s, [a.intercomId]: e.target.value }))}
                                  className="w-40"
                                >
                                  <option value="">Pick a section…</option>
                                  {adminSections.map(sec => (
                                    <option key={sec.id} value={String(sec.id)}>{sec.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            {!isPublished && adminSections.length === 0 && (
                              <span className="text-xs text-gray-500 flex-shrink-0">Create a section first</span>
                            )}
                            {isPublished ? (
                              <button
                                onClick={() => unpublishMutation.mutate({ intercomArticleId: a.intercomId })}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0"
                                style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
                              >
                                <CheckCircle2 size={11} /> Published
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const sec = getSelectedSectionName(a.intercomId);
                                  if (!sec) { toast.error("Please select a section first"); return; }
                                  publishMutation.mutate({ intercomArticleId: a.intercomId, title: a.title, url: a.url, sectionName: sec, sortOrder: 0, sectionOrder: adminSections.findIndex(s => s.name === sec) });
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0"
                                style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid #2a2a2a" }}
                              >
                                <Plus size={11} /> Publish
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filteredArticles.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              {search ? `No articles match "${search}"` : "No articles synced yet. Click Sync Now to pull from Intercom."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Help Articles Admin Tab ──────────────────────────────────────────────────
function HelpArticlesAdminTab() {
  const ACCENT = "#8B5CF6";
  const utils = trpc.useUtils();

  const { data: collections, isLoading: colLoading } = trpc.helpArticles.adminListCollections.useQuery();
  const { data: articles, isLoading: artLoading } = trpc.helpArticles.adminListAll.useQuery();
  const syncMutation = trpc.helpArticles.sync.useMutation({
    onSuccess: (result) => {
      toast.success(`Sync complete — ${result.synced} articles synced, ${result.skipped} skipped`);
      utils.helpArticles.adminListAll.invalidate();
      utils.helpArticles.adminListCollections.invalidate();
    },
    onError: (err) => toast.error(`Sync failed: ${err.message}`),
  });
  const setArticleVisible = trpc.helpArticles.setArticleVisible.useMutation({
    onSuccess: () => utils.helpArticles.adminListAll.invalidate(),
    onError: (err) => toast.error(err.message),
  });
  const setCollectionVisible = trpc.helpArticles.setCollectionVisible.useMutation({
    onSuccess: () => utils.helpArticles.adminListCollections.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const [expandedCol, setExpandedCol] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const isLoading = colLoading || artLoading;

  const inputStyle: React.CSSProperties = {
    background: "#1d2230",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#fff",
    padding: "6px 10px",
    fontSize: 13,
    outline: "none",
    width: "100%",
  };

  const filteredArticles = (articles ?? []).filter(
    (a) =>
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.summary ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const colMap = new Map((collections ?? []).map((c) => [c.intercomId, c]));

  // Group articles by collectionId
  const grouped = new Map<string, typeof filteredArticles>();
  const uncategorized: typeof filteredArticles = [];
  for (const a of filteredArticles) {
    const colId = a.collectionId ?? "";
    if (colId) {
      if (!grouped.has(colId)) grouped.set(colId, []);
      grouped.get(colId)!.push(a);
    } else {
      uncategorized.push(a);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
            <HelpCircle size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Help Articles</p>
            <p className="text-xs text-gray-500">
              {articles?.length ?? 0} articles synced — select to publish to customers
            </p>
          </div>
        </div>
        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}35` }}
        >
          {syncMutation.isPending ? (
            <span className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
          ) : (
            <RotateCcw size={13} />
          )}
          {syncMutation.isPending ? "Syncing…" : "Sync Now"}
        </button>
      </div>

      {/* Search */}
      <input
        style={inputStyle}
        placeholder="Search articles…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Collections */}
          {(collections ?? []).sort((a, b) => a.sortOrder - b.sortOrder).map((col) => {
            const colArticles = grouped.get(col.intercomId) ?? [];
            const isOpen = expandedCol === col.intercomId;
            return (
              <div key={col.intercomId} style={{ background: "#1d2230", border: "1px solid #2a2a2a", borderRadius: 12 }}>
                {/* Collection header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedCol(isOpen ? null : col.intercomId)}
                >
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{col.name}</p>
                    <span className="text-xs text-gray-500 flex-shrink-0">({colArticles.length})</span>
                  </div>
                  {/* Collection visibility toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCollectionVisible.mutate({ id: col.id, visible: !col.visible });
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0"
                    style={
                      col.visible
                        ? { background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }
                        : { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }
                    }
                  >
                    {col.visible ? "Visible" : "Hidden"}
                  </button>
                  {isOpen ? <ChevronUp size={14} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />}
                </div>

                {/* Articles */}
                {isOpen && (
                  <div className="px-4 pb-3 space-y-2" style={{ borderTop: "1px solid #2a2a2a" }}>
                    {colArticles.length === 0 ? (
                      <p className="text-xs text-gray-500 py-3">No articles in this collection.</p>
                    ) : (
                      colArticles.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg mt-2"
                          style={{ background: "#111827", border: "1px solid #1f2937" }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{a.title}</p>
                            {a.summary && <p className="text-xs text-gray-500 truncate mt-0.5">{a.summary}</p>}
                          </div>
                          <button
                            onClick={() => setArticleVisible.mutate({ id: a.id, visible: !a.visible })}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0"
                            style={
                              a.visible
                                ? { background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }
                                : { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }
                            }
                          >
                            {a.visible ? "Visible" : "Hidden"}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Uncategorized */}
          {uncategorized.length > 0 && (
            <div style={{ background: "#1d2230", border: "1px solid #2a2a2a", borderRadius: 12 }}>
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                onClick={() => setExpandedCol(expandedCol === "__uncategorized" ? null : "__uncategorized")}
              >
                <p className="text-sm font-semibold text-white flex-1">Uncategorized</p>
                <span className="text-xs text-gray-500">({uncategorized.length})</span>
                {expandedCol === "__uncategorized" ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
              </div>
              {expandedCol === "__uncategorized" && (
                <div className="px-4 pb-3 space-y-2" style={{ borderTop: "1px solid #2a2a2a" }}>
                  {uncategorized.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg mt-2"
                      style={{ background: "#111827", border: "1px solid #1f2937" }}
                    >
                      <p className="text-xs font-medium text-white flex-1 truncate">{a.title}</p>
                      <button
                        onClick={() => setArticleVisible.mutate({ id: a.id, visible: !a.visible })}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0"
                        style={
                          a.visible
                            ? { background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }
                            : { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }
                        }
                      >
                        {a.visible ? "Visible" : "Hidden"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {filteredArticles.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              {search ? `No articles match "${search}"` : "No articles synced yet. Click Sync Now to pull from Intercom."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
