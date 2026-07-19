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

// ─── Category tile definitions ───────────────────────────────────────────────
const RESOURCE_CATEGORIES = [
  {
    key: "help_article",
    label: "Help Articles",
    subtitle: "Step-by-step guides and reference documentation for every WAVV feature.",
    color: ARTICLE_COLOR,
    thumbnail: "/manus-storage/resourcehub-magnifying-glass_e84b4f50.png",
  },
  {
    key: "pdf",
    label: "PDFs",
    subtitle: "Downloadable playbooks, checklists, and quick-reference documents.",
    color: PDF_COLOR,
    thumbnail: "/manus-storage/resourcehub-clipboard_62327747.png",
  },
  {
    key: "faq",
    label: "FAQs",
    subtitle: "Quick answers to the most common questions about WAVV.",
    color: FAQ_COLOR,
    thumbnail: "/manus-storage/resourcehub-chat-bubble_b2ba88c7.png",
  },
];

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
          <p className="text-xs text-white truncate mt-0.5">{guide.description}</p>
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
              <p className="text-xs text-white">No PDFs yet. Please check back soon!</p>
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
  const [open, setOpen] = useState(false);
  const filteredEntries = section.entries.filter(e =>
    !search ||
    e.question.toLowerCase().includes(search.toLowerCase()) ||
    e.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section>
      {/* Collapsible header — matches PdfSubSection / SectionGroup pattern */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 mb-3 group"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${FAQ_COLOR}18` }}
        >
          <HelpCircle size={14} style={{ color: FAQ_COLOR }} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <span className="text-sm font-bold text-white">{section.name}</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${FAQ_COLOR}15`, color: FAQ_COLOR }}
        >
          {filteredEntries.length}
        </span>
        {open
          ? <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
          : <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />}
      </button>

      <div className="mb-3 h-px" style={{ background: `${FAQ_COLOR}25` }} />

      {open && (
        filteredEntries.length === 0 ? (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <HelpCircle size={14} style={{ color: FAQ_COLOR, opacity: 0.4 }} />
            <p className="text-xs text-white">No FAQs in this section yet.</p>
          </div>
        ) : (
          <div className="space-y-2 mb-2">
            {filteredEntries.map(entry => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onOpenPanel(section)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all group text-left"
                style={{ background: "#1d2230", border: "1px solid #252d3d" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${FAQ_COLOR}50`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#252d3d"; }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${FAQ_COLOR}18` }}
                >
                  <HelpCircle size={15} style={{ color: FAQ_COLOR }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-snug truncate">{entry.question}</p>
                </div>
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all opacity-0 group-hover:opacity-100"
                  style={{ background: `${FAQ_COLOR}18`, color: FAQ_COLOR, border: `1px solid ${FAQ_COLOR}35` }}
                >
                  <ExternalLink size={11} />
                  Open
                </span>
              </button>
            ))}
          </div>
        )
      )}
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
      <div className="space-y-6 pl-2">
        {filteredSections.map(section => (
          <FaqSubSection key={section.id} section={section} search={search} onOpenPanel={onOpenPanel} />
        ))}
      </div>
    </section>
  );
}

