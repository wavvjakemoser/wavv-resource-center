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
  Search,
  Award,
  Clock,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Download,
  Bookmark,
  BookmarkCheck,
  Trash2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

// ─── Event type display map ───────────────────────────────────────────────────
const EVENT_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  lesson_completed:   { label: "Completed a lesson",        icon: CheckCircle2, color: "#4ade80" },
  webinar_registered: { label: "Registered for a webinar",  icon: Video,        color: "#60a5fa" },
  webinar_watched:    { label: "Watched a webinar",          icon: Video,        color: "#60a5fa" },
  guide_downloaded:   { label: "Downloaded a guide",         icon: Download,     color: "#a78bfa" },
  ai_chat:            { label: "Used AI search",             icon: MessageSquare,color: "#f472b6" },
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

// ─── Sign Out button ─────────────────────────────────────────────────────────
function SignOutButton() {
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });
  return (
    <button
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#f87171",
      }}
    >
      {logout.isPending ? (
        <div className="w-3 h-3 border border-red-400/40 border-t-red-400 rounded-full animate-spin" />
      ) : (
        <LogOut size={12} />
      )}
      Sign Out
    </button>
  );
}

// ─── Main Profile page ────────────────────────────────────────────────────────
export default function Profile() {
  const utils = trpc.useUtils();

  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery();
  const { data: activity, isLoading: activityLoading } = trpc.profile.getActivity.useQuery({ limit: 50 });
  const { data: trophies } = trpc.trophy.get.useQuery();
  const { data: bookmarks = [] } = trpc.bookmarks.getAll.useQuery();
  const removeBookmark = trpc.bookmarks.remove.useMutation({
    onSuccess: () => utils.bookmarks.getAll.invalidate(),
  });

  // Site settings — control Bookmarks and Badges visibility for all users
  const { data: siteSettings = {} } = trpc.siteSettings.getAll.useQuery();
  const bookmarksEnabled = (siteSettings as Record<string, unknown>)["bookmarks_enabled"] !== false;
  const badgesEnabled = (siteSettings as Record<string, unknown>)["badges_enabled"] !== false;

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
            <div className="w-24 h-24 rounded-full animate-pulse" style={{ background: "#1d2230" }} />
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
                <div className="h-6 w-48 rounded animate-pulse" style={{ background: "#1d2230" }} />
                <div className="h-4 w-64 rounded animate-pulse" style={{ background: "#1d2230" }} />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white">{profile?.name ?? "User"}</h1>
                <p className="text-gray-400 text-sm mt-0.5">{profile?.email ?? ""}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {profile?.role === "viewer" && (
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
          <div className="flex flex-col items-end gap-2 sm:self-end">
            <p className="text-[11px] text-gray-600">Click photo to change</p>
            <SignOutButton />
          </div>
        </div>

        {/* ── Bookmarks ── */}
        {bookmarksEnabled && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Bookmark size={17} style={{ color: "#fbbf24" }} />
              <h2 className="text-base font-bold text-white">Bookmarks</h2>
            </div>
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: "#111", border: "1px solid #1a1a1a" }}
            >
              <Bookmark size={28} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">Coming Soon</p>
              <p className="text-gray-600 text-xs mt-1">Bookmarks will be available in a future update.</p>
            </div>
          </section>
        )}

        {/* ── Badges ── */}
        {badgesEnabled && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Award size={17} style={{ color: "#00A9E2" }} />
              <h2 className="text-base font-bold text-white">Badges</h2>
            </div>
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: "#111", border: "1px solid #1a1a1a" }}
            >
              <Award size={28} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">Coming Soon</p>
              <p className="text-gray-600 text-xs mt-1">Badges will be available in a future update.</p>
            </div>
          </section>
        )}

      </div>
    </PortalLayout>
  );
}
