import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

// Only these 7 customer-facing pages are tracked
const TRACKED_PAGES = new Set(['/', '/academy', '/webinars', '/guides', '/playground', '/support', '/wavvpartner']);
// Internal roles are never tracked
const INTERNAL_ROLES = new Set(['owner', 'admin', 'content_admin', 'partner_admin']);

/**
 * Tracks page views for authenticated non-internal users only.
 * - Waits for auth to resolve before firing any event
 * - Skips unauthenticated (anonymous) visitors entirely
 * - Skips internal team members (owner, admin, content_admin, partner_admin)
 * - Only tracks the 7 customer-facing pages
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
  const pageView = trpc.tracking.pageView.useMutation({
    onError: () => {},
  });

  useEffect(() => {
    // Wait for auth to resolve
    if (authLoading) return;
    // Skip unauthenticated visitors
    if (!user) return;
    // Skip internal team members
    if (INTERNAL_ROLES.has(user.role)) return;
    // Only track allowed pages
    if (!TRACKED_PAGES.has(location)) return;
    // Deduplicate — only fire once per unique route change
    if (location === lastPath.current) return;
    lastPath.current = location;
    pageView.mutate({ path: location });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, authLoading, user]);
}
