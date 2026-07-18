import { useState, useEffect } from "react";
import { Users, DollarSign, Megaphone, LifeBuoy, CheckCircle2, ChevronDown, ChevronUp, ArrowRight, Handshake, TrendingUp, Award, BarChart3, FileText, ExternalLink, ChevronRight, Star } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── Access logic (mirrors Accelerator pattern) ─────────────────────────────
function usePartnerAccess() {
  const { user } = useAuth();

  if (!user) return { hasAccess: false, reason: "unauthenticated" as const, user: null };

  // All approved WAVV employees always have access
  const isApprovedEmployee = (user as any)?.isEmployee && (user as any)?.approvalStatus === "approved";
  if (isApprovedEmployee) return { hasAccess: true, reason: "employee" as const, user };

  // Partners: check role
  const role = (user as any)?.role ?? "";
  if (role === "partner_manager") return { hasAccess: true, reason: "partner" as const, user };

  // Authenticated but no access
  return { hasAccess: false, reason: "no_access" as const, user };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const VALUE_PILLARS = [
  {
    icon: DollarSign,
    color: "#10b981",
    title: "Competitive Revenue Share",
    body: "Earn recurring commissions on every active customer you refer. There is no cap on earnings — the more you grow, the more you earn.",
  },
  {
    icon: Megaphone,
    color: "#0074F4",
    title: "Marketing Support & Visibility",
    body: "Get listed in the WAVV Partner Directory and featured in partner spotlights. Need a video, co-branded content, or a collab? We'll build it with you. If it helps you sell, we're in.",
  },
  {
    icon: LifeBuoy,
    color: "#a855f7",
    title: "Dedicated Partner Support",
    body: "You'll have a dedicated partner success contact, onboarding resources to get you up and running fast, and priority support from our technical team when you need help.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    color: "#0074F4",
    title: "Apply",
    body: "Answer a few quick questions at wavv.com/partner-program so we can learn a little about you before we get you set up.",
  },
  {
    step: "02",
    color: "#10b981",
    title: "Complete a Course",
    body: "Once approved, you'll get access to the onboarding course. Complete the required onboarding course to unlock your unique promo code and partner portal.",
  },
  {
    step: "03",
    color: "#67C728",
    title: "Start Earning",
    body: "Share your promo code with your network. Every qualified customer you refer earns you a recurring commission — tracked in real time inside your partner dashboard.",
  },
];

const FAQS = [
  {
    q: "Who is the WAVV Partner Program for?",
    a: "The program is designed for sales leaders and agency owners who are ready to turn their network into a revenue stream. If you regularly advise people on outbound strategy, CRM tooling, or working in a sales environment, you're a strong fit.",
  },
  {
    q: "How does the commission structure work?",
    a: "WAVV partners earn a recurring revenue share on every active customer they refer. Exact commission rates are shared during the approval process. There is no cap on earnings.",
  },
  {
    q: "How are referrals tracked?",
    a: "Each approved partner receives a unique promo code. All referrals that apply the code at checkout are attributed to your account and visible in your partner dashboard in real time.",
  },
  {
    q: "What support do partners receive?",
    a: "Approved Partners get access to a dedicated partner success contact, co-marketing opportunities, and priority technical support.",
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{ border: "1px solid rgba(255,255,255,0.08)", background: open ? "rgba(255,255,255,0.04)" : "transparent" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-white">{q}</span>
        {open
          ? <ChevronUp size={16} style={{ color: "#0074F4", flexShrink: 0 }} />
          : <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm leading-relaxed text-white">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Partner Hub (unlocked view) ────────────────────────────────────────────
function PartnerHub() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="rounded-2xl p-6" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
            <Star size={20} style={{ color: "#10b981" }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Welcome, Partner</h3>
            <p className="text-xs text-white">Your WAVV Partner Hub</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-white">
          This is your home base for partner resources, referral tracking, and co-marketing materials. Everything you need to grow your WAVV partnership is here.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: BarChart3, title: "Referral Dashboard", description: "Track referrals, conversions & earnings", color: "#0074F4", href: "https://wavv.firstpromoter.com/login" },
          { icon: FileText, title: "Sales Materials", description: "Decks, one-pagers & demo scripts", color: "#8b5cf6", href: "#" },
          { icon: Megaphone, title: "Co-Marketing", description: "Campaign assets & brand guidelines", color: "#f97316", href: "#" },
          { icon: Users, title: "Demo Environment", description: "Sandbox account for prospect demos", color: "#06b6d4", href: "#" },
          { icon: DollarSign, title: "Payouts & Billing", description: "Commission history & payment settings", color: "#10b981", href: "https://wavv.firstpromoter.com/login" },
          { icon: Award, title: "Partner Tier", description: "Your current level & next milestone", color: "#ec4899", href: "#" },
        ].map((item) => (
          <a
            key={item.title}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group rounded-xl p-5 transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = `${item.color}33`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}18` }}>
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white mb-0.5">{item.title}</h4>
                <p className="text-xs text-white">{item.description}</p>
              </div>
              <ChevronRight size={14} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "rgba(255,255,255,0.4)" }} />
            </div>
          </a>
        ))}
      </div>

      {/* Partner Resources */}
      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-base font-bold text-white mb-4">Partner Resources</h3>
        <div className="space-y-3">
          {[
            { title: "WAVV Partner Playbook", description: "Complete guide to selling and supporting WAVV", type: "PDF" },
            { title: "Product Demo Script", description: "Talk track for live prospect demos", type: "DOC" },
            { title: "Referral Link Generator", description: "Create tracked links for your campaigns", type: "TOOL", href: "https://wavv.firstpromoter.com/login" },
            { title: "Partner Slack Channel", description: "Direct line to the WAVV partner team", type: "LINK" },
          ].map((resource) => (
            <div
              key={resource.title}
              className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer"
              style={{ background: "rgba(255,255,255,0.02)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
            >
              <FileText size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{resource.title}</p>
                <p className="text-xs text-white">{resource.description}</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(0,116,244,0.12)", color: "#4a9eff" }}>
                {resource.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="text-center py-4">
        <p className="text-sm text-white">
        Need help? Reach your partner manager or email{" "}
          <a href="mailto:partners@wavv.com" className="font-medium" style={{ color: "#0074F4" }}>partners@wavv.com</a>
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Partners() {
  const { hasAccess: realAccess, reason: realReason, user } = usePartnerAccess();
  const [previewAsCustomer, setPreviewAsCustomer] = useState(false);
  const [showAccessPopup, setShowAccessPopup] = useState(false);

  // Show pop-up for signed-in users who aren't approved partners
  useEffect(() => {
    if (realReason === "no_access" && !previewAsCustomer) {
      setShowAccessPopup(true);
    }
  }, [realReason, previewAsCustomer]);

  const isApprovedEmployee = (user as any)?.isEmployee && (user as any)?.approvalStatus === "approved";
  const hasAccess = previewAsCustomer ? false : realAccess;
  const reason = previewAsCustomer ? "no_access" : realReason;

  return (
    <PortalLayout title="WAVV Partners">
      <div className="px-4 lg:px-8 py-6 space-y-16 pb-24">

        {/* ── Employee Preview Toggle (fixed height to prevent layout shift) ── */}
        <div style={{ minHeight: "32px" }}>
        {isApprovedEmployee && (
          <div className="flex items-center justify-end gap-3">
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
              Viewing As: {previewAsCustomer ? "Non WAVV Partner" : "WAVV Partner"}
            </span>
            <button
              onClick={() => setPreviewAsCustomer(!previewAsCustomer)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
              style={{ background: previewAsCustomer ? "#10b981" : "rgba(16,185,129,0.3)" }}
            >
              <span
                className="inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200"
                style={{ transform: previewAsCustomer ? "translateX(22px)" : "translateX(4px)" }}
              />
            </button>
          </div>
        )}
        </div>

        {/* ── Hero ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "radial-gradient(ellipse 100% 90% at 50% 0%, rgba(0,169,226,0.28) 0%, rgba(0,116,244,0.14) 40%, rgba(103,199,40,0.06) 70%, transparent 90%), #080c14",
            border: "1px solid rgba(0,169,226,0.2)",
            minHeight: "280px",
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
            style={{ background: "radial-gradient(circle, rgba(0,169,226,0.16), transparent 65%)", transform: "translate(25%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(103,199,40,0.08), transparent 65%)", transform: "translate(-25%, 30%)" }} />

          <div className="relative z-10 px-4 sm:px-6 lg:px-16 py-8 sm:py-12 text-center">
            {/* Headline */}
            <h1
              className="font-extrabold tracking-tight leading-[1.05] mb-4"
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}
            >
              <span style={{
                background: "linear-gradient(135deg, #ffffff 0%, #bae6fd 30%, #7dd3fc 60%, #67C728 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                WAVV Partners
              </span>
            </h1>

            {/* Accent line */}
            <div className="flex justify-center mb-6">
              <div style={{ width: "200px", height: "3px", borderRadius: "2px", background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)" }} />
            </div>

            {/* Subline */}
            <p className="mx-auto leading-relaxed" style={{ color: "#ffffff", fontSize: "clamp(0.88rem, 1.6vw, 1rem)", maxWidth: "560px" }}>
              Refer customers to WAVV and earn recurring revenue for every active account you bring in. Built for sales leaders and agency owners ready to turn their network into a revenue stream.
            </p>

            {/* CTA in hero — for non-access users */}
            {!hasAccess && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://www.wavv.com/partner-program"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, #0074F4, #0056b3)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Apply Now
                  <ArrowRight size={15} />
                </a>
                {reason === "unauthenticated" && (
                  <a
                    href="/api/oauth/login?return_path=/partners"
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                    style={{ background: "#0074F4", color: "#fff", textDecoration: "none", whiteSpace: "nowrap" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#0060d4"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#0074F4"; }}
                  >
                    Sign In
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Unlocked: Partner Hub ── */}
        {hasAccess && <PartnerHub />}

        {/* ── Marketing content (always visible) ── */}

        {/* ── Why Partner with WAVV ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #67C728)" }} />
            <h2 className="text-2xl font-extrabold text-white">Why Partner with WAVV?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VALUE_PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-2xl p-5 flex flex-col gap-3"
                  style={{
                    background: `linear-gradient(135deg, ${p.color}0d 0%, #0c1018 60%)`,
                    border: `1px solid ${p.color}22`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${p.color}20` }}
                  >
                    <Icon size={18} style={{ color: p.color }} />
                  </div>
                  <p className="text-sm font-bold text-white">{p.title}</p>
                  <p className="text-xs leading-relaxed text-white">{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── How It Works ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #67C728)" }} />
            <h2 className="text-2xl font-extrabold text-white">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative flex flex-col gap-3">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-5 left-full w-full h-px"
                    style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.12), transparent)", zIndex: 0, width: "calc(100% - 2.5rem)", left: "calc(100% - 1.25rem)" }}
                  />
                )}
                <div
                  className="rounded-2xl p-5 flex flex-col gap-3 relative z-10"
                  style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-2xl font-black"
                      style={{ color: step.color, lineHeight: 1 }}
                    >
                      {step.step}
                    </span>
                    <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.1)" }} />
                    <p className="text-sm font-bold text-white">{step.title}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-white">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── What You Get ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #67C728)" }} />
            <h2 className="text-2xl font-extrabold text-white">What You Get as a WAVV Partner</h2>
          </div>

          <div
            className="rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
            style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {[
              "Recurring commission on every active referral",
              "Yearly revenue incentives",
              "Real-time referral tracking dashboard",
              "Dedicated partner success contact",
              "Personalized marketing support",
              "Listing in the WAVV Partner Directory",
              "Priority technical support",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#67C728" }} />
                <span className="text-sm text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #67C728)" }} />
            <h2 className="text-2xl font-extrabold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq) => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>

        {/* ── Bottom CTA (non-access users) ── */}
        {!hasAccess && (
        <div
          className="rounded-2xl p-8 flex flex-col items-center text-center gap-5"
          style={{
            background: "linear-gradient(135deg, rgba(0,116,244,0.12) 0%, rgba(103,199,40,0.08) 100%)",
            border: "1px solid rgba(0,116,244,0.2)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(0,116,244,0.15)", border: "1px solid rgba(0,116,244,0.25)" }}
          >
            <Users size={26} style={{ color: "#0074F4" }} />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-extrabold text-white">Ready to become a WAVV Partner?</p>
            <p className="text-sm max-w-md text-white">
              Applications are reviewed and approved within minutes. After you apply, watch your email for the next steps. Join a growing network of partners earning recurring revenue by connecting their clients with WAVV.
            </p>
          </div>
          <a
            href="https://www.wavv.com/partner-program"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #0074F4, #0056b3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Apply Now
            <ArrowRight size={15} />
          </a>
          <p className="text-xs text-white">
            Already an approved WAVV Partner?{" "}
            <a
              href="https://wavv.firstpromoter.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors"
              style={{ color: "rgba(0,169,226,0.85)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#00A9E2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(0,169,226,0.85)"; }}
            >
              Log in to your portal here
            </a>
          </p>
        </div>
        )}

        {/* ── Sticky CTA for non-access users ── */}
        {!hasAccess && (
          <div className="sticky bottom-0 left-0 right-0 z-40 py-3 px-4 flex items-center justify-center gap-4"
            style={{ background: "linear-gradient(to top, rgba(8,12,20,0.98), rgba(8,12,20,0.92))", borderTop: "1px solid rgba(0,116,244,0.15)", backdropFilter: "blur(12px)" }}>
            <span className="text-xs font-medium hidden sm:inline text-white">
              Earn recurring revenue on every referral you bring to WAVV
            </span>
            <a
              href="https://www.wavv.com/partner-program"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #0074F4, #0056b3)" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              Apply Now <ArrowRight size={13} />
            </a>
          </div>
        )}

      </div>

      {/* ── Access Denied Pop-up (signed-in but not approved partner) ── */}
      {showAccessPopup && reason === "no_access" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="relative w-full max-w-md rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, #0f1a2e 0%, #162240 100%)", border: "1px solid rgba(0,116,244,0.2)", boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(0,116,244,0.15)" }}>
              <Users size={22} style={{ color: "#0074F4" }} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Not an Approved Partner</h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
              Whoops, looks like you're not an approved partner. Please apply, and our WAVV Partner team will be in contact with you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://www.wavv.com/partners"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                Apply Now
                <ArrowRight size={15} />
              </a>
              <button
                onClick={() => setShowAccessPopup(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
