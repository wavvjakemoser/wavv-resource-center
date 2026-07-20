import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  GraduationCap,
  Video,
  FileText,
  FlaskConical,
  Star,
  Calendar,
  Clock,
  ExternalLink,
  ArrowRight,
  BookOpen,
  Send,
  CheckCircle2,
  X,
  Bell,
  PhoneCall,
  BarChart3,
  Users,
  Rocket,
  Chrome,
  Globe,
} from "lucide-react";
import { Link } from "wouter";
import PortalLayout from "@/components/PortalLayout";
import { useAuth } from "@/_core/hooks/useAuth";

const ACCENT = "#D4AF37";
const THUMB = "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-thumb-exclusive-v2-gGXX6nYRkYWDJDcBByZ8iX.webp";

// ─── What is WAVV pillars ─────────────────────────────────────────────────────
const WAVV_PILLARS = [
  {
    icon: PhoneCall,
    color: "#0074F4",
    title: "Power Dialing, Built In",
    body: "WAVV is a native multi-line power dialer that lives inside your CRM. No tab-switching, no copy-pasting — just faster, smarter outreach from the tools you already use.",
  },
  {
    icon: BarChart3,
    color: "#00A9E2",
    title: "More Connections, Less Wasted Time",
    body: "Dial multiple lines simultaneously, skip voicemails automatically, and let WAVV's call boards keep your team focused on the contacts most likely to answer.",
  },
  {
    icon: Users,
    color: "#67C728",
    title: "Built for Anyone Making Outbound Calls",
    body: "Whether you're onboarding new reps or running a high-volume outreach campaign, WAVV gives your team the speed and visibility to hit their numbers every day.",
  },
];

// ─── Resource section cards ──────────────────────────────────────────────────
const RESOURCE_CARDS = [
  {
    id: "academy",
    href: "/academy",
    navHref: "/academy",
    label: "WAVV Academy",
    icon: GraduationCap,
    color: "#0074F4",
    description: "Step-by-step video courses covering onboarding, how-to guides, and advanced strategy — built to get you productive fast.",
    cta: "Start Learning",
  },
  {
    id: "webinars",
    href: "/webinars",
    navHref: "/webinars",
    label: "WAVV Webinars",
    icon: Video,
    color: "#00A9E2",
    description: "Live and on-demand sessions hosted by the WAVV team. Watch replays, register for upcoming events, and sharpen your skills.",
    cta: "Browse Webinars",
  },
  {
    id: "guides",
    href: "/resourcehub",
    navHref: "/resourcehub",
    label: "WAVV Resource Hub",
    icon: FileText,
    color: "#67C728",
    description: "Help articles, downloadable PDF guides, and FAQs organized by topic — answers to your questions, on demand.",
    cta: "Browse Resources",
  },
];

// ─── Program section cards ───────────────────────────────────────────────────
const PROGRAM_CARDS = [
  {
    id: "accelerator",
    href: "/accelerator",
    navHref: "/accelerator",
    label: "WAVV Accelerator",
    icon: Rocket,
    color: "#0074F4",
    description: "A 6-session sales coaching program with live calls, product training, and community — designed to turn dials into closes.",
    cta: "Learn More",
  },
];

