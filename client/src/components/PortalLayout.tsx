import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import WavvAIChat from "./WavvAIChat";
import AISearchBar from "./AISearchBar";
import { trpc } from "@/lib/trpc";
import {
  GraduationCap,
  Video,
  FileText,
  Headphones,
  Home,
  Menu,
  X,
  Sparkles,
  FlaskConical,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home",             icon: Home,          color: "#6366f1" },
  { href: "/academy",   label: "WAVV Academy",      icon: GraduationCap, color: "#0074F4" },
  { href: "/webinars",  label: "WAVV Webinars",     icon: Video,         color: "#10b981" },
  { href: "/guides",    label: "WAVV Guides & Docs", icon: FileText,      color: "#67C728" },
  { href: "/hands-on",  label: "WAVV Playground",   icon: FlaskConical,  color: "#a855f7" },
  { href: "/support",   label: "WAVV Support",      icon: Headphones,    color: "#FF9900" },
];

const adminNavItems = [
  { href: "/admin", label: "WAVV Admin", icon: Shield, color: "#f43f5e" },
];

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function PortalLayout({ children, title }: PortalLayoutProps) {
  const { data: user } = trpc.auth.me.useQuery();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // Update document title
  useEffect(() => {
    if (title) document.title = `${title} — WAVV Success Center`;
  }, [title]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#161b22", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Body row: sidebar + main ── */}
      <div className="flex flex-1 min-h-0">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto lg:h-full ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            width: "256px",
            background: "#0f1318",
            borderRight: "1px solid #1e2030",
            flexShrink: 0,
            overflowY: "auto",
          }}
        >
          {/* Logo */}
          <div
            className="flex items-center gap-2 px-4 py-4"
            style={{ borderBottom: "1px solid #1e2030", minHeight: "60px" }}
          >
            <img
              src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
              alt="WAVV"
              style={{ height: "22px", width: "auto", flexShrink: 0 }}
            />
            <button
              className="ml-auto lg:hidden text-gray-400 hover:text-white flex-shrink-0"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location === item.href ||
                  (item.href !== "/dashboard" && location.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer"
                    style={isActive ? {
                      background: `${item.color}18`,
                      border: `1px solid ${item.color}35`,
                      color: item.color,
                    } : {
                      background: "transparent",
                      border: "1px solid transparent",
                      color: "#6b7280",
                    }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = `${item.color}10`; e.currentTarget.style.borderColor = `${item.color}20`; e.currentTarget.style.color = "#e5e7eb"; } }}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "#6b7280"; } }}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: isActive ? `${item.color}28` : `${item.color}18` }}
                    >
                      <Icon size={17} style={{ color: item.color }} />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}

              {/* Admin-only nav items — only shown when logged in as admin */}
              {(user?.role === "admin" || user?.role === "super_admin") && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid #1e1e1e" }}>
                  <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Admin</p>
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer"
                        style={isActive ? {
                          background: `${item.color}18`,
                          border: `1px solid ${item.color}35`,
                          color: item.color,
                        } : {
                          background: "transparent",
                          border: "1px solid transparent",
                          color: "#6b7280",
                        }}
                        onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = `${item.color}10`; e.currentTarget.style.borderColor = `${item.color}20`; e.currentTarget.style.color = "#e5e7eb"; } }}
                        onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "#6b7280"; } }}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: isActive ? `${item.color}28` : `${item.color}18` }}
                        >
                          <Icon size={17} style={{ color: item.color }} />
                        </div>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>


          </nav>
        </aside>

        {/* ── Main column ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ── Top bar ── */}
          <header
            className="flex items-center gap-3 px-4 lg:px-6 py-3 sticky top-0 z-30"
            style={{ background: "#161b22", borderBottom: "1px solid #1e2030" }}
          >
            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-gray-400 hover:text-white flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl">
              <AISearchBar />
            </div>

            {/* WAVV AI button */}
            <button
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #0074F4, #00A9E2)",
                color: "white",
                whiteSpace: "nowrap",
              }}
              title="Open WAVV AI Chat"
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">WAVV AI</span>
            </button>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* WAVV AI Chat */}
      <WavvAIChat isOpen={aiOpen} onClose={() => setAiOpen(false)} />

    </div>
  );
}
