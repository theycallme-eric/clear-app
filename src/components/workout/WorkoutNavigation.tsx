import { CTAButton } from "../CTAButton";

interface WorkoutNavigationProps {
  currentSection: number;
  onBack: () => void;
  onNext: () => void;
  isLastSection: boolean;
}

export const WorkoutNavigation = ({
  currentSection,
  onBack,
  onNext,
  isLastSection
}: WorkoutNavigationProps) => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 pt-6 pb-4 px-4 z-40"
      style={{ background: 'linear-gradient(to top, var(--color-neutral-900), var(--color-neutral-900) 60%, transparent)' }}
    >
      <div className="max-w-md mx-auto flex items-center gap-4">
        <CTAButton
          onClick={onBack}
          disabled={currentSection === 0}
          variant="secondary"
          size="md"
          fullWidth
        >
          Back
        </CTAButton>

        <CTAButton
          onClick={onNext}
          size="md"
          fullWidth
        >
          {isLastSection ? "Finish" : "Next"}
        </CTAButton>
      </div>
    </div>
  );
};