// ─── Accelerator-style banner component ──────────────────────────────────────
function SectionBanner({
  color,
  title,
  description,
  cta,
  href,
  status,
  icon: Icon,
  children,
}: {
  color: string;
  title: string;
  description: string;
  cta: string;
  href: string | null;
  status: "visible" | "coming_soon" | "hidden";
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  children?: React.ReactNode;
}) {
  if (status === "hidden") return null;

  const isComingSoon = status === "coming_soon";
  const patternId = `circuit-hp-${title.replace(/\s/g, "-").toLowerCase()}`;

  const inner = (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-200 ${!isComingSoon ? "hover:scale-[1.003]" : ""}`}
      style={{
        border: `1px solid ${color}${isComingSoon ? "25" : "40"}`,
        minHeight: "130px",
        boxShadow: `0 0 0 1px ${color}${isComingSoon ? "08" : "15"}, 0 4px 24px ${color}${isComingSoon ? "05" : "10"}`,
        opacity: isComingSoon ? 0.7 : 1,
        cursor: isComingSoon ? "default" : "pointer",
      }}
    >
      {/* Black base */}
      <div className="absolute inset-0" style={{ background: "#000" }} />

      {/* Circuit board SVG pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: isComingSoon ? 0.05 : 0.10 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={color} strokeWidth="0.8" fill="none"/>
            <circle cx="10" cy="10" r="2" fill={color}/>
            <circle cx="50" cy="10" r="2" fill={color}/>
            <circle cx="50" cy="50" r="2" fill={color}/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`}/>
      </svg>

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 120% 100% at 80% 50%, ${color}${isComingSoon ? "10" : "20"} 0%, transparent 70%)` }} />

      {/* Top neon line */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: "1px", background: `linear-gradient(to right, transparent 0%, ${color}${isComingSoon ? "30" : "50"} 30%, ${color}${isComingSoon ? "50" : "80"} 60%, transparent 100%)` }} />

      {/* Hover glow (only for live items) */}
      {!isComingSoon && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `inset 0 0 0 1px ${color}60, 0 0 20px ${color}20` }} />
      )}

      {/* Content */}
      <div className="relative flex items-center h-full px-6 py-5 gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}${isComingSoon ? "10" : "20"}` }}>
          <Icon size={20} style={{ color: isComingSoon ? `${color}80` : color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <h3 className="text-base font-bold text-white">{title}</h3>
            {isComingSoon && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase flex-shrink-0"
                style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}
              >
                Coming Soon
              </span>
            )}
          </div>
          <p className="text-sm text-white" style={{ maxWidth: "600px", opacity: isComingSoon ? 0.6 : 1 }}>{description}</p>
          {children}
        </div>
        {!isComingSoon && (
          <span
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
            style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}
          >
            {cta} <ArrowRight size={11} />
          </span>
        )}
      </div>
    </div>
  );

  if (isComingSoon || !href) {
    return <div>{inner}</div>;
  }

  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      {inner}
    </Link>
  );
}

