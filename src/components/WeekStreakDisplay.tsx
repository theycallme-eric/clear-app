import { cn } from "@/lib/utils";
import { ChamferedFrame } from "./ChamferedFrame";

interface WeekStreakDisplayProps {
  weekView: Record<string, 'workout' | 'rest' | null>;
  /** Force-mark today as a workout (e.g. on the post-workout summary screen). */
  highlightToday?: boolean;
  className?: string;
}

function getWeekDays(
  weekView: Record<string, 'workout' | 'rest' | null>,
  highlightToday: boolean,
) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const todayKey = today.toISOString().split("T")[0];

  return days.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateKey = date.toISOString().split("T")[0];

    if (highlightToday && dateKey === todayKey) {
      return { label, status: "workout" as const };
    }

    const status = weekView[dateKey];
    return { label, status };
  });
}

export function WeekStreakDisplay({
  weekView,
  highlightToday = false,
  className,
}: WeekStreakDisplayProps) {
  const weekDays = getWeekDays(weekView, highlightToday);

  return (
    <div className={cn("grid grid-cols-7 gap-2", className)}>
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
  );
}
