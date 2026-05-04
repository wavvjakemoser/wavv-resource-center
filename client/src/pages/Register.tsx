import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Register() {
  const [, navigate] = useLocation();
  const { data: user, isLoading: authLoading } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [authLoading, user, navigate]);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/dashboard");
    },
    onError: (err) => {
      setRegisterError(err.message || "Registration failed. Please try again.");
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (!name.trim() || !email.trim() || !password) {
      setRegisterError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setRegisterError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }

    registerMutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d0d" }}>
        <div className="w-10 h-10 border-2 border-[#0074F4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#0d0d0d", fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center"
        style={{
          background: "#161616",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* WAVV logo */}
        <img
          src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
          alt="WAVV"
          className="h-8 w-auto mb-8"
        />

        <h2 className="text-white text-xl font-bold mb-1 text-center">Create your account</h2>
        <p className="text-gray-500 text-sm mb-7 text-center">Get access to the WAVV Success Center</p>

        <form onSubmit={handleRegister} className="w-full flex flex-col gap-3">
          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-500"
            style={{ background: "#242424", border: "1px solid #333" }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#0074F4";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,116,244,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#333";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-500"
            style={{ background: "#242424", border: "1px solid #333" }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#0074F4";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,116,244,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#333";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all pr-11 placeholder:text-gray-500"
              style={{ background: "#242424", border: "1px solid #333" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#0074F4";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,116,244,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#333";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Confirm Password */}
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-500"
            style={{ background: "#242424", border: "1px solid #333" }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#0074F4";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,116,244,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#333";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          {/* Error message */}
          {registerError && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
              }}
            >
              <AlertCircle size={13} className="flex-shrink-0" />
              {registerError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            style={{
              background: "linear-gradient(135deg, #0074F4, #00A9E2)",
              boxShadow: "0 4px 20px rgba(0,116,244,0.3)",
            }}
          >
            {registerMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-gray-500 text-xs mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-[#0074F4] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
