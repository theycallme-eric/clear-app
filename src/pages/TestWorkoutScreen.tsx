import { useMemo } from "react";
import { WorkoutScreen } from "@/pages/WorkoutScreen";
import { generateTestWorkout } from "@/lib/test-fixtures";

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
