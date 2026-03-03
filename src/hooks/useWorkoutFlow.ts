import { useState, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";
import {
    WorkoutParams,
    GeneratedWorkout,
    WorkoutNotes,
    UserPreferences,
    AnchorType,
    WorkoutHistoryEntry,
    EQUIPMENT_BY_TIER,
    generateMockWorkout,
} from "@/types/workout";
import {
    generateWorkout,
    isGenerationError,
    transformAPIWorkoutToFrontend,
    saveGeneratedWorkout,
} from "@/lib/workout-api";
import { fetchWorkoutDetail } from "@/lib/home-data";
import { resolveAnchorToPattern } from "@/lib/anchor-mapping";

export const useWorkoutFlow = (
    userPreferences: UserPreferences,
    loadHomeData: () => Promise<void>,
    workoutHistory: WorkoutHistoryEntry[] = []
) => {
    const [workoutParams, setWorkoutParams] = useState<WorkoutParams | null>(null);
    const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
    const [workoutNotes, setWorkoutNotes] = useState<WorkoutNotes | null>(null);
    const workoutStartTime = useRef<number>(0);
    const [totalTime, setTotalTime] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);

    const handleGenerate = async (params: WorkoutParams, onSuccess?: () => void) => {
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

            // Resolve user anchor selection to movement pattern
            const userAnchor = params.anchor || 'FULL BODY';
            const movementPattern = resolveAnchorToPattern(userAnchor, workoutHistory);
            console.log(`Anchor mapping: ${userAnchor} -> ${movementPattern}`);

            // Call the Edge Function
            const result = await generateWorkout({
                intensity: params.intensity,
                anchor: movementPattern,
                goal: params.goal || 'balanced',
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
                const workout = generateMockWorkout(params.intensity, movementPattern);
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
                    setCurrentSessionId(null);
                }

                // Transform API response to frontend format
                const workout = transformAPIWorkoutToFrontend(
                    result.workout,
                    params.intensity,
                    movementPattern,
                    params.goal || 'balanced'
                );
                setGeneratedWorkout(workout);
                toast.success("Workout generated!", {
                    description: `${userAnchor} (${movementPattern}) at intensity ${params.intensity}`,
                });
            }

            if (onSuccess) onSuccess();

        } catch (err) {
            console.error('Unexpected error:', err);
            toast.error("Generation failed", {
                description: "Using demo workout instead",
            });
            // Use a default movement pattern for the mock
            const fallbackPattern = resolveAnchorToPattern(params.anchor || 'FULL BODY', workoutHistory);
            const workout = generateMockWorkout(params.intensity, fallbackPattern);
            setGeneratedWorkout(workout);
            if (onSuccess) onSuccess();
        } finally {
            setIsGenerating(false);
        }
    };

    const handleQuickStart = (intensity: number, anchor: AnchorType, onSuccess?: () => void) => {
        // Use the real generation flow with Quick Start params
        const defaultLocation = userPreferences.locations.find(
            l => l.id === userPreferences.defaultLocationId
        ) || userPreferences.locations[0];

        const params: WorkoutParams = {
            intensity,
            anchor,
            goal: 'balanced',
            location: defaultLocation?.name || "Gym",
            time: "45 min",
            notes: "",
        };

        handleGenerate(params, onSuccess);
    };

    const handleStartWorkout = (onSuccess?: () => void) => {
        workoutStartTime.current = Date.now();
        if (onSuccess) onSuccess();
    };

    const handleFinishWorkout = (notes: WorkoutNotes, onSuccess?: () => void) => {
        const elapsed = Math.floor((Date.now() - workoutStartTime.current) / 1000);
        setTotalTime(elapsed);
        setWorkoutNotes(notes);
        if (onSuccess) onSuccess();
    };

    const handleFinishSession = async (mood: number | null, sessionNotes: string, onSuccess?: () => void) => {
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

        // Navigate first, then reset state and reload data
        if (onSuccess) onSuccess();
        setGeneratedWorkout(null);
        setWorkoutNotes(null);
        setCurrentSessionId(null);
        setCurrentLocationId(null);
        loadHomeData();
    };

    const handleResumeIncomplete = async (incompleteSessionId: string, onSuccess?: () => void) => {
        // Fetch the incomplete workout detail and show it in review
        const detail = await fetchWorkoutDetail(incompleteSessionId);

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
            setCurrentSessionId(incompleteSessionId);
            if (onSuccess) onSuccess();
        } else {
            // Can't reconstruct, abandon it - the caller should handle the abandonment logic (clearing session etc)
            return false;
        }
        return true;
    };

    return {
        workoutParams,
        generatedWorkout,
        workoutNotes,
        totalTime,
        isGenerating,
        currentSessionId,
        currentLocationId,
        handleGenerate,
        handleQuickStart,
        handleStartWorkout,
        handleFinishWorkout,
        handleFinishSession,
        handleResumeIncomplete
    };
};
