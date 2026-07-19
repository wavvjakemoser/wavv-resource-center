import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { ChevronLeft, Search, BookOpen } from "lucide-react";
import HelpArticlesSection from "@/components/HelpArticlesSection";
import ResourceSidePanel, { PanelItem } from "@/components/ResourceSidePanel";

const ACCENT = "#0074F4";

export default function ResourceHelpArticles() {
  const [search, setSearch] = useState("");
  const [panelItem, setPanelItem] = useState<PanelItem | null>(null);
  const { data: helpArticles = [] } = trpc.helpArticles.listPublished.useQuery();

  const handleOpenArticle = (article: { title: string; nativeBody: string; fileUrl?: string | null; articleUrl?: string | null }) => {
    setPanelItem({ type: "article", title: article.title, nativeBody: article.nativeBody, fileUrl: article.fileUrl ?? null, articleUrl: article.articleUrl ?? null });
  };

  const sidePanel = (
    <ResourceSidePanel item={panelItem} onClose={() => setPanelItem(null)} pushMode={true} />
  );

  return (
    <PortalLayout title="WAVV Resource Hub — Help Articles" rightPanel={sidePanel}>
      <div className="px-4 lg:px-8 py-6 space-y-6">

        {/* Back breadcrumb */}
        <Link
          href="/resourcehub"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ChevronLeft size={15} />
          WAVV Resource Hub
        </Link>

        {/* Hero banner */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ height: "160px", border: `1px solid ${ACCENT}40` }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, rgba(8,10,16,1) 0%, rgba(8,10,16,0.95) 60%, ${ACCENT}18 100%)` }}
          />
          <div
            className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ opacity: 0.35, color: ACCENT }}
          >
            <Search size={100} strokeWidth={1.2} />
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 80% 50%, ${ACCENT}14 0%, transparent 55%)` }}
          />
          <div className="relative flex flex-col justify-center h-full px-8 py-6 gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
              WAVV Resource Hub
            </p>
            <h1 className="text-2xl font-extrabold text-white leading-tight">Help Articles</h1>
            <p className="text-sm text-gray-300 mb-2">Step-by-step guides and reference documentation for every WAVV feature.</p>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: `${ACCENT}35`, color: ACCENT, border: `1px solid ${ACCENT}` }}
              >
                {helpArticles.length} {helpArticles.length === 1 ? "article" : "articles"}
              </span>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-500 outline-none transition-all"
            style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
          />
        </div>

        {/* Help Articles content */}
        <HelpArticlesSection search={search} onOpenArticle={handleOpenArticle} />
      </div>
    </PortalLayout>
  );
}
