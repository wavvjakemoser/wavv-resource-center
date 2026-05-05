import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { FileText, Download, ExternalLink, Search, BookOpen, CheckSquare, Map } from "lucide-react";
import { toast } from "sonner";
import { ContentRequestCTA } from "./Academy";

const FILE_TYPE_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pdf: { label: "PDF", color: "#ef4444", icon: FileText },
  checklist: { label: "Checklist", color: "#67C728", icon: CheckSquare },
  playbook: { label: "Playbook", color: "#0074F4", icon: Map },
  other: { label: "Resource", color: "#9ca3af", icon: BookOpen },
};

export default function GuidesAndDocs() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const { data: guides, isLoading } = trpc.guides.list.useQuery();
  const downloadMutation = trpc.guides.download.useMutation();

  const filtered = (guides ?? []).filter((g) => {
    const matchSearch =
      !search ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      (g.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (g.category ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || g.fileType === filterType;
    return matchSearch && matchType;
  });

  const handleDownload = async (guide: (typeof filtered)[0]) => {
    await downloadMutation.mutateAsync({ guideId: guide.id });
    if (guide.fileUrl) {
      window.open(guide.fileUrl, "_blank");
    } else {
      toast.info("File URL not available yet.");
    }
  };

  return (
    <PortalLayout title="Guides & Docs">
      <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-6">
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
              <h1 className="text-xl font-bold mb-1" style={{ color: "#67C728" }}>Guides & Docs</h1>
              <p className="text-gray-400 text-sm">
                Playbooks, checklists, and reference documents to accelerate your WAVV success.
                Download and use these resources with your team.
              </p>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div
            className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
          >
            <Search size={15} className="text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pdf", "checklist", "playbook", "other"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  background: filterType === type ? "rgba(103, 199, 40, 0.15)" : "#1a1a1a",
                  color: filterType === type ? "#67C728" : "#9ca3af",
                  border: filterType === type ? "1px solid rgba(103, 199, 40, 0.4)" : "1px solid #2a2a2a",
                }}
              >
                {type === "all" ? "All" : FILE_TYPE_META[type]?.label ?? type}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: "#1a1a1a" }} />
            ))}
          </div>
        )}

        {/* Guide cards */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((guide) => {
              const meta = FILE_TYPE_META[guide.fileType ?? "other"] ?? FILE_TYPE_META.other;
              const Icon = meta.icon;
              return (
                <div
                  key={guide.id}
                  className="relative flex flex-col p-5 rounded-xl transition-all"
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = meta.color;
                    e.currentTarget.style.boxShadow = `0 4px 20px ${meta.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#2a2a2a";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Full-tile DEMO stamp */}
                  <div
                    className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none rounded-xl overflow-hidden demo-stamp-overlay"
                    style={{ opacity: 0.4, transition: "opacity 200ms ease" }}
                  >
                    <div
                      style={{
                        border: "4px double #cc0000",
                        padding: "10px 28px",
                        borderRadius: "4px",
                        transform: "rotate(-12deg)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Impact, Arial Black, sans-serif",
                          fontSize: "2.8rem",
                          fontWeight: 900,
                          color: "#cc0000",
                          letterSpacing: "0.12em",
                          textShadow: "1px 1px 0 #8b000040",
                          lineHeight: 1,
                          display: "block",
                        }}
                      >
                        DEMO
                      </span>
                    </div>
                  </div>
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
                      {meta.label}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold text-sm mb-1 leading-snug">{guide.title}</h3>
                  {guide.description && (
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-2">
                      {guide.description}
                    </p>
                  )}
                  {guide.category && (
                    <p className="text-gray-600 text-xs mb-3">{guide.category}</p>
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
                        style={{ background: "#2a2a2a", color: "#9ca3af" }}
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
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">
              {search || filterType !== "all" ? "No matching guides" : "No guides yet"}
            </h3>
            <p className="text-gray-500 text-sm">
              {search || filterType !== "all"
                ? "Try adjusting your search or filter."
                : "Guides and playbooks will appear here once added."}
            </p>
          </div>
        )}
      </div>

      {/* ── Request a Written Guide ── */}
      <div className="px-4 lg:px-6 pb-10">
        <ContentRequestCTA requestType="guide" accentColor="#67C728" />
      </div>
    </PortalLayout>
  );
}
