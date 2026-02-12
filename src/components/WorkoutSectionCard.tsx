import { useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { WorkoutSection } from "@/types/workout";
import { ExercisePreviewCard } from "./workout/ExercisePreviewCard";
import { Card } from "./Card";
import { SectionLabel } from "./workout/SectionLabel";

interface WorkoutSectionCardProps {
  section: WorkoutSection;
  onRandomize?: () => void;
}

export const WorkoutSectionCard = ({ section, onRandomize }: WorkoutSectionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      padding="none"
      cornerSize="md"
      surfaceColor="var(--color-orange-alpha-050)"
      className="overflow-hidden"
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span
          className="text-cta-sm font-bold uppercase"
          style={{ color: "var(--color-orange-500)" }}
        >
          {section.name}
        </span>
        {isExpanded ? (
          <ChevronUp size={20} style={{ color: "var(--color-orange-500)" }} />
        ) : (
          <ChevronDown size={20} style={{ color: "var(--color-orange-500)" }} />
        )}
      </button>

      {/* Collapsed preview - show all exercises in compact form */}
      {!isExpanded && section.exercises.length > 0 && (
        <div className="px-4 pb-4 space-y-3">
          {section.exercises.map((exercise, index) => {
            // Build metadata
            const metadataParts: string[] = [];
            if (exercise.equipment) {
              metadataParts.push(exercise.equipment.toLowerCase().replace(/_/g, " "));
            }
            if (exercise.sets && exercise.reps) {
              metadataParts.push(`${exercise.sets}×${exercise.reps}`);
            } else if (exercise.reps) {
              metadataParts.push(exercise.reps);
            }

            return (
              <div
                key={exercise.id}
                className="py-2"
                style={{
                  borderBottom: index < section.exercises.length - 1
                    ? "1px solid var(--color-orange-alpha-200)"
                    : "none"
                }}
              >
                <p
                  className="text-heading-h5 font-bold uppercase"
                  style={{ color: "var(--text-header)" }}
                >
                  {exercise.name}
                </p>
                <p
                  className="text-paragraph-sm"
                  style={{ color: "var(--color-blue-300)" }}
                >
                  ({metadataParts.join(" • ")})
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded view - full exercise preview cards */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {section.exercises.map((exercise, index) => (
            <ExercisePreviewCard
              key={exercise.id}
              exercise={exercise}
              sectionType={section.type}
              showSectionLabel={index === 0}
            />
          ))}

          {/* Randomize button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRandomize?.();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 transition-colors"
            style={{
              border: "1px solid var(--color-orange-alpha-300)",
              color: "var(--color-orange-500)"
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
