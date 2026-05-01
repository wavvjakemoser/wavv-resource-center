import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import {
  BookOpen,
  Video,
  FileText,
  LifeBuoy,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const MODULE_CARDS = [
  {
    href: "/academy",
    label: "WAVV Academy",
    desc: "Structured courses: Onboarding, How-To, Strategy & Best Practices, and more",
    icon: BookOpen,
    color: "#0074F4",
    badge: "Learn",
  },
  {
    href: "/webinars",
    label: "Webinars",
    desc: "Upcoming live sessions and on-demand recordings from the WAVV team",
    icon: Video,
    color: "#00A9E2",
    badge: "Watch",
  },
  {
    href: "/guides",
    label: "Guides & Docs",
    desc: "Playbooks, checklists, and PDFs to maximize your WAVV ROI",
    icon: FileText,
    color: "#67C728",
    badge: "Download",
  },
  {
    href: "/support",
    label: "Support",
    desc: "Submit a ticket, book a call, or chat with WAVV AI for instant answers",
    icon: LifeBuoy,
    color: "#FF9900",
    badge: "Get Help",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Onboarding: "#0074F4",
  "How-To": "#00A9E2",
  "Strategy and Best Practices": "#67C728",
  "Dialer Setup": "#FF9900",
  "CRM Integrations": "#a855f7",
  "Spam Protection": "#ef4444",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: courses } = trpc.academy.getCourses.useQuery();
  const { data: progress } = trpc.academy.getProgress.useQuery({});
  const { data: webinars } = trpc.webinars.list.useQuery({});
  const { data: tickets } = trpc.support.getMyTickets.useQuery();

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lessonId)
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const upcomingWebinars = (webinars ?? []).filter((w) => w.type === "upcoming").slice(0, 2);
  const openTickets = (tickets ?? []).filter((t) => t.status === "open" || t.status === "in_progress");

  return (
    <PortalLayout title="Overview">
      <div className="px-4 lg:px-6 py-6 max-w-6xl mx-auto space-y-8">
        {/* Welcome banner */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
          style={{
            background: "linear-gradient(135deg, #001B28 0%, #0d1f35 50%, #0a1a10 100%)",
            border: "1px solid rgba(0, 116, 244, 0.2)",
          }}
        >
          <div className="relative z-10">
            <p className="text-gray-400 text-sm mb-1">{greeting},</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              {user?.name ?? "Welcome back"} 👋
            </h1>
            <p className="text-gray-400 text-sm max-w-xl">
              Your WAVV Resource Center — training, webinars, guides, and AI-powered support in one place.
            </p>
          </div>
          {/* Decorative gradient orbs */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #0074F4, transparent)", transform: "translate(30%, -30%)" }}
          />
          <div
            className="absolute bottom-0 right-20 w-32 h-32 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #67C728, transparent)", transform: "translateY(30%)" }}
          />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Courses Available",
              value: courses?.length ?? 0,
              icon: BookOpen,
              color: "#0074F4",
            },
            {
              label: "Lessons Completed",
              value: completedLessonIds.size,
              icon: CheckCircle,
              color: "#67C728",
            },
            {
              label: "Upcoming Webinars",
              value: upcomingWebinars.length,
              icon: Clock,
              color: "#00A9E2",
            },
            {
              label: "Open Tickets",
              value: openTickets.length,
              icon: TrendingUp,
              color: "#FF9900",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-4 rounded-xl"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${stat.color}20` }}
                  >
                    <Icon size={14} style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Module cards */}
        <div>
          <h2 className="text-base font-semibold text-white mb-4">Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODULE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href}
                  className="group flex items-start gap-4 p-5 rounded-xl transition-all cursor-pointer"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    textDecoration: "none",
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = card.color;
                      e.currentTarget.style.boxShadow = `0 4px 20px ${card.color}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#2a2a2a";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${card.color}20` }}
                    >
                      <Icon size={22} style={{ color: card.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-sm">{card.label}</h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${card.color}20`, color: card.color }}
                        >
                          {card.badge}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-1"
                    />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Academy courses preview */}
        {courses && courses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Academy Courses</h2>
              <Link href="/academy">
                  View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {courses.slice(0, 6).map((course) => {
                const catColor = CATEGORY_COLORS[course.category] ?? "#0074F4";
                return (
                  <Link key={course.id} href={`/academy/${course.id}`}
                      className="p-4 rounded-xl transition-all cursor-pointer block"
                      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", textDecoration: "none" }}
                    >
                      <div
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mb-2"
                        style={{ background: `${catColor}20`, color: catColor }}
                      >
                        {course.category}
                      </div>
                      <h3 className="text-white text-sm font-medium leading-snug">{course.title}</h3>
                      {course.durationMinutes ? (
                        <p className="text-gray-500 text-xs mt-1">{course.durationMinutes} min</p>
                      ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* WAVV AI CTA */}
        <div
          className="flex items-center gap-4 p-5 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(0,116,244,0.1), rgba(103,199,40,0.05))",
            border: "1px solid rgba(0, 116, 244, 0.2)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
          >
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">WAVV AI is here to help</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Get instant answers to product questions, troubleshoot issues, and find the right resources — without waiting for support.
            </p>
          </div>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
            onClick={() => {
              // Trigger AI chat via parent layout
              document.querySelector<HTMLButtonElement>("[data-wavv-ai-trigger]")?.click();
            }}
          >
            Ask WAVV AI
          </button>
        </div>
      </div>
    </PortalLayout>
  );
}
