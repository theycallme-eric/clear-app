import { RefreshCw } from "lucide-react";
import { WorkoutSection } from "@/types/workout";
import { ExerciseCard } from "./ExerciseCard";
import { Card } from "./Card";

interface WorkoutSectionCardProps {
  section: WorkoutSection;
  onRandomize?: () => void;
}

export const WorkoutSectionCard = ({ section, onRandomize }: WorkoutSectionCardProps) => {
  return (
    <Card padding="none" className="overflow-hidden">
      {/* Section label */}
      <div className="px-4 pt-3 pb-2">
        <span
          className="text-label-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-card-label)' }}
        >
          {section.name}
        </span>
      </div>

      {/* Exercises - each individually expandable */}
      <div className="pb-3">
        {section.exercises.map((exercise, i) => (
          <div key={exercise.id}>
            {i > 0 && (
              <div className="mx-4" style={{ borderTop: '2px solid var(--border-spacer)' }} />
            )}
            <ExerciseCard exercise={exercise} />
          </div>
        ))}
      </div>

      {/* Randomize button */}
      {onRandomize && (
        <div className="px-4 pb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRandomize();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 border transition-colors"
            style={{
              borderColor: 'var(--border-card)',
              color: 'var(--icon-cta)',
            }}
          >
            <RefreshCw size={16} />
            <span className="text-paragraph-sm font-medium">Randomize Section</span>
          </button>
        </div>
      )}
    </Card>
  );
};
