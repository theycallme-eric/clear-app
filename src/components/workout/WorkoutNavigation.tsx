import { CTAButton } from "../CTAButton";

interface WorkoutNavigationProps {
  currentSection: number;
  totalSections: number;
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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4 px-4 z-20">
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
