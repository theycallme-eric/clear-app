import { useState, useRef } from "react";
import { HomeScreen } from "@/pages/HomeScreen";
import { OnboardingScreen } from "@/pages/OnboardingScreen";
import { GenerationScreen, WorkoutParams } from "@/pages/GenerationScreen";
import { ReviewScreen } from "@/pages/ReviewScreen";
import { WorkoutScreen, WorkoutNotes } from "@/pages/WorkoutScreen";
import { SummaryScreen } from "@/pages/SummaryScreen";
import { HistoryScreen } from "@/pages/HistoryScreen";
import { SessionDetailScreen } from "@/pages/SessionDetailScreen";
import { SettingsScreen } from "@/pages/SettingsScreen";
import { toast } from "sonner";
import {
  GeneratedWorkout,
  generateMockWorkout,
  generateMockWorkoutHistory,
  generateMockStreakData,
  getDefaultUserPreferences,
  UserPreferences,
  AnchorType,
} from "@/types/workout";

type Screen = "onboarding" | "home" | "generation" | "review" | "workout" | "summary" | "history" | "sessionDetail" | "settings";

// Set to true to test onboarding flow, false to skip to home
const SHOW_ONBOARDING = true;

const Index = () => {
  // Mock data - will be replaced with real persistence later
  const [workoutHistory] = useState(() => generateMockWorkoutHistory());
  const [streakData] = useState(() => generateMockStreakData());
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => getDefaultUserPreferences());

  // Determine initial screen based on onboarding status
  const getInitialScreen = (): Screen => {
    if (SHOW_ONBOARDING && !userPreferences.onboardingComplete) {
      return "onboarding";
    }
    return "home";
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen);
  const [workoutParams, setWorkoutParams] = useState<WorkoutParams | null>(null);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState<WorkoutNotes | null>(null);
  const workoutStartTime = useRef<number>(0);
  const [totalTime, setTotalTime] = useState(0);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  // Onboarding handler
  const handleOnboardingComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    toast.success("Setup complete!", {
      description: "Let's generate your first workout.",
    });
    setCurrentScreen("generation");
  };

  // Home screen handlers
  const handleNavigateToGeneration = () => {
    setCurrentScreen("generation");
  };

  const handleQuickStart = (intensity: number, anchor: AnchorType) => {
    const workout = generateMockWorkout(intensity, anchor);
    setGeneratedWorkout(workout);
    setWorkoutParams({
      intensity,
      anchor,
      location: "Commercial Gym",
      time: "",
      notes: "",
    });
    workoutStartTime.current = Date.now();
    toast.success("Quick Start!", {
      description: `${anchor} focus at intensity ${intensity}`,
    });
    setCurrentScreen("workout"); // Skip directly to workout mode
  };

  const handleViewHistory = () => {
    setCurrentScreen("history");
  };

  const handleViewWorkoutDetail = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    setCurrentScreen("sessionDetail");
  };

  const handleBackFromHistory = () => {
    setCurrentScreen("home");
  };

  const handleBackFromSessionDetail = () => {
    setCurrentScreen("history");
  };

  const handleMarkRestDay = () => {
    // TODO: Implement rest day logic
    toast.success("Rest day marked!", {
      description: "Your streak is preserved.",
    });
  };

  const handleOpenSettings = () => {
    setCurrentScreen("settings");
  };

  const handleBackFromSettings = () => {
    setCurrentScreen("home");
  };

  const handleSavePreferences = (newPreferences: UserPreferences) => {
    setUserPreferences(newPreferences);
  };

  // Generation screen handlers
  const handleGenerate = (params: WorkoutParams) => {
    setWorkoutParams(params);
    const workout = generateMockWorkout(params.intensity, params.anchor || "PULL");
    setGeneratedWorkout(workout);
    toast.success("Workout generated!", {
      description: `${params.anchor} focus at intensity ${params.intensity}`,
    });
    setCurrentScreen("review");
  };

  const handleBackToGeneration = () => {
    setCurrentScreen("generation");
  };

  const handleStartWorkout = () => {
    workoutStartTime.current = Date.now();
    setCurrentScreen("workout");
  };

  const handleExitWorkout = () => {
    setCurrentScreen("review");
  };

  const handleFinishWorkout = (notes: WorkoutNotes) => {
    const elapsed = Math.floor((Date.now() - workoutStartTime.current) / 1000);
    setTotalTime(elapsed);
    setWorkoutNotes(notes);
    setCurrentScreen("summary");
  };

  const handleFinishSession = (mood: number | null, sessionNotes: string) => {
    // TODO: Save workout to history with mood and sessionNotes
    // For now, just show success and return to home
    toast.success("Session saved!", {
      description: "Your workout has been recorded.",
    });
    // Reset to home screen
    setCurrentScreen("home");
    setGeneratedWorkout(null);
    setWorkoutNotes(null);
  };

  return (
    <>
      {currentScreen === "onboarding" && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}
      {currentScreen === "home" && (
        <HomeScreen
          workoutHistory={workoutHistory}
          streakData={streakData}
          onGenerateWorkout={handleNavigateToGeneration}
          onQuickStart={handleQuickStart}
          onViewHistory={handleViewHistory}
          onViewWorkoutDetail={handleViewWorkoutDetail}
          onMarkRestDay={handleMarkRestDay}
          onOpenSettings={handleOpenSettings}
        />
      )}
      {currentScreen === "generation" && (
        <GenerationScreen onGenerate={handleGenerate} userPreferences={userPreferences} />
      )}
      {currentScreen === "review" && generatedWorkout && (
        <ReviewScreen 
          workout={generatedWorkout} 
          onBack={handleBackToGeneration}
          onStartWorkout={handleStartWorkout}
        />
      )}
      {currentScreen === "workout" && generatedWorkout && (
        <WorkoutScreen
          workout={generatedWorkout}
          onExit={handleExitWorkout}
          onFinish={handleFinishWorkout}
        />
      )}
      {currentScreen === "summary" && generatedWorkout && workoutNotes && (
        <SummaryScreen
          workout={generatedWorkout}
          notes={workoutNotes}
          totalTime={totalTime}
          streakData={streakData}
          onFinish={handleFinishSession}
        />
      )}
      {currentScreen === "history" && (
        <HistoryScreen
          workoutHistory={workoutHistory}
          onBack={handleBackFromHistory}
          onSelectWorkout={handleViewWorkoutDetail}
          onOpenSettings={handleOpenSettings}
        />
      )}
      {currentScreen === "sessionDetail" && selectedWorkoutId && (
        <SessionDetailScreen
          workout={workoutHistory.find(w => w.id === selectedWorkoutId)!}
          onBack={handleBackFromSessionDetail}
          onOpenSettings={handleOpenSettings}
        />
      )}
      {currentScreen === "settings" && (
        <SettingsScreen
          userPreferences={userPreferences}
          onSavePreferences={handleSavePreferences}
          onBack={handleBackFromSettings}
        />
      )}
    </>
  );
};

export default Index;
