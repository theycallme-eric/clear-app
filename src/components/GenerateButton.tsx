import { ArrowRight } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const GenerateButton = ({ onClick, disabled }: GenerateButtonProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
      <button
        onClick={onClick}
        disabled={disabled}
        className="glow-button w-full h-14 font-display text-lg font-bold uppercase tracking-wider text-foreground flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Initiate Workout
        <ArrowRight size={20} />
      </button>
    </div>
  );
};
