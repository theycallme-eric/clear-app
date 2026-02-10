import { ArrowRight } from "lucide-react";
import { CTAButton } from "./CTAButton";

interface StartWorkoutButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const StartWorkoutButton = ({ onClick, disabled }: StartWorkoutButtonProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
      <div className="max-w-md mx-auto">
        <CTAButton
          onClick={onClick}
          disabled={disabled}
          size="lg"
          fullWidth
          iconRight={<ArrowRight size={20} />}
        >
          Start Workout
        </CTAButton>
      </div>
    </div>
  );
};
