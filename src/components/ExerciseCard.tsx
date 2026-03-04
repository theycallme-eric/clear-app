import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Exercise } from "@/types/workout";

interface ExerciseCardProps {
  exercise: Exercise;
  defaultExpanded?: boolean;
}

/** Check if a rest value is meaningful (non-zero, non-empty) */
const hasRest = (rest?: string): boolean => {
  if (!rest) return false;
  const cleaned = rest.toLowerCase().replace(/\s/g, '');
  return cleaned !== '0s' && cleaned !== '0' && cleaned !== '';
};

export const ExerciseCard = ({ exercise, defaultExpanded = false }: ExerciseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div>
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-3 text-left py-2 px-4"
      >
        <div className="flex-1 min-w-0 space-y-1">
          <h4
            className="text-heading-h6 font-bold leading-tight uppercase"
            style={{ color: 'var(--text-card-header)' }}
          >
            {exercise.name}
          </h4>
          <div
            className="text-paragraph-sm flex flex-wrap gap-x-3 gap-y-1"
            style={{ color: 'var(--text-paragraph)' }}
          >
            <span>
              {exercise.sets ? `${exercise.sets}×` : ''}{exercise.reps}
              {exercise.effort && ` @ ${exercise.effort}`}
            </span>
            {exercise.equipment && (
              <>
                <span>&bull;</span>
                <span>{exercise.equipment.replace(/_/g, ' ')}</span>
              </>
            )}
          </div>
        </div>
        <span className="p-1 shrink-0" style={{ color: 'var(--icon-cta)' }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 space-y-3 pb-2">
          {/* Tempo & Rest */}
          {(exercise.tempo || hasRest(exercise.rest)) && (
            <div
              className="text-paragraph-sm flex flex-wrap gap-x-3 gap-y-1"
              style={{ color: 'var(--text-paragraph)' }}
            >
              {exercise.tempo && <span>Tempo: {exercise.tempo}</span>}
              {hasRest(exercise.rest) && <span>Rest: {exercise.rest}</span>}
            </div>
          )}

          {/* Coaching Cues */}
          {exercise.coachingCues && (
            <p
              className="text-paragraph-sm italic"
              style={{ color: 'var(--text-paragraph)' }}
            >
              {Array.isArray(exercise.coachingCues)
                ? exercise.coachingCues.join('. ')
                : String(exercise.coachingCues)}
            </p>
          )}

          {/* Last Weight */}
          {exercise.lastWeight && (
            <p className="text-paragraph-sm" style={{ color: 'var(--text-timer)' }}>
              Last: {exercise.lastWeight}
            </p>
          )}

          {/* Regression / Progression */}
          {(exercise.regression || exercise.progression) && (
            <div
              className="text-paragraph-sm space-y-1 pt-2"
              style={{ color: 'var(--text-paragraph)' }}
            >
              {exercise.regression && (
                <p><span style={{ color: 'var(--text-disabled)' }}>Easier:</span> {exercise.regression}</p>
              )}
              {exercise.progression && (
                <p><span style={{ color: 'var(--text-disabled)' }}>Harder:</span> {exercise.progression}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
