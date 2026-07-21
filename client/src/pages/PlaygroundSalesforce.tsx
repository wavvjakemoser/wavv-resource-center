import PortalLayout from "@/components/PortalLayout";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const ACCENT = "#67C728";

export default function PlaygroundSalesforce() {
  return (
    <PortalLayout title="Salesforce Playground">
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb */}
        <Link href="/playground" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          Back to WAVV Playground
        </Link>

        {/* Hero banner with neon icon image */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ height: "200px", border: `1px solid ${ACCENT}40`, boxShadow: `0 0 0 1px ${ACCENT}20, 0 4px 32px ${ACCENT}18` }}
        >
          <div className="absolute inset-0" style={{ background: "#000" }} />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit-sf" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={ACCENT} strokeWidth="0.8" fill="none"/>
                <circle cx="10" cy="10" r="2" fill={ACCENT}/>
                <circle cx="50" cy="10" r="2" fill={ACCENT}/>
                <circle cx="50" cy="50" r="2" fill={ACCENT}/>
                <circle cx="30" cy="30" r="1.5" fill={ACCENT}/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-sf)"/>
          </svg>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(/manus-storage/final-playground-salesforce_080ae767.png)`,
              backgroundSize: "auto 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right center",
              opacity: 0.85,
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)" }}
          />
          <div className="relative flex flex-col justify-center h-full px-8 py-6 gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>WAVV Playground</p>
            <h1 className="text-2xl font-extrabold text-white leading-tight">Salesforce</h1>
            <p className="text-sm text-gray-300 mb-2">Experience WAVV within Salesforce — practice calling, explore boards, and test messaging workflows.</p>
          </div>
        </div>

        {/* Coming Soon content */}
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl text-center"
          style={{ background: "#111", border: "1px dashed #2a2a2a" }}
        >
          <h3 className="text-white font-bold text-lg mb-2">Coming Soon</h3>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            The Salesforce playground environment is currently under development. Check back soon for hands-on sandbox experiences with WAVV inside Salesforce.
          </p>
        </div>
      </div>
    </PortalLayout>
  );
}
