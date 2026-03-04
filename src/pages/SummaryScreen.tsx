import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Flame, Frown, Meh, Smile, SmilePlus, ThumbsDown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { Textarea } from "@/components/ui/textarea";
import { useWorkoutFlowContext } from "@/contexts/WorkoutFlowContext";
import { useHomeDataContext } from "@/contexts/HomeDataContext";

const MOOD_OPTIONS = [
  { value: 1, icon: ThumbsDown, label: "Exhausted" },
  { value: 2, icon: Frown, label: "Tough" },
  { value: 3, icon: Meh, label: "Okay" },
  { value: 4, icon: Smile, label: "Good" },
  { value: 5, icon: SmilePlus, label: "Great" },
];

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
};

export const SummaryScreen = () => {
  const navigate = useNavigate();
  const { generatedWorkout, workoutNotes, totalTime, handleFinishSession } = useWorkoutFlowContext();
  const { streakData } = useHomeDataContext();

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");

  if (!generatedWorkout || !workoutNotes) {
    return <Navigate to="/" replace />;
  }

  const newStreak = streakData.currentStreak + 1;

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
      const todayKey = today.toISOString().split("T")[0];

      if (dateKey === todayKey) {
        return { label, status: "workout" as const, isToday: true };
      }

      const status = streakData.weekView[dateKey];
      return { label, status, isToday: false };
    });
  };

  const weekDays = getWeekDays();

  const handleFinish = () => {
    handleFinishSession(selectedMood, sessionNotes, () => navigate("/"));
  };

  const finishFooter = (
    <div
      className="fixed bottom-0 left-0 right-0 pt-8 pb-4 px-4 z-40"
      style={{ background: 'linear-gradient(to top, var(--color-neutral-900), var(--color-neutral-900) 60%, transparent)' }}
    >
      <div className="max-w-md mx-auto">
        <CTAButton onClick={handleFinish} size="lg" fullWidth>
          Finish
        </CTAButton>
      </div>
    </div>
  );

  return (
    <AppLayout header={<PageHeader />} footer={finishFooter}>
      <div className="pt-6 pb-24">
        <h1
          className="text-heading-h4 font-bold uppercase tracking-wider mb-6"
          style={{ color: 'var(--text-header)' }}
        >
          Workout Complete
        </h1>

        <div className="text-center mb-6">
          <h2
            className="text-heading-h2 font-bold uppercase tracking-wide"
            style={{ color: 'var(--text-header)' }}
          >
            Nice Work!
          </h2>
        </div>

        <Card padding="md" className="mb-6 text-center">
          <p
            className="text-heading-h5 font-medium uppercase tracking-wide"
            style={{ color: 'var(--text-header)' }}
          >
            {generatedWorkout.goal ? `${generatedWorkout.goal.replace('_', ' ')} · ` : ''}{generatedWorkout.anchor} &bull; Intensity {generatedWorkout.intensity}
          </p>
          <p className="text-paragraph-sm mt-1" style={{ color: 'var(--text-paragraph)' }}>
            {formatDuration(totalTime)} &bull; {generatedWorkout.sections.length} sections
          </p>
        </Card>

        <div className="mb-6">
          <h3
            className="text-label-xs uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-card-label)' }}
          >
            How Do You Feel?
          </h3>
          <div className="flex justify-between gap-2">
            {MOOD_OPTIONS.map((mood) => {
              const Icon = mood.icon;
              return (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={cn("flex-1 py-3 flex items-center justify-center transition-all border")}
                  style={
                    selectedMood === mood.value
                      ? { backgroundColor: 'var(--surface-radio-selected)', borderColor: 'var(--border-radio-select)', color: 'var(--text-label-selected)' }
                      : { backgroundColor: 'transparent', borderColor: 'transparent', color: 'var(--text-paragraph)' }
                  }
                  aria-label={mood.label}
                >
                  <Icon size={24} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <h3
            className="text-label-xs uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-card-label)' }}
          >
            Session Notes (Optional)
          </h3>
          <Textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Add any notes about this workout..."
            className="min-h-[96px]"
          />
        </div>

        <Card padding="md">
          <h3
            className="text-label-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-card-label)' }}
          >
            Streak
          </h3>

          <div className="text-center mb-4">
            <span className="text-heading-h2 font-bold" style={{ color: 'var(--text-disabled)' }}>
              {streakData.currentStreak}
            </span>
            <span className="text-heading-h2 font-bold mx-2" style={{ color: 'var(--icon-badge)' }}>
              &rarr;
            </span>
            <span className="text-heading-h1 font-bold" style={{ color: 'var(--text-header)' }}>
              {newStreak}
            </span>
            <span className="ml-2">
              <Flame className="inline w-7 h-7" style={{ color: 'var(--icon-badge)' }} />
            </span>
            <p className="text-label-sm mt-1" style={{ color: 'var(--text-paragraph)' }}>days</p>
          </div>

          <div className="flex justify-between gap-1">
            {weekDays.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-8 h-8 flex items-center justify-center border transition-all",
                    day.isToday && "ring-2 ring-offset-1"
                  )}
                  style={{
                    ...(day.status === "workout"
                      ? { backgroundColor: 'var(--color-green-alpha-200)', borderColor: 'var(--border-success)', color: 'var(--text-label-selected)' }
                      : day.status === "rest"
                      ? { backgroundColor: 'var(--color-blue-alpha-200)', borderColor: 'var(--border-info)', color: 'var(--icon-cta)' }
                      : { backgroundColor: 'transparent', borderColor: 'var(--color-neutral-alpha-300)', color: 'var(--text-disabled)' }),
                    ...(day.isToday ? { '--tw-ring-color': 'var(--border-card)', '--tw-ring-offset-color': 'var(--color-neutral-900)' } as React.CSSProperties : {}),
                  }}
                >
                  {day.status === "workout" ? "\u25CF" : day.status === "rest" ? "\u25D0" : "\u25CB"}
                </div>
                <span className="text-label-xs" style={{ color: 'var(--text-disabled)' }}>{day.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};
