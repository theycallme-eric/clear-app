import { ArrowLeft, Menu, FileText, Frown, Meh, Smile, SmilePlus, ThumbsDown } from "lucide-react";
import { WorkoutHistoryEntry } from "@/types/workout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Card } from "@/components/Card";
import { LucideIcon } from "lucide-react";

interface SessionDetailScreenProps {
  workout: WorkoutHistoryEntry | null;
  isLoading?: boolean;
  onBack: () => void;
  onOpenSettings: () => void;
}

const MOOD_ICONS: Record<number, LucideIcon> = {
  1: ThumbsDown,
  2: Frown,
  3: Meh,
  4: Smile,
  5: SmilePlus,
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
            className="p-2 transition-colors"
            style={{ color: 'var(--icon-cta)' }}
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>
          <span
            className="text-cta-sm font-bold tracking-wider uppercase"
            style={{ color: 'var(--text-header)' }}
          >
            Back
          </span>
          <button
            onClick={onOpenSettings}
            className="p-2 transition-colors"
            style={{ color: 'var(--icon-cta)' }}
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
          <h1
            className="text-heading-h4 font-bold tracking-wider mb-2"
            style={{ color: 'var(--text-header)' }}
          >
            {formatDateTitle(workout.date)}
          </h1>

          {/* Summary */}
          <div className="mb-6">
            <p
              className="text-heading-h5 font-medium uppercase tracking-wide"
              style={{ color: 'var(--text-header)' }}
            >
              {workout.anchor} &bull; Intensity {workout.intensity}
            </p>
            <p className="text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
              {workout.duration} min {workout.goal && `• ${workout.goal}`}
            </p>
            {workout.mood && (() => {
              const MoodIcon = MOOD_ICONS[workout.mood];
              return MoodIcon ? (
                <div className="mt-2" style={{ color: 'var(--text-paragraph)' }}>
                  <MoodIcon size={24} />
                </div>
              ) : null;
            })()}
          </div>

          {/* Sections */}
          {workout.sections && workout.sections.length > 0 ? (
            <div className="space-y-4">
              {workout.sections.map((section) => (
                <Card key={section.id} padding="md">
                  <h2
                    className="text-label-xs uppercase tracking-widest mb-3"
                    style={{ color: 'var(--text-card-label)' }}
                  >
                    {section.name}
                  </h2>
                  <div className="space-y-3">
                    {section.exercises.map((exercise) => (
                      <div key={exercise.id}>
                        <div className="flex items-start justify-between">
                          <p className="text-label-sm" style={{ color: 'var(--text-header)' }}>
                            {exercise.name}
                          </p>
                          <p className="text-label-xs" style={{ color: 'var(--text-paragraph)' }}>
                            {exercise.sets} × {formatReps(exercise.reps)}
                            {exercise.weight && ` @ ${exercise.weight}`}
                          </p>
                        </div>
                        {exercise.note && (
                          <p
                            className="text-paragraph-sm mt-1 flex items-start gap-1"
                            style={{ color: 'var(--text-timer)' }}
                          >
                            <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            "{exercise.note}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card padding="md" className="text-center">
              <p className="text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
                No detailed workout data available
              </p>
            </Card>
          )}

          {/* Session Notes */}
          {workout.sessionNotes && (
            <Card padding="md" className="mt-4">
              <h2
                className="text-label-xs uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-card-label)' }}
              >
                Session Notes
              </h2>
              <p className="text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
                "{workout.sessionNotes}"
              </p>
            </Card>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
};
