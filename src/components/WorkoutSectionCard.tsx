import { useState, useCallback } from "react";
import { RefreshCw, ChevronLeft, Loader2 } from "lucide-react";
import { WorkoutSection, Exercise } from "@/types/workout";
import { ExerciseCard } from "./ExerciseCard";
import { CardLoader } from "./ScanLoader";
import { Card } from "./Card";

interface SwapControlsForExercise {
  onSwap: () => void;
  onPrevious: () => void;
  isSwapLoading: boolean;
  isSwapDisabled: boolean;
  hasPrevious: boolean;
  swapError: string | null;
  showSwapControls: boolean;
}

interface GroupSwapControls {
  onSwap: () => void;
  onPrevious: () => void;
  isSwapLoading: boolean;
  isSwapDisabled: boolean;
  hasPrevious: boolean;
  label: string; // "Swap Pair" | "Swap Block"
}

interface WorkoutSectionCardProps {
  section: WorkoutSection;
  /** Per-exercise swap controls, keyed by exercise index */
  exerciseSwapControls?: Record<number, SwapControlsForExercise>;
  /** Per-group swap controls, keyed by group_id */
  groupSwapControls?: Record<string, GroupSwapControls>;
}

/** Group exercises by group_id for unit swap rendering */
interface ExerciseGroup {
  type: 'standalone' | 'group';
  exercises: { exercise: Exercise; originalIndex: number }[];
  groupId?: string;
  structureType?: string;
}

function groupSectionExercises(exercises: Exercise[]): ExerciseGroup[] {
  const groups: ExerciseGroup[] = [];
  const processedIndices = new Set<number>();

  for (let i = 0; i < exercises.length; i++) {
    if (processedIndices.has(i)) continue;

    const exercise = exercises[i];
    const structure = exercise.structure;

    // Check if this exercise belongs to a group (non-standard, non-circuit with group_id)
    const groupId = structure && 'group_id' in structure ? structure.group_id : undefined;
    const isGroupedType = structure && structure.type !== 'standard' && structure.type !== 'circuit';

    if (groupId && isGroupedType) {
      // Find all exercises with this group_id
      const groupMembers: { exercise: Exercise; originalIndex: number }[] = [];
      for (let j = i; j < exercises.length; j++) {
        const ex = exercises[j];
        const exGroupId = ex.structure && 'group_id' in ex.structure ? ex.structure.group_id : undefined;
        if (exGroupId === groupId) {
          groupMembers.push({ exercise: ex, originalIndex: j });
          processedIndices.add(j);
        }
      }

      groups.push({
        type: 'group',
        exercises: groupMembers,
        groupId,
        structureType: structure.type,
      });
    } else {
      // Standalone exercise (standard or circuit)
      groups.push({
        type: 'standalone',
        exercises: [{ exercise, originalIndex: i }],
      });
      processedIndices.add(i);
    }
  }

  return groups;
}

function getGroupLabel(structureType?: string): string {
  if (structureType === 'superset') return 'Superset';
  if (structureType === 'emom') return 'EMOM';
  if (structureType === 'amrap') return 'AMRAP';
  if (structureType === 'for_time') return 'For Time';
  if (structureType === 'timed') return 'Timed';
  return structureType || 'Block';
}

function getSwapLabel(structureType?: string): string {
  if (structureType === 'superset') return 'Swap Pair';
  return 'Swap Block';
}

