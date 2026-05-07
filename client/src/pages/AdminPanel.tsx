import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Shield,
  BookOpen,
  Video,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Users,
  TicketIcon,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

type AdminTab = "overview" | "courses" | "webinars" | "guides" | "tickets";

export default function AdminPanel() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<AdminTab>("overview");

  // Redirect non-admins
  if (user && user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  return (
    <PortalLayout title="Admin Panel">
      <div className="px-4 lg:px-6 py-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div
          className="flex items-center gap-4 p-5 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #1a0d1a 0%, #0d001a 100%)",
            border: "1px solid rgba(168, 85, 247, 0.2)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(168, 85, 247, 0.2)" }}
          >
            <Shield size={24} style={{ color: "#a855f7" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 text-sm">
              Manage courses, webinars, guides, and support tickets for the WAVV Resource Center.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "overview", label: "Overview", icon: BarChart3 },
              { key: "courses", label: "Courses", icon: BookOpen },
              { key: "webinars", label: "Webinars", icon: Video },
              { key: "guides", label: "Guides", icon: FileText },
              { key: "tickets", label: "Tickets", icon: TicketIcon },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === key ? "rgba(168, 85, 247, 0.15)" : "#1d2230",
                color: tab === key ? "#a855f7" : "#9ca3af",
                border: tab === key ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid #2a2a2a",
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && <AdminOverview />}
        {tab === "courses" && <AdminCourses />}
        {tab === "webinars" && <AdminWebinars />}
        {tab === "guides" && <AdminGuides />}
        {tab === "tickets" && <AdminTickets />}
      </div>
    </PortalLayout>
  );
}

