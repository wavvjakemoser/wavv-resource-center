import { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  FlaskConical,
  Bell,
  CheckCircle2,
  X,
  ChevronRight,
  Construction,
} from "lucide-react";

// ─── Category Tiles ───────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: "gohighlevel",
    title: "Go High Level",
    description: "Practice WAVV features inside the Go High Level CRM — calling flows, call boards, and messaging.",
    color: "#0074F4",
    banner: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/playground-ghl-blue-9my73T937GTNr4y28Vikct.webp",
    href: "/playground/gohighlevel",
  },
  {
    key: "hubspot",
    title: "HubSpot",
    description: "Explore WAVV's integration with HubSpot — dialer, call boards, and messenger in a sandbox environment.",
    color: "#00A9E2",
    banner: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/playground-hubspot-cyan-3he7kCA44vZmpDJSXetC2q.webp",
    href: "/playground/hubspot",
  },
  {
    key: "salesforce",
    title: "Salesforce",
    description: "Experience WAVV within Salesforce — practice calling, explore boards, and test messaging workflows.",
    color: "#67C728",
    banner: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/playground-salesforce-green-dGSqmbKvh8vqj9nNxyiSyF.webp",
    href: "/playground/salesforce",
  },
];

// ─── Request Modal ────────────────────────────────────────────────────────────
function RequestModal({
  open,
  onClose,
  userName,
  userEmail,
}: {
  open: boolean;
  onClose: () => void;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const [localName, setLocalName] = useState("");
  const [localEmail, setLocalEmail] = useState("");

  const submitMutation = trpc.playground.submitRequest.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("You're on the list! We'll notify you when it's ready.");
    },
    onError: (err) => {
      toast.error(err.message ?? "Submission failed. Please try again.");
    },
  });

  const submitPublicMutation = trpc.playground.submitPublicInterest.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("You're on the list! We'll notify you when it's ready.");
    },
    onError: (err) => {
      toast.error(err.message ?? "Submission failed. Please try again.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (userName && userEmail) {
      submitMutation.mutate({ optIn });
    } else {
      if (!localName.trim() || !localEmail.trim()) {
        toast.error("Please enter your name and email.");
        return;
      }
      submitPublicMutation.mutate({ name: localName.trim(), email: localEmail.trim() });
    }
  }

  const isPending = submitMutation.isPending || submitPublicMutation.isPending;

  function handleClose() {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setOptIn(false);
    }, 200);
  }

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    background: "#0f1318",
    border: "1px solid #1e1e1e",
    color: "#9ca3af",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    width: "100%",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{ background: "#161616", border: "1px solid rgba(0,116,244,0.25)" }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={44} style={{ color: "#67C728" }} />
            <h3 className="text-white font-semibold text-lg">You're on the list!</h3>
            <p className="text-white text-sm max-w-xs">
              We'll notify you as soon as WAVV Playground is available.
            </p>
            <button
              onClick={handleClose}
              className="mt-3 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={16} style={{ color: "#0074F4" }} />
                <h3 className="text-white font-semibold text-base">Get Notified</h3>
              </div>
              <p className="text-white text-sm leading-relaxed">
                We'll send you a notification when WAVV Playground goes live.
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-white mb-1">Name</p>
                {userName ? (
                  <div style={inputStyle}>{userName}</div>
                ) : (
                  <input
                    type="text"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    placeholder="Your name"
                    style={{ ...inputStyle, color: "#e5e7eb", border: "1px solid rgba(0,116,244,0.3)" }}
                  />
                )}
              </div>
              <div>
                <p className="text-xs text-white mb-1">Email</p>
                {userEmail ? (
                  <div style={inputStyle}>{userEmail}</div>
                ) : (
                  <input
                    type="email"
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{ ...inputStyle, color: "#e5e7eb", border: "1px solid rgba(0,116,244,0.3)" }}
                  />
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-blue-500 cursor-pointer"
                />
                <span className="text-sm text-white leading-snug">
                  Yes, notify me when WAVV Playground is live. I agree to receive product communications from WAVV.
                </span>
              </label>

              <button
                type="submit"
                disabled={isPending || !optIn}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
              >
                <Bell size={13} />
                {isPending ? "Submitting…" : "Notify Me"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HandsOn() {
  const { data: user } = trpc.auth.me.useQuery(undefined, { retry: false });
  const { data: siteSettings = {} } = trpc.siteSettings.getAll.useQuery();
  const { data: requestStatus } = trpc.playground.hasRequested.useQuery(
    undefined,
    { enabled: !!user, retry: false }
  );
  const [modalOpen, setModalOpen] = useState(false);
  const alreadyRequested = requestStatus?.hasRequested ?? false;

  // Per-tile visibility from site settings
  const playgroundVisibility = (siteSettings["playground_sections_visibility"] as Record<string, boolean>) ?? {};

  // Filter visible categories
  const visibleCategories = CATEGORIES.filter((cat) => {
    const visible = playgroundVisibility[cat.key];
    return visible !== false; // default to visible if not explicitly hidden
  });

  return (
    <PortalLayout title="WAVV Playground">
      <div className="px-4 lg:px-8 py-6 space-y-8">
        {/* ── Header ── */}
        <div className="px-4 sm:px-6 lg:px-16 py-8 sm:py-12 text-center">
          <h1 className="font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}>
            <span style={{ background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #4ade80 70%, #22c55e 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              WAVV Playground
            </span>
          </h1>
          <div className="flex justify-center mb-5">
            <div style={{ width: "200px", height: "3px", borderRadius: "2px", background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)" }} />
          </div>
          <p className="mx-auto leading-relaxed" style={{ color: "#ffffff", fontSize: "clamp(0.88rem, 1.6vw, 1rem)", maxWidth: "560px" }}>
            A safe, isolated environment to explore WAVV features within your CRM. Practice calling, explore call boards, and get comfortable before going live.
          </p>
        </div>

        {/* ── Coming Soon Banner ── */}
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-3"
          style={{ background: "rgba(0,116,244,0.08)", border: "1px solid rgba(0,116,244,0.25)" }}
        >
          <Construction size={18} style={{ color: "#0074F4" }} />
          <p className="text-sm font-semibold" style={{ color: "#0074F4" }}>
            Coming Soon
          </p>
          <span className="text-xs text-gray-400 ml-1">— WAVV Playground is currently under development. Sign up below to get notified when it launches.</span>
        </div>

        {/* ── Category Tiles ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visibleCategories.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
              style={{
                background: "#111318",
                border: `1px solid ${cat.color}30`,
                boxShadow: `0 4px 20px ${cat.color}08`,
                minHeight: "260px",
              }}
            >
              {/* Banner image */}
              <div className="relative h-36 overflow-hidden flex-shrink-0">
                <img
                  src={cat.banner}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to top, #111318 0%, transparent 60%)` }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col px-5 pb-5 pt-2">
                <h3 className="text-lg font-bold text-white mb-1">{cat.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">{cat.description}</p>
                <div className="flex-1" />
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{ background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}40` }}
                  >
                    Coming Soon
                  </span>
                  <ChevronRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                    style={{ color: cat.color }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Request Access / Notify Me CTA ── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl px-6 py-5"
          style={{
            background: "rgba(0,116,244,0.06)",
            border: "1px solid rgba(0,116,244,0.2)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,116,244,0.15)" }}>
              <Bell size={18} style={{ color: "#0074F4" }} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Get Notified When WAVV Playground Launches</p>
              <p className="text-white text-xs mt-0.5">Sign up and we'll let you know the moment it's ready.</p>
            </div>
          </div>
          {alreadyRequested ? (
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 cursor-default"
              style={{ background: "rgba(0,116,244,0.12)", border: "1px solid rgba(0,116,244,0.3)", color: "#0074F4" }}
            >
              <CheckCircle2 size={14} />
              Requested
            </div>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
            >
              <Bell size={14} />
              Request Access
            </button>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      <RequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userName={user?.name}
        userEmail={user?.email}
      />
    </PortalLayout>
  );
}
