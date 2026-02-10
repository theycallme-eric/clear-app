import { Header } from "@/components/Header";
import { CTAButton } from "@/components/CTAButton";
import { Zap, Clock, Flame, Dumbbell } from "lucide-react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import {
  WorkoutHistoryEntry,
  StreakData,
  AnchorType,
  getSuggestedAnchor,
  getSuggestedIntensity,
} from "@/types/workout";

interface HomeScreenProps {
  workoutHistory: WorkoutHistoryEntry[];
  streakData: StreakData;
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onGenerateWorkout: () => void;
  onQuickStart: (intensity: number, anchor: AnchorType) => void;
  onViewHistory: () => void;
  onViewWorkoutDetail: (workoutId: string) => void;
  onMarkRestDay: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen = ({
  workoutHistory,
  streakData,
  isLoading,
  hasError,
  onRetry,
  onGenerateWorkout,
  onQuickStart,
  onViewHistory,
  onViewWorkoutDetail,
  onMarkRestDay,
  onOpenSettings,
}: HomeScreenProps) => {
  const hasHistory = workoutHistory.length > 0;
  const suggestedIntensity = getSuggestedIntensity(workoutHistory);
  const suggestedAnchor = getSuggestedAnchor(workoutHistory);

  // Format date for display
  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) return "Today";
    if (dateOnly.getTime() === yesterdayOnly.getTime()) return "Yesterday";

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Get week days for streak view
  const getWeekDays = () => {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    return days.map((label, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const dateKey = date.toISOString().split("T")[0];
      const status = streakData.weekView[dateKey];

      return { label, status, dateKey };
    });
  };

  const weekDays = getWeekDays();

  return (
    <div className="min-h-screen grain-overlay">
      <div className="max-w-md mx-auto pb-8">
        <Header onMenuClick={onOpenSettings} />

        <div className="px-4 space-y-6">
          {/* Hero CTA - Generate Workout */}
          <button
            onClick={onGenerateWorkout}
            className="w-full glass-card p-6 text-left group hover:border-clear-orange/60 transition-all"
          >
            <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground mb-2">
              Generate Workout
            </h2>
            <p className="text-muted-foreground text-sm">
              Set intensity, anchor, and build your session
            </p>
          </button>

          {/* Quick Start */}
          <button
            onClick={() => hasHistory && onQuickStart(suggestedIntensity, suggestedAnchor)}
            className="w-full glass-card p-4 text-left group hover:border-clear-orange/60 transition-all"
            disabled={!hasHistory}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-clear-orange" />
              <span className="font-display text-lg font-semibold uppercase tracking-wider text-foreground">
                Quick Start
              </span>
            </div>
            {hasHistory ? (
              <p className="text-muted-foreground text-sm">
                Intensity: {suggestedIntensity} &bull; Anchor: {suggestedAnchor}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Start your first workout
              </p>
            )}
          </button>

          {/* Streak Tracker */}
          <div className="glass-card p-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Streak
            </h3>

            {/* Big streak number */}
            <div className="text-center mb-4">
              <span className="font-display text-5xl font-bold text-foreground">
                {streakData.currentStreak}
              </span>
              <span className="text-2xl ml-2">
                <Flame className="inline w-8 h-8 text-clear-orange" />
              </span>
              <p className="font-mono text-sm text-muted-foreground mt-1">days</p>
            </div>

            {/* Week view */}
            <div className="flex justify-between gap-1 mb-4">
              {weekDays.map((day, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 flex items-center justify-center border ${
                      day.status === "workout"
                        ? "bg-clear-lime/20 border-clear-lime text-clear-lime"
                        : day.status === "rest"
                        ? "bg-clear-purple/20 border-clear-purple text-clear-purple"
                        : "bg-transparent border-muted-foreground/30 text-muted-foreground/50"
                    }`}
                  >
                    {day.status === "workout" ? "●" : day.status === "rest" ? "◐" : "○"}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Mark Rest Day button */}
            <CTAButton
              onClick={onMarkRestDay}
              variant="secondary"
              size="sm"
              fullWidth
            >
              Mark Rest Day
            </CTAButton>
          </div>

          {/* Recent Workouts */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3 px-1">
              Recent
            </h3>

            {isLoading ? (
              <LoadingSkeleton count={3} />
            ) : hasError ? (
              <ErrorState message="Couldn't load workouts" onRetry={onRetry} />
            ) : workoutHistory.length === 0 ? (
              <EmptyState
                icon={Dumbbell}
                title="No Workouts Yet"
                description="Generate your first workout to get started"
                actionLabel="Generate"
                onAction={onGenerateWorkout}
              />
            ) : (
              <>
                <div className="space-y-2">
                  {workoutHistory.slice(0, 3).map((workout) => (
                    <button
                      key={workout.id}
                      onClick={() => onViewWorkoutDetail(workout.id)}
                      className="w-full glass-card p-4 text-left hover:border-clear-orange/60 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display text-sm font-semibold text-foreground uppercase tracking-wide">
                            {formatDate(workout.date)} &bull; {workout.anchor} &bull; Int. {workout.intensity}
                          </p>
                          <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {workout.duration} min
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={onViewHistory}
                  className="w-full mt-3 py-2 text-center text-clear-orange text-sm font-medium hover:text-clear-orange/80 transition-colors"
                >
                  View All History
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
