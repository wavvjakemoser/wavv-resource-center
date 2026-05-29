import { useState } from "react";
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
  ArrowRight,
  Sparkles,
  BookOpen,
  Zap,
  MessageCircle,
  Send,
  CheckCircle2,
  X,
  Bell,
} from "lucide-react";
import { Link } from "wouter";
import PortalLayout from "@/components/PortalLayout";

const ACCENT = "#D4AF37";
const THUMB  = "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/webinar-thumb-exclusive-v2-gGXX6nYRkYWDJDcBByZ8iX.webp";

// ─── Start Here card definitions ─────────────────────────────────────────────
const START_HERE_CARDS = [
  {
    id: "academy",
    href: "/academy",
    label: "WAVV Academy",
    icon: GraduationCap,
    color: "#0074F4",
    tagline: "New to WAVV? Start here.",
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
    tagline: "See WAVV in action.",
    description: "Live and on-demand sessions hosted by the WAVV team. Watch replays, register for upcoming events, and sharpen your skills.",
    cta: "Browse Webinars",
    ctaIcon: Video,
    badge: null,
  },
  {
    id: "guides",
    href: "/guides",
    label: "Guides & Docs",
    icon: FileText,
    color: "#67C728",
    tagline: "Step-by-step answers.",
    description: "Downloadable playbooks, checklists, and quick-reference guides for every part of the WAVV platform.",
    cta: "View Guides",
    ctaIcon: FileText,
    badge: null,
  },
  {
    id: "playground",
    href: null,
    label: "WAVV Playground",
    icon: FlaskConical,
    color: "#a855f7",
    tagline: "Hands-on sandbox. Coming soon.",
    description: "Practice in a live WAVV environment without affecting real data. Test workflows, explore features, and build confidence before going live.",
    cta: "Get Notified",
    ctaIcon: Bell,
    badge: "Coming Soon",
  },
  {
    id: "support",
    href: "/support",
    label: "WAVV Support",
    icon: Headphones,
    color: "#FF9900",
    tagline: "Stuck? Get help fast.",
    description: "Browse help articles, ask WAVV AI for an instant answer, or connect directly with a support rep through the Help Center.",
    cta: "Get Support",
    ctaIcon: MessageCircle,
    badge: null,
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
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
              <input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && name.trim() && email.trim()) submit.mutate({ name: name.trim(), email: email.trim() }); }}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
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
  const { data: exclusiveWebinars } = trpc.webinars.list.useQuery({ type: "exclusive" });
  const trackRegClick = trpc.webinars.trackRegistrationClick.useMutation();
  const [showPlaygroundModal, setShowPlaygroundModal] = useState(false);

  const exclusive = (exclusiveWebinars ?? [])
    .filter((w) => !w.scheduledAt || new Date(w.scheduledAt) >= new Date())
    .slice(0, 3);

  return (
    <PortalLayout title="Home">
      {showPlaygroundModal && <PlaygroundModal onClose={() => setShowPlaygroundModal(false)} />}

      <div className="px-4 lg:px-6 py-8 max-w-5xl mx-auto space-y-14">

        {/* ── Hero ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "radial-gradient(ellipse 90% 80% at 50% 0%, rgba(0,116,244,0.22) 0%, rgba(0,169,226,0.10) 45%, transparent 70%), #0a0e18",
            border: "1px solid rgba(0,116,244,0.2)",
            minHeight: "260px",
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,116,244,0.12), transparent 70%)", transform: "translate(20%, -20%)" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(103,199,40,0.07), transparent 70%)", transform: "translate(-20%, 20%)" }} />

          <div className="relative z-10 px-6 lg:px-12 py-12 lg:py-14 text-center">
            <h1
              className="font-extrabold tracking-tight leading-[1.06] mb-4"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}
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

            <div className="flex justify-center mb-5">
              <div style={{
                width: "160px",
                height: "3px",
                borderRadius: "2px",
                background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)",
              }} />
            </div>

            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.05rem", maxWidth: "460px", margin: "0 auto" }}>
              Build skills and get the most out of every call.
            </p>
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
                      <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {w.description}
                      </p>
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
                          {new Date(w.scheduledAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/Denver" })}
                        </p>
                        <p className="text-xs flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                          <Clock size={11} style={{ color: ACCENT }} />
                          {new Date(w.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Denver", timeZoneName: "short" })}
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

        {/* ── Start Here ── */}
        <section>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #0074F4, #67C728)" }} />
            <Sparkles size={14} style={{ color: "#0074F4" }} />
            <h2 className="text-sm font-bold text-white tracking-wide">Start Here</h2>
          </div>

          {/* Single-column stacked layout */}
          <div className="flex flex-col gap-4">
            {START_HERE_CARDS.map((card) => {
              const Icon = card.icon;
              const CtaIcon = card.ctaIcon;
              const isPlayground = card.id === "playground";

              const cardInner = (
                <div
                  className="group flex items-center gap-5 rounded-2xl px-6 py-5 transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}0d 0%, #0f1318 70%)`,
                    border: `1px solid ${card.color}22`,
                    cursor: isPlayground ? "default" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isPlayground) {
                      e.currentTarget.style.borderColor = `${card.color}50`;
                      e.currentTarget.style.boxShadow = `0 4px 24px ${card.color}15`;
                      e.currentTarget.style.transform = "translateX(3px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPlayground) {
                      e.currentTarget.style.borderColor = `${card.color}22`;
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateX(0)";
                    }
                  }}
                >
                  {/* Icon badge */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${card.color}20`, border: `1px solid ${card.color}35` }}
                  >
                    <Icon size={20} style={{ color: card.color }} />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-bold text-sm">{card.label}</p>
                      {card.badge && (
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide flex-shrink-0"
                          style={{ background: `${card.color}20`, color: card.color, border: `1px solid ${card.color}40` }}
                        >
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {card.description}
                    </p>
                  </div>

                  {/* CTA button — fixed width so all buttons are the same size */}
                  <div className="flex-shrink-0" style={{ width: "175px" }}>
                    {isPlayground ? (
                      <button
                        onClick={() => setShowPlaygroundModal(true)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                        style={{ background: `${card.color}20`, color: card.color, border: `1px solid ${card.color}40` }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${card.color}35`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = `${card.color}20`; }}
                      >
                        <CtaIcon size={12} />
                        {card.cta}
                        <ArrowRight size={11} className="ml-auto" />
                      </button>
                    ) : (
                      <span
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                        style={{ background: `${card.color}18`, color: card.color, border: `1px solid ${card.color}35` }}
                      >
                        <CtaIcon size={12} />
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
        </section>

      </div>
    </PortalLayout>
  );
}
