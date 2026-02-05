import { useEffect } from "react";
import { HomeScreen } from "@/pages/HomeScreen";
import { OnboardingScreen } from "@/pages/OnboardingScreen";
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
import { ComponentGallery } from "@/pages/ComponentGallery";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AbandonmentModal } from "@/components/AbandonmentModal";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useHomeData } from "@/hooks/useHomeData";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { useWorkoutFlow } from "@/hooks/useWorkoutFlow";
import { useHistoryDetail } from "@/hooks/useHistoryDetail";
import { usePreferencesSync } from "@/hooks/usePreferencesSync";

const Index = () => {
  const { isLoading: authLoading, isAuthenticated, onboardingComplete, userId } = useAuth();
  const { currentScreen, navigateTo } = useAppNavigation();

  const {
    workoutHistory,
    streakData,
    userPreferences,
    incompleteSession,
    isLoading: isLoadingHomeData,
    hasError: homeDataError,
    loadHomeData,
    checkForIncompleteSession,
    clearIncompleteSession,
    setUserPreferences,
  } = useHomeData(userId);

  // Initialize hooks
  const { handleOnboardingComplete } = useOnboardingFlow(async () => {
    await loadHomeData();
    navigateTo("generation");
  });

  const workoutFlow = useWorkoutFlow(userPreferences, loadHomeData);
  const historyDetail = useHistoryDetail();
  const { handleSavePreferences } = usePreferencesSync(userPreferences, setUserPreferences);

  // React to auth state changes and initial navigation routing
  useEffect(() => {
    // If we're already checking auth or loading, wait
    if (authLoading) return;

    // Component Gallery Direct Access handled in hook, but we need to respect it if set
    if (currentScreen === 'componentGallery') return;

    // Guard: Auth Check
    if (!isAuthenticated) {
      if (currentScreen !== 'welcome' && currentScreen !== 'signIn' && currentScreen !== 'createAccount') {
        navigateTo("welcome");
      }
      return;
    }

    // Screens that indicate user is past onboarding (app flow screens)
    const postOnboardingScreens = ['generation', 'review', 'workout', 'summary', 'home', 'history', 'historyDetail', 'settings'];

    // Guard: Onboarding Check
    // Don't redirect to onboarding if we're already on a post-onboarding screen
    // (This handles the case where DB was updated but useAuth hasn't refreshed yet)
    if (isAuthenticated && onboardingComplete === false) {
      if (!postOnboardingScreens.includes(currentScreen)) {
        navigateTo("onboarding");
        return;
      }
    }

    // Guard: Home (Authenticated & Onboarded)
    // Navigate to home if we are currently at a "pre-auth" screen
    if (isAuthenticated && (onboardingComplete === true || postOnboardingScreens.includes(currentScreen))) {
      if (['loading', 'welcome', 'signIn', 'createAccount', 'onboarding'].includes(currentScreen)) {
        loadHomeData();
        checkForIncompleteSession();
        navigateTo("home");
      }
    }
  }, [authLoading, isAuthenticated, onboardingComplete, currentScreen]);

  // Auth handlers
  const handleSignInSuccess = async (onboardingComplete: boolean) => {
    if (onboardingComplete) {
      await loadHomeData();
      await checkForIncompleteSession();
      navigateTo("home");
    } else {
      navigateTo("onboarding");
    }
  };

  // Abandonment handlers
  const handleAbandonIncomplete = async () => {
    if (!incompleteSession) return;
    // Delete the incomplete session
    await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', incompleteSession.id);
    clearIncompleteSession();
  };

  const handleResumeIncomplete = async () => {
    if (!incompleteSession) return;
    const success = await workoutFlow.handleResumeIncomplete(incompleteSession.id);

    if (success) {
      clearIncompleteSession();
      navigateTo("review");
    } else {
      toast.info("Couldn't load workout details. Starting fresh.");
      handleAbandonIncomplete();
    }
  };

  const handleMarkRestDay = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          date: today,
          is_rest_day: true,
          counts_for_streak: true,
          anchor: 'rest',
          intensity: 0,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info("Already logged today");
        } else {
          console.error('Error marking rest day:', error);
          toast.error("Failed to mark rest day");
        }
        return;
      }

      toast.success("Rest day marked!", {
        description: "Your streak is preserved.",
      });
      await loadHomeData();
    } catch (err) {
      console.error('Error marking rest day:', err);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      {currentScreen === "loading" && (
        <LoadingScreen subtitle="Initializing..." />
      )}
      {currentScreen === "welcome" && (
        <WelcomeScreen
          onSignIn={() => navigateTo("signIn")}
          onCreateAccount={() => navigateTo("createAccount")}
        />
      )}
      {currentScreen === "signIn" && (
        <SignInScreen
          onBack={() => navigateTo("welcome")}
          onSuccess={handleSignInSuccess}
          onForgotPassword={() => toast.info("Password reset", { description: "Enter your email on the sign in screen to reset." })}
        />
      )}
      {currentScreen === "createAccount" && (
        <CreateAccountScreen
          onBack={() => navigateTo("welcome")}
          onSuccess={() => navigateTo("onboarding")}
        />
      )}
      {currentScreen === "onboarding" && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}
      {currentScreen === "home" && (
        <>
          <HomeScreen
            workoutHistory={workoutHistory}
            streakData={streakData}
            isLoading={isLoadingHomeData}
            hasError={homeDataError}
            onRetry={loadHomeData}
            onGenerateWorkout={() => navigateTo("generation")}
            onQuickStart={(intensity, anchor) => workoutFlow.handleQuickStart(intensity, anchor, () => navigateTo("review"))}
            onViewHistory={() => navigateTo("history")}
            onViewWorkoutDetail={(id) => historyDetail.handleViewWorkoutDetail(id, () => navigateTo("sessionDetail"))}
            onMarkRestDay={handleMarkRestDay}
            onOpenSettings={() => navigateTo("settings")}
          />
          {incompleteSession && (
            <AbandonmentModal
              workoutDate={incompleteSession.date}
              onResume={handleResumeIncomplete}
              onAbandon={handleAbandonIncomplete}
            />
          )}
        </>
      )}
      {currentScreen === "generation" && (
        <GenerationScreen
          onGenerate={(params) => workoutFlow.handleGenerate(params, () => navigateTo("review"))}
          userPreferences={userPreferences}
          isGenerating={workoutFlow.isGenerating}
        />
      )}
      {currentScreen === "review" && workoutFlow.generatedWorkout && (
        <ReviewScreen
          workout={workoutFlow.generatedWorkout}
          onBack={() => navigateTo("generation")}
          onStartWorkout={() => workoutFlow.handleStartWorkout(() => navigateTo("workout"))}
        />
      )}
      {currentScreen === "workout" && workoutFlow.generatedWorkout && (
        <WorkoutScreen
          workout={workoutFlow.generatedWorkout}
          onExit={() => navigateTo("review")}
          onFinish={(notes) => workoutFlow.handleFinishWorkout(notes, () => navigateTo("summary"))}
        />
      )}
      {currentScreen === "summary" && workoutFlow.generatedWorkout && workoutFlow.workoutNotes && (
        <SummaryScreen
          workout={workoutFlow.generatedWorkout}
          notes={workoutFlow.workoutNotes}
          totalTime={workoutFlow.totalTime}
          streakData={streakData}
          onFinish={(mood, notes) => workoutFlow.handleFinishSession(mood, notes, () => navigateTo("home"))}
        />
      )}
      {currentScreen === "history" && (
        <HistoryScreen
          workoutHistory={workoutHistory}
          onBack={() => navigateTo("home")}
          onSelectWorkout={(id) => historyDetail.handleViewWorkoutDetail(id, () => navigateTo("sessionDetail"))}
          onOpenSettings={() => navigateTo("settings")}
        />
      )}
      {currentScreen === "sessionDetail" && historyDetail.selectedWorkoutId && (
        <SessionDetailScreen
          workout={historyDetail.selectedWorkoutDetail || workoutHistory.find(w => w.id === historyDetail.selectedWorkoutId) || null}
          isLoading={historyDetail.isLoadingDetail}
          onBack={() => navigateTo("history")}
          onOpenSettings={() => navigateTo("settings")}
        />
      )}
      {currentScreen === "settings" && (
        <SettingsScreen
          userPreferences={userPreferences}
          onSavePreferences={handleSavePreferences}
          onBack={() => navigateTo("home")}
          onOpenDeveloper={() => navigateTo("componentGallery")}
        />
      )}
      {currentScreen === "componentGallery" && (
        <ComponentGallery onBack={() => navigateTo("settings")} />
      )}
    </>
  );
};

export default Index;
