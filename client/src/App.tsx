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
import WebinarOnDemand from "./pages/WebinarOnDemand";
import WebinarLiveExclusive from "./pages/WebinarLiveExclusive";
import WebinarExclusiveOnDemand from "./pages/WebinarExclusiveOnDemand";
import PlaygroundGoHighLevel from "./pages/PlaygroundGoHighLevel";
import PlaygroundHubSpot from "./pages/PlaygroundHubSpot";
import PlaygroundSalesforce from "./pages/PlaygroundSalesforce";
import GuidesAndDocs from "./pages/GuidesAndDocs";
import ResourceHelpArticles from "./pages/ResourceHelpArticles";
import ResourcePdfs from "./pages/ResourcePdfs";
import ResourceFaqs from "./pages/ResourceFaqs";
import Admin from "./pages/Admin";
import HandsOn from "./pages/HandsOn";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Partners from "./pages/Partners";
import WavvPartnerPortal from "./pages/WavvPartnerPortal";
import Accelerator from "./pages/Accelerator";
import AcceleratorSession from "./pages/AcceleratorSession";
import { usePageTracking } from "./hooks/usePageTracking";
import { useIntercom } from "./hooks/useIntercom";
import { trpc } from "./lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useVersionCheck } from "./hooks/useVersionCheck";
import { UpdateBanner } from "./components/UpdateBanner";
import { VideoPlayerProvider } from "./contexts/VideoPlayerContext";
import GlobalVideoPlayer from "./components/GlobalVideoPlayer";


// Guard for pages that can be disabled via nav_visibility in site settings.
// All approved WAVV employees bypass visibility checks (owner, publisher, viewer, partner_manager).
// Customers and guests are redirected to /404 when the page is hidden.
function NavGuard({ href, children }: { href: string; children: React.ReactNode }) {
  const { user } = useAuth();
  const isApprovedEmployee = (user as any)?.isEmployee && (user as any)?.approvalStatus === "approved";
  const { data: allSettings, isLoading } = trpc.siteSettings.getAll.useQuery();
  if (isApprovedEmployee) return <>{children}</>;
  if (isLoading) return null; // brief flash prevention
  const navVisibility = ((allSettings ?? {}) as Record<string, unknown>)["nav_visibility"] as Record<string, boolean> | undefined;
  if (navVisibility && navVisibility[href] === false) return <Redirect to="/404" />;
  return <>{children}</>;
}

// Strict guard for /wavvcommandcenter — WAVV employees only (accountType=employee AND approvalStatus=approved).
// Customers and guests are silently redirected to home. Pending employees see an approval-pending screen.
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user === undefined) return null; // still loading
  if (!user) {
    window.location.href = "/api/oauth/login?return_path=/wavvcommandcenter";
    return null;
  }
  // Must be a WAVV employee (facet-based: isEmployee can be true even if accountType is "customer")
  if (!(user as any).isEmployee) return <Redirect to="/" />;
  // Must be approved — pending employees see a holding screen
  if ((user as any).approvalStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d1117" }}>
        <div className="text-center max-w-md px-6">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Approval Pending</h2>
          <p className="text-gray-400 text-sm">Your account has been flagged for Command Center access review. Jake has been notified and will approve your access shortly.</p>
          <a href="/" className="mt-6 inline-block text-sm text-[#0074F4] hover:underline">← Return to Success Center</a>
        </div>
      </div>
    );
  }
  if ((user as any).approvalStatus === "denied") return <Redirect to="/" />;
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
      <Route path="/playground">{() => <NavGuard href="/playground"><HandsOn /></NavGuard>}</Route>
      <Route path="/playground/gohighlevel">{() => <NavGuard href="/playground"><PlaygroundGoHighLevel /></NavGuard>}</Route>
      <Route path="/playground/hubspot">{() => <NavGuard href="/playground"><PlaygroundHubSpot /></NavGuard>}</Route>
      <Route path="/playground/salesforce">{() => <NavGuard href="/playground"><PlaygroundSalesforce /></NavGuard>}</Route>
      <Route path="/home">{() => <Redirect to="/" />}</Route>
      <Route path="/resources">{() => <Redirect to="/resourcehub" />}</Route>
      <Route path="/academy" component={Academy} />
      <Route path="/academy/category/:categoryKey" component={AcademyCategory} />
      <Route path="/academy/:courseId" component={CourseDetail} />
      <Route path="/academy/:courseId/lesson/:lessonId" component={LessonViewer} />
      <Route path="/webinars" component={Webinars} />
      <Route path="/webinars/on-demand" component={WebinarOnDemand} />
      <Route path="/webinars/live-exclusive" component={WebinarLiveExclusive} />
      <Route path="/webinars/exclusive-on-demand" component={WebinarExclusiveOnDemand} />
      <Route path="/resourcehub" component={GuidesAndDocs} />
      <Route path="/resources/help-articles" component={ResourceHelpArticles} />
      <Route path="/resources/pdfs" component={ResourcePdfs} />
      <Route path="/resources/faqs" component={ResourceFaqs} />
      <Route path="/guides">{() => <Redirect to="/resourcehub" />}</Route>
      <Route path="/accelerator">{() => <NavGuard href="/accelerator"><Accelerator /></NavGuard>}</Route>
      <Route path="/accelerator/:id/:section">{() => <NavGuard href="/accelerator"><AcceleratorSession /></NavGuard>}</Route>
      <Route path="/accelerator/:id">{() => <NavGuard href="/accelerator"><AcceleratorSession /></NavGuard>}</Route>
      <Route path="/partners">{() => <NavGuard href="/partners"><Partners /></NavGuard>}</Route>
      <Route path="/wavvpartner">{() => <Redirect to="/404" />}</Route>
      <Route path="/wavvcommandcenter">{() => <AdminGuard><Admin /></AdminGuard>}</Route>
      <Route path="/wavvadmin">{() => <Redirect to="/wavvcommandcenter" />}</Route>
      <Route path="/hands-on">{() => <Redirect to="/playground" />}</Route>
      <Route path="/profile" component={Profile} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function VersionWatcher() {
  const { updateAvailable, deployedAt } = useVersionCheck();
  if (!updateAvailable) return null;
  return <UpdateBanner deployedAt={deployedAt} />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <VersionWatcher />
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
          <VideoPlayerProvider>
            <Router />
            <GlobalVideoPlayer />
          </VideoPlayerProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
