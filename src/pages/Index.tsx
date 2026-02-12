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
import { toast } from "@/components/ui/sonner";
import { useAuthContext } from "@/contexts/AuthContext";
import { useHomeData } from "@/hooks/useHomeData";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { useWorkoutFlow } from "@/hooks/useWorkoutFlow";
import { useHistoryDetail } from "@/hooks/useHistoryDetail";

const Index = () => {
  const {
    status,
    user,
    profile,
    locations,
    updateProfile,
    updateLocations
  } = useAuthContext();

  const { currentScreen, navigateTo } = useAppNavigation();

  const {
    workoutHistory,
    streakData,
    incompleteSession,
    isLoading: isLoadingHomeData,
    hasError: homeDataError,
    loadHomeData,
    checkForIncompleteSession,
    clearIncompleteSession,
  } = useHomeData(user?.id || null);

  // Build UserPreferences from AuthContext for components that need it
  const userPreferences = {
    onboardingComplete: profile?.onboardingComplete || false,
    locations,
    defaultLocationId: profile?.defaultLocationId || null,
    experienceLevel: profile?.experienceLevel || null,
    goal: profile?.goal || null,
    sections: profile?.enabledSections || [],
    limitations: profile?.limitations || '',
  };

  const { handleOnboardingComplete } = useOnboardingFlow(() => {
    loadHomeData();
    navigateTo("home");
  });

  const workoutFlow = useWorkoutFlow(userPreferences, loadHomeData, workoutHistory);
  const historyDetail = useHistoryDetail();

  // Navigation based on auth status
  useEffect(() => {
    // Component Gallery direct access
    if (currentScreen === 'componentGallery') return;

    // Loading - wait
    if (status === 'loading') {
      if (currentScreen !== 'loading') navigateTo('loading');
      return;
    }

    // Not authenticated - show welcome
    if (status === 'unauthenticated') {
      if (!['welcome', 'signIn', 'createAccount'].includes(currentScreen)) {
        navigateTo('welcome');
      }
      return;
    }

    // Authenticated - check onboarding
    if (status === 'authenticated') {
      if (!profile?.onboardingComplete) {
        if (currentScreen !== 'onboarding') {
          navigateTo('onboarding');
        }
        return;
      }

      // Onboarding complete - go to home if on auth screens
      if (['loading', 'welcome', 'signIn', 'createAccount', 'onboarding'].includes(currentScreen)) {
        loadHomeData();
        checkForIncompleteSession();
        navigateTo('home');
      }
    }
  }, [status, profile?.onboardingComplete, currentScreen]);

  // Handle preferences save (for SettingsScreen)
  const handleSavePreferences = async (newPreferences: typeof userPreferences) => {
    await updateProfile({
      experienceLevel: newPreferences.experienceLevel,
      goal: newPreferences.goal,
      limitations: newPreferences.limitations,
      enabledSections: newPreferences.sections,
      defaultLocationId: newPreferences.defaultLocationId,
    });
    await updateLocations(newPreferences.locations);
  };

  // Auth handlers
  const handleSignInSuccess = () => {
    // Auth listener (AuthContext) will handle fetching profile and updating state
    // The useEffect above will then navigate based on profile.onboardingComplete
    // This prevents race conditions from having two simultaneous profile fetches
  };

  // Abandonment handlers
  const handleAbandonIncomplete = async () => {
    if (!incompleteSession) return;
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
          onOpenSettings={() => navigateTo("settings")}
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
