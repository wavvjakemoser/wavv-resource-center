import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function GoogleCallback() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const calledRef = useRef(false);

  const googleAuthMutation = trpc.auth.googleAuth.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Signed in with Google");
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Google sign-in failed");
      navigate("/");
    },
  });

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error || !code) {
      toast.error("Google sign-in was cancelled or failed");
      navigate("/");
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    googleAuthMutation.mutate({ code, redirectUri });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f1318" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#0074F4] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Completing Google sign-in...</p>
      </div>
    </div>
  );
}
