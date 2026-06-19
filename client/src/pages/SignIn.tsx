import { useEffect } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  BookmarkCheck,
  TrendingUp,
  PlayCircle,
  Users,
  ArrowLeft,
  LogIn,
} from "lucide-react";

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Track your progress",
    description: "Pick up exactly where you left off across all WAVV Academy courses.",
  },
  {
    icon: BookmarkCheck,
    title: "Bookmark lessons",
    description: "Save videos and guides to revisit anytime from your profile.",
  },
  {
    icon: PlayCircle,
    title: "Personalized learning",
    description: "Get content recommendations based on your role and activity.",
  },
  {
    icon: Users,
    title: "Team access",
    description: "Your sign-in is tied to your WAVV account — no separate credentials needed.",
  },
];

export default function SignIn() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  // If already signed in, redirect to home
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  function handleBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/");
    }
  }

  const loginUrl = getLoginUrl(typeof window !== "undefined" ? window.location.pathname : "/");

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#080a10" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid #1a1f2e" }}
      >
        <img
          src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
          alt="WAVV"
          style={{ height: "28px" }}
        />
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">

          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-white">
              Sign in to WAVV Resource Center
            </h1>
            <p className="text-sm text-gray-400">
              Use your WAVV account to unlock the full experience.
            </p>
          </div>

          {/* Sign In button */}
          <a
            href={loginUrl}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "#0074F4",
              color: "#fff",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(0,116,244,0.35)",
            }}
          >
            <LogIn size={16} />
            Sign In with WAVV
          </a>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "#1a1f2e" }} />
            <span className="text-xs text-gray-600 uppercase tracking-widest">What you unlock</span>
            <div className="flex-1 h-px" style={{ background: "#1a1f2e" }} />
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: "#1d2230", border: "1px solid #252d3d" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(0,116,244,0.15)", border: "1px solid rgba(0,116,244,0.3)" }}
                >
                  <Icon size={14} style={{ color: "#60a5fa" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-600">
            Don't have a WAVV account?{" "}
            <a
              href="https://www.wavv.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Learn more at wavv.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