// ─── Category Tile Banner ─────────────────────────────────────────────────────
function CategoryTile({
  cat,
  count,
  isActive,
  onClick,
}: {
  cat: typeof RESOURCE_CATEGORIES[number];
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl block cursor-pointer transition-all duration-200 hover:scale-[1.01] w-full text-left"
      style={{
        border: isActive ? `2px solid ${cat.color}` : `1px solid ${cat.color}60`,
        height: "200px",
        boxShadow: isActive
          ? `0 0 0 1px ${cat.color}40, 0 4px 32px ${cat.color}30`
          : `0 0 0 1px ${cat.color}20, 0 4px 32px ${cat.color}18`,
      }}
    >
      {/* Deep space black base */}
      <div className="absolute inset-0" style={{ background: "#000" }} />

      {/* Circuit board SVG pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`circuit-rh-${cat.key}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={cat.color} strokeWidth="0.8" fill="none"/>
            <circle cx="10" cy="10" r="2" fill={cat.color}/>
            <circle cx="50" cy="10" r="2" fill={cat.color}/>
            <circle cx="50" cy="50" r="2" fill={cat.color}/>
            <circle cx="30" cy="30" r="1.5" fill={cat.color}/>
            <path d="M0 30 L10 30 M60 50 L50 50" stroke={cat.color} strokeWidth="0.6" fill="none"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#circuit-rh-${cat.key})`}/>
      </svg>

      {/* Full-width radial color glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 120% 100% at 70% 50%, ${cat.color}28 0%, ${cat.color}10 45%, transparent 75%)`,
        }}
      />

      {/* Neon scan line */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${cat.color}06 0%, ${cat.color}12 50%, ${cat.color}06 100%)`,
        }}
      />

      {/* Top edge neon line */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: "1px", background: `linear-gradient(to right, transparent 0%, ${cat.color}60 30%, ${cat.color}90 60%, transparent 100%)` }}
      />

      {/* Full-bleed thumbnail */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${cat.thumbnail})`,
          backgroundSize: "100% auto",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          opacity: 0.85,
        }}
      />

      {/* Dark gradient overlay — left side for text legibility */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)" }}
      />

      {/* Hover neon border pulse */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: `inset 0 0 0 1px ${cat.color}80, 0 0 24px ${cat.color}30` }}
      />

      {/* Content overlay */}
      <div className="relative flex flex-col justify-center h-full px-6 py-5 gap-1">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: cat.color }}>
          WAVV Resource Hub
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-1">
          {cat.label}
        </h2>
        <p className="text-sm text-white mb-2 max-w-md">{cat.subtitle}</p>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full"
            style={{ background: `${cat.color}35`, color: cat.color, border: `1px solid ${cat.color}` }}
          >
            {count} {count === 1 ? "item" : "items"}
          </span>
          {isActive && (
            <span
              className="text-[11px] font-bold px-3 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)", color: "#f3f4f6", border: "1px solid rgba(255,255,255,0.35)" }}
            >
              Viewing
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GuidesAndDocs() {
  const { user } = useAuth();
  const _firstName = user?.name?.split(" ")[0] ?? null;
  const [search, setSearch] = useState("");
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: guides, isLoading } = trpc.guides.list.useQuery();
  const { data: pdfSectionsRaw } = trpc.guides.listPdfSectionsPublic.useQuery();
  const dbPdfSections: DbSection[] = (pdfSectionsRaw as DbSection[] | undefined) ?? [];
  const { data: faqSections = [] } = trpc.faq.listSectionsPublic.useQuery();
  const { data: guideVisRaw } = trpc.siteSettings.get.useQuery({ key: "guides_sections_visibility" });
  const guideVisibility: Record<string, boolean> = (guideVisRaw as Record<string, boolean> | null) ?? { help_article: true, pdf: true, faq: true };
  const trackAnon = trpc.analytics.trackAnon.useMutation({ onError: () => {} });

  // Count items per category
  const { data: helpArticles = [] } = trpc.helpArticles.listPublished.useQuery();
  const pdfItems: GuideItem[] = (guides ?? []).filter(g => (g.fileType ?? "pdf") === "pdf");
  const faqCount = (faqSections as FaqSectionType[]).filter(s => s.isVisible).reduce((acc, s) => acc + s.entries.filter(e => e.isVisible).length, 0);

  const categoryCounts: Record<string, number> = {
    help_article: helpArticles.length,
    pdf: pdfItems.length,
    faq: faqCount,
  };

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

  // Filter PDFs by search
  const filteredPdfItems: GuideItem[] = pdfItems.filter(g => {
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

  const handleTileClick = (key: string) => {
    setActiveCategory(prev => prev === key ? null : key);
  };

  return (
    <PortalLayout title="WAVV Resource Hub" rightPanel={sidePanel}>
      <div className="px-4 lg:px-8 py-6 space-y-8">
        {/* Spacer for consistent vertical alignment */}
        <div style={{ minHeight: "32px" }} />

        {/* Hero */}
        <div className="px-4 sm:px-6 lg:px-16 py-8 sm:py-12 text-center">
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
            <p className="mx-auto leading-relaxed" style={{ color: "#ffffff", fontSize: "clamp(0.88rem, 1.6vw, 1rem)", maxWidth: "560px" }}>
              Help articles, PDFs, and FAQs organized by topic.
            </p>
        </div>{/* end hero */}

        {/* ── Category Tile Banners ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RESOURCE_CATEGORIES.map(cat => (
            guideVisibility[cat.key] !== false && (
              <CategoryTile
                key={cat.key}
                cat={cat}
                count={categoryCounts[cat.key] ?? 0}
                isActive={activeCategory === cat.key}
                onClick={() => handleTileClick(cat.key)}
              />
            )
          ))}
        </div>

        {/* ── Search bar (shown when a category is active) ── */}
        {activeCategory && (
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-500 outline-none transition-all"
              style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#67C728"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
            />
          </div>
        )}

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

        {/* ── Content sections — shown based on active category ── */}

        {/* Help Articles */}
        {(activeCategory === "help_article" || activeCategory === null) && guideVisibility["help_article"] !== false && (
          <div style={{ display: activeCategory === null ? "none" : undefined }}>
            <HelpArticlesSection search={search} onOpenArticle={handleOpenArticle} />
          </div>
        )}

        {/* PDFs */}
        {(activeCategory === "pdf" || activeCategory === null) && !isLoading && guideVisibility["pdf"] !== false && (
          <div style={{ display: activeCategory === null ? "none" : undefined }}>
            <PdfSection
              items={filteredPdfItems}
              dbSections={dbPdfSections}
              onOpen={handleOpenPdf}
            />
          </div>
        )}

        {/* FAQs */}
        {(activeCategory === "faq" || activeCategory === null) && guideVisibility["faq"] !== false && (faqSections as FaqSectionType[]).length > 0 && (
          <div style={{ display: activeCategory === null ? "none" : undefined }}>
            <FaqSection sections={faqSections as FaqSectionType[]} search={search} onOpenPanel={handleOpenFaqSection} />
          </div>
        )}

        {/* Empty state for search */}
        {activeCategory && !isLoading && search && (
          (() => {
            let hasResults = false;
            if (activeCategory === "help_article") hasResults = helpArticles.some(a => a.title.toLowerCase().includes(search.toLowerCase()));
            if (activeCategory === "pdf") hasResults = filteredPdfItems.length > 0;
            if (activeCategory === "faq") hasResults = (faqSections as FaqSectionType[]).some(s => s.entries.some(e => e.question.toLowerCase().includes(search.toLowerCase()) || e.answer.toLowerCase().includes(search.toLowerCase())));
            if (!hasResults) return (
              <div className="text-center py-16">
                <Search size={40} className="text-gray-700 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No results for &quot;{search}&quot;</h3>
                <p className="text-white text-sm">Try a different search term.</p>
              </div>
            );
            return null;
          })()
        )}
      </div>

      {/* Request a Resource */}
      <div className="px-4 lg:px-8 pb-10">
        <ContentRequestCTA requestType="guide" accentColor="#67C728" />
      </div>

    </PortalLayout>
  );
}
