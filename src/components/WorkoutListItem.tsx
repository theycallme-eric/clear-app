import { Card } from "./Card";
import { Clock } from "@/components/icons";
import { formatDate } from "@/lib/date-utils";
import type { WorkoutHistoryEntry } from "@/types/workout";

interface WorkoutListItemProps {
  workout: WorkoutHistoryEntry;
  onClick: () => void;
}

export function WorkoutListItem({ workout, onClick }: WorkoutListItemProps) {
  return (
    <Card onClick={onClick} padding="md">
      <p
        className="text-label-sm font-bold uppercase tracking-wide"
        style={{ color: 'var(--text-card-header)' }}
      >
        {formatDate(workout.date)}
      </p>
      <p
        className="text-paragraph-sm uppercase mt-1"
        style={{ color: 'var(--text-paragraph)' }}
      >
        {workout.anchor} {'\u2022'} Int. {workout.intensity}
        {workout.goal ? ` \u2022 ${workout.goal}` : ''}
      </p>
      <p
        className="text-paragraph-sm flex items-center gap-1 mt-1"
        style={{ color: 'var(--text-paragraph)' }}
      >
        <Clock size={12} />
        {workout.duration} min
      </p>
    </Card>
  );
}
