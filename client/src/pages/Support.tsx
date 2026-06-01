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
      <div className="px-4 lg:px-6 py-6 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #1a0d00 0%, #1a1000 100%)",
            border: "1px solid rgba(255, 153, 0, 0.2)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255, 153, 0, 0.2)" }}
            >
              <Headphones size={24} style={{ color: "#FF9900" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#FF9900" }}>WAVV Support</h1>
              <p className="text-gray-400 text-sm">
                Need help? Start a chat with our support team and we'll take it from there.
                If a ticket needs to be opened, your rep will handle it for you.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Looking for guides, playbooks, or how-to docs? Visit{" "}
                <a href="/guides" className="text-blue-400 hover:underline">WAVV Guides & Docs</a>.
              </p>
            </div>
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
