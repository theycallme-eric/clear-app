import { createContext, useContext, ReactNode } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useHomeDataContext } from '@/contexts/HomeDataContext';
import { useWorkoutFlow } from '@/hooks/useWorkoutFlow';
import {
  WorkoutParams,
  GeneratedWorkout,
  WorkoutNotes,
  AnchorType,
  UserPreferences,
} from '@/types/workout';

interface WorkoutFlowContextValue {
  workoutParams: WorkoutParams | null;
  generatedWorkout: GeneratedWorkout | null;
  setGeneratedWorkout: React.Dispatch<React.SetStateAction<GeneratedWorkout | null>>;
  workoutNotes: WorkoutNotes | null;
  totalTime: number;
  isGenerating: boolean;
  isRepeat: boolean;
  repeatSavedWorkoutId: string | null;
  currentSessionId: string | null;
  currentLocationId: string | null;
  handleGenerate: (params: WorkoutParams, onSuccess?: () => void) => Promise<void>;
  handleQuickStart: (intensity: number, anchor: AnchorType, onSuccess?: () => void) => void;
  handleStartWorkout: (onSuccess?: () => void) => void;
  handleFinishWorkout: (notes: WorkoutNotes, onSuccess?: () => void) => void;
  handleFinishSession: (mood: number | null, sessionNotes: string, onSuccess?: () => void) => Promise<void>;
  handleResumeIncomplete: (incompleteSessionId: string, onSuccess?: () => void) => Promise<boolean>;
  handleRepeatFromHistory: (sessionId: string, onSuccess?: () => void) => Promise<void>;
  handleRepeatFromFavorite: (savedWorkoutId: string, onSuccess?: () => void) => Promise<void>;
  cancelGeneration: () => void;
}

const WorkoutFlowContext = createContext<WorkoutFlowContextValue | null>(null);

export function WorkoutFlowProvider({ children }: { children: ReactNode }) {
  const { profile, locations } = useAuthContext();
  const { workoutHistory, loadHomeData } = useHomeDataContext();

  // Build UserPreferences from AuthContext data
  const userPreferences: UserPreferences = {
    onboardingComplete: profile?.onboardingComplete || false,
    locations,
    defaultLocationId: profile?.defaultLocationId || null,
    experienceLevel: profile?.experienceLevel || null,
    goal: profile?.goal || null,
    sections: profile?.enabledSections || [],
    limitations: profile?.limitations || '',
  };

  const workoutFlow = useWorkoutFlow(userPreferences, loadHomeData, workoutHistory);

  return (
    <WorkoutFlowContext.Provider value={workoutFlow}>
      {children}
    </WorkoutFlowContext.Provider>
  );
}

export function useWorkoutFlowContext() {
  const context = useContext(WorkoutFlowContext);
  if (!context) {
    throw new Error('useWorkoutFlowContext must be used within a WorkoutFlowProvider');
  }
  return context;
}
