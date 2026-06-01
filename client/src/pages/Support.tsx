import PortalLayout from "@/components/PortalLayout";
import { Headphones, MessageCircle, TicketCheck } from "lucide-react";

const ACTION_CARDS = [
  {
    key: "chat",
    title: "Chat with Support",
    description: "Connect with a WAVV support rep in real time — available during business hours",
    icon: MessageCircle,
    color: "#0074F4",
    href: "https://help.wavv.com",
  },
  {
    key: "ticket",
    title: "Submit a Ticket",
    description: "Send us a detailed request and we'll follow up as soon as possible",
    icon: TicketCheck,
    color: "#67C728",
    href: "https://help.wavv.com/hc/en-us/requests/new",
  },
];

export default function Support() {
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
                Need help? Our support team is here for you. Chat with us directly or submit a
                ticket and we'll get back to you as quickly as possible.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Looking for guides, playbooks, or how-to docs? Visit{" "}
                <a href="/guides" className="text-blue-400 hover:underline">WAVV Guides & Docs</a>.
              </p>
            </div>
          </div>
        </div>

        {/* 2 action cards — side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACTION_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.key}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="flex items-start gap-4 p-6 rounded-xl transition-all cursor-pointer h-full"
                  style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = card.color;
                    e.currentTarget.style.boxShadow = `0 4px 24px ${card.color}18`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#252d3d";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${card.color}20` }}
                  >
                    <Icon size={22} style={{ color: card.color }} />
                  </div>
                  <div>
                    <p className="text-white text-base font-semibold mb-1">{card.title}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </PortalLayout>
  );
}
