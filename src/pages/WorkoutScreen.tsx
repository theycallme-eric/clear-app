import { useState, useRef, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { WorkoutNavigation } from "@/components/workout/WorkoutNavigation";
import { PageHeader } from "@/components/PageHeader";
import { WorkoutLayout } from "@/layouts";
import { SectionRenderer, StructureResultData } from "@/components/workout/SectionRenderer";
import { ProgressTracker } from "@/components/workout/ProgressTracker";
import { useWorkoutFlowContext } from "@/contexts/WorkoutFlowContext";

type LoggedExerciseData = Record<string, { weight?: string; reps?: string; notes?: string }>;

export const WorkoutScreen = () => {
  const navigate = useNavigate();
  const { generatedWorkout, handleFinishWorkout } = useWorkoutFlowContext();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loggedData, setLoggedData] = useState<LoggedExerciseData>({});
  const [structureResults, setStructureResults] = useState<Record<string, StructureResultData>>({});

  const touchStartX = useRef<number | null>(null);
  const startTime = useRef(Date.now());

  if (!generatedWorkout) {
    return <Navigate to="/generate" replace />;
  }

  const currentSection = generatedWorkout.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === generatedWorkout.sections.length - 1;
  const progress = ((currentSectionIndex + 1) / generatedWorkout.sections.length) * 100;

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
      handleFinishWorkout({
        loggedData,
        structureResults,
        durationSeconds: Math.floor((Date.now() - startTime.current) / 1000)
      }, () => navigate("/summary"));
    } else {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleLog = (id: string, data: { weight?: string; reps?: string; notes?: string }) => {
    setLoggedData(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...data }
    }));
  };

  const handleStructureResult = useCallback((sectionName: string, data: StructureResultData) => {
    setStructureResults(prev => ({ ...prev, [sectionName]: data }));
  }, []);

  return (
    <WorkoutLayout
      header={
        <PageHeader
          left="back"
          onBack={() => navigate("/review")}
          center="timer"
          right="menu"
          onMenu={() => navigate("/settings")}
          timerProps={{ isRunning: true, startTime: startTime.current }}
        />
      }
      footer={
        <WorkoutNavigation
          currentSection={currentSectionIndex}
          onBack={handleBack}
          onNext={handleNext}
          isLastSection={isLastSection}
        />
      }
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mb-6 space-y-2">
        <ProgressTracker progress={progress} />
        <span
          className="text-label-xs uppercase tracking-widest"
          style={{ color: 'var(--text-paragraph)' }}
        >
          {generatedWorkout.goal ? `${generatedWorkout.goal.replace('_', ' ')} · ` : ''}{generatedWorkout.anchor} &bull; Intensity {generatedWorkout.intensity}
        </span>
      </div>

      <SectionRenderer
        key={currentSectionIndex}
        section={currentSection}
        onLog={handleLog}
        onStructureResult={handleStructureResult}
      />
    </WorkoutLayout>
  );
};
