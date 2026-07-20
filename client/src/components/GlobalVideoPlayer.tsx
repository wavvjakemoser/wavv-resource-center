import { useVideoPlayer } from "@/contexts/VideoPlayerContext";
import FloatingVideoPlayer from "./FloatingVideoPlayer";

/**
 * Renders the floating video player at the App level.
 * This component reads from VideoPlayerContext and renders the player
 * when a video is active. It persists across route changes.
 */
export default function GlobalVideoPlayer() {
  const { video, closeVideo } = useVideoPlayer();

  if (!video) return null;

  return (
    <FloatingVideoPlayer
      title={video.title}
      embedUrl={video.embedUrl}
      onClose={closeVideo}
    />
  );
}
