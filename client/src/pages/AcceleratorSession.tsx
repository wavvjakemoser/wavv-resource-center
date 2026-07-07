import { useParams } from "wouter";
import PortalLayout from "@/components/PortalLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowLeft,
  Calendar,
  Play,
  FileText,
  Download,
  Lock,
  Rocket,
  CheckCircle2,
} from "lucide-react";

// ─── Session data (same as Accelerator.tsx — will be moved to shared/DB later) ─
const SESSIONS = [
  {
    id: 1,
    week: 1,
    title: "Build Your Number & Mindset Reset",
    wavvFocus: "Account setup, caller ID/number registration, dialer basics, and where to read your own activity stats",
    outcome: "Fully set up; can see the dials/conversations data behind their number",
    color: "#0074F4",
    podModule: "Build Your Number & Mindset Reset",
    cheatSheetTitle: "WAVV Setup & Number Registration Guide",
  },
  {
    id: 2,
    week: 2,
    title: "Prospecting Frames & Angles",
    wavvFocus: "Build or import a list; segment it; load it into a dialing campaign",
    outcome: "A live, dialer-ready list loaded in WAVV",
    color: "#10b981",
    podModule: "Prospecting Frames & Angles",
    cheatSheetTitle: "List Building & Campaign Setup Cheat Sheet",
  },
  {
    id: 3,
    week: 3,
    title: "The Conversation: Sales Psychology",
    wavvFocus: "Power/multi-line dialing, using local presence, live-call controls, voicemail drops",
    outcome: "Confident running the dialer during real conversations",
    color: "#8b5cf6",
    podModule: "The Conversation: Sales Psychology",
    cheatSheetTitle: "Multi-Line Dialing & Call Controls Guide",
  },
  {
    id: 4,
    week: 4,
    title: "Follow-Up Systems That Convert",
    wavvFocus: "Dispositions, tags, follow-up cadences, SMS/texting, and reminders inside WAVV",
    outcome: "A repeatable follow-up cadence built in WAVV",
    color: "#f97316",
    podModule: "Follow-Up Systems That Convert",
    cheatSheetTitle: "Follow-Up Cadences & Dispositions Guide",
  },
  {
    id: 5,
    week: 5,
    title: "Objection Handling",
    wavvFocus: "Call recordings & notes to review calls; saved scripts/snippets for fast responses",
    outcome: "Uses recordings + saved scripts to improve call over call",
    color: "#ec4899",
    podModule: "Objection Handling",
    cheatSheetTitle: "Call Recordings & Scripts Quick Reference",
  },
  {
    id: 6,
    week: 6,
    title: "The 1-Call Close & Wins Review",
    wavvFocus: "Pipeline/disposition reporting; CRM sync; reading conversion stats to find the next lever",
    outcome: "Can track closes in WAVV and see which lever to move next",
    color: "#06b6d4",
    podModule: "The 1-Call Close & Wins Review",
    cheatSheetTitle: "Pipeline Reporting & CRM Sync Guide",
  },
];

export default function AcceleratorSession() {
  const params = useParams<{ id: string }>();
  const sessionId = parseInt(params.id ?? "1", 10);
  const session = SESSIONS.find((s) => s.id === sessionId);
  const { user } = useAuth();

  // TODO: Replace with real Stripe SKU check
  const hasAccess = false;

  if (!session) {
    return (
      <PortalLayout title="Session Not Found">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <p className="text-gray-400">Session not found.</p>
            <a href="/accelerator" className="text-sm font-medium" style={{ color: "#f97316" }}>
              ← Back to Accelerator
            </a>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (!hasAccess) {
    return (
      <PortalLayout title={`Session ${session.week}: ${session.title}`}>
        <div className="px-4 lg:px-8 py-8 max-w-4xl mx-auto space-y-6">
          {/* Back link */}
          <a href="/accelerator" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            Back to Accelerator
          </a>

          {/* Locked state */}
          <div className="rounded-2xl p-12 text-center space-y-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: `${session.color}15` }}>
              <Lock size={28} style={{ color: session.color }} />
            </div>
            <h2 className="text-xl font-bold text-white">Session {session.week}: {session.title}</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              This session is available to WAVV Quarterly and Annual subscribers.
              Upgrade your plan to access the full Sales Accelerator bootcamp.
            </p>
            <a
              href="https://www.wavv.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all mt-2"
              style={{ background: "#f97316", color: "#fff" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#ea580c"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f97316"; }}
            >
              Upgrade to Unlock
            </a>
          </div>
        </div>
      </PortalLayout>
    );
  }

  // ─── Member view of individual session ─────────────────────────────────────
  return (
    <PortalLayout title={`Session ${session.week}: ${session.title}`}>
      <div className="px-4 lg:px-8 py-8 max-w-4xl mx-auto space-y-8">
        {/* Back link */}
        <a href="/accelerator" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          Back to Accelerator
        </a>

        {/* Session Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: `${session.color}20`, color: session.color }}>
              Week {session.week}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">{session.title}</h1>
          <p className="text-sm text-gray-400">{session.wavvFocus}</p>
        </div>

        {/* Outcome */}
        <div className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: `${session.color}08`, border: `1px solid ${session.color}20` }}>
          <CheckCircle2 size={18} style={{ color: session.color }} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-gray-300">By the end of this session, you will:</p>
            <p className="text-sm text-white mt-1">{session.outcome}</p>
          </div>
        </div>

        {/* WAVV Product Training Video */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Play size={16} style={{ color: session.color }} />
            WAVV Product Training
          </h2>
          <div className="rounded-2xl overflow-hidden aspect-video flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-center space-y-2">
              <Play size={40} style={{ color: "rgba(255,255,255,0.2)" }} />
              <p className="text-xs text-gray-500">Video content coming soon</p>
            </div>
          </div>
        </section>

        {/* Cheat Sheet */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={16} style={{ color: session.color }} />
            Cheat Sheet
          </h2>
          <div className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${session.color}15` }}>
              <FileText size={18} style={{ color: session.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.cheatSheetTitle}</p>
              <p className="text-xs text-gray-500">PDF — coming soon</p>
            </div>
            <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all opacity-50 cursor-not-allowed"
              style={{ background: "rgba(255,255,255,0.06)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}
              disabled>
              <Download size={12} />
              Download
            </button>
          </div>
        </section>

        {/* Upcoming Calls for this session */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar size={16} style={{ color: session.color }} />
            Upcoming Calls
          </h2>
          <div className="rounded-xl p-6 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs text-gray-500">No upcoming calls scheduled for this session yet.</p>
          </div>
        </section>

        {/* Previous Recordings */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Play size={16} style={{ color: session.color }} />
            Previous Recordings
          </h2>
          <div className="rounded-xl p-6 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs text-gray-500">No recordings available yet. Check back after the first live call.</p>
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}
