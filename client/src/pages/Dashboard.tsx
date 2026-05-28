import { trpc } from "@/lib/trpc";
import {
  GraduationCap,
  Video,
  FileText,
  Headphones,
  FlaskConical,
  Star,
  ChevronRight,
  Calendar,
  Clock,
  ExternalLink,
  Sparkles,
  Play,
  BookOpen,
} from "lucide-react";
import { Link } from "wouter";
import PortalLayout from "@/components/PortalLayout";

// ─── Quick-access tiles ───────────────────────────────────────────────────────
const NAV_TILES = [
  { href: "/academy",  label: "WAVV Academy",       icon: GraduationCap, color: "#0074F4" },
  { href: "/webinars", label: "WAVV Webinars",       icon: Video,         color: "#00A9E2" },
  { href: "/guides",   label: "WAVV Guides & Docs",  icon: FileText,      color: "#67C728" },
  { href: "/hands-on", label: "WAVV Playground",     icon: FlaskConical,  color: "#a855f7" },
  { href: "/support",  label: "WAVV Support",        icon: Headphones,    color: "#FF9900" },
];

// ─── Category color map ───────────────────────────────────────────────────────
const CATEGORY_COLOR: Record<string, string> = {
  "Onboarding":                 "#0074F4",
  "How-To":                     "#00A9E2",
  "Strategy and Best Practices":"#67C728",
  "Dialer Setup":               "#f97316",
  "CRM Integrations":           "#F5A623",
  "Spam Protection":            "#FF9900",
};

export default function Dashboard() {
  const { data: exclusiveWebinars } = trpc.webinars.list.useQuery({ type: "exclusive" });
  const { data: recentLessons, isLoading: lessonsLoading } = trpc.academy.getRecentLessons.useQuery({ limit: 6 });
  const trackRegClick = trpc.webinars.trackRegistrationClick.useMutation();

  const exclusive = (exclusiveWebinars ?? [])
    .filter((w) => !w.scheduledAt || new Date(w.scheduledAt) >= new Date())
    .slice(0, 3);

  const ACCENT = "#D4AF37";
  const THUMB  = "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-thumb-exclusive-v2-gGXX6nYRkYWDJDcBByZ8iX.webp";

  return (
    <PortalLayout title="Home">
      <div className="px-4 lg:px-6 py-6 max-w-6xl mx-auto space-y-10">

        {/* ── Hero banner ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #001020 0%, #001B38 40%, #001a10 100%)",
            border: "1px solid rgba(0, 116, 244, 0.25)",
          }}
        >
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none opacity-[0.08]"
            style={{ background: "radial-gradient(circle, #0074F4, transparent)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full pointer-events-none opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #67C728, transparent)", transform: "translateY(40%)" }} />

          <div className="relative z-10 p-6 lg:p-10 text-center">
            {/* Powered by badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-xs font-semibold"
              style={{ background: "rgba(0,116,244,0.12)", color: "#60a5fa", border: "1px solid rgba(0,116,244,0.25)" }}>
              <Sparkles size={11} />
              Powered by WAVV AI
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 leading-tight">
              <span style={{ color: "#0074F4" }}>WAVV</span>{" "}
              <span style={{ color: "#00A9E2" }}>Success</span>{" "}
              <span style={{ color: "#67C728" }}>Center</span>
            </h1>
            <p className="text-gray-400 text-base max-w-xl mx-auto mb-8">
              Training, webinars, and dedicated support — everything you need to get the most out of WAVV, all in one place.
            </p>

            {/* Quick-access tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-3xl mx-auto">
              {NAV_TILES.map((tile) => {
                const Icon = tile.icon;
                return (
                  <Link
                    key={tile.href}
                    href={tile.href}
                    className="group flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${tile.color}12`;
                      e.currentTarget.style.borderColor = `${tile.color}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${tile.color}20` }}>
                      <Icon size={15} style={{ color: tile.color }} />
                    </div>
                    <p className="text-white text-xs font-semibold leading-snug flex-1 text-left">{tile.label}</p>
                    <ChevronRight size={12} className="text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Exclusive Live Webinars (conditional) ── */}
        {exclusive.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star size={14} style={{ color: ACCENT }} />
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Exclusive Live Webinars</h2>
              </div>
              <Link href="/webinars" className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1" style={{ textDecoration: "none" }}>
                View all <ChevronRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exclusive.map((w) => (
                <div
                  key={w.id}
                  className="group flex flex-col rounded-xl overflow-hidden transition-all duration-200 cursor-pointer"
                  style={{ background: "#1d2230", border: "1px solid #252d3d" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 4px 20px ${ACCENT}22`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#252d3d"; e.currentTarget.style.boxShadow = "none"; }}
                  onClick={() => { window.location.href = "/webinars"; }}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "130px", borderBottom: `1px solid ${ACCENT}30` }}>
                    <img src={THUMB} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}50` }}>EXCLUSIVE</span>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-sm leading-snug mb-2">{w.title}</h3>
                    {w.description && (
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-2">{w.description}</p>
                    )}
                    {w.host && (
                      <p className="text-gray-500 text-xs mb-2">Host: <span className="text-gray-300">{w.host}</span></p>
                    )}
                    {w.scheduledAt && (
                      <div className="space-y-0.5 mb-3">
                        <p className="text-xs text-gray-400 flex items-center gap-1.5">
                          <Calendar size={11} style={{ color: ACCENT }} />
                          {new Date(w.scheduledAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5">
                          <Clock size={11} style={{ color: ACCENT }} />
                          {new Date(w.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
                        </p>
                      </div>
                    )}
                    <div className="mt-auto">
                      {w.registrationUrl ? (
                        <a
                          href={w.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => { e.stopPropagation(); trackRegClick.mutate({ webinarId: w.id }); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                          style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
                        >
                          <ExternalLink size={12} /> Register Now →
                        </a>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
                        >
                          <Star size={12} /> View Details →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recently Added ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen size={14} style={{ color: "#0074F4" }} />
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recently Added</h2>
            </div>
            <Link href="/academy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1" style={{ textDecoration: "none" }}>
              Browse all <ChevronRight size={12} />
            </Link>
          </div>

          {lessonsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: "#141414", border: "1px solid #222" }} />
              ))}
            </div>
          )}

          {!lessonsLoading && recentLessons && recentLessons.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentLessons.map((lesson) => {
                const color = CATEGORY_COLOR[lesson.category] ?? "#0074F4";
                return (
                  <Link
                    key={lesson.id}
                    href={`/academy/${lesson.courseId}/lesson/${lesson.id}`}
                    className="group flex items-start gap-3 p-4 rounded-xl transition-all"
                    style={{ background: "#141414", border: "1px solid #222", textDecoration: "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 16px ${color}18`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${color}18` }}>
                      <Play size={14} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold leading-snug line-clamp-2 mb-1">{lesson.title}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: `${color}12`, color }}>
                          {lesson.category}
                        </span>
                        {lesson.durationMinutes && (
                          <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                            <Clock size={9} /> {lesson.durationMinutes}m
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!lessonsLoading && (!recentLessons || recentLessons.length === 0) && (
            <div className="flex items-center justify-center py-10 rounded-xl text-gray-600 text-xs"
              style={{ background: "#111", border: "1px solid #1e1e1e" }}>
              No content yet — check back soon.
            </div>
          )}
        </div>

      </div>
    </PortalLayout>
  );
}
