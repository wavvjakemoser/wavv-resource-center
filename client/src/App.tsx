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
import LessonViewer from "./pages/LessonViewer";
import Webinars from "./pages/Webinars";
import GuidesAndDocs from "./pages/GuidesAndDocs";
import Support from "./pages/Support";
import AdminPanel from "./pages/AdminPanel";
import HandsOn from "./pages/HandsOn";
import AdminAnalytics from "./pages/AdminAnalytics";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { usePageTracking } from "./hooks/usePageTracking";

function Router() {
  usePageTracking();
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/academy" component={Academy} />
      <Route path="/academy/:courseId" component={CourseDetail} />
      <Route path="/academy/:courseId/lesson/:lessonId" component={LessonViewer} />
      <Route path="/webinars" component={Webinars} />
      <Route path="/guides" component={GuidesAndDocs} />
      <Route path="/support" component={Support} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/hands-on" component={HandsOn} />
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
                background: "#1a1a1a",
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
