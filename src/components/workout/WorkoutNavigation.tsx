import { ChevronLeft, ChevronRight } from "lucide-react";
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
  totalSections,
  onBack,
  onNext,
  isLastSection
}: WorkoutNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-4 px-4">
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        {/* Back Button */}
        <CTAButton
          onClick={onBack}
          disabled={currentSection === 0}
          variant="secondary"
          size="md"
          iconLeft={<ChevronLeft size={18} />}
        >
          Back
        </CTAButton>
        
        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSections }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSection 
                  ? "bg-clear-lime" 
                  : index < currentSection 
                    ? "bg-clear-lime/40" 
                    : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        
        {/* Next/Finish Button */}
        <CTAButton
          onClick={onNext}
          size="md"
          iconRight={<ChevronRight size={18} />}
        >
          {isLastSection ? "Finish" : "Next"}
        </CTAButton>
      </div>
    </div>
  );
};
