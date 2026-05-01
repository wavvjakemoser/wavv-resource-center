import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import WavvAIChat from "./WavvAIChat";
import AISearchBar from "./AISearchBar";
import TrophyCase from "./TrophyCase";
import {
  BookOpen,
  Video,
  FileText,
  LifeBuoy,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/academy", label: "Academy", icon: BookOpen },
  { href: "/webinars", label: "Webinars", icon: Video },
  { href: "/guides", label: "Guides & Docs", icon: FileText },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function PortalLayout({ children, title }: PortalLayoutProps) {
  const { data: user, isLoading: loading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });
  const logout = () => logoutMutation.mutate();
  const isAuthenticated = !!user;
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#121212" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#0074F4] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading WAVV Resource Center...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen flex" style={{ background: "#121212", fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: "240px",
          background: "#0d0d0d",
          borderRight: "1px solid #1e1e1e",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #1e1e1e" }}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img
              src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
              alt="WAVV"
              className="h-6 w-auto"
            />
            <span className="text-gray-500 text-xs ml-1 whitespace-nowrap">Resource Center</span>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "text-[#0074F4] bg-[#0074F4]/10 border border-[#0074F4]/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={16} />
                  {item.label}
                  {isActive && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            })}
          </div>

          {isAdmin && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-2">Admin</p>
              <Link href="/admin"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    location === "/admin"
                      ? "text-[#FF9900] bg-[#FF9900]/10 border border-[#FF9900]/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Settings size={16} />
                  Admin Panel
              </Link>
            </div>
          )}

          {/* Quick Links */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-2">Quick Links</p>
            <div className="space-y-1">
              <a
                href="https://help.wavv.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
              >
                Help Center
              </a>
              <a
                href="https://app.wavv.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
              >
                WAVV App
              </a>
            </div>
          </div>
        </nav>

        {/* User footer */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid #1e1e1e" }}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0074F4, #67C728)" }}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name ?? "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Demo Environment Banner */}
        <div
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-center"
          style={{
            background: "#FBBF24",
            color: "#1a1000",
            letterSpacing: "0.02em",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "13px" }}>⚠</span>
          <span>DEMO ENVIRONMENT — Content and credentials are for internal review only. Not for customer use.</span>
        </div>

        {/* Top bar */}
        <header
          className="flex items-center gap-3 px-4 lg:px-6 py-3 sticky top-0 z-30"
          style={{ background: "#121212", borderBottom: "1px solid #1e1e1e" }}
        >
          <button
            className="lg:hidden text-gray-400 hover:text-white flex-shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* AI Search Bar */}
          <AISearchBar />

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Trophy Case */}
            <TrophyCase />

            {/* WAVV AI Chat */}
            <button
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: "linear-gradient(135deg, #0074F4, #00A9E2)",
                color: "white",
              }}
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">WAVV AI</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* WAVV AI Chat */}
      <WavvAIChat isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
