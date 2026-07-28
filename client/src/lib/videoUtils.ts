/**
 * Video embed URL utilities for timestamp persistence.
 *
 * When transitioning between the full-page modal and the floating PIP player,
 * we append a start-time parameter to the embed URL so the new iframe resumes
 * from where the user left off.
 *
 * Supported platforms:
 * - YouTube: `&start=<seconds>` (integer)
 * - Loom:    `#t=<seconds>s`
 * - Vimeo:   `#t=<seconds>s`
 */

/**
 * Appends a start-time parameter to an embed URL based on the platform.
 * Returns the original URL unchanged if startSeconds <= 0.
 */
export function buildEmbedUrlWithTime(url: string, startSeconds: number): string {
  if (!url || startSeconds <= 1) return url; // skip if less than 1s

  const seconds = Math.floor(startSeconds);

  if (isYouTubeUrl(url)) {
    // YouTube uses ?start=N or &start=N as a query param
    const separator = url.includes("?") ? "&" : "?";
    // Remove any existing start param
    const cleaned = url.replace(/([?&])start=\d+/g, "").replace(/[?&]$/, "");
    const sep = cleaned.includes("?") ? "&" : "?";
    return `${cleaned}${sep}start=${seconds}`;
  }

  if (isLoomUrl(url) || isVimeoUrl(url)) {
    // Loom and Vimeo use #t=Ns fragment
    const base = url.split("#")[0]; // strip existing fragment
    return `${base}#t=${seconds}s`;
  }

  // Unknown platform — return as-is
  return url;
}

/**
 * Adds `enablejsapi=1` to YouTube embed URLs for postMessage API access.
 * Returns the URL unchanged for non-YouTube URLs.
 */
export function addYouTubeApiParam(url: string): string {
  if (!isYouTubeUrl(url)) return url;
  if (url.includes("enablejsapi=1")) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}enablejsapi=1`;
}

/** Check if URL is a YouTube embed */
export function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com/embed") || url.includes("youtube-nocookie.com/embed");
}

/** Check if URL is a Loom embed */
export function isLoomUrl(url: string): boolean {
  return url.includes("loom.com/embed") || url.includes("loom.com/share");
}

/** Check if URL is a Vimeo embed */
export function isVimeoUrl(url: string): boolean {
  return url.includes("player.vimeo.com") || url.includes("vimeo.com/");
}