export const WorkoutSectionCard = ({
  section,
  exerciseSwapControls,
  groupSwapControls,
}: WorkoutSectionCardProps) => {
  const groups = groupSectionExercises(section.exercises);

  // Track which exercises are expanded (by originalIndex) for showing group swap controls
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set());
  const handleExpandChange = useCallback((index: number, expanded: boolean) => {
    setExpandedExercises(prev => {
      const next = new Set(prev);
      if (expanded) next.add(index); else next.delete(index);
      return next;
    });
  }, []);

  return (
    <Card padding="none" style={{ overflow: 'hidden' }}>
      {/* Section label */}
      <div style={{ padding: 'var(--spacing-300) var(--spacing-400) var(--spacing-200)' }}>
        <span
          className="text-label-xs"
          style={{ color: 'var(--text-card-label)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
        >
          {section.name}
        </span>
      </div>

      {/* Exercises — grouped by structure */}
      <div style={{ paddingBottom: 'var(--spacing-300)' }}>
        {groups.map((group, groupIdx) => {
          if (group.type === 'standalone') {
            // Single exercise — standard or circuit with individual swap
            const { exercise, originalIndex } = group.exercises[0];
            const swapProps = exerciseSwapControls?.[originalIndex];

            return (
              <div key={`exercise-${originalIndex}`}>
                {groupIdx > 0 && (
                  <div style={{ margin: '0 var(--spacing-400)', borderTop: '2px solid var(--border-spacer)' }} />
                )}
                <ExerciseCard
                  exercise={exercise}
                  onSwap={swapProps?.onSwap}
                  onPrevious={swapProps?.onPrevious}
                  isSwapLoading={swapProps?.isSwapLoading}
                  isSwapDisabled={swapProps?.isSwapDisabled}
                  hasPrevious={swapProps?.hasPrevious}
                  swapError={swapProps?.swapError}
                  showSwapControls={swapProps?.showSwapControls}
                />
              </div>
            );
          } else {
            // Grouped exercises (superset, emom, amrap, for_time) — unit swap
            const groupControls = group.groupId ? groupSwapControls?.[group.groupId] : undefined;
            const isLoading = groupControls?.isSwapLoading ?? false;

            return (
              <div
                key={`group-${group.groupId || groupIdx}`}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                {/* Card loader overlay for unit swap */}
                {groupControls && <CardLoader running={isLoading} />}
                {groupIdx > 0 && (
                  <div style={{ margin: '0 var(--spacing-400)', borderTop: '2px solid var(--border-spacer)' }} />
                )}

                {/* Group label */}
                <div style={{ padding: 'var(--spacing-200) var(--spacing-400) var(--spacing-100)' }}>
                  <span
                    className="text-label-xs"
                    style={{ color: 'var(--text-card-label)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  >
                    {getGroupLabel(group.structureType)}
                  </span>
                </div>

                {/* Group exercises — no individual swap controls */}
                {group.exercises.map(({ exercise, originalIndex }, exIdx) => (
                  <div key={`exercise-${originalIndex}`}>
                    {exIdx > 0 && (
                      <div style={{ margin: '0 var(--spacing-400)', borderTop: '1px solid var(--border-spacer)' }} />
                    )}
                    <ExerciseCard
                      exercise={exercise}
                      onExpandChange={(expanded) => handleExpandChange(originalIndex, expanded)}
                    />
                  </div>
                ))}

                {/* Unit swap controls — only when any group member is expanded */}
                {groupControls && group.exercises.some(({ originalIndex }) => expandedExercises.has(originalIndex)) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)', padding: '0 var(--spacing-400) var(--spacing-200)' }}>
                    {groupControls.hasPrevious && (
                      <button
                        onClick={groupControls.onPrevious}
                        className="transition-colors"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-100)',
                          paddingRight: 'var(--spacing-300)',
                          color: 'var(--icon-cta)',
                          minHeight: '44px',
                          minWidth: '44px',
                        }}
                      >
                        <ChevronLeft size={16} />
                        <span className="text-label-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Previous</span>
                      </button>
                    )}

                    <button
                      onClick={groupControls.onSwap}
                      disabled={groupControls.isSwapDisabled || isLoading}
                      className="transition-colors"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-100)',
                        paddingRight: 'var(--spacing-300)',
                        color: groupControls.isSwapDisabled ? 'var(--text-disabled)' : 'var(--icon-cta)',
                        minHeight: '44px',
                        minWidth: '44px',
                        cursor: groupControls.isSwapDisabled ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                      <span className="text-label-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{groupControls.label}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>
    </Card>
  );
};
