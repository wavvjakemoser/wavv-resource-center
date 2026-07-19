import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  GraduationCap,
  Video,
  FileText,
  Headphones,
  FlaskConical,
  Star,
  Calendar,
  Clock,
  ExternalLink,
  ArrowRight,
  Sparkles,
  BookOpen,
  MessageCircle,
  Send,
  CheckCircle2,
  X,
  Bell,
  PhoneCall,
  BarChart3,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import PortalLayout from "@/components/PortalLayout";
import { useAuth } from "@/_core/hooks/useAuth";

const ACCENT = "#D4AF37";
const THUMB  = "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-thumb-exclusive-v2-gGXX6nYRkYWDJDcBByZ8iX.webp";

// ─── Start Here card definitions ─────────────────────────────────────────────
const START_HERE_CARDS = [
  {
    id: "academy",
    href: "/academy",
    navHref: "/academy",
    label: "WAVV Academy",
    icon: GraduationCap,
    color: "#0074F4",
    description: "Step-by-step video courses covering onboarding, how-to guides, and advanced strategy — built to get you productive fast.",
    cta: "Start Learning",
    ctaIcon: BookOpen,
    badge: null,
  },
  {
    id: "webinars",
    href: "/webinars",
    label: "WAVV Webinars",
    icon: Video,
    color: "#10b981",
    navHref: "/webinars",
    description: "Live and on-demand sessions hosted by the WAVV team. Watch replays, register for upcoming events, and sharpen your skills.",
    cta: "Browse Webinars",
    ctaIcon: Video,
    badge: null,
  },
  {
    id: "guides",
    href: "/resourcehub",
    navHref: "/resourcehub",
    label: "WAVV Resource Hub",
    icon: FileText,
    color: "#67C728",
    description: "Browse help articles and downloadable PDF guides organized by topic.",
    cta: "Browse Resources",
    ctaIcon: FileText,
    badge: null,
  },
  {
    id: "playground",
    href: null,
    navHref: "/playground",
    label: "WAVV Playground",
    icon: FlaskConical,
    color: "#a855f7",
    description: "Coming soon — a sandbox environment where you can explore WAVV features, test workflows, and build confidence without touching live data. Join the waitlist to be first in.",
    cta: "Get Notified",
    ctaIcon: Bell,
    badge: "Coming Soon",
  },

  {
    id: "partners",
    href: "/partners",
    navHref: "/partners",
    label: "WAVV Partners",
    icon: Users,
    color: "#00A9E2",
    description: "Refer customers to WAVV and earn recurring revenue. The WAVV Partner Program is built for consultants, coaches, and CRM professionals who want to turn their network into a revenue stream.",
    cta: "Learn More",
    ctaIcon: ArrowRight,
    badge: null,
  },
];

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
  const trackRegClick = trpc.webinars.trackRegistrationClick.useMutation();
  const [showPlaygroundModal, setShowPlaygroundModal] = useState(false);
  const { data: allSettings, isLoading: settingsLoading } = trpc.siteSettings.getAll.useQuery();
  const navVisibility = (((allSettings ?? {}) as Record<string, unknown>)["nav_visibility"] ?? {}) as Record<string, boolean>;
  // Filter out cards whose nav item has been explicitly hidden (false). Default (undefined) = visible.
  // While settings are loading, show NO cards to prevent hidden items from flashing.
  const visibleCards = settingsLoading ? [] : START_HERE_CARDS.filter((c) => navVisibility[c.navHref] !== false);

  // Exclusive: only show if scheduled within next 7 days (or no date set = evergreen live)
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const exclusive = (exclusiveWebinars ?? [])
    .filter((w) => !w.scheduledAt || (new Date(w.scheduledAt) >= now && new Date(w.scheduledAt) <= sevenDaysFromNow))
    .slice(0, 3);

  // Continue Learning data
  const { data: continueLearning } = trpc.academy.getContinueLearning.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  return (
    <PortalLayout title="Home">
      {showPlaygroundModal && <PlaygroundModal onClose={() => setShowPlaygroundModal(false)} />}

      {/* Full-width content — no max-width cap on the outer wrapper */}
      <div className="px-4 lg:px-8 py-6 space-y-8">

        {/* Spacer for consistent vertical alignment with pages that have toggle bars */}
        <div style={{ minHeight: "32px" }} />

        {/* ── Hero ── */}
        <div className="px-4 sm:px-6 lg:px-16 py-8 sm:py-12 text-center">
            {/* Headline */}
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

        </div>{/* end hero */}

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
            {WAVV_PILLARS.map((p) => {
              const PIcon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-2xl p-5"
                  style={{
                    background: `linear-gradient(135deg, ${p.color}0d 0%, #0c1018 70%)`,
                    border: `1px solid ${p.color}22`,
                  }}
                >

                  <p className="text-white font-extrabold text-base mb-2">{p.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#ffffff" }}>{p.body}</p>
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
                    {/* Progress bar */}
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

        {/* ── Exclusive Live Webinars (conditional) ── */}
        {exclusive.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom, ${ACCENT}, ${ACCENT}80)` }} />
                <Star size={14} style={{ color: ACCENT }} />
                <h2 className="text-base font-extrabold text-white tracking-wide">Upcoming Exclusive Live Webinars</h2>
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
                  className="flex flex-col rounded-xl overflow-hidden transition-all duration-200"
                  style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = ACCENT;
                    e.currentTarget.style.boxShadow = `0 4px 20px ${ACCENT}22`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#252d3d";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Thumbnail — same as Webinars page */}
                  <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: "140px" }}>
                    <img
                      src={w.thumbnailUrl || THUMB}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ opacity: 0.9 }}
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(15,19,24,0.85))" }} />
                    <div className="absolute top-3 right-3">
                      <span className="text-[9px] font-bold px-2 py-1 rounded-full tracking-wide uppercase"
                        style={{ background: ACCENT, color: "#fff" }}>
                        Exclusive
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-sm leading-snug mb-2">{w.title}</h3>
                    {w.description && (
                       <p className="text-white text-xs leading-relaxed mb-2">{w.description}</p>
                    )}
                    {w.host && (
                       <p className="text-white text-xs mb-2">
                        Host: <span className="text-white">{w.host}</span>
                      </p>
                    )}
                    {w.scheduledAt && (
                      <div className="space-y-0.5 mb-3">
                        <p className="text-xs text-white flex items-center gap-1.5">
                          <Calendar size={11} style={{ color: ACCENT }} />
                          {new Date(w.scheduledAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/Denver" })}
                        </p>
                        <p className="text-xs text-white flex items-center gap-1.5">
                          <Clock size={11} style={{ color: ACCENT }} />
                          {new Date(w.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Denver", timeZoneName: "short" })}
                        </p>
                      </div>
                    )}
                    <div className="mt-auto">
                      {w.registrationUrl && (
                        <a
                          href={w.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackRegClick.mutate({ webinarId: w.id })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                          style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
                        >
                          <ExternalLink size={12} /> Register →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Start Here ── */}
        {visibleCards.length > 0 && <section>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #0074F4, #67C728)" }} />
            <Sparkles size={14} style={{ color: "#0074F4" }} />
            <h2 className="text-base font-extrabold text-white tracking-wide">Explore the Center</h2>
          </div>

          {/* Full-width single-column stack */}
          <div className="flex flex-col gap-3">
            {visibleCards.map((card) => {
              const Icon = card.icon;
              const CtaIcon = card.ctaIcon;
              const isPlayground = card.id === "playground";

              const cardInner = (
                <div
                  className="group flex items-center gap-5 rounded-2xl px-6 py-5 transition-all duration-200 w-full"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}0d 0%, #0c1018 60%)`,
                    border: `1px solid ${card.color}20`,
                    cursor: isPlayground ? "default" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${card.color}50`;
                    e.currentTarget.style.boxShadow = `0 4px 28px ${card.color}18`;
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${card.color}20`;
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-extrabold text-base">{card.label}</p>
                      {card.badge && (
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide flex-shrink-0"
                          style={{ background: `${card.color}20`, color: card.color, border: `1px solid ${card.color}40` }}
                        >
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "#ffffff" }}>
                      {card.description}
                    </p>
                  </div>

                  {/* CTA button — uniform width, no wrap */}
                  <div className="flex-shrink-0" style={{ width: "175px" }}>
                    {isPlayground ? (
                      <button
                        onClick={() => setShowPlaygroundModal(true)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                        style={{ background: `${card.color}20`, color: card.color, border: `1px solid ${card.color}40` }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${card.color}35`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = `${card.color}20`; }}
                      >
                        {card.cta}
                        <ArrowRight size={11} className="ml-auto" />
                      </button>
                    ) : (
                      <span
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                        style={{ background: `${card.color}18`, color: card.color, border: `1px solid ${card.color}35` }}
                      >
                        {card.cta}
                        <ArrowRight size={11} className="ml-auto" />
                      </span>
                    )}
                  </div>
                </div>
              );

              return isPlayground ? (
                <div key={card.id}>{cardInner}</div>
              ) : (
                <Link key={card.id} href={card.href!} style={{ textDecoration: "none", display: "block" }}>
                  {cardInner}
                </Link>
              );
            })}
          </div>
        </section>}



      </div>
    </PortalLayout>
  );
}
