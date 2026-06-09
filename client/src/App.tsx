import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
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
import AdminPanel from "./pages/AdminPanel";
import Admin from "./pages/Admin";
import HandsOn from "./pages/HandsOn";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import GoogleCallback from "./pages/GoogleCallback";
import AcceptInvite from "./pages/AcceptInvite";
import Partners from "./pages/Partners";
import WavvPartnerPortal from "./pages/WavvPartnerPortal";
import MagicAuth from "./pages/MagicAuth";
import { usePageTracking } from "./hooks/usePageTracking";
import { trpc } from "./lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect } from "wouter";

// Guard for pages that can be disabled via nav_visibility in site settings.
// Admins always bypass. Non-admins are redirected to /404 when the page is hidden.
function NavGuard({ href, children }: { href: string; children: React.ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "content_admin" || user?.role === "partner_admin" || user?.role === "owner";
  const { data: allSettings, isLoading } = trpc.siteSettings.getAll.useQuery();
  if (isAdmin) return <>{children}</>;
  if (isLoading) return null; // brief flash prevention
  const navVisibility = ((allSettings ?? {}) as Record<string, unknown>)["nav_visibility"] as Record<string, boolean> | undefined;
  if (navVisibility && navVisibility[href] === false) return <Redirect to="/404" />;
  return <>{children}</>;
}

function Router() {
  usePageTracking();
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
      <Route path="/wavvpartner">{() => <NavGuard href="/wavvpartner"><WavvPartnerPortal /></NavGuard>}</Route>
      <Route path="/wavvadmin" component={Admin} />
      <Route path="/wavvadmin/legacy" component={AdminPanel} />
      <Route path="/hands-on" component={HandsOn} />
      <Route path="/accept-invite" component={AcceptInvite} />
      <Route path="/auth/magic" component={MagicAuth} />
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
