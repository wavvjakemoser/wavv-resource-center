import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { ChevronLeft, Search, MessageCircle, HelpCircle, ChevronDown, ChevronRight, ExternalLink, FileText } from "lucide-react";
import ResourceSidePanel, { PanelItem, FaqPanelEntry } from "@/components/ResourceSidePanel";

const ACCENT = "#67C728";

// ─── Types ────────────────────────────────────────────────────────────────────
type FaqEntry = { id: number; question: string; answer: string; isVisible: boolean; sortOrder: number; fileUrl?: string | null; fileName?: string | null };
type FaqSectionType = { id: number; name: string; isVisible: boolean; sortOrder: number; sectionUrl?: string | null; entries: FaqEntry[] };

// ─── FAQ Sub-Section ──────────────────────────────────────────────────────────
function FaqSubSection({
  section,
  search,
  onOpenPanel,
  defaultOpen,
}: {
  section: FaqSectionType;
  search: string;
  onOpenPanel: (s: FaqSectionType) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const filteredEntries = section.entries.filter(e =>
    e.isVisible && (
      !search ||
      e.question.toLowerCase().includes(search.toLowerCase()) ||
      e.answer.toLowerCase().includes(search.toLowerCase())
    )
  );

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
          <HelpCircle size={14} style={{ color: ACCENT }} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <span className="text-sm font-bold text-white">{section.name}</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${ACCENT}15`, color: ACCENT }}
        >
          {filteredEntries.length}
        </span>
        {open
          ? <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
          : <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />}
      </button>

      <div className="mb-3 h-px" style={{ background: `${ACCENT}25` }} />

      {open && (
        filteredEntries.length === 0 ? (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <HelpCircle size={14} style={{ color: ACCENT, opacity: 0.4 }} />
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
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${ACCENT}50`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#252d3d"; }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${ACCENT}18` }}
                >
                  <HelpCircle size={15} style={{ color: ACCENT }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-snug truncate">{entry.question}</p>
                </div>
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all opacity-0 group-hover:opacity-100"
                  style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}35` }}
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResourceFaqs() {
  const [search, setSearch] = useState("");
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);

  const { data: faqSections = [], isLoading } = trpc.faq.listSectionsPublic.useQuery();
  const sections = (faqSections as FaqSectionType[]).filter(s => s.isVisible);
  const totalEntries = sections.reduce((acc, s) => acc + s.entries.filter(e => e.isVisible).length, 0);

  const filteredSections = sections.filter(s =>
    !search || s.entries.some(e =>
      e.isVisible && (
        e.question.toLowerCase().includes(search.toLowerCase()) ||
        e.answer.toLowerCase().includes(search.toLowerCase())
      )
    )
  );

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

  const sidePanel = (
    <ResourceSidePanel item={panelItem} onClose={() => setPanelItem(null)} pushMode={true} />
  );

  return (
    <PortalLayout title="WAVV Resource Hub — FAQs" rightPanel={sidePanel}>
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
              <pattern id="circuit-faqs" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={ACCENT} strokeWidth="0.8" fill="none"/>
                <circle cx="10" cy="10" r="2" fill={ACCENT}/>
                <circle cx="50" cy="10" r="2" fill={ACCENT}/>
                <circle cx="50" cy="50" r="2" fill={ACCENT}/>
                <circle cx="30" cy="30" r="1.5" fill={ACCENT}/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-faqs)"/>
          </svg>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(/manus-storage/final-resource-chat_164bafd5.png)`,
              backgroundSize: "auto 100%",
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
            <h1 className="text-2xl font-extrabold text-white leading-tight">FAQs</h1>
            <p className="text-sm text-gray-300 mb-2">Quick answers to the most common questions about WAVV.</p>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: `${ACCENT}35`, color: ACCENT, border: `1px solid ${ACCENT}` }}
              >
                {sections.length} {sections.length === 1 ? "section" : "sections"}
              </span>
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.15)", color: "#f3f4f6", border: "1px solid rgba(255,255,255,0.35)" }}
              >
                {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
              </span>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search FAQs..."
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 w-28 rounded animate-pulse" style={{ background: "#1d2230" }} />
                <div className="h-px" style={{ background: "#2a2a2a" }} />
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="h-12 rounded-lg animate-pulse" style={{ background: "#1d2230" }} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* FAQ sections */}
        {!isLoading && (
          <div className="space-y-6">
            {filteredSections.length === 0 ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
                <HelpCircle size={14} style={{ color: ACCENT, opacity: 0.4 }} />
                <p className="text-xs text-white">{search ? `No results for "${search}"` : "No FAQs yet. Please check back soon!"}</p>
              </div>
            ) : (
              filteredSections.map(section => (
                <FaqSubSection
                  key={section.id}
                  section={section}
                  search={search}
                  onOpenPanel={handleOpenFaqSection}
                  defaultOpen={false}
                />
              ))
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
