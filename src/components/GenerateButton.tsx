import { ArrowRight, Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const GenerateButton = ({ onClick, disabled, isLoading }: GenerateButtonProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="glow-button w-full h-14 font-display text-lg font-bold uppercase tracking-wider text-foreground flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            Initiate Workout
            <ArrowRight size={20} />
          </>
        )}
      </button>
    </div>
  );
};