function AdminOverview() {
  const { data: courses } = trpc.academy.getCourses.useQuery();
  const { data: webinars } = trpc.webinars.list.useQuery({});
  const { data: guides } = trpc.guides.list.useQuery();
  const { data: tickets } = trpc.support.adminGetAll.useQuery();

  const stats = [
    { label: "Total Courses", value: courses?.length ?? 0, icon: BookOpen, color: "#0074F4" },
    { label: "Webinars", value: webinars?.length ?? 0, icon: Video, color: "#00A9E2" },
    { label: "Guides", value: guides?.length ?? 0, icon: FileText, color: "#67C728" },
    { label: "Open Tickets", value: (tickets ?? []).filter((t: { status: string }) => t.status === "open").length, icon: TicketIcon, color: "#FF9900" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 rounded-xl" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{s.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                  <Icon size={14} style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          );
        })}
      </div>
      <div className="p-5 rounded-xl" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
        <h3 className="text-white font-semibold text-sm mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: "Add New Course", tab: "courses" as AdminTab },
            { label: "Add Webinar", tab: "webinars" as AdminTab },
            { label: "Upload Guide", tab: "guides" as AdminTab },
            { label: "View Tickets", tab: "tickets" as AdminTab },
          ].map((a) => (
            <button
              key={a.label}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all"
              style={{ background: "#252d3d", color: "#9ca3af" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; }}
            >
              <Plus size={13} />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminCourses() {
  const { data: courses, refetch } = trpc.academy.getCourses.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Onboarding",
    durationMinutes: "",
    thumbnailUrl: "",
    sortOrder: "0",
  });

  const createMutation = trpc.academy.adminCreateCourse.useMutation({
    onSuccess: () => {
      toast.success("Course created!");
      setShowForm(false);
      setForm({ title: "", description: "", category: "Onboarding", durationMinutes: "", thumbnailUrl: "", sortOrder: "0" });
      refetch();
    },
    onError: () => toast.error("Failed to create course."),
  });

  const deleteMutation = trpc.academy.adminDeleteCourse.useMutation({
    onSuccess: () => { toast.success("Course deleted."); refetch(); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold">Courses ({courses?.length ?? 0})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: "rgba(0, 116, 244, 0.15)", color: "#0074F4", border: "1px solid rgba(0, 116, 244, 0.3)" }}
        >
          <Plus size={14} />
          Add Course
        </button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl space-y-3" style={{ background: "#1d2230", border: "1px solid #0074F440" }}>
          <h3 className="text-white font-semibold text-sm">New Course</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Course title *"
              className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
              style={{ background: "#111", border: "1px solid #333" }}
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "#111", border: "1px solid #333" }}
            >
              {["Onboarding", "How-To", "Strategy and Best Practices"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none sm:col-span-2"
              style={{ background: "#111", border: "1px solid #333" }}
            />
            <input
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              placeholder="Duration (minutes)"
              type="number"
              className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
              style={{ background: "#111", border: "1px solid #333" }}
            />
            <input
              value={form.thumbnailUrl}
              onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
              placeholder="Thumbnail URL (optional)"
              className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
              style={{ background: "#111", border: "1px solid #333" }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate({
                title: form.title,
                description: form.description,
                category: form.category as "Onboarding" | "How-To" | "Strategy and Best Practices",
                durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : undefined,
                thumbnailUrl: form.thumbnailUrl || undefined,
                sortOrder: parseInt(form.sortOrder),
              })}
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: "#0074F4" }}
            >
              {createMutation.isPending ? "Creating..." : "Create Course"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {courses?.map((course) => (
          <div key={course.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{course.title}</p>
              <p className="text-gray-500 text-xs">{course.category}</p>
            </div>
            <button
              onClick={() => deleteMutation.mutate({ id: course.id })}
              className="p-1.5 rounded text-gray-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminWebinars() {
  const { data: webinars, refetch } = trpc.webinars.list.useQuery({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    host: "",
    type: "upcoming" as "upcoming" | "recording",
    scheduledAt: "",
    videoUrl: "",
    registrationUrl: "",
    thumbnailUrl: "",
  });

  const createMutation = trpc.webinars.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Webinar created!");
      setShowForm(false);
      refetch();
    },
    onError: () => toast.error("Failed to create webinar."),
  });

  const deleteMutation = trpc.webinars.adminDelete.useMutation({
    onSuccess: () => { toast.success("Webinar deleted."); refetch(); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold">Webinars ({webinars?.length ?? 0})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: "rgba(0, 169, 226, 0.15)", color: "#00A9E2", border: "1px solid rgba(0, 169, 226, 0.3)" }}
        >
          <Plus size={14} />
          Add Webinar
        </button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl space-y-3" style={{ background: "#1d2230", border: "1px solid #00A9E240" }}>
          <h3 className="text-white font-semibold text-sm">New Webinar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title *" className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none" style={{ background: "#111", border: "1px solid #333" }} />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "upcoming" | "recording" })} className="px-3 py-2 rounded-lg text-sm text-white outline-none" style={{ background: "#111", border: "1px solid #333" }}>
              <option value="upcoming">Upcoming</option>
              <option value="recording">Recording</option>
            </select>
            <input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="Host name" className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none" style={{ background: "#111", border: "1px solid #333" }} />
            <input value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} type="datetime-local" className="px-3 py-2 rounded-lg text-sm text-white outline-none" style={{ background: "#111", border: "1px solid #333" }} />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none sm:col-span-2" style={{ background: "#111", border: "1px solid #333" }} />
            <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="Video URL (for recordings)" className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none" style={{ background: "#111", border: "1px solid #333" }} />
            <input value={form.registrationUrl} onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })} placeholder="Registration URL (for upcoming)" className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none" style={{ background: "#111", border: "1px solid #333" }} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate({
                title: form.title,
                description: form.description || undefined,
                host: form.host || undefined,
                type: form.type,
                scheduledAt: form.scheduledAt ? new Date(form.scheduledAt) : undefined,
                videoUrl: form.videoUrl || undefined,
                registrationUrl: form.registrationUrl || undefined,
                thumbnailUrl: form.thumbnailUrl || undefined,
              })}
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "#00A9E2" }}
            >
              {createMutation.isPending ? "Creating..." : "Create Webinar"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {webinars?.map((w) => (
          <div key={w.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{w.title}</p>
              <p className="text-gray-500 text-xs capitalize">{w.type} {w.host ? `· ${w.host}` : ""}</p>
            </div>
            <button onClick={() => deleteMutation.mutate({ id: w.id })} className="p-1.5 rounded text-gray-600 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminGuides() {
  const { data: guides, refetch } = trpc.guides.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", fileType: "pdf", fileUrl: "" });

  const createMutation = trpc.guides.adminCreate.useMutation({
    onSuccess: () => { toast.success("Guide created!"); setShowForm(false); refetch(); },
    onError: () => toast.error("Failed to create guide."),
  });

  const deleteMutation = trpc.guides.adminDelete.useMutation({
    onSuccess: () => { toast.success("Guide deleted."); refetch(); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold">Guides ({guides?.length ?? 0})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: "rgba(103, 199, 40, 0.15)", color: "#67C728", border: "1px solid rgba(103, 199, 40, 0.3)" }}
        >
          <Plus size={14} />
          Add Guide
        </button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl space-y-3" style={{ background: "#1d2230", border: "1px solid #67C72840" }}>
          <h3 className="text-white font-semibold text-sm">New Guide</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title *" className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none" style={{ background: "#111", border: "1px solid #333" }} />
            <select value={form.fileType} onChange={(e) => setForm({ ...form, fileType: e.target.value })} className="px-3 py-2 rounded-lg text-sm text-white outline-none" style={{ background: "#111", border: "1px solid #333" }}>
              <option value="pdf">PDF</option>
              <option value="checklist">Checklist</option>
              <option value="playbook">Playbook</option>
              <option value="other">Other</option>
            </select>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none sm:col-span-2" style={{ background: "#111", border: "1px solid #333" }} />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category (e.g. Onboarding)" className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none" style={{ background: "#111", border: "1px solid #333" }} />
            <input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="File URL *" className="px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none" style={{ background: "#111", border: "1px solid #333" }} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate({ title: form.title, description: form.description || undefined, category: form.category || undefined, fileType: form.fileType as "pdf" | "checklist" | "playbook" | "other", fileUrl: form.fileUrl })}
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "#67C728" }}
            >
              {createMutation.isPending ? "Creating..." : "Create Guide"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {guides?.map((g) => (
          <div key={g.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{g.title}</p>
              <p className="text-gray-500 text-xs capitalize">{g.fileType} {g.category ? `· ${g.category}` : ""}</p>
            </div>
            <button onClick={() => deleteMutation.mutate({ id: g.id })} className="p-1.5 rounded text-gray-600 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTickets() {
  const { data: tickets, refetch } = trpc.support.adminGetAll.useQuery();
  const updateMutation = trpc.support.adminUpdateStatus.useMutation({
    onSuccess: () => { toast.success("Ticket updated."); refetch(); },
  });

  const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"] as const;
  const STATUS_COLORS: Record<string, string> = {
    open: "#0074F4",
    in_progress: "#FF9900",
    resolved: "#67C728",
    closed: "#6b7280",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-white font-semibold">All Tickets ({tickets?.length ?? 0})</h2>
      <div className="space-y-2">
        {(!tickets || tickets.length === 0) && (
          <p className="text-gray-500 text-sm text-center py-8">No tickets yet.</p>
        )}
        {(tickets ?? []).map((ticket) => (
          <div key={ticket.id} className="p-4 rounded-xl" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-white text-sm font-semibold">{ticket.subject}</p>
                <p className="text-gray-500 text-xs mt-0.5">{ticket.category} · {ticket.priority}</p>
              </div>
              <select
                value={ticket.status}
                onChange={(e) => updateMutation.mutate({ id: ticket.id, status: e.target.value as typeof STATUS_OPTIONS[number] })}
                className="px-2 py-1 rounded text-xs font-medium outline-none"
                style={{
                  background: `${STATUS_COLORS[ticket.status]}20`,
                  color: STATUS_COLORS[ticket.status],
                  border: `1px solid ${STATUS_COLORS[ticket.status]}40`,
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} style={{ background: "#1d2230", color: "#fff" }}>
                    {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-gray-400 text-xs line-clamp-2">{ticket.description}</p>
            <p className="text-gray-600 text-xs mt-2">
              {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
