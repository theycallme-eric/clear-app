import { useState } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Exercise } from "@/types/workout";

export interface ExerciseNote {
  text: string;
  timestamp: Date;
}

interface WorkoutExerciseItemProps {
  exercise: Exercise;
  notes?: ExerciseNote[];
  onAddNote: (note: string) => void;
}

export const WorkoutExerciseItem = ({ 
  exercise, 
  notes = [], 
  onAddNote 
}: WorkoutExerciseItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote("");
      setIsAddingNote(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="exercise-card">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start justify-between text-left cursor-pointer"
      >
        <div className="flex-1">
          <h3 className="exercise-card-title">
            {exercise.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {exercise.sets} × {exercise.reps}
            {exercise.effort && ` @ ${exercise.effort}`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp size={18} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={18} className="text-muted-foreground" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-clear-orange/30 space-y-2">
          {exercise.tempo && (
            <p className="text-sm text-foreground/80">
              <span className="text-muted-foreground">Tempo:</span> {exercise.tempo}
            </p>
          )}
          {exercise.rest && (
            <p className="text-sm text-foreground/80">
              <span className="text-muted-foreground">Rest:</span> {exercise.rest}
            </p>
          )}
          {exercise.coachingCues && (
            <p className="text-sm italic text-foreground/70">
              {exercise.coachingCues}
            </p>
          )}
          
          {/* Regression & Progression */}
          {(exercise.regression || exercise.progression) && (
            <div className="pt-3 border-t border-clear-orange/30 space-y-1">
              {exercise.regression && (
                <p className="text-sm text-foreground/80">
                  <span className="text-muted-foreground">Regression:</span> {exercise.regression}
                </p>
              )}
              {exercise.progression && (
                <p className="text-sm text-foreground/80">
                  <span className="text-muted-foreground">Progression:</span> {exercise.progression}
                </p>
              )}
            </div>
          )}
          
          {/* Notes Section */}
          <div className="pt-3 border-t border-clear-orange/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground lowercase">{exercise.name}.</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingNote(true);
                }}
                className="p-1 text-clear-orange hover:bg-clear-orange/10 transition-colors"
                aria-label="Add note"
              >
                <Plus size={18} />
              </button>
            </div>
            
            {/* Note Input */}
            {isAddingNote && (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddNote();
                    if (e.key === 'Escape') {
                      setIsAddingNote(false);
                      setNewNote("");
                    }
                  }}
                  placeholder="Add a note..."
                  className="w-full bg-background/50 border border-clear-orange/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-clear-orange"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddNote();
                    }}
                    className="text-xs text-clear-orange hover:text-clear-orange/80"
                  >
                    Save
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingNote(false);
                      setNewNote("");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Notes List */}
            {notes.length > 0 && (
              <div className="mt-2 space-y-1">
                {notes.map((note, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-clear-lime">{note.text}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      {formatTimestamp(note.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
