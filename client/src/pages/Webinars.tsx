import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Video, Calendar, Clock, ExternalLink, PlayCircle, Users, Star, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function Webinars() {
  const { data: exclusiveWebinars, isLoading: loadingExclusive } = trpc.webinars.list.useQuery({ type: "exclusive" });
  const { data: evergreenWebinars, isLoading: loadingEvergreen } = trpc.webinars.list.useQuery({ type: "evergreen" });
  const { data: recordings, isLoading: loadingRecordings } = trpc.webinars.list.useQuery({ type: "recording" });
  const { data: myRegistrations } = trpc.webinars.getMyRegistrations.useQuery();

  const registerMutation = trpc.webinars.register.useMutation({
    onSuccess: (res) => {
      if (res.alreadyRegistered) toast.info("You're already registered for this webinar.");
      else toast.success("Registered! Check your email for details.");
    },
  });
  const watchMutation = trpc.webinars.watch.useMutation();

  const registeredIds = new Set((myRegistrations ?? []).map((r) => r.webinarId));

  const formatDate = (d: Date | null | undefined) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const formatTime = (d: Date | null | undefined) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  };

  function WebinarCard({
    webinar,
    variant,
  }: {
    webinar: NonNullable<typeof exclusiveWebinars>[0];
    variant: "exclusive" | "evergreen" | "recording";
  }) {
    const isRegistered = registeredIds.has(webinar.id);

    const accentColor =
      variant === "exclusive" ? "#f59e0b" : variant === "evergreen" ? "#0074F4" : "#00A9E2";
    const badgeLabel =
      variant === "exclusive" ? "Exclusive" : variant === "evergreen" ? "Evergreen" : "Recording";
    const badgeBg =
      variant === "exclusive"
        ? "rgba(245,158,11,0.9)"
        : variant === "evergreen"
        ? "rgba(0,116,244,0.9)"
        : "rgba(103,199,40,0.9)";

    return (
      <div
        className="flex flex-col rounded-xl overflow-hidden transition-all"
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
        {/* Thumbnail */}
        <div
          className="relative flex items-center justify-center"
          style={{
            height: "130px",
            background: webinar.thumbnailUrl
              ? `url(${webinar.thumbnailUrl}) center/cover`
              : `linear-gradient(135deg, #0d1117, #1a1a2e)`,
          }}
        >
          {!webinar.thumbnailUrl && <Video size={36} className="text-gray-700" />}
          <div
            className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
            style={{ background: badgeBg }}
          >
            {badgeLabel}
          </div>
          {webinar.viewCount ? (
            <div
              className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: "rgba(0,0,0,0.6)", color: "#9ca3af" }}
            >
              <Users size={10} />
              {webinar.viewCount}
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-white font-semibold text-sm mb-1 leading-snug">{webinar.title}</h3>
          {webinar.description && (
            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">{webinar.description}</p>
          )}
          {webinar.host && (
            <p className="text-gray-500 text-xs mb-2">
              Hosted by: <span className="text-gray-300">{webinar.host}</span>
            </p>
          )}
          {webinar.scheduledAt && variant !== "recording" && (
            <div className="space-y-1 mb-3">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Calendar size={11} style={{ color: accentColor }} />
                {formatDate(webinar.scheduledAt)}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Clock size={11} style={{ color: accentColor }} />
                {formatTime(webinar.scheduledAt)}
              </p>
            </div>
          )}

          <div className="mt-auto flex gap-2">
            {variant === "recording" ? (
              webinar.videoUrl ? (
                <a
                  href={webinar.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => watchMutation.mutate({ webinarId: webinar.id })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: isRegistered ? "rgba(103,199,40,0.15)" : `${accentColor}22`,
                  color: isRegistered ? "#67C728" : accentColor,
                  border: `1px solid ${isRegistered ? "#67C72840" : `${accentColor}40`}`,
                }}
              >
                <ExternalLink size={12} />
                {isRegistered ? "Registered ✓" : "Register Now"}
              </a>
            ) : (
              <button
                onClick={() => registerMutation.mutate({ webinarId: webinar.id })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: isRegistered ? "rgba(103,199,40,0.15)" : `${accentColor}22`,
                  color: isRegistered ? "#67C728" : accentColor,
                  border: `1px solid ${isRegistered ? "#67C72840" : `${accentColor}40`}`,
                }}
              >
                {isRegistered ? "Registered ✓" : "Register"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  function SectionSkeleton() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: "#1a1a1a" }} />
        ))}
      </div>
    );
  }

  return (
    <PortalLayout title="Webinars">
      <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #001B28 0%, #0d1f35 100%)",
            border: "1px solid rgba(0, 169, 226, 0.2)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0, 169, 226, 0.2)" }}
            >
              <Video size={24} style={{ color: "#00A9E2" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-1">WAVV Webinars</h1>
              <p className="text-gray-400 text-sm">
                Join exclusive live sessions, register for evergreen workshops, and access on-demand recordings from the WAVV team.
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 1: Upcoming Exclusive ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(245,158,11,0.15)" }}
            >
              <Star size={16} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upcoming Exclusive Webinars</h2>
              <p className="text-xs text-gray-500">Single-topic, focused live sessions — limited availability</p>
            </div>
          </div>

          {loadingExclusive ? (
            <SectionSkeleton />
          ) : exclusiveWebinars && exclusiveWebinars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exclusiveWebinars.map((w) => (
                <WebinarCard key={w.id} webinar={w} variant="exclusive" />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-10 rounded-xl text-center"
              style={{ background: "#111", border: "1px dashed #2a2a2a" }}
            >
              <Star size={28} className="text-gray-700 mb-2" />
              <p className="text-gray-500 text-sm">No exclusive webinars scheduled right now.</p>
              <p className="text-gray-600 text-xs mt-1">Check back soon — new sessions are added regularly.</p>
            </div>
          )}
        </section>

        {/* ── Section 2: Evergreen ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0,116,244,0.15)" }}
            >
              <RefreshCw size={16} style={{ color: "#0074F4" }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Evergreen Webinars</h2>
              <p className="text-xs text-gray-500">Always-available sessions — register anytime and join on your schedule</p>
            </div>
          </div>

          {loadingEvergreen ? (
            <SectionSkeleton />
          ) : evergreenWebinars && evergreenWebinars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {evergreenWebinars.map((w) => (
                <WebinarCard key={w.id} webinar={w} variant="evergreen" />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-10 rounded-xl text-center"
              style={{ background: "#111", border: "1px dashed #2a2a2a" }}
            >
              <RefreshCw size={28} className="text-gray-700 mb-2" />
              <p className="text-gray-500 text-sm">No evergreen webinars available yet.</p>
            </div>
          )}
        </section>

        {/* ── Section 3: On-Demand Recordings ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0,169,226,0.15)" }}
            >
              <PlayCircle size={16} style={{ color: "#00A9E2" }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">On-Demand Recordings</h2>
              <p className="text-xs text-gray-500">Watch past webinars and sessions at your own pace</p>
            </div>
          </div>

          {loadingRecordings ? (
            <SectionSkeleton />
          ) : recordings && recordings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recordings.map((w) => (
                <WebinarCard key={w.id} webinar={w} variant="recording" />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-10 rounded-xl text-center"
              style={{ background: "#111", border: "1px dashed #2a2a2a" }}
            >
              <PlayCircle size={28} className="text-gray-700 mb-2" />
              <p className="text-gray-500 text-sm">No recordings available yet.</p>
              <p className="text-gray-600 text-xs mt-1">Past webinar recordings will appear here after each session.</p>
            </div>
          )}
        </section>
      </div>
    </PortalLayout>
  );
}
