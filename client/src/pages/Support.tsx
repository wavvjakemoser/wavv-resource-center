import PortalLayout from "@/components/PortalLayout";
import { ReadinessWidget } from "@/components/ReadinessWidget";
import { Headphones, ExternalLink, Sparkles } from "lucide-react";

const ACTION_CARDS = [
  {
    key: "ai",
    title: "Ask WAVV AI",
    description: "Get an instant answer from our AI assistant — available 24/7",
    icon: Sparkles,
    color: "#0074F4",
    href: undefined as string | undefined,
    onClick: () => {
      // Find and click the WAVV AI button in the top bar
      const btns = Array.from(document.querySelectorAll("button"));
      for (const btn of btns) {
        if (btn.textContent?.includes("WAVV AI")) { btn.click(); break; }
      }
    },
  },
  {
    key: "helpcenter",
    title: "Help Center",
    description: "Browse articles, step-by-step guides, and product documentation",
    icon: ExternalLink,
    color: "#00A9E2",
    href: "https://help.wavv.com",
    onClick: undefined as (() => void) | undefined,
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
                Get help fast — ask WAVV AI for an instant answer or browse the Help Center.
              </p>
            </div>
          </div>
        </div>

        {/* 2 action cards — side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACTION_CARDS.map((card) => {
            const Icon = card.icon;
            const inner = (
              <div
                className="flex items-start gap-4 p-6 rounded-xl transition-all cursor-pointer h-full"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = card.color;
                  e.currentTarget.style.boxShadow = `0 4px 24px ${card.color}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={card.onClick}
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
            );

            if (card.href) {
              return (
                <a key={card.key} href={card.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  {inner}
                </a>
              );
            }
            return <div key={card.key}>{inner}</div>;
          })}
        </div>

      </div>

      <ReadinessWidget page="support" />
    </PortalLayout>
  );
}
