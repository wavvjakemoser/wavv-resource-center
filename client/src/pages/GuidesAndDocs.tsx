import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { FileText, Download, ExternalLink, Search, BookOpen, CheckSquare, Map, HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ContentRequestCTA } from "./Academy";

// Category metadata
const CATEGORY_META: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
  help_article: { label: "Help Articles", color: "#8B5CF6", icon: HelpCircle, description: "Answers to common questions and troubleshooting guides" },
  pdf:       { label: "PDFs",       color: "#ef4444", icon: FileText,   description: "Downloadable reference documents" },
  checklist: { label: "Checklists", color: "#67C728", icon: CheckSquare, description: "Step-by-step checklists to follow along" },
  playbook:  { label: "Playbooks",  color: "#0074F4", icon: Map,         description: "Strategy and process playbooks" },
  other:     { label: "Resources",  color: "#FF9900", icon: BookOpen,    description: "Reference materials and templates" },
};

const CATEGORY_ORDER = ["help_article", "pdf", "checklist", "playbook", "other"] as const;

type GuideItem = {
  id: number;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  downloadCount?: number | null;
  fileType?: string | null;
  createdAt?: Date | null;
};

function GuideRow({
  guide,
  meta,
  onDownload,
  onView,
  isPending,
}: {
  guide: GuideItem;
  meta: typeof CATEGORY_META[string];
  onDownload: (guide: GuideItem) => void;
  onView?: (guide: GuideItem) => void;
  isPending: boolean;
}) {
  const Icon = meta.icon;
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all group"
      style={{ background: "#1d2230", border: "1px solid #252d3d" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${meta.color}50`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#252d3d"; }}
    >
      {/* Type icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${meta.color}18` }}
      >
        <Icon size={15} style={{ color: meta.color }} />
      </div>

      {/* Title + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white leading-snug truncate">{guide.title}</p>
          {guide.createdAt && (Date.now() - new Date(guide.createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide uppercase flex-shrink-0"
              style={{ background: "rgba(74,222,128,0.2)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.4)" }}>
              New
            </span>
          )}
        </div>
        {guide.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{guide.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onDownload(guide)}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}35` }}
        >
          <Download size={11} />
          <span className="hidden sm:inline">Download</span>
        </button>
        {guide.fileUrl && (
          <a
            href={guide.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: "#252d3d", color: "#9ca3af" }}
            onClick={() => onView?.(guide)}
          >
            <ExternalLink size={11} />
            <span className="hidden sm:inline">View</span>
          </a>
        )}
      </div>
    </div>
  );
}

function CategorySection({
  categoryKey,
  items,
  onDownload,
  onView,
  isPending,
}: {
  categoryKey: string;
  items: GuideItem[];
  onDownload: (guide: GuideItem) => void;
  onView?: (guide: GuideItem) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(true);
  const meta = CATEGORY_META[categoryKey];
  const Icon = meta.icon;

  return (
    <section>
      {/* Section header — collapsible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 mb-3 group"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${meta.color}18` }}
        >
          <Icon size={14} style={{ color: meta.color }} />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-white">{meta.label}</span>
          <span className="ml-2 text-xs text-gray-500">{meta.description}</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${meta.color}15`, color: meta.color }}
        >
          {items.length}
        </span>
        {open
          ? <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
          : <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />}
      </button>

      {/* Divider */}
      <div className="mb-3 h-px" style={{ background: `${meta.color}25` }} />

      {/* Rows or empty state */}
      {open && (
        items.length === 0 ? (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <Icon size={14} style={{ color: meta.color, opacity: 0.4 }} />
            <p className="text-xs text-gray-500">No {meta.label} yet. Please check back soon!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((guide) => (
              <GuideRow
                key={guide.id}
                guide={guide}
                meta={meta}
                onDownload={onDownload}
                onView={onView}
                isPending={isPending}
              />
            ))}
          </div>
        )
      )}
    </section>
  );
}

