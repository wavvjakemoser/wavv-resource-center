import { useEffect, useRef, useState, useCallback } from "react";
import { X, GripHorizontal, Maximize2, Minimize2 } from "lucide-react";
import { useLocation } from "wouter";

export interface FloatingVideoPlayerProps {
  title: string;
  embedUrl: string;
  onClose: () => void;
}

/**
 * Custom in-page floating video player.
 *
 * - Draggable overlay anchored to the page DOM (not the OS).
 * - Closes automatically when the user navigates to a different route.
 * - Closes on Escape key.
 * - Resizable between compact and expanded mode.
 * - Available to all roles/users.
 */
export default function FloatingVideoPlayer({ title, embedUrl, onClose }: FloatingVideoPlayerProps) {
  const [location] = useLocation();
  const mountLocationRef = useRef(location);
  const [expanded, setExpanded] = useState(false);

  // Close when user navigates away from the page where the player was opened
  useEffect(() => {
    if (location !== mountLocationRef.current) {
      onClose();
    }
  }, [location, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Drag logic ────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; origLeft: number; origTop: number } | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  // Initialize position: bottom-right corner
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = expanded ? Math.min(800, vw - 32) : Math.min(480, vw - 32);
    const h = expanded ? Math.min(500, vh - 80) : Math.min(300, vh - 80);
    setPos({ left: vw - w - 24, top: vh - h - 24 });
  }, [expanded]);

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
      // Clamp to viewport
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

  const width = expanded ? Math.min(800, window.innerWidth - 32) : Math.min(480, window.innerWidth - 32);

  return (
    <div
      ref={containerRef}
      className="fixed z-[9999] rounded-2xl overflow-hidden select-none"
      style={{
        width,
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
        <p className="text-xs font-semibold text-white truncate flex-1">{title}</p>
        <div className="flex items-center gap-1 flex-shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Compact" : "Expand"}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            aria-label="Close floating player"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── 16:9 iframe ── */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          style={{ border: "none" }}
        />
      </div>

      {/* ── Footer hint ── */}
      <div
        className="px-3 py-1.5 flex items-center justify-between"
        style={{ borderTop: "1px solid #1e2030", background: "#0d0f14" }}
      >
        <p className="text-[10px] text-gray-600">Drag to reposition · Esc to close</p>
        <p className="text-[10px] text-gray-700">Floating Player</p>
      </div>
    </div>
  );
}
