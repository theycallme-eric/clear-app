import { CheckCircle, Clock } from "lucide-react";
import { GeneratedWorkout } from "@/types/workout";
import { WorkoutNotes } from "./WorkoutScreen";

interface SummaryScreenProps {
  workout: GeneratedWorkout;
  notes: WorkoutNotes;
  totalTime: number;
  onSave: () => void;
  onDiscard: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const SummaryScreen = ({ 
  workout, 
  notes, 
  totalTime, 
  onSave, 
  onDiscard 
}: SummaryScreenProps) => {
  const hasAnyNotes = Object.values(notes.exerciseNotes).some(arr => arr && arr.length > 0) || 
                       Object.keys(notes.sectionNotes).length > 0;

  return (
    <div className="min-h-screen grain-overlay">
      <div className="max-w-md mx-auto px-4 py-8 pb-32">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-clear-lime/20 mb-4">
            <CheckCircle size={32} className="text-clear-lime" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground uppercase tracking-wide">
            Workout Complete
          </h1>
          <p className="text-muted-foreground mt-1">{workout.title}</p>
        </div>
        
        {/* Stats */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-clear-orange" />
            <div>
              <p className="text-sm text-muted-foreground">Total Time</p>
              <p className="font-mono text-xl text-foreground font-bold">
                {formatTime(totalTime)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Notes Summary */}
        {hasAnyNotes && (
          <div className="glass-card p-4 mb-6 space-y-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-clear-orange">
              Session Notes
            </h2>
            
            {/* Section Notes */}
            {Object.entries(notes.sectionNotes).map(([sectionId, note]) => {
              const section = workout.sections.find(s => s.id === sectionId);
              if (!note) return null;
              return (
                <div key={sectionId} className="border-b border-border/30 pb-3 last:border-0">
                  <p className="text-xs text-muted-foreground uppercase mb-1">
                    {section?.name || sectionId}
                  </p>
                  <p className="text-sm text-foreground">{note}</p>
                </div>
              );
            })}
            
            {/* Exercise Notes */}
            {Object.entries(notes.exerciseNotes).map(([exerciseId, notesList]) => {
              if (!notesList || notesList.length === 0) return null;
              // Find exercise name
              let exerciseName = exerciseId;
              for (const section of workout.sections) {
                const exercise = section.exercises.find(e => e.id === exerciseId);
                if (exercise) {
                  exerciseName = exercise.name;
                  break;
                }
              }
              return (
                <div key={exerciseId} className="border-b border-border/30 pb-3 last:border-0">
                  <p className="text-xs text-muted-foreground uppercase mb-1">
                    {exerciseName}
                  </p>
                  {notesList.map((note, idx) => (
                    <p key={idx} className="text-sm text-foreground">
                      {note.text}
                      <span className="text-muted-foreground text-xs ml-2">
                        {note.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Sections Completed */}
        <div className="glass-card p-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-clear-orange mb-3">
            Completed Sections
          </h2>
          <div className="space-y-2">
            {workout.sections.map((section) => (
              <div key={section.id} className="flex items-center gap-2 text-sm">
                <CheckCircle size={14} className="text-clear-lime" />
                <span className="text-foreground">{section.name}</span>
                <span className="text-muted-foreground">
                  ({section.exercises.length} exercises)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-4 px-4">
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={onSave}
            className="glow-button w-full h-14 font-display text-lg font-bold uppercase tracking-wider text-foreground"
          >
            Save Session
          </button>
          <button
            onClick={onDiscard}
            className="ghost-button w-full py-3 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};
