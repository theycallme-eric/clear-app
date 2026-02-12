import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Exercise, ExerciseStructure, SectionType } from "@/types/workout";
import { Card } from "../Card";

type TimedStructureType = 'emom' | 'amrap' | 'for_time';

interface TimedSectionCardProps {
  /** The exercises in this timed section */
  exercises: Exercise[];
  /** The structure defining the timing */
  structure: ExerciseStructure;
  /** Section type for the label */
  sectionType?: SectionType;
  /** Optional rep scheme for ladder workouts */
  repScheme?: string;
  /** Additional className */
  className?: string;
}

/**
 * TimedSectionCard - Preview card for timed workout structures.
 *
 * Displays different formats based on structure type:
 * - EMOM: "EMOM: X MIN" with exercises listed
 * - AMRAP: "AMRAP: X MIN TOTAL" with exercises listed
 * - For Time: "FOR TIME: X MIN MAX" with exercises listed
 *
 * All support optional ladder/rep schemes.
 */
export function TimedSectionCard({
  exercises,
  structure,
  sectionType,
  repScheme,
  className,
}: TimedSectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract timing info from structure
  const structureType = structure.type as TimedStructureType;
  const minutes = 'minutes' in structure ? structure.minutes :
                  'time_cap_mins' in structure ? structure.time_cap_mins : 0;

  // Build header text based on structure type
  const getHeaderText = () => {
    switch (structureType) {
      case 'emom':
        return `EMOM: ${minutes} MIN`;
      case 'amrap':
        return `AMRAP: ${minutes} MIN TOTAL`;
      case 'for_time':
        return `FOR TIME: ${minutes} MIN MAX`;
      default:
        return 'TIMED SECTION';
    }
  };

  // Check if this is an alternating EMOM (multiple exercises)
  const isAlternating = structureType === 'emom' && exercises.length > 1;

  return (
    <Card
      padding="md"
      cornerSize="md"
      surfaceColor="var(--color-orange-alpha-050)"
      className={cn("overflow-hidden", className)}
    >
      <div className="space-y-3">
        {/* Section Label */}
        <div className="flex items-center justify-between">
          <span
            className="text-label-xs uppercase tracking-wider"
            style={{ color: "var(--color-orange-300)" }}
          >
            {sectionType ? sectionType.toUpperCase() : "CONDITIONING"}
          </span>

          {exercises.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 -m-1"
              style={{ color: "var(--color-orange-500)" }}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
        </div>

        {/* Structure Header */}
        <h3
          className="text-heading-h4 font-bold uppercase"
          style={{ color: "var(--text-header)" }}
        >
          {isAlternating ? `EMOM ALTERNATE: ${minutes} MIN` : getHeaderText()}
        </h3>

        {/* Rep Scheme (if provided) */}
        {repScheme && (
          <p
            className="text-paragraph-md"
            style={{ color: "var(--color-blue-300)" }}
          >
            {repScheme}
          </p>
        )}

        {/* Exercise List - Collapsed View */}
        {!isExpanded && (
          <div className="space-y-1">
            {exercises.map((exercise) => (
              <p
                key={exercise.id}
                className="text-paragraph-md"
                style={{ color: "var(--color-blue-300)" }}
              >
                {exercise.reps && `${exercise.reps} • `}
                {exercise.name.toLowerCase()}
              </p>
            ))}
          </div>
        )}

        {/* Expanded View - More Details */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-[var(--color-orange-alpha-200)]">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="space-y-1">
                <p
                  className="text-paragraph-md font-medium"
                  style={{ color: "var(--text-header)" }}
                >
                  {exercise.name}
                </p>
                <p
                  className="text-paragraph-sm"
                  style={{ color: "var(--color-blue-300)" }}
                >
                  {exercise.reps}
                  {exercise.equipment && ` • ${exercise.equipment.toLowerCase()}`}
                </p>
                {exercise.coachingCues && (
                  <p
                    className="text-paragraph-sm italic"
                    style={{ color: "var(--color-blue-200)" }}
                  >
                    {Array.isArray(exercise.coachingCues)
                      ? exercise.coachingCues.join(". ")
                      : String(exercise.coachingCues)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * TimedIntervalCard - Preview card for timed interval workouts.
 *
 * Displays: "TIMED INTERVAL: X MIN TOTAL"
 * With work/rest times: "40secs ON • 20secs REST"
 */
interface TimedIntervalCardProps {
  exercises: Exercise[];
  totalMinutes: number;
  workSeconds: number;
  restSeconds: number;
  sectionType?: SectionType;
  className?: string;
}

export function TimedIntervalCard({
  exercises,
  totalMinutes,
  workSeconds,
  restSeconds,
  sectionType,
  className,
}: TimedIntervalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      padding="md"
      cornerSize="md"
      surfaceColor="var(--color-orange-alpha-050)"
      className={cn("overflow-hidden", className)}
    >
      <div className="space-y-3">
        {/* Section Label */}
        <div className="flex items-center justify-between">
          <span
            className="text-label-xs uppercase tracking-wider"
            style={{ color: "var(--color-orange-300)" }}
          >
            {sectionType ? sectionType.toUpperCase() : "CORE"}
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 -m-1"
            style={{ color: "var(--color-orange-500)" }}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Header */}
        <h3
          className="text-heading-h4 font-bold uppercase"
          style={{ color: "var(--text-header)" }}
        >
          Timed Interval: {totalMinutes} Min Total
        </h3>

        {/* Work/Rest Display */}
        <p
          className="text-paragraph-md"
          style={{ color: "var(--color-blue-300)" }}
        >
          {workSeconds}secs ON • {restSeconds}secs REST
        </p>

        {/* Exercise List */}
        <div className="space-y-1">
          {exercises.map((exercise) => (
            <p
              key={exercise.id}
              className="text-paragraph-md"
              style={{ color: "var(--color-blue-300)" }}
            >
              {exercise.name}
            </p>
          ))}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-[var(--color-orange-alpha-200)]">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="space-y-1">
                <p
                  className="text-paragraph-md font-medium"
                  style={{ color: "var(--text-header)" }}
                >
                  {exercise.name}
                </p>
                {exercise.coachingCues && (
                  <p
                    className="text-paragraph-sm italic"
                    style={{ color: "var(--color-blue-200)" }}
                  >
                    {Array.isArray(exercise.coachingCues)
                      ? exercise.coachingCues.join(". ")
                      : String(exercise.coachingCues)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
