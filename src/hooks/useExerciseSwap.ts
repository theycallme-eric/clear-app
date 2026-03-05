import { useState, useCallback, useRef } from 'react';
import type { GeneratedWorkout, Exercise, WorkoutSection } from '@/types/workout';
import type { GeneratedExercise, GeneratedSection, SectionType } from '@/types/generation';
import { generateSection, isGenerationError } from '@/lib/workout-api';
import { SECTION_TO_DB } from '@/lib/section-mapping';

// ============================================
// TYPES
// ============================================

export interface SwapSlot {
  current: Exercise | Exercise[];
  history: (Exercise | Exercise[])[];
  swapCount: number;
}

interface SectionSwapState {
  [key: string]: SwapSlot; // keyed by exerciseIndex (single) or group_id (unit)
}

interface SwapState {
  [sectionId: string]: SectionSwapState;
}

interface SwapLoading {
  sectionId: string;
  key: string; // exerciseIndex or group_id
}

export interface UseExerciseSwapReturn {
  swapState: SwapState;
  swapLoading: SwapLoading | null;
  swapError: { sectionId: string; key: string; message: string } | null;
  performSwap: (
    sectionId: string,
    exerciseIndex: number,
    sessionContext: SwapSessionContext
  ) => Promise<void>;
  performUnitSwap: (
    sectionId: string,
    groupId: string,
    structureType: string,
    sessionContext: SwapSessionContext
  ) => Promise<void>;
  revertToPrevious: (sectionId: string, key: string) => void;
  getSwapSlot: (sectionId: string, key: string) => SwapSlot | undefined;
  isSwapDisabled: (sectionId: string, key: string) => boolean;
}

export interface SwapSessionContext {
  intensity: number;
  anchor: string;
  goal?: string;
  locationId?: string;
  equipment?: string[];
  excludeExercises?: string[];
}

const MAX_SWAPS = 3;
const DEBOUNCE_MS = 2000;

// ============================================
// HOOK
// ============================================

