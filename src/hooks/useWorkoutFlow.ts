import {
    UserPreferences,
    WorkoutHistoryEntry,
} from "@/types/workout";
import { useWorkoutGeneration } from "@/hooks/useWorkoutGeneration";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";

export const useWorkoutFlow = (
    userPreferences: UserPreferences,
    loadHomeData: () => Promise<void>,
    workoutHistory: WorkoutHistoryEntry[] = []
) => {
    const generation = useWorkoutGeneration(userPreferences, workoutHistory);

    const session = useWorkoutSession({
        currentSessionId: generation.currentSessionId,
        setCurrentSessionId: generation.setCurrentSessionId,
        setCurrentLocationId: generation.setCurrentLocationId,
        setGeneratedWorkout: generation.setGeneratedWorkout,
        loadHomeData,
    });

    return {
        workoutParams: generation.workoutParams,
        generatedWorkout: generation.generatedWorkout,
        setGeneratedWorkout: generation.setGeneratedWorkout,
        workoutNotes: session.workoutNotes,
        totalTime: session.totalTime,
        isGenerating: generation.isGenerating,
        currentSessionId: generation.currentSessionId,
        currentLocationId: generation.currentLocationId,
        handleGenerate: generation.handleGenerate,
        handleQuickStart: generation.handleQuickStart,
        cancelGeneration: generation.cancelGeneration,
        handleStartWorkout: session.handleStartWorkout,
        handleFinishWorkout: session.handleFinishWorkout,
        handleFinishSession: session.handleFinishSession,
        handleResumeIncomplete: session.handleResumeIncomplete,
    };
};
