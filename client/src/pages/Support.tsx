import PortalLayout from "@/components/PortalLayout";
import { Headphones, MessageCircle } from "lucide-react";

const CHAT_CARD = {
  title: "Chat with Support",
  description: "Connect with a WAVV support rep in real time. Our team can answer questions, troubleshoot issues, and open a ticket on your behalf if needed.",
  icon: MessageCircle,
  color: "#0074F4",
  href: "https://help.wavv.com",
};

export default function Support() {
  const Icon = CHAT_CARD.icon;

  return (
    <PortalLayout title="Support">
      <div className="px-4 lg:px-8 py-6 space-y-6">

        {/* Header */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "radial-gradient(ellipse 100% 90% at 50% 0%, rgba(255,153,0,0.22) 0%, rgba(0,116,244,0.12) 45%, rgba(103,199,40,0.06) 70%, transparent 90%), #080c14",
            border: "1px solid rgba(255,153,0,0.2)",
            minHeight: "280px",
          }}
        >
          {/* Subtle grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,153,0,0.14), transparent 65%)", transform: "translate(25%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,116,244,0.08), transparent 65%)", transform: "translate(-25%, 30%)" }} />

          <div className="relative z-10 px-6 lg:px-16 py-12 text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full"
              style={{ background: "rgba(255,153,0,0.12)", border: "1px solid rgba(255,153,0,0.25)" }}>
              <Headphones size={12} style={{ color: "#FF9900" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#FF9900" }}>WAVV Support</span>
            </div>

            {/* Headline */}
            <h1 className="font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}>
              <span style={{ background: "linear-gradient(135deg, #ffffff 0%, #fef3c7 30%, #fde68a 60%, #FF9900 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                We're Here to Help
              </span>
            </h1>

            {/* Accent line */}
            <div className="flex justify-center mb-5">
              <div style={{ width: "200px", height: "3px", borderRadius: "2px", background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)" }} />
            </div>

            {/* Subline */}
            <p className="mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(0.88rem, 1.6vw, 1rem)", maxWidth: "560px" }}>
              Need help? Start a chat with our support team and we'll take it from there. If a ticket needs to be opened, your rep will handle it for you.
            </p>
            <p className="mx-auto mt-3" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem" }}>
              Looking for guides, playbooks, or how-to docs? Visit{" "}
              <a href="/guides" className="text-blue-400 hover:underline">WAVV Guides &amp; Docs</a>.
            </p>
          </div>
        </div>

        {/* Single action card */}
        <a
          href={CHAT_CARD.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <div
            className="flex items-start gap-4 p-6 rounded-xl transition-all cursor-pointer"
            style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = CHAT_CARD.color;
              e.currentTarget.style.boxShadow = `0 4px 24px ${CHAT_CARD.color}18`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#252d3d";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${CHAT_CARD.color}20` }}
            >
              <Icon size={22} style={{ color: CHAT_CARD.color }} />
            </div>
            <div>
              <p className="text-white text-base font-semibold mb-1">{CHAT_CARD.title}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{CHAT_CARD.description}</p>
            </div>
          </div>
        </a>

      </div>
    </PortalLayout>
  );
}
