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
            <span className="ml-2 text-xs font-normal text-muted-foreground uppercase tracking-wider bg-secondary/10 px-1.5 py-0.5 rounded">
              {exercise.equipment.replace(/_/g, ' ')}
            </span>
          )}
        </h4>
      </button>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="text-foreground">
          {exercise.sets ? `${exercise.sets} × ` : ''}{exercise.reps}
          {exercise.effort && ` @ ${exercise.effort}`}
        </span>
        {exercise.tempo && (
          <span className="text-foreground/80">
            Tempo: {exercise.tempo}
          </span>
        )}
        {exercise.rest && (
          <span className="text-foreground/80">
            Rest: {exercise.rest}
          </span>
        )}
      </div>

      {exercise.lastWeight && (
        <p className="text-sm text-clear-orange">
          Last: {exercise.lastWeight}
        </p>
      )}

      {exercise.coachingCues && (
        <p className="text-sm italic text-foreground/70">
          [{Array.isArray(exercise.coachingCues)
            ? exercise.coachingCues.join('. ')
            : String(exercise.coachingCues)}]
        </p>
      )}

      {/* Regression/Progression inside the card */}
      {(exercise.regression || exercise.progression) && (
        <div className="text-sm space-y-1 pt-2 border-t border-clear-orange/30">
          {exercise.regression && (
            <p className="text-foreground/80">
              <span className="text-muted-foreground">Regression:</span> {exercise.regression}
            </p>
          )}
          {exercise.progression && (
            <p className="text-foreground/80">
              <span className="text-muted-foreground">Progression:</span> {exercise.progression}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
