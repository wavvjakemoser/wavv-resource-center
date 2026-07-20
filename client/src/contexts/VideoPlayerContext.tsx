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
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [video, setVideo] = useState<VideoPlayerState | null>(null);

  const playVideo = useCallback((embedUrl: string, title: string) => {
    setVideo({ embedUrl, title });
  }, []);

  const closeVideo = useCallback(() => {
    setVideo(null);
  }, []);

  return (
    <VideoPlayerContext.Provider value={{ video, playVideo, closeVideo }}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayer() {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx) throw new Error("useVideoPlayer must be used within VideoPlayerProvider");
  return ctx;
}