export default function GuidesAndDocs() {
  const [search, setSearch] = useState("");
  const { data: guides, isLoading } = trpc.guides.list.useQuery();
  const { data: guideVisRaw } = trpc.siteSettings.get.useQuery({ key: "guides_sections_visibility" });
  const guideVisibility: Record<string, boolean> = (guideVisRaw as Record<string, boolean> | null) ?? { help_article: true, pdf: true, checklist: true, playbook: true, resource: true };
  const downloadMutation = trpc.guides.download.useMutation();
  const trackAnon = trpc.analytics.trackAnon.useMutation({ onError: () => {} });

  const handleView = (guide: GuideItem) => {
    trackAnon.mutate({
      eventType: "guide_viewed",
      resourceType: "guide",
      resourceId: guide.id,
      metadata: JSON.stringify({ title: guide.title, fileType: guide.fileType ?? "other" }),
    });
  };

  const handleDownload = async (guide: GuideItem) => {
    await downloadMutation.mutateAsync({ guideId: guide.id });
    // Track anonymous download (server drops authenticated users)
    trackAnon.mutate({
      eventType: "guide_download",
      resourceType: "guide",
      resourceId: guide.id,
      metadata: JSON.stringify({ title: guide.title, fileType: guide.fileType ?? "other" }),
    });
    if (guide.fileUrl) {
      window.open(guide.fileUrl, "_blank");
    } else {
      toast.info("File URL not available yet.");
    }
  };

  // Group + filter
  const grouped = (guides ?? []).reduce<Record<string, GuideItem[]>>((acc, g) => {
    const key = g.fileType ?? "other";
    if (!acc[key]) acc[key] = [];
    if (
      !search ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      (g.description ?? "").toLowerCase().includes(search.toLowerCase())
    ) {
      acc[key].push(g);
    }
    return acc;
  }, {});

  const hasAnyResults = (CATEGORY_ORDER as readonly string[]).some((k) => (grouped[k]?.length ?? 0) > 0);

  return (
    <PortalLayout title="WAVV Guides & Docs">
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "radial-gradient(ellipse 100% 90% at 50% 0%, rgba(103,199,40,0.22) 0%, rgba(0,116,244,0.12) 45%, rgba(0,169,226,0.06) 70%, transparent 90%), #080c14",
            border: "1px solid rgba(103,199,40,0.2)",
            minHeight: "280px",
          }}
        >
          {/* Subtle grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(103,199,40,0.14), transparent 65%)", transform: "translate(25%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,116,244,0.08), transparent 65%)", transform: "translate(-25%, 30%)" }} />

          <div className="relative z-10 px-6 lg:px-16 py-12 text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full"
              style={{ background: "rgba(103,199,40,0.12)", border: "1px solid rgba(103,199,40,0.25)" }}>
              <FileText size={12} style={{ color: "#67C728" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#67C728" }}>WAVV Guides &amp; Docs</span>
            </div>

            {/* Headline */}
            <h1 className="font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}>
              <span style={{ background: "linear-gradient(135deg, #ffffff 0%, #d9f99d 30%, #86efac 60%, #67C728 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Guides, Playbooks &amp; Docs
              </span>
            </h1>

            {/* Accent line */}
            <div className="flex justify-center mb-5">
              <div style={{ width: "200px", height: "3px", borderRadius: "2px", background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)" }} />
            </div>

            {/* Subline */}
            <p className="mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(0.88rem, 1.6vw, 1rem)", maxWidth: "560px" }}>
              Help articles, playbooks, checklists, and reference documents to accelerate your WAVV success. Download and use these resources with your team.
            </p>
          </div>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
        >
          <Search size={15} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides, playbooks, checklists..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 w-28 rounded animate-pulse" style={{ background: "#1d2230" }} />
                <div className="h-px" style={{ background: "#2a2a2a" }} />
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-12 rounded-lg animate-pulse" style={{ background: "#1d2230" }} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Grouped sections */}
        {!isLoading && (
          <div className="space-y-8">
            {CATEGORY_ORDER.map((categoryKey) => {
              const visKey = categoryKey === "other" ? "resource" : (categoryKey as string);
              if (guideVisibility[visKey] === false) return null;
              const items = grouped[categoryKey] ?? [];
              return (
                <CategorySection
                  key={categoryKey}
                  categoryKey={categoryKey}
                  items={items}
                  onDownload={handleDownload}
                  onView={handleView}
                  isPending={downloadMutation.isPending}
                />
              );
            })}
          </div>
        )}

        {/* Empty state — no guides at all */}
        {!isLoading && !hasAnyResults && !search && (
          <div className="text-center py-20">
            <FileText size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Guides yet</h3>
            <p className="text-gray-500 text-sm">
              Please check back soon!
            </p>
          </div>
        )}

        {/* Empty state — search returned nothing */}
        {!isLoading && !hasAnyResults && search && (
          <div className="text-center py-16">
            <Search size={40} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No results for "{search}"</h3>
            <p className="text-gray-500 text-sm">Try a different search term.</p>
          </div>
        )}
      </div>

      {/* Request a Written Guide */}
      <div className="px-4 lg:px-8 pb-10">
        <ContentRequestCTA requestType="guide" accentColor="#67C728" />
      </div>
    </PortalLayout>
  );
}
