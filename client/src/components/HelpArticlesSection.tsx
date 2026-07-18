/**
 * HelpArticlesSection
 *
 * Renders PUBLISHED help articles on the customer-facing Resource Hub page.
 * Articles are sourced from the published_help_articles table — only articles
 * that a content admin has explicitly published appear here.
 *
 * Grouped by sectionName (e.g. "Dialer Settings", "Call Boards"),
 * each section is collapsible.
 *
 * Behavior:
 * - Native articles (source='native'): open inline in a modal with rendered HTML
 * - Intercom articles (source='intercom'): open url in a new tab (existing behavior)
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { HelpCircle, ExternalLink, ChevronDown, ChevronRight, Search, X, ArrowLeft } from "lucide-react";

const ACCENT = "#8B5CF6";

// ─── Inline Article Modal ─────────────────────────────────────────────────────

function NativeArticleModal({
  article,
  onClose,
}: {
  article: { title: string; nativeBody: string; fileUrl?: string | null };
  onClose: () => void;
}) {
  const isHtml = /<[a-z][\s\S]*>/i.test(article.nativeBody);
  const renderedBody = isHtml
    ? article.nativeBody
    : article.nativeBody.split(/\n/).map(l => l.trim()).filter(l => l.length > 0).map(l => `<p>${l}</p>`).join("") || `<p>${article.nativeBody}</p>`;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl flex flex-col"
        style={{ background: "#1d2230", border: "1px solid #2a2a2a", maxHeight: "85vh" }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center gap-3 px-6 py-4 flex-shrink-0"
          style={{ background: "#1d2230", borderBottom: "1px solid #2a2a2a", zIndex: 1 }}
        >
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{article.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {article.fileUrl ? (
          <iframe
            src={`${article.fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="flex-1 w-full rounded-b-2xl"
            style={{ minHeight: "60vh", border: "none" }}
            title={article.title}
          />
        ) : (
          <div className="px-6 py-5 overflow-auto flex-1">
            <div
              className="native-article-body"
              dangerouslySetInnerHTML={{ __html: renderedBody }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Article Row ──────────────────────────────────────────────────────────────

function ArticleRow({
  article,
  onOpenNative,
}: {
  article: { id: number; intercomArticleId: string | null; title: string; url: string | null; nativeBody?: string | null; intercomUrl?: string | null };
  onOpenNative: (article: { title: string; nativeBody: string; fileUrl?: string | null; articleUrl?: string | null }) => void;
}) {
  // Distinguish file-backed (storage/PDF) URLs from Intercom Help Center URLs.
  // Intercom article URLs contain 'intercom' in the domain — treat them as
  // articleUrl ("Open in tab" link) rather than fileUrl (PDF iframe).
  const isIntercomUrl = !!(article.url && article.url.includes('intercom'));
  const hasFile = !!(article.url && article.url.trim() && !isIntercomUrl);
  const hasBody = !!(article.nativeBody && article.nativeBody.trim() && article.nativeBody !== "<p></p>");
  // Open in panel when: has a rendered body, is a file, or is an Intercom article with a URL
  const isNative = hasFile || hasBody || isIntercomUrl;

  if (isNative) {
    return (
        <button
        type="button"
        onClick={() => onOpenNative({
          title: article.title,
          nativeBody: article.nativeBody ?? " ",
          fileUrl: hasFile ? (article.url ?? null) : null,
          articleUrl: isIntercomUrl ? (article.url ?? null) : (article.intercomUrl ?? null),
        })}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left group"
        style={{ background: "transparent", border: "1px solid transparent" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#1d2230";
          (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT}30`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.borderColor = "transparent";
        }}
      >
        {/* Dot indicator */}
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: `${ACCENT}60` }}
        />

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-200 leading-snug truncate group-hover:text-white transition-colors">
            {article.title}
          </p>
        </div>

        {/* Read cue — appears on hover */}
        <span
          className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: ACCENT }}
        >
          Read
        </span>
      </button>
    );
  }

  return (
    <a
      href={article.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left group"
      style={{ background: "transparent", border: "1px solid transparent", textDecoration: "none" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#1d2230";
        (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.borderColor = "transparent";
      }}
    >
      {/* Dot indicator */}
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: `${ACCENT}60` }}
      />

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 leading-snug truncate group-hover:text-white transition-colors">
          {article.title}
        </p>
      </div>

      {/* Read link — appears on hover */}
      <span
        className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: ACCENT }}
      >
        <ExternalLink size={10} /> Read
      </span>
    </a>
  );
}

