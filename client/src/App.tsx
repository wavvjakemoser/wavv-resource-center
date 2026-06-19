import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import Partners from "./pages/Partners";
import WavvPartnerPortal from "./pages/WavvPartnerPortal";
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

// Strict guard for /wavvcommandcenter — only owner, publisher, and partner_manager roles.
// Any signed-in customer (role="user") or viewer is redirected to home.
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user === undefined) return null; // still loading
  if (!user) {
    window.location.href = "/api/oauth/login?return_path=/wavvcommandcenter";
    return null;
  }
  const ADMIN_ROLES = ["owner", "publisher", "partner_manager"];
  if (!ADMIN_ROLES.includes(user.role)) return <Redirect to="/" />;
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
  const isAllowed = user?.role === "owner" || user?.role === "partner_manager";
  if (!isAllowed) return <Redirect to="/404" />;
  // If allowed role but page is hidden, still let them through (they can see it in admin sidebar)
  return <>{children}</>;
}

function Router() {
  usePageTracking();
  useIntercom();
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/signin" component={SignIn} />
      <Route path="/home">{() => <Redirect to="/" />}</Route>
      <Route path="/resources">{() => <Redirect to="/guides" />}</Route>
      <Route path="/academy" component={Academy} />
      <Route path="/academy/category/:categoryKey" component={AcademyCategory} />
      <Route path="/academy/:courseId" component={CourseDetail} />
      <Route path="/academy/:courseId/lesson/:lessonId" component={LessonViewer} />
      <Route path="/webinars" component={Webinars} />
      <Route path="/guides" component={GuidesAndDocs} />
      <Route path="/support">{() => <NavGuard href="/support"><Support /></NavGuard>}</Route>
      <Route path="/partners">{() => <NavGuard href="/partners"><Partners /></NavGuard>}</Route>
      <Route path="/wavvpartner">{() => <PartnerPortalGuard><WavvPartnerPortal /></PartnerPortalGuard>}</Route>
      <Route path="/wavvcommandcenter">{() => <AdminGuard><Admin /></AdminGuard>}</Route>
      <Route path="/wavvadmin">{() => <Redirect to="/wavvcommandcenter" />}</Route>
      <Route path="/playground">{() => <NavGuard href="/hands-on"><HandsOn /></NavGuard>}</Route>
      <Route path="/hands-on">{() => <Redirect to="/playground" />}</Route>
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