// ─── Playground Interest Modal ────────────────────────────────────────────────
function PlaygroundModal({ onClose }: { onClose: () => void }) {
  const color = "#a855f7";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submit = trpc.playground.submitPublicInterest.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => setError(e.message),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-6"
        style={{
          background: "linear-gradient(145deg, #1a0d2e 0%, #0f1318 100%)",
          border: `1px solid ${color}35`,
          boxShadow: `0 24px 64px ${color}20`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <X size={16} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
              <CheckCircle2 size={28} style={{ color }} />
            </div>
            <div>
              <p className="text-white font-bold text-base mb-1">You're on the list!</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                We'll notify you when WAVV Playground is ready.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}20`, border: `1px solid ${color}35` }}>
                <FlaskConical size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">WAVV Playground</p>
                <p className="text-xs" style={{ color }}>Get notified when it's ready</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
              Be the first to know when WAVV Playground launches. Enter your name and work email below.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              />
              <input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && name.trim() && email.trim()) submit.mutate({ name: name.trim(), email: email.trim() }); }}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                disabled={!name.trim() || !email.trim() || submit.isPending}
                onClick={() => submit.mutate({ name: name.trim(), email: email.trim() })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
                style={{ background: `${color}25`, color, border: `1px solid ${color}50` }}
                onMouseEnter={(e) => { if (!submit.isPending) e.currentTarget.style.background = `${color}40`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `${color}25`; }}
              >
                <Send size={13} />
                {submit.isPending ? "Sending…" : "Notify Me"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? null;
  const { data: exclusiveWebinars } = trpc.webinars.list.useQuery({ type: "exclusive" });
  const { data: allLiveCalls = [] } = trpc.accelerator.listLiveCalls.useQuery({});
  const trackRegClick = trpc.webinars.trackRegistrationClick.useMutation();
  const [showPlaygroundModal, setShowPlaygroundModal] = useState(false);
  const { data: allSettings, isLoading: settingsLoading } = trpc.siteSettings.getAll.useQuery();

  // Nav visibility (sidebar) — boolean
  const navVisibility = (((allSettings ?? {}) as Record<string, unknown>)["nav_visibility"] ?? {}) as Record<string, boolean>;

  // Homepage section status — 3-state: "visible" | "coming_soon" | "hidden"
  const homepageStatus = (((allSettings ?? {}) as Record<string, unknown>)["homepage_section_status"] ?? {}) as Record<string, string>;

  // Helper: get section status. Default to "visible" if not set.
  function getSectionStatus(navHref: string): "visible" | "coming_soon" | "hidden" {
    const status = homepageStatus[navHref];
    if (status === "coming_soon" || status === "hidden") return status;
    // If nav_visibility explicitly hides it, treat as hidden on homepage too
    if (navVisibility[navHref] === false) return "hidden";
    return "visible";
  }

  // Exclusive webinars: only show if scheduled within next 7 days
  const now = useMemo(() => new Date(), []);
  const sevenDaysFromNow = useMemo(() => new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), [now]);
  const exclusive = (exclusiveWebinars ?? [])
    .filter((w) => !w.scheduledAt || (new Date(w.scheduledAt) >= now && new Date(w.scheduledAt) <= sevenDaysFromNow))
    .slice(0, 3);

  // Upcoming accelerator live calls (future only)
  const upcomingLiveCalls = allLiveCalls
    .filter((lc: any) => lc.isVisible && new Date(lc.scheduledAt) > now)
    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  // Combined upcoming events (exclusive webinars + accelerator live calls)
  const upcomingEvents = useMemo(() => {
    const events: Array<{ id: string; type: "webinar" | "accelerator"; title: string; scheduledAt: Date; registrationUrl?: string; description?: string; host?: string; thumbnailUrl?: string }> = [];
    exclusive.forEach((w) => {
      if (w.scheduledAt) {
        events.push({ id: `w-${w.id}`, type: "webinar", title: w.title, scheduledAt: new Date(w.scheduledAt), registrationUrl: w.registrationUrl ?? undefined, description: w.description ?? undefined, host: w.host ?? undefined, thumbnailUrl: w.thumbnailUrl ?? undefined });
      }
    });
    upcomingLiveCalls.forEach((lc: any) => {
      events.push({ id: `lc-${lc.id}`, type: "accelerator", title: lc.title, scheduledAt: new Date(lc.scheduledAt), registrationUrl: lc.registrationUrl ?? undefined, description: lc.description ?? undefined });
    });
    return events.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()).slice(0, 3);
  }, [exclusive, upcomingLiveCalls]);

  // Continue Learning data
  const { data: continueLearning } = trpc.academy.getContinueLearning.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Next accelerator live call for inline display on the program card
  const nextAcceleratorCall = upcomingLiveCalls[0] as any | undefined;

  return (
    <PortalLayout title="Home">
      {showPlaygroundModal && <PlaygroundModal onClose={() => setShowPlaygroundModal(false)} />}

      {/* Full-width content */}
      <div className="px-4 lg:px-8 py-6 space-y-8">

        {/* Spacer for consistent vertical alignment */}
        <div style={{ minHeight: "32px" }} />

        {/* ── Hero ── */}
        <div className="px-4 sm:px-6 lg:px-16 py-8 sm:py-12 text-center flex flex-col items-center justify-center" style={{ minHeight: "220px" }}>
          <h1
            className="font-extrabold tracking-tight leading-[1.05] mb-4"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}
          >
            <span style={{
              background: "linear-gradient(135deg, #ffffff 0%, #c7d9ff 30%, #93c5fd 60%, #67C728 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              WAVV Success Center
            </span>
          </h1>

          {/* Accent line */}
          <div className="flex justify-center mb-5">
            <div style={{ width: "200px", height: "3px", borderRadius: "2px", background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)" }} />
          </div>

          {/* Subline */}
          <p className="mx-auto leading-relaxed" style={{ color: "#ffffff", fontSize: "clamp(0.88rem, 1.6vw, 1rem)", maxWidth: "560px" }}>
            Everything you need to get the most out of WAVV — in one place. Training, tools, and resources to dial smarter, connect more, and close faster.
          </p>
        </div>

        {/* ── What is WAVV ── always visible ── */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-extrabold text-white tracking-wide">What is WAVV?</h2>
            </div>
            <a
              href="https://www.wavv.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
              style={{ color: "#ffffff", textDecoration: "none" }}
            >
              Learn More <ArrowRight size={11} />
            </a>
          </div>
          <div className="space-y-3 mt-4">
            {WAVV_PILLARS.map((p, idx) => {
              const PIcon = p.icon;
              const patternId = `circuit-wavv-${idx}`;
              return (
                <div
                  key={p.title}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-200 hover:scale-[1.003]"
                  style={{
                    border: `1px solid ${p.color}40`,
                    minHeight: "110px",
                    boxShadow: `0 0 0 1px ${p.color}15, 0 4px 24px ${p.color}10`,
                  }}
                >
                  {/* Black base */}
                  <div className="absolute inset-0" style={{ background: "#000" }} />

                  {/* Circuit pattern */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.10 }} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={patternId} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={p.color} strokeWidth="0.8" fill="none"/>
                        <circle cx="10" cy="10" r="2" fill={p.color}/>
                        <circle cx="50" cy="10" r="2" fill={p.color}/>
                        <circle cx="50" cy="50" r="2" fill={p.color}/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${patternId})`}/>
                  </svg>

                  {/* Radial glow */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 120% 100% at 80% 50%, ${p.color}20 0%, transparent 70%)` }} />

                  {/* Top neon line */}
                  <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: "1px", background: `linear-gradient(to right, transparent 0%, ${p.color}50 30%, ${p.color}80 60%, transparent 100%)` }} />

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `inset 0 0 0 1px ${p.color}60, 0 0 20px ${p.color}20` }} />

                  {/* Content */}
                  <div className="relative flex items-center h-full px-6 py-5 gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}20` }}>
                      <PIcon size={20} style={{ color: p.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white mb-1">{p.title}</h3>
                      <p className="text-sm text-white" style={{ maxWidth: "600px" }}>{p.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Continue Learning (shown only when user has activity) ── */}
        {isAuthenticated && continueLearning && (
          (continueLearning.academyCourse && navVisibility["/academy"] !== false) ||
          (continueLearning.webinar && navVisibility["/webinars"] !== false)
        ) && (
          <section>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #0074F4, #67C728)" }} />
              <BookOpen size={14} style={{ color: "#0074F4" }} />
              <h2 className="text-base font-extrabold text-white tracking-wide">Continue Learning</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Academy card */}
              {continueLearning.academyCourse && navVisibility["/academy"] !== false && (
                <Link
                  href={`/academy/${continueLearning.academyCourse.courseId}/lesson/${continueLearning.academyCourse.nextLessonId}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="rounded-xl p-5 transition-all duration-200 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, rgba(0,116,244,0.08) 0%, #0c1018 70%)", border: "1px solid rgba(0,116,244,0.18)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,116,244,0.45)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,116,244,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,116,244,0.18)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,116,244,0.15)" }}>
                        <GraduationCap size={16} style={{ color: "#0074F4" }} />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(0,116,244,0.8)" }}>WAVV Academy</span>
                    </div>
                    <p className="text-white font-bold text-sm mb-1 leading-snug">{continueLearning.academyCourse.courseTitle}</p>
                    <p className="text-xs mb-3" style={{ color: "#ffffff" }}>Up next: {continueLearning.academyCourse.nextLessonTitle}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                        <span>{continueLearning.academyCourse.completedLessons} of {continueLearning.academyCourse.totalLessons} lessons</span>
                        <span>{continueLearning.academyCourse.progressPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${continueLearning.academyCourse.progressPct}%`, background: "linear-gradient(to right, #0074F4, #67C728)" }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#0074F4" }}>
                      Resume lesson <ArrowRight size={11} />
                    </div>
                  </div>
                </Link>
              )}

              {/* Webinar card */}
              {continueLearning.webinar && navVisibility["/webinars"] !== false && (
                <Link href={`/webinars${continueLearning.webinar.id ? `?play=${continueLearning.webinar.id}` : ""}`} style={{ textDecoration: "none" }}>
                  <div
                    className="rounded-xl p-5 transition-all duration-200 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, rgba(0,169,226,0.08) 0%, #0c1018 70%)", border: "1px solid rgba(0,169,226,0.18)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,169,226,0.45)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,169,226,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,169,226,0.18)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,169,226,0.15)" }}>
                        <Video size={16} style={{ color: "#00A9E2" }} />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(0,169,226,0.8)" }}>On-Demand Webinar</span>
                    </div>
                    <p className="text-white font-bold text-sm mb-1 leading-snug">{continueLearning.webinar.title}</p>
                    {continueLearning.webinar.description && (
                      <p className="text-xs mb-3 line-clamp-2" style={{ color: "#ffffff" }}>{continueLearning.webinar.description}</p>
                    )}
                    {continueLearning.webinar.host && (
                      <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Host: <span style={{ color: "rgba(255,255,255,0.65)" }}>{continueLearning.webinar.host}</span></p>
                    )}
                    <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#00A9E2" }}>
                      Watch now <ArrowRight size={11} />
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* ── Resources ── */}
        {!settingsLoading && (
          <section>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #0074F4, #67C728)" }} />
              <BookOpen size={14} style={{ color: "#0074F4" }} />
              <h2 className="text-base font-extrabold text-white tracking-wide">Explore</h2>
            </div>
            <div className="space-y-3">
              {RESOURCE_CARDS.map((card) => (
                <SectionBanner
                  key={card.id}
                  color={card.color}
                  title={card.label}
                  description={card.description}
                  cta={card.cta}
                  href={card.href}
                  status={getSectionStatus(card.navHref)}
                  icon={card.icon}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Programs ── */}
        {!settingsLoading && (
          <section>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #0074F4, #00A9E2)" }} />
              <Rocket size={14} style={{ color: "#0074F4" }} />
              <h2 className="text-base font-extrabold text-white tracking-wide">Programs</h2>
            </div>
            <div className="space-y-3">
              {PROGRAM_CARDS.map((card) => (
                <SectionBanner
                  key={card.id}
                  color={card.color}
                  title={card.label}
                  description={card.description}
                  cta={card.cta}
                  href={card.href}
                  status={getSectionStatus(card.navHref)}
                  icon={card.icon}
                >
                  {/* Show next live call date inline if available */}
                  {card.id === "accelerator" && nextAcceleratorCall && getSectionStatus(card.navHref) === "visible" && (
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar size={12} style={{ color: "#f59e0b" }} />
                      <span className="text-xs font-medium" style={{ color: "#f59e0b" }}>
                        Next live call: {new Date(nextAcceleratorCall.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/Denver" })} at {new Date(nextAcceleratorCall.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Denver", timeZoneName: "short" })}
                      </span>
                    </div>
                  )}
                </SectionBanner>
              ))}
            </div>
          </section>
        )}

        {/* ── Upcoming Live Events (conditional) ── */}
        {upcomingEvents.length > 0 && (
          <section>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom, ${ACCENT}, ${ACCENT}80)` }} />
              <Star size={14} style={{ color: ACCENT }} />
              <h2 className="text-base font-extrabold text-white tracking-wide">Upcoming Live Events</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col rounded-xl overflow-hidden transition-all duration-200"
                  style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 4px 20px ${ACCENT}22`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Thumbnail for webinars */}
                  {event.type === "webinar" && (
                    <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: "120px" }}>
                      <img
                        src={event.thumbnailUrl || THUMB}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ opacity: 0.9 }}
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(15,19,24,0.85))" }} />
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-bold px-2 py-1 rounded-full tracking-wide uppercase" style={{ background: ACCENT, color: "#fff" }}>
                          Exclusive
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Accelerator call header */}
                  {event.type === "accelerator" && (
                    <div className="px-4 pt-4 pb-2">
                      <span className="text-[9px] font-bold px-2 py-1 rounded-full tracking-wide uppercase" style={{ background: "rgba(0,116,244,0.15)", color: "#0074F4", border: "1px solid rgba(0,116,244,0.3)" }}>
                        Accelerator Live Call
                      </span>
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-sm leading-snug mb-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-white text-xs leading-relaxed mb-2 line-clamp-2">{event.description}</p>
                    )}
                    {event.host && (
                      <p className="text-white text-xs mb-2">Host: <span className="text-white">{event.host}</span></p>
                    )}
                    <div className="space-y-0.5 mb-3">
                      <p className="text-xs text-white flex items-center gap-1.5">
                        <Calendar size={11} style={{ color: ACCENT }} />
                        {event.scheduledAt.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/Denver" })}
                      </p>
                      <p className="text-xs text-white flex items-center gap-1.5">
                        <Clock size={11} style={{ color: ACCENT }} />
                        {event.scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Denver", timeZoneName: "short" })}
                      </p>
                    </div>
                    <div className="mt-auto">
                      {event.registrationUrl ? (
                        <a
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => { if (event.type === "webinar") trackRegClick.mutate({ webinarId: parseInt(event.id.replace("w-", "")) }); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                          style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
                        >
                          <ExternalLink size={12} /> Register
                        </a>
                      ) : (
                        <Link
                          href="/accelerator"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                          style={{ background: "rgba(0,116,244,0.15)", color: "#0074F4", border: "1px solid rgba(0,116,244,0.3)", textDecoration: "none" }}
                        >
                          View Details <ArrowRight size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Quick Links ── */}
        <section>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #60a5fa, #0074F4)" }} />
            <ExternalLink size={14} style={{ color: "#60a5fa" }} />
            <h2 className="text-base font-extrabold text-white tracking-wide">Quick Links</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Chrome Extension — primary */}
            <a
              href="https://chromewebstore.google.com/detail/wavv/ioopokcefgfbajhpcmkkbmipeenohhpe"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200"
              style={{ background: "rgba(0,116,244,0.10)", border: "1px solid rgba(0,116,244,0.30)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,116,244,0.18)"; e.currentTarget.style.borderColor = "rgba(0,116,244,0.50)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,116,244,0.10)"; e.currentTarget.style.borderColor = "rgba(0,116,244,0.30)"; }}
            >
              <Chrome size={18} style={{ color: "#0074F4" }} />
              <div>
                <p className="text-sm font-semibold text-white">WAVV Chrome Extension</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Power dial directly from your browser</p>
              </div>
              <ExternalLink size={12} className="ml-2 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
            </a>

            {/* WAVV Website — secondary */}
            <a
              href="https://www.wavv.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}
            >
              <Globe size={18} style={{ color: "#ffffff" }} />
              <div>
                <p className="text-sm font-semibold text-white">WAVV Website</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Visit wavv.com</p>
              </div>
              <ExternalLink size={12} className="ml-2 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
            </a>
          </div>
        </section>

      </div>
    </PortalLayout>
  );
}
