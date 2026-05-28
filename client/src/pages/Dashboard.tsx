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
  Play,
  ArrowRight,
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
  "Onboarding":                  "#0074F4",
  "How-To":                      "#00A9E2",
  "Strategy and Best Practices": "#67C728",
  "Dialer Setup":                "#f97316",
  "CRM Integrations":            "#F5A623",
  "Spam Protection":             "#FF9900",
};

const ACCENT = "#D4AF37";
const THUMB  = "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-thumb-exclusive-v2-gGXX6nYRkYWDJDcBByZ8iX.webp";

export default function Dashboard() {
  const { data: exclusiveWebinars } = trpc.webinars.list.useQuery({ type: "exclusive" });
  const { data: recentLessons, isLoading: lessonsLoading } = trpc.academy.getRecentLessons.useQuery({ limit: 6 });
  const trackRegClick = trpc.webinars.trackRegistrationClick.useMutation();

  const exclusive = (exclusiveWebinars ?? [])
    .filter((w) => !w.scheduledAt || new Date(w.scheduledAt) >= new Date())
    .slice(0, 3);

  return (
    <PortalLayout title="Home">
      <div className="px-4 lg:px-6 py-8 max-w-6xl mx-auto space-y-12">

        {/* ── Hero ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "radial-gradient(ellipse 90% 80% at 50% 0%, rgba(0,116,244,0.22) 0%, rgba(0,169,226,0.10) 45%, transparent 70%), #0a0e18",
            border: "1px solid rgba(0,116,244,0.2)",
            minHeight: "320px",
          }}
        >
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Right glow */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,116,244,0.12), transparent 70%)", transform: "translate(20%, -20%)" }} />
          {/* Left green glow */}
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(103,199,40,0.07), transparent 70%)", transform: "translate(-20%, 20%)" }} />

          <div className="relative z-10 px-6 lg:px-12 py-12 lg:py-16 text-center">
            {/* Headline */}
            <h1
              className="font-extrabold tracking-tight leading-[1.06] mb-4"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}
            >
              <span style={{
                background: "linear-gradient(135deg, #ffffff 0%, #c7d9ff 35%, #93c5fd 65%, #67C728 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                WAVV Success Center
              </span>
            </h1>

            {/* Gradient line */}
            <div className="flex justify-center mb-6">
              <div style={{
                width: "180px",
                height: "3px",
                borderRadius: "2px",
                background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)",
              }} />
            </div>

            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", maxWidth: "480px", margin: "0 auto 2.5rem" }}>
              Training, webinars, and dedicated support — everything you need to get the most out of WAVV.
            </p>

            {/* Quick-access tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-w-3xl mx-auto">
              {NAV_TILES.map((tile) => {
                const Icon = tile.icon;
                return (
                  <Link
                    key={tile.href}
                    href={tile.href}
                    className="group flex flex-col items-center gap-2 px-3 py-4 rounded-xl transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${tile.color}14`;
                      e.currentTarget.style.borderColor = `${tile.color}45`;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${tile.color}22` }}>
                      <Icon size={16} style={{ color: tile.color }} />
                    </div>
                    <p className="text-white text-xs font-semibold leading-snug text-center">{tile.label}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Exclusive Live Webinars (conditional) ── */}
        {exclusive.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom, ${ACCENT}, ${ACCENT}80)` }} />
                <Star size={14} style={{ color: ACCENT }} />
                <h2 className="text-sm font-bold text-white tracking-wide">Exclusive Live Webinars</h2>
              </div>
              <Link href="/webinars" className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exclusive.map((w) => (
                <div
                  key={w.id}
                  className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
                  style={{
                    background: "linear-gradient(160deg, #141824 0%, #0f1318 100%)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${ACCENT}60`;
                    e.currentTarget.style.boxShadow = `0 8px 32px ${ACCENT}18`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  onClick={() => { window.location.href = "/webinars"; }}
                >
                  <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "140px" }}>
                    <img src={THUMB} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(15,19,24,0.8))" }} />
                    <div className="absolute top-3 right-3">
                      <span className="text-[9px] font-bold px-2 py-1 rounded-full tracking-wide"
                        style={{ background: `${ACCENT}25`, color: ACCENT, border: `1px solid ${ACCENT}55` }}>
                        EXCLUSIVE
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-sm leading-snug mb-2">{w.title}</h3>
                    {w.description && (
                      <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>{w.description}</p>
                    )}
                    {w.host && (
                      <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                        Host: <span style={{ color: "rgba(255,255,255,0.65)" }}>{w.host}</span>
                      </p>
                    )}
                    {w.scheduledAt && (
                      <div className="space-y-1 mb-4">
                        <p className="text-xs flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                          <Calendar size={11} style={{ color: ACCENT }} />
                          {new Date(w.scheduledAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        <p className="text-xs flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
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
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                          style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}45` }}
                        >
                          <ExternalLink size={11} /> Register Now
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold"
                          style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}45` }}>
                          <Star size={11} /> View Details
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recently Added ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #0074F4, #00A9E2)" }} />
              <h2 className="text-sm font-bold text-white tracking-wide">Recently Added</h2>
            </div>
            <Link href="/academy" className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
              Browse all <ArrowRight size={12} />
            </Link>
          </div>

          {lessonsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
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
                    className="group flex items-start gap-4 p-5 rounded-2xl transition-all duration-200"
                    style={{
                      background: "linear-gradient(160deg, #141824 0%, #0f1318 100%)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${color}50`;
                      e.currentTarget.style.boxShadow = `0 6px 24px ${color}15`;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Play icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${color}18`, border: `1px solid ${color}25` }}
                    >
                      <Play size={14} style={{ color }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-white transition-colors">
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
                        >
                          {lesson.category}
                        </span>
                        {lesson.durationMinutes && (
                          <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                            <Clock size={9} /> {lesson.durationMinutes}m
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight size={14} className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
                  </Link>
                );
              })}
            </div>
          )}

          {!lessonsLoading && (!recentLessons || recentLessons.length === 0) && (
            <div className="flex items-center justify-center py-12 rounded-2xl text-xs"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)" }}>
              No content yet — check back soon.
            </div>
          )}
        </section>

      </div>
    </PortalLayout>
  );
}
