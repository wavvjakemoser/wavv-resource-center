import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── Intercom integration ─────────────────────────────────────────────────────
declare global {
  interface Window {
    Intercom?: (...args: unknown[]) => void;
    intercomSettings?: Record<string, unknown>;
  }
}

const INTERCOM_APP_ID = import.meta.env.VITE_INTERCOM_APP_ID as string | undefined;

// Official Intercom snippet — installs the stub queue so calls before script load are buffered
function installIntercomStub() {
  if (typeof window.Intercom === "function" && !(window.Intercom as unknown as { q?: unknown[] }).q) return; // fully loaded
  const i = function (...args: unknown[]) {
    (i as unknown as { q: unknown[] }).q.push(args);
  } as unknown as ((...args: unknown[]) => void) & { q: unknown[] };
  i.q = [];
  window.Intercom = i;
}

function loadIntercomScript(appId: string) {
  if (document.getElementById("intercom-script")) return;
  installIntercomStub();
  const s = document.createElement("script");
  s.id = "intercom-script";
  s.type = "text/javascript";
  s.async = true;
  s.src = `https://widget.intercom.io/widget/${appId}`;
  document.head.appendChild(s);
}

function bootIntercom(user: { name?: string | null; email?: string | null } | null | undefined) {
  if (!INTERCOM_APP_ID) return;
  installIntercomStub(); // ensure stub exists even if script hasn't loaded yet
  const settings: Record<string, unknown> = { app_id: INTERCOM_APP_ID };
  if (user?.email) {
    settings.name = user.name ?? undefined;
    settings.email = user.email;
  }
  window.Intercom!("boot", settings);
}

/**
 * Global Intercom hook — must be called once at the App level so the messenger
 * is available on every route, including the home page (which doesn't use PortalLayout).
 */
export function useIntercom() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { data: allSettings } = trpc.siteSettings.getAll.useQuery();

  const intercomEnabled =
    allSettings === undefined
      ? true // default true while loading
      : (allSettings as Record<string, unknown>)["intercom_enabled"] !== false;

  // Step 1: Load the Intercom script once on mount
  useEffect(() => {
    if (INTERCOM_APP_ID) loadIntercomScript(INTERCOM_APP_ID);
  }, []);

  // Step 2: Boot immediately (anonymous) — don't wait for auth
  useEffect(() => {
    if (!INTERCOM_APP_ID) return;
    if (!intercomEnabled) {
      window.Intercom?.("shutdown");
      return;
    }
    // Boot with anonymous identity — Fin will prompt the user to identify themselves
    bootIntercom(null);
  }, [intercomEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 3: Once user identity resolves, update Intercom with their details
  useEffect(() => {
    if (!INTERCOM_APP_ID || !intercomEnabled) return;
    if (user === undefined) return; // still loading
    if (user) {
      // Logged-in user — pass identity
      bootIntercom(user);
    }
    // user === null means not logged in — anonymous boot from step 2 is sufficient
  }, [user, intercomEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 4: Notify Intercom of page changes
  useEffect(() => {
    if (intercomEnabled) window.Intercom?.("update");
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps
}
