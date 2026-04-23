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
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 'var(--spacing-600)',
        paddingBottom: 'var(--spacing-400)',
        paddingLeft: 'var(--spacing-400)',
        paddingRight: 'var(--spacing-400)',
        zIndex: 40,
        background: 'linear-gradient(to top, var(--background), var(--background) 60%, transparent)',
      }}
    >
      <div style={{ maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--spacing-400)' }}>
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
