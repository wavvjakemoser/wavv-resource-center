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

        {/* Hero banner with neon icon image */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ height: "200px", border: `1px solid ${ACCENT}40`, boxShadow: `0 0 0 1px ${ACCENT}20, 0 4px 32px ${ACCENT}18` }}
        >
          <div className="absolute inset-0" style={{ background: "#000" }} />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit-help" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M10 10 L50 10 M50 10 L50 50 M10 30 L30 30 M30 30 L30 50" stroke={ACCENT} strokeWidth="0.8" fill="none"/>
                <circle cx="10" cy="10" r="2" fill={ACCENT}/>
                <circle cx="50" cy="10" r="2" fill={ACCENT}/>
                <circle cx="50" cy="50" r="2" fill={ACCENT}/>
                <circle cx="30" cy="30" r="1.5" fill={ACCENT}/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-help)"/>
          </svg>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(/manus-storage/final-resource-magnify_17bb4dc4.png)`,
              backgroundSize: "cover",
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
