import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function MagicAuth() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  const nextPath = new URLSearchParams(window.location.search).get("next") || "/wavvcommandcenter";

  const verify = trpc.auth.verifyMagicLink.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setStatus("success");
      setTimeout(() => navigate(nextPath), 1200);
    },
    onError: (err) => {
      setStatus("error");
      setErrorMsg(err.message || "This link is invalid or has expired.");
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg("No token found in the URL. Contact your WAVV admin to request a new invitation.");
      return;
    }
    verify.mutate({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#0d1117", fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 flex flex-col items-center gap-5 text-center"
        style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <img
          src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
          alt="WAVV"
          className="h-8 w-auto mb-2"
        />

        {status === "verifying" && (
          <>
            <div className="w-10 h-10 border-2 border-[#0074F4] border-t-transparent rounded-full animate-spin" />
            <p className="text-white font-semibold">Verifying your login link…</p>
            <p className="text-sm" style={{ color: "#8b949e" }}>Just a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{ background: "rgba(103,199,40,0.12)", color: "#67C728" }}
            >
              ✓
            </div>
            <p className="text-white font-semibold text-lg">You're in!</p>
            <p className="text-sm" style={{ color: "#8b949e" }}>Redirecting to Admin…</p>
          </>
        )}

        {status === "error" && (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{ background: "rgba(248,81,73,0.12)", color: "#f85149" }}
            >
              ✕
            </div>
            <p className="text-white font-semibold text-lg">Link expired or invalid</p>
            <p className="text-sm" style={{ color: "#8b949e" }}>{errorMsg}</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #0074F4, #0056b3)" }}
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
