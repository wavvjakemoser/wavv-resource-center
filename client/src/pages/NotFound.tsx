import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0f1a] relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00c2ff]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00ff94]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        {/* WAVV Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00c2ff] to-[#00ff94] flex items-center justify-center shadow-lg shadow-[#00c2ff]/20">
            <Search className="w-8 h-8 text-[#0a0f1a]" />
          </div>
        </div>

        {/* 404 number */}
        <div className="text-8xl font-black tracking-tight mb-2 bg-gradient-to-r from-[#00c2ff] to-[#00ff94] bg-clip-text text-transparent">
          404
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Page Not Found
        </h1>

        <p className="text-slate-400 mb-8 leading-relaxed text-base">
          This page doesn't exist or may have been moved.
          <br />
          Head back to the Success Center to find what you need.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => setLocation("/")}
            className="bg-gradient-to-r from-[#00c2ff] to-[#00ff94] text-[#0a0f1a] font-semibold hover:opacity-90 transition-opacity px-6 py-2.5 rounded-lg shadow-lg shadow-[#00c2ff]/20"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
