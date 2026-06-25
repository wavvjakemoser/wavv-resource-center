import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import AISearchBar from "./AISearchBar";
import { trpc } from "@/lib/trpc";
import {
  GraduationCap,
  Video,
  FileText,
  Home,
  Menu,
  X,
  FlaskConical,
  Shield,
  Users,
  ExternalLink,
} from "lucide-react";

const baseNavItems = [
  { href: "/home", label: "Home",              icon: Home,          color: "#6366f1" },
  { href: "/academy",   label: "WAVV Academy",       icon: GraduationCap, color: "#0074F4" },
  { href: "/webinars",  label: "WAVV Webinars",      icon: Video,         color: "#10b981" },
  { href: "/guides",    label: "WAVV Resource Hub",   icon: FileText,      color: "#67C728" },
  { href: "/playground",  label: "WAVV Playground",    icon: FlaskConical,  color: "#a855f7" },
];
const publicPartnerItem = { href: "/partners", label: "WAVV Partners", icon: Users, color: "#00A9E2" };

const adminItem = { href: "/wavvcommandcenter", label: "WAVV Command Center", icon: Shield, color: "#f43f5e" };

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
}

function NavLink({
  href, label, icon: Icon, color, isActive, onClick, comingSoon, isHidden,
}: { href: string; label: string; icon: React.ElementType; color: string; isActive: boolean; onClick: () => void; comingSoon?: boolean; isHidden?: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 cursor-pointer"
      style={{
        fontSize: "15px",
        opacity: isHidden ? 0.55 : 1,
        ...(isActive ? {
          background: `${color}18`,
          border: `1px solid ${color}35`,
          color: "#ffffff",
        } : isHidden ? {
          background: "rgba(251,191,36,0.06)",
          border: "1px solid #fbbf24",
          color: "#ffffff",
        } : {
          background: "transparent",
          border: "1px solid transparent",
          color: "#ffffff",
        }),
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = isHidden ? "rgba(251,191,36,0.12)" : `${color}12`;
          e.currentTarget.style.borderColor = isHidden ? "#fbbf24" : `${color}25`;
          e.currentTarget.style.color = "#ffffff";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = isHidden ? "rgba(251,191,36,0.06)" : "transparent";
          e.currentTarget.style.borderColor = isHidden ? "#fbbf24" : "transparent";
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
      <span className="flex-1 min-w-0" style={{ whiteSpace: "nowrap", overflow: "visible" }}>{label}</span>

      {comingSoon && !isHidden && (
        <span
          className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(168,85,247,0.18)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }}
        >
          Soon
        </span>
      )}
    </Link>
  );
}

