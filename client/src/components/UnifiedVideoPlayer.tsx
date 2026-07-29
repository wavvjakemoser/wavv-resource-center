import { useEffect, useRef, useState, useCallback } from "react";
import { X, GripHorizontal, Maximize2, Minimize2, Expand, PictureInPicture2 } from "lucide-react";
import { useVideoPlayer } from "@/contexts/VideoPlayerContext";

/**
 * UnifiedVideoPlayer — renders ONE persistent iframe at the App level.
 *
 * CRITICAL: The iframe is rendered exactly ONCE and is never conditionally
 * unmounted. Mode switches (modal ↔ floating) only change the wrapper's
 * CSS positioning/sizing. This guarantees zero playback interruption.
 */
export default function UnifiedVideoPlayer() {
  const { video, mode, popOutToFloating, expandToModal, closeVideo } = useVideoPlayer();
  const [floatingExpanded, setFloatingExpanded] = useState(true);

  // ── Drag logic (floating mode only) ──────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; origLeft: number; origTop: number } | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  // Track available width reactively so floatingWidth re-renders when panel opens/closes
  const [trackedAvailableRight, setTrackedAvailableRight] = useState(window.innerWidth);

  // Detect available width (exclude side panel if open)
  const getAvailableRight = useCallback(() => {
    // The ResourceSidePanel is rendered as a flex-shrink-0 sibling inside the body row.
    // Detect it by looking for the panel's container that has borderLeft set.
    const panels = document.querySelectorAll<HTMLElement>('[data-side-panel="true"]');
    for (const panel of panels) {
      const w = panel.offsetWidth;
      if (w > 0) return window.innerWidth - w;
    }
    return window.innerWidth;
  }, []);

  // Reset position when switching to floating mode
  useEffect(() => {
    if (mode === "floating") {
      const availableRight = getAvailableRight();
      setTrackedAvailableRight(availableRight);
      const vh = window.innerHeight;
      const mobile = availableRight < 640;
      const w = mobile
        ? Math.min(280, availableRight - 16)
        : floatingExpanded ? Math.min(800, availableRight - 32) : Math.min(480, availableRight - 32);
      const h = mobile
        ? Math.min(180, vh - 60)
        : floatingExpanded ? Math.min(500, vh - 80) : Math.min(300, vh - 80);
      setPos({ left: availableRight - w - (mobile ? 8 : 24), top: vh - h - (mobile ? 8 : 24) });
    } else {
      setPos(null);
    }
  }, [mode, floatingExpanded, getAvailableRight]);

  // Re-position AND resize when side panel opens/closes (observe DOM mutations)
  useEffect(() => {
    if (mode !== "floating") return;
    let rafId: number | null = null;
    const reposition = () => {
      const availableRight = getAvailableRight();
      setTrackedAvailableRight(availableRight);
      const vh = window.innerHeight;
      const mobile = availableRight < 640;
      const w = mobile
        ? Math.min(280, availableRight - 16)
        : floatingExpanded ? Math.min(800, availableRight - 32) : Math.min(480, availableRight - 32);
      const h = mobile
        ? Math.min(180, vh - 60)
        : floatingExpanded ? Math.min(500, vh - 80) : Math.min(300, vh - 80);
      setPos((prev) => {
        if (!prev) return { left: availableRight - w - (mobile ? 8 : 24), top: vh - h - (mobile ? 8 : 24) };
        // If current position would overlap the panel, nudge left
        const maxLeft = availableRight - w - 8;
        if (prev.left > maxLeft) return { ...prev, left: Math.max(0, maxLeft) };
        return prev;
      });
    };
    const observer = new MutationObserver(() => {
      // Debounce with rAF to catch post-transition width
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(reposition);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
    // Also listen for transitionend on the panel to catch final width after animation
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === "width" && (e.target as HTMLElement)?.hasAttribute?.("data-side-panel")) {
        reposition();
      }
    };
    document.addEventListener("transitionend", handleTransitionEnd);
    return () => {
      observer.disconnect();
      document.removeEventListener("transitionend", handleTransitionEnd);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mode, floatingExpanded, getAvailableRight]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragState.current = { startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top };
    e.preventDefault();
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragState.current) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      const newLeft = dragState.current.origLeft + dx;
      const newTop = dragState.current.origTop + dy;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = containerRef.current?.offsetWidth ?? 480;
      const h = containerRef.current?.offsetHeight ?? 300;
      const availableRight = getAvailableRight();
      setPos({
        left: Math.max(0, Math.min(availableRight - w, newLeft)),
        top: Math.max(0, Math.min(vh - h, newTop)),
      });
    }
    function onMouseUp() {
      dragState.current = null;
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Escape key: close
  useEffect(() => {
    if (!video) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVideo();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [video, closeVideo]);

  // Don't render anything if no video
  if (!video) return null;

  const accentColor = video.accentColor || "#00A9E2";
  const isModal = mode === "modal";
  const isFloating = mode === "floating";
  const availableWidth = trackedAvailableRight;
  const isMobileViewport = availableWidth < 640;
  // On mobile: smaller floating player that doesn't dominate the screen
  const floatingWidth = isMobileViewport
    ? Math.min(280, availableWidth - 16)
    : floatingExpanded
      ? Math.min(800, availableWidth - 32)
      : Math.min(480, availableWidth - 32);

  // ── Compute wrapper styles based on mode ────────────────────────────────────
  const wrapperStyle: React.CSSProperties = isModal
    ? {
        // Modal: fixed, centered, full viewport
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }
    : {
        // Floating: fixed, positioned in corner
        position: "fixed",
        zIndex: 9999,
        width: floatingWidth,
        left: pos?.left ?? "auto",
        top: pos?.top ?? "auto",
        right: pos ? "auto" : 24,
        bottom: pos ? "auto" : 24,
      };

  return (
    <div style={wrapperStyle} ref={containerRef}>
      {/* ── MODAL BACKDROP (only visible in modal mode) ── */}
      {isModal && (
        <div
          className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          onClick={closeVideo}
        />
      )}

      {/* ── PLAYER CONTAINER — always rendered, changes size/position via CSS ── */}
      <div
        className="relative overflow-hidden select-none"
        style={isModal ? {
          width: "100%",
          maxWidth: "72rem",
          margin: "0 1rem",
          zIndex: 10,
        } : {
          width: "100%",
          borderRadius: "1rem",
          background: "#111",
          border: "1px solid #2a2a2a",
          boxShadow: "0 25px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* ── HEADER BAR ── */}
        {isModal ? (
          // Modal header
          <div className="flex items-center gap-3 mb-3">
            <p className="text-sm font-semibold text-white truncate flex-1">{video.title}</p>
            <button
              type="button"
              onClick={popOutToFloating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}40` }}
              title="Pop out to mini-player"
            >
              <PictureInPicture2 size={13} /> Pop Out
            </button>
            <button
              type="button"
              onClick={closeVideo}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.7)" }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          // Floating header with drag handle
          <div
            className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing"
            style={{ borderBottom: "1px solid #2a2a2a", background: "#0d0f14" }}
            onMouseDown={onMouseDown}
          >
            <GripHorizontal size={13} style={{ color: "#4b5563", flexShrink: 0 }} />
            <p className="text-xs font-semibold text-white truncate flex-1">{video.title}</p>
            <div className="flex items-center gap-1 flex-shrink-0" onMouseDown={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={expandToModal}
                title="Back to full screen"
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Expand size={13} />
              </button>
              <button
                type="button"
                onClick={() => setFloatingExpanded((v) => !v)}
                title={floatingExpanded ? "Compact" : "Expand"}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                {floatingExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
              <button
                type="button"
                onClick={closeVideo}
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                aria-label="Close floating player"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ── VIDEO AREA — THE SINGLE PERSISTENT IFRAME ── */}
        <div
          className="relative w-full"
          style={isModal ? {
            paddingBottom: "56.25%",
            borderRadius: "0.75rem",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          } : {
            paddingBottom: "56.25%",
          }}
        >
          {video.isHosted ? (
            <video
              controls
              autoPlay
              className="absolute inset-0 w-full h-full"
              style={{ background: "#000", border: "none" }}
            >
              <source src={video.embedUrl} />
            </video>
          ) : (
            <iframe
              src={video.embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
            />
          )}
        </div>

        {/* ── FOOTER ── */}
        {isModal ? (
          <div
            className="flex items-center justify-between mt-3 px-1"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <p className="text-xs">Click outside or press Esc to close</p>
            <p className="text-xs flex items-center gap-1" style={{ color: `${accentColor}90` }}>
              <PictureInPicture2 size={11} />
              Pop out to keep watching while you browse
            </p>
          </div>
        ) : (
          <div
            className="px-3 py-1.5 flex items-center justify-between"
            style={{ borderTop: "1px solid #1e2030", background: "#0d0f14" }}
          >
            <p className="text-[10px] text-gray-600">Drag to reposition · Esc to close</p>
            <button
              type="button"
              onClick={expandToModal}
              className="text-[10px] text-gray-500 hover:text-white transition-colors flex items-center gap-1"
            >
              <Expand size={10} /> Full Screen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
