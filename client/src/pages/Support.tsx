import PortalLayout from "@/components/PortalLayout";
import { ReadinessWidget } from "@/components/ReadinessWidget";
import { useState } from "react";
import {
  Headphones, Plus, ExternalLink, MessageSquare,
  Sparkles, X, MessagesSquare
} from "lucide-react";
import { trpc } from "@/lib/trpc";
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
  const [form, setForm] = useState({
    subject: "",
    category: "General Question" as (typeof CATEGORIES)[number],
    priority: "medium" as (typeof PRIORITIES)[number],
    description: "",
  });

  const submitMutation = trpc.support.submitTicket.useMutation({
    onSuccess: () => {
      toast.success("Ticket submitted! The WAVV team has been notified.");
      setForm({ subject: "", category: "General Question", priority: "medium", description: "" });
      setModalOpen(false);
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

  const ACTION_CARDS = [
    {
      key: "ai",
      title: "Ask WAVV AI",
      description: "Get an instant answer before submitting a ticket",
      icon: Sparkles,
      color: "#0074F4",
      onClick: () => {
        const btns = Array.from(document.querySelectorAll("button"));
        for (const btn of btns) {
          if (btn.textContent?.includes("WAVV AI")) { btn.click(); break; }
        }
      },
      href: undefined as string | undefined,
    },
    {
      key: "helpcenter",
      title: "Help Center",
      description: "Browse articles and step-by-step guides",
      icon: ExternalLink,
      color: "#00A9E2",
      onClick: undefined as (() => void) | undefined,
      href: "https://help.wavv.com",
    },
    {
      key: "chat",
      title: "Chat with Support",
      description: "Talk to the WAVV team in real time",
      icon: MessagesSquare,
      color: "#67C728",
      onClick: openIntercom,
      href: undefined,
    },
    {
      key: "ticket",
      title: "Submit a New Ticket",
      description: "Describe your issue and we'll follow up",
      icon: MessageSquare,
      color: "#FF9900",
      onClick: () => setModalOpen(true),
      href: undefined,
    },
  ];

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
                Get help fast — ask WAVV AI, browse the knowledge base, chat with the team, or submit a ticket.
              </p>
            </div>
          </div>
        </div>

        {/* 4 action cards — 2×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACTION_CARDS.map((card) => {
            const Icon = card.icon;
            const inner = (
              <div
                className="flex items-start gap-4 p-5 rounded-xl transition-all cursor-pointer h-full"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = card.color;
                  e.currentTarget.style.boxShadow = `0 4px 24px ${card.color}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={card.onClick}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${card.color}20` }}
                >
                  <Icon size={20} style={{ color: card.color }} />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-0.5">{card.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{card.description}</p>
                </div>
              </div>
            );

            if (card.href) {
              return (
                <a key={card.key} href={card.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  {inner}
                </a>
              );
            }
            return <div key={card.key}>{inner}</div>;
          })}
        </div>

        {/* Hint to find ticket history */}
        <p className="text-gray-600 text-xs text-center">
          Looking for your ticket history?{" "}
          <a href="/profile" className="underline" style={{ color: "#FF9900" }}>
            View it in your profile
          </a>
          .
        </p>

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
