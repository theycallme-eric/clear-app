import { useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { WorkoutSection } from "@/types/workout";
import { ExerciseCard } from "./ExerciseCard";

interface WorkoutSectionCardProps {
  section: WorkoutSection;
  onRandomize?: () => void;
}

export const WorkoutSectionCard = ({ section, onRandomize }: WorkoutSectionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="text-cta-sm font-bold text-clear-orange">
          {section.name}
        </span>
        {isExpanded ? (
          <ChevronUp size={20} className="text-foreground/60" />
        ) : (
          <ChevronDown size={20} className="text-foreground/60" />
        )}
      </button>

      {/* Collapsed preview - show all exercises */}
      {!isExpanded && section.exercises.length > 0 && (
        <div className="px-4 pb-4 space-y-3">
          {section.exercises.map((exercise) => (
            <div key={exercise.id} className="exercise-card">
              <p className="exercise-card-title">
                {exercise.name}
                {exercise.equipment && (
                  <span className="ml-2 text-label-xs font-normal text-muted-foreground uppercase tracking-wider">
                    {exercise.equipment.replace(/_/g, ' ')}
                  </span>
                )}
              </p>
              <p className="text-paragraph-sm text-foreground">
                ({exercise.sets ? `${exercise.sets}×` : ''}{exercise.reps})
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Expanded view */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {section.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
            />
          ))}

          {/* Randomize button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRandomize?.();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 border border-clear-orange/30 text-clear-orange hover:bg-clear-orange/10 transition-colors"
          >
            <RefreshCw size={16} />
            <span className="text-paragraph-sm font-medium">Randomize Section</span>
          </button>
        </div>
      )}
    </div>
  );
};
