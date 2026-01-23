import { GeneratedWorkout } from "@/types/workout";
import { Clock, Gauge, Target } from "lucide-react";

interface WorkoutOverviewProps {
  workout: GeneratedWorkout;
}

export const WorkoutOverview = ({ workout }: WorkoutOverviewProps) => {
  return (
    <div className="space-y-4">
      {/* Title */}
      <h2 className="font-display text-2xl font-bold text-foreground">
        {workout.title}
      </h2>
      
      {/* Description */}
      <p className="text-muted-foreground leading-relaxed">
        {workout.description}
      </p>
      
      {/* Metadata Badges */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 glass-card">
          <Clock size={16} className="text-clear-orange" />
          <span className="text-sm text-foreground">{workout.duration}</span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 glass-card">
          <Gauge size={16} className="text-clear-orange" />
          <span className="text-sm text-foreground">{workout.intensity}</span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 glass-card">
          <Target size={16} className="text-clear-purple" />
          <span className="text-sm text-foreground uppercase">{workout.anchor}</span>
        </div>
      </div>
    </div>
  );
};
