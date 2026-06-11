/**
 * HelpArticlesSection
 *
 * Renders synced Intercom Help Center articles inside the Guides & Docs page.
 * Articles are grouped by collection, displayed in the same row-based style
 * as other Guides & Docs sections. Clicking an article opens a detail modal.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { HelpCircle, ExternalLink, ChevronDown, ChevronRight, X, Search } from "lucide-react";

const ACCENT = "#8B5CF6";

// ─── Article Detail Modal ─────────────────────────────────────────────────────

function ArticleModal({
  article,
  onClose,
}: {
  article: { id: number; title: string; body?: string | null; url?: string | null; authorName?: string | null; intercomUpdatedAt?: number | null };
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl flex flex-col"
        style={{ background: "#111827", border: "1px solid #252d3d" }}
      >
        {/* Header */}
        <div
          className="flex items-start gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #252d3d" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${ACCENT}18` }}
          >
            <HelpCircle size={15} style={{ color: ACCENT }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-base leading-snug">{article.title}</h2>
            {article.authorName && (
              <p className="text-xs text-gray-500 mt-0.5">By {article.authorName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/10"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {article.body ? (
            <div
              className="prose prose-invert prose-sm max-w-none"
              style={{ color: "rgba(255,255,255,0.8)" }}
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          ) : (
            <p className="text-gray-500 text-sm">No content available.</p>
          )}
        </div>

        {/* Footer */}
        {article.url && (
          <div
            className="px-6 py-4 flex-shrink-0 flex items-center justify-between"
            style={{ borderTop: "1px solid #252d3d" }}
          >
            <p className="text-xs text-gray-500">
              {article.intercomUpdatedAt
                ? `Last updated ${new Date(article.intercomUpdatedAt * 1000).toLocaleDateString()}`
                : ""}
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}35` }}
            >
              <ExternalLink size={11} />
              View on Help Center
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Article Row ──────────────────────────────────────────────────────────────

function ArticleRow({
  article,
  onClick,
}: {
  article: { id: number; title: string; summary?: string | null; url?: string | null; intercomUpdatedAt?: number | null };
  onClick: () => void;
}) {
  const isNew = article.intercomUpdatedAt
    ? Date.now() / 1000 - article.intercomUpdatedAt < 14 * 24 * 60 * 60
    : false;

  return (
    <button
      type="button"
      onClick={onClick}
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
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <p className="text-sm text-gray-200 leading-snug truncate group-hover:text-white transition-colors">
          {article.title}
        </p>
        {isNew && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide uppercase flex-shrink-0"
            style={{ background: "rgba(74,222,128,0.2)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.4)" }}
          >
            New
          </span>
        )}
      </div>

      {/* Read link — appears on hover */}
      <span
        className="flex-shrink-0 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: ACCENT }}
      >
        Read →
      </span>
    </button>
  );
}

// ─── Collection Section ───────────────────────────────────────────────────────

function CollectionSection({
  name,
  description,
  articles,
  onArticleClick,
}: {
  name: string;
  description?: string | null;
  articles: Array<{ id: number; title: string; summary?: string | null; url?: string | null; intercomUpdatedAt?: number | null }>;
  onArticleClick: (id: number) => void;
}) {
  // Default collapsed — 19 collections × 175 articles would be overwhelming if all open
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
          {description && (
            <span className="ml-2 text-xs text-gray-500">{description}</span>
          )}
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
            <p className="text-xs text-gray-500">No articles in this collection yet.</p>
          </div>
        ) : (
          <div className="space-y-0.5 mb-2">
            {articles.map((a) => (
              <ArticleRow key={a.id} article={a} onClick={() => onArticleClick(a.id)} />
            ))}
          </div>
        )
      )}
    </section>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function HelpArticlesSection({ search }: { search: string }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: collections, isLoading: collectionsLoading } = trpc.helpArticles.listCollections.useQuery();
  const { data: articles, isLoading: articlesLoading } = trpc.helpArticles.list.useQuery({});
  const { data: selectedArticle } = trpc.helpArticles.getById.useQuery(
    { id: selectedId! },
    { enabled: selectedId !== null }
  );

  const isLoading = collectionsLoading || articlesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Section header skeleton */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-lg animate-pulse" style={{ background: "#1d2230" }} />
          <div className="h-4 w-32 rounded animate-pulse" style={{ background: "#1d2230" }} />
        </div>
        <div className="h-px" style={{ background: "#2a2a2a" }} />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "#1d2230" }} />
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
      >
        <HelpCircle size={14} style={{ color: ACCENT, opacity: 0.4 }} />
        <p className="text-xs text-gray-500">Help articles are syncing. Please check back shortly.</p>
      </div>
    );
  }

  // Filter by search
  const filtered = articles.filter(
    (a) =>
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.summary ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Build collection name+description map
  const collectionMap = new Map<string, { name: string; description?: string | null }>();
  (collections ?? []).forEach((c) => {
    if (c.visible) collectionMap.set(c.intercomId, { name: c.name, description: c.description });
  });

  // Group articles by collectionId
  const grouped = new Map<string, typeof filtered>();
  const uncategorized: typeof filtered = [];

  for (const article of filtered) {
    const colId = article.collectionId ?? "";
    if (colId && collectionMap.has(colId)) {
      if (!grouped.has(colId)) grouped.set(colId, []);
      grouped.get(colId)!.push(article);
    } else {
      uncategorized.push(article);
    }
  }

  // Order collections by their sort order from DB
  const orderedCollections = (collections ?? [])
    .filter((c) => c.visible && grouped.has(c.intercomId))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${ACCENT}18` }}
        >
          <HelpCircle size={14} style={{ color: ACCENT }} />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-white">Help Articles</span>
          <span className="ml-2 text-xs text-gray-500">Answers to common questions and troubleshooting guides</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${ACCENT}15`, color: ACCENT }}
        >
          {filtered.length}
        </span>
      </div>
      <div className="mb-4 h-px" style={{ background: `${ACCENT}25` }} />

      {/* Collections */}
      <div className="space-y-6 pl-2">
        {orderedCollections.map((col) => (
          <CollectionSection
            key={col.intercomId}
            name={col.name}
            description={col.description}
            articles={grouped.get(col.intercomId) ?? []}
            onArticleClick={setSelectedId}
          />
        ))}
        {uncategorized.length > 0 && (
          <CollectionSection
            name="Other"
            articles={uncategorized}
            onArticleClick={setSelectedId}
          />
        )}
      </div>

      {/* No search results */}
      {search && filtered.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg mt-2"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
          <Search size={14} style={{ color: ACCENT, opacity: 0.4 }} />
          <p className="text-xs text-gray-500">No help articles match "{search}".</p>
        </div>
      )}

      {/* Article modal */}
      {selectedId !== null && selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
