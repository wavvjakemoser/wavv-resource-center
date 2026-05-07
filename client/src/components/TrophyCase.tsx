import { useState, useEffect } from "react";
import { Trophy, X, Star, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface TrophyCaseProps {
  trigger?: React.ReactNode;
  /** When provided, the modal opens/closes based on this value */
  externalOpen?: boolean;
  onClose?: () => void;
}

export default function TrophyCase({ trigger, externalOpen, onClose }: TrophyCaseProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Sync external control
  useEffect(() => {
    if (externalOpen !== undefined) {
      setInternalOpen(externalOpen);
    }
  }, [externalOpen]);

  const open = internalOpen;
  const handleClose = () => {
    setInternalOpen(false);
    onClose?.();
  };

  const { data, isLoading } = trpc.trophy.get.useQuery(undefined, { enabled: open });

  const earnedCount = data?.badges.filter((b) => b.earned).length ?? 0;
  const totalCount = data?.badges.length ?? 0;

  return (
    <>
      {/* Trigger — only rendered if trigger prop is provided */}
      {trigger !== undefined ? (
        <button
          onClick={() => setInternalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all hover:bg-white/5"
          style={{ color: "#FBBF24" }}
          title="Trophy Case"
        >
          {trigger ?? (
            <>
              <Trophy size={15} />
              <span className="hidden sm:inline text-xs font-medium">Trophy Case</span>
            </>
          )}
        </button>
      ) : (
        <button
          onClick={() => setInternalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all hover:bg-white/5"
          style={{ color: "#FBBF24" }}
          title="Trophy Case"
        >
          <Trophy size={15} />
          <span className="hidden sm:inline text-xs font-medium">Trophy Case</span>
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "#161616", border: "1px solid #2a2a2a" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid #222", background: "linear-gradient(135deg, #0074F4/10, #67C728/5)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)" }}
                >
                  🏆
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">Trophy Case</h2>
                  <p className="text-gray-500 text-xs">{earnedCount} of {totalCount} badges earned</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>Progress</span>
                <span>{totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#252d3d" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: totalCount > 0 ? `${(earnedCount / totalCount) * 100}%` : "0%",
                    background: "linear-gradient(90deg, #0074F4, #67C728)",
                  }}
                />
              </div>
            </div>

            {/* Stats row */}
            {data && (
              <div className="grid grid-cols-2 gap-3 px-6 py-3">
                <div className="rounded-xl p-3 text-center" style={{ background: "#1e1e1e" }}>
                  <p className="text-2xl font-bold text-white">{data.totalLessonsCompleted}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Lessons Completed</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: "#1e1e1e" }}>
                  <p className="text-2xl font-bold text-white">{data.completedCourses.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Courses Finished</p>
                </div>
              </div>
            )}

            {/* Badges grid */}
            <div className="px-6 pb-6">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Badges</p>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "#1e1e1e" }} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {data?.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="rounded-xl p-3 flex flex-col items-center text-center transition-all"
                      style={{
                        background: badge.earned ? "#1e1e1e" : "#161616",
                        border: badge.earned ? "1px solid #0074F4/30" : "1px solid #222",
                        opacity: badge.earned ? 1 : 0.5,
                      }}
                    >
                      <div className="text-2xl mb-1.5" style={{ filter: badge.earned ? "none" : "grayscale(1)" }}>
                        {badge.earned ? badge.icon : <Lock size={20} className="text-gray-600" />}
                      </div>
                      <p className="text-xs font-semibold text-white leading-tight">{badge.label}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 leading-tight">{badge.description}</p>
                      {badge.earned && (
                        <div className="mt-1.5 flex items-center gap-0.5">
                          <Star size={9} className="text-[#FBBF24]" fill="#FBBF24" />
                          <span className="text-[10px] text-[#FBBF24] font-medium">Earned</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed courses */}
            {data && data.completedCourses.length > 0 && (
              <div className="px-6 pb-6">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Completed Courses</p>
                <div className="space-y-2">
                  {data.completedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg"
                      style={{ background: "#1e1e1e" }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "#67C728" }}
                      >
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{course.title}</p>
                        <p className="text-xs text-gray-500">{course.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
