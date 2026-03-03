import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, Frown, Meh, Smile, SmilePlus, ThumbsDown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Card } from "@/components/Card";
import { fetchWorkoutDetail } from "@/lib/home-data";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/components/ui/sonner";
import { LucideIcon } from "lucide-react";

const MOOD_ICONS: Record<number, LucideIcon> = {
  1: ThumbsDown,
  2: Frown,
  3: Meh,
  4: Smile,
  5: SmilePlus,
};

export const SessionDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: workout, isLoading, isError } = useQuery({
    queryKey: queryKeys.workoutDetail(id!),
    queryFn: () => fetchWorkoutDetail(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (isError || (workout === null && !isLoading)) {
      toast.error("Couldn't load workout details");
      navigate("/history", { replace: true });
    }
  }, [isError, workout, isLoading, navigate]);

  const formatDateTitle = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();
  };

  const formatReps = (reps: number | string): string => {
    if (typeof reps === 'number') return String(reps);
    return reps;
  };

  return (
    <AppLayout header={<PageHeader left="back" onBack={() => navigate("/history")} center="Session" right="menu" onMenu={() => navigate("/settings")} />}>
      <div>
        {isLoading || !workout ? (
          <LoadingSkeleton count={4} />
        ) : (
          <>
            <h1
              className="text-heading-h4 font-bold tracking-wider mb-2"
              style={{ color: 'var(--text-header)' }}
            >
              {formatDateTitle(workout.date)}
            </h1>

            <div className="mb-6">
              <p
                className="text-heading-h5 font-medium uppercase tracking-wide"
                style={{ color: 'var(--text-header)' }}
              >
                {workout.anchor} &bull; Intensity {workout.intensity}
              </p>
              <p className="text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
                {workout.duration} min {workout.goal && `\u2022 ${workout.goal}`}
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
                              {exercise.sets} \u00D7 {formatReps(exercise.reps)}
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
    </AppLayout>
  );
};
