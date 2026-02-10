import { useState } from "react";
import { Flame } from "lucide-react";
import { GeneratedWorkout, StreakData } from "@/types/workout";
import { WorkoutNotes } from "./WorkoutScreen";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/CTAButton";

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
  { value: 1, emoji: "😫", label: "Exhausted" },
  { value: 2, emoji: "😕", label: "Tough" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😀", label: "Great" },
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
        <h1 className="font-display text-xl font-bold text-foreground uppercase tracking-wider mb-6">
          Workout Complete
        </h1>

        {/* Celebration */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🎉</div>
          <h2 className="font-display text-3xl font-bold text-foreground uppercase tracking-wide">
            Nice Work!
          </h2>
        </div>

        {/* Workout Summary Card */}
        <div className="glass-card p-4 mb-6 text-center">
          <p className="font-display text-lg font-semibold text-foreground uppercase tracking-wide">
            {workout.anchor} &bull; Intensity {workout.intensity}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            {formatDuration(totalTime)} &bull; {workout.sections.length} sections
          </p>
        </div>

        {/* Mood Tracker */}
        <div className="mb-6">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
            How Do You Feel?
          </h3>
          <div className="flex justify-between gap-2">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={cn(
                  "flex-1 py-3 text-2xl transition-all",
                  selectedMood === mood.value
                    ? "bg-clear-orange/20 border border-clear-orange scale-110"
                    : "bg-transparent border border-transparent hover:bg-muted/20"
                )}
                aria-label={mood.label}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Session Notes */}
        <div className="mb-6">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Session Notes (Optional)
          </h3>
          <div className="glass-card p-4">
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Add any notes about this workout..."
              className="w-full h-24 bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Streak Update */}
        <div className="glass-card p-4">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Streak
          </h3>

          {/* Streak increment */}
          <div className="text-center mb-4">
            <span className="font-display text-3xl font-bold text-muted-foreground">
              {streakData.currentStreak}
            </span>
            <span className="font-display text-3xl font-bold text-clear-orange mx-2">
              →
            </span>
            <span className="font-display text-4xl font-bold text-foreground">
              {newStreak}
            </span>
            <span className="text-2xl ml-2">
              <Flame className="inline w-7 h-7 text-clear-orange" />
            </span>
            <p className="font-mono text-sm text-muted-foreground mt-1">days</p>
          </div>

          {/* Week view */}
          <div className="flex justify-between gap-1">
            {weekDays.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-9 h-9 flex items-center justify-center border transition-all",
                    day.status === "workout"
                      ? "bg-clear-lime/20 border-clear-lime text-clear-lime"
                      : day.status === "rest"
                      ? "bg-clear-purple/20 border-clear-purple text-clear-purple"
                      : "bg-transparent border-muted-foreground/30 text-muted-foreground/50",
                    day.isToday && "ring-2 ring-clear-orange ring-offset-1 ring-offset-background"
                  )}
                >
                  {day.status === "workout" ? "●" : day.status === "rest" ? "◐" : "○"}
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-4 px-4">
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
