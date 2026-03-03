import { useState } from "react";
import { Flame, Frown, Meh, Smile, SmilePlus, ThumbsDown } from "lucide-react";
import { GeneratedWorkout, StreakData } from "@/types/workout";
import { WorkoutNotes } from "./WorkoutScreen";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { Textarea } from "@/components/ui/textarea";

interface SummaryScreenProps {
  workout: GeneratedWorkout;
  notes: WorkoutNotes;
  totalTime: number;
  streakData: StreakData;
  onFinish: (mood: number | null, sessionNotes: string) => void;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
};

const MOOD_OPTIONS = [
  { value: 1, icon: ThumbsDown, label: "Exhausted" },
  { value: 2, icon: Frown, label: "Tough" },
  { value: 3, icon: Meh, label: "Okay" },
  { value: 4, icon: Smile, label: "Good" },
  { value: 5, icon: SmilePlus, label: "Great" },
];

export const SummaryScreen = ({
  workout,
  notes,
  totalTime,
  streakData,
  onFinish,
}: SummaryScreenProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");

  // Calculate new streak (current + 1 for completing today's workout)
  const newStreak = streakData.currentStreak + 1;

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
      const todayKey = today.toISOString().split("T")[0];

      // Today gets marked as workout (just completed)
      if (dateKey === todayKey) {
        return { label, status: "workout" as const, isToday: true };
      }

      const status = streakData.weekView[dateKey];
      return { label, status, isToday: false };
    });
  };

  const weekDays = getWeekDays();

  const handleFinish = () => {
    onFinish(selectedMood, sessionNotes);
  };

  return (
    <div className="min-h-screen grain-overlay">
      <div className="max-w-md mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <h1
          className="text-heading-h4 font-bold uppercase tracking-wider mb-6"
          style={{ color: 'var(--text-header)' }}
        >
          Workout Complete
        </h1>

        {/* Celebration */}
        <div className="text-center mb-6">
          <h2
            className="text-heading-h2 font-bold uppercase tracking-wide"
            style={{ color: 'var(--text-header)' }}
          >
            Nice Work!
          </h2>
        </div>

        {/* Workout Summary Card */}
        <Card padding="md" className="mb-6 text-center">
          <p
            className="text-heading-h5 font-medium uppercase tracking-wide"
            style={{ color: 'var(--text-header)' }}
          >
            {workout.goal ? `${workout.goal.replace('_', ' ')} · ` : ''}{workout.anchor} &bull; Intensity {workout.intensity}
          </p>
          <p className="text-paragraph-sm mt-1" style={{ color: 'var(--text-paragraph)' }}>
            {formatDuration(totalTime)} &bull; {workout.sections.length} sections
          </p>
        </Card>

        {/* Mood Tracker */}
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
                  className={cn(
                    "flex-1 py-3 flex items-center justify-center transition-all border",
                  )}
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

        {/* Session Notes */}
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

        {/* Streak Update */}
        <Card padding="md">
          <h3
            className="text-label-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-card-label)' }}
          >
            Streak
          </h3>

          {/* Streak increment */}
          <div className="text-center mb-4">
            <span
              className="text-heading-h2 font-bold"
              style={{ color: 'var(--text-disabled)' }}
            >
              {streakData.currentStreak}
            </span>
            <span
              className="text-heading-h2 font-bold mx-2"
              style={{ color: 'var(--icon-badge)' }}
            >
              &rarr;
            </span>
            <span
              className="text-heading-h1 font-bold"
              style={{ color: 'var(--text-header)' }}
            >
              {newStreak}
            </span>
            <span className="ml-2">
              <Flame className="inline w-7 h-7" style={{ color: 'var(--icon-badge)' }} />
            </span>
            <p
              className="text-label-sm mt-1"
              style={{ color: 'var(--text-paragraph)' }}
            >
              days
            </p>
          </div>

          {/* Week view */}
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
                  {day.status === "workout" ? "●" : day.status === "rest" ? "◐" : "○"}
                </div>
                <span
                  className="text-label-xs"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fixed Bottom Action */}
      <div
        className="fixed bottom-0 left-0 right-0 pt-8 pb-4 px-4"
        style={{ background: 'linear-gradient(to top, var(--color-neutral-900), var(--color-neutral-900) 60%, transparent)' }}
      >
        <div className="max-w-md mx-auto">
          <CTAButton
            onClick={handleFinish}
            size="lg"
            fullWidth
          >
            Finish
          </CTAButton>
        </div>
      </div>
    </div>
  );
};
