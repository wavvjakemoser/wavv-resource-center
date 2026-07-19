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
  Rocket,
} from "lucide-react";

// ── Resources section nav items
const resourceNavItems = [
  { href: "/home", label: "Home",              icon: Home,          color: "#ffffff" },
  { href: "/academy",   label: "WAVV Academy",       icon: GraduationCap, color: "#ffffff" },
  { href: "/webinars",  label: "WAVV Webinars",      icon: Video,         color: "#ffffff" },
  { href: "/resourcehub",    label: "WAVV Resource Hub",   icon: FileText,      color: "#ffffff" },
  { href: "/playground",  label: "WAVV Playground",    icon: FlaskConical,  color: "#ffffff" },
];
// ── Programs section nav items
const programNavItems = [
  { href: "/accelerator", label: "WAVV Accelerator", icon: Rocket, color: "#ffffff" },
  { href: "/partners", label: "WAVV Partners", icon: Users, color: "#ffffff" },
];
// Combined for backward compat with visibility logic
const baseNavItems = [...resourceNavItems];
const publicPartnerItem = { href: "/partners", label: "WAVV Partners", icon: Users, color: "#ffffff" };

const adminItem = { href: "/wavvcommandcenter", label: "WAVV Command Center", icon: Shield, color: "#ffffff" };

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
  rightPanel?: React.ReactNode;
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
        ...(isActive ? {
          background: "rgba(255,255,255,0.08)",
          border: "1px solid transparent",
          borderLeft: "3px solid #ffffff",
          color: "#ffffff",
        } : {
          background: "transparent",
          border: "1px solid transparent",
          color: "#ffffff",
        }),
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "transparent";
        }
      }}
      onClick={onClick}
    >

      <span className="flex-1 min-w-0" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "clip" }}>{label}</span>

      {comingSoon && (
        <span
          className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ml-auto"
          style={{ background: "rgba(168,85,247,0.18)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }}
        >
          Soon
        </span>
      )}
      {isHidden && (
        <span
          className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ml-auto"
          style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          Hidden
        </span>
      )}
    </Link>
  );
}

