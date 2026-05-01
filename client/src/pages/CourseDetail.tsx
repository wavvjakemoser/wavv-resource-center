import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { ArrowLeft, PlayCircle, CheckCircle, Clock, BookOpen, Lock } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, string> = {
  Onboarding: "#0074F4",
  "How-To": "#00A9E2",
  "Strategy and Best Practices": "#67C728",
  "Dialer Setup": "#FF9900",
  "CRM Integrations": "#a855f7",
  "Spam Protection": "#ef4444",
};

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = parseInt(courseId ?? "0");

  const { data, isLoading } = trpc.academy.getCourse.useQuery({ id });
  const { data: progress, refetch: refetchProgress } = trpc.academy.getProgress.useQuery({ courseId: id });
  const markComplete = trpc.academy.markComplete.useMutation({
    onSuccess: () => {
      refetchProgress();
      toast.success("Lesson marked as complete!");
    },
  });

  const completedIds = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lessonId));
  const totalLessons = data?.lessons?.length ?? 0;
  const completedCount = (data?.lessons ?? []).filter((l) => completedIds.has(l.id)).length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const catColor = CATEGORY_COLORS[data?.course?.category ?? ""] ?? "#0074F4";

  if (isLoading) {
    return (
      <PortalLayout title="Loading...">
        <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "#1a1a1a" }} />
          ))}
        </div>
      </PortalLayout>
    );
  }

  if (!data) {
    return (
      <PortalLayout title="Not Found">
        <div className="px-4 lg:px-6 py-16 text-center">
          <p className="text-gray-400">Course not found.</p>
          <Link href="/academy">
            <a className="text-[#0074F4] text-sm mt-2 inline-block">← Back to Academy</a>
          </Link>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title={data.course.title}>
      <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <Link href="/academy">
            <ArrowLeft size={15} />
            Back to Academy
        </Link>

        {/* Course header */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #001B28 0%, #0d1f35 100%)",
            border: `1px solid ${catColor}30`,
          }}
        >
          <div
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ background: `${catColor}20`, color: catColor }}
          >
            {data.course.category}
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">{data.course.title}</h1>
          {data.course.description && (
            <p className="text-gray-400 text-sm mb-4">{data.course.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
            </span>
            {data.course.durationMinutes ? (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {data.course.durationMinutes} min total
              </span>
            ) : null}
            <span className="flex items-center gap-1 text-[#67C728]">
              <CheckCircle size={12} />
              {completedCount}/{totalLessons} completed
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full" style={{ background: "#2a2a2a" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${catColor}, ${catColor}aa)`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{progressPct}% complete</p>
        </div>

        {/* Lessons list */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Lessons</h2>
          {data.lessons.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm">No lessons available yet.</p>
            </div>
          )}
          {data.lessons.map((lesson, index) => {
            const isCompleted = completedIds.has(lesson.id);
            return (
              <div
                key={lesson.id}
                className="flex items-center gap-4 p-4 rounded-xl transition-all"
                style={{
                  background: "#1a1a1a",
                  border: isCompleted ? `1px solid ${catColor}40` : "1px solid #2a2a2a",
                }}
              >
                {/* Lesson number / check */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{
                    background: isCompleted ? `${catColor}20` : "#2a2a2a",
                    color: isCompleted ? catColor : "#666",
                  }}
                >
                  {isCompleted ? <CheckCircle size={16} style={{ color: catColor }} /> : index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm font-medium">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{lesson.description}</p>
                  )}
                  {lesson.durationMinutes ? (
                    <p className="text-gray-600 text-xs mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {lesson.durationMinutes} min
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {lesson.videoUrl ? (
                    <Link href={`/academy/${id}/lesson/${lesson.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: isCompleted ? `${catColor}20` : "#0074F420",
                          color: isCompleted ? catColor : "#0074F4",
                          border: `1px solid ${isCompleted ? catColor : "#0074F4"}40`,
                        }}
                      >
                        <PlayCircle size={13} />
                        {isCompleted ? "Rewatch" : "Watch"}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Lock size={12} />
                      No video
                    </span>
                  )}

                  {!isCompleted && (
                    <button
                      onClick={() => markComplete.mutate({ lessonId: lesson.id, courseId: id })}
                      disabled={markComplete.isPending}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: "#67C72820",
                        color: "#67C728",
                        border: "1px solid #67C72840",
                      }}
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion banner */}
        {progressPct === 100 && totalLessons > 0 && (
          <div
            className="flex items-center gap-4 p-5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(103,199,40,0.1), rgba(0,116,244,0.05))",
              border: "1px solid rgba(103,199,40,0.3)",
            }}
          >
            <CheckCircle size={24} className="text-[#67C728]" />
            <div>
              <p className="text-white font-semibold text-sm">Course Complete!</p>
              <p className="text-gray-400 text-xs">You've completed all lessons in this course.</p>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
