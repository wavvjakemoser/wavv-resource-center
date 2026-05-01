import PortalLayout from "@/components/PortalLayout";
import { FlaskConical, Phone, LayoutDashboard, Mic, Settings, Lock } from "lucide-react";

const SANDBOX_TOOLS = [
  {
    label: "Dialer Sandbox",
    desc: "Practice calling flows, power dialer settings, and call dispositions in a safe environment.",
    icon: Phone,
    color: "#0074F4",
    available: false,
  },
  {
    label: "Call Boards",
    desc: "Explore call board layouts, team queues, and real-time metrics without affecting live data.",
    icon: LayoutDashboard,
    color: "#00A9E2",
    available: false,
  },
  {
    label: "Voicemail Drop",
    desc: "Test voicemail drop recordings and review how they appear to recipients.",
    icon: Mic,
    color: "#67C728",
    available: false,
  },
  {
    label: "Settings Explorer",
    desc: "Walk through WAVV account settings, integrations, and configuration options.",
    icon: Settings,
    color: "#FF9900",
    available: false,
  },
];

export default function HandsOn() {
  return (
    <PortalLayout title="Hands-On">
      <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
          style={{
            background: "linear-gradient(135deg, #1a0a2e 0%, #0d1f35 60%, #0a1a10 100%)",
            border: "1px solid rgba(168,85,247,0.25)",
          }}
        >
          <div className="relative z-10 flex items-start gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
            >
              <FlaskConical size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Hands-On Sandbox</h1>
              <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
                A safe, isolated environment to explore WAVV features without affecting your live account.
                Practice the dialer, explore call boards, and get comfortable with the platform before going live.
              </p>
            </div>
          </div>
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #a855f7, transparent)", transform: "translate(30%, -30%)" }}
          />
        </div>

        {/* Coming soon notice */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}
        >
          <Lock size={14} style={{ color: "#a855f7", flexShrink: 0 }} />
          <span className="text-gray-400">
            Sandbox environments are currently in development. They will be available in an upcoming release.
            The tools below show what's planned.
          </span>
        </div>

        {/* Tool cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Planned Sandbox Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SANDBOX_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.label}
                  className="flex items-start gap-4 p-5 rounded-xl"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    opacity: 0.7,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${tool.color}20` }}
                  >
                    <Icon size={22} style={{ color: tool.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-sm">{tool.label}</h3>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}
                      >
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">{tool.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback CTA */}
        <div
          className="flex items-center gap-4 p-5 rounded-xl"
          style={{
            background: "rgba(168,85,247,0.06)",
            border: "1px solid rgba(168,85,247,0.15)",
          }}
        >
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">Have a feature request for the sandbox?</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Let your WAVV rep know which tools would be most valuable to practice in a sandbox environment.
            </p>
          </div>
          <a
            href="/support"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-all hover:opacity-90 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
          >
            Contact Support
          </a>
        </div>
      </div>
    </PortalLayout>
  );
}
