import { useState, useRef, useCallback } from "react";
import { toast } from "@/components/ui/sonner";
import { logger } from "@/lib/logger";
import {
    WorkoutParams,
    GeneratedWorkout,
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
    injectDBUUIDs,
    fetchLastSetData,
} from "@/lib/workout-api";
import type { SavedWorkoutUUIDs } from "@/lib/workout-api";
import { resolveAnchorToPattern } from "@/lib/anchor-mapping";

/**
 * Fetch last set data for all exercises in a workout and attach as pre-fill.
 * Looks up by exerciseDefinitionId, falls back to legacy weight_logged.
 */
async function injectLastSetData(workout: GeneratedWorkout): Promise<GeneratedWorkout> {
    // Collect all exercise definition IDs
    const defIds = new Set<string>();
    for (const section of workout.sections) {
        for (const ex of section.exercises) {
            if (ex.exerciseDefinitionId) defIds.add(ex.exerciseDefinitionId);
        }
    }

    if (defIds.size === 0) return workout;

    const { setData, legacyData } = await fetchLastSetData(Array.from(defIds));

    // Attach to exercises
    return {
        ...workout,
        sections: workout.sections.map(section => ({
            ...section,
            exercises: section.exercises.map(ex => {
                if (!ex.exerciseDefinitionId) return ex;
                const sets = setData[ex.exerciseDefinitionId];
                if (sets) {
                    return { ...ex, lastSetData: sets };
                }
                const legacy = legacyData[ex.exerciseDefinitionId];
                if (legacy) {
                    return { ...ex, lastWeight: ex.lastWeight || legacy };
                }
                return ex;
            }),
        })),
    };
}

export const useWorkoutGeneration = (
    userPreferences: UserPreferences,
    workoutHistory: WorkoutHistoryEntry[] = []
) => {
    const [workoutParams, setWorkoutParams] = useState<WorkoutParams | null>(null);
    const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
    const cancelledRef = useRef(false);

    const cancelGeneration = useCallback(() => {
        cancelledRef.current = true;
        setIsGenerating(false);
        toast.info("Generation cancelled");
    }, []);

    const handleGenerate = async (params: WorkoutParams, onSuccess?: () => void) => {
        setWorkoutParams(params);
        setIsGenerating(true);
        cancelledRef.current = false;

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
            logger.workout.debug(`Anchor mapping: ${userAnchor} -> ${movementPattern}`);

            // Goal comes from user profile, not per-workout selection
            const goal = userPreferences.goal || 'balanced';

            // Call the Edge Function
            const result = await generateWorkout({
                intensity: params.intensity,
                anchor: movementPattern,
                goal,
                duration_mins: durationMins,
                location_name: locationName,
                equipment,
                experience_level: userPreferences.experienceLevel || 'some',
                limitations: userPreferences.limitations || undefined,
                enabled_sections: enabledSections.length > 0 ? enabledSections : undefined,
                notes: params.notes || undefined,
            });

            // If cancelled while waiting, discard result
            if (cancelledRef.current) return;

            if (isGenerationError(result)) {
                // Fallback to mock workout on error
                logger.workout.error('Generation error', { error: result.error, details: result.details });
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
                logger.workout.debug('Saving workout', { locationId, locationName: defaultLocation?.name });
                setCurrentLocationId(locationId);

                let savedUUIDs: SavedWorkoutUUIDs | null = null;

                if (locationId) {
                    logger.workout.debug('Calling saveGeneratedWorkout');
                    const saveResult = await saveGeneratedWorkout(result, locationId);
                    if ('sessionId' in saveResult) {
                        savedUUIDs = saveResult.uuids;
                        setCurrentSessionId(saveResult.sessionId);
                        logger.workout.info('Workout saved', { sessionId: saveResult.sessionId });
                    } else {
                        logger.workout.error('Failed to save workout', { error: saveResult.error, details: saveResult.details });
                        toast.error("Workout not saved", {
                            description: saveResult.details || saveResult.error,
                        });
                        // Still show the workout even if save failed
                    }
                } else {
                    logger.workout.warn('No location ID available, workout not saved to database');
                    setCurrentSessionId(null);
                }

                // Transform API response to frontend format
                let workout = transformAPIWorkoutToFrontend(
                    result.workout,
                    params.intensity,
                    movementPattern,
                    goal
                );

                // Inject DB UUIDs from the save response (same atomic transaction)
                if (savedUUIDs) {
                    workout = injectDBUUIDs(workout, savedUUIDs);
                    logger.workout.info('DB UUIDs injected into workout', {
                        sections: savedUUIDs.sections.length,
                        exercises: savedUUIDs.sections.reduce((sum, s) => sum + s.exercises.length, 0),
                    });
                }

                // Pre-fill from last session data
                workout = await injectLastSetData(workout);

                setGeneratedWorkout(workout);
                toast.success("Workout generated!", {
                    description: `${userAnchor} (${movementPattern}) at intensity ${params.intensity}`,
                });
            }

            if (onSuccess) onSuccess();

        } catch (err) {
            logger.workout.error('Unexpected generation error', { error: err instanceof Error ? err.message : String(err) });
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
            location: defaultLocation?.name || "Gym",
            time: "45 min",
            notes: "",
        };

        handleGenerate(params, onSuccess);
    };

    return {
        workoutParams,
        generatedWorkout,
        setGeneratedWorkout,
        isGenerating,
        currentSessionId,
        setCurrentSessionId,
        currentLocationId,
        setCurrentLocationId,
        handleGenerate,
        handleQuickStart,
        cancelGeneration,
    };
};
