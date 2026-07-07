import { useParams } from "wouter";
import PortalLayout from "@/components/PortalLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Calendar,
  Play,
  FileText,
  Download,
  Lock,
  CheckCircle2,
} from "lucide-react";

// ─── Qualifying plans (same as Accelerator.tsx) ─────────────────────────────
const QUALIFYING_PLANS = ["quarterly", "annual"];

function useAcceleratorAccess() {
  const { user } = useAuth();
  if (!user) return { hasAccess: false, reason: "unauthenticated" as const };
  const isApprovedEmployee = (user as any)?.isEmployee && (user as any)?.approvalStatus === "approved";
  if (isApprovedEmployee) return { hasAccess: true, reason: "employee" as const };
  const plan = ((user as any)?.wavvPlan ?? "").toLowerCase();
  const subStatus = ((user as any)?.subscriptionStatus ?? "").toUpperCase();
  const hasQualifyingPlan = QUALIFYING_PLANS.some((p) => plan.includes(p)) && subStatus === "ACTIVE";
  if (hasQualifyingPlan) return { hasAccess: true, reason: "qualifying_plan" as const };
  return { hasAccess: false, reason: "no_access" as const };
}

export default function AcceleratorSession() {
  const params = useParams<{ id: string }>();
  const sessionId = parseInt(params.id ?? "1", 10);
  const { hasAccess, reason } = useAcceleratorAccess();

  // Load session from database
  const { data: session, isLoading } = trpc.accelerator.get.useQuery({ id: sessionId });

  if (isLoading) {
    return (
      <PortalLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PortalLayout>
    );
  }

  if (!session) {
    return (
      <PortalLayout title="Session Not Found">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <p className="text-gray-400">Session not found.</p>
            <a href="/accelerator" className="text-sm font-medium" style={{ color: "#0074F4" }}>
              ← Back to Accelerator
            </a>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const color = session.color ?? "#0074F4";

  if (!hasAccess) {
    return (
      <PortalLayout title={`Session ${session.week}: ${session.title}`}>
        <div className="px-4 lg:px-8 py-8 max-w-4xl mx-auto space-y-6">
          <a href="/accelerator" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            Back to Accelerator
          </a>

          <div className="rounded-2xl p-12 text-center space-y-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: `${color}15` }}>
              <Lock size={28} style={{ color }} />
            </div>
            <h2 className="text-xl font-bold text-white">Session {session.week}: {session.title}</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              This session is available to WAVV Quarterly and Annual subscribers.
              Upgrade your plan to access the full WAVV Sales Accelerator.
            </p>
            {reason === "unauthenticated" ? (
              <a
                href="/api/oauth/login?return_path=/accelerator"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all mt-2"
                style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)", color: "#fff" }}
              >
                Sign In to Check Access
              </a>
            ) : (
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
            )}
          </div>
        </div>
      </PortalLayout>
    );
  }

  // Parse resource links if available
  let resourceLinks: { label: string; url: string }[] = [];
  try {
    if (session.resourceLinks) resourceLinks = JSON.parse(session.resourceLinks);
  } catch { /* ignore */ }

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
              style={{ background: `${color}20`, color }}>
              Week {session.week}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {session.heroHeadline || session.title}
          </h1>
          {session.heroSubline && (
            <p className="text-sm text-gray-300">{session.heroSubline}</p>
          )}
          {!session.heroSubline && session.wavvFocus && (
            <p className="text-sm text-gray-400">{session.wavvFocus}</p>
          )}
        </div>

        {/* Outcome */}
        {session.outcome && (
          <div className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
            <CheckCircle2 size={18} style={{ color }} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-300">By the end of this session, you will:</p>
              <p className="text-sm text-white mt-1">{session.outcome}</p>
            </div>
          </div>
        )}

        {/* Video (if set) */}
        {session.videoUrl ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Play size={16} style={{ color }} />
              Session Video
            </h2>
            <div className="rounded-2xl overflow-hidden aspect-video">
              <iframe
                src={session.videoUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
              />
            </div>
          </section>
        ) : (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Play size={16} style={{ color }} />
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
        )}

        {/* Body content (markdown rendered as HTML) */}
        {session.bodyContent && (
          <section className="space-y-3">
            <div
              className="prose prose-invert prose-sm max-w-none rounded-xl p-5"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              dangerouslySetInnerHTML={{ __html: session.bodyContent }}
            />
          </section>
        )}

        {/* Resource links */}
        {resourceLinks.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText size={16} style={{ color }} />
              Resources
            </h2>
            <div className="space-y-2">
              {resourceLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl p-4 flex items-center gap-3 transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}30`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15` }}>
                    <Download size={18} style={{ color }} />
                  </div>
                  <span className="text-sm font-medium text-white">{link.label}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Calls */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar size={16} style={{ color }} />
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
            <Play size={16} style={{ color }} />
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
