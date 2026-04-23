import { ArrowRight, Loader2 } from "lucide-react";
import { CTAButton } from "./CTAButton";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const GenerateButton = ({ onClick, disabled, isLoading }: GenerateButtonProps) => {
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
      <div style={{ maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto' }}>
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
    </div>
  );
};
