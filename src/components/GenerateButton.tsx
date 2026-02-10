import { ArrowRight, Loader2 } from "lucide-react";
import { CTAButton } from "./CTAButton";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const GenerateButton = ({ onClick, disabled, isLoading }: GenerateButtonProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
      <CTAButton
        onClick={onClick}
        disabled={disabled || isLoading}
        size="lg"
        fullWidth
        iconRight={
          isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <ArrowRight size={20} />
          )
        }
      >
        {isLoading ? "Generating..." : "Initiate Workout"}
      </CTAButton>
    </div>
  );
};
