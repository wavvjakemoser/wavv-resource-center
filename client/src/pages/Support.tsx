import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Headphones, Plus, ExternalLink, Calendar, MessageSquare, Clock, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
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

export default function Support() {
  const [tab, setTab] = useState<"new" | "tickets">("new");
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
      setTab("tickets");
      refetchTickets();
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
              <h1 className="text-xl font-bold mb-1" style={{ background: "linear-gradient(90deg, #0074F4, #67C728)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Support</h1>
              <p className="text-gray-400 text-sm">
                Submit a support ticket, book a call with the WAVV team, or get instant answers from WAVV AI.
              </p>
            </div>
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: Sparkles,
              label: "Ask WAVV AI",
              desc: "Get instant answers without waiting",
              color: "#0074F4",
              action: () => {
                document.querySelector<HTMLButtonElement>("[data-wavv-ai-trigger]")?.click();
                // Fallback: find the WAVV AI button in header
              const btns = Array.from(document.querySelectorAll("button"));
              for (const btn of btns) {
                if (btn.textContent?.includes("WAVV AI")) {
                  btn.click();
                  break;
                }
              }
              },
            },
            {
              icon: ExternalLink,
              label: "Help Center",
              desc: "Browse our knowledge base",
              color: "#00A9E2",
              href: "https://help.wavv.com",
            },
            {
              icon: Calendar,
              label: "Book a Call",
              desc: "Schedule time with our team",
              color: "#67C728",
              href: "https://calendly.com/wavv",
            },
          ].map((item) => {
            const Icon = item.icon;
            const content = (
              <div
                className="flex items-start gap-3 p-4 rounded-xl transition-all cursor-pointer"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.boxShadow = `0 4px 20px ${item.color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}20` }}
                >
                  <Icon size={18} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            );

            if ("href" in item && item.href) {
              return (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  {content}
                </a>
              );
            }
            return (
              <div key={item.label} onClick={item.action}>
                {content}
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["new", "tickets"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === t ? "rgba(255, 153, 0, 0.15)" : "#1a1a1a",
                color: tab === t ? "#FF9900" : "#9ca3af",
                border: tab === t ? "1px solid rgba(255, 153, 0, 0.4)" : "1px solid #2a2a2a",
              }}
            >
              {t === "new" ? (
                <span className="flex items-center gap-1.5">
                  <Plus size={13} />
                  New Ticket
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <MessageSquare size={13} />
                  My Tickets {tickets && tickets.length > 0 ? `(${tickets.length})` : ""}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* New ticket form */}
        {tab === "new" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className="p-5 rounded-xl space-y-4"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
            >
              <h2 className="text-white font-semibold text-sm">Submit a Support Ticket</h2>
              <p className="text-gray-500 text-xs">
                The WAVV support team (including Cassie and Jake) will be notified immediately.
              </p>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                    style={{ background: "#111", border: "1px solid #333" }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
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
                      <option key={p} value={p} style={{ textTransform: "capitalize" }}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
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

              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #FF9900, #ff7700)" }}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        )}

        {/* My tickets */}
        {tab === "tickets" && (
          <div className="space-y-3">
            {!tickets || tickets.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare size={48} className="text-gray-700 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No tickets yet</h3>
                <p className="text-gray-500 text-sm">
                  Submit a ticket above and it will appear here.
                </p>
              </div>
            ) : (
              tickets.map((ticket) => {
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
              })
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
