import { useState, useRef } from "react";
import { GeneratedWorkout } from "@/types/workout";
import { WorkoutNavigation } from "@/components/workout/WorkoutNavigation";
import { GlobalTimer } from "@/components/workout/GlobalTimer";
import { SectionRenderer } from "@/components/workout/SectionRenderer";
import { NoteModal } from "@/components/workout/NoteModal";
import { Plus, FileText } from "lucide-react";
import { CTAButton } from "@/components/CTAButton";

interface WorkoutScreenProps {
  workout: GeneratedWorkout;
  onExit: () => void;
  onFinish: (data: any) => void;
}

export const WorkoutScreen = ({ workout, onExit, onFinish }: WorkoutScreenProps) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [loggedData, setLoggedData] = useState<Record<string, any>>({});
  const [sectionNotes, setSectionNotes] = useState<Record<string, string>>({});

  // Note modal state
  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean;
    title: string;
    key: string;
  }>({ isOpen: false, title: "", key: "" });

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
      // Gather all data
      onFinish({
        completedExercises: Array.from(completedExercises),
        loggedData,
        sectionNotes,
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

  const handleComplete = (id: string, completed: boolean) => {
    const next = new Set(completedExercises);
    if (completed) next.add(id);
    else next.delete(id);
    setCompletedExercises(next);
  };

  const openSectionNote = () => {
    setNoteModal({
      isOpen: true,
      title: `${currentSection.name} Notes`,
      key: currentSection.id
    });
  };

  const handleSaveNote = (note: string) => {
    setSectionNotes((prev) => ({ ...prev, [noteModal.key]: note }));
  };

  return (
    <div
      className="min-h-screen grain-overlay flex flex-col pb-28 relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <GlobalTimer isRunning={true} startTime={startTime.current} />

      <div className="max-w-md mx-auto w-full px-4 pt-2">
        {/* Simplified Header */}
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-clear-orange break-words">
            {currentSection.name}
          </h1>
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-clear-orange transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground uppercase font-bold tracking-widest">
            <span>Section {currentSectionIndex + 1} of {workout.sections.length}</span>
            <span>{currentSection.type.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Main Content */}
        <SectionRenderer
          section={currentSection}
          completedExercises={completedExercises}
          onLog={handleLog}
          onComplete={handleComplete}
        />

        {/* Section Notes Button */}
        <div className="mt-8">
          <CTAButton
            onClick={openSectionNote}
            variant="secondary"
            size="md"
            fullWidth
          >
            {sectionNotes[currentSection.id] ? (
              <>
                <FileText size={16} className="text-clear-orange" />
                Edit Notes
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Section Note
              </>
            )}
          </CTAButton>
        </div>
      </div>

      <WorkoutNavigation
        currentSection={currentSectionIndex}
        totalSections={workout.sections.length}
        onBack={handleBack}
        onNext={handleNext}
        isLastSection={isLastSection}
      />

      <NoteModal
        isOpen={noteModal.isOpen}
        title={noteModal.title}
        initialNote={sectionNotes[noteModal.key] || ""}
        onSave={handleSaveNote}
        onClose={() => setNoteModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
