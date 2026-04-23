import { Card } from "./Card";
import { Clock } from "@/components/icons";
import { formatDate } from "@/lib/date-utils";
import type { WorkoutHistoryEntry } from "@/types/workout";

interface WorkoutListItemProps {
  workout: WorkoutHistoryEntry;
  onClick: () => void;
  showLeftColumn?: boolean;
}

export function WorkoutListItem({ workout, onClick, showLeftColumn }: WorkoutListItemProps) {
  return (
    <Card onClick={onClick} padding="md" showLeftColumn={showLeftColumn}>
      <p
        className="text-label-sm"
        style={{ color: 'var(--text-card-header)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        {formatDate(workout.date)}
      </p>
      <p
        className="text-paragraph-sm"
        style={{ color: 'var(--text-paragraph)', textTransform: 'uppercase', marginTop: 'var(--spacing-100)' }}
      >
        {workout.anchor} {'\u2022'} Int. {workout.intensity}
        {workout.goal ? ` \u2022 ${workout.goal}` : ''}
      </p>
      <p
        className="text-paragraph-sm"
        style={{ color: 'var(--text-paragraph)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', marginTop: 'var(--spacing-100)' }}
      >
        <Clock size={12} />
        {workout.duration} min
      </p>
    </Card>
  );
}
