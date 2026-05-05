import PortalLayout from "@/components/PortalLayout";
import { ReadinessWidget } from "@/components/ReadinessWidget";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  Headphones, Plus, ExternalLink, MessageSquare, Clock,
  CheckCircle, AlertCircle, Sparkles, X, ChevronDown, ChevronUp, MessagesSquare
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Technical Issue",
  "Billing",
  "Feature Request",
  "Onboarding",
  "General Question",
  "Other",
] as const;

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

const STATUS_META: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "#0074F4" },
  in_progress: { label: "In Progress", color: "#FF9900" },
  resolved: { label: "Resolved", color: "#67C728" },
  closed: { label: "Closed", color: "#6b7280" },
};

const PRIORITY_META: Record<string, { color: string }> = {
  low: { color: "#6b7280" },
  medium: { color: "#00A9E2" },
  high: { color: "#FF9900" },
  urgent: { color: "#ef4444" },
};

// Intercom launcher — uses window.Intercom if the script is loaded, otherwise shows a toast
function openIntercom() {
  const w = window as unknown as { Intercom?: (cmd: string) => void };
  if (typeof w.Intercom === "function") {
    w.Intercom("show");
  } else {
    toast.info("Live chat coming soon — use the ticket form or Help Center in the meantime.");
  }
}

export default function Support() {
  const [modalOpen, setModalOpen] = useState(false);
  const [ticketsExpanded, setTicketsExpanded] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    category: "General Question" as (typeof CATEGORIES)[number],
    priority: "medium" as (typeof PRIORITIES)[number],
    description: "",
  });

  const { data: tickets, refetch: refetchTickets } = trpc.support.getMyTickets.useQuery();
  const submitMutation = trpc.support.submitTicket.useMutation({
    onSuccess: () => {
      toast.success("Ticket submitted! The WAVV team has been notified.");
      setForm({ subject: "", category: "General Question", priority: "medium", description: "" });
      setModalOpen(false);
      refetchTickets();
      setTicketsExpanded(true);
    },
    onError: () => {
      toast.error("Failed to submit ticket. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate(form);
  };

  const ticketCount = tickets?.length ?? 0;
  const openCount = tickets?.filter((t) => t.status === "open" || t.status === "in_progress").length ?? 0;

  return (
    <PortalLayout title="Support">
      <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #1a0d00 0%, #1a1000 100%)",
            border: "1px solid rgba(255, 153, 0, 0.2)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255, 153, 0, 0.2)" }}
            >
              <Headphones size={24} style={{ color: "#FF9900" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#FF9900" }}>WAVV Support</h1>
              <p className="text-gray-400 text-sm">
                Get help fast — ask WAVV AI, browse the knowledge base, or chat with the support team directly.
              </p>
            </div>
          </div>
        </div>

        {/* Quick action cards — 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* Ask WAVV AI */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl transition-all cursor-pointer"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0074F4";
              e.currentTarget.style.boxShadow = "0 4px 20px #0074F415";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#2a2a2a";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={() => {
              const btns = Array.from(document.querySelectorAll("button"));
              for (const btn of btns) {
                if (btn.textContent?.includes("WAVV AI")) { btn.click(); break; }
              }
            }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#0074F420" }}>
              <Sparkles size={18} style={{ color: "#0074F4" }} />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Ask WAVV AI</p>
              <p className="text-gray-500 text-xs mt-0.5">Get an instant answer before submitting a ticket</p>
            </div>
          </div>

          {/* Help Center */}
          <a
            href="https://help.wavv.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <div
              className="flex items-start gap-3 p-4 rounded-xl transition-all cursor-pointer h-full"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#00A9E2";
                e.currentTarget.style.boxShadow = "0 4px 20px #00A9E215";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2a2a2a";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#00A9E220" }}>
                <ExternalLink size={18} style={{ color: "#00A9E2" }} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Help Center</p>
                <p className="text-gray-500 text-xs mt-0.5">Browse articles and step-by-step guides</p>
              </div>
            </div>
          </a>

          {/* Chat with Support (Intercom) */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl transition-all cursor-pointer"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#67C728";
              e.currentTarget.style.boxShadow = "0 4px 20px #67C72815";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#2a2a2a";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={openIntercom}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#67C72820" }}>
              <MessagesSquare size={18} style={{ color: "#67C728" }} />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Chat with Support</p>
              <p className="text-gray-500 text-xs mt-0.5">Talk to the WAVV team in real time</p>
            </div>
          </div>

        </div>

        {/* ── Compact My Tickets bar ── */}
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
        >
          {/* Left: label + counts */}
          <button
            className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
            onClick={() => setTicketsExpanded((v) => !v)}
          >
            <MessageSquare size={15} style={{ color: "#FF9900" }} />
            <span className="text-white text-sm font-semibold">My Tickets</span>
            {ticketCount > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#FF990020", color: "#FF9900" }}
              >
                {ticketCount}
              </span>
            )}
            {openCount > 0 && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ background: "#0074F420", color: "#0074F4" }}
              >
                {openCount} open
              </span>
            )}
            {ticketCount === 0 && (
              <span className="text-gray-600 text-xs">No tickets yet</span>
            )}
            {ticketCount > 0 && (
              ticketsExpanded
                ? <ChevronUp size={13} className="text-gray-500 ml-1" />
                : <ChevronDown size={13} className="text-gray-500 ml-1" />
            )}
          </button>

          {/* Right: New Ticket button */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #FF9900, #ff7700)", color: "#fff" }}
          >
            <Plus size={12} />
            New Ticket
          </button>
        </div>

        {/* Collapsible ticket list */}
        {ticketsExpanded && ticketCount > 0 && (
          <div className="space-y-3 -mt-3">
            {tickets!.map((ticket) => {
              const statusMeta = STATUS_META[ticket.status] ?? STATUS_META.open;
              const priorityMeta = PRIORITY_META[ticket.priority] ?? PRIORITY_META.medium;
              return (
                <div
                  key={ticket.id}
                  className="p-4 rounded-xl"
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-white text-sm font-semibold leading-snug">{ticket.subject}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                        style={{ background: `${priorityMeta.color}20`, color: priorityMeta.color }}
                      >
                        {ticket.priority}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                        style={{ background: `${statusMeta.color}20`, color: statusMeta.color }}
                      >
                        {ticket.status === "resolved" ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-2">{ticket.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>{ticket.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <ReadinessWidget page="support" />

      {/* Ticket form modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6 space-y-4"
            style={{ background: "#1a1a1a", border: "1px solid #333" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">Submit a Support Ticket</h2>
                <p className="text-gray-500 text-xs mt-0.5">The WAVV support team will be notified immediately.</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
              >
                <X size={15} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none transition-all"
                  style={{ background: "#111", border: "1px solid #333" }}
                  onFocus={(e) => { e.target.style.borderColor = "#FF9900"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#333"; }}
                />
              </div>
              {/* Category + Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                    style={{ background: "#111", border: "1px solid #333" }}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as typeof form.priority })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                    style={{ background: "#111", border: "1px solid #333" }}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your issue in detail. Include any error messages, steps to reproduce, or relevant context..."
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none transition-all resize-none"
                  style={{ background: "#111", border: "1px solid #333" }}
                  onFocus={(e) => { e.target.style.borderColor = "#FF9900"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#333"; }}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-white/5"
                  style={{ background: "#111", border: "1px solid #333", color: "#9ca3af" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #FF9900, #ff7700)" }}
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
