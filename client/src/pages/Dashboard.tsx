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
    description: "Coming soon — a sandbox environment where you can explore WAVV features, test workflows, and build confidence without touching live data. Join the waitlist to be first in.",
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
    description: "Browse help articles, ask WAVV AI for an instant answer, or connect directly with a support rep through the Help Center.",
    cta: "Get Support",
    ctaIcon: MessageCircle,
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
    color: "#10b981",
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
  const { data: exclusiveWebinars } = trpc.webinars.list.useQuery({ type: "exclusive" });
  const trackRegClick = trpc.webinars.trackRegistrationClick.useMutation();
  const [showPlaygroundModal, setShowPlaygroundModal] = useState(false);

  const exclusive = (exclusiveWebinars ?? [])
    .filter((w) => !w.scheduledAt || new Date(w.scheduledAt) >= new Date())
    .slice(0, 3);

  return (
    <PortalLayout title="Home">
      {showPlaygroundModal && <PlaygroundModal onClose={() => setShowPlaygroundModal(false)} />}

      {/* Full-width content — no max-width cap on the outer wrapper */}
      <div className="px-4 lg:px-8 py-8 space-y-12">

        {/* ── Hero ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "radial-gradient(ellipse 100% 90% at 50% 0%, rgba(0,116,244,0.28) 0%, rgba(0,169,226,0.12) 40%, rgba(103,199,40,0.06) 70%, transparent 90%), #080c14",
            border: "1px solid rgba(0,116,244,0.18)",
            minHeight: "320px",
          }}
        >
          {/* Subtle grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,116,244,0.14), transparent 65%)", transform: "translate(25%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(103,199,40,0.08), transparent 65%)", transform: "translate(-25%, 30%)" }} />

          <div className="relative z-10 px-6 lg:px-16 py-14 lg:py-18 text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full"
              style={{ background: "rgba(0,116,244,0.12)", border: "1px solid rgba(0,116,244,0.25)" }}>
              <Sparkles size={12} style={{ color: "#0074F4" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#0074F4" }}>
                Your WAVV Knowledge Hub
              </span>
            </div>

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

            {/* Gradient accent line */}
            <div className="flex justify-center mb-6">
              <div style={{
                width: "200px",
                height: "3px",
                borderRadius: "2px",
                background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)",
              }} />
            </div>

            {/* Subline */}
            <p
              className="mx-auto mb-3 leading-relaxed font-medium"
              style={{ color: "rgba(255,255,255,0.75)", fontSize: "clamp(1rem, 2vw, 1.2rem)", maxWidth: "640px" }}
            >
              Everything you need to get the most out of WAVV — in one place.
            </p>
            <p
              className="mx-auto mb-8 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)", fontSize: "clamp(0.85rem, 1.5vw, 1rem)", maxWidth: "560px" }}
            >
              Whether you're just getting started or looking to sharpen your edge, the WAVV Success Center gives you the training, tools, and resources to dial smarter, connect more, and close faster.
            </p>

        
          </div>
        </div>

        {/* ── What is WAVV ── */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #0074F4, #67C728)" }} />
              <h2 className="text-sm font-bold text-white tracking-wide">What is WAVV?</h2>
            </div>
            <a
              href="https://www.wavv.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
              style={{ color: "#0074F4", textDecoration: "none" }}
            >
              Learn More <ArrowRight size={11} />
            </a>
          </div>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "720px" }}>
            WAVV is a native multi-line power dialer that lives directly inside your CRM — no tab-switching, no copy-pasting, no context loss. It's built for sales and customer success teams who need to move fast: dial multiple contacts simultaneously, skip voicemails automatically, and stay focused on the conversations that actually move deals forward. Whether you're a solo rep ramping up or a team running high-volume outbound, WAVV is designed to help you connect more often and close more deals without ever leaving your workflow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${p.color}18`, border: `1px solid ${p.color}30` }}
                  >
                    <PIcon size={18} style={{ color: p.color }} />
                  </div>
                  <p className="text-white font-bold text-sm mb-2">{p.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>{p.body}</p>
                </div>
              );
            })}
          </div>
        </section>

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
            <h2 className="text-sm font-bold text-white tracking-wide">Explore the Center</h2>
          </div>

          {/* Full-width single-column stack */}
          <div className="flex flex-col gap-3">
            {START_HERE_CARDS.map((card) => {
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
                    if (!isPlayground) {
                      e.currentTarget.style.borderColor = `${card.color}50`;
                      e.currentTarget.style.boxShadow = `0 4px 28px ${card.color}18`;
                      e.currentTarget.style.transform = "translateX(4px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPlayground) {
                      e.currentTarget.style.borderColor = `${card.color}20`;
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateX(0)";
                    }
                  }}
                >
                  {/* Icon badge */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${card.color}18`, border: `1px solid ${card.color}30` }}
                  >
                    <Icon size={20} style={{ color: card.color }} />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
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

        {/* ── Footer ── */}
        <footer
          className="pt-6 mt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              © {new Date().getFullYear()} WAVV Communications. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <a
                href="https://www.wavv.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
              >
                Privacy Policy
              </a>
              <a
                href="https://www.wavv.com/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
              >
                Terms &amp; Conditions
              </a>

            </div>
          </div>
        </footer>

      </div>
    </PortalLayout>
  );
}
