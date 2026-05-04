import { useRef, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import {
  User,
  Camera,
  Activity,
  BookOpen,
  Video,
  FileText,
  LifeBuoy,
  Search,
  Award,
  Clock,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Download,
} from "lucide-react";
import { toast } from "sonner";

// ─── Event type display map ───────────────────────────────────────────────────
const EVENT_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  lesson_completed:   { label: "Completed a lesson",        icon: CheckCircle2, color: "#4ade80" },
  webinar_registered: { label: "Registered for a webinar",  icon: Video,        color: "#60a5fa" },
  webinar_watched:    { label: "Watched a webinar",          icon: Video,        color: "#60a5fa" },
  guide_downloaded:   { label: "Downloaded a guide",         icon: Download,     color: "#a78bfa" },
  ticket_submitted:   { label: "Submitted a support ticket", icon: LifeBuoy,     color: "#fb923c" },
  ai_chat:            { label: "Used WAVV AI",               icon: MessageSquare,color: "#f472b6" },
  search:             { label: "Searched content",           icon: Search,       color: "#94a3b8" },
  login:              { label: "Signed in",                  icon: User,         color: "#64748b" },
  page_view:          { label: "Visited a page",             icon: BookOpen,     color: "#475569" },
};

function getEventMeta(eventType: string) {
  return EVENT_META[eventType] ?? { label: eventType, icon: Activity, color: "#64748b" };
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelative(d: Date | string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

// ─── Avatar upload component ─────────────────────────────────────────────────
function AvatarSection({
  avatarUrl,
  name,
  onUpload,
  uploading,
}: {
  avatarUrl: string | null;
  name: string | null;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const initials = (name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative group w-24 h-24 flex-shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name ?? "Avatar"}
          className="w-24 h-24 rounded-full object-cover"
          style={{ border: "2px solid #2a2a2a" }}
        />
      ) : (
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{ background: "linear-gradient(135deg, #0074F4, #67C728)", color: "#fff" }}
        >
          {initials}
        </div>
      )}
      <button
        className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        title="Upload photo"
      >
        {uploading ? (
          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <Camera size={20} className="text-white" />
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Main Profile page ────────────────────────────────────────────────────────
export default function Profile() {
  const utils = trpc.useUtils();

  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery();
  const { data: activity, isLoading: activityLoading } = trpc.profile.getActivity.useQuery({ limit: 50 });
  const { data: trophies } = trpc.trophy.get.useQuery();

  const uploadAvatar = trpc.profile.uploadAvatar.useMutation({
    onSuccess: () => {
      utils.profile.get.invalidate();
      utils.auth.me.invalidate();
      toast.success("Profile photo updated");
    },
    onError: () => toast.error("Upload failed"),
  });

  const [uploading, setUploading] = useState(false);

  async function handleAvatarUpload(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image too large (max 4 MB)");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      await uploadAvatar.mutateAsync({ base64, mimeType: file.type });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  // Compute activity stats
  const completedLessons = activity?.filter((a) => a.eventType === "lesson_completed").length ?? 0;
  const watchedWebinars = activity?.filter((a) => a.eventType === "webinar_watched").length ?? 0;
  const downloadedGuides = activity?.filter((a) => a.eventType === "guide_downloaded").length ?? 0;
  const earnedBadges = trophies?.badges.filter((b) => b.earned).length ?? 0;

  // Filter out noisy page_view events for the activity feed
  const feedEvents = (activity ?? []).filter((a) => a.eventType !== "page_view");

  return (
    <PortalLayout title="Profile">
      <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto space-y-8">

        {/* ── Profile card ── */}
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          style={{ background: "#111", border: "1px solid #222" }}
        >
          {profileLoading ? (
            <div className="w-24 h-24 rounded-full animate-pulse" style={{ background: "#1a1a1a" }} />
          ) : (
            <AvatarSection
              avatarUrl={profile?.avatarUrl ?? null}
              name={profile?.name ?? null}
              onUpload={handleAvatarUpload}
              uploading={uploading}
            />
          )}
          <div className="flex-1 min-w-0">
            {profileLoading ? (
              <div className="space-y-2">
                <div className="h-6 w-48 rounded animate-pulse" style={{ background: "#1a1a1a" }} />
                <div className="h-4 w-64 rounded animate-pulse" style={{ background: "#1a1a1a" }} />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white">{profile?.name ?? "User"}</h1>
                <p className="text-gray-400 text-sm mt-0.5">{profile?.email ?? ""}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {profile?.role === "admin" && (
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
                    >
                      Admin
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={12} />
                    Member since {profile?.createdAt ? formatDate(profile.createdAt) : "—"}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock size={12} />
                    Last active {profile?.lastSignedIn ? formatRelative(profile.lastSignedIn) : "—"}
                  </span>
                </div>
              </>
            )}
          </div>
          <p className="text-[11px] text-gray-600 sm:self-end">Click photo to change</p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Lessons Completed", value: completedLessons, icon: CheckCircle2, color: "#4ade80" },
            { label: "Webinars Watched",  value: watchedWebinars,  icon: Video,        color: "#60a5fa" },
            { label: "Guides Downloaded", value: downloadedGuides, icon: FileText,     color: "#a78bfa" },
            { label: "Badges Earned",     value: earnedBadges,     icon: Award,        color: "#fbbf24" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "#111", border: "1px solid #222" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}18` }}
              >
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Activity feed ── */}
        <section id="activity" className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity size={17} style={{ color: "#0074F4" }} />
            <h2 className="text-base font-bold text-white">Your Activity</h2>
          </div>

          {activityLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "#1a1a1a" }} />
              ))}
            </div>
          ) : feedEvents.length === 0 ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: "#111", border: "1px solid #222" }}
            >
              <Activity size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No activity yet. Start exploring WAVV Academy!</p>
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden divide-y"
              style={{ background: "#111", border: "1px solid #222", borderColor: "#222" }}
            >
              {feedEvents.map((event) => {
                const meta = getEventMeta(event.eventType);
                const Icon = meta.icon;
                let detail = "";
                try {
                  if (event.metadata) {
                    const parsed = JSON.parse(event.metadata);
                    detail = parsed.title ?? parsed.query ?? parsed.path ?? "";
                  }
                } catch {}
                return (
                  <div key={event.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${meta.color}18` }}
                    >
                      <Icon size={13} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-300">{meta.label}</span>
                      {detail && (
                        <span className="text-xs text-gray-600 ml-1.5 truncate">— {detail}</span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-600 flex-shrink-0">
                      {formatRelative(event.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Badges ── */}
        {trophies && trophies.badges.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Award size={17} style={{ color: "#fbbf24" }} />
              <h2 className="text-base font-bold text-white">Badges</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {trophies.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{
                    background: badge.earned ? "#111" : "#0d0d0d",
                    border: `1px solid ${badge.earned ? "#2a2a2a" : "#1a1a1a"}`,
                    opacity: badge.earned ? 1 : 0.45,
                  }}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{badge.label}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </PortalLayout>
  );
}