// ─── Section Group ────────────────────────────────────────────────────────────

function SectionGroup({
  name,
  articles,
  onOpenNative,
}: {
  name: string;
  articles: Array<{ id: number; intercomArticleId: string | null; title: string; url: string | null; nativeBody?: string | null; intercomUrl?: string | null }>;
  onOpenNative: (article: { title: string; nativeBody: string; fileUrl?: string | null; articleUrl?: string | null }) => void;
}) {
  const [open, setOpen] = useState(false);

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
          <span className="text-sm font-bold text-white">{name}</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${ACCENT}15`, color: ACCENT }}
        >
          {articles.length}
        </span>
        {open
          ? <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
          : <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />}
      </button>

      <div className="mb-3 h-px" style={{ background: `${ACCENT}25` }} />

      {open && (
        articles.length === 0 ? (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <HelpCircle size={14} style={{ color: ACCENT, opacity: 0.4 }} />
            <p className="text-xs text-gray-500">Help articles coming soon.</p>
          </div>
        ) : (
          <div className="space-y-0.5 mb-2">
            {articles.map((a) => (
              <ArticleRow key={a.intercomArticleId ?? a.id} article={a} onOpenNative={onOpenNative} />
            ))}
          </div>
        )
      )}
    </section>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HelpArticlesSection({ search, onOpenArticle }: { search: string; onOpenArticle?: (article: { title: string; nativeBody: string; fileUrl?: string | null; articleUrl?: string | null }) => void }) {
  // Use visible sections as source of truth — show sections even if no articles yet
  const { data: sections = [], isLoading: sectionsLoading } = trpc.helpArticles.listSections.useQuery();
  const { data: published = [], isLoading: articlesLoading } = trpc.helpArticles.listPublished.useQuery();
  const isLoading = sectionsLoading || articlesLoading;

  // Inline native article modal state — only used when onOpenArticle prop is not provided
  const [openArticle, setOpenArticle] = useState<{ title: string; nativeBody: string; fileUrl?: string | null; articleUrl?: string | null } | null>(null);
  const handleOpenNative = (article: { title: string; nativeBody: string; fileUrl?: string | null; articleUrl?: string | null }) => {
    if (onOpenArticle) onOpenArticle(article);
    else setOpenArticle(article);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-lg animate-pulse" style={{ background: "#1d2230" }} />
          <div className="h-4 w-32 rounded animate-pulse" style={{ background: "#1d2230" }} />
        </div>
        <div className="h-px" style={{ background: "#2a2a2a" }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "#1d2230" }} />
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
      >
        <HelpCircle size={14} style={{ color: ACCENT, opacity: 0.4 }} />
        <p className="text-xs text-gray-500">Help articles are being curated. Please check back shortly.</p>
      </div>
    );
  }

  // Build article map keyed by section name, filtered by search
  const bySection = sections.reduce((acc, sec) => {
    const articles = published
      .filter(a => a.sectionName === sec.name)
      .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.sortOrder - b.sortOrder);
    acc[sec.name] = articles;
    return acc;
  }, {} as Record<string, typeof published>);

  const totalFiltered = Object.values(bySection).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <>
      {/* Section header — gradient bar style matching "What is WAVV?" */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-1 rounded-full flex-shrink-0"
          style={{
            height: "28px",
            background: `linear-gradient(to bottom, ${ACCENT}, #6366f1)`,
            boxShadow: `0 0 8px ${ACCENT}60`,
          }}
        />
        <span className="text-base font-bold text-white">Help Articles</span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${ACCENT}15`, color: ACCENT }}
        >
          {totalFiltered}
        </span>
      </div>
      {/* Sections — always shown, even if empty */}
      <div className="space-y-6 pl-2">
        {sections.map((sec) => (
          <SectionGroup
            key={sec.id}
            name={sec.name}
            articles={bySection[sec.name] ?? []}
            onOpenNative={handleOpenNative}
          />
        ))}
      </div>
      {/* No search results */}
      {search && totalFiltered === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg mt-2"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
          <Search size={14} style={{ color: ACCENT, opacity: 0.4 }} />
          <p className="text-xs text-gray-500">No help articles match "{search}".</p>
        </div>
      )}

      {/* Inline native article modal */}
      {openArticle && (
        <NativeArticleModal
          article={openArticle}
          onClose={() => setOpenArticle(null)}
        />
      )}
    </>
  );
}
