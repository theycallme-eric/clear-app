import { useMemo } from "react";
import { WorkoutScreen } from "@/pages/WorkoutScreen";
import { generateTestWorkout } from "@/types/workout";

interface TestWorkoutScreenProps {
  onBack: () => void;
}

export const TestWorkoutScreen = ({ onBack }: TestWorkoutScreenProps) => {
  const testWorkout = useMemo(() => generateTestWorkout(), []);

  return (
    <WorkoutScreen
      workout={testWorkout}
      onExit={onBack}
      onFinish={() => onBack()}
    />
  );
};
