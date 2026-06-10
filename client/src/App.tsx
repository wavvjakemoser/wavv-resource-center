import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch, useLocation, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Academy from "./pages/Academy";
import CourseDetail from "./pages/CourseDetail";
import AcademyCategory from "./pages/AcademyCategory";
import LessonViewer from "./pages/LessonViewer";
import Webinars from "./pages/Webinars";
import GuidesAndDocs from "./pages/GuidesAndDocs";
import Support from "./pages/Support";
import Admin from "./pages/Admin";
import HandsOn from "./pages/HandsOn";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import GoogleCallback from "./pages/GoogleCallback";
import AcceptInvite from "./pages/AcceptInvite";
import Partners from "./pages/Partners";
import WavvPartnerPortal from "./pages/WavvPartnerPortal";
import MagicAuth from "./pages/MagicAuth";
import MfaSetup from "./pages/MfaSetup";
import MfaVerify from "./pages/MfaVerify";
import MfaRequired from "./pages/MfaRequired";
import { usePageTracking } from "./hooks/usePageTracking";
import { useIntercom } from "./hooks/useIntercom";
import { trpc } from "./lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";


// Guard for pages that can be disabled via nav_visibility in site settings.
// Only the owner bypasses visibility checks. All other roles (including admin) are redirected to /404 when the page is hidden.
function NavGuard({ href, children }: { href: string; children: React.ReactNode }) {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";
  const { data: allSettings, isLoading } = trpc.siteSettings.getAll.useQuery();
  if (isOwner) return <>{children}</>;
  if (isLoading) return null; // brief flash prevention
  const navVisibility = ((allSettings ?? {}) as Record<string, unknown>)["nav_visibility"] as Record<string, boolean> | undefined;
  if (navVisibility && navVisibility[href] === false) return <Redirect to="/404" />;
  return <>{children}</>;
}

// Strict guard for /wavvpartner — only owner and partner_admin can access, regardless of visibility.
// Everyone else (including other admins, content_admin, regular users) gets /404.
// When hidden in nav_visibility, even owner/partner_admin see it but others always get /404.
function PartnerPortalGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: allSettings, isLoading } = trpc.siteSettings.getAll.useQuery();
  // Wait for auth to resolve before making a decision
  if (isLoading || user === undefined) return null;
  const isAllowed = user?.role === "owner" || user?.role === "partner_admin";
  if (!isAllowed) return <Redirect to="/404" />;
  // If allowed role but page is hidden, still let them through (they can see it in admin sidebar)
  return <>{children}</>;
}

// Intercepts any portal route when user is logged in but MFA is not yet configured.
function MfaGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const path = window.location.pathname;
  const MFA_EXEMPT = ["/login", "/mfa-setup", "/mfa-verify", "/mfa-required", "/accept-invite", "/auth/google/callback", "/auth/magic"];
  const isExempt = MFA_EXEMPT.some(p => path.startsWith(p));

  useEffect(() => {
    if (loading || isExempt) return;
    if (user && (user as { mfaPending?: boolean }).mfaPending) {
      navigate("/mfa-required");
    }
  }, [user, loading, isExempt, navigate]);

  if (!loading && !isExempt && user && (user as { mfaPending?: boolean }).mfaPending) {
    return null; // suppress flash while redirect fires
  }
  return <>{children}</>;
}

function Router() {
  usePageTracking();
  useIntercom();
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/auth/google/callback" component={GoogleCallback} />
      <Route path="/home" component={Dashboard} />
      <Route path="/academy" component={Academy} />
      <Route path="/academy/category/:categoryKey" component={AcademyCategory} />
      <Route path="/academy/:courseId" component={CourseDetail} />
      <Route path="/academy/:courseId/lesson/:lessonId" component={LessonViewer} />
      <Route path="/webinars" component={Webinars} />
      <Route path="/guides" component={GuidesAndDocs} />
      <Route path="/support" component={Support} />
      <Route path="/partners" component={Partners} />
      <Route path="/wavvpartner">{() => <PartnerPortalGuard><WavvPartnerPortal /></PartnerPortalGuard>}</Route>
      <Route path="/wavvadmin" component={Admin} />
      <Route path="/playground">{() => <NavGuard href="/hands-on"><HandsOn /></NavGuard>}</Route>
      <Route path="/hands-on">{() => <Redirect to="/playground" />}</Route>
      <Route path="/accept-invite" component={AcceptInvite} />
      <Route path="/auth/magic" component={MagicAuth} />
      <Route path="/mfa-setup" component={MfaSetup} />
      <Route path="/mfa-verify" component={MfaVerify} />
      <Route path="/mfa-required" component={MfaRequired} />
      <Route path="/profile" component={Profile} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "#1d2230",
                border: "1px solid #2a2a2a",
                color: "#f5f5f5",
              },
            }}
          />
          <MfaGate>
            <Router />
          </MfaGate>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
