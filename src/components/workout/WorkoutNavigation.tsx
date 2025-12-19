import { ChevronLeft, ChevronRight } from "lucide-react";

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
        <button
          onClick={onBack}
          disabled={currentSection === 0}
          className="ghost-button px-4 py-3 flex items-center gap-1 font-display font-bold uppercase tracking-wide text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        
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
        <button
          onClick={onNext}
          className="glow-button px-4 py-3 flex items-center gap-1 font-display font-bold uppercase tracking-wide text-foreground"
        >
          {isLastSection ? "Finish" : "Next"}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
