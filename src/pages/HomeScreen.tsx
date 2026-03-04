import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { Zap, Clock, Flame, Dumbbell } from "lucide-react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { AbandonmentModal } from "@/components/AbandonmentModal";
import { useHomeDataContext } from "@/contexts/HomeDataContext";
import { useWorkoutFlowContext } from "@/contexts/WorkoutFlowContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { toast } from "@/components/ui/sonner";
import { getSuggestedAnchor, getSuggestedIntensity } from "@/types/workout";

export const HomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {
    workoutHistory,
    streakData,
    isLoading,
    hasError,
    loadHomeData,
    incompleteSession,
    clearIncompleteSession,
  } = useHomeDataContext();
  const workoutFlow = useWorkoutFlowContext();

  const hasHistory = workoutHistory.length > 0;
  const suggestedIntensity = getSuggestedIntensity(workoutHistory);
  const suggestedAnchor = getSuggestedAnchor(workoutHistory);

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

  const handleMarkRestDay = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          date: today,
          is_rest_day: true,
          counts_for_streak: true,
          anchor: 'full_body',
          intensity: 0,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info("Already logged today");
        } else {
          logger.data.error('Error marking rest day', { error: error.message });
          toast.error("Failed to mark rest day");
        }
        return;
      }

      toast.success("Rest day marked!", { description: "Your streak is preserved." });
      await loadHomeData();
    } catch (err) {
      logger.data.error('Error marking rest day', { error: err instanceof Error ? err.message : String(err) });
      toast.error("Something went wrong");
    }
  };

  const handleAbandonIncomplete = async () => {
    if (!incompleteSession) return;
    await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', incompleteSession.id);
    clearIncompleteSession();
  };

  const handleResumeIncomplete = async () => {
    if (!incompleteSession) return;
    const success = await workoutFlow.handleResumeIncomplete(incompleteSession.id);
    if (success) {
      clearIncompleteSession();
      navigate("/review");
    } else {
      toast.info("Couldn't load workout details. Starting fresh.");
      handleAbandonIncomplete();
    }
  };

  const weekDays = getWeekDays();

  return (
    <AppLayout header={<PageHeader right="menu" onMenu={() => navigate("/settings")} />}>
      <div className="pt-6 space-y-6 stagger-reveal">
        <Card
          onClick={() => navigate("/generate")}
          padding="lg"
          borderColor="var(--border-cta-primary)"
          accentColor="var(--surface-cta-accent)"
          surfaceColor="var(--surface-cta-primary)"
        >
          <h2
            className="text-heading-h2 font-bold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-on-cta)' }}
          >
            Generate Workout
          </h2>
          <p className="text-paragraph-sm" style={{ color: 'var(--text-on-cta)' }}>
            Set intensity, anchor, and build your session
          </p>
        </Card>

        <Card
          onClick={hasHistory ? () => workoutFlow.handleQuickStart(suggestedIntensity, suggestedAnchor, () => navigate("/review")) : undefined}
          padding="md"
          className={!hasHistory ? "opacity-50 cursor-not-allowed" : ""}
          borderColor="var(--border-cta-primary)"
          accentColor="var(--surface-cta-accent)"
          surfaceColor="var(--surface-cta-primary)"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5" style={{ color: 'var(--icon-on-cta)' }} />
            <span
              className="text-heading-h5 font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-on-cta)' }}
            >
              Quick Start
            </span>
          </div>
          {hasHistory ? (
            <p className="text-paragraph-sm" style={{ color: 'var(--text-on-cta)' }}>
              Intensity: {suggestedIntensity} &bull; Anchor: {suggestedAnchor}
            </p>
          ) : (
            <p className="text-paragraph-sm" style={{ color: 'var(--text-on-cta)' }}>
              Start your first workout
            </p>
          )}
        </Card>

        <Card padding="md">
          <h3
            className="text-label-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-card-label)' }}
          >
            Streak
          </h3>

          <div className="text-center mb-4">
            <span className="text-heading-h1 font-bold glow-emissive" style={{ color: 'var(--text-header)' }}>
              {streakData.currentStreak}
            </span>
            <span className="ml-2">
              <Flame className="inline w-8 h-8" style={{ color: 'var(--icon-badge)' }} />
            </span>
            <p className="text-label-sm mt-1" style={{ color: 'var(--text-paragraph)' }}>days</p>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div
                  className="aspect-square w-full max-w-10 flex items-center justify-center border transition-all"
                  style={
                    day.status === "workout"
                      ? { backgroundColor: 'var(--surface-radio-selected)', borderColor: 'var(--border-radio-select)', color: 'var(--text-label-selected)' }
                      : day.status === "rest"
                      ? { backgroundColor: 'var(--surface-radio-unselect)', borderColor: 'var(--border-radio-unselected)', color: 'var(--icon-cta)' }
                      : { backgroundColor: 'transparent', borderColor: 'transparent', color: 'var(--text-disabled)' }
                  }
                >
                  {day.status === "workout" ? "\u25CF" : day.status === "rest" ? "\u25D0" : "\u25CB"}
                </div>
                <span className="text-label-xs" style={{ color: 'var(--text-disabled)' }}>{day.label}</span>
              </div>
            ))}
          </div>

          <CTAButton onClick={handleMarkRestDay} variant="secondary" size="sm" fullWidth>
            Mark Rest Day
          </CTAButton>
        </Card>

        {isLoading ? (
          <div>
            <h3
              className="text-label-xs uppercase tracking-widest mb-3 px-1"
              style={{ color: 'var(--text-card-label)' }}
            >
              Recent
            </h3>
            <LoadingSkeleton count={3} />
          </div>
        ) : hasError ? (
          <div>
            <h3
              className="text-label-xs uppercase tracking-widest mb-3 px-1"
              style={{ color: 'var(--text-card-label)' }}
            >
              Recent
            </h3>
            <ErrorState message="Couldn't load workouts" onRetry={loadHomeData} />
          </div>
        ) : workoutHistory.length === 0 ? (
          <Card padding="md">
            <h3
              className="text-label-xs uppercase tracking-widest mb-4"
              style={{ color: 'var(--text-card-label)' }}
            >
              Recent
            </h3>
            <div className="text-center">
              <Dumbbell className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--text-disabled)' }} />
              <p
                className="text-heading-h5 font-medium uppercase tracking-wide mb-1"
                style={{ color: 'var(--text-header)' }}
              >
                No Workouts Yet
              </p>
              <p className="text-paragraph-sm mb-4" style={{ color: 'var(--text-paragraph)' }}>
                Generate your first workout to get started
              </p>
              <CTAButton onClick={() => navigate("/generate")} variant="secondary" size="sm" fullWidth>
                Generate
              </CTAButton>
            </div>
          </Card>
        ) : (
          <div>
            <h3
              className="text-label-xs uppercase tracking-widest mb-3 px-1"
              style={{ color: 'var(--text-card-label)' }}
            >
              Recent
            </h3>
            <div className="space-y-2">
              {workoutHistory.slice(0, 3).map((workout) => (
                <Card key={workout.id} onClick={() => navigate(`/history/${workout.id}`)} padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-label-sm uppercase tracking-wide"
                        style={{ color: 'var(--text-header)' }}
                      >
                        {formatDate(workout.date)} &bull; {workout.goal ? `${workout.goal} · ` : ''}{workout.anchor} &bull; Int. {workout.intensity}
                      </p>
                      <p
                        className="text-paragraph-sm flex items-center gap-1 mt-1"
                        style={{ color: 'var(--text-paragraph)' }}
                      >
                        <Clock className="w-3 h-3" />
                        {workout.duration} min
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <button
              onClick={() => navigate("/history")}
              className="w-full mt-3 py-2 text-center text-paragraph-sm font-medium transition-colors"
              style={{ color: 'var(--text-cta)' }}
            >
              View All History
            </button>
          </div>
        )}
      </div>

      {incompleteSession && (
        <AbandonmentModal
          workoutDate={incompleteSession.date}
          onResume={handleResumeIncomplete}
          onAbandon={handleAbandonIncomplete}
        />
      )}
    </AppLayout>
  );
};
