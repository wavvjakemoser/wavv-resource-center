import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
/**
 * Tracks anonymous page views by firing a mutation on every route change.
 * The server-side procedure silently drops any authenticated user,
 * so this hook fires for everyone — auth filtering happens server-side.
 */
export function usePageTracking() {
  const [location] = useLocation();
  const lastPath = useRef<string | null>(null);
  const pageView = trpc.tracking.pageView.useMutation({
    // Silently ignore errors — analytics should never break the app
    onError: () => {},
  });

  useEffect(() => {
    if (location !== lastPath.current) {
      lastPath.current = location;
      pageView.mutate({ path: location });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
}
