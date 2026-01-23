import { useState, useEffect, useRef } from "react";
import { Plus, FileText } from "lucide-react";
import { GeneratedWorkout } from "@/types/workout";
import { WorkoutHeader } from "@/components/workout/WorkoutHeader";
import { WorkoutExerciseItem, ExerciseNote } from "@/components/workout/WorkoutExerciseItem";
import { WorkoutNavigation } from "@/components/workout/WorkoutNavigation";
import { NoteModal } from "@/components/workout/NoteModal";

interface WorkoutScreenProps {
  workout: GeneratedWorkout;
  onExit: () => void;
  onFinish: (notes: WorkoutNotes) => void;
}

export interface WorkoutNotes {
  exerciseNotes: Record<string, ExerciseNote[]>;
  sectionNotes: Record<string, string>;
}

export const WorkoutScreen = ({ workout, onExit, onFinish }: WorkoutScreenProps) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [overallTime, setOverallTime] = useState(0);
  const [sectionTime, setSectionTime] = useState(0);
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, ExerciseNote[]>>({});
  const [sectionNotes, setSectionNotes] = useState<Record<string, string>>({});
  
  // Note modal state (only for section notes now)
  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean;
    title: string;
    key: string;
    type: "section";
  }>({ isOpen: false, title: "", key: "", type: "section" });
  
  const touchStartX = useRef<number | null>(null);
  
  const currentSection = workout.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === workout.sections.length - 1;
  
  // Overall timer
  useEffect(() => {
    const interval = setInterval(() => {
      setOverallTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Section timer - resets when section changes
  useEffect(() => {
    setSectionTime(0);
    const interval = setInterval(() => {
      setSectionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentSectionIndex]);
  
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
      // Swipe left - next section
      handleNext();
    } else if (diff < -threshold && currentSectionIndex > 0) {
      // Swipe right - previous section
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
      onFinish({ exerciseNotes, sectionNotes });
    } else {
      setCurrentSectionIndex((prev) => prev + 1);
    }
  };
  
  const handleAddExerciseNote = (exerciseId: string, noteText: string) => {
    const newNote: ExerciseNote = {
      text: noteText,
      timestamp: new Date()
    };
    setExerciseNotes((prev) => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), newNote]
    }));
  };
  
  const openSectionNote = () => {
    setNoteModal({
      isOpen: true,
      title: `${currentSection.name} Notes`,
      key: currentSection.id,
      type: "section"
    });
  };
  
  const handleSaveNote = (note: string) => {
    setSectionNotes((prev) => ({ ...prev, [noteModal.key]: note }));
  };
  
  const currentSectionNote = sectionNotes[noteModal.key] || "";

  return (
    <div 
      className="min-h-screen grain-overlay flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Combined Header with Timer */}
      <div className="max-w-md mx-auto w-full px-4 pt-4">
        <WorkoutHeader
          sectionName={currentSection.name}
          currentSection={currentSectionIndex}
          totalSections={workout.sections.length}
          sectionTime={sectionTime}
          overallTime={overallTime}
        />
      </div>
      
      <div className="flex-1 max-w-md mx-auto w-full px-4 pb-28">
        {/* Parent Section Card containing all exercises */}
        <div className="mt-4 glass-card p-4">
          {/* Exercise List - nested inside parent card */}
          <div className="space-y-3">
            {currentSection.exercises.map((exercise) => (
              <WorkoutExerciseItem
                key={exercise.id}
                exercise={exercise}
                notes={exerciseNotes[exercise.id] || []}
                onAddNote={(noteText) => handleAddExerciseNote(exercise.id, noteText)}
              />
            ))}
          </div>
        </div>
        
        {/* Section Notes */}
        <div className="mt-4">
          <button
            onClick={openSectionNote}
            className="w-full py-3 flex items-center justify-center gap-2 ghost-button text-foreground font-display uppercase tracking-wide"
          >
            {sectionNotes[currentSection.id] ? (
              <>
                <FileText size={16} className="text-clear-orange" />
                Section Notes
              </>
            ) : (
              <>
                <Plus size={16} />
                Section Notes
              </>
            )}
          </button>
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
        initialNote={currentSectionNote}
        onSave={handleSaveNote}
        onClose={() => setNoteModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
