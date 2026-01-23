import { ArrowLeft, Menu, FileText } from "lucide-react";
import { WorkoutHistoryEntry } from "@/types/workout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

interface SessionDetailScreenProps {
  workout: WorkoutHistoryEntry | null;
  isLoading?: boolean;
  onBack: () => void;
  onOpenSettings: () => void;
}

const MOOD_EMOJIS: Record<number, string> = {
  1: "😫",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😀",
};

export const SessionDetailScreen = ({
  workout,
  isLoading,
  onBack,
  onOpenSettings,
}: SessionDetailScreenProps) => {
  // Format date for title
  const formatDateTitle = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();
  };

  // Format reps for display
  const formatReps = (reps: number | string): string => {
    if (typeof reps === 'number') return String(reps);
    return reps;
  };

  return (
    <div className="min-h-screen grain-overlay">
      <div className="max-w-md mx-auto pb-8">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4">
          <button
            onClick={onBack}
            className="p-2 text-foreground/80 hover:text-foreground transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="font-display text-sm font-bold tracking-wider text-foreground uppercase">
            Back
          </span>
          <button
            onClick={onOpenSettings}
            className="p-2 text-foreground/80 hover:text-foreground transition-colors"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="px-4">
          {isLoading || !workout ? (
            <LoadingSkeleton count={4} />
          ) : (
          <>
          {/* Date Title */}
          <h1 className="font-display text-xl font-bold tracking-wider text-foreground mb-2">
            {formatDateTitle(workout.date)}
          </h1>

          {/* Summary */}
          <div className="mb-6">
            <p className="font-display text-lg font-semibold text-foreground uppercase tracking-wide">
              {workout.anchor} &bull; Intensity {workout.intensity}
            </p>
            <p className="text-muted-foreground text-sm">
              {workout.duration} min {workout.goal && `• ${workout.goal}`}
            </p>
            {workout.mood && (
              <p className="text-2xl mt-2">{MOOD_EMOJIS[workout.mood]}</p>
            )}
          </div>

          {/* Sections */}
          {workout.sections && workout.sections.length > 0 ? (
            <div className="space-y-4">
              {workout.sections.map((section) => (
                <div key={section.id} className="glass-card p-4">
                  <h2 className="font-mono text-xs uppercase tracking-widest text-clear-orange mb-3">
                    {section.name}
                  </h2>
                  <div className="space-y-3">
                    {section.exercises.map((exercise) => (
                      <div key={exercise.id}>
                        <div className="flex items-start justify-between">
                          <p className="font-display text-sm font-semibold text-foreground">
                            {exercise.name}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {exercise.sets} × {formatReps(exercise.reps)}
                            {exercise.weight && ` @ ${exercise.weight}`}
                          </p>
                        </div>
                        {exercise.note && (
                          <p className="text-sm text-clear-lime mt-1 flex items-start gap-1">
                            <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            "{exercise.note}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-4 text-center">
              <p className="text-muted-foreground text-sm">
                No detailed workout data available
              </p>
            </div>
          )}

          {/* Session Notes */}
          {workout.sessionNotes && (
            <div className="glass-card p-4 mt-4">
              <h2 className="font-mono text-xs uppercase tracking-widest text-clear-orange mb-3">
                Session Notes
              </h2>
              <p className="text-foreground text-sm">
                "{workout.sessionNotes}"
              </p>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
};
