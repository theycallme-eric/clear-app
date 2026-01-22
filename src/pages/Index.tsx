import { useState, useRef, useEffect } from "react";
import { HomeScreen } from "@/pages/HomeScreen";
import { OnboardingScreen } from "@/pages/OnboardingScreen";
import { GenerationScreen, WorkoutParams } from "@/pages/GenerationScreen";
import { ReviewScreen } from "@/pages/ReviewScreen";
import { WorkoutScreen, WorkoutNotes } from "@/pages/WorkoutScreen";
import { SummaryScreen } from "@/pages/SummaryScreen";
import { HistoryScreen } from "@/pages/HistoryScreen";
import { SessionDetailScreen } from "@/pages/SessionDetailScreen";
import { SettingsScreen } from "@/pages/SettingsScreen";
import { WelcomeScreen } from "@/pages/WelcomeScreen";
import { SignInScreen } from "@/pages/SignInScreen";
import { CreateAccountScreen } from "@/pages/CreateAccountScreen";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AbandonmentModal } from "@/components/AbandonmentModal";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  GeneratedWorkout,
  generateMockWorkout,
  getDefaultUserPreferences,
  UserPreferences,
  AnchorType,
  EQUIPMENT_BY_TIER,
  WorkoutHistoryEntry,
  StreakData,
} from "@/types/workout";
import { generateWorkout, isGenerationError, transformAPIWorkoutToFrontend, saveGeneratedWorkout } from "@/lib/workout-api";
import type { GenerateWorkoutResponse } from "@/types/generation";
import { fetchWorkoutHistory, fetchStreakData, fetchUserPreferences, fetchWorkoutDetail } from "@/lib/home-data";

type Screen = "loading" | "welcome" | "signIn" | "createAccount" | "onboarding" | "home" | "generation" | "review" | "workout" | "summary" | "history" | "sessionDetail" | "settings";