export function useExerciseSwap(
  generatedWorkout: GeneratedWorkout | null,
  setGeneratedWorkout: React.Dispatch<React.SetStateAction<GeneratedWorkout | null>>
): UseExerciseSwapReturn {
  const [swapState, setSwapState] = useState<SwapState>({});
  const [swapLoading, setSwapLoading] = useState<SwapLoading | null>(null);
  const [swapError, setSwapError] = useState<{ sectionId: string; key: string; message: string } | null>(null);
  const lastSwapTime = useRef<Record<string, number>>({});

  const getSwapSlot = useCallback(
    (sectionId: string, key: string): SwapSlot | undefined => {
      return swapState[sectionId]?.[key];
    },
    [swapState]
  );

  const isSwapDisabled = useCallback(
    (sectionId: string, key: string): boolean => {
      const slot = swapState[sectionId]?.[key];
      return (slot?.swapCount ?? 0) >= MAX_SWAPS;
    },
    [swapState]
  );

  /** Convert a frontend WorkoutSection to a GeneratedSection for the API */
  const toAPISection = useCallback(
    (section: WorkoutSection): GeneratedSection => {
      return {
        section_type: (SECTION_TO_DB[section.type] || section.type) as SectionType,
        section_title: section.name,
        section_notes: null,
        estimated_duration_mins: 0,
        exercises: section.exercises.map(toAPIExercise),
      };
    },
    []
  );

  /** Convert a frontend Exercise to a GeneratedExercise for the API */
  const toAPIExercise = (exercise: Exercise): GeneratedExercise => {
    // Map frontend for_time back to API afap
    const structure = exercise.structure || { type: 'standard' as const };
    let apiStructure: GeneratedExercise['structure'];

    if (structure.type === 'for_time') {
      apiStructure = {
        type: 'afap',
        time_cap_mins: structure.time_cap_mins,
        pattern: '',
        group_id: structure.group_id,
      };
    } else if (structure.type === 'circuit') {
      apiStructure = {
        type: 'circuit',
        circuit_id: structure.circuit_id,
        group_id: structure.group_id,
      };
    } else {
      apiStructure = structure as GeneratedExercise['structure'];
    }

    return {
      exercise_id: exercise.id,
      name: exercise.name,
      equipment: exercise.equipment || 'bodyweight',
      sets: exercise.sets,
      reps: exercise.reps,
      effort_percent: exercise.effort ? parseInt(exercise.effort) || null : null,
      tempo: exercise.tempo || null,
      rest_seconds: exercise.rest ? parseInt(exercise.rest) || null : null,
      coaching_cues: exercise.coachingCues || [],
      regression: exercise.regression || null,
      structure: apiStructure,
    };
  };

  const performSwap = useCallback(
    async (
      sectionId: string,
      exerciseIndex: number,
      sessionContext: SwapSessionContext
    ) => {
      if (!generatedWorkout) return;

      const key = String(exerciseIndex);
      const debounceKey = `${sectionId}:${key}`;

      // Debounce check
      const now = Date.now();
      if (now - (lastSwapTime.current[debounceKey] || 0) < DEBOUNCE_MS) return;
      lastSwapTime.current[debounceKey] = now;

      // Check swap limit
      if (isSwapDisabled(sectionId, key)) return;

      const section = generatedWorkout.sections.find(s => s.id === sectionId);
      if (!section) return;

      const currentExercise = section.exercises[exerciseIndex];
      if (!currentExercise) return;

      setSwapLoading({ sectionId, key });
      setSwapError(null);

      try {
        const apiSection = toAPISection(section);
        const keepExercises = section.exercises
          .filter((_, i) => i !== exerciseIndex)
          .map(toAPIExercise);

        // Map section type for API
        const result = await generateSection({
          session_context: {
            intensity: sessionContext.intensity,
            anchor: sessionContext.anchor,
            goal: sessionContext.goal,
            location_id: sessionContext.locationId,
            equipment: sessionContext.equipment,
          },
          section_type: (SECTION_TO_DB[section.type] || section.type) as SectionType,
          exclude_exercises: sessionContext.excludeExercises,
          swap_mode: 'single',
          swap_target: {
            exercise_name: currentExercise.name,
          },
          keep_exercises: keepExercises,
          current_section: apiSection,
        });

        if (isGenerationError(result)) {
          setSwapError({ sectionId, key, message: result.details || result.error });
          return;
        }

        // Find the replacement exercise at the same position in the returned section.
        // The AI returns the full section with one exercise replaced — use position-based
        // matching since the replaced exercise will have a different ID/name at the same slot.
        const newApiExercises = result.section.exercises;
        const replacementApi = newApiExercises[exerciseIndex] || newApiExercises.find(
          e => e.exercise_id !== currentExercise.id && e.name !== currentExercise.name
        );

        if (!replacementApi) {
          setSwapError({ sectionId, key, message: 'No replacement found in response' });
          return;
        }

        // Convert to frontend Exercise
        const replacementExercise = apiExerciseToFrontend(replacementApi);

        // Update swap state (history)
        setSwapState(prev => {
          const sectionState = prev[sectionId] || {};
          const slot = sectionState[key] || { current: currentExercise, history: [], swapCount: 0 };
          const newHistory = [slot.current, ...slot.history].slice(0, MAX_SWAPS);

          return {
            ...prev,
            [sectionId]: {
              ...sectionState,
              [key]: {
                current: replacementExercise,
                history: newHistory,
                swapCount: slot.swapCount + 1,
              },
            },
          };
        });

        // Update the workout
        setGeneratedWorkout(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: prev.sections.map(s =>
              s.id === sectionId
                ? {
                    ...s,
                    exercises: s.exercises.map((ex, i) =>
                      i === exerciseIndex ? replacementExercise : ex
                    ),
                  }
                : s
            ),
          };
        });
      } catch (err) {
        setSwapError({
          sectionId,
          key,
          message: err instanceof Error ? err.message : 'Swap failed',
        });
      } finally {
        setSwapLoading(null);
      }
    },
    [generatedWorkout, isSwapDisabled, setGeneratedWorkout, toAPISection]
  );

  const performUnitSwap = useCallback(
    async (
      sectionId: string,
      groupId: string,
      structureType: string,
      sessionContext: SwapSessionContext
    ) => {
      if (!generatedWorkout) return;

      const key = groupId;
      const debounceKey = `${sectionId}:${key}`;

      // Debounce check
      const now = Date.now();
      if (now - (lastSwapTime.current[debounceKey] || 0) < DEBOUNCE_MS) return;
      lastSwapTime.current[debounceKey] = now;

      // Check swap limit
      if (isSwapDisabled(sectionId, key)) return;

      const section = generatedWorkout.sections.find(s => s.id === sectionId);
      if (!section) return;

      const groupExercises = section.exercises.filter(
        ex => ex.structure && 'group_id' in ex.structure && ex.structure.group_id === groupId
      );
      if (groupExercises.length === 0) return;

      setSwapLoading({ sectionId, key });
      setSwapError(null);

      try {
        const apiSection = toAPISection(section);
        const keepExercises = section.exercises
          .filter(ex => !(ex.structure && 'group_id' in ex.structure && ex.structure.group_id === groupId))
          .map(toAPIExercise);

        const result = await generateSection({
          session_context: {
            intensity: sessionContext.intensity,
            anchor: sessionContext.anchor,
            goal: sessionContext.goal,
            location_id: sessionContext.locationId,
            equipment: sessionContext.equipment,
          },
          section_type: (SECTION_TO_DB[section.type] || section.type) as SectionType,
          exclude_exercises: sessionContext.excludeExercises,
          swap_mode: 'unit',
          swap_target: {
            group_id: groupId,
            structure_type: structureType,
          },
          keep_exercises: keepExercises,
          current_section: apiSection,
        });

        if (isGenerationError(result)) {
          setSwapError({ sectionId, key, message: result.details || result.error });
          return;
        }

        // Find replacement exercises (those with different IDs than the originals)
        const originalIds = new Set(groupExercises.map(e => e.id));
        const newGroupExercises = result.section.exercises
          .filter(e => !originalIds.has(e.exercise_id))
          .map(apiExerciseToFrontend);

        // Update swap state
        setSwapState(prev => {
          const sectionState = prev[sectionId] || {};
          const slot = sectionState[key] || { current: groupExercises, history: [], swapCount: 0 };
          const newHistory = [slot.current, ...slot.history].slice(0, MAX_SWAPS);

          return {
            ...prev,
            [sectionId]: {
              ...sectionState,
              [key]: {
                current: newGroupExercises,
                history: newHistory,
                swapCount: slot.swapCount + 1,
              },
            },
          };
        });

        // Update the workout — replace group exercises in place
        setGeneratedWorkout(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: prev.sections.map(s => {
              if (s.id !== sectionId) return s;

              // Build new exercise list: replace group members, keep everything else in position
              let newGroupIdx = 0;
              return {
                ...s,
                exercises: s.exercises.map(ex => {
                  if (ex.structure && 'group_id' in ex.structure && ex.structure.group_id === groupId) {
                    const replacement = newGroupExercises[newGroupIdx];
                    newGroupIdx++;
                    return replacement || ex;
                  }
                  return ex;
                }),
              };
            }),
          };
        });
      } catch (err) {
        setSwapError({
          sectionId,
          key,
          message: err instanceof Error ? err.message : 'Swap failed',
        });
      } finally {
        setSwapLoading(null);
      }
    },
    [generatedWorkout, isSwapDisabled, setGeneratedWorkout, toAPISection]
  );

  const revertToPrevious = useCallback(
    (sectionId: string, key: string) => {
      const slot = swapState[sectionId]?.[key];
      if (!slot || slot.history.length === 0) return;

      const [previous, ...remainingHistory] = slot.history;

      // Update swap state
      setSwapState(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          [key]: {
            current: previous,
            history: remainingHistory,
            swapCount: slot.swapCount, // don't decrement — previous doesn't "undo" a swap count
          },
        },
      }));

      // Update the workout
      setGeneratedWorkout(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          sections: prev.sections.map(s => {
            if (s.id !== sectionId) return s;

            if (Array.isArray(previous)) {
              // Unit swap revert — replace by group_id
              let prevIdx = 0;
              const currentGroupExercises = Array.isArray(slot.current) ? slot.current : [slot.current];
              const currentIds = new Set(currentGroupExercises.map(e => e.id));

              return {
                ...s,
                exercises: s.exercises.map(ex => {
                  if (currentIds.has(ex.id)) {
                    const replacement = previous[prevIdx];
                    prevIdx++;
                    return replacement || ex;
                  }
                  return ex;
                }),
              };
            } else {
              // Single swap revert — replace by index
              const exerciseIndex = parseInt(key);
              return {
                ...s,
                exercises: s.exercises.map((ex, i) =>
                  i === exerciseIndex ? previous : ex
                ),
              };
            }
          }),
        };
      });
    },
    [swapState, setGeneratedWorkout]
  );

  return {
    swapState,
    swapLoading,
    swapError,
    performSwap,
    performUnitSwap,
    revertToPrevious,
    getSwapSlot,
    isSwapDisabled,
  };
}

