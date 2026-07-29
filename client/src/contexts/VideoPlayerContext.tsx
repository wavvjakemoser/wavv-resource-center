import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

/**
 * Unified Video Player Context
 *
 * Architecture: A SINGLE iframe is rendered at the App level (in UnifiedVideoPlayer).
 * It can be displayed in three visual modes:
 *   - "inline": Rendered inside a portal target on the page (no overlay, no floating)
 *   - "modal": Full-screen centered overlay (what pages show when you click Watch)
 *   - "floating": Draggable PIP in the bottom-right corner
 *
 * Transitions between modes just change CSS / portal target — the iframe is NEVER
 * destroyed/recreated. This means the video keeps playing with zero interruption
 * regardless of mode switch.
 */

export type VideoDisplayMode = "modal" | "floating" | "inline";

interface VideoState {
  embedUrl: string;
  title: string;
  accentColor?: string;
  isHosted?: boolean; // for /manus-storage hosted videos
}

interface VideoPlayerContextValue {
  /** Currently playing video (null = nothing playing) */
  video: VideoState | null;
  /** Current display mode */
  mode: VideoDisplayMode;
  /** Start playing a video in inline mode (rendered into a portal target) */
  openVideoInline: (embedUrl: string, title: string, accentColor?: string, isHosted?: boolean) => void;
  /** Start playing a video in modal mode */
  openVideoModal: (embedUrl: string, title: string, accentColor?: string, isHosted?: boolean) => void;
  /** Switch from modal/inline to floating (pop out) — no iframe reload */
  popOutToFloating: () => void;
  /** Switch from floating back to modal (expand) — no iframe reload */
  expandToModal: () => void;
  /** Switch from floating/modal back to inline — no iframe reload */
  returnToInline: () => void;
  /** Close the video entirely (stops playback) */
  closeVideo: () => void;
  /** Whether a video is currently active */
  isPlaying: boolean;
  /** Ref to the inline portal target element (set by the page that hosts the inline player) */
  inlineTargetRef: React.MutableRefObject<HTMLDivElement | null>;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [video, setVideo] = useState<VideoState | null>(null);
  const [mode, setMode] = useState<VideoDisplayMode>("modal");
  const inlineTargetRef = useRef<HTMLDivElement | null>(null);

  const openVideoInline = useCallback((embedUrl: string, title: string, accentColor?: string, isHosted?: boolean) => {
    setVideo({ embedUrl, title, accentColor, isHosted });
    setMode("inline");
  }, []);

  const openVideoModal = useCallback((embedUrl: string, title: string, accentColor?: string, isHosted?: boolean) => {
    setVideo({ embedUrl, title, accentColor, isHosted });
    setMode("modal");
  }, []);

  const popOutToFloating = useCallback(() => {
    setMode("floating");
  }, []);

  const expandToModal = useCallback(() => {
    setMode("modal");
  }, []);

  const returnToInline = useCallback(() => {
    setMode("inline");
  }, []);

  const closeVideo = useCallback(() => {
    setVideo(null);
    setMode("modal");
  }, []);

  return (
    <VideoPlayerContext.Provider value={{
      video,
      mode,
      openVideoInline,
      openVideoModal,
      popOutToFloating,
      expandToModal,
      returnToInline,
      closeVideo,
      isPlaying: video !== null,
      inlineTargetRef,
    }}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayer() {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx) throw new Error("useVideoPlayer must be used within VideoPlayerProvider");
  return ctx;
}
