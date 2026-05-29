import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";

export default function AcceptInvite() {
  const [, navigate] = useLocation();

  // Extract token from URL query string
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const [form, setForm] = useState({ name: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // Validate the token on mount — pre-fills name/email
  const { data: invite, isLoading: validating, error: validateError } = trpc.auth.validateInvite.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  // Pre-fill name from invite
  useEffect(() => {
    if (invite?.name) setForm((f) => ({ ...f, name: invite.name }));
  }, [invite?.name]);

  const acceptMutation = trpc.auth.acceptInvite.useMutation({
    onSuccess: (data) => {
      setClaimed(true);
      // Route by role: admins → /admin, partners → /wavv-partner, everyone else → /dashboard
      const role = data?.user?.role;
      const dest =
        (role === "admin" || role === "super_admin" || role === "partner_admin" || role === "owner") ? "/wavvadmin" :
        role === "partner" ? "/wavvpartner" :
        "/dashboard";
      setTimeout(() => navigate(dest), 2000);
    },
    onError: (e) => toast.error(e.message),
  });

  const passwordErrors: string[] = [];
  if (form.password && form.password.length < 8) passwordErrors.push("At least 8 characters");
  const passwordsMatch = form.password === form.confirm;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Please enter your name."); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (!passwordsMatch) { toast.error("Passwords do not match."); return; }
    acceptMutation.mutate({ token, name: form.name.trim(), password: form.password });
  }

  // ── Layout shell (matches sign-in page style)
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0a0a0a" }}
    >
      {/* Header */}
      <header className="flex items-center px-6 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="flex items-center gap-2">
          <img
            src="https://cdn.prod.website-files.com/6257a9b430b1b2083b1a3e7f/6257a9b430b1b2083b1a3e8a_wavv-logo-white.svg"
            alt="WAVV"
            className="h-6"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="text-white font-bold text-lg tracking-tight">WAVV</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-md rounded-2xl p-8 space-y-6"
          style={{ background: "#111", border: "1px solid #1e1e1e" }}
        >
          {/* No token */}
          {!token && (
            <div className="text-center space-y-3">
              <AlertCircle size={40} className="mx-auto text-red-400" />
              <h1 className="text-xl font-bold text-white">Invalid Link</h1>
              <p className="text-sm text-gray-400">This invite link is missing a token. Ask your admin to resend the invite.</p>
              <Button onClick={() => navigate("/login")} style={{ background: "#0074F4", color: "#fff" }} className="w-full font-semibold">
                Go to Sign In
              </Button>
            </div>
          )}

          {/* Validating */}
          {token && validating && (
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#0074F4] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400">Validating your invite…</p>
            </div>
          )}

          {/* Token error */}
          {token && !validating && validateError && (
            <div className="text-center space-y-3">
              <AlertCircle size={40} className="mx-auto text-red-400" />
              <h1 className="text-xl font-bold text-white">Link Invalid or Expired</h1>
              <p className="text-sm text-gray-400">{validateError.message}</p>
              <Button onClick={() => navigate("/login")} style={{ background: "#0074F4", color: "#fff" }} className="w-full font-semibold">
                Go to Sign In
              </Button>
            </div>
          )}

          {/* Success */}
          {claimed && (
            <div className="text-center space-y-3">
              <CheckCircle2 size={48} className="mx-auto text-green-400" />
              <h1 className="text-xl font-bold text-white">Account Activated!</h1>
              <p className="text-sm text-gray-400">Welcome to WAVV Success Center. Redirecting you now…</p>
            </div>
          )}

          {/* Claim form */}
          {token && !validating && !validateError && !claimed && invite && (
            <>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">Claim Your Access</h1>
                <p className="text-sm text-gray-400">
                  You've been invited to <strong className="text-white">WAVV Success Center</strong>.
                  Set your name and password to activate your account.
                </p>
              </div>

              {/* Email (read-only) */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#9ca3af" }}
              >
                <span className="text-gray-500 text-xs">Signing in as</span>
                <span className="text-white font-medium ml-auto">{invite.email}</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="pl-9 bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-[#0074F4]"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      className="pl-9 pr-10 bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-[#0074F4]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {form.password && passwordErrors.length > 0 && (
                    <p className="text-xs text-red-400">{passwordErrors.join(" · ")}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={form.confirm}
                      onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                      className={`pl-9 pr-10 bg-black/30 text-white placeholder:text-gray-600 focus:border-[#0074F4] ${
                        form.confirm && !passwordsMatch ? "border-red-500/50" : "border-white/10"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {form.confirm && !passwordsMatch && (
                    <p className="text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full font-semibold text-sm py-2.5"
                  style={{ background: "#0074F4", color: "#fff" }}
                  disabled={
                    acceptMutation.isPending ||
                    !form.name.trim() ||
                    form.password.length < 8 ||
                    !passwordsMatch
                  }
                >
                  {acceptMutation.isPending ? "Activating…" : "Activate My Account"}
                </Button>
              </form>

              <p className="text-center text-xs text-gray-600">
                Already have an account?{" "}
                <button onClick={() => navigate("/login")} className="text-[#0074F4] hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-600" style={{ borderTop: "1px solid #1a1a1a" }}>
        © {new Date().getFullYear()} WAVV · <a href="/privacy" className="hover:text-gray-400">Privacy</a> · <a href="/terms" className="hover:text-gray-400">Terms</a>
      </footer>
    </div>
  );
}
