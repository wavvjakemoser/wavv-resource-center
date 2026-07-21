import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Search, FileText, HelpCircle, MessageCircle } from "lucide-react";
import { ContentRequestCTA } from "./Academy";

// ─── Color constants ──────────────────────────────────────────────────────────
const ARTICLE_COLOR = "#0074F4";
const PDF_COLOR     = "#00A9E2";
const FAQ_COLOR     = "#67C728";

// ─── Category tile definitions ───────────────────────────────────────────────
const RESOURCE_CATEGORIES = [
  {
    key: "help_article",
    label: "Help Articles",
    subtitle: "Step-by-step guides and reference documentation for every WAVV feature.",
    color: ARTICLE_COLOR,
    icon: Search,
    href: "/resources/help-articles",
    thumbnail: "/manus-storage/final-resource-magnify_17bb4dc4.png",
  },
  {
    key: "pdf",
    label: "PDFs",
    subtitle: "Downloadable playbooks, checklists, and quick-reference documents.",
    color: PDF_COLOR,
    icon: FileText,
    href: "/resources/pdfs",
    thumbnail: "/manus-storage/final-resource-clipboard_ac540005.png",
  },
  {
    key: "faq",
    label: "FAQs",
    subtitle: "Quick answers to the most common questions about WAVV.",
    color: FAQ_COLOR,
    icon: MessageCircle,
    href: "/resources/faqs",
    thumbnail: "/manus-storage/final-resource-chat_164bafd5.png",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GuidesAndDocs() {
  // Fetch counts for badges
  const { data: helpArticles = [] } = trpc.helpArticles.listPublished.useQuery();
  const { data: guides } = trpc.guides.list.useQuery();
  const { data: faqSections = [] } = trpc.faq.listSectionsPublic.useQuery();
  const { data: guideVisRaw } = trpc.siteSettings.get.useQuery({ key: "guides_sections_visibility" });
  const guideVisibility: Record<string, boolean> = (guideVisRaw as Record<string, boolean> | null) ?? { help_article: true, pdf: true, faq: true };

  const pdfItems = (guides ?? []).filter((g: any) => (g.fileType ?? "pdf") === "pdf");
  const faqCount = (faqSections as any[]).filter((s: any) => s.isVisible).reduce((acc: number, s: any) => acc + (s.entries ?? []).filter((e: any) => e.isVisible).length, 0);

  const categoryCounts: Record<string, number> = {
    help_article: helpArticles.length,
    pdf: pdfItems.length,
    faq: faqCount,
  };

  return (
    <PortalLayout title="WAVV Resource Hub">
      <div className="px-4 lg:px-8 py-6 space-y-8">
        {/* Spacer for consistent vertical alignment */}
        <div style={{ minHeight: "32px" }} />

        {/* Hero */}
        <div className="px-4 sm:px-6 lg:px-16 py-8 sm:py-12 text-center flex flex-col items-center justify-center" style={{ minHeight: "220px" }}>
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
        </div>

        {/* ── 3 Category Tiles (navigational — same as Academy) ── */}
        <div className="space-y-5">
          {RESOURCE_CATEGORIES.map(cat => (
            guideVisibility[cat.key] !== false && (
              <Link
                key={cat.key}
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl block cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                style={{
                  textDecoration: "none",
                  border: `1px solid ${cat.color}60`,
                  height: "260px",
                  boxShadow: `0 0 0 1px ${cat.color}20, 0 4px 32px ${cat.color}18`,
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
                  style={{ background: `radial-gradient(ellipse 120% 100% at 70% 50%, ${cat.color}28 0%, ${cat.color}10 45%, transparent 75%)` }}
                />

                {/* Secondary glow — left edge */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 60% 80% at 15% 50%, ${cat.color}12 0%, transparent 60%)` }}
                />

                {/* Neon scan line */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `linear-gradient(180deg, ${cat.color}06 0%, ${cat.color}12 50%, ${cat.color}06 100%)` }}
                />

                {/* Top edge neon line */}
                <div
                  className="absolute top-0 left-0 right-0 pointer-events-none"
                  style={{ height: "1px", background: `linear-gradient(to right, transparent 0%, ${cat.color}60 30%, ${cat.color}90 60%, transparent 100%)` }}
                />

                {/* Full-bleed thumbnail */}
                <img src={cat.thumbnail} alt="" loading="eager" fetchPriority="high" className="hidden" />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${cat.thumbnail})`,
                    backgroundSize: "auto 90%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right center",
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
                <div className="relative flex flex-col justify-center h-full px-8 py-6 gap-1">
                  <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: cat.color }}>
                    WAVV Resource Hub
                  </p>
                  <h2 className="text-4xl font-extrabold text-white leading-tight mb-1">
                    {cat.label}
                  </h2>
                  <p className="text-base text-white mb-3">{cat.subtitle}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold px-3 py-1 rounded-full"
                      style={{ background: `${cat.color}35`, color: cat.color, border: `1px solid ${cat.color}` }}
                    >
                      {categoryCounts[cat.key] ?? 0} {(categoryCounts[cat.key] ?? 0) === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Request a Resource */}
      <div className="px-4 lg:px-8 pb-10">
        <ContentRequestCTA requestType="guide" accentColor="#ffffff" />
      </div>
    </PortalLayout>
  );
}
