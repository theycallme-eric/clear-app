import { ArrowRight } from "lucide-react";
import { CTAButton } from "./CTAButton";

interface StartWorkoutButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const StartWorkoutButton = ({ onClick, disabled }: StartWorkoutButtonProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 'var(--spacing-400)',
        zIndex: 40,
        background: 'linear-gradient(to top, var(--background), var(--background) 60%, transparent)',
      }}
    >
      <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
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
