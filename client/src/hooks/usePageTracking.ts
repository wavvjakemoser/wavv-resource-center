import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Tracks page views by firing a mutation on every route change.
 * Only fires for authenticated users to avoid unauthorized errors.
 * Should be called once in the app root (e.g., App.tsx).
 */
export function usePageTracking() {
  const [location] = useLocation();
  const lastPath = useRef<string | null>(null);
  const { user } = useAuth();
  const pageView = trpc.tracking.pageView.useMutation({
    // Silently ignore errors — analytics should never break the app
    onError: () => {},
  });

  useEffect(() => {
    // Only fire if authenticated and path actually changed
    if (user && location !== lastPath.current) {
      lastPath.current = location;
      pageView.mutate({ path: location });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, user]);
}
