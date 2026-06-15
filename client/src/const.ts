export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Returns the WAVV IdP OIDC login URL.
 * Passes the current return path so the user lands back where they started after auth.
 */
export const getLoginUrl = (returnPath?: string): string => {
  const base = "/api/oauth/login";
  if (returnPath && returnPath !== "/") {
    return `${base}?return_path=${encodeURIComponent(returnPath)}`;
  }
  return base;
};
