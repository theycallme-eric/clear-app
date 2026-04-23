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
    <div className={className} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--spacing-200)' }}>
      {weekDays.map((day, index) => {
        const isWorkout = day.status === "workout";
        const isRest = day.status === "rest";
        return (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-100)' }}>
            <ChamferedFrame
              cornerSize="sm"
              surfaceColor={isWorkout ? 'var(--surface-radio-selected)' : isRest ? 'var(--surface-info)' : 'transparent'}
              borderColor={isWorkout ? 'var(--border-radio-select)' : isRest ? 'var(--border-info)' : 'var(--border-radio-unselected)'}
              hasLeftBorder={true}
              style={{ aspectRatio: '1', width: '100%', maxWidth: '40px' }}
            >
              <div
                className="text-label-sm"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isWorkout ? 'var(--text-label-selected)' : isRest ? 'var(--text-info-light)' : 'var(--text-disabled)',
                }}
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
