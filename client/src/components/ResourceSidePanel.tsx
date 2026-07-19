/**
 * ResourceSidePanel
 *
 * Unified right-side slide-in panel for the WAVV Resource Hub.
 * Handles three content types: Help Articles (native HTML), PDFs (iframe), FAQs (Q+A).
 *
 * Push mode (default):
 *   Renders as a flex sibling inside PortalLayout's body row — the main content
 *   shifts left when the panel opens. No backdrop, no overlay. Closes only via X.
 *   Includes a drag handle on the left edge to resize the panel width.
 *   Pass as rightPanel prop to PortalLayout:
 *     <PortalLayout rightPanel={<ResourceSidePanel item={panelItem} onClose={...} />}>
 *
 * Overlay mode (pushMode={false}):
 *   Fixed-position overlay with backdrop blur (legacy behavior).
 *
 * PanelItem types:
 *   { type: "article", title, nativeBody }          — native help article
 *   { type: "pdf",     title, url }                 — PDF iframe viewer (download blocked)
 *   { type: "faq",     sectionName, entries }       — FAQ section with Q+A rows
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { X, FileText, HelpCircle, BookOpen, ExternalLink, ChevronDown, ChevronRight, GripVertical } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FaqPanelEntry = {
  id: number;
  question: string;
  answer: string;
  fileUrl?: string | null;
  fileName?: string | null;
};

export type PanelItem =
  | { type: "article"; title: string; nativeBody: string; fileUrl?: string | null; articleUrl?: string | null }
  | { type: "pdf";     title: string; url: string }
  | { type: "faq";     sectionName: string; entries: FaqPanelEntry[]; sectionUrl?: string | null };

// ─── Constants ────────────────────────────────────────────────────────────────
const ARTICLE_COLOR = "#0074F4";
const PDF_COLOR     = "#00A9E2";
const FAQ_COLOR     = "#67C728";

const DEFAULT_WIDTH = 520;
const MIN_WIDTH     = 360;
const MAX_WIDTH     = 900;

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

function ArticleContent({ title, nativeBody, fileUrl, articleUrl }: { title: string; nativeBody: string; fileUrl?: string | null; articleUrl?: string | null }) {
  // If nativeBody contains no HTML tags (plain text from the textarea), wrap each
  // non-empty line in a <p> so the native-article-body CSS can style it correctly.
  const isHtml = /<[a-z][\s\S]*>/i.test(nativeBody);
  const renderedBody = isHtml
    ? nativeBody
    : nativeBody
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${line}</p>`)
        .join("") || `<p>${nativeBody}</p>`;
  const openUrl = fileUrl ?? articleUrl ?? null;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ARTICLE_COLOR}18` }}>
            <BookOpen size={14} style={{ color: ARTICLE_COLOR }} />
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${ARTICLE_COLOR}15`, color: ARTICLE_COLOR }}>
            Help Article
          </span>
        </div>
        {openUrl && (
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: `${ARTICLE_COLOR}12`, color: ARTICLE_COLOR, border: `1px solid ${ARTICLE_COLOR}25` }}
          >
            <ExternalLink size={11} />
            Open in tab
          </a>
        )}
      </div>
      <h2 className="text-lg font-bold text-white leading-snug mb-5 flex-shrink-0">{title}</h2>
      <div className="h-px mb-5 flex-shrink-0" style={{ background: `${ARTICLE_COLOR}20` }} />
      {fileUrl ? (
        <iframe
          src={fileUrl.includes("#") ? fileUrl : `${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          title={title}
          className="flex-1 w-full rounded-xl"
          style={{ border: "none", background: "#fff", minHeight: 0 }}
        />
      ) : (
        <div
          className="flex-1 overflow-y-auto pr-1 native-article-body"
          dangerouslySetInnerHTML={{ __html: renderedBody }}
        />
      )}
    </div>
  );
}

/**
 * PdfContent — renders the PDF in a sandboxed iframe.
 *
 * Download blocking strategy:
 *   The browser's native PDF viewer toolbar (download, print, save) is rendered
 *   by the browser's PDF plugin, not by our page — so CSS cannot hide it.
 *   The most reliable cross-browser approach is to proxy the PDF through a
 *   blob URL so the browser loses the original filename/URL, and to use the
 *   `#toolbar=0` fragment hint (Chrome PDF viewer respects this).
 *   We also omit the `allow="downloads"` permission on the iframe.
 *
 *   Note: a determined user can still open DevTools and find the URL. This is
 *   a UX-level friction measure, not DRM.
 */
