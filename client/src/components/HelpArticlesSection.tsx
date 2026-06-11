/**
 * HelpArticlesSection
 *
 * Renders PUBLISHED help articles on the customer-facing Resource Hub page.
 * Articles are sourced from the published_help_articles table — only articles
 * that a content admin has explicitly published appear here.
 *
 * Grouped by sectionName (e.g. "Dialer Settings", "Call Boards"),
 * each section is collapsible. Clicking an article opens it in a new tab.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { HelpCircle, ExternalLink, ChevronDown, ChevronRight, Search } from "lucide-react";

const ACCENT = "#8B5CF6";

// ─── Article Row ──────────────────────────────────────────────────────────────

function ArticleRow({
  article,
}: {
  article: { intercomArticleId: string; title: string; url: string | null };
}) {
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
}: {
  name: string;
  articles: Array<{ intercomArticleId: string; title: string; url: string | null }>;
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
            <p className="text-xs text-gray-500">No articles in this section yet.</p>
          </div>
        ) : (
          <div className="space-y-0.5 mb-2">
            {articles.map((a) => (
              <ArticleRow key={a.intercomArticleId} article={a} />
            ))}
          </div>
        )
      )}
    </section>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function HelpArticlesSection({ search }: { search: string }) {
  const { data: published = [], isLoading } = trpc.helpArticles.listPublished.useQuery();

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

  if (published.length === 0) {
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

  // Filter by search
  const filtered = published.filter(
    (a) =>
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase())
  );

  // Group by sectionName, preserving sectionOrder
  const sections = Array.from(new Set(filtered.map(a => a.sectionName))).sort((a, b) => {
    const ao = filtered.find(x => x.sectionName === a)?.sectionOrder ?? 0;
    const bo = filtered.find(x => x.sectionName === b)?.sectionOrder ?? 0;
    return ao - bo;
  });
  const bySection = sections.reduce((acc, sec) => {
    acc[sec] = [...filtered.filter(a => a.sectionName === sec)].sort((a, b) => a.sortOrder - b.sortOrder);
    return acc;
  }, {} as Record<string, typeof filtered>);

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
          <span className="ml-2 text-xs text-gray-500">Answers, how-tos, and troubleshooting for WAVV</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${ACCENT}15`, color: ACCENT }}
        >
          {filtered.length}
        </span>
      </div>
      <div className="mb-4 h-px" style={{ background: `${ACCENT}25` }} />

      {/* Sections */}
      <div className="space-y-6 pl-2">
        {sections.map((sec) => (
          <SectionGroup
            key={sec}
            name={sec}
            articles={bySection[sec]}
          />
        ))}
      </div>

      {/* No search results */}
      {search && filtered.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg mt-2"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
          <Search size={14} style={{ color: ACCENT, opacity: 0.4 }} />
          <p className="text-xs text-gray-500">No help articles match "{search}".</p>
        </div>
      )}
    </>
  );
}
