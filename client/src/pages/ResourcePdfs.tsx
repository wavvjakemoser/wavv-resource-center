import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { ChevronLeft, Search, FileText, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import ResourceSidePanel, { PanelItem } from "@/components/ResourceSidePanel";

const ACCENT = "#00A9E2";

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

type DbSection = {
  id: number;
  name: string;
  sortOrder: number;
  isVisible: boolean;
};

// ─── PDF Guide Row ────────────────────────────────────────────────────────────
function PdfRow({
  guide,
  onOpen,
}: {
  guide: GuideItem;
  onOpen: (guide: GuideItem) => void;
}) {
  return (
    <button
      type="button"
      className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all group text-left"
      style={{ background: "#1d2230", border: "1px solid #252d3d" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${ACCENT}50`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#252d3d"; }}
      onClick={() => onOpen(guide)}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${ACCENT}18` }}
      >
        <FileText size={15} style={{ color: ACCENT }} />
      </div>
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
          <p className="text-xs text-white truncate mt-0.5">{guide.description}</p>
        )}
      </div>
      <span
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all opacity-0 group-hover:opacity-100"
        style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}35` }}
      >
        <ExternalLink size={11} />
        Open
      </span>
    </button>
  );
}

// ─── PDF Sub-Section ──────────────────────────────────────────────────────────
function PdfSubSection({
  sectionName,
  items,
  onOpen,
  defaultOpen,
}: {
  sectionName: string;
  items: GuideItem[];
  onOpen: (guide: GuideItem) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
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
          style={{ background: `${ACCENT}18` }}
        >
          <FileText size={14} style={{ color: ACCENT }} />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-white">{label}</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${ACCENT}15`, color: ACCENT }}
        >
          {items.length}
        </span>
        {open
          ? <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
          : <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />}
      </button>

      <div className="mb-3 h-px" style={{ background: `${ACCENT}25` }} />

      {open && (
        items.length === 0 ? (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <FileText size={14} style={{ color: ACCENT, opacity: 0.4 }} />
            <p className="text-xs text-white">No PDFs in this section yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((g) => (
              <PdfRow key={g.id} guide={g} onOpen={onOpen} />
            ))}
          </div>
        )
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResourcePdfs() {
  const [search, setSearch] = useState("");
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);

  const { data: guides, isLoading } = trpc.guides.list.useQuery();
  const { data: pdfSectionsRaw } = trpc.guides.listPdfSectionsPublic.useQuery();
  const dbPdfSections: DbSection[] = (pdfSectionsRaw as DbSection[] | undefined) ?? [];
  const trackAnon = trpc.analytics.trackAnon.useMutation({ onError: () => {} });

  const pdfItems: GuideItem[] = (guides ?? []).filter((g: any) => (g.fileType ?? "pdf") === "pdf");

  // Filter by search
  const filteredPdfItems = pdfItems.filter(g => {
    if (!search) return true;
    return (
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      (g.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (g.category ?? "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleOpenPdf = (guide: GuideItem) => {
    if (!guide.fileUrl) return;
    trackAnon.mutate({
      eventType: "guide_viewed",
      resourceType: "guide",
      resourceId: guide.id,
      metadata: JSON.stringify({ title: guide.title, fileType: guide.fileType ?? "pdf" }),
    });
    setPanelItem({ type: "pdf", title: guide.title, url: guide.fileUrl });
  };

  // Build sub-section map
  const visibleSections = dbPdfSections.filter(s => s.isVisible);
  let subSections: [string, GuideItem[]][] = [];
  const unsectioned: GuideItem[] = [];

  if (visibleSections.length > 0) {
    const sectionMap: Record<string, GuideItem[]> = {};
    for (const sec of visibleSections) sectionMap[sec.name] = [];
    const allSectionedIds = new Set<number>();
    for (const sec of visibleSections) {
      const secItems = filteredPdfItems.filter(g => g.category === sec.name);
      sectionMap[sec.name] = secItems;
      secItems.forEach(g => allSectionedIds.add(g.id));
    }
    filteredPdfItems.forEach(g => { if (!allSectionedIds.has(g.id)) unsectioned.push(g); });
    subSections = visibleSections.map(sec => [sec.name, sectionMap[sec.name] ?? []]);
  } else {
    const sectionMap: Record<string, GuideItem[]> = {};
    for (const g of filteredPdfItems) {
      const cat = g.category ?? "General";
      if (!sectionMap[cat]) sectionMap[cat] = [];
      sectionMap[cat].push(g);
    }
    subSections = Object.entries(sectionMap);
  }

  const sidePanel = (
    <ResourceSidePanel item={panelItem} onClose={() => setPanelItem(null)} pushMode={true} />
  );

  return (
    <PortalLayout title="WAVV Resource Hub — PDFs" rightPanel={sidePanel}>
      <div className="px-4 lg:px-8 py-6 space-y-6">

        {/* Back breadcrumb */}
        <Link
          href="/resourcehub"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ChevronLeft size={15} />
          WAVV Resource Hub
        </Link>

        {/* Hero banner with neon icon image */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ height: "200px", border: `1px solid ${ACCENT}40`, boxShadow: `0 0 0 1px ${ACCENT}20, 0 4px 32px ${ACCENT}18` }}
        >
          <div className="absolute inset-0" style={{ background: "#000" }} />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit-pdfs" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={ACCENT} strokeWidth="0.8" fill="none"/>
                <circle cx="10" cy="10" r="2" fill={ACCENT}/>
                <circle cx="50" cy="10" r="2" fill={ACCENT}/>
                <circle cx="50" cy="50" r="2" fill={ACCENT}/>
                <circle cx="30" cy="30" r="1.5" fill={ACCENT}/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-pdfs)"/>
          </svg>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(/manus-storage/final-resource-clipboard_ac540005.png)`,
              backgroundSize: "auto 90%",
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
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
              WAVV Resource Hub
            </p>
            <h1 className="text-2xl font-extrabold text-white leading-tight">PDFs</h1>
            <p className="text-sm text-gray-300 mb-2">Downloadable playbooks, checklists, and quick-reference documents.</p>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: `${ACCENT}35`, color: ACCENT, border: `1px solid ${ACCENT}` }}
              >
                {pdfItems.length} {pdfItems.length === 1 ? "document" : "documents"}
              </span>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search PDFs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-500 outline-none transition-all"
            style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
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

        {/* PDF sections */}
        {!isLoading && (
          <div className="space-y-4">
            {subSections.length > 0 ? (
              <>
                {subSections.map(([name, sItems]) => (
                  <PdfSubSection key={name} sectionName={name} items={sItems} onOpen={handleOpenPdf} defaultOpen={false} />
                ))}
                {unsectioned.length > 0 && (
                  <PdfSubSection sectionName="General" items={unsectioned} onOpen={handleOpenPdf} />
                )}
              </>
            ) : (
              filteredPdfItems.length === 0 ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
                  <FileText size={14} style={{ color: ACCENT, opacity: 0.4 }} />
                  <p className="text-xs text-white">No PDFs yet. Please check back soon!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPdfItems.map(g => <PdfRow key={g.id} guide={g} onOpen={handleOpenPdf} />)}
                </div>
              )
            )}
          </div>
        )}

        {/* Empty search state */}
        {!isLoading && search && filteredPdfItems.length === 0 && pdfItems.length > 0 && (
          <div className="text-center py-16">
            <Search size={40} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No results for &quot;{search}&quot;</h3>
            <p className="text-white text-sm">Try a different search term.</p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