export default function PortalLayout({ children, title }: PortalLayoutProps) {
  const { data: user, isLoading: authLoading } = trpc.auth.me.useQuery();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdminPage = location.startsWith("/wavvcommandcenter");

  // Site settings
  const { data: allSettings = {}, isLoading: settingsLoading } = trpc.siteSettings.getAll.useQuery();
  const maintenanceMode = (allSettings as Record<string, unknown>)["maintenance_mode"] === true;
  const announcementEnabled = (allSettings as Record<string, unknown>)["announcement_enabled"] === true;
  const announcementText = typeof (allSettings as Record<string, unknown>)["announcement_text"] === "string"
    ? (allSettings as Record<string, unknown>)["announcement_text"] as string
    : "";
  // Nav visibility: object of { [href]: boolean } — missing key = visible (default true)
  const navVisibility = ((allSettings as Record<string, unknown>)["nav_visibility"] ?? {}) as Record<string, boolean>;

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // (settings declared above, before Intercom effects)

  useEffect(() => {
    if (title) document.title = `${title} — WAVV Success Center`;
  }, [title]);

  // Command Center link is only visible to approved WAVV employees.
  // Pending employees see the approval-pending screen but NOT the nav link.
  const isApprovedEmployee = user?.accountType === "employee" && user?.approvalStatus === "approved";
  const isAdmin = isApprovedEmployee && (
    user?.role === "viewer" || user?.role === "publisher" || user?.role === "partner_manager" || user?.role === "owner"
  );
  const isOwner = isApprovedEmployee && user?.role === "owner";

  // All users see all base nav items + partner item
  // Only the owner bypasses nav_visibility toggles (for QA/admin purposes)
  // admin/content_admin/partner_admin roles respect visibility toggles like regular users
  // While settings are loading, non-owners see no nav items to prevent flash of hidden content
  const allNavItems = [...baseNavItems, publicPartnerItem];
  const navItems = allNavItems.filter((item) => {
    // Only the owner bypasses visibility toggles (and doesn't need to wait for settings)
    if (isOwner) return true;
    // Suppress all items until settings have loaded to prevent flash of hidden content
    if (settingsLoading) return false;
    // Check nav_visibility setting (missing key = visible)
    if (navVisibility[item.href] === false) return false;
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
            width: "280px",
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
              // Show hidden badge only to the owner for items toggled off in nav_visibility
              const isHiddenFromCustomers = isOwner && !settingsLoading && navVisibility[item.href] === false;
              return (
                <NavLink
                  key={item.href}
                  {...item}
                  isActive={isActive}
                  isHidden={isHiddenFromCustomers}
                  onClick={() => setSidebarOpen(false)}
                />
              );
            })}
          </nav>

          {/* ── Admin Tools section — only for admins ── */}
          {isAdmin && (
            <div className="px-3 pt-3 pb-1" style={{ borderTop: "1px solid #1e2030" }}>
              {/* Section label */}
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Admin Tools</p>
              <NavLink
                {...adminItem}
                isActive={location.startsWith(adminItem.href)}
                onClick={() => setSidebarOpen(false)}
              />
              {/* Partner portal — owner/partner_admin only */}
              {(user?.role === "owner" || user?.role === "partner_manager") && (() => {
                const isPartnerPortalHidden = !settingsLoading && navVisibility["/wavvpartner"] === false;
                return (
                  <a
                    href="/wavvpartner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 cursor-pointer overflow-hidden"
                    style={{
                      fontSize: "14px",
                      opacity: isPartnerPortalHidden ? 0.55 : 1,
                      background: isPartnerPortalHidden ? "rgba(251,191,36,0.06)" : "rgba(0,169,226,0.08)",
                      border: isPartnerPortalHidden ? "1px solid #fbbf24" : "1px solid rgba(0,169,226,0.18)",
                      color: "#00A9E2",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isPartnerPortalHidden ? "rgba(251,191,36,0.12)" : "rgba(0,169,226,0.14)";
                      e.currentTarget.style.borderColor = isPartnerPortalHidden ? "#fbbf24" : "rgba(0,169,226,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isPartnerPortalHidden ? "rgba(251,191,36,0.06)" : "rgba(0,169,226,0.08)";
                      e.currentTarget.style.borderColor = isPartnerPortalHidden ? "#fbbf24" : "rgba(0,169,226,0.18)";
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(0,169,226,0.15)" }}
                    >
                      <Users size={17} style={{ color: "#00A9E2" }} />
                    </div>
                    <span className="flex-1 min-w-0 truncate">WAVV Partners Portal</span>
                  </a>
                );
              })()}
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

            {/* Search bar — shrinks on mobile so avatar stays visible */}
            <div className="flex-1 min-w-0 max-w-2xl">
              <AISearchBar />
            </div>

            {/* Sign In / Avatar — always pinned to far right */}
            <div className="ml-auto flex-shrink-0 flex items-center">
            {user && (() => {
              const initials = (user.name ?? user.email ?? "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
              const rawAvatarUrl = (user.avatarUrl ?? "").trim();
              // Strip any existing Google size suffix (e.g. =s96-c) before appending our own
              const pictureSrc = rawAvatarUrl ? `${rawAvatarUrl.replace(/=s\d+(-c)?$/, "")}=s40-c` : null;
              return (
                <a
                  href="/profile"
                  className="flex-shrink-0 flex items-center gap-2 px-2 py-1 rounded-xl transition-all duration-150"
                  style={{ textDecoration: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  title={user.name ?? user.email ?? "Profile"}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                >
                  {pictureSrc ? (
                    <img
                      src={pictureSrc}
                      alt={user.name ?? "Avatar"}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      style={{ border: "2px solid rgba(255,255,255,0.12)", display: "block" }}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.style.display = "none";
                        const fallback = img.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#0074F4,#00A9E2)", color: "#fff", display: pictureSrc ? "none" : "flex" }}
                  >
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-white hidden sm:block" style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.name ?? user.email?.split("@")[0]}
                  </span>
                </a>
                            );            })()}

            {/* Sign In button — shown only when confirmed not logged in (suppress during auth load to prevent flash) */}
            {!authLoading && !user && (
              <a
                href="/api/oauth/login"
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  background: "#0074F4",
                  color: "#fff",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#0060d4"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#0074F4"; }}
              >
                Sign In
              </a>
            )}
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

      {/* Intercom messenger is loaded via script tag — no JSX needed */}

    </div>
  );
}
