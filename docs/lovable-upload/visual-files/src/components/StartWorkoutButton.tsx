import { ArrowRight } from "lucide-react";

interface StartWorkoutButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const StartWorkoutButton = ({ onClick, disabled }: StartWorkoutButtonProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
      <div className="max-w-md mx-auto">
        <button
          onClick={onClick}
          disabled={disabled}
          className="glow-button w-full h-14 font-display text-lg font-bold uppercase tracking-wider text-foreground flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Workout
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