export default function PortalLayout({ children, title, rightPanel }: PortalLayoutProps) {
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
  const isApprovedEmployee = !!(user as any)?.isEmployee && user?.approvalStatus === "approved";
  const isAdmin = isApprovedEmployee && (
    user?.role === "viewer" || user?.role === "publisher" || user?.role === "partner_manager" || user?.role === "owner"
  );
  const isOwner = isApprovedEmployee && user?.role === "owner";

  // Filter nav items based on visibility settings
  // All approved WAVV employees bypass nav_visibility toggles (for QA/preview)
  const allNavItems = [...resourceNavItems, ...programNavItems];
  const filterByVisibility = (items: typeof allNavItems) => items.filter((item) => {
    if (isApprovedEmployee) return true;
    if (settingsLoading) return false;
    if (navVisibility[item.href] === false) return false;
    return true;
  });
  const visibleResourceItems = filterByVisibility(resourceNavItems);
  const visibleProgramItems = filterByVisibility(programNavItems);
  // Legacy combined list for backward compat
  const navItems = filterByVisibility(allNavItems);

  // Maintenance mode — show a holding page for non-owners on non-admin pages
  if (maintenanceMode && !isOwner && !isAdminPage) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4" style={{ background: "#000000", fontFamily: "'Inter', sans-serif" }}>
        <img src="/manus-storage/wavv-logo-horizontal_6d9fa5a1.png" alt="WAVV" style={{ height: "28px", marginBottom: "8px" }} />
        <h1 className="text-2xl font-bold text-white">We'll be right back</h1>
        <p className="text-sm text-gray-400 max-w-sm text-center">The WAVV Success Center is undergoing scheduled maintenance. Check back shortly.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#000000", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Announcement Banner ── */}
      {announcementEnabled && announcementText && (
        <div
          className="w-full text-center text-xs font-medium py-2 px-4"
          style={{ background: "rgba(251,191,36,0.12)", borderBottom: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}
        >
          {announcementText}
        </div>
      )}

      {/* ── Body row: sidebar + main + optional right panel ── */}
      <div className="flex flex-1 min-h-0">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar wrapper — provides the WAVV gradient right border ── */}
        <div
          className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto lg:h-full ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            width: "320px",
            minWidth: "320px",
            flexShrink: 0,
            background: "linear-gradient(to bottom, #0074F4, #00A9E2 50%, #67C728)",
            padding: "0 2px 0 0", // 2px right padding = gradient border width
          }}
        >
        <aside
          className="h-full flex flex-col"
          style={{
            width: "100%",
            background: "#000000",
          }}
        >
          {/* Logo */}
          <div
            className="flex items-center justify-start px-4 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", minHeight: "64px" }}
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
                style={{ height: "36px", width: "auto" }}
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
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {/* ── Explore ── */}
            <div className="px-3 mb-2"><span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full" style={{ background: "rgba(255,255,255,0.95)", color: "#0f1219" }}>Explore</span></div>
            <div className="space-y-0.5 mb-3">
              {visibleResourceItems.map((item) => {
                const isActive = location === item.href || location.startsWith(item.href + "/") || (item.href === "/home" && location === "/");
                const isHiddenFromCustomers = isApprovedEmployee && !settingsLoading && navVisibility[item.href] === false;
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
            </div>

            {/* ── Programs ── */}
            {visibleProgramItems.length > 0 && (
              <>
                <div className="mx-3 my-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
                <div className="px-3 mb-2"><span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full" style={{ background: "rgba(255,255,255,0.95)", color: "#0f1219" }}>Programs</span></div>
                <div className="space-y-0.5">
                  {visibleProgramItems.map((item) => {
                    const isActive = location === item.href || location.startsWith(item.href + "/");
                    const isHiddenFromCustomers = isApprovedEmployee && !settingsLoading && navVisibility[item.href] === false;
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
                </div>
              </>
            )}

            {/* ── Quick Links ── */}
            {!settingsLoading && (allSettings as Record<string, unknown>)["chrome_extension_enabled"] !== false && (
              <>
                <div className="mx-3 my-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
                <div className="px-3 mb-2"><span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full" style={{ background: "rgba(255,255,255,0.95)", color: "#0f1219" }}>Quick Links</span></div>
                <a
                  href="https://chromewebstore.google.com/detail/wavv/ioopokcefgfbajhpcmkkbmipeenohhpe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 cursor-pointer overflow-hidden"
                  style={{ fontSize: "14px", background: "transparent", border: "1px solid transparent", color: "#ffffff" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(66,133,244,0.10)"; e.currentTarget.style.borderColor = "rgba(66,133,244,0.25)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                >

                  <span className="flex-1 min-w-0 text-sm whitespace-nowrap">WAVV Chrome Extension</span>
                  <ExternalLink size={12} className="flex-shrink-0 ml-2" style={{ color: "#ffffff" }} />
                </a>
              </>
            )}
          </nav>

          {/* ── Admin Tools section — only for admins ── */}
          {isAdmin && (
            <div className="px-3 pt-3 pb-1" style={{ borderTop: "1px solid #1e2030" }}>
              {/* Section label */}
              <div className="px-3 mb-2"><span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full" style={{ background: "rgba(255,255,255,0.95)", color: "#0f1219" }}>Admin Tools</span></div>
              <NavLink
                {...adminItem}
                isActive={location.startsWith(adminItem.href)}
                onClick={() => setSidebarOpen(false)}
              />

            </div>
          )}


        </aside>
        </div>{/* end gradient border wrapper */}

        {/* ── Main column ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ── Top bar ── */}
          <header
            className="flex items-center gap-3 px-4 lg:px-6 py-3 sticky top-0 z-30"
            style={{ background: "#000000", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
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
              <p className="text-xs mb-2" style={{ color: "#ffffff" }}>
                &copy; 2026 WAVV. All rights reserved.
              </p>
              <div className="flex items-center justify-center gap-4">
                <a
                  href="https://www.wavv.com/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs transition-colors duration-150"
                  style={{ color: "#ffffff" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                >
                  Privacy Policy
                </a>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>&bull;</span>
                <a
                  href="https://www.wavv.com/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs transition-colors duration-150"
                  style={{ color: "#ffffff" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                >
                  Terms &amp; Conditions
                </a>
              </div>
            </footer>
          </main>
        </div>

        {/* ── Right panel slot (push layout) ── */}
        {rightPanel}
      </div>

      {/* Intercom messenger is loaded via script tag — no JSX needed */}

    </div>
  );
}
