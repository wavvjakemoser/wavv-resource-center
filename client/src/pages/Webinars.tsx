import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import {
  Video, Calendar, Clock, ExternalLink, PlayCircle,
  Users, Star, RefreshCw, Timer
} from "lucide-react";
import { toast } from "sonner";

// ─── Countdown helper ─────────────────────────────────────────────────────────
// Returns the next 30-min boundary from now (e.g. :00 or :30)
function nextHalfHour(): Date {
  const now = new Date();
  const ms = now.getTime();
  const interval = 30 * 60 * 1000;
  return new Date(Math.ceil(ms / interval) * interval);
}

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(() => Math.max(0, target.getTime() - Date.now()));
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, target.getTime() - Date.now()));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const totalSec = Math.floor(remaining / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Shared card component ────────────────────────────────────────────────────
type WebinarType = "exclusive" | "evergreen" | "recording";

function WebinarCard({
  webinar,
  variant,
  nextSession,
}: {
  webinar: { id: number; title: string; description?: string | null; host?: string | null; scheduledAt?: Date | null; registrationUrl?: string | null; videoUrl?: string | null; viewCount?: number | null; accentColor?: string | null };
  variant: WebinarType;
  nextSession?: Date;
}) {
  const { data: myRegistrations } = trpc.webinars.getMyRegistrations.useQuery();
  const registerMutation = trpc.webinars.register.useMutation({
    onSuccess: (res) => {
      if (res.alreadyRegistered) toast.info("You're already registered.");
      else toast.success("Registered! You'll be notified before the session starts.");
    },
  });
  const watchMutation = trpc.webinars.watch.useMutation();

  const isRegistered = (myRegistrations ?? []).some((r) => r.webinarId === webinar.id);
  const countdown = useCountdown(nextSession ?? nextHalfHour());

  const SECTION_ACCENT: Record<WebinarType, string> = {
    exclusive: "#D4AF37",
    evergreen: "#0074F4",
    recording: "#00A9E2",
  };
  // Use per-card color for evergreen, section default otherwise
  const accentColor = (variant === "evergreen" && webinar.accentColor) ? webinar.accentColor : SECTION_ACCENT[variant];

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden transition-all duration-200"
      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.boxShadow = `0 4px 20px ${accentColor}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2a2a2a";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Thumbnail / header strip */}
      <div
        className="relative flex items-center justify-center"
        style={{
          height: "100px",
          background: `linear-gradient(135deg, #0d1117, #1a1a2e)`,
        }}
      >
        <Video size={28} className="text-gray-700" />
        {variant === "evergreen" && nextSession && (
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold"
            style={{ background: "rgba(0,116,244,0.85)", color: "#fff" }}
          >
            <Timer size={11} />
            Next session in {countdown}
          </div>
        )}
        {webinar.viewCount ? (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
            style={{ background: "rgba(0,0,0,0.6)", color: "#9ca3af" }}
          >
            <Users size={10} /> {webinar.viewCount}
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-white font-semibold text-sm mb-1 leading-snug">{webinar.title}</h3>
        {webinar.description && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-2">{webinar.description}</p>
        )}
        {webinar.host && (
          <p className="text-gray-500 text-xs mb-2">
            Host: <span className="text-gray-300">{webinar.host}</span>
          </p>
        )}
        {variant === "exclusive" && webinar.scheduledAt && (
          <div className="space-y-0.5 mb-3">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <Calendar size={11} style={{ color: accentColor }} />
              {new Date(webinar.scheduledAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <Clock size={11} style={{ color: accentColor }} />
              {new Date(webinar.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
            </p>
          </div>
        )}
        {variant === "evergreen" && (
          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
            <RefreshCw size={11} style={{ color: accentColor }} />
            Runs every 30 minutes — join anytime
          </p>
        )}

        <div className="mt-auto">
          {variant === "recording" ? (
            webinar.videoUrl ? (
              <a
                href={webinar.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => watchMutation.mutate({ webinarId: webinar.id })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "rgba(0,169,226,0.15)", color: "#00A9E2", border: "1px solid rgba(0,169,226,0.3)" }}
              >
                <PlayCircle size={12} /> Watch Recording
              </a>
            ) : (
              <span className="text-xs text-gray-600">Recording coming soon</span>
            )
          ) : webinar.registrationUrl ? (
            <a
              href={webinar.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => registerMutation.mutate({ webinarId: webinar.id })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: isRegistered ? "rgba(103,199,40,0.15)" : `${accentColor}22`,
                color: isRegistered ? "#67C728" : accentColor,
                border: `1px solid ${isRegistered ? "#67C72840" : `${accentColor}40`}`,
              }}
            >
              <ExternalLink size={12} />
              {isRegistered ? "Registered ✓" : variant === "evergreen" ? "Join Next Session" : "Register Now"}
            </a>
          ) : (
            <button
              onClick={() => registerMutation.mutate({ webinarId: webinar.id })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: isRegistered ? "rgba(103,199,40,0.15)" : `${accentColor}22`,
                color: isRegistered ? "#67C728" : accentColor,
                border: `1px solid ${isRegistered ? "#67C72840" : `${accentColor}40`}`,
              }}
            >
              {isRegistered ? "Registered ✓" : variant === "evergreen" ? "Join Next Session" : "Register"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type WebinarSection = "exclusive" | "evergreen" | "recording";

// Tab order: Evergreen → Exclusive → Recording
const SECTION_ORDER: WebinarSection[] = ["evergreen", "exclusive", "recording"];

const SECTION_CONFIG: Record<WebinarSection, { label: string; icon: React.ReactNode; accent: string; description: string }> = {
  evergreen: {
    label: "Evergreen Webinars",
    icon: <RefreshCw size={14} />,
    accent: "#0074F4",
    description: "Always-on sessions running every 30 minutes — join anytime",
  },
  exclusive: {
    label: "Upcoming Exclusive Webinars",
    icon: <Star size={14} />,
    accent: "#D4AF37",
    description: "Single-topic, focused live sessions — limited availability",
  },
  recording: {
    label: "On-Demand Recordings",
    icon: <PlayCircle size={14} />,
    accent: "#00A9E2",
    description: "Watch past webinars and sessions at your own pace",
  },
};

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-52 rounded-xl animate-pulse" style={{ background: "#1a1a1a" }} />
      ))}
    </div>
  );
}

export default function Webinars() {
  const [activeSection, setActiveSection] = useState<WebinarSection>("evergreen");

  const { data: exclusiveWebinars, isLoading: loadingExclusive } = trpc.webinars.list.useQuery({ type: "exclusive" });
  const { data: evergreenWebinars, isLoading: loadingEvergreen } = trpc.webinars.list.useQuery({ type: "evergreen" });
  const { data: recordings, isLoading: loadingRecordings } = trpc.webinars.list.useQuery({ type: "recording" });

  // All 8 evergreen cards share the same countdown — next :00 or :30 boundary
  const sharedNextSession = nextHalfHour();

  const cfg = SECTION_CONFIG[activeSection];

  return (
    <PortalLayout title="Webinars">
      <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #001B28 0%, #0d1f35 100%)",
            border: "1px solid rgba(0,169,226,0.2)",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,169,226,0.2)" }}>
              <Video size={24} style={{ color: "#00A9E2" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-1">WAVV Webinars</h1>
              <p className="text-gray-400 text-sm">
                Join exclusive live sessions, drop into evergreen workshops, or watch on-demand recordings from the WAVV team.
              </p>
            </div>
          </div>
        </div>

        {/* ── Section tab bar ── */}
        <div className="flex gap-2 flex-wrap">
          {(SECTION_ORDER.map(key => [key, SECTION_CONFIG[key]] as [WebinarSection, typeof cfg])).map(([key, c]) => {
            const isActive = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: isActive ? `${c.accent}22` : "#1a1a1a",
                  color: isActive ? c.accent : "#6b7280",
                  border: `1px solid ${isActive ? c.accent : "#2a2a2a"}`,
                }}
              >
                {c.icon}
                {c.label}
              </button>
            );
          })}
        </div>

        {/* ── Section description ── */}
        <div className="flex items-center gap-2">
          <span style={{ color: cfg.accent }}>{cfg.icon}</span>
          <p className="text-sm text-gray-400">{cfg.description}</p>
        </div>

        {/* ── Section content ── */}
        {activeSection === "exclusive" && (
          loadingExclusive ? <SectionSkeleton /> :
          exclusiveWebinars && exclusiveWebinars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exclusiveWebinars.map((w) => (
                <WebinarCard key={w.id} webinar={w} variant="exclusive" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl text-center" style={{ background: "#111", border: "1px dashed #2a2a2a" }}>
              <Star size={32} className="text-gray-700 mb-3" />
              <p className="text-gray-400 text-sm font-medium">No exclusive webinars scheduled right now.</p>
              <p className="text-gray-600 text-xs mt-1">New sessions are added regularly — check back soon.</p>
            </div>
          )
        )}

        {activeSection === "evergreen" && (
          loadingEvergreen ? <SectionSkeleton /> :
          (evergreenWebinars ?? []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(evergreenWebinars ?? []).map((w) => (
                <WebinarCard key={w.id} webinar={w} variant="evergreen" nextSession={sharedNextSession} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl text-center" style={{ background: "#111", border: "1px dashed #2a2a2a" }}>
              <RefreshCw size={32} className="text-gray-700 mb-3" />
              <p className="text-gray-400 text-sm font-medium">No evergreen webinars available yet.</p>
            </div>
          )
        )}

        {activeSection === "recording" && (
          loadingRecordings ? <SectionSkeleton /> :
          recordings && recordings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recordings.map((w) => (
                <WebinarCard key={w.id} webinar={w} variant="recording" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl text-center" style={{ background: "#111", border: "1px dashed #2a2a2a" }}>
              <PlayCircle size={32} className="text-gray-700 mb-3" />
              <p className="text-gray-400 text-sm font-medium">No recordings available yet.</p>
              <p className="text-gray-600 text-xs mt-1">Past webinar recordings will appear here after each session.</p>
            </div>
          )
        )}

      </div>
    </PortalLayout>
  );
}
