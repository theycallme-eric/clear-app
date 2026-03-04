import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import { MoodIcon, MoodValue } from "@/components/MoodIcon";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { ChamferedFrame } from "@/components/ChamferedFrame";
import { Textarea } from "@/components/ui/textarea";
import { useWorkoutFlowContext } from "@/contexts/WorkoutFlowContext";
import { useHomeDataContext } from "@/contexts/HomeDataContext";

const MOOD_OPTIONS: { value: MoodValue; label: string }[] = [
  { value: 1, label: "Exhausted" },
  { value: 2, label: "Tough" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Great" },
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

  const handleFinish = async () => {
    await handleFinishSession(selectedMood, sessionNotes, () => navigate("/"));
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
    <AppLayout header={<PageHeader center="Workout Complete" />} footer={finishFooter}>
      <div className="pt-6 pb-24 stagger-reveal">
        <div className="text-center mb-6">
          <h2
            className="text-heading-h2 font-bold uppercase tracking-wide glow-emissive"
            style={{ color: 'var(--text-header)' }}
          >
            Nice Work!
          </h2>
        </div>

        <Card padding="md" className="mb-6 text-center">
          <p
            className="text-heading-h5 font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-header)' }}
          >
            {generatedWorkout.goal ? `${generatedWorkout.goal.replace('_', ' ')} · ` : ''}{generatedWorkout.anchor} &bull; Intensity {generatedWorkout.intensity}
          </p>
          <p className="text-paragraph-sm mt-1" style={{ color: 'var(--text-paragraph)' }}>
            {formatDuration(totalTime)} &bull; {generatedWorkout.sections.length} sections
          </p>
        </Card>

        <Card padding="md" className="mb-6">
          <h3
            className="text-label-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-card-label)' }}
          >
            How Do You Feel?
          </h3>
          <div className="flex justify-between gap-2">
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selectedMood === mood.value;
              return (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className="flex-1 py-3 flex flex-col items-center justify-center gap-2 transition-all"
                  style={{ color: isSelected ? 'var(--text-label-selected)' : 'var(--text-paragraph)', opacity: isSelected ? 1 : 0.5 }}
                  aria-label={mood.label}
                >
                  <MoodIcon mood={mood.value} size={32} selected={isSelected} />
                  <span className="text-label-xs">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card padding="md" className="mb-6">
          <h3
            className="text-label-xs uppercase tracking-widest mb-4"
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
        </Card>

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
            <span className="text-heading-h1 font-bold glow-emissive" style={{ color: 'var(--text-header)' }}>
              {newStreak}
            </span>
            <span className="ml-2">
              <Flame className="inline w-7 h-7" style={{ color: 'var(--icon-badge)' }} />
            </span>
            <p className="text-label-sm mt-1" style={{ color: 'var(--text-paragraph)' }}>days</p>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const isWorkout = day.status === "workout";
              const isRest = day.status === "rest";
              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <ChamferedFrame
                    cornerSize="sm"
                    surfaceColor={isWorkout ? 'var(--surface-radio-selected)' : isRest ? 'var(--surface-info)' : 'transparent'}
                    borderColor={isWorkout ? 'var(--border-radio-select)' : isRest ? 'var(--border-info)' : 'var(--border-radio-unselected)'}
                    hasLeftBorder={true}
                    className="aspect-square w-full max-w-10"
                  >
                    <div
                      className="w-full h-full flex items-center justify-center text-label-sm"
                      style={{ color: isWorkout ? 'var(--text-label-selected)' : isRest ? 'var(--color-purple-500)' : 'var(--text-disabled)' }}
                    >
                      {isWorkout ? "\u25CF" : isRest ? "\u25D0" : "\u25CB"}
                    </div>
                  </ChamferedFrame>
                  <span className="text-label-xs" style={{ color: 'var(--text-disabled)' }}>{day.label}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};
