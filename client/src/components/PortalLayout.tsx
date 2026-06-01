import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import WavvAIChat from "./WavvAIChat";
import AISearchBar from "./AISearchBar";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
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
  Users,
  ExternalLink,
  LogOut,
} from "lucide-react";

const baseNavItems = [
  { href: "/home", label: "Home",              icon: Home,          color: "#6366f1" },
  { href: "/academy",   label: "WAVV Academy",       icon: GraduationCap, color: "#0074F4" },
  { href: "/webinars",  label: "WAVV Webinars",      icon: Video,         color: "#10b981" },
  { href: "/guides",    label: "WAVV Guides & Docs",  icon: FileText,      color: "#67C728" },
  { href: "/hands-on",  label: "WAVV Playground",    icon: FlaskConical,  color: "#a855f7" },
  { href: "/support",   label: "WAVV Support",       icon: Headphones,    color: "#FF9900" },
];
const publicPartnerItem = { href: "/partners", label: "WAVV Partners", icon: Users, color: "#00A9E2" };

const adminItem = { href: "/wavvadmin", label: "WAVV Admin", icon: Shield, color: "#f43f5e" };

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
}

function NavLink({
  href, label, icon: Icon, color, isActive, onClick,
}: { href: string; label: string; icon: React.ElementType; color: string; isActive: boolean; onClick: () => void }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 cursor-pointer"
      style={{
        fontSize: "15px",
        ...(isActive ? {
          background: `${color}18`,
          border: `1px solid ${color}35`,
          color: "#ffffff",
        } : {
          background: "transparent",
          border: "1px solid transparent",
          color: "#ffffff",
        }),
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = `${color}12`;
          e.currentTarget.style.borderColor = `${color}25`;
          e.currentTarget.style.color = "#ffffff";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "transparent";
          e.currentTarget.style.color = "#ffffff";
        }
      }}
      onClick={onClick}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: isActive ? `${color}28` : `${color}18` }}
      >
        <Icon size={17} style={{ color }} />
      </div>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function PortalLayout({ children, title }: PortalLayoutProps) {
  const { data: user } = trpc.auth.me.useQuery();
  const { logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
      window.location.href = "/";
    }
  }

  // Site settings — controls Ask WAVV, announcement banner, maintenance mode
  const { data: allSettings = {} } = trpc.siteSettings.getAll.useQuery();
  const askWavvEnabled = (allSettings as Record<string, unknown>)["ask_wavv_enabled"] !== false; // default true
  const maintenanceMode = (allSettings as Record<string, unknown>)["maintenance_mode"] === true;
  const announcementEnabled = (allSettings as Record<string, unknown>)["announcement_enabled"] === true;
  const announcementText = typeof (allSettings as Record<string, unknown>)["announcement_text"] === "string"
    ? (allSettings as Record<string, unknown>)["announcement_text"] as string
    : "";
  const wavvKnowledgeEnabled = (allSettings as Record<string, unknown>)["wavv_knowledge_enabled"] !== false; // default true
  // Nav visibility: object of { [href]: boolean } — missing key = visible (default true)
  const navVisibility = ((allSettings as Record<string, unknown>)["nav_visibility"] ?? {}) as Record<string, boolean>;

  useEffect(() => {
    if (title) document.title = `${title} — WAVV Success Center`;
  }, [title]);

  // `partner` role has portal access but is NOT an internal admin — they must not see the Admin panel link
  const isAdmin = user?.role === "admin" || user?.role === "customer_admin" || user?.role === "partner_admin" || user?.role === "owner";
  const isOwner = user?.role === "owner";
  const isAdminPage = location.startsWith("/wavvadmin");

  // Filter nav items: hidden if owner toggled off in Settings, or WAVV Knowledge disabled
  const allNavItems = [...baseNavItems, publicPartnerItem];
  const navItems = allNavItems.filter((item) => {
    // Check nav_visibility setting (missing key = visible)
    if (navVisibility[item.href] === false) return false;
    // WAVV Knowledge is the /hands-on route
    if (item.href === "/hands-on" && !wavvKnowledgeEnabled) return false;
    return true;
  });

  // Maintenance mode — show a holding page for non-owners on non-admin pages
  if (maintenanceMode && !isOwner && !isAdminPage) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4" style={{ background: "#161b22", fontFamily: "'Inter', sans-serif" }}>
        <img src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png" alt="WAVV" style={{ height: "28px", marginBottom: "8px" }} />
        <h1 className="text-2xl font-bold text-white">We'll be right back</h1>
        <p className="text-sm text-gray-400 max-w-sm text-center">The WAVV Success Center is undergoing scheduled maintenance. Check back shortly.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#161b22", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Announcement Banner ── */}
      {announcementEnabled && announcementText && (
        <div
          className="w-full text-center text-xs font-medium py-2 px-4"
          style={{ background: "rgba(251,191,36,0.12)", borderBottom: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}
        >
          {announcementText}
        </div>
      )}

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
            width: "260px",
            background: "#0f1318",
            borderRight: "1px solid #1e2030",
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <div
            className="flex items-center gap-2 px-4 py-4"
            style={{ borderBottom: "1px solid #1e2030", minHeight: "60px" }}
          >
            <a
              href="https://www.wavv.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
            >
              <img
                src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png"
                alt="WAVV"
                style={{ height: "22px", width: "auto" }}
              />
            </a>
            <button
              className="ml-auto lg:hidden text-gray-400 hover:text-white flex-shrink-0"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          {/* Main navigation — scrollable */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                location === item.href ||
                (item.href !== "/home" && location.startsWith(item.href));
              return (
                <NavLink
                  key={item.href}
                  {...item}
                  isActive={isActive}
                  onClick={() => setSidebarOpen(false)}
                />
              );
            })}
          </nav>

          {/* Sign out — pinned to bottom for all logged-in users */}
          {user && (
            <div className="px-3 pb-2" style={{ borderTop: "1px solid #1e2030", paddingTop: "10px" }}>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 cursor-pointer"
                style={{
                  fontSize: "15px",
                  background: "transparent",
                  border: "1px solid transparent",
                  color: "rgba(255,255,255,0.45)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(248,81,73,0.08)";
                  e.currentTarget.style.borderColor = "rgba(248,81,73,0.2)";
                  e.currentTarget.style.color = "#f85149";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(248,81,73,0.1)" }}
                >
                  <LogOut size={16} style={{ color: "#f85149" }} />
                </div>
                <span className="truncate">{signingOut ? "Signing out…" : "Sign Out"}</span>
              </button>
            </div>
          )}

          {/* Admin — pinned to bottom, only for admins */}
          {isAdmin && (
            <div className="px-3 pb-4 space-y-1" style={{ borderTop: "1px solid #1e2030", paddingTop: "12px" }}>
              <NavLink
                {...adminItem}
                isActive={location.startsWith(adminItem.href)}
                onClick={() => setSidebarOpen(false)}
              />
              {/* Partner portal preview link — only visible on /wavvadmin, opens in new tab */}
              {isAdminPage && (user?.role === "owner" || user?.role === "partner_admin" || user?.role === "customer_admin") && (
                <a
                  href="/wavvpartner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 cursor-pointer"
                  style={{
                    fontSize: "15px",
                    background: "rgba(0,169,226,0.08)",
                    border: "1px solid rgba(0,169,226,0.18)",
                    color: "#00A9E2",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,169,226,0.14)";
                    e.currentTarget.style.borderColor = "rgba(0,169,226,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0,169,226,0.08)";
                    e.currentTarget.style.borderColor = "rgba(0,169,226,0.18)";
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(0,169,226,0.15)" }}
                  >
                    <Users size={17} style={{ color: "#00A9E2" }} />
                  </div>
                  <span className="truncate flex-1">Partner Portal</span>
                  <ExternalLink size={13} style={{ color: "rgba(0,169,226,0.6)", flexShrink: 0 }} />
                </a>
              )}
            </div>
          )}
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


          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1">{children}</div>
            {/* Footer */}
            <footer className="mt-auto px-6 py-8 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                &copy; 2026 WAVV. All rights reserved.
              </p>
              <div className="flex items-center justify-center gap-4">
                <a
                  href="https://www.wavv.com/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs transition-colors duration-150"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                >
                  Privacy Policy
                </a>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>&bull;</span>
                <a
                  href="https://www.wavv.com/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs transition-colors duration-150"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                >
                  Terms &amp; Conditions
                </a>
              </div>
            </footer>
          </main>
        </div>
      </div>

      {/* Ask WAVV floating bubble — customer pages only, controlled by siteSettings */}
      {!isAdminPage && askWavvEnabled && !aiOpen && (
        <button
          onClick={() => setAiOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-2.5 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #0074F4, #00A9E2)",
            color: "white",
            boxShadow: "0 4px 28px rgba(0, 116, 244, 0.4)",
            fontWeight: 600,
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
          title="Ask WAVV"
        >
          <Sparkles size={15} />
          <span>Ask WAVV</span>
        </button>
      )}

      {/* Ask WAVV Chat Panel — customer pages only */}
      {!isAdminPage && askWavvEnabled && <WavvAIChat isOpen={aiOpen} onClose={() => setAiOpen(false)} />}

    </div>
  );
}
