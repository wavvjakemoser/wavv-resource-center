import { useState } from "react";
import { Link, useParams } from "wouter";
import PortalLayout from "@/components/PortalLayout";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Folder,
  Play,
  Lock,
  GraduationCap,
} from "lucide-react";

// ─── Section / video data ─────────────────────────────────────────────────────

interface VideoItem {
  id: string;
  title: string;
  duration?: string;
  status: "available" | "coming_soon";
  loopUrl?: string;
}

interface Section {
  id: string;
  title: string;
  videos: VideoItem[];
}

interface CategoryData {
  key: string;
  label: string;
  subtitle: string;
  color: string;
  thumbnail: string;
  sections: Section[];
}

const CATEGORY_DATA: CategoryData[] = [
  {
    key: "Onboarding",
    label: "Onboarding",
    subtitle: "Everything you need to get your team up and running with WAVV quickly and effectively.",
    color: "#0074F4",
    thumbnail:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/academy-onboarding-thumb-cy9amSDtDB8FaRgmGumyrX.webp",
    sections: [
      {
        id: "onb-1",
        title: "1. Welcome To The Onboarding Section",
        videos: [
          { id: "onb-1-1", title: "Welcome to WAVV — What to Expect", duration: "3 min", status: "coming_soon" },
          { id: "onb-1-2", title: "How to Use This Training Center", duration: "2 min", status: "coming_soon" },
        ],
      },
      {
        id: "onb-2",
        title: "2. NEW: WAVV Wallet",
        videos: [
          { id: "onb-2-1", title: "What Is WAVV Wallet?", duration: "5 min", status: "coming_soon" },
          { id: "onb-2-2", title: "Setting Up Your Wallet", duration: "7 min", status: "coming_soon" },
          { id: "onb-2-3", title: "Managing Credits & Billing", duration: "6 min", status: "coming_soon" },
        ],
      },
      {
        id: "onb-3",
        title: "3. Individual Single Line Dialer Onboarding",
        videos: [
          { id: "onb-3-1", title: "Single Line Dialer Overview", duration: "8 min", status: "coming_soon" },
          { id: "onb-3-2", title: "Setting Up Your First List", duration: "6 min", status: "coming_soon" },
          { id: "onb-3-3", title: "Making Your First Call", duration: "5 min", status: "coming_soon" },
        ],
      },
      {
        id: "onb-4",
        title: "4. Individual Multi Line Dialer Onboarding",
        videos: [
          { id: "onb-4-1", title: "Multi Line Dialer Overview", duration: "9 min", status: "coming_soon" },
          { id: "onb-4-2", title: "Configuring Lines & Ratios", duration: "7 min", status: "coming_soon" },
          { id: "onb-4-3", title: "Managing Live Calls Simultaneously", duration: "8 min", status: "coming_soon" },
        ],
      },
      {
        id: "onb-5",
        title: "5. Team Onboarding",
        videos: [
          { id: "onb-5-1", title: "Adding Team Members & Seats", duration: "6 min", status: "coming_soon" },
          { id: "onb-5-2", title: "Setting Up Team Permissions", duration: "5 min", status: "coming_soon" },
          { id: "onb-5-3", title: "Team Call Boards Overview", duration: "7 min", status: "coming_soon" },
        ],
      },
      {
        id: "onb-6",
        title: "6. Common Onboarding Questions",
        videos: [
          { id: "onb-6-1", title: "Troubleshooting Audio & Mic Issues", duration: "4 min", status: "coming_soon" },
          { id: "onb-6-2", title: "CRM Connection FAQs", duration: "5 min", status: "coming_soon" },
          { id: "onb-6-3", title: "Billing & Account Questions", duration: "4 min", status: "coming_soon" },
        ],
      },
    ],
  },
  {
    key: "How-To",
    label: "How-To",
    subtitle: "Step-by-step guides for every core WAVV feature.",
    color: "#00A9E2",
    thumbnail:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/academy-howto-thumb-iuntTrCa6frsgxgN6pFnCD.webp",
    sections: [
      {
        id: "how-1",
        title: "1. Welcome To The How-To Section",
        videos: [
          { id: "how-1-1", title: "How to Navigate This Section", duration: "2 min", status: "coming_soon" },
        ],
      },
      {
        id: "how-2",
        title: "2. Making Calls With WAVV",
        videos: [
          { id: "how-2-1", title: "Dialing From a List", duration: "6 min", status: "coming_soon" },
          { id: "how-2-2", title: "Using Dispositions During a Call", duration: "5 min", status: "coming_soon" },
          { id: "how-2-3", title: "Call Notes & CRM Sync", duration: "4 min", status: "coming_soon" },
        ],
      },
      {
        id: "how-3",
        title: "3. Voicemails",
        videos: [
          { id: "how-3-1", title: "Setting Up Voicemail Drop", duration: "5 min", status: "coming_soon" },
          { id: "how-3-2", title: "Recording Custom Voicemails", duration: "4 min", status: "coming_soon" },
        ],
      },
      {
        id: "how-4",
        title: "4. WAVV Call Campaigns",
        videos: [
          { id: "how-4-1", title: "Creating a Call Campaign", duration: "8 min", status: "coming_soon" },
          { id: "how-4-2", title: "Uploading & Managing Contact Lists", duration: "6 min", status: "coming_soon" },
          { id: "how-4-3", title: "Campaign Analytics & Reporting", duration: "7 min", status: "coming_soon" },
        ],
      },
      {
        id: "how-5",
        title: "5. Nuisance Protection",
        videos: [
          { id: "how-5-1", title: "What Is Nuisance Protection?", duration: "4 min", status: "coming_soon" },
          { id: "how-5-2", title: "Configuring Nuisance Filters", duration: "5 min", status: "coming_soon" },
        ],
      },
      {
        id: "how-6",
        title: "6. Call Transfers",
        videos: [
          { id: "how-6-1", title: "Warm vs. Cold Transfers", duration: "5 min", status: "coming_soon" },
          { id: "how-6-2", title: "Transferring to External Numbers", duration: "4 min", status: "coming_soon" },
        ],
      },
      {
        id: "how-7",
        title: "7. Audio Source",
        videos: [
          { id: "how-7-1", title: "Selecting Your Audio Input", duration: "3 min", status: "coming_soon" },
          { id: "how-7-2", title: "Troubleshooting Audio Quality", duration: "4 min", status: "coming_soon" },
        ],
      },
      {
        id: "how-8",
        title: "8. Spam Protection",
        videos: [
          { id: "how-8-1", title: "Understanding SPAM Flagging", duration: "6 min", status: "coming_soon" },
          { id: "how-8-2", title: "Number Rotation to Avoid SPAM", duration: "8 min", status: "coming_soon" },
          { id: "how-8-3", title: "Remediation Steps for Flagged Numbers", duration: "5 min", status: "coming_soon" },
        ],
      },
    ],
  },
  {
    key: "Strategy and Best Practices",
    label: "Strategy & Best Practices",
    subtitle: "Maximize connection rates, conversions, and team performance.",
    color: "#67C728",
    thumbnail:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663417013740/gkLpfNMVYQYMxzYT6m74Yk/academy-strategy-thumb-fKFxPeA2NotYc3dTCL2qLc.webp",
    sections: [
      {
        id: "str-1",
        title: "1. Welcome To The Strategy & Best Practices Section",
        videos: [
          { id: "str-1-1", title: "Why Strategy Matters in Outbound", duration: "4 min", status: "coming_soon" },
        ],
      },
      {
        id: "str-2",
        title: "2. WAVV Phone Numbers Tab",
        videos: [
          { id: "str-2-1", title: "Managing Your Number Pool", duration: "6 min", status: "coming_soon" },
          { id: "str-2-2", title: "Local Presence & Area Code Strategy", duration: "7 min", status: "coming_soon" },
          { id: "str-2-3", title: "When to Retire & Replace Numbers", duration: "5 min", status: "coming_soon" },
        ],
      },
      {
        id: "str-3",
        title: "3. IMPORTANT: Connection Rates",
        videos: [
          { id: "str-3-1", title: "What Drives Connection Rates", duration: "8 min", status: "coming_soon" },
          { id: "str-3-2", title: "Benchmarks & What Good Looks Like", duration: "6 min", status: "coming_soon" },
          { id: "str-3-3", title: "Diagnosing & Fixing Low Connection Rates", duration: "9 min", status: "coming_soon" },
        ],
      },
    ],
  },
];

