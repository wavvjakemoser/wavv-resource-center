import { useEffect, useRef, useState, useCallback } from "react";
import { X, GripHorizontal, Maximize2, Minimize2, Expand, PictureInPicture2 } from "lucide-react";
import { useVideoPlayer } from "@/contexts/VideoPlayerContext";

/**
 * UnifiedVideoPlayer — renders a SINGLE persistent iframe at the App level.
 *
 * The iframe is never destroyed when switching between modal and floating modes.
 * Only CSS positioning/sizing changes, so the video keeps playing uninterrupted.
 *
 * Modal mode: Full-screen centered overlay with backdrop
 * Floating mode: Draggable PIP in the corner
 */
export default function UnifiedVideoPlayer() {
  const { video, mode, popOutToFloating, expandToModal, closeVideo } = useVideoPlayer();
  const [floatingExpanded, setFloatingExpanded] = useState(true);

  // ── Drag logic (floating mode only) ──────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; origLeft: number; origTop: number } | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  // Reset position when switching to floating mode
  useEffect(() => {
    if (mode === "floating") {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = floatingExpanded ? Math.min(800, vw - 32) : Math.min(480, vw - 32);
      const h = floatingExpanded ? Math.min(500, vh - 80) : Math.min(300, vh - 80);
      setPos({ left: vw - w - 24, top: vh - h - 24 });
    }
  }, [mode, floatingExpanded]);

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
      setPos({
        left: Math.max(0, Math.min(vw - w, newLeft)),
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

  // Escape key: close in modal mode, close in floating mode
  useEffect(() => {
    if (!video) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVideo();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [video, closeVideo]);

  if (!video) return null;

  const accentColor = video.accentColor || "#00A9E2";

  // ── MODAL MODE ──────────────────────────────────────────────────────────────
  if (mode === "modal") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          onClick={closeVideo}
        />
        {/* Modal content */}
        <div className="relative w-full max-w-5xl mx-4 z-10 animate-in fade-in zoom-in-95 duration-200">
          {/* Header bar */}
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
          {/* Video — single persistent element */}
          <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ paddingBottom: "56.25%" }}>
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
          {/* Footer hint */}
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
        </div>
      </div>
    );
  }

  // ── FLOATING MODE ───────────────────────────────────────────────────────────
  const floatingWidth = floatingExpanded ? Math.min(800, window.innerWidth - 32) : Math.min(480, window.innerWidth - 32);

  return (
    <div
      ref={containerRef}
      className="fixed z-[9999] rounded-2xl overflow-hidden select-none"
      style={{
        width: floatingWidth,
        left: pos?.left ?? "auto",
        top: pos?.top ?? "auto",
        right: pos ? "auto" : 24,
        bottom: pos ? "auto" : 24,
        background: "#111",
        border: "1px solid #2a2a2a",
        boxShadow: "0 25px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)",
        transition: "width 0.2s ease",
      }}
    >
      {/* ── Header / drag handle ── */}
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

      {/* ── 16:9 video ── */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
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

      {/* ── Footer hint ── */}
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
    </div>
  );
}
