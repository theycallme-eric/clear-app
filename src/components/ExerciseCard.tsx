import { Exercise } from "@/types/workout";

interface ExerciseCardProps {
  exercise: Exercise;
  onEditClick?: () => void;
}

export const ExerciseCard = ({ exercise, onEditClick }: ExerciseCardProps) => {
  return (
    <div className="exercise-card space-y-3">
      <button
        onClick={onEditClick}
        className="text-left w-full"
      >
        <h4 className="exercise-card-title">
          {exercise.name}
          {exercise.equipment && (
            <span
              className="ml-2 text-label-xs font-normal uppercase tracking-wider px-1 py-0.5"
              style={{
                color: 'var(--text-paragraph)',
                backgroundColor: 'var(--color-blue-alpha-100)',
              }}
            >
              {exercise.equipment.replace(/_/g, ' ')}
            </span>
          )}
        </h4>
      </button>

      <div className="flex flex-wrap gap-2 text-paragraph-sm">
        <span style={{ color: 'var(--text-paragraph)' }}>
          {exercise.sets ? `${exercise.sets} × ` : ''}{exercise.reps}
          {exercise.effort && ` @ ${exercise.effort}`}
        </span>
        {exercise.tempo && (
          <span style={{ color: 'var(--text-paragraph)', opacity: 0.8 }}>
            Tempo: {exercise.tempo}
          </span>
        )}
        {exercise.rest && (
          <span style={{ color: 'var(--text-paragraph)', opacity: 0.8 }}>
            Rest: {exercise.rest}
          </span>
        )}
      </div>

      {exercise.lastWeight && (
        <p className="text-paragraph-sm" style={{ color: 'var(--text-timer)' }}>
          Last: {exercise.lastWeight}
        </p>
      )}

      {exercise.coachingCues && (
        <p className="text-paragraph-sm italic" style={{ color: 'var(--text-paragraph)', opacity: 0.7 }}>
          [{Array.isArray(exercise.coachingCues)
            ? exercise.coachingCues.join('. ')
            : String(exercise.coachingCues)}]
        </p>
      )}

      {/* Regression/Progression inside the card */}
      {(exercise.regression || exercise.progression) && (
        <div className="text-paragraph-sm space-y-1 pt-2" style={{ borderTop: '2px solid var(--border-spacer)' }}>
          {exercise.regression && (
            <p style={{ color: 'var(--text-paragraph)', opacity: 0.8 }}>
              <span style={{ color: 'var(--text-disabled)' }}>Regression:</span> {exercise.regression}
            </p>
          )}
          {exercise.progression && (
            <p style={{ color: 'var(--text-paragraph)', opacity: 0.8 }}>
              <span style={{ color: 'var(--text-disabled)' }}>Progression:</span> {exercise.progression}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
