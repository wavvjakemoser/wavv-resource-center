import UnifiedVideoPlayer from "./UnifiedVideoPlayer";

/**
 * Renders the unified video player at the App level.
 * This component persists across route changes and handles both
 * modal (full-screen) and floating (PIP) display modes with a single iframe.
 */
export default function GlobalVideoPlayer() {
  return <UnifiedVideoPlayer />;
}
