import { useState } from "react";
import { Users, DollarSign, Megaphone, LifeBuoy, CheckCircle2, ChevronDown, ChevronUp, ArrowRight, Handshake, TrendingUp, Award } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";

// ─── Data ─────────────────────────────────────────────────────────────────────

const VALUE_PILLARS = [
  {
    icon: DollarSign,
    color: "#10b981",
    title: "Competitive Revenue Share",
    body: "Earn a recurring commission on every customer you refer — for as long as they stay active. Our rev-share model is built to reward partners who drive real, lasting value.",
  },
  {
    icon: Megaphone,
    color: "#0074F4",
    title: "Co-Marketing & Visibility",
    body: "Get listed in the WAVV Partner Directory, featured in partner spotlights, and co-branded in joint campaigns. We invest in making our partners visible to the right audiences.",
  },
  {
    icon: LifeBuoy,
    color: "#a855f7",
    title: "Dedicated Partner Support",
    body: "Access a dedicated partner success contact, onboarding resources, and a private partner portal with everything you need to pitch, close, and support WAVV customers.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    color: "#0074F4",
    title: "Apply",
    body: "Submit your application at wavv.com/partner-program. Tell us about your audience, your network, and how you plan to refer customers to WAVV.",
  },
  {
    step: "02",
    color: "#10b981",
    title: "Get Approved",
    body: "Our partnerships team reviews your application and reaches out within 3–5 business days. Once approved, you'll get access to your partner portal, tracking links, and onboarding materials.",
  },
  {
    step: "03",
    color: "#67C728",
    title: "Start Earning",
    body: "Share your unique referral link with your network. Every qualified customer you refer earns you a recurring commission — tracked in real time inside your partner dashboard.",
  },
];

const FAQS = [
  {
    q: "Who is the WAVV Partner Program for?",
    a: "The program is designed for consultants, coaches, CRM specialists, RevOps professionals, sales trainers, and anyone with an audience of sales or customer success teams who could benefit from WAVV. If you regularly advise people on outbound strategy or CRM tooling, you're a strong fit.",
  },
  {
    q: "How does the commission structure work?",
    a: "WAVV partners earn a recurring revenue share on every active customer they refer. Exact commission rates are shared during the approval process and depend on the volume and type of referrals. There is no cap on earnings.",
  },
  {
    q: "Do I need to be a WAVV customer to become a partner?",
    a: "No — but we strongly recommend experiencing the product firsthand. We offer demo access to approved partners so you can speak to WAVV's value with confidence.",
  },
  {
    q: "How are referrals tracked?",
    a: "Each approved partner receives a unique tracking link. All referrals made through that link are attributed to your account and visible in your partner dashboard in real time.",
  },
  {
    q: "What support do partners receive?",
    a: "Approved partners get access to a dedicated partner success contact, a private resource library (pitch decks, one-pagers, demo scripts), co-marketing opportunities, and priority support for any customer questions that come through your referrals.",
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
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Partners() {
  return (
    <PortalLayout title="WAVV Partners">
      <div className="px-4 lg:px-8 py-8 space-y-16 max-w-4xl">

        {/* ── Hero ── */}
        <div className="space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
            style={{ background: "rgba(0,169,226,0.12)", border: "1px solid rgba(0,169,226,0.25)", color: "#00A9E2" }}>
            <Users size={13} />
            WAVV Partner Program
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Grow Together with{" "}
            <span style={{ background: "linear-gradient(90deg, #0074F4, #00A9E2, #67C728)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              WAVV
            </span>
          </h1>

          {/* Sub */}
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: "rgba(255,255,255,0.6)" }}>
            Refer customers to WAVV and earn recurring revenue for every active account you bring in.
            The WAVV Partner Program is built for consultants, coaches, and CRM professionals who want
            to turn their network into a revenue stream — with real support behind them.
          </p>

          {/* CTA */}
          <a
            href="https://www.wavv.com/partner-program"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #0074F4, #0056b3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Apply to Become a Partner
            <ArrowRight size={15} />
          </a>
        </div>

        {/* ── Why Partner with WAVV ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #67C728)" }} />
            <h2 className="text-xl font-bold text-white">Why Partner with WAVV?</h2>
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
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.58)" }}>{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── How It Works ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #67C728)" }} />
            <h2 className="text-xl font-bold text-white">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative flex flex-col gap-3">
                {/* Connector line between steps */}
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
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.58)" }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── What You Get ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #67C728)" }} />
            <h2 className="text-xl font-bold text-white">What You Get as a WAVV Partner</h2>
          </div>

          <div
            className="rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
            style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {[
              "Recurring commission on every active referral",
              "Real-time referral tracking dashboard",
              "Dedicated partner success contact",
              "Co-branded marketing materials",
              "Listing in the WAVV Partner Directory",
              "Partner-only resource library (pitch decks, one-pagers)",
              "Demo access to WAVV for hands-on experience",
              "Priority support for your referred customers",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#67C728" }} />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #0074F4, #67C728)" }} />
            <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq) => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
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
            <p className="text-xl font-bold text-white">Ready to become a WAVV Partner?</p>
            <p className="text-sm max-w-md" style={{ color: "rgba(255,255,255,0.55)" }}>
              Applications are reviewed within 3–5 business days. Join a growing network of partners
              earning recurring revenue by connecting their clients with WAVV.
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
            Apply Now at wavv.com
            <ArrowRight size={15} />
          </a>
        </div>

      </div>
    </PortalLayout>
  );
}
