import PortalLayout from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { ArrowLeft, CheckCircle, PlayCircle, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  // Loom — handle both already-embedded URLs and share URLs
  const loomEmbedMatch = url.match(/loom\.com\/embed\/([a-zA-Z0-9]+)/);
  if (loomEmbedMatch) return `https://www.loom.com/embed/${loomEmbedMatch[1]}`;
  const loomShareMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomShareMatch) return `https://www.loom.com/embed/${loomShareMatch[1]}`;
  // Direct video URL
  return null;
}

export default function LessonViewer() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const cId = parseInt(courseId ?? "0");
  const lId = parseInt(lessonId ?? "0");

  const { user } = useAuth();
  const { data: courseData } = trpc.academy.getCourse.useQuery({ id: cId });
  const { data: progress, refetch: refetchProgress } = trpc.academy.getProgress.useQuery({ courseId: cId }, { enabled: !!user });

  const markComplete = trpc.academy.markComplete.useMutation({
    onSuccess: () => {
      refetchProgress();
      toast.success("Lesson marked as complete!");
    },
  });

  const lesson = courseData?.lessons?.find((l) => l.id === lId);
  const completedIds = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lessonId));
  const isCompleted = completedIds.has(lId);
  const embedUrl = lesson?.videoUrl ? getEmbedUrl(lesson.videoUrl) : null;

  const currentIndex = courseData?.lessons?.findIndex((l) => l.id === lId) ?? -1;
  const prevLesson = currentIndex > 0 ? courseData?.lessons?.[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < (courseData?.lessons?.length ?? 0) - 1
      ? courseData?.lessons?.[currentIndex + 1]
      : null;

  return (
    <PortalLayout title={lesson?.title ?? "Lesson"}>
      <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-5">
        {/* Breadcrumb: Academy > Course > Lesson */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/academy" className="hover:text-gray-300 transition-colors">WAVV Academy</Link>
          <ChevronRight size={11} className="text-gray-700 flex-shrink-0" />
          <Link href={`/academy/${cId}`} className="hover:text-gray-300 transition-colors truncate max-w-[200px]">
            {courseData?.course?.title ?? "Course"}
          </Link>
          <ChevronRight size={11} className="text-gray-700 flex-shrink-0" />
          <span className="text-gray-300 truncate max-w-[200px]">{lesson?.title ?? "Lesson"}</span>
        </nav>

        {/* Video player */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}
        >
          {embedUrl ? (
            <div className="relative" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={lesson?.title}
              />
            </div>
          ) : lesson?.videoUrl ? (
            <div className="relative" style={{ paddingBottom: "56.25%" }}>
              <video
                src={lesson.videoUrl}
                controls
                className="absolute inset-0 w-full h-full"
                style={{ background: "#000" }}
              />
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-20"
              style={{ background: "#111" }}
            >
              <PlayCircle size={48} className="text-gray-700 mb-3" />
              <p className="text-gray-500 text-sm">No video available for this lesson</p>
            </div>
          )}
        </div>

        {/* Lesson info */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">{lesson?.title}</h1>
            {lesson?.description && (
              <p className="text-gray-400 text-sm mt-1">{lesson.description}</p>
            )}
          </div>
          {!isCompleted ? (
            <button
              onClick={() => markComplete.mutate({ lessonId: lId, courseId: cId })}
              disabled={markComplete.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-shrink-0"
              style={{ background: "#67C72820", color: "#67C728", border: "1px solid #67C72840" }}
            >
              <CheckCircle size={15} />
              Mark Complete
            </button>
          ) : (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold flex-shrink-0"
              style={{ background: "#67C72820", color: "#67C728" }}
            >
              <CheckCircle size={15} />
              Completed
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #2a2a2a" }}>
          {prevLesson ? (
            <Link href={`/academy/${cId}/lesson/${prevLesson.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: "#1d2230", color: "#9ca3af", border: "1px solid #2a2a2a" }}
              >
                <ArrowLeft size={14} />
                <span className="truncate max-w-48">{prevLesson.title}</span>
            </Link>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Link href={`/academy/${cId}/lesson/${nextLesson.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: "#0074F420", color: "#0074F4", border: "1px solid #0074F440" }}
              >
                Next: <span className="truncate max-w-32">{nextLesson.title}</span>
                <ArrowLeft size={14} className="rotate-180" />
            </Link>
          ) : (
            <Link href={`/academy/${cId}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: "#67C72820", color: "#67C728", border: "1px solid #67C72840" }}
              >
                <CheckCircle size={14} />
                Back to Course
            </Link>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
