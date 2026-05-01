import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { BookOpen, Clock, ChevronRight, GraduationCap } from "lucide-react";

const CATEGORIES = [
  "Onboarding",
  "How-To",
  "Strategy and Best Practices",
  "Dialer Setup",
  "CRM Integrations",
  "Spam Protection",
] as const;

const CATEGORY_META: Record<string, { color: string; desc: string }> = {
  Onboarding: { color: "#0074F4", desc: "Get your team up and running with WAVV" },
  "How-To": { color: "#00A9E2", desc: "Step-by-step guides for core features" },
  "Strategy and Best Practices": { color: "#67C728", desc: "Maximize connection rates and conversions" },
  "Dialer Setup": { color: "#FF9900", desc: "Configure your dialer for optimal performance" },
  "CRM Integrations": { color: "#a855f7", desc: "Connect WAVV with your CRM" },
  "Spam Protection": { color: "#ef4444", desc: "Protect your numbers and maintain deliverability" },
};

export default function Academy() {
  const { data: courses, isLoading } = trpc.academy.getCourses.useQuery();
  const { data: progress } = trpc.academy.getProgress.useQuery({});

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lessonId)
  );

  const coursesByCategory = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = (courses ?? []).filter((c) => c.category === cat);
      return acc;
    },
    {} as Record<string, typeof courses>
  );

  return (
    <PortalLayout title="WAVV Academy">
      <div className="px-4 lg:px-6 py-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #001B28 0%, #0d1f35 100%)",
            border: "1px solid rgba(0, 116, 244, 0.2)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0, 116, 244, 0.2)" }}
            >
              <GraduationCap size={24} style={{ color: "#0074F4" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-1">WAVV Academy</h1>
              <p className="text-gray-400 text-sm">
                Structured learning paths to help you and your team get the most out of WAVV.
                Track your progress as you complete lessons.
              </p>
              {progress && progress.length > 0 && (
                <p className="text-[#67C728] text-xs mt-2 font-medium">
                  ✓ {completedLessonIds.size} lesson{completedLessonIds.size !== 1 ? "s" : ""} completed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-xl animate-pulse"
                style={{ background: "#1a1a1a" }}
              />
            ))}
          </div>
        )}

        {/* Category sections */}
        {!isLoading && CATEGORIES.map((category) => {
          const cats = coursesByCategory[category] ?? [];
          if (cats.length === 0) return null;
          const meta = CATEGORY_META[category];

          return (
            <section key={category}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-2 h-6 rounded-full"
                  style={{ background: meta.color }}
                />
                <div>
                  <h2 className="text-base font-semibold text-white">{category}</h2>
                  <p className="text-xs text-gray-500">{meta.desc}</p>
                </div>
                <span
                  className="ml-auto text-xs px-2 py-0.5 rounded-full"
                  style={{ background: `${meta.color}20`, color: meta.color }}
                >
                  {cats.length} course{cats.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cats.map((course) => (
                  <Link key={course.id} href={`/academy/${course.id}`}
                      className="group flex flex-col p-5 rounded-xl transition-all cursor-pointer"
                      style={{
                        background: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        textDecoration: "none",
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ background: `${meta.color}20` }}
                        >
                          <BookOpen size={16} style={{ color: meta.color }} />
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-gray-600 group-hover:text-gray-400 transition-colors"
                        />
                      </div>
                      <h3 className="text-white font-semibold text-sm leading-snug mb-1">
                        {course.title}
                      </h3>
                      {course.description && (
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                          {course.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-center gap-3 text-xs text-gray-600">
                        {course.durationMinutes ? (
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {course.durationMinutes} min
                          </span>
                        ) : null}
                      </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Empty state */}
        {!isLoading && (!courses || courses.length === 0) && (
          <div className="text-center py-16">
            <GraduationCap size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No courses yet</h3>
            <p className="text-gray-500 text-sm">
              Academy content is being added. Check back soon!
            </p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
