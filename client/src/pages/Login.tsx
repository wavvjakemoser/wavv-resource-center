import { useEffect } from "react";

/**
 * /login — All authentication is handled by the WAVV IdP (admin.wavv.com).
 * This page immediately redirects to the OIDC login endpoint.
 * Any ?next= or ?return_path= query param is forwarded.
 */
export default function Login() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnPath = params.get("next") || params.get("return_path") || "/";
    window.location.href = `/api/oauth/login?return_path=${encodeURIComponent(returnPath)}`;
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0d1117" }}
    >
      <div className="w-8 h-8 rounded-full border-2 border-[#0074F4] border-t-transparent animate-spin" />
    </div>
  );
}
