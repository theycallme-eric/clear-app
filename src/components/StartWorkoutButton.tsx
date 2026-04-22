import { ArrowRight } from "lucide-react";
import { CTAButton } from "./CTAButton";

interface StartWorkoutButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const StartWorkoutButton = ({ onClick, disabled }: StartWorkoutButtonProps) => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 p-4 z-40"
      style={{ background: 'linear-gradient(to top, var(--background), var(--background) 60%, transparent)' }}
    >
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
