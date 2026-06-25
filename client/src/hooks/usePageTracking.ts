import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

// Only these customer-facing pages are tracked
const TRACKED_PAGES = new Set(['/', '/academy', '/webinars', '/guides', '/playground']);
// Internal roles are never tracked
const INTERNAL_ROLES = new Set(['owner', 'admin', 'content_admin', 'partner_admin']);

/** Returns a persistent anonymous session ID stored in localStorage */
function getAnonSessionId(): string {
  const KEY = "wavv_anon_sid";
  let sid = localStorage.getItem(KEY);
  if (!sid) {
    sid = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY, sid);
  }
  return sid;
}

/**
 * Tracks page views for all visitors:
 * - Authenticated non-internal users → tracked via tracking.pageView (userId attached server-side)
 * - Anonymous visitors → tracked via trackAnon with a localStorage session ID in metadata
 * - Internal team members (owner, admin, content_admin, partner_admin) → never tracked
 */
export function usePageTracking() {
  const [location] = useLocation();
  const lastPath = useRef<string | null>(null);
  const { data: user, isLoading: authLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: 5 * 60_000,
  });
  const pageView = trpc.tracking.pageView.useMutation({ onError: () => {} });
  const trackAnon = trpc.analytics.trackAnon.useMutation({ onError: () => {} });

  useEffect(() => {
    // Wait for auth to resolve
    if (authLoading) return;
    // Only track allowed pages
    if (!TRACKED_PAGES.has(location)) return;
    // Deduplicate — only fire once per unique route change
    if (location === lastPath.current) return;
    lastPath.current = location;

    if (user) {
      // Skip internal team members
      if (INTERNAL_ROLES.has(user.role)) return;
      // Authenticated customer — tracked with userId server-side
      pageView.mutate({ path: location });
    } else {
      // Anonymous visitor — tracked with session ID, no PII
      const sid = getAnonSessionId();
      trackAnon.mutate({
        eventType: "page_view",
        metadata: JSON.stringify({ path: location, sid }),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, authLoading, user]);
}
