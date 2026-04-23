import { GeneratedWorkout } from "@/types/workout";
import { Clock, Gauge, Target, Crosshair } from "lucide-react";
import { Card } from "./Card";

interface WorkoutOverviewProps {
  workout: GeneratedWorkout;
}

const formatGoalLabel = (goal: string): string => {
  return goal.replace('_', ' ');
};

export const WorkoutOverview = ({ workout }: WorkoutOverviewProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-400)' }}>
      {/* Title */}
      <h2
        className="text-heading-h2"
        style={{ color: "var(--text-header)", fontWeight: 'bold' }}
      >
        {workout.title}
      </h2>

      {/* Description */}
      <p className="text-paragraph-md" style={{ color: "var(--text-paragraph)" }}>
        {workout.description}
      </p>

      {/* Metadata Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-300)' }}>
        {workout.goal && (
          <Card cornerSize="sm" padding="sm" showLeftColumn={false} style={{ width: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)' }}>
              <Crosshair size={16} style={{ color: "var(--icon-badge)" }} />
              <span className="text-label-sm" style={{ color: "var(--text-header)", textTransform: 'uppercase' }}>{formatGoalLabel(workout.goal)}</span>
            </div>
          </Card>
        )}

        <Card cornerSize="sm" padding="sm" showLeftColumn={false} style={{ width: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)' }}>
            <Clock size={16} style={{ color: "var(--icon-badge)" }} />
            <span className="text-label-sm" style={{ color: "var(--text-header)" }}>{workout.duration}</span>
          </div>
        </Card>

        <Card cornerSize="sm" padding="sm" showLeftColumn={false} style={{ width: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)' }}>
            <Gauge size={16} style={{ color: "var(--icon-badge)" }} />
            <span className="text-label-sm" style={{ color: "var(--text-header)" }}>{workout.intensity}</span>
          </div>
        </Card>

        <Card cornerSize="sm" padding="sm" showLeftColumn={false} style={{ width: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)' }}>
            <Target size={16} style={{ color: "var(--icon-badge)" }} />
            <span className="text-label-sm" style={{ color: "var(--text-header)", textTransform: 'uppercase' }}>{workout.anchor}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
