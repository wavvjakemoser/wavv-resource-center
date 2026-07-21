import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { PlayCircle, Star, Gem } from "lucide-react";
import { ContentRequestCTA } from "./Academy";

// ─── Color constants (WAVV brand) ────────────────────────────────────────────
const ONDEMAND_COLOR = "#0074F4";
const LIVE_COLOR     = "#00A9E2";
const EXCLUSIVE_COLOR = "#67C728";

// ─── Category tile definitions ───────────────────────────────────────────────
const WEBINAR_CATEGORIES = [
  {
    key: "evergreen",
    visKey: "evergreen",
    label: "WAVV On-Demand Series",
    subtitle: "Available anytime — structured multi-part webinar series you can watch at your own pace.",
    color: ONDEMAND_COLOR,
    icon: PlayCircle,
    href: "/webinars/on-demand",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/final-webinar-play-8gDXhCmGaLNJnXjKNWGnRZ.webp",
  },
  {
    key: "exclusive",
    visKey: "exclusive",
    label: "WAVV Live Exclusive Webinars",
    subtitle: "Single-topic, focused live sessions with the WAVV team — register to attend.",
    color: LIVE_COLOR,
    icon: Star,
    href: "/webinars/live-exclusive",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/final-webinar-spotlight-fxVVPVUKPNq2ij1qRcKTXj.webp",
  },
  {
    key: "recording",
    visKey: "recordings",
    label: "WAVV Exclusive On-Demand Webinars",
    subtitle: "Watch past exclusive webinars and sessions — premium replays available on demand.",
    color: EXCLUSIVE_COLOR,
    icon: Gem,
    href: "/webinars/exclusive-on-demand",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/final-webinar-filmreel-Ls9D5rBMA8HxMhoLYPVHDb.webp",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Webinars() {
  // Fetch counts for badges
  const { data: evergreenWebinars } = trpc.webinars.list.useQuery({ type: "evergreen" });
  const { data: exclusiveWebinars } = trpc.webinars.list.useQuery({ type: "exclusive" });
  const { data: recordingWebinars } = trpc.webinars.list.useQuery({ type: "recording" });

  const { data: visibilityRaw } = trpc.siteSettings.get.useQuery({ key: "webinar_sections_visibility" });
  const visibility: Record<string, boolean> = (visibilityRaw as Record<string, boolean> | null) ?? { evergreen: true, exclusive: true, recordings: true };

  const categoryCounts: Record<string, number> = {
    evergreen: (evergreenWebinars ?? []).length,
    exclusive: (exclusiveWebinars ?? []).length,
    recording: (recordingWebinars ?? []).length,
  };

  return (
    <PortalLayout title="Webinars">
      <div className="px-4 lg:px-8 py-6 space-y-8">
        {/* Spacer for consistent vertical alignment */}
        <div style={{ minHeight: "32px" }} />

        {/* Hero */}
        <div className="px-4 sm:px-6 lg:px-16 py-8 sm:py-12 text-center flex flex-col items-center justify-center" style={{ minHeight: "220px" }}>
          <h1 className="font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}>
            <span style={{ background: "linear-gradient(135deg, #ffffff 0%, #bae6fd 30%, #7dd3fc 60%, #67C728 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              WAVV Webinars
            </span>
          </h1>

          {/* Accent line */}
          <div className="flex justify-center mb-5">
            <div style={{ width: "200px", height: "3px", borderRadius: "2px", background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)" }} />
          </div>

          {/* Subline */}
          <p className="mx-auto leading-relaxed" style={{ color: "#ffffff", fontSize: "clamp(0.88rem, 1.6vw, 1rem)", maxWidth: "560px" }}>
            Join exclusive live sessions and on-demand content from the WAVV team. Learn best practices, see new features in action, and sharpen your outbound strategy.
          </p>
        </div>

        {/* ── 3 Category Tiles (navigational — same as Academy/Resource Hub) ── */}
        <div className="space-y-5">
          {WEBINAR_CATEGORIES.map(cat => (
            visibility[cat.visKey] !== false && (
              <Link
                key={cat.key}
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl block cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                style={{
                  textDecoration: "none",
                  border: `1px solid ${cat.color}60`,
                  height: "260px",
                  boxShadow: `0 0 0 1px ${cat.color}20, 0 4px 32px ${cat.color}18`,
                }}
              >
                {/* Deep space black base */}
                <div className="absolute inset-0" style={{ background: "#000" }} />

                {/* Circuit board SVG pattern */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id={`circuit-wb-${cat.key}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={cat.color} strokeWidth="0.8" fill="none"/>
                      <circle cx="10" cy="10" r="2" fill={cat.color}/>
                      <circle cx="50" cy="10" r="2" fill={cat.color}/>
                      <circle cx="50" cy="50" r="2" fill={cat.color}/>
                      <circle cx="30" cy="30" r="1.5" fill={cat.color}/>
                      <path d="M0 30 L10 30 M60 50 L50 50" stroke={cat.color} strokeWidth="0.6" fill="none"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#circuit-wb-${cat.key})`}/>
                </svg>

                {/* Full-width radial color glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 120% 100% at 70% 50%, ${cat.color}28 0%, ${cat.color}10 45%, transparent 75%)` }}
                />

                {/* Secondary glow — left edge */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 60% 80% at 15% 50%, ${cat.color}12 0%, transparent 60%)` }}
                />

                {/* Neon scan line */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `linear-gradient(180deg, ${cat.color}06 0%, ${cat.color}12 50%, ${cat.color}06 100%)` }}
                />

                {/* Top edge neon line */}
                <div
                  className="absolute top-0 left-0 right-0 pointer-events-none"
                  style={{ height: "1px", background: `linear-gradient(to right, transparent 0%, ${cat.color}60 30%, ${cat.color}90 60%, transparent 100%)` }}
                />

                {/* Full-bleed thumbnail */}
                <img src={cat.thumbnail} alt="" loading="eager" fetchPriority="high" className="hidden" />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${cat.thumbnail})`,
                    backgroundSize: "100% auto",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center center",
                    opacity: 0.85,
                  }}
                />

                {/* Dark gradient overlay — left side for text legibility */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)" }}
                />

                {/* Hover neon border pulse */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `inset 0 0 0 1px ${cat.color}80, 0 0 24px ${cat.color}30` }}
                />

                {/* Content overlay */}
                <div className="relative flex flex-col justify-center h-full px-8 py-6 gap-1">
                  <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: cat.color }}>
                    WAVV Webinars
                  </p>
                  <h2 className="text-4xl font-extrabold text-white leading-tight mb-1">
                    {cat.label}
                  </h2>
                  <p className="text-base text-white mb-3">{cat.subtitle}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold px-3 py-1 rounded-full"
                      style={{ background: `${cat.color}35`, color: cat.color, border: `1px solid ${cat.color}` }}
                    >
                      {categoryCounts[cat.key] ?? 0} {(categoryCounts[cat.key] ?? 0) === 1 ? "webinar" : "webinars"}
                    </span>
                  </div>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Request a Webinar */}
      <div className="px-4 lg:px-8 pb-10">
        <ContentRequestCTA requestType="webinar" accentColor="#ffffff" />
      </div>
    </PortalLayout>
  );
}
