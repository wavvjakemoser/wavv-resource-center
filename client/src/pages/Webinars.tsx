import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Video, Calendar, Clock, ExternalLink, PlayCircle, Users } from "lucide-react";
import { toast } from "sonner";

export default function Webinars() {
  const [tab, setTab] = useState<"upcoming" | "recording">("upcoming");
  const { data: webinars, isLoading } = trpc.webinars.list.useQuery({ type: tab });
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
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (d: Date | null | undefined) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  };

  return (
    <PortalLayout title="Webinars">
      <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-6">
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
              <h1 className="text-xl font-bold text-white mb-1">Webinars</h1>
              <p className="text-gray-400 text-sm">
                Join live sessions or watch on-demand recordings from the WAVV team.
                Register for upcoming webinars or access past recordings anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["upcoming", "recording"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === t ? "rgba(0, 169, 226, 0.15)" : "#1a1a1a",
                color: tab === t ? "#00A9E2" : "#9ca3af",
                border: tab === t ? "1px solid rgba(0, 169, 226, 0.4)" : "1px solid #2a2a2a",
              }}
            >
              {t === "upcoming" ? "Upcoming Live" : "On-Demand Recordings"}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: "#1a1a1a" }} />
            ))}
          </div>
        )}

        {/* Webinar cards */}
        {!isLoading && webinars && webinars.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {webinars.map((webinar) => {
              const isRegistered = registeredIds.has(webinar.id);
              return (
                <div
                  key={webinar.id}
                  className="flex flex-col rounded-xl overflow-hidden transition-all"
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#00A9E2";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 169, 226, 0.1)";
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
                      height: "140px",
                      background: webinar.thumbnailUrl
                        ? `url(${webinar.thumbnailUrl}) center/cover`
                        : "linear-gradient(135deg, #001B28, #0d1f35)",
                    }}
                  >
                    {!webinar.thumbnailUrl && (
                      <Video size={40} className="text-gray-700" />
                    )}
                    <div
                      className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: tab === "upcoming" ? "rgba(0, 116, 244, 0.9)" : "rgba(103, 199, 40, 0.9)",
                        color: "white",
                      }}
                    >
                      {tab === "upcoming" ? "Live" : "Recording"}
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
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                        {webinar.description}
                      </p>
                    )}

                    {webinar.host && (
                      <p className="text-gray-500 text-xs mb-2">Hosted by: <span className="text-gray-300">{webinar.host}</span></p>
                    )}

                    {webinar.scheduledAt && tab === "upcoming" && (
                      <div className="space-y-1 mb-3">
                        <p className="text-xs text-gray-400 flex items-center gap-1.5">
                          <Calendar size={11} style={{ color: "#00A9E2" }} />
                          {formatDate(webinar.scheduledAt)}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5">
                          <Clock size={11} style={{ color: "#00A9E2" }} />
                          {formatTime(webinar.scheduledAt)}
                        </p>
                      </div>
                    )}

                    <div className="mt-auto flex gap-2">
                      {tab === "upcoming" ? (
                        webinar.registrationUrl ? (
                          <a
                            href={webinar.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => registerMutation.mutate({ webinarId: webinar.id })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{
                              background: isRegistered ? "rgba(103, 199, 40, 0.15)" : "rgba(0, 116, 244, 0.15)",
                              color: isRegistered ? "#67C728" : "#0074F4",
                              border: `1px solid ${isRegistered ? "#67C72840" : "#0074F440"}`,
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
                              background: isRegistered ? "rgba(103, 199, 40, 0.15)" : "rgba(0, 116, 244, 0.15)",
                              color: isRegistered ? "#67C728" : "#0074F4",
                              border: `1px solid ${isRegistered ? "#67C72840" : "#0074F440"}`,
                            }}
                          >
                            {isRegistered ? "Registered ✓" : "Register"}
                          </button>
                        )
                      ) : webinar.videoUrl ? (
                        <a
                          href={webinar.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => watchMutation.mutate({ webinarId: webinar.id })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: "rgba(0, 169, 226, 0.15)",
                            color: "#00A9E2",
                            border: "1px solid rgba(0, 169, 226, 0.3)",
                          }}
                        >
                          <PlayCircle size={12} />
                          Watch Recording
                        </a>
                      ) : (
                        <span className="text-xs text-gray-600">Recording coming soon</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!webinars || webinars.length === 0) && (
          <div className="text-center py-16">
            <Video size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">
              {tab === "upcoming" ? "No upcoming webinars" : "No recordings yet"}
            </h3>
            <p className="text-gray-500 text-sm">
              {tab === "upcoming"
                ? "Check back soon for upcoming live sessions."
                : "Past webinar recordings will appear here."}
            </p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
