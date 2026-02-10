import { GeneratedWorkout } from "@/types/workout";
import { Clock, Gauge, Target } from "lucide-react";
import { Card } from "./Card";

interface WorkoutOverviewProps {
  workout: GeneratedWorkout;
}

export const WorkoutOverview = ({ workout }: WorkoutOverviewProps) => {
  return (
    <div className="space-y-4">
      {/* Title */}
      <h2
        className="font-display text-2xl font-bold"
        style={{ color: "var(--text-header)" }}
      >
        {workout.title}
      </h2>

      {/* Description */}
      <p className="leading-relaxed" style={{ color: "var(--text-paragraph)" }}>
        {workout.description}
      </p>
      
      {/* Metadata Badges */}
      <div className="flex flex-wrap gap-3">
        <Card cornerSize="sm" padding="sm" showLeftColumn={false} className="w-auto">
          <div className="flex items-center gap-2">
            <Clock size={16} style={{ color: "var(--color-orange-500)" }} />
            <span className="text-sm" style={{ color: "var(--text-header)" }}>{workout.duration}</span>
          </div>
        </Card>

        <Card cornerSize="sm" padding="sm" showLeftColumn={false} className="w-auto">
          <div className="flex items-center gap-2">
            <Gauge size={16} style={{ color: "var(--color-orange-500)" }} />
            <span className="text-sm" style={{ color: "var(--text-header)" }}>{workout.intensity}</span>
          </div>
        </Card>

        <Card cornerSize="sm" padding="sm" showLeftColumn={false} className="w-auto">
          <div className="flex items-center gap-2">
            <Target size={16} style={{ color: "var(--color-purple-500)" }} />
            <span className="text-sm uppercase" style={{ color: "var(--text-header)" }}>{workout.anchor}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
