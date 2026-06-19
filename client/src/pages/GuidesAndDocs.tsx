import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { FileText, Download, ExternalLink, Search, ChevronDown, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { ContentRequestCTA } from "./Academy";
import HelpArticlesSection from "@/components/HelpArticlesSection";

// ─── PDF Viewer Modal ─────────────────────────────────────────────────────────
function PdfViewerModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden"
        style={{ width: "min(90vw, 1100px)", height: "min(90vh, 820px)", background: "#0f1318", border: "1px solid #252d3d", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid #1e2030" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
              <FileText size={14} style={{ color: "#ef4444" }} />
            </div>
            <span className="text-sm font-semibold text-white truncate max-w-[500px]">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <ExternalLink size={11} />
              Open in tab
            </a>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ background: "rgba(255,255,255,0.06)", color: "#9ca3af" }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
        {/* PDF iframe */}
        <iframe
          src={url}
          title={title}
          className="flex-1 w-full"
          style={{ border: "none", background: "#fff" }}
        />
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type GuideItem = {
  id: number;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  linkLabel?: string | null;
  downloadCount?: number | null;
  fileType?: string | null;
  category?: string | null;
  createdAt?: Date | null;
};

// ─── PDF Guide Row ────────────────────────────────────────────────────────────
const PDF_COLOR = "#ef4444";

function PdfRow({
  guide,
  onDownload,
  onView,
  onOpenModal,
  isPending,
}: {
  guide: GuideItem;
  onDownload: (guide: GuideItem) => void;
  onView?: (guide: GuideItem) => void;
  onOpenModal?: (guide: GuideItem) => void;
  isPending: boolean;
}) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all group"
      style={{ background: "#1d2230", border: "1px solid #252d3d" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${PDF_COLOR}50`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#252d3d"; }}
    >
      {/* Type icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${PDF_COLOR}18` }}
      >
        <FileText size={15} style={{ color: PDF_COLOR }} />
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
          style={{ background: `${PDF_COLOR}18`, color: PDF_COLOR, border: `1px solid ${PDF_COLOR}35` }}
        >
          <Download size={11} />
          <span className="hidden sm:inline">Download</span>
        </button>
        {guide.fileUrl && (
          <button
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all max-w-[180px] truncate"
            style={{ background: "#252d3d", color: "#9ca3af" }}
            onClick={() => { onView?.(guide); onOpenModal?.(guide); }}
            title={guide.linkLabel ?? guide.fileUrl}
          >
            <ExternalLink size={11} className="flex-shrink-0" />
            <span className="hidden sm:inline truncate">{guide.linkLabel ?? "View"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PDF Sub-Section ──────────────────────────────────────────────────────────
function PdfSubSection({
  sectionName,
  items,
  onDownload,
  onView,
  onOpenModal,
  isPending,
}: {
  sectionName: string;
  items: GuideItem[];
  onDownload: (guide: GuideItem) => void;
  onView?: (guide: GuideItem) => void;
  onOpenModal?: (guide: GuideItem) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const label = sectionName || "General";

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 mb-3 group"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${PDF_COLOR}18` }}
        >
          <FileText size={14} style={{ color: PDF_COLOR }} />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-white">{label}</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${PDF_COLOR}15`, color: PDF_COLOR }}
        >
          {items.length}
        </span>
        {open
          ? <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
          : <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />}
      </button>

      <div className="mb-3 h-px" style={{ background: `${PDF_COLOR}25` }} />

      {open && (
        items.length === 0 ? (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <FileText size={14} style={{ color: PDF_COLOR, opacity: 0.4 }} />
            <p className="text-xs text-gray-500">No PDFs in this section yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((guide) => (
              <PdfRow
                key={guide.id}
                guide={guide}
                onDownload={onDownload}
                onView={onView}
                onOpenModal={onOpenModal}
                isPending={isPending}
              />
            ))}
          </div>
        )
      )}
    </section>
  );
}

// ─── PDF Section (top-level, wraps sub-sections) ──────────────────────────────
type DbSection = { id: number; name: string; sortOrder: number; isVisible: boolean };
function PdfSection({
  items,
  dbSections,
  onDownload,
  onView,
  onOpenModal,
  isPending,
}: {
  items: GuideItem[];
  dbSections: DbSection[];
  onDownload: (guide: GuideItem) => void;
  onView?: (guide: GuideItem) => void;
  onOpenModal?: (guide: GuideItem) => void;
  isPending: boolean;
}) {
  // Use DB sections (visible only, sorted by sortOrder) as the authoritative section list.
  const visibleDbSections = dbSections.filter(s => s.isVisible);
  const dbSectionNames = new Set(visibleDbSections.map(s => s.name));
  // Any guide categories not in DB sections (orphaned) sorted alphabetically
  const orphanCategories = Array.from(new Set(
    items.map(g => g.category ?? "").filter(c => c !== "" && !dbSectionNames.has(c))
  )).sort();
  // Unsectioned guides go last
  const hasUnsectioned = items.some(g => !g.category);
  const sectionOrder: string[] = [
    ...visibleDbSections.map(s => s.name),
    ...orphanCategories,
    ...(hasUnsectioned ? [""] : []),
  ];
  const bySection = sectionOrder.reduce((acc, sec) => {
    acc[sec] = items.filter(g => (g.category ?? "") === sec);
    return acc;
  }, {} as Record<string, GuideItem[]>);
  const hasSections = sectionOrder.length > 0 && (visibleDbSections.length > 0 || orphanCategories.length > 0);

  return (
    <section>
      {/* Section header — NOT collapsible, always visible */}
      <div className="w-full flex items-center gap-3 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${PDF_COLOR}18` }}
        >
          <FileText size={14} style={{ color: PDF_COLOR }} />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-white">PDFs</span>
          <span className="ml-2 text-xs text-gray-500">Viewable and Downloadable PDF documents</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${PDF_COLOR}15`, color: PDF_COLOR }}
        >
          {items.length}
        </span>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px" style={{ background: `${PDF_COLOR}25` }} />

      {items.length === 0 ? (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
        >
          <FileText size={14} style={{ color: PDF_COLOR, opacity: 0.4 }} />
          <p className="text-xs text-gray-500">No PDFs yet. Please check back soon!</p>
        </div>
      ) : hasSections ? (
        // Render sub-sections (collapsed by default)
        <div className="space-y-4 pl-2">
          {sectionOrder.map((sec) => (
            <PdfSubSection
              key={sec || "__unsectioned"}
              sectionName={sec}
              items={bySection[sec]}
              onDownload={onDownload}
              onView={onView}
              onOpenModal={onOpenModal}
              isPending={isPending}
            />
          ))}
        </div>
      ) : (
        // No sections — flat list
        <div className="space-y-2">
          {items.map((guide) => (
            <PdfRow
              key={guide.id}
              guide={guide}
              onDownload={onDownload}
              onView={onView}
              onOpenModal={onOpenModal}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── FAQ Section (customer-facing) ───────────────────────────────────────────
const FAQ_COLOR = "#eab308";
type FaqEntry = { id: number; question: string; answer: string; isVisible: boolean; sortOrder: number };
type FaqSectionType = { id: number; name: string; isVisible: boolean; sortOrder: number; entries: FaqEntry[] };

function FaqEntryRow({ entry }: { entry: FaqEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
        style={{ background: open ? "#1d2230" : "#161b27" }}
      >
        <span className="flex-1 text-sm font-medium text-white">{entry.question}</span>
        {open ? <ChevronDown size={14} className="text-gray-500 flex-shrink-0" /> : <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 py-3" style={{ background: "#1d2230", borderTop: "1px solid #2a2a2a" }}>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{entry.answer}</p>
        </div>
      )}
    </div>
  );
}

function FaqSection({ sections, search }: { sections: FaqSectionType[]; search: string }) {
  const filteredSections = sections.map(s => ({
    ...s,
    entries: s.entries.filter(e =>
      !search ||
      e.question.toLowerCase().includes(search.toLowerCase()) ||
      e.answer.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(s => !search || s.entries.length > 0);

  if (filteredSections.length === 0) return null;

  return (
    <section>
      <div className="w-full flex items-center gap-3 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${FAQ_COLOR}18` }}>
          <span style={{ color: FAQ_COLOR, fontSize: 14, fontWeight: 700 }}>?</span>
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-white">FAQs</span>
          <span className="ml-2 text-xs text-gray-500">Frequently asked questions</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${FAQ_COLOR}15`, color: FAQ_COLOR }}>
          {filteredSections.reduce((acc, s) => acc + s.entries.length, 0)}
        </span>
      </div>
      <div className="mb-4 h-px" style={{ background: `${FAQ_COLOR}25` }} />
      <div className="space-y-6 pl-2">
        {filteredSections.map(section => (
          <div key={section.id}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: FAQ_COLOR }}>{section.name}</p>
            <div className="space-y-2">
              {section.entries.map(entry => (
                <FaqEntryRow key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GuidesAndDocs() {
  const [search, setSearch] = useState("");
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);

  const handleOpenModal = (guide: GuideItem) => {
    if (guide.fileUrl) setSelectedPdf({ url: guide.fileUrl, title: guide.title });
  };
  const { data: guides, isLoading } = trpc.guides.list.useQuery();
  const { data: pdfSectionsRaw } = trpc.guides.listPdfSectionsPublic.useQuery();
  const dbPdfSections: DbSection[] = (pdfSectionsRaw as DbSection[] | undefined) ?? [];
  const { data: faqSections = [] } = trpc.faq.listSectionsPublic.useQuery();
  const { data: guideVisRaw } = trpc.siteSettings.get.useQuery({ key: "guides_sections_visibility" });
  const guideVisibility: Record<string, boolean> = (guideVisRaw as Record<string, boolean> | null) ?? { help_article: true, pdf: true };
  const downloadMutation = trpc.guides.download.useMutation();
  const trackAnon = trpc.analytics.trackAnon.useMutation({ onError: () => {} });

  const handleView = (guide: GuideItem) => {
    trackAnon.mutate({
      eventType: "guide_viewed",
      resourceType: "guide",
      resourceId: guide.id,
      metadata: JSON.stringify({ title: guide.title, fileType: guide.fileType ?? "pdf" }),
    });
  };

  const handleDownload = async (guide: GuideItem) => {
    await downloadMutation.mutateAsync({ guideId: guide.id });
    trackAnon.mutate({
      eventType: "guide_download",
      resourceType: "guide",
      resourceId: guide.id,
      metadata: JSON.stringify({ title: guide.title, fileType: guide.fileType ?? "pdf" }),
    });
    if (guide.fileUrl) {
      window.open(guide.fileUrl, "_blank");
    } else {
      toast.info("File URL not available yet.");
    }
  };

  // Only PDFs — filter by search
  const pdfItems: GuideItem[] = (guides ?? []).filter(g => {
    const type = g.fileType ?? "pdf";
    if (type !== "pdf") return false;
    if (!search) return true;
    return (
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      (g.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (g.category ?? "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <PortalLayout title="WAVV Resource Hub">
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
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#67C728" }}>WAVV Resource Hub</span>
            </div>

            {/* Headline */}
            <h1 className="font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}>
              <span style={{ background: "linear-gradient(135deg, #ffffff 0%, #d9f99d 30%, #86efac 60%, #67C728 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Your WAVV Reference Library
              </span>
            </h1>

            {/* Accent line */}
            <div className="flex justify-center mb-5">
              <div style={{ width: "200px", height: "3px", borderRadius: "2px", background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)" }} />
            </div>

            {/* Subline */}
            <p className="mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(0.88rem, 1.6vw, 1rem)", maxWidth: "560px" }}>
              Not a course — a reference. Search help articles, troubleshooting guides, and downloadable PDFs organized by topic. Get the answer and get back to selling.
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
            placeholder="Search articles and PDFs..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
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

        {/* 1. Help Articles — synced from Intercom */}
        {guideVisibility["help_article"] !== false && (
          <div>
            <HelpArticlesSection search={search} />
          </div>
        )}

        {/* 2. PDFs — grouped by section */}
        {!isLoading && guideVisibility["pdf"] !== false && (
          <PdfSection
            items={pdfItems}
            dbSections={dbPdfSections}
            onDownload={handleDownload}
            onView={handleView}
            onOpenModal={handleOpenModal}
            isPending={downloadMutation.isPending}
          />
        )}

        {/* 3. FAQ — grouped by section */}
        {faqSections.length > 0 && (
          <FaqSection sections={faqSections} search={search} />
        )}

        {/* Empty state — no content at all */}
        {!isLoading && pdfItems.length === 0 && search && (
          <div className="text-center py-16">
            <Search size={40} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No results for "{search}"</h3>
            <p className="text-gray-500 text-sm">Try a different search term.</p>
          </div>
        )}
      </div>

      {/* Request a Written Guide */}
      <div className="px-4 lg:px-8 pb-10">
        <ContentRequestCTA requestType="guide" />
      </div>
      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PdfViewerModal
          url={selectedPdf.url}
          title={selectedPdf.title}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </PortalLayout>
  );
}
