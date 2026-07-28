import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

/**
 * Unified Video Player Context
 *
 * Architecture: A SINGLE iframe is rendered at the App level (in UnifiedVideoPlayer).
 * It can be displayed in two visual modes:
 *   - "modal": Full-screen centered overlay (what pages show when you click Watch)
 *   - "floating": Draggable PIP in the bottom-right corner
 *
 * Transitions between modes just change CSS — the iframe is NEVER destroyed/recreated.
 * This means the video keeps playing with zero interruption regardless of mode switch.
 */

export type VideoDisplayMode = "modal" | "floating";

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
  /** Start playing a video in modal mode */
  openVideoModal: (embedUrl: string, title: string, accentColor?: string, isHosted?: boolean) => void;
  /** Switch from modal to floating (pop out) — no iframe reload */
  popOutToFloating: () => void;
  /** Switch from floating back to modal (expand) — no iframe reload */
  expandToModal: () => void;
  /** Close the video entirely (stops playback) */
  closeVideo: () => void;
  /** Whether a video is currently active */
  isPlaying: boolean;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [video, setVideo] = useState<VideoState | null>(null);
  const [mode, setMode] = useState<VideoDisplayMode>("modal");

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

  const closeVideo = useCallback(() => {
    setVideo(null);
    setMode("modal");
  }, []);

  return (
    <VideoPlayerContext.Provider value={{
      video,
      mode,
      openVideoModal,
      popOutToFloating,
      expandToModal,
      closeVideo,
      isPlaying: video !== null,
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
