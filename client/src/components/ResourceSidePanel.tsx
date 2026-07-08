/**
 * ResourceSidePanel
 *
 * Unified right-side slide-in panel for the WAVV Resource Hub.
 * Handles three content types: Help Articles (native HTML), PDFs (iframe), FAQs (Q+A).
 *
 * Push mode (default):
 *   Renders as a flex sibling inside PortalLayout's body row — the main content
 *   shifts left when the panel opens. No backdrop, no overlay. Closes only via X.
 *   Pass as rightPanel prop to PortalLayout:
 *     <PortalLayout rightPanel={<ResourceSidePanel item={panelItem} onClose={...} />}>
 *
 * Overlay mode (pushMode={false}):
 *   Fixed-position overlay with backdrop blur (legacy behavior).
 *
 * PanelItem types:
 *   { type: "article", title, nativeBody }          — native help article
 *   { type: "pdf",     title, url }                 — PDF iframe viewer
 *   { type: "faq",     sectionName, entries }       — FAQ section with Q+A rows
 */

import { useState } from "react";
import { X, FileText, HelpCircle, BookOpen, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FaqPanelEntry = {
  id: number;
  question: string;
  answer: string;
  fileUrl?: string | null;
  fileName?: string | null;
};

export type PanelItem =
  | { type: "article"; title: string; nativeBody: string }
  | { type: "pdf";     title: string; url: string }
  | { type: "faq";     sectionName: string; entries: FaqPanelEntry[] };

// ─── Color constants ──────────────────────────────────────────────────────────
const ARTICLE_COLOR = "#8B5CF6";
const PDF_COLOR     = "#ef4444";
const FAQ_COLOR     = "#eab308";

// ─── FAQ Entry row (inside the panel) ────────────────────────────────────────
function FaqPanelEntryRow({ entry }: { entry: FaqPanelEntry }) {
  const [open, setOpen] = useState(false);
  const hasFile = !!entry.fileUrl;

  if (!hasFile) {
    return (
      <div
        className="rounded-xl px-4 py-3 space-y-2"
        style={{ background: "#1a1f2e", border: "1px solid #252d3d" }}
      >
        <p className="text-sm font-semibold text-white leading-snug">{entry.question}</p>
        {entry.answer && entry.answer !== "See attached document" && (
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{entry.answer}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #252d3d" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
        style={{ background: open ? "#1d2230" : "#161b27" }}
      >
        <span className="flex-1 text-sm font-semibold text-white leading-snug">{entry.question}</span>
        {open
          ? <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
          : <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 py-3 space-y-3" style={{ background: "#1d2230", borderTop: "1px solid #252d3d" }}>
          {entry.answer && entry.answer !== "See attached document" && (
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{entry.answer}</p>
          )}
          {entry.fileUrl && (
            <a
              href={entry.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              style={{ background: `${FAQ_COLOR}12`, color: FAQ_COLOR, border: `1px solid ${FAQ_COLOR}25` }}
            >
              <ExternalLink size={11} />
              {entry.fileName ?? "View Document"}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Panel content renderers ──────────────────────────────────────────────────

function ArticleContent({ title, nativeBody }: { title: string; nativeBody: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ARTICLE_COLOR}18` }}>
          <BookOpen size={14} style={{ color: ARTICLE_COLOR }} />
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${ARTICLE_COLOR}15`, color: ARTICLE_COLOR }}>
          Help Article
        </span>
      </div>
      <h2 className="text-lg font-bold text-white leading-snug mb-5 flex-shrink-0">{title}</h2>
      <div className="h-px mb-5 flex-shrink-0" style={{ background: `${ARTICLE_COLOR}20` }} />
      <div
        className="flex-1 overflow-y-auto pr-1 native-article-body"
        dangerouslySetInnerHTML={{ __html: nativeBody }}
      />
    </div>
  );
}

function PdfContent({ title, url }: { title: string; url: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${PDF_COLOR}18` }}>
            <FileText size={14} style={{ color: PDF_COLOR }} />
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${PDF_COLOR}15`, color: PDF_COLOR }}>
            PDF
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: `${PDF_COLOR}12`, color: PDF_COLOR, border: `1px solid ${PDF_COLOR}25` }}
        >
          <ExternalLink size={11} />
          Open in tab
        </a>
      </div>
      <h2 className="text-lg font-bold text-white leading-snug mb-5 flex-shrink-0">{title}</h2>
      <div className="h-px mb-4 flex-shrink-0" style={{ background: `${PDF_COLOR}20` }} />
      <iframe
        src={url}
        title={title}
        className="flex-1 w-full rounded-xl"
        style={{ border: "none", background: "#fff", minHeight: 0 }}
      />
    </div>
  );
}

function FaqContent({ sectionName, entries }: { sectionName: string; entries: FaqPanelEntry[] }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${FAQ_COLOR}18` }}>
          <HelpCircle size={14} style={{ color: FAQ_COLOR }} />
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${FAQ_COLOR}15`, color: FAQ_COLOR }}>
          FAQ
        </span>
      </div>
      <h2 className="text-lg font-bold text-white leading-snug mb-2 flex-shrink-0">{sectionName}</h2>
      <p className="text-xs text-gray-500 mb-5 flex-shrink-0">
        {entries.length} question{entries.length !== 1 ? "s" : ""} in this section
      </p>
      <div className="h-px mb-5 flex-shrink-0" style={{ background: `${FAQ_COLOR}20` }} />
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {entries.length === 0 ? (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <HelpCircle size={14} style={{ color: FAQ_COLOR, opacity: 0.4 }} />
            <p className="text-xs text-gray-500">No FAQs in this section yet.</p>
          </div>
        ) : (
          entries.map(entry => <FaqPanelEntryRow key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}

// ─── Panel header (shared) ────────────────────────────────────────────────────

function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 flex-shrink-0"
      style={{ borderBottom: "1px solid #1e2030" }}
    >
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
        WAVV Resource Hub
      </span>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
        style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
          (e.currentTarget as HTMLElement).style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
          (e.currentTarget as HTMLElement).style.color = "#9ca3af";
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

// ─── Panel body (shared) ──────────────────────────────────────────────────────

function PanelBody({ item }: { item: PanelItem | null }) {
  if (!item) return null;
  return (
    <div className="flex-1 overflow-hidden px-5 py-5">
      {item.type === "article" && <ArticleContent title={item.title} nativeBody={item.nativeBody} />}
      {item.type === "pdf"     && <PdfContent title={item.title} url={item.url} />}
      {item.type === "faq"     && <FaqContent sectionName={item.sectionName} entries={item.entries} />}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function ResourceSidePanel({
  item,
  onClose,
  pushMode = true,
}: {
  item: PanelItem | null;
  onClose: () => void;
  /**
   * Push mode (default: true): panel is a flex sibling that shifts main content left.
   * No backdrop, no overlay — closes only via X button.
   * Overlay mode (false): fixed-position overlay with backdrop blur.
   */
  pushMode?: boolean;
}) {
  const isOpen = !!item;

  const accentColor =
    item?.type === "article" ? ARTICLE_COLOR :
    item?.type === "pdf"     ? PDF_COLOR :
    FAQ_COLOR;

  // ── Push mode: flex sibling, no overlay ──────────────────────────────────────
  if (pushMode) {
    return (
      <div
        className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          // Animate width from 0 → 520px; content stays at full width inside
          width: isOpen ? "520px" : "0px",
          minWidth: 0,
          transition: "width 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
          background: "#0d1117",
          borderLeft: isOpen ? `1px solid ${accentColor}30` : "none",
        }}
      >
        {/* Inner wrapper: always 520px wide so content doesn't squash during animation */}
        <div
          className="flex flex-col h-full"
          style={{
            width: "520px",
            minWidth: "520px",
            opacity: isOpen ? 1 : 0,
            transition: "opacity 0.18s ease",
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          <PanelHeader onClose={onClose} />
          <PanelBody item={item} />
        </div>
      </div>
    );
  }

  // ── Overlay mode (legacy): fixed position with backdrop ──────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          background: isOpen ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
          pointerEvents: isOpen ? "auto" : "none",
          backdropFilter: isOpen ? "blur(2px)" : "none",
        }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "min(520px, 92vw)",
          background: "#0d1117",
          borderLeft: `1px solid ${isOpen ? accentColor + "30" : "#1e2030"}`,
          boxShadow: isOpen ? `-24px 0 80px rgba(0,0,0,0.6)` : "none",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.32s ease, box-shadow 0.32s ease",
        }}
      >
        <PanelHeader onClose={onClose} />
        <PanelBody item={item} />
      </div>
    </>
  );
}
