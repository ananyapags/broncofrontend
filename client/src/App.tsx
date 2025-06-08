import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Courses from "@/pages/Courses";
import Classmates from "@/pages/Classmates";
import StudySessions from "@/pages/StudySessions";
import Admin from "@/pages/Admin";
import Header from "@/components/Header";
import ProfileSetup from "@/components/ProfileSetup";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, needsProfileSetup, user, completeProfileSetup } = useFirebaseAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  if (needsProfileSetup && user) {
    return <ProfileSetup user={user} onComplete={completeProfileSetup} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/courses" component={Courses} />
        <Route path="/classmates" component={Classmates} />
        <Route path="/sessions" component={StudySessions} />
        <Route path="/study-sessions" component={StudySessions} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
