import { Toaster } from "@/components/ui/sonner";
import { lazy, Suspense } from "react";

const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((m) => ({
    default: m.ReactQueryDevtools,
  }))
);
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomeDataProvider } from "@/contexts/HomeDataContext";
import { WorkoutFlowProvider } from "@/contexts/WorkoutFlowContext";
import { ProtectedRoute, PublicOnlyRoute, OnboardingRoute } from "@/routes/guards";
import { AnimatedBackground } from "@/components/AnimatedBackground";

// Screens
import { HomeScreen } from "@/pages/HomeScreen";
import { GenerationScreen } from "@/pages/GenerationScreen";
import { ReviewScreen } from "@/pages/ReviewScreen";
import { WorkoutScreen } from "@/pages/WorkoutScreen";
import { SummaryScreen } from "@/pages/SummaryScreen";
import { HistoryScreen } from "@/pages/HistoryScreen";
import { SessionDetailScreen } from "@/pages/SessionDetailScreen";
import { SettingsScreen } from "@/pages/SettingsScreen";
import { WelcomeScreen } from "@/pages/WelcomeScreen";
import { OTPLoginScreen } from "@/pages/OTPLoginScreen";
import { OnboardingScreen } from "@/pages/OnboardingScreen";
import { ComponentGallery } from "@/pages/ComponentGallery";
import { TestWorkoutScreen } from "@/pages/TestWorkoutScreen";
import NotFound from "./pages/NotFound";

const App = () => (
  <>
    <Toaster />
    <AnimatedBackground />
    <BrowserRouter>
      <HomeDataProvider>
        <WorkoutFlowProvider>
          <Routes>
            {/* Public-only routes (redirect if authenticated) */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/login" element={<OTPLoginScreen />} />
            </Route>

            {/* Onboarding route (must be auth'd but NOT onboarded) */}
            <Route element={<OnboardingRoute />}>
              <Route path="/onboarding" element={<OnboardingScreen />} />
            </Route>

            {/* Protected routes (must be auth'd + onboarded) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/generate" element={<GenerationScreen />} />
              <Route path="/review" element={<ReviewScreen />} />
              <Route path="/workout" element={<WorkoutScreen />} />
              <Route path="/summary" element={<SummaryScreen />} />
              <Route path="/history" element={<HistoryScreen />} />
              <Route path="/history/:id" element={<SessionDetailScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
            </Route>

            {/* Dev routes — only available in development */}
            {import.meta.env.DEV && (
              <>
                <Route path="/dev/gallery" element={<ComponentGallery />} />
                <Route path="/dev/test-workout" element={<TestWorkoutScreen />} />
              </>
            )}

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </WorkoutFlowProvider>
      </HomeDataProvider>
    </BrowserRouter>
    {import.meta.env.DEV && (
      <Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </Suspense>
    )}
  </>
);

export default App;