function PdfContent({ title, url }: { title: string; url: string }) {
  // Append #toolbar=0 to suppress Chrome's built-in PDF toolbar (download/print buttons).
  // This works for PDFs served directly and for most storage-proxied URLs.
  const viewerUrl = url.includes("#") ? url : `${url}#toolbar=0&navpanes=0&scrollbar=1`;

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
      {/*
        #toolbar=0 suppresses Chrome's built-in PDF toolbar (download/print buttons).
        We intentionally omit the sandbox attribute — sandboxing an iframe that loads
        a cross-origin storage URL causes Chrome to block the PDF plugin entirely
        ("This page has been blocked by Chrome"). The toolbar fragment is sufficient
        friction for the vast majority of users.
      */}
      <iframe
        src={viewerUrl}
        title={title}
        className="flex-1 w-full rounded-xl"
        style={{ border: "none", background: "#fff", minHeight: 0 }}
      />
    </div>
  );
}

function FaqContent({ sectionName, entries, sectionUrl }: { sectionName: string; entries: FaqPanelEntry[]; sectionUrl?: string | null }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${FAQ_COLOR}18` }}>
            <HelpCircle size={14} style={{ color: FAQ_COLOR }} />
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${FAQ_COLOR}15`, color: FAQ_COLOR }}>
            FAQ
          </span>
        </div>
        {sectionUrl && (
          <a
            href={sectionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: `${FAQ_COLOR}12`, color: FAQ_COLOR, border: `1px solid ${FAQ_COLOR}25` }}
          >
            <ExternalLink size={11} />
            Open in tab
          </a>
        )}
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
      {item.type === "article" && <ArticleContent title={item.title} nativeBody={item.nativeBody} fileUrl={item.fileUrl} articleUrl={item.articleUrl} />}
      {item.type === "pdf"     && <PdfContent title={item.title} url={item.url} />}
      {item.type === "faq"     && <FaqContent sectionName={item.sectionName} entries={item.entries} sectionUrl={item.sectionUrl} />}
    </div>
  );
}

// ─── Drag handle ─────────────────────────────────────────────────────────────

function DragHandle({
  onMouseDown,
  accentColor,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  accentColor: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Drag to resize panel"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "12px",
        cursor: "col-resize",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        transition: "background 0.15s ease",
        background: hovered ? `${accentColor}18` : "transparent",
      }}
    >
      <GripVertical
        size={14}
        style={{
          color: hovered ? accentColor : "rgba(255,255,255,0.15)",
          transition: "color 0.15s ease",
          flexShrink: 0,
        }}
      />
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
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const accentColor =
    item?.type === "article" ? ARTICLE_COLOR :
    item?.type === "pdf"     ? PDF_COLOR :
    FAQ_COLOR;

  // Reset width when panel closes
  useEffect(() => {
    if (!isOpen) setPanelWidth(DEFAULT_WIDTH);
  }, [isOpen]);

  // Mouse drag resize logic
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const panelRight = panelRef.current.getBoundingClientRect().right;
      const newWidth = panelRight - e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // ── Push mode: flex sibling, no overlay ──────────────────────────────────────
  if (pushMode) {
    return (
      <div
        ref={panelRef}
        className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          position: "relative",
          // Animate width from 0 → panelWidth; content stays at full width inside
          width: isOpen ? `${panelWidth}px` : "0px",
          minWidth: 0,
          transition: isResizing ? "none" : "width 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
          background: "#0d1117",
          borderLeft: isOpen ? `1px solid ${accentColor}30` : "none",
        }}
      >
        {/* Drag handle — only visible when open */}
        {isOpen && (
          <DragHandle onMouseDown={handleMouseDown} accentColor={accentColor} />
        )}

        {/* Inner wrapper: always panelWidth wide so content doesn't squash during animation */}
        <div
          className="flex flex-col h-full"
          style={{
            width: `${panelWidth}px`,
            minWidth: `${panelWidth}px`,
            opacity: isOpen ? 1 : 0,
            transition: isResizing ? "none" : "opacity 0.18s ease",
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
        ref={panelRef}
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          position: "relative",
          width: isOpen ? `min(${panelWidth}px, 92vw)` : "min(520px, 92vw)",
          background: "#0d1117",
          borderLeft: `1px solid ${isOpen ? accentColor + "30" : "#1e2030"}`,
          boxShadow: isOpen ? `-24px 0 80px rgba(0,0,0,0.6)` : "none",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: isResizing
            ? "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.32s ease, box-shadow 0.32s ease"
            : "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), width 0s, border-color 0.32s ease, box-shadow 0.32s ease",
        }}
      >
        {isOpen && <DragHandle onMouseDown={handleMouseDown} accentColor={accentColor} />}
        <PanelHeader onClose={onClose} />
        <PanelBody item={item} />
      </div>
    </>
  );
}
