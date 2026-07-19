import PortalLayout from "@/components/PortalLayout";
import { Link } from "wouter";
import { ArrowLeft, Construction } from "lucide-react";

const ACCENT = "#0074F4";

export default function PlaygroundGoHighLevel() {
  return (
    <PortalLayout title="Go High Level Playground">
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb */}
        <Link href="/playground" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          Back to WAVV Playground
        </Link>

        {/* Hero banner */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ height: "160px", border: `1px solid ${ACCENT}40` }}
        >
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(8,10,16,1) 0%, rgba(8,10,16,0.95) 60%, ${ACCENT}18 100%)` }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 80% 50%, ${ACCENT}14 0%, transparent 55%)` }} />
          <div className="relative flex flex-col justify-center h-full px-8 py-6 gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>WAVV Playground</p>
            <h1 className="text-2xl font-extrabold text-white leading-tight">Go High Level</h1>
            <p className="text-sm text-gray-300 mb-2">Practice WAVV features inside the Go High Level CRM — calling flows, call boards, and messaging.</p>
          </div>
        </div>

        {/* Coming Soon content */}
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl text-center"
          style={{ background: "#111", border: "1px dashed #2a2a2a" }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${ACCENT}15` }}>
            <Construction size={32} style={{ color: ACCENT }} />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Coming Soon</h3>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            The Go High Level playground environment is currently under development. Check back soon for hands-on sandbox experiences with WAVV inside GHL.
          </p>
        </div>
      </div>
    </PortalLayout>
  );
}
