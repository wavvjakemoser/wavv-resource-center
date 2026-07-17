import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { FileText, ExternalLink, Search, ChevronDown, ChevronRight, HelpCircle, BookOpen } from "lucide-react";
import { ContentRequestCTA } from "./Academy";
import HelpArticlesSection from "@/components/HelpArticlesSection";
import ResourceSidePanel, { PanelItem, FaqPanelEntry } from "@/components/ResourceSidePanel";

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

// ─── Color constants ──────────────────────────────────────────────────────────
const PDF_COLOR     = "#ef4444";
const FAQ_COLOR     = "#eab308";
const ARTICLE_COLOR = "#8B5CF6";

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
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${PDF_COLOR}50`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#252d3d"; }}
      onClick={() => onOpen(guide)}
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

      {/* Open cue */}
      <span
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all opacity-0 group-hover:opacity-100"
        style={{ background: `${PDF_COLOR}18`, color: PDF_COLOR, border: `1px solid ${PDF_COLOR}35` }}
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
}: {
  sectionName: string;
  items: GuideItem[];
  onOpen: (guide: GuideItem) => void;
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
            {items.map((g) => (
              <PdfRow key={g.id} guide={g} onOpen={onOpen} />
            ))}
          </div>
        )
      )}
    </section>
  );
}

// ─── PDF Section (top-level, wraps sub-sections) ──────────────────────────────
function PdfSection({
  items,
  dbSections,
  onOpen,
}: {
  items: GuideItem[];
  dbSections: DbSection[];
  onOpen: (guide: GuideItem) => void;
}) {
  // Only hide the entire PDF block if there are no visible sections AND no items
  const visibleSections = dbSections.filter(s => s.isVisible);
  if (items.length === 0 && visibleSections.length === 0) return null;

  // Build sub-section map — always include every visible section (even empty ones)
  const sectionMap: Record<string, GuideItem[]> = {};
  const unsectioned: GuideItem[] = [];

  if (visibleSections.length > 0) {
    // Pre-populate every visible section so empty ones still render
    for (const sec of visibleSections) {
      sectionMap[sec.name] = [];
    }
    const allSectionedIds = new Set<number>();
    for (const sec of visibleSections) {
      const secItems = items.filter(g => g.category === sec.name);
      sectionMap[sec.name] = secItems;
      secItems.forEach(g => allSectionedIds.add(g.id));
    }
    items.forEach(g => { if (!allSectionedIds.has(g.id)) unsectioned.push(g); });
  } else {
    // Fall back to category grouping when no named sections exist
    for (const g of items) {
      const cat = g.category ?? "General";
      if (!sectionMap[cat]) sectionMap[cat] = [];
      sectionMap[cat].push(g);
    }
  }

  // Preserve the sort order from dbSections
  const subSections: [string, GuideItem[]][] = visibleSections.length > 0
    ? visibleSections.map(sec => [sec.name, sectionMap[sec.name] ?? []])
    : Object.entries(sectionMap);

  return (
    <section>
      {/* Section header */}
      <div className="w-full flex items-center gap-3 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${PDF_COLOR}18` }}>
          <FileText size={14} style={{ color: PDF_COLOR }} />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-white">PDFs</span>
          <span className="ml-2 text-xs text-gray-500">Reference guides and documents</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${PDF_COLOR}15`, color: PDF_COLOR }}>
          {items.length}
        </span>
      </div>
      <div className="mb-4 h-px" style={{ background: `${PDF_COLOR}25` }} />

      {subSections.length > 0 ? (
        <div className="space-y-4 pl-2">
          {subSections.map(([name, sItems]) => (
            <PdfSubSection key={name} sectionName={name} items={sItems} onOpen={onOpen} />
          ))}
          {unsectioned.length > 0 && (
            <PdfSubSection sectionName="General" items={unsectioned} onOpen={onOpen} />
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
              <FileText size={14} style={{ color: PDF_COLOR, opacity: 0.4 }} />
              <p className="text-xs text-gray-500">No PDFs yet. Please check back soon!</p>
            </div>
          ) : (
            items.map(g => <PdfRow key={g.id} guide={g} onOpen={onOpen} />)
          )}
        </div>
      )}
    </section>
  );
}

// ─── FAQ Entry row (inline accordion — kept for the list view) ────────────────
type FaqEntry = { id: number; question: string; answer: string; isVisible: boolean; sortOrder: number; fileUrl?: string | null; fileName?: string | null };
type FaqSectionType = { id: number; name: string; isVisible: boolean; sortOrder: number; sectionUrl?: string | null; entries: FaqEntry[] };

function FaqSubSection({ section, search, onOpenPanel }: { section: FaqSectionType; search: string; onOpenPanel: (s: FaqSectionType) => void }) {
  const filteredEntries = section.entries.filter(e =>
    !search ||
    e.question.toLowerCase().includes(search.toLowerCase()) ||
    e.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section>
      <button
        type="button"
        onClick={() => onOpenPanel(section)}
        className="w-full flex items-center gap-3 mb-3 group transition-all"
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${FAQ_COLOR}18` }}>
          <HelpCircle size={14} style={{ color: FAQ_COLOR }} />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors">{section.name}</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${FAQ_COLOR}15`, color: FAQ_COLOR }}>
          {filteredEntries.length}
        </span>
        <ChevronRight size={14} className="text-gray-500 flex-shrink-0 group-hover:text-yellow-400 transition-colors" />
      </button>
      <div className="mb-3 h-px" style={{ background: `${FAQ_COLOR}25` }} />
    </section>
  );
}