const Index = () => {
  // Home dashboard data - fetched from database
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({ currentStreak: 0, lastWorkoutDate: null, weekView: {} });
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => getDefaultUserPreferences());
  const [isLoadingHomeData, setIsLoadingHomeData] = useState(false);

  const [currentScreen, setCurrentScreen] = useState<Screen>("loading");
  const [workoutParams, setWorkoutParams] = useState<WorkoutParams | null>(null);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState<WorkoutNotes | null>(null);
  const workoutStartTime = useRef<number>(0);
  const [totalTime, setTotalTime] = useState(0);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<WorkoutHistoryEntry | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
  const [homeDataError, setHomeDataError] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [incompleteSession, setIncompleteSession] = useState<{ id: string; date: string } | null>(null);

  // Load home dashboard data from database
  const loadHomeData = async () => {
    setIsLoadingHomeData(true);
    setHomeDataError(false);
    try {
      const [history, streak, preferences] = await Promise.all([
        fetchWorkoutHistory(10),
        fetchStreakData(),
        fetchUserPreferences(),
      ]);
      setWorkoutHistory(history);
      setStreakData(streak);
      if (preferences) {
        setUserPreferences(preferences);
      }
    } catch (err) {
      console.error('Error loading home data:', err);
      setHomeDataError(true);
    } finally {
      setIsLoadingHomeData(false);
    }
  };

  // Check for incomplete (abandoned) workout sessions
  const checkForIncompleteSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: incomplete } = await supabase
      .from('workout_sessions')
      .select('id, date')
      .eq('user_id', user.id)
      .eq('is_rest_day', false)
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (incomplete && incomplete.length > 0) {
      const session = incomplete[0];
      const dateStr = new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      setIncompleteSession({ id: session.id, date: dateStr });
    }
  };

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error("Connection issue", { description: "Please check your network and try again." });
          setCurrentScreen("welcome");
          return;
        }

        if (!session) {
          setCurrentScreen("welcome");
          return;
        }

        // User is authenticated, check onboarding status
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setCurrentScreen("onboarding");
          return;
        }

        if (profile?.onboarding_completed) {
          await loadHomeData();
          await checkForIncompleteSession();
          setCurrentScreen("home");
        } else {
          setCurrentScreen("onboarding");
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        toast.error("Something went wrong", { description: "Please try refreshing." });
        setCurrentScreen("welcome");
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setCurrentScreen("welcome");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auth handlers
  const handleGoToSignIn = () => setCurrentScreen("signIn");
  const handleGoToCreateAccount = () => setCurrentScreen("createAccount");
  const handleBackToWelcome = () => setCurrentScreen("welcome");

  const handleSignInSuccess = async (onboardingComplete: boolean) => {
    if (onboardingComplete) {
      await loadHomeData();
      await checkForIncompleteSession();
      setCurrentScreen("home");
    } else {
      setCurrentScreen("onboarding");
    }
  };

  const handleCreateAccountSuccess = () => {
    setCurrentScreen("onboarding");
  };

  const handleForgotPassword = async () => {
    toast.info("Password reset", {
      description: "Enter your email on the sign in screen to reset.",
    });
  };

  // Onboarding handler
  const handleOnboardingComplete = async (preferences: UserPreferences) => {
    setUserPreferences(preferences);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      return;
    }

    try {
      // 1. Create the location with equipment
      const locationData = preferences.locations[0];
      if (locationData) {
        // Convert equipment names to snake_case for database
        const equipmentForDb = locationData.equipment.map(e =>
          e.toLowerCase().replace(/ /g, '_').replace(/[()\/]/g, '')
        );

        const { data: newLocation, error: locationError } = await supabase
          .from("locations")
          .insert({
            user_id: user.id,
            name: locationData.name,
            tier: locationData.tier,
            equipment: equipmentForDb,
            is_default: true,
          })
          .select("id")
          .single();

        if (locationError) {
          console.error("Failed to create location:", locationError);
          toast.error("Failed to save location");
          return;
        }

        // 2. Map frontend section types to database section types
        const sectionTypeMap: Record<string, string> = {
          warmup: 'warmup',
          mobility: 'mobility',
          primary: 'primary_lift',
          accessory: 'accessory',
          skill: 'skill_power',
          carries: 'carries',
          core: 'core',
          stability: 'stability_balance',
          conditioning: 'conditioning',
          cooldown: 'cooldown',
        };
        const enabledSectionsForDb = preferences.sections.map(s => sectionTypeMap[s] || s);

        // 3. Update profile with preferences and default location
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            onboarding_completed: true,
            experience_level: preferences.experienceLevel,
            goal_preset: preferences.goal,
            limitations: preferences.limitations || null,
            enabled_sections: enabledSectionsForDb,
            default_location_id: newLocation.id,
          })
          .eq("id", user.id);

        if (profileError) {
          console.error("Failed to update profile:", profileError);
          toast.error("Failed to save preferences");
          return;
        }

        // Update local state with the new location ID so generation can use it
        setUserPreferences(prev => ({
          ...prev,
          locations: prev.locations.map((loc, idx) =>
            idx === 0 ? { ...loc, id: newLocation.id } : loc
          ),
          defaultLocationId: newLocation.id,
        }));
      }

      toast.success("Setup complete!", {
        description: "Let's generate your first workout.",
      });
      setCurrentScreen("generation");
    } catch (err) {
      console.error("Onboarding error:", err);
      toast.error("Something went wrong", {
        description: "Please try again.",
      });
    }
  };

  // Home screen handlers
  const handleNavigateToGeneration = () => {
    setCurrentScreen("generation");
  };

  const handleQuickStart = (intensity: number, anchor: AnchorType) => {
    // Use the real generation flow with Quick Start params
    const defaultLocation = userPreferences.locations.find(
      l => l.id === userPreferences.defaultLocationId
    ) || userPreferences.locations[0];

    const params: WorkoutParams = {
      intensity,
      anchor,
      location: defaultLocation?.name || "Gym",
      time: "45 min",
      notes: "",
    };

    handleGenerate(params);
  };

  const handleViewHistory = () => {
    setCurrentScreen("history");
  };

  const handleViewWorkoutDetail = async (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    setSelectedWorkoutDetail(null);
    setIsLoadingDetail(true);
    setCurrentScreen("sessionDetail");

    try {
      const detail = await fetchWorkoutDetail(workoutId);
      if (detail) {
        setSelectedWorkoutDetail(detail);
      } else {
        toast.error("Couldn't load workout details");
      }
    } catch (err) {
      console.error('Error fetching workout detail:', err);
      toast.error("Failed to load workout");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleBackFromHistory = () => {
    setCurrentScreen("home");
  };

  const handleBackFromSessionDetail = () => {
    setCurrentScreen("history");
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

  // Abandonment handlers
  const handleResumeIncomplete = async () => {
    if (!incompleteSession) return;
    // Fetch the incomplete workout detail and show it in review
    setIsLoadingDetail(true);
    const detail = await fetchWorkoutDetail(incompleteSession.id);
    setIsLoadingDetail(false);

    if (detail && detail.sections && detail.sections.length > 0) {
      // Reconstruct a GeneratedWorkout from the saved session
      const workout: GeneratedWorkout = {
        title: `${detail.anchor} Workout`,
        sections: detail.sections.map(s => ({
          name: s.name,
          exercises: s.exercises.map(ex => ({
            name: ex.name,
            sets: ex.sets,
            reps: typeof ex.reps === 'string' ? ex.reps : String(ex.reps),
            weight: ex.weight || undefined,
            notes: ex.note || undefined,
          })),
        })),
      };
      setGeneratedWorkout(workout);
      setCurrentSessionId(incompleteSession.id);
      setIncompleteSession(null);
      setCurrentScreen("review");
    } else {
      // Can't reconstruct, abandon it
      toast.info("Couldn't load workout details. Starting fresh.");
      handleAbandonIncomplete();
    }
  };

  const handleAbandonIncomplete = async () => {
    if (!incompleteSession) return;
    // Delete the incomplete session
    await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', incompleteSession.id);
    setIncompleteSession(null);
  };

  const handleOpenSettings = () => {
    setCurrentScreen("settings");
  };

  const handleBackFromSettings = () => {
    setCurrentScreen("home");
  };

  const handleSavePreferences = async (newPreferences: UserPreferences) => {
    const oldPreferences = userPreferences;
    setUserPreferences(newPreferences);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // 1. Handle location changes FIRST (before profile update, since profile references location_id)
      const oldLocationIds = new Set(oldPreferences.locations.map(l => l.id));
      const newLocationIds = new Set(newPreferences.locations.map(l => l.id));
      let resolvedDefaultLocationId = newPreferences.defaultLocationId;

      // Deleted locations
      for (const oldLoc of oldPreferences.locations) {
        if (!newLocationIds.has(oldLoc.id)) {
          await supabase.from('locations').delete().eq('id', oldLoc.id);
        }
      }

      // New or updated locations
      for (const newLoc of newPreferences.locations) {
        const equipmentForDb = newLoc.equipment.map(e =>
          e.toLowerCase().replace(/ /g, '_').replace(/[()\/]/g, '')
        );

        if (oldLocationIds.has(newLoc.id)) {
          // Update existing
          const oldLoc = oldPreferences.locations.find(l => l.id === newLoc.id);
          if (oldLoc && (oldLoc.name !== newLoc.name || oldLoc.tier !== newLoc.tier ||
              JSON.stringify(oldLoc.equipment) !== JSON.stringify(newLoc.equipment))) {
            await supabase
              .from('locations')
              .update({
                name: newLoc.name,
                tier: newLoc.tier,
                equipment: equipmentForDb,
              })
              .eq('id', newLoc.id);
          }
        } else {
          // Create new location
          const { data: created } = await supabase
            .from('locations')
            .insert({
              user_id: user.id,
              name: newLoc.name,
              tier: newLoc.tier,
              equipment: equipmentForDb,
              is_default: newPreferences.defaultLocationId === newLoc.id,
            })
            .select('id')
            .single();

          // Replace client-side UUID with real database ID
          if (created) {
            if (resolvedDefaultLocationId === newLoc.id) {
              resolvedDefaultLocationId = created.id;
            }
            setUserPreferences(prev => ({
              ...prev,
              locations: prev.locations.map(l =>
                l.id === newLoc.id ? { ...l, id: created.id } : l
              ),
              defaultLocationId: prev.defaultLocationId === newLoc.id
                ? created.id
                : prev.defaultLocationId,
            }));
          }
        }
      }

      // Update default location flag in locations table
      if (newPreferences.defaultLocationId !== oldPreferences.defaultLocationId) {
        await supabase
          .from('locations')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', resolvedDefaultLocationId || '');

        if (resolvedDefaultLocationId) {
          await supabase
            .from('locations')
            .update({ is_default: true })
            .eq('id', resolvedDefaultLocationId);
        }
      }

      // 2. Update profile fields (after locations exist in DB)
      const sectionTypeMap: Record<string, string> = {
        warmup: 'warmup',
        mobility: 'mobility',
        primary: 'primary_lift',
        accessory: 'accessory',
        skill: 'skill_power',
        carries: 'carries',
        core: 'core',
        stability: 'stability_balance',
        conditioning: 'conditioning',
        cooldown: 'cooldown',
      };
      const enabledSectionsForDb = newPreferences.sections.map(s => sectionTypeMap[s] || s);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          experience_level: newPreferences.experienceLevel,
          goal_preset: newPreferences.goal,
          limitations: newPreferences.limitations || null,
          enabled_sections: enabledSectionsForDb,
          default_location_id: resolvedDefaultLocationId,
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      toast.error('Failed to save some settings');
    }
  };

  // Generation screen handlers
  const handleGenerate = async (params: WorkoutParams) => {
    setWorkoutParams(params);
    setIsGenerating(true);

    try {
      // Parse duration from "45 min" or "45" format
      const durationMatch = params.time?.match(/(\d+)/);
      const durationMins = durationMatch ? parseInt(durationMatch[1]) : 45;

      // Get equipment from user's saved location (or fallback to tier-based)
      let equipment: string[];
      let locationName: string;

      // First check if user has a saved location in preferences
      const defaultLocation = userPreferences.locations.find(
        loc => loc.id === userPreferences.defaultLocationId
      ) || userPreferences.locations[0];

      if (defaultLocation && defaultLocation.equipment.length > 0) {
        // Use saved equipment (already in snake_case from onboarding)
        equipment = defaultLocation.equipment.map(e =>
          e.toLowerCase().replace(/ /g, '_').replace(/[()\/]/g, '')
        );
        locationName = defaultLocation.name;
      } else {
        // Fallback: map location name to tier
        const locationTierMap: Record<string, keyof typeof EQUIPMENT_BY_TIER> = {
          'Home Gym': 'home',
          'Commercial Gym': 'full',
          'Building Gym': 'building',
          'Outdoor Park': 'minimal',
          'Hotel Room': 'minimal',
        };
        const tier = locationTierMap[params.location] || 'building';
        equipment = EQUIPMENT_BY_TIER[tier].map(e => e.toLowerCase().replace(/ /g, '_'));
        locationName = params.location;
      }

      // Map frontend sections to API sections
      const enabledSections = userPreferences.sections.map(s => {
        const sectionMap: Record<string, string> = {
          warmup: 'warmup',
          mobility: 'mobility',
          primary: 'primary_lift',
          accessory: 'accessory',
          skill: 'skill_power',
          carries: 'carries',
          core: 'core',
          stability: 'stability_balance',
          conditioning: 'conditioning',
          cooldown: 'cooldown',
        };
        return sectionMap[s] || s;
      });

      // Call the Edge Function
      const result = await generateWorkout({
        intensity: params.intensity,
        anchor: (params.anchor || 'PULL').toLowerCase(),
        duration_mins: durationMins,
        location_name: locationName,
        equipment,
        experience_level: userPreferences.experienceLevel || 'some',
        limitations: userPreferences.limitations || undefined,
        enabled_sections: enabledSections.length > 0 ? enabledSections : undefined,
        notes: params.notes || undefined,
      });

      if (isGenerationError(result)) {
        // Fallback to mock workout on error
        console.error('Generation error:', result.error, result.details);
        toast.error("Using demo workout", {
          description: result.details || result.error,
        });
        const workout = generateMockWorkout(params.intensity, params.anchor || "PULL");
        setGeneratedWorkout(workout);
        setCurrentSessionId(null); // No session ID for mock workouts
        setCurrentLocationId(null);
      } else {
        // Save the generated workout to database
        const locationId = defaultLocation?.id || null;
        console.log('Saving workout - locationId:', locationId, 'defaultLocation:', defaultLocation);
        setCurrentLocationId(locationId);

        if (locationId) {
          console.log('Calling saveGeneratedWorkout with result:', result);
          const saveResult = await saveGeneratedWorkout(result, locationId);
          if ('sessionId' in saveResult) {
            setCurrentSessionId(saveResult.sessionId);
            console.log('Workout saved with session ID:', saveResult.sessionId);
          } else {
            console.error('Failed to save workout:', saveResult.error, saveResult.details);
            toast.error("Workout not saved", {
              description: saveResult.details || saveResult.error,
            });
            // Still show the workout even if save failed
          }
        } else {
          console.warn('No location ID available, workout not saved to database');
          console.log('userPreferences.locations:', userPreferences.locations);
          setCurrentSessionId(null);
        }

        // Transform API response to frontend format
        const workout = transformAPIWorkoutToFrontend(
          result.workout,
          params.intensity,
          params.anchor || 'PULL'
        );
        setGeneratedWorkout(workout);
        toast.success("Workout generated!", {
          description: `${params.anchor} focus at intensity ${params.intensity}`,
        });
      }

      setCurrentScreen("review");
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("Generation failed", {
        description: "Using demo workout instead",
      });
      const workout = generateMockWorkout(params.intensity, params.anchor || "PULL");
      setGeneratedWorkout(workout);
      setCurrentScreen("review");
    } finally {
      setIsGenerating(false);
    }
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

  const handleFinishSession = async (mood: number | null, sessionNotes: string) => {
    // Calculate duration in minutes
    const durationMins = Math.floor(totalTime / 60);
    console.log('handleFinishSession called:', { currentSessionId, totalTime, durationMins, mood, sessionNotes });

    // Save completion data to database if we have a session
    if (currentSessionId) {
      try {
        const { error } = await supabase
          .from('workout_sessions')
          .update({
            completed_at: new Date().toISOString(),
            duration_mins: durationMins,
            mood: mood !== null ? String(mood) : null,
            session_notes: sessionNotes || null,
            counts_for_streak: durationMins >= 5, // Minimum 5 minutes to count
          })
          .eq('id', currentSessionId);

        if (error) {
          console.error('Failed to save completion data:', error);
          toast.error("Failed to save workout", {
            description: "Your progress may not have been recorded.",
          });
        } else {
          toast.success("Session saved!", {
            description: "Your workout has been recorded.",
          });
        }
      } catch (err) {
        console.error('Error saving completion data:', err);
        toast.error("Failed to save workout");
      }
    } else {
      // Mock workout, just show success
      toast.success("Session complete!", {
        description: "Demo workout - not saved to history.",
      });
    }

    // Reset state and reload home data
    setGeneratedWorkout(null);
    setWorkoutNotes(null);
    setCurrentSessionId(null);
    setCurrentLocationId(null);
    await loadHomeData();
    setCurrentScreen("home");
  };

  return (
    <>
      {currentScreen === "loading" && (
        <LoadingScreen />
      )}
      {currentScreen === "welcome" && (
        <WelcomeScreen
          onSignIn={handleGoToSignIn}
          onCreateAccount={handleGoToCreateAccount}
        />
      )}
      {currentScreen === "signIn" && (
        <SignInScreen
          onBack={handleBackToWelcome}
          onSuccess={handleSignInSuccess}
          onForgotPassword={handleForgotPassword}
        />
      )}
      {currentScreen === "createAccount" && (
        <CreateAccountScreen
          onBack={handleBackToWelcome}
          onSuccess={handleCreateAccountSuccess}
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
            onGenerateWorkout={handleNavigateToGeneration}
            onQuickStart={handleQuickStart}
            onViewHistory={handleViewHistory}
            onViewWorkoutDetail={handleViewWorkoutDetail}
            onMarkRestDay={handleMarkRestDay}
            onOpenSettings={handleOpenSettings}
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
        <GenerationScreen onGenerate={handleGenerate} userPreferences={userPreferences} isGenerating={isGenerating} />
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
          workout={selectedWorkoutDetail || workoutHistory.find(w => w.id === selectedWorkoutId) || null}
          isLoading={isLoadingDetail}
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