// ─── Expandable section row ───────────────────────────────────────────────────
function SectionRow({
  section,
  accentColor,
  defaultOpen = false,
}: {
  section: Section;
  accentColor: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
    >
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/5"
      >
        <Folder size={18} style={{ color: accentColor, flexShrink: 0 }} />
        <span className="flex-1 text-sm font-semibold text-white">{section.title}</span>
        <span className="text-[11px] text-gray-500 mr-2">
          {section.videos.length} video{section.videos.length !== 1 ? "s" : ""}
        </span>
        <ChevronDown
          size={16}
          className="text-gray-500 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
        />
      </button>

      {/* Video sub-items */}
      {open && (
        <div
          className="border-t"
          style={{ borderColor: "#2a2a2a" }}
        >
          {section.videos.map((video, idx) => (
            <div
              key={video.id}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/5"
              style={{
                borderBottom: idx < section.videos.length - 1 ? "1px solid #222" : "none",
              }}
            >
              {/* Play / lock icon */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: video.status === "available" ? `${accentColor}20` : "rgba(255,255,255,0.04)",
                }}
              >
                {video.status === "available" ? (
                  <Play size={12} style={{ color: accentColor }} />
                ) : (
                  <Lock size={11} className="text-gray-600" />
                )}
              </div>

              {/* Title */}
              <span
                className="flex-1 text-sm"
                style={{ color: video.status === "available" ? "#e5e7eb" : "#6b7280" }}
              >
                {video.title}
              </span>

              {/* Duration + Coming Soon badge */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {video.duration && (
                  <span className="text-[11px] text-gray-600">{video.duration}</span>
                )}
                {video.status === "coming_soon" && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "#555",
                      border: "1px solid #333",
                    }}
                  >
                    Coming Soon
                  </span>
                )}
                {video.status === "available" && (
                  <ChevronRight size={14} className="text-gray-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AcademyCategory() {
  const params = useParams<{ categoryKey: string }>();
  const categoryKey = decodeURIComponent(params.categoryKey ?? "");

  const cat = CATEGORY_DATA.find((c) => c.key === categoryKey);

  if (!cat) {
    return (
      <PortalLayout title="WAVV Academy">
        <div className="px-4 lg:px-6 py-12 max-w-3xl mx-auto text-center">
          <GraduationCap size={40} className="text-gray-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Category Not Found</h1>
          <p className="text-gray-500 text-sm mb-6">
            This category doesn't exist yet. Head back to WAVV Academy to browse available content.
          </p>
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "#0074F4" }}
          >
            <ChevronLeft size={15} /> Back to Academy
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const totalVideos = cat.sections.reduce((sum, s) => sum + s.videos.length, 0);

  return (
    <PortalLayout title={`WAVV Academy — ${cat.label}`}>
      <div className="px-4 lg:px-6 py-6 max-w-3xl mx-auto space-y-6">

        {/* ── Back breadcrumb ── */}
        <Link
          href="/academy"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ChevronLeft size={15} />
          WAVV Academy
        </Link>

        {/* ── Category hero banner ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ border: `1px solid ${cat.color}30` }}
        >
          <img
            src={cat.thumbnail}
            alt={cat.label}
            className="w-full object-cover"
            style={{ height: "160px" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.35) 70%, transparent 100%)",
            }}
          />
          <div className="absolute inset-0 flex items-center px-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-5 rounded-full" style={{ background: cat.color }} />
                <h1 className="text-xl font-bold text-white">{cat.label}</h1>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-1"
                  style={{
                    background: `${cat.color}25`,
                    color: cat.color,
                    border: `1px solid ${cat.color}40`,
                  }}
                >
                  {cat.sections.length} sections · {totalVideos} videos
                </span>
              </div>
              <p className="text-gray-300 text-xs max-w-sm">{cat.subtitle}</p>
            </div>
          </div>
        </div>

        {/* ── Section list ── */}
        <div className="space-y-3">
          {cat.sections.map((section, idx) => (
            <SectionRow
              key={section.id}
              section={section}
              accentColor={cat.color}
              defaultOpen={idx === 0}
            />
          ))}
        </div>

      </div>
    </PortalLayout>
  );
}
