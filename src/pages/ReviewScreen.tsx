import { useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { WorkoutOverview } from "@/components/WorkoutOverview";
import { WorkoutSectionCard } from "@/components/WorkoutSectionCard";
import { StartWorkoutButton } from "@/components/StartWorkoutButton";
import { useWorkoutFlowContext } from "@/contexts/WorkoutFlowContext";
import { useExerciseSwap, type SwapSessionContext } from "@/hooks/useExerciseSwap";

const MAX_SWAPS = 3;

export const ReviewScreen = () => {
  const navigate = useNavigate();
  const {
    generatedWorkout,
    setGeneratedWorkout,
    handleStartWorkout,
    workoutParams,
    currentLocationId,
    isRepeat,
  } = useWorkoutFlowContext();

  const {
    swapLoading,
    swapError,
    performSwap,
    performUnitSwap,
    revertToPrevious,
    getSwapSlot,
    isSwapDisabled,
  } = useExerciseSwap(generatedWorkout, setGeneratedWorkout);

  if (!generatedWorkout) {
    return <Navigate to="/generate" replace />;
  }

  const backRoute = isRepeat ? "/history" : "/generate";

  // Build session context for swap API calls
  const sessionContext: SwapSessionContext = useMemo(() => {
    // Collect all exercise IDs across sections (for exclude_exercises)
    const allExerciseIds = generatedWorkout.sections.flatMap(
      s => s.exercises.map(e => e.id)
    );

    return {
      intensity: generatedWorkout.intensity,
      anchor: generatedWorkout.anchor,
      goal: generatedWorkout.goal,
      locationId: currentLocationId || undefined,
      excludeExercises: allExerciseIds,
    };
  }, [generatedWorkout, currentLocationId]);

  // Build swap control props for each section
  const buildExerciseSwapControls = (sectionId: string, exercises: typeof generatedWorkout.sections[0]['exercises']) => {
    if (isRepeat) return {}; // No swap controls for repeat workouts

    const controls: Record<number, any> = {};

    exercises.forEach((exercise, index) => {
      const structure = exercise.structure;
      const isStandard = !structure || structure.type === 'standard';
      const isCircuit = structure?.type === 'circuit';

      // Only show swap controls on standard + circuit exercises
      if (!isStandard && !isCircuit) return;

      const key = String(index);
      const slot = getSwapSlot(sectionId, key);
      const loading = swapLoading?.sectionId === sectionId && swapLoading?.key === key;
      const error = swapError?.sectionId === sectionId && swapError?.key === key
        ? swapError.message : null;

      controls[index] = {
        onSwap: () => {
          if (isSwapDisabled(sectionId, key)) {
            toast.info("Nothing feeling right? Try regenerating with different inputs.", {
              action: {
                label: "Regenerate Workout",
                onClick: () => navigate("/generate"),
              },
            });
            return;
          }
          performSwap(sectionId, index, sessionContext);
        },
        onPrevious: () => revertToPrevious(sectionId, key),
        isSwapLoading: loading,
        isSwapDisabled: isSwapDisabled(sectionId, key),
        hasPrevious: (slot?.history?.length ?? 0) > 0,
        swapError: error,
        showSwapControls: true,
      };
    });

    return controls;
  };

  const buildGroupSwapControls = (sectionId: string, exercises: typeof generatedWorkout.sections[0]['exercises']) => {
    if (isRepeat) return {}; // No swap controls for repeat workouts

    const controls: Record<string, any> = {};
    const seenGroups = new Set<string>();

    exercises.forEach((exercise) => {
      const structure = exercise.structure;
      if (!structure || structure.type === 'standard' || structure.type === 'circuit') return;

      const groupId = 'group_id' in structure ? structure.group_id : undefined;
      if (!groupId || seenGroups.has(groupId)) return;
      seenGroups.add(groupId);

      const slot = getSwapSlot(sectionId, groupId);
      const loading = swapLoading?.sectionId === sectionId && swapLoading?.key === groupId;

      const swapLabel = structure.type === 'superset' ? 'Swap Pair' : 'Swap Block';

      controls[groupId] = {
        onSwap: () => {
          if (isSwapDisabled(sectionId, groupId)) {
            toast.info("Nothing feeling right? Try regenerating with different inputs.", {
              action: {
                label: "Regenerate Workout",
                onClick: () => navigate("/generate"),
              },
            });
            return;
          }
          performUnitSwap(sectionId, groupId, structure.type, sessionContext);
        },
        onPrevious: () => revertToPrevious(sectionId, groupId),
        isSwapLoading: loading,
        isSwapDisabled: isSwapDisabled(sectionId, groupId),
        hasPrevious: (slot?.history?.length ?? 0) > 0,
        label: swapLabel,
      };
    });

    return controls;
  };

  return (
    <AppLayout
      header={<PageHeader left="back" onBack={() => navigate(backRoute)} right="menu" onMenu={() => navigate("/settings")} />}
      footer={<StartWorkoutButton onClick={() => handleStartWorkout(() => navigate("/workout"))} />}
    >
      <div className="pt-6 space-y-6 stagger-reveal">
        <WorkoutOverview workout={generatedWorkout} />

        <div className="space-y-4">
          {generatedWorkout.sections.map((section) => (
            <WorkoutSectionCard
              key={section.id}
              section={section}
              exerciseSwapControls={buildExerciseSwapControls(section.id, section.exercises)}
              groupSwapControls={buildGroupSwapControls(section.id, section.exercises)}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};
