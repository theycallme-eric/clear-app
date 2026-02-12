import { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Exercise, SectionType } from "@/types/workout";
import { Card } from "../Card";
import { SectionLabel } from "./SectionLabel";

interface ExercisePreviewCardProps {
  /** The exercise to display */
  exercise: Exercise;
  /** Section type for the label (ANCHOR, ACCESSORY, etc.) */
  sectionType?: SectionType;
  /** Whether to show the section label */
  showSectionLabel?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * ExercisePreviewCard - Static preview card for the Review screen.
 *
 * Displays exercise information without input fields:
 * - Section label (optional)
 * - Exercise name
 * - Metadata: equipment • sets × reps • rest
 * - Expandable notes section
 */
export function ExercisePreviewCard({
  exercise,
  sectionType,
  showSectionLabel = true,
  className,
}: ExercisePreviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasNotes = exercise.coachingCues && exercise.coachingCues.length > 0;
  const hasRegression = exercise.regression;
  const hasExpandableContent = hasNotes || hasRegression;

  // Build metadata parts
  const metadataParts: string[] = [];
  if (exercise.equipment) {
    metadataParts.push(exercise.equipment.toLowerCase().replace(/_/g, " "));
  }
  if (exercise.sets && exercise.reps) {
    metadataParts.push(`${exercise.sets} x ${exercise.reps}`);
  } else if (exercise.reps) {
    metadataParts.push(exercise.reps);
  }
  if (exercise.rest) {
    metadataParts.push(`rest: ${exercise.rest}`);
  }

  return (
    <Card
      padding="md"
      cornerSize="md"
      surfaceColor="var(--color-orange-alpha-050)"
      className={cn("overflow-hidden", className)}
    >
      <div className="space-y-2">
        {/* Header row: Section label + Chevron */}
        <div className="flex items-center justify-between">
          {showSectionLabel && sectionType && (
            <SectionLabel type={sectionType} />
          )}
          {!showSectionLabel && <div />}

          {hasExpandableContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground p-1 -m-1"
            >
              {isExpanded ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          )}
        </div>

        {/* Exercise name */}
        <h3
          className="text-heading-h4 font-bold uppercase"
          style={{ color: "var(--text-header)" }}
        >
          {exercise.name}
        </h3>

        {/* Metadata row */}
        <p
          className="text-paragraph-sm"
          style={{ color: "var(--color-blue-300)" }}
        >
          {metadataParts.join(" • ")}
        </p>

        {/* Notes row (collapsed state - just shows indicator) */}
        {hasNotes && !isExpanded && (
          <div
            className="flex items-center gap-1 text-paragraph-sm"
            style={{ color: "var(--color-blue-300)" }}
          >
            <span>notes:</span>
            <button
              onClick={() => setIsExpanded(true)}
              className="hover:opacity-80"
              style={{ color: "var(--color-orange-500)" }}
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        {/* Expanded content */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-[var(--border-card)]">
            {/* Coaching notes */}
            {hasNotes && (
              <div className="space-y-1">
                <span
                  className="text-label-xs uppercase tracking-wider"
                  style={{ color: "var(--color-orange-300)" }}
                >
                  Notes
                </span>
                <p
                  className="text-paragraph-sm italic"
                  style={{ color: "var(--text-paragraph)" }}
                >
                  {Array.isArray(exercise.coachingCues)
                    ? exercise.coachingCues.join(". ")
                    : String(exercise.coachingCues)}
                </p>
              </div>
            )}

            {/* Regression */}
            {hasRegression && (
              <div className="space-y-1">
                <span
                  className="text-label-xs uppercase tracking-wider"
                  style={{ color: "var(--color-orange-300)" }}
                >
                  Regression
                </span>
                <p
                  className="text-paragraph-sm"
                  style={{ color: "var(--text-paragraph)" }}
                >
                  {exercise.regression}
                </p>
              </div>
            )}

            {/* Last weight */}
            {exercise.lastWeight && (
              <div className="space-y-1">
                <span
                  className="text-label-xs uppercase tracking-wider"
                  style={{ color: "var(--color-orange-300)" }}
                >
                  Last Time
                </span>
                <p
                  className="text-paragraph-sm"
                  style={{ color: "var(--text-paragraph)" }}
                >
                  {exercise.lastWeight}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
