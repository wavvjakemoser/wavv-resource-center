import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface VideoPlayerState {
  embedUrl: string;
  title: string;
}

interface VideoPlayerContextValue {
  /** Currently playing video (null = no floating player visible) */
  video: VideoPlayerState | null;
  /** Open the floating player with a new video. Replaces any currently playing video. */
  playVideo: (embedUrl: string, title: string) => void;
  /** Close the floating player */
  closeVideo: () => void;
  /** Callback to expand back to full screen — set by the page that has the full modal */
  onExpandFull: (() => void) | null;
  /** Register the expand-full callback (called by pages with full-screen modal) */
  setExpandFullHandler: (handler: (() => void) | null) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [video, setVideo] = useState<VideoPlayerState | null>(null);
  const [expandFullHandler, setExpandFullHandlerState] = useState<(() => void) | null>(null);

  const playVideo = useCallback((embedUrl: string, title: string) => {
    setVideo({ embedUrl, title });
  }, []);

  const closeVideo = useCallback(() => {
    setVideo(null);
  }, []);

  const setExpandFullHandler = useCallback((handler: (() => void) | null) => {
    setExpandFullHandlerState(() => handler);
  }, []);

  return (
    <VideoPlayerContext.Provider value={{ video, playVideo, closeVideo, onExpandFull: expandFullHandler, setExpandFullHandler }}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayer() {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx) throw new Error("useVideoPlayer must be used within VideoPlayerProvider");
  return ctx;
}
