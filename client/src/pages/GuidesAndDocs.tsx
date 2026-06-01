import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { FileText, Download, ExternalLink, Search, BookOpen, CheckSquare, Map, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { ContentRequestCTA } from "./Academy";

// Category metadata — drives section headers, icons, and color coding
const CATEGORY_META: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
  help_article: { label: "Help Articles", color: "#8B5CF6", icon: HelpCircle, description: "Answers to common questions and troubleshooting guides" },
  pdf:       { label: "PDFs",       color: "#ef4444", icon: FileText,   description: "Downloadable reference documents" },
  checklist: { label: "Checklists", color: "#67C728", icon: CheckSquare, description: "Step-by-step checklists to follow along" },
  playbook:  { label: "Playbooks",  color: "#0074F4", icon: Map,         description: "Strategy and process playbooks" },
  other:     { label: "Resources",  color: "#FF9900", icon: BookOpen,    description: "Reference materials and templates" },
};

// Display order for sections — help_article appears first
const CATEGORY_ORDER = ["help_article", "pdf", "checklist", "playbook", "other"] as const;

export default function GuidesAndDocs() {
  const [search, setSearch] = useState("");
  const { data: guides, isLoading } = trpc.guides.list.useQuery();
  const { data: guideVisRaw } = trpc.siteSettings.get.useQuery({ key: "guides_sections_visibility" });
  const guideVisibility: Record<string, boolean> = (guideVisRaw as Record<string, boolean> | null) ?? { help_article: true, pdf: true, checklist: true, playbook: true, resource: true };
  const downloadMutation = trpc.guides.download.useMutation();

  const handleDownload = async (guide: NonNullable<typeof guides>[0]) => {
    await downloadMutation.mutateAsync({ guideId: guide.id });
    if (guide.fileUrl) {
      window.open(guide.fileUrl, "_blank");
    } else {
      toast.info("File URL not available yet.");
    }
  };

  // Group guides by fileType (= category)
  const grouped = (guides ?? []).reduce<Record<string, NonNullable<typeof guides>>>((acc, g) => {
    const key = g.fileType ?? "other";
    if (!acc[key]) acc[key] = [];
    // Apply search filter
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
      <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-8">
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
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 w-32 rounded animate-pulse" style={{ background: "#1d2230" }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-40 rounded-xl animate-pulse" style={{ background: "#1d2230" }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grouped sections */}
        {!isLoading && (
          <div className="space-y-10">
            {CATEGORY_ORDER.map((categoryKey) => {
              // Map "other" to "resource" for visibility key lookup
              const visKey = categoryKey === "other" ? "resource" : (categoryKey as string);
              if (guideVisibility[visKey] === false) return null;
              const items = grouped[categoryKey] ?? [];
              const meta = CATEGORY_META[categoryKey];
              const Icon = meta.icon;
              return (
                <section key={categoryKey}>
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${meta.color}20` }}
                    >
                      <Icon size={16} style={{ color: meta.color }} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">{meta.label}</h2>
                      <p className="text-xs text-gray-500">{meta.description}</p>
                    </div>
                    <div
                      className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${meta.color}15`, color: meta.color }}
                    >
                      {items.length}
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="mb-4 h-px" style={{ background: `${meta.color}30` }} />
                  {/* Cards or empty state */}
                  {items.length === 0 ? (
                    <div
                      className="flex items-center gap-3 px-5 py-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}
                    >
                      <Icon size={16} style={{ color: meta.color, opacity: 0.5 }} />
                      <p className="text-sm text-gray-500">No {meta.label.toLowerCase()} yet. Check back soon or contact your admin.</p>
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((guide) => (
                      <div
                        key={guide.id}
                        className="relative flex flex-col p-5 rounded-xl transition-all"
                        style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = meta.color;
                          e.currentTarget.style.boxShadow = `0 4px 20px ${meta.color}15`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#252d3d";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: `${meta.color}20` }}
                          >
                            <Icon size={20} style={{ color: meta.color }} />
                          </div>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: `${meta.color}20`, color: meta.color }}
                          >
                            {meta.label.replace(/s$/, "")}
                          </span>
                        </div>

                        <h3 className="text-white font-semibold text-sm mb-1 leading-snug">{guide.title}</h3>
                        {guide.description && (
                          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                            {guide.description}
                          </p>
                        )}

                        <div className="mt-auto flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(guide)}
                            disabled={downloadMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-1 justify-center"
                            style={{
                              background: `${meta.color}20`,
                              color: meta.color,
                              border: `1px solid ${meta.color}40`,
                            }}
                          >
                            <Download size={12} />
                            Download
                          </button>
                          {guide.fileUrl && (
                            <a
                              href={guide.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              style={{ background: "#252d3d", color: "#9ca3af" }}
                            >
                              <ExternalLink size={11} />
                              View
                            </a>
                          )}
                        </div>

                        {guide.downloadCount ? (
                          <p className="text-xs text-gray-600 text-center mt-2">
                            {guide.downloadCount} download{guide.downloadCount !== 1 ? "s" : ""}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  )}
                </section>
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
      <div className="px-4 lg:px-6 pb-10 max-w-5xl mx-auto">
        <ContentRequestCTA requestType="guide" accentColor="#67C728" />
      </div>
    </PortalLayout>
  );
}
