import { useState, useEffect } from "react";
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
  Users,
} from "lucide-react";

const baseNavItems = [
  { href: "/dashboard", label: "Home",              icon: Home,          color: "#6366f1" },
  { href: "/academy",   label: "WAVV Academy",       icon: GraduationCap, color: "#0074F4" },
  { href: "/webinars",  label: "WAVV Webinars",      icon: Video,         color: "#10b981" },
  { href: "/guides",    label: "WAVV Guides & Docs",  icon: FileText,      color: "#67C728" },
  { href: "/hands-on",  label: "WAVV Playground",    icon: FlaskConical,  color: "#a855f7" },
  { href: "/support",   label: "WAVV Support",       icon: Headphones,    color: "#FF9900" },
];
const publicPartnerItem = { href: "/partners",     label: "WAVV Partners",      icon: Users,         color: "#00A9E2" };
const approvedPartnerItem = { href: "/wavvpartner", label: "WAVV Partners",      icon: Users,         color: "#00A9E2" };

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
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    if (title) document.title = `${title} — WAVV Success Center`;
  }, [title]);

  const isAdmin = user?.role === "admin" || user?.role === "customer_admin" || user?.role === "partner_admin" || user?.role === "owner";
  const isApprovedPartner = user?.role === "partner_admin" || user?.role === "owner";
  const isAdminPage = location.startsWith("/wavvadmin");
  const navItems = [...baseNavItems, isApprovedPartner ? approvedPartnerItem : publicPartnerItem];

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
                (item.href !== "/dashboard" && location.startsWith(item.href));
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

          {/* Admin — pinned to bottom, only for admins */}
          {isAdmin && (
            <div className="px-3 pb-4" style={{ borderTop: "1px solid #1e2030", paddingTop: "12px" }}>
              <NavLink
                {...adminItem}
                isActive={location.startsWith(adminItem.href)}
                onClick={() => setSidebarOpen(false)}
              />
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

      {/* Ask WAVV floating bubble — customer pages only, bottom-right */}
      {!isAdminPage && !aiOpen && (
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
      {!isAdminPage && <WavvAIChat isOpen={aiOpen} onClose={() => setAiOpen(false)} />}

    </div>
  );
}
