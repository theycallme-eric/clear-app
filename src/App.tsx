import { Toaster } from "@/components/ui/sonner";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
import { SignInScreen } from "@/pages/SignInScreen";
import { CreateAccountScreen } from "@/pages/CreateAccountScreen";
import { OnboardingScreen } from "@/pages/OnboardingScreen";
import { ForgotPasswordScreen } from "@/pages/ForgotPasswordScreen";
import { ResetPasswordScreen } from "@/pages/ResetPasswordScreen";
import { ComponentGallery } from "@/pages/ComponentGallery";
import { TestWorkoutScreen } from "@/pages/TestWorkoutScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
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
                <Route path="/sign-in" element={<SignInScreen />} />
                <Route path="/create-account" element={<CreateAccountScreen />} />
                <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
              </Route>

              {/* Reset password — unguarded (user arrives authenticated via recovery link) */}
              <Route path="/reset-password" element={<ResetPasswordScreen />} />

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
    </>
    {import.meta.env.DEV && (
      <Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </Suspense>
    )}
  </QueryClientProvider>
);

export default App;
