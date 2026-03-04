import { useState, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { logger } from "@/lib/logger";
import {
    GeneratedWorkout,
    WorkoutNotes,
} from "@/types/workout";
import { completeWorkoutSession } from "@/lib/workout-api";
import { fetchWorkoutDetail } from "@/lib/home-data";

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
                });

                if (result.error) {
                    toast.error("Failed to save workout", {
                        description: "Your progress may not have been recorded.",
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
        loadHomeData();
    };

    const handleResumeIncomplete = async (incompleteSessionId: string, onSuccess?: () => void) => {
        // Fetch the incomplete workout detail and show it in review
        const detail = await fetchWorkoutDetail(incompleteSessionId);

        if (detail && detail.sections && detail.sections.length > 0) {
            // Reconstruct a GeneratedWorkout from the saved session
            const workout: GeneratedWorkout = {
                id: incompleteSessionId,
                title: `${detail.anchor} Workout`,
                description: '',
                duration: `${detail.duration}m`,
                intensity: detail.intensity,
                anchor: detail.anchor,
                sections: detail.sections.map((s, i) => ({
                    id: `${s.name}-${i}`,
                    name: s.name,
                    type: 'accessory' as const,
                    status: 'not_started' as const,
                    exercises: s.exercises.map((ex, j) => ({
                        id: `${s.name}-${i}-ex-${j}`,
                        name: ex.name,
                        sets: ex.sets,
                        reps: typeof ex.reps === 'string' ? ex.reps : String(ex.reps),
                        weight: ex.weight || undefined,
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
        workoutNotes,
        totalTime,
        handleStartWorkout,
        handleFinishWorkout,
        handleFinishSession,
        handleResumeIncomplete,
    };
};
