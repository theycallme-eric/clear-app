import { useState, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { logger } from "@/lib/logger";
import {
    GeneratedWorkout,
    WorkoutNotes,
} from "@/types/workout";
import { completeWorkoutSession, fetchSessionForRepeat, createRepeatSession, buildWorkoutFromSections, injectDBUUIDs } from "@/lib/workout-api";
import { fetchWorkoutDetail } from "@/lib/home-data";
import { getFavoriteDetail, recordFavoriteCompletion, getLastExerciseData, getPreviousBests, getSessionNotesHistory } from "@/lib/favorites-api";
import type { RepeatSectionInput } from "@/lib/workout-api";

interface UseWorkoutSessionOptions {
    currentSessionId: string | null;
    setCurrentSessionId: (id: string | null) => void;
    setCurrentLocationId: (id: string | null) => void;
    setGeneratedWorkout: (workout: GeneratedWorkout | null) => void;
    loadHomeData: () => Promise<void>;
}

export const useWorkoutSession = ({
    currentSessionId,
    setCurrentSessionId,
    setCurrentLocationId,
    setGeneratedWorkout,
    loadHomeData,
}: UseWorkoutSessionOptions) => {
    const [workoutNotes, setWorkoutNotes] = useState<WorkoutNotes | null>(null);
    const workoutStartTime = useRef<number>(0);
    const [totalTime, setTotalTime] = useState(0);

    // Repeat state
    const [isRepeat, setIsRepeat] = useState(false);
    const [repeatSavedWorkoutId, setRepeatSavedWorkoutId] = useState<string | null>(null);

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
        logger.workout.debug('handleFinishSession called', { currentSessionId, totalTime: String(totalTime), durationMins: String(durationMins) });

        // Save completion data to database if we have a session
        try {
            if (currentSessionId) {
                const result = await completeWorkoutSession(currentSessionId, {
                    durationMins,
                    mood,
                    sessionNotes,
                    loggedData: workoutNotes?.loggedData,
                    structureResults: workoutNotes?.structureResults,
                });

                // Record favorite completion before showing toast
                if (!result.error && repeatSavedWorkoutId) {
                    const compResult = await recordFavoriteCompletion(repeatSavedWorkoutId, currentSessionId);
                    if (!compResult.success) {
                        logger.workout.warn('recordFavoriteCompletion failed', { error: compResult.error });
                    } else {
                        logger.workout.info('Favorite completion recorded', { savedWorkoutId: repeatSavedWorkoutId });
                    }
                }

                if (result.error) {
                    toast.error("Failed to save workout", {
                        description: "Your progress may not have been recorded.",
                    });
                } else if (result.partialFailures) {
                    toast.info("Session saved with issues", {
                        description: `${result.partialFailures} logged item(s) may not have saved. Your session is recorded.`,
                    });
                } else {
                    toast.success("Session saved!", {
                        description: "Your workout has been recorded.",
                    });
                }
            } else {
                toast.success("Session complete!", {
                    description: "Demo workout - not saved to history.",
                });
            }
        } catch (err) {
            logger.workout.error('handleFinishSession error', { error: err instanceof Error ? err.message : String(err) });
            toast.error("Something went wrong", {
                description: "Your workout may not have been saved.",
            });
        }

        // Always navigate and reset — even if save failed
        if (onSuccess) onSuccess();
        setGeneratedWorkout(null);
        setWorkoutNotes(null);
        setCurrentSessionId(null);
        setCurrentLocationId(null);
        setIsRepeat(false);
        setRepeatSavedWorkoutId(null);
        loadHomeData();
    };

    const handleResumeIncomplete = async (incompleteSessionId: string, onSuccess?: () => void) => {
        // Fetch the incomplete workout detail and show it in review
        const detail = await fetchWorkoutDetail(incompleteSessionId);

        if (detail && detail.sections && detail.sections.length > 0) {
            // Reconstruct a GeneratedWorkout from the saved session
            // Use real DB UUIDs from the query (s.id, ex.id) so logged data persists correctly
            const workout: GeneratedWorkout = {
                id: incompleteSessionId,
                title: `${detail.anchor} Workout`,
                description: '',
                duration: `${detail.duration}m`,
                intensity: detail.intensity,
                anchor: detail.anchor,
                sections: detail.sections.map((s) => ({
                    id: s.id,
                    name: s.name,
                    type: 'accessory' as const,
                    status: 'not_started' as const,
                    exercises: s.exercises.map((ex) => ({
                        id: ex.id,
                        name: ex.name,
                        sets: ex.sets,
                        reps: typeof ex.reps === 'string' ? ex.reps : String(ex.reps),
                        weight: ex.weight || undefined,
                        equipment: ex.equipment || undefined,
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

    /**
     * Repeat a workout from history.
     * Fetches the original session's raw data, creates a new DB session, and loads into context.
     */
    const handleRepeatFromHistory = async (originalSessionId: string, onSuccess?: () => void) => {
        const data = await fetchSessionForRepeat(originalSessionId);
        if (!data) {
            toast.error("Couldn't load workout for repeat");
            return;
        }

        const saveResult = await createRepeatSession(data.metadata, data.sections);
        if ('error' in saveResult) {
            toast.error("Couldn't create repeat session", { description: saveResult.error });
            return;
        }

        let workout = buildWorkoutFromSections(data.sections, {
            anchor: data.metadata.anchor,
            intensity: data.metadata.intensity,
            durationMins: data.metadata.durationMins,
            goal: data.metadata.goalPreset,
        });

        workout = injectDBUUIDs(workout, saveResult.uuids);

        setGeneratedWorkout(workout);
        setCurrentSessionId(saveResult.sessionId);
        setIsRepeat(true);
        setRepeatSavedWorkoutId(null); // Not a favorite repeat
        logger.workout.info('Repeat from history loaded', { originalSessionId, newSessionId: saveResult.sessionId });
        if (onSuccess) onSuccess();
    };

    /**
     * Repeat a workout from favorites.
     * Loads from the saved workout_snapshot, creates a new DB session, and loads into context.
     * Fetches last weights from most recent completion and attaches as lastWeight.
     */
    const handleRepeatFromFavorite = async (savedWorkoutId: string, onSuccess?: () => void) => {
        const detail = await getFavoriteDetail(savedWorkoutId);
        if (!detail || !detail.workout_snapshot) {
            toast.error("Couldn't load favorited workout");
            return;
        }

        const snapshot = detail.workout_snapshot as { sections: RepeatSectionInput[] };
        if (!snapshot.sections || snapshot.sections.length === 0) {
            toast.error("Saved workout has no sections");
            return;
        }

        const metadata = {
            anchor: detail.anchor || 'power',
            intensity: detail.intensity || 5,
            durationMins: detail.duration_mins || undefined,
            goalPreset: undefined as string | undefined,
        };

        // Fetch last exercise data, previous bests, and session notes from completion history
        const [lastExerciseData, previousBests, notesHistory] = await Promise.all([
            getLastExerciseData(savedWorkoutId),
            getPreviousBests(savedWorkoutId),
            getSessionNotesHistory(savedWorkoutId),
        ]);

        const saveResult = await createRepeatSession(metadata, snapshot.sections);
        if ('error' in saveResult) {
            toast.error("Couldn't create repeat session", { description: saveResult.error });
            return;
        }

        let workout = buildWorkoutFromSections(snapshot.sections, {
            anchor: metadata.anchor,
            intensity: metadata.intensity,
            durationMins: metadata.durationMins,
        });

        workout = injectDBUUIDs(workout, saveResult.uuids);

        // Attach last exercise data (weights + notes), previous bests, and session notes history
        const hasExerciseData = Object.keys(lastExerciseData).length > 0;
        const hasPreviousBests = Object.keys(previousBests).length > 0;

        if (hasExerciseData || hasPreviousBests) {
            workout = {
                ...workout,
                sections: workout.sections.map((section, sIndex) => ({
                    ...section,
                    previousBest: previousBests[sIndex] || undefined,
                    exercises: hasExerciseData
                        ? section.exercises.map((exercise, eIndex) => {
                            const key = `${sIndex}-${eIndex}`;
                            const data = lastExerciseData[key];
                            if (!data) return exercise;
                            return {
                                ...exercise,
                                lastWeight: data.weight,
                                lastNotes: data.notes,
                            };
                        })
                        : section.exercises,
                })),
            };
        }

        if (notesHistory.length > 0) {
            workout = { ...workout, sessionNotesHistory: notesHistory };
        }

        setGeneratedWorkout(workout);
        setCurrentSessionId(saveResult.sessionId);
        setIsRepeat(true);
        setRepeatSavedWorkoutId(savedWorkoutId);
        logger.workout.info('Repeat from favorite loaded', { savedWorkoutId, newSessionId: saveResult.sessionId });
        if (onSuccess) onSuccess();
    };

    return {
        workoutNotes,
        totalTime,
        isRepeat,
        repeatSavedWorkoutId,
        handleStartWorkout,
        handleFinishWorkout,
        handleFinishSession,
        handleResumeIncomplete,
        handleRepeatFromHistory,
        handleRepeatFromFavorite,
    };
};
