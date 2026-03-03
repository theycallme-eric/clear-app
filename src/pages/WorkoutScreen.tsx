import { useState, useRef, useCallback } from "react";
import { GeneratedWorkout } from "@/types/workout";
import { WorkoutNavigation } from "@/components/workout/WorkoutNavigation";
import { GlobalTimer } from "@/components/workout/GlobalTimer";
import { SectionRenderer, StructureResultData } from "@/components/workout/SectionRenderer";
import { ProgressTracker } from "@/components/workout/ProgressTracker";

interface WorkoutScreenProps {
  workout: GeneratedWorkout;
  onExit: () => void;
  onFinish: (data: any) => void;
}

export const WorkoutScreen = ({ workout, onExit, onFinish }: WorkoutScreenProps) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loggedData, setLoggedData] = useState<Record<string, any>>({});
  const [structureResults, setStructureResults] = useState<Record<string, StructureResultData>>({});

  const touchStartX = useRef<number | null>(null);
  const startTime = useRef(Date.now());

  const currentSection = workout.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === workout.sections.length - 1;
  const progress = ((currentSectionIndex + 1) / workout.sections.length) * 100;

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const threshold = 50;

    if (diff > threshold && !isLastSection) {
      handleNext();
    } else if (diff < -threshold && currentSectionIndex > 0) {
      handleBack();
    }

    touchStartX.current = null;
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (isLastSection) {
      onFinish({
        loggedData,
        structureResults,
        durationSeconds: Math.floor((Date.now() - startTime.current) / 1000)
      });
    } else {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleLog = (id: string, data: any) => {
    setLoggedData(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...data }
    }));
  };

  const handleStructureResult = useCallback((sectionName: string, data: StructureResultData) => {
    setStructureResults(prev => ({ ...prev, [sectionName]: data }));
  }, []);

  return (
    <div
      className="min-h-screen grain-overlay flex flex-col pb-28 relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <GlobalTimer isRunning={true} startTime={startTime.current} />

      <div className="max-w-md mx-auto w-full px-4 pt-2">
        {/* Section Header */}
        <div className="mb-6 space-y-2">
          <ProgressTracker progress={progress} />
          <span
            className="text-label-xs uppercase tracking-widest"
            style={{ color: 'var(--text-paragraph)' }}
          >
            {workout.goal ? `${workout.goal.replace('_', ' ')} · ` : ''}{workout.anchor} &bull; Intensity {workout.intensity}
          </span>
        </div>

        {/* Exercises */}
        <SectionRenderer
          key={currentSectionIndex}
          section={currentSection}
          onLog={handleLog}
          onStructureResult={handleStructureResult}
        />
      </div>

      <WorkoutNavigation
        currentSection={currentSectionIndex}
        onBack={handleBack}
        onNext={handleNext}
        isLastSection={isLastSection}
      />
    </div>
  );
};
