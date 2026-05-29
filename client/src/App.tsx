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
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import GoogleCallback from "./pages/GoogleCallback";
import AcceptInvite from "./pages/AcceptInvite";
import Partners from "./pages/Partners";
import WavvPartnerPortal from "./pages/WavvPartnerPortal";
import MagicAuth from "./pages/MagicAuth";
import { usePageTracking } from "./hooks/usePageTracking";

function Router() {
  usePageTracking();
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/auth/google/callback" component={GoogleCallback} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/academy" component={Academy} />
      <Route path="/academy/category/:categoryKey" component={AcademyCategory} />
      <Route path="/academy/:courseId" component={CourseDetail} />
      <Route path="/academy/:courseId/lesson/:lessonId" component={LessonViewer} />
      <Route path="/webinars" component={Webinars} />
      <Route path="/guides" component={GuidesAndDocs} />
      <Route path="/support" component={Support} />
      <Route path="/partners" component={Partners} />
      <Route path="/wavv-partner" component={WavvPartnerPortal} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/legacy" component={AdminPanel} />
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
