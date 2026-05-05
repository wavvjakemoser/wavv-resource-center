import { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FlaskConical,
  Phone,
  LayoutDashboard,
  Settings,
  Lock,
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
  const [form, setForm] = useState({
    name: userName ?? "",
    email: userEmail ?? "",
    playground: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitMutation = trpc.playground.submitRequest.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Request submitted! We'll notify you when it's ready.");
    },
    onError: (err) => {
      toast.error(err.message ?? "Submission failed. Please try again.");
    },
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.playground) e.playground = "Please select a playground";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    submitMutation.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      playground: form.playground,
      message: form.message.trim() || undefined,
    });
  }

  function handleClose() {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: userName ?? "", email: userEmail ?? "", playground: "", message: "" });
      setErrors({});
    }, 200);
  }

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    background: "#111",
    border: "1px solid #2a2a2a",
    color: "#fff",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    width: "100%",
    outline: "none",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "#161616", border: "1px solid rgba(168,85,247,0.25)" }}
      >
        {/* Close */}
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
              We'll notify you as soon as your selected playground is available.
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
                Let us know which playground you'd like access to and we'll notify you when it's ready.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    style={inputStyle}
                  />
                  {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    style={inputStyle}
                  />
                  {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Which Playground?</label>
                <select
                  value={form.playground}
                  onChange={(e) => setForm((f) => ({ ...f, playground: e.target.value }))}
                  style={{ ...inputStyle, appearance: "none" as const }}
                >
                  <option value="">Select a playground…</option>
                  {PLAYGROUND_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.playground && <p className="text-red-400 text-[11px] mt-1">{errors.playground}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Notes <span className="text-gray-600">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="What would you like to practice or explore?"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  style={{ ...inputStyle, resize: "vertical" as const }}
                />
              </div>

              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-1"
                style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
              >
                <Send size={13} />
                {submitMutation.isPending ? "Submitting…" : "Notify Me When Ready"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function HandsOn() {
  const { data: user } = trpc.auth.me.useQuery();
  const [modalOpen, setModalOpen] = useState(false);

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
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">WAVV Playground</h1>
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
          <Lock size={14} style={{ color: "#a855f7", flexShrink: 0 }} />
          <span className="text-gray-400">
            Playground environments are currently in development. They will be available in an upcoming release.
            The playgrounds below show what's planned.
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
              return (
                <div
                  key={tool.label}
                  className="flex flex-col gap-3 p-5 rounded-xl"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    opacity: 0.75,
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
                    <h3 className="text-white font-semibold text-sm mb-1">{tool.label}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{tool.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CTA banner ── */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl px-6 py-5"
          style={{
            background: "rgba(168,85,247,0.07)",
            border: "1px solid rgba(168,85,247,0.18)",
          }}
        >
          <div>
            <h3 className="text-white font-semibold text-sm mb-1">Interested in WAVV Playground?</h3>
            <p className="text-gray-500 text-xs leading-relaxed max-w-md">
              Let us know which playground you'd like access to and we'll notify you when it's ready.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
          >
            <Bell size={14} />
            Notify Me
          </button>
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