// ============================================
// HELPERS
// ============================================

/** Convert an API GeneratedExercise to a frontend Exercise */
function apiExerciseToFrontend(apiEx: GeneratedExercise): Exercise {
  // Map API structure to frontend structure
  let structure: Exercise['structure'];

  if (apiEx.structure.type === 'afap' || apiEx.structure.type === 'timed') {
    structure = {
      type: 'for_time',
      time_cap_mins: 'time_cap_mins' in apiEx.structure ? apiEx.structure.time_cap_mins : 0,
      group_id: apiEx.structure.group_id,
    };
  } else if (apiEx.structure.type === 'circuit') {
    structure = {
      type: 'circuit',
      circuit_id: apiEx.structure.circuit_id,
      rounds: 1, // default, will be overridden if present
      group_id: apiEx.structure.group_id,
    };
  } else {
    structure = apiEx.structure as Exercise['structure'];
  }

  return {
    id: apiEx.exercise_id,
    name: apiEx.name,
    sets: apiEx.sets,
    reps: apiEx.reps,
    effort: apiEx.effort_percent ? `${apiEx.effort_percent}%` : undefined,
    tempo: apiEx.tempo || undefined,
    rest: apiEx.rest_seconds ? `${apiEx.rest_seconds}s` : undefined,
    coachingCues: apiEx.coaching_cues || undefined,
    regression: apiEx.regression || undefined,
    equipment: apiEx.equipment || undefined,
    structure,
  };
}