function FaqSection({ sections, search, onOpenPanel }: { sections: FaqSectionType[]; search: string; onOpenPanel: (s: FaqSectionType) => void }) {
  const visibleSections = sections.filter(s => s.isVisible);
  const filteredSections = visibleSections.filter(s =>
    !search || s.entries.some(e =>
      e.question.toLowerCase().includes(search.toLowerCase()) ||
      e.answer.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (filteredSections.length === 0) return null;

  return (
    <section>
      <div className="w-full flex items-center gap-3 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${FAQ_COLOR}18` }}>
          <HelpCircle size={14} style={{ color: FAQ_COLOR }} />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-white">FAQs</span>
          <span className="ml-2 text-xs text-gray-500">Frequently asked questions</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${FAQ_COLOR}15`, color: FAQ_COLOR }}>
          {filteredSections.reduce((acc, s) => acc + s.entries.filter(e => !search || e.question.toLowerCase().includes(search.toLowerCase()) || e.answer.toLowerCase().includes(search.toLowerCase())).length, 0)}
        </span>
      </div>
      <div className="mb-4 h-px" style={{ background: `${FAQ_COLOR}25` }} />
      <div className="space-y-1 pl-2">
        {filteredSections.map(section => (
          <FaqSubSection key={section.id} section={section} search={search} onOpenPanel={onOpenPanel} />
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GuidesAndDocs() {
  const { user } = useAuth();
  const _firstName = user?.name?.split(" ")[0] ?? null;
  const [search, setSearch] = useState("");
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);

  const { data: guides, isLoading } = trpc.guides.list.useQuery();
  const { data: pdfSectionsRaw } = trpc.guides.listPdfSectionsPublic.useQuery();
  const dbPdfSections: DbSection[] = (pdfSectionsRaw as DbSection[] | undefined) ?? [];
  const { data: faqSections = [] } = trpc.faq.listSectionsPublic.useQuery();
  const { data: guideVisRaw } = trpc.siteSettings.get.useQuery({ key: "guides_sections_visibility" });
  const guideVisibility: Record<string, boolean> = (guideVisRaw as Record<string, boolean> | null) ?? { help_article: true, pdf: true, faq: true };
  const trackAnon = trpc.analytics.trackAnon.useMutation({ onError: () => {} });

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

  const handleOpenFaqSection = (section: FaqSectionType) => {
    const entries: FaqPanelEntry[] = section.entries
      .filter(e => e.isVisible)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(e => ({
        id: e.id,
        question: e.question,
        answer: e.answer,
        fileUrl: e.fileUrl,
        fileName: e.fileName,
      }));
    setPanelItem({ type: "faq", sectionName: section.name, entries, sectionUrl: section.sectionUrl ?? null });
  };

  const handleOpenArticle = (article: { title: string; nativeBody: string; fileUrl?: string | null; articleUrl?: string | null }) => {
    setPanelItem({ type: "article", title: article.title, nativeBody: article.nativeBody, fileUrl: article.fileUrl ?? null, articleUrl: article.articleUrl ?? null });
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

  const sidePanel = (
    <ResourceSidePanel item={panelItem} onClose={() => setPanelItem(null)} pushMode={true} />
  );

  return (
    <PortalLayout title="WAVV Resource Hub" rightPanel={sidePanel}>
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Spacer for consistent vertical alignment */}
        <div style={{ minHeight: "32px" }} />

        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "radial-gradient(ellipse 100% 90% at 50% 0%, rgba(0,116,244,0.28) 0%, rgba(0,169,226,0.12) 40%, rgba(103,199,40,0.06) 70%, transparent 90%), #080c14",
            border: "1px solid rgba(0,116,244,0.18)",
            minHeight: "280px",
          }}
        >
          {/* Subtle grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,116,244,0.14), transparent 65%)", transform: "translate(25%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(103,199,40,0.08), transparent 65%)", transform: "translate(-25%, 30%)" }} />

          <div className="relative z-10 px-4 sm:px-6 lg:px-16 py-8 sm:py-12 text-center">
            {/* Headline */}
            <h1 className="font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}>
              <span style={{ background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #4ade80 70%, #22c55e 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                WAVV Resource Hub
              </span>
            </h1>

            {/* Accent line */}
            <div className="flex justify-center mb-5">
              <div style={{ width: "200px", height: "3px", borderRadius: "2px", background: "linear-gradient(to right, #0074F4, #00A9E2 50%, #67C728)" }} />
            </div>

            {/* Subline */}
            <p className="mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(0.88rem, 1.6vw, 1rem)", maxWidth: "560px" }}>
              Help articles, PDFs, and FAQs organized by topic.
            </p>

            {/* Content type badges */}
            <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
              {[
                { label: "Help Articles", color: ARTICLE_COLOR, icon: <BookOpen size={10} /> },
                { label: "PDFs",          color: PDF_COLOR,     icon: <FileText size={10} /> },
                { label: "FAQs",          color: FAQ_COLOR,     icon: <HelpCircle size={10} /> },
              ].map(({ label, color, icon }) => (
                <span key={label} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                  {icon}{label}
                </span>
              ))}
            </div>
          </div>
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

        {/* 1. Help Articles */}
        {guideVisibility["help_article"] !== false && (
          <div>
            <HelpArticlesSection search={search} onOpenArticle={handleOpenArticle} />
          </div>
        )}

        {/* 2. PDFs */}
        {!isLoading && guideVisibility["pdf"] !== false && (
          <PdfSection
            items={pdfItems}
            dbSections={dbPdfSections}
            onOpen={handleOpenPdf}
          />
        )}

        {/* 3. FAQs */}
        {guideVisibility["faq"] !== false && faqSections.length > 0 && (
          <FaqSection sections={faqSections as FaqSectionType[]} search={search} onOpenPanel={handleOpenFaqSection} />
        )}

        {/* Empty state */}
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

    </PortalLayout>
  );
}
