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
    badge: null,
  },
  {
    id: "support",
    href: "/support",
    label: "WAVV Support",
    icon: Headphones,
    color: "#FF9900",
    tagline: "Stuck? Get help fast.",
    description: "Ask WAVV AI for an instant answer, browse the Help Center, or connect directly with a support rep.",
    cta: "Get Support",
    badge: null,
  },
  {
    id: "playground",
    href: null,
    label: "WAVV Playground",
    icon: FlaskConical,
    color: "#a855f7",
    tagline: "Hands-on sandbox. Coming soon.",
    description: "Practice in a live WAVV environment without affecting real data. Test workflows, explore features, and build confidence.",
    cta: null,
    badge: "Coming Soon",
  },
];

// ─── Playground Interest Card ─────────────────────────────────────────────────
function PlaygroundInterestCard({ color }: { color: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submit = trpc.playground.submitPublicInterest.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => setError(e.message),
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
        <CheckCircle2 size={28} style={{ color }} />
        <p className="text-white font-semibold text-sm">You're on the list!</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
          We'll let you know when WAVV Playground is ready.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2.5">
      <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
        Get notified when it's ready
      </p>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder-gray-500 outline-none focus:ring-1"
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
        className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder-gray-500 outline-none focus:ring-1"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        disabled={!name.trim() || !email.trim() || submit.isPending}
        onClick={() => submit.mutate({ name: name.trim(), email: email.trim() })}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
        style={{ background: `${color}22`, color, border: `1px solid ${color}45` }}
        onMouseEnter={(e) => { if (!submit.isPending) e.currentTarget.style.background = `${color}35`; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = `${color}22`; }}
      >
        <Send size={11} />
        {submit.isPending ? "Sending…" : "Notify Me"}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: exclusiveWebinars } = trpc.webinars.list.useQuery({ type: "exclusive" });
  const trackRegClick = trpc.webinars.trackRegistrationClick.useMutation();

  const exclusive = (exclusiveWebinars ?? [])
    .filter((w) => !w.scheduledAt || new Date(w.scheduledAt) >= new Date())
    .slice(0, 3);

  return (
    <PortalLayout title="Home">
      <div className="px-4 lg:px-6 py-8 max-w-6xl mx-auto space-y-14">

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {START_HERE_CARDS.map((card) => {
              const Icon = card.icon;
              const isPlayground = card.id === "playground";

              const cardInner = (
                <div
                  className="group flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: `linear-gradient(145deg, ${card.color}0d 0%, #0f1318 60%)`,
                    border: `1px solid ${card.color}25`,
                    cursor: isPlayground ? "default" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isPlayground) {
                      e.currentTarget.style.borderColor = `${card.color}55`;
                      e.currentTarget.style.boxShadow = `0 8px 32px ${card.color}18`;
                      e.currentTarget.style.transform = "translateY(-3px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPlayground) {
                      e.currentTarget.style.borderColor = `${card.color}25`;
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  {/* Card header strip */}
                  <div
                    className="flex items-center gap-3 px-5 py-4"
                    style={{
                      background: `linear-gradient(135deg, ${card.color}18 0%, ${card.color}06 100%)`,
                      borderBottom: `1px solid ${card.color}20`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${card.color}22`, border: `1px solid ${card.color}35` }}
                    >
                      <Icon size={18} style={{ color: card.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-sm truncate">{card.label}</p>
                        {card.badge && (
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide flex-shrink-0"
                            style={{ background: `${card.color}20`, color: card.color, border: `1px solid ${card.color}40` }}
                          >
                            {card.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: card.color }}>{card.tagline}</p>
                    </div>
                    {!isPlayground && (
                      <ChevronRight
                        size={14}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: card.color }}
                      />
                    )}
                  </div>

                  {/* Card body */}
                  <div className="px-5 py-4 flex flex-col flex-1">
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {card.description}
                    </p>

                    {isPlayground ? (
                      <PlaygroundInterestCard color={card.color} />
                    ) : (
                      <div className="mt-auto">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: `${card.color}18`, color: card.color, border: `1px solid ${card.color}35` }}
                        >
                          {card.id === "academy" && <BookOpen size={11} />}
                          {card.id === "webinars" && <Video size={11} />}
                          {card.id === "guides" && <FileText size={11} />}
                          {card.id === "support" && <MessageCircle size={11} />}
                          {card.cta} <ArrowRight size={10} />
                        </span>
                      </div>
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
