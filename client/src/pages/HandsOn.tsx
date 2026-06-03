import { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FlaskConical,
  Phone,
  LayoutDashboard,
  Settings,
  Construction,
  CheckCircle2,
  Send,
  Bell,
  X,
} from "lucide-react";

const PLAYGROUND_TOOLS = [
  {
    label: "WAVV Dialer Playground",
    desc: "Practice calling flows, power dialer settings, and call dispositions in a safe environment without affecting your live account.",
    icon: Phone,
    color: "#0074F4",
  },
  {
    label: "WAVV Call Boards Playground",
    desc: "Explore call board layouts, team queues, and real-time metrics without affecting live data or active campaigns.",
    icon: LayoutDashboard,
    color: "#00A9E2",
  },
  {
    label: "WAVV Settings Playground",
    desc: "Walk through WAVV account settings, integrations, and configuration options in a risk-free environment.",
    icon: Settings,
    color: "#67C728",
  },
];

const PLAYGROUND_OPTIONS = [
  "WAVV Dialer Playground",
  "WAVV Call Boards Playground",
  "WAVV Settings Playground",
  "Other / General Feedback",
];

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitMutation.mutate({ optIn });
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setOptIn(false);
    }, 200);
  }

  if (!open) return null;

  const readonlyStyle: React.CSSProperties = {
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
        style={{ background: "#161616", border: "1px solid rgba(168,85,247,0.25)" }}
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
            <p className="text-gray-400 text-sm max-w-xs">
              We'll notify you as soon as WAVV Playground is available.
            </p>
            <button
              onClick={handleClose}
              className="mt-3 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={16} style={{ color: "#a855f7" }} />
                <h3 className="text-white font-semibold text-base">Get Notified</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                We'll send you a notification when WAVV Playground goes live.
              </p>
            </div>

            {/* User info — read-only if logged in, editable if not */}
            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Name</p>
                {userName ? (
                  <div style={readonlyStyle}>{userName}</div>
                ) : (
                  <input
                    type="text"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    placeholder="Your name"
                    style={{ ...readonlyStyle, color: "#e5e7eb", border: "1px solid rgba(168,85,247,0.3)" }}
                  />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                {userEmail ? (
                  <div style={readonlyStyle}>{userEmail}</div>
                ) : (
                  <input
                    type="email"
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{ ...readonlyStyle, color: "#e5e7eb", border: "1px solid rgba(168,85,247,0.3)" }}
                  />
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Opt-in checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-purple-500 cursor-pointer"
                />
                <span className="text-sm text-gray-300 leading-snug">
                  Yes, notify me when WAVV Playground is live. I agree to receive product communications from WAVV.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitMutation.isPending || !optIn}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
              >
                <Bell size={13} />
                {submitMutation.isPending ? "Submitting…" : "Notify Me"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function HandsOn() {
  const { data: user } = trpc.auth.me.useQuery(undefined, { retry: false });
  const { data: playgroundStats } = trpc.playground.getStats.useQuery(
    undefined,
    { enabled: !!user && (user.role === 'owner' || user.role === 'customer_admin' || user.role === 'admin'), retry: false }
  );
  const { data: requestStatus } = trpc.playground.hasRequested.useQuery(
    undefined,
    { enabled: !!user, retry: false }
  );
  const [modalOpen, setModalOpen] = useState(false);
  const alreadyRequested = requestStatus?.hasRequested ?? false;

  // Determine the most requested playground (if any requests exist)
  const mostRequested = playgroundStats?.byPlayground?.[0]?.playground ?? null;

  return (
    <PortalLayout title="WAVV Playground">
      <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
          style={{
            background: "linear-gradient(135deg, #1a0a2e 0%, #0d1f35 60%, #0a1a10 100%)",
            border: "1px solid rgba(168,85,247,0.25)",
          }}
        >
          <div className="relative z-10 flex items-start gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
            >
              <FlaskConical size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ background: "linear-gradient(90deg, #0074F4, #67C728)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>WAVV Playground</h1>
              <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
                A safe, isolated environment to explore WAVV features without affecting your live account.
                Practice the dialer, explore call boards, and get comfortable with the platform before going live.
              </p>
            </div>
          </div>
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #a855f7, transparent)", transform: "translate(30%, -30%)" }}
          />
        </div>

        {/* ── Coming soon notice ── */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}
        >
          <Construction size={14} style={{ color: "#a855f7", flexShrink: 0 }} />
          <span className="text-gray-400">
            These playgrounds are under construction — here's what's coming.
          </span>
        </div>

        {/* ── Playground cards ── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Planned WAVV Playgrounds
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLAYGROUND_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isMostRequested = mostRequested === tool.label;
              return (
                <div
                  key={tool.label}
                  className="relative flex flex-col gap-3 p-5 rounded-xl overflow-hidden"
                  style={{
                    background: "#1d2230",
                    border: isMostRequested ? `1px solid ${tool.color}40` : "1px solid #2a2a2a",
                    opacity: 0.85,
                  }}
                >

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${tool.color}20` }}
                    >
                      <Icon size={20} style={{ color: tool.color }} />
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}
                    >
                      Coming Soon
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-sm">{tool.label}</h3>
                      {isMostRequested && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
                          style={{ background: `${tool.color}20`, color: tool.color }}
                        >
                          Most Requested
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">{tool.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CTA banner ── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl px-6 py-4"
          style={{
            background: "rgba(168,85,247,0.08)",
            border: "1px solid rgba(168,85,247,0.2)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
              <Bell size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Get Notified When WAVV Playground Launches</p>
              <p className="text-gray-500 text-xs mt-0.5">Sign up and we'll let you know the moment it's ready.</p>
            </div>
          </div>
          {alreadyRequested ? (
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 cursor-default"
              style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", color: "#c084fc" }}
            >
              <CheckCircle2 size={14} />
              Requested
            </div>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
            >
              <Bell size={14} />
              Notify Me
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
