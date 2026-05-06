import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import WavvAIChat from "./WavvAIChat";
import AISearchBar from "./AISearchBar";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  GraduationCap,
  Video,
  FileText,
  Headphones,
  Home,
  Menu,
  X,
  Bell,
  Settings,
  History,
  LogOut,
  ChevronDown,
  ExternalLink,
  Chrome,
  Sparkles,
  FlaskConical,
  User,
  Users,
  BarChart3,
  Shield,
  CheckCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/academy", label: "WAVV Academy", icon: GraduationCap },
  { href: "/webinars", label: "WAVV Webinars", icon: Video },
  { href: "/guides", label: "Guides & Docs", icon: FileText },
  { href: "/hands-on", label: "WAVV Playground", icon: FlaskConical },
  { href: "/support", label: "WAVV Support", icon: Headphones },
];

const adminNavItems = [
  { href: "/admin", label: "WAVV Admin", icon: Shield },
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Notifications
  const { data: notifications = [], refetch: refetchNotifs } = trpc.notifications.list.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 30000 }
  );
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => refetchNotifs() });
  const markAllRead = trpc.notifications.markAllRead.useMutation({ onSuccess: () => refetchNotifs() });
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [loading, isAuthenticated]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#121212" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#0074F4] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading WAVV Success Center...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Build user initials
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#121212", fontFamily: "'Inter', sans-serif" }}>
      {/* ── Demo Banner — ABOVE everything ── */}
      <div
        className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-center w-full flex-shrink-0"
        style={{
          background: "#FBBF24",
          color: "#1a1000",
          letterSpacing: "0.02em",
          zIndex: 60,
        }}
      >
        <span style={{ fontSize: "13px" }}>⚠</span>
        <span>DEMO ENVIRONMENT — Content and credentials are for internal review only. Not for customer use.</span>
      </div>

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
            background: "#0d0d0d",
            borderRight: "1px solid #1e1e1e",
            flexShrink: 0,
            overflowY: "auto",
          }}
        >
          {/* Logo — WAVV only */}
          <div
            className="flex items-center gap-2 px-4 py-4"
            style={{ borderBottom: "1px solid #1e1e1e", minHeight: "60px" }}
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "text-[#0074F4] bg-[#0074F4]/10 border border-[#0074F4]/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
              {/* Admin-only nav items */}
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
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                          isActive
                            ? "text-[#0074F4] bg-[#0074F4]/10 border border-[#0074F4]/30"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon size={16} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-2">
                Quick Links
              </p>
              <div className="space-y-0.5">
                <a
                  href="https://chrome.google.com/webstore/search/wavv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
                >
                  <Chrome size={13} />
                  WAVV Chrome Extension
                  <ExternalLink size={11} className="ml-auto opacity-50" />
                </a>
              </div>
            </div>
          </nav>
          {/* No user footer — user info is in top-right dropdown */}
        </aside>

        {/* ── Main column ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ── Top bar ── */}
          <header
            className="flex items-center gap-3 px-4 lg:px-6 py-3 sticky top-0 z-30"
            style={{ background: "#121212", borderBottom: "1px solid #1e1e1e" }}
          >
            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-gray-400 hover:text-white flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Search bar — magnifying glass only */}
            <div className="flex-1 max-w-2xl">
              <AISearchBar />
            </div>

            {/* WAVV AI button — right of search, opens chat */}
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

            {/* Right-side controls — pushed to far right */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
              {/* Notifications bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                      style={{ background: "#0074F4" }}
                    />
                  )}
                </button>

                {/* Notification dropdown */}
                {notifOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl z-50 overflow-hidden"
                    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
                      <div className="flex items-center gap-2">
                        <Bell size={14} className="text-gray-400" />
                        <span className="text-sm font-semibold text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#0074F4", color: "#fff" }}>
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllRead.mutate()}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          <CheckCheck size={12} /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                          <CheckCircle2 size={28} className="text-gray-600" />
                          <p className="text-sm font-medium text-gray-400">All caught up.</p>
                          <p className="text-xs text-gray-600">No new notifications.</p>
                        </div>
                      ) : (
                        notifications.map((n: any) => {
                          const typeIcon = n.type === "success" ? <CheckCircle2 size={14} style={{ color: "#4ade80", flexShrink: 0 }} />
                            : n.type === "warning" ? <AlertTriangle size={14} style={{ color: "#fbbf24", flexShrink: 0 }} />
                            : n.type === "announcement" ? <Megaphone size={14} style={{ color: "#e879f9", flexShrink: 0 }} />
                            : <Info size={14} style={{ color: "#38bdf8", flexShrink: 0 }} />;
                          return (
                            <div
                              key={n.id}
                              className="px-4 py-3 cursor-pointer transition-colors"
                              style={{
                                borderBottom: "1px solid #1e1e1e",
                                background: n.read ? "transparent" : "rgba(0,116,244,0.05)",
                              }}
                              onClick={() => { if (!n.read) markRead.mutate({ notificationId: n.id }); }}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5">{typeIcon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-white truncate">{n.title}</p>
                                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                                  </div>
                                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                  {n.link && (
                                    <a
                                      href={n.link}
                                      className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {n.linkLabel ?? "View →"}
                                    </a>
                                  )}
                                  <p className="text-[10px] text-gray-600 mt-1">
                                    {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar + dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #0074F4, #67C728)" }}
                  >
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-white max-w-[120px] truncate">
                    {user?.name ?? "User"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown menu */}
                {profileOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden shadow-2xl z-50"
                    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  >
                    {/* User header */}
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
                      <p className="text-sm font-semibold text-white truncate">{user?.name ?? "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email ?? ""}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all text-left"
                        style={{ textDecoration: "none" }}
                        onClick={() => setProfileOpen(false)}
                      >
                        <User size={15} className="text-gray-500" />
                        Profile
                      </Link>
                    </div>

                    {/* Sign out */}
                    <div style={{ borderTop: "1px solid #2a2a2a" }}>
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all text-left"
                        onClick={() => { setProfileOpen(false); logout(); }}
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
