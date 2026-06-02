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
};

function GuideRow({
  guide,
  meta,
  onDownload,
  isPending,
}: {
  guide: GuideItem;
  meta: typeof CATEGORY_META[string];
  onDownload: (guide: GuideItem) => void;
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
        <p className="text-sm font-semibold text-white leading-snug truncate">{guide.title}</p>
        {guide.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{guide.description}</p>
        )}
      </div>

      {/* Download count */}
      {guide.downloadCount ? (
        <span className="text-xs text-gray-600 flex-shrink-0 hidden sm:block">
          {guide.downloadCount} dl
        </span>
      ) : null}

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
  isPending,
}: {
  categoryKey: string;
  items: GuideItem[];
  onDownload: (guide: GuideItem) => void;
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
            <p className="text-xs text-gray-500">No {meta.label.toLowerCase()} yet. Check back soon or contact your admin.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((guide) => (
              <GuideRow
                key={guide.id}
                guide={guide}
                meta={meta}
                onDownload={onDownload}
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

  const handleDownload = async (guide: GuideItem) => {
    await downloadMutation.mutateAsync({ guideId: guide.id });
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
      <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #001B28 0%, #0a1a10 100%)",
            border: "1px solid rgba(103, 199, 40, 0.2)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(103, 199, 40, 0.2)" }}
            >
              <FileText size={24} style={{ color: "#67C728" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#67C728" }}>WAVV Guides & Docs</h1>
              <p className="text-gray-400 text-sm">
                Help articles, playbooks, checklists, and reference documents to accelerate your WAVV success.
                Download and use these resources with your team.
              </p>
            </div>
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
            <h3 className="text-white font-semibold mb-2">No guides yet</h3>
            <p className="text-gray-500 text-sm">
              Guides, playbooks, and checklists will appear here once added by your admin.
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
      <div className="px-4 lg:px-6 pb-10 max-w-4xl mx-auto">
        <ContentRequestCTA requestType="guide" accentColor="#67C728" />
      </div>
    </PortalLayout>
  );
}
