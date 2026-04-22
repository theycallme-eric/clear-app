import { useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw, ChevronLeft, Loader2 } from "lucide-react";
import { Exercise } from "@/types/workout";
import { CardLoader } from "@/components/ScanLoader";

interface ExerciseCardProps {
  exercise: Exercise;
  defaultExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  // Swap props (optional — only used on Review screen)
  onSwap?: () => void;
  onPrevious?: () => void;
  isSwapLoading?: boolean;
  isSwapDisabled?: boolean;
  hasPrevious?: boolean;
  swapError?: string | null;
  showSwapControls?: boolean;
}

/** Check if a rest value is meaningful (non-zero, non-empty) */
const hasRest = (rest?: string): boolean => {
  if (!rest) return false;
  const cleaned = rest.toLowerCase().replace(/\s/g, '');
  return cleaned !== '0s' && cleaned !== '0' && cleaned !== '';
};

export const ExerciseCard = ({
  exercise,
  defaultExpanded = false,
  onExpandChange,
  onSwap,
  onPrevious,
  isSwapLoading = false,
  isSwapDisabled = false,
  hasPrevious = false,
  swapError,
  showSwapControls = false,
}: ExerciseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Card loader overlay — replaces opacity dim during swap */}
      {showSwapControls && <CardLoader running={isSwapLoading} />}

      {/* Header - always visible */}
      <button
        onClick={() => { const next = !isExpanded; setIsExpanded(next); onExpandChange?.(next); }}
        className="w-full flex items-start gap-3 text-left py-2 px-4"
      >
        <div className="flex-1 min-w-0 space-y-1">
          <h4
            className="text-label-md font-bold leading-tight uppercase"
            style={{ fontFamily: 'var(--font-headings)', color: 'var(--text-card-header)' }}
          >
            {exercise.name}
          </h4>
          <div
            className="text-paragraph-sm flex flex-wrap gap-x-3 gap-y-1"
            style={{ color: 'var(--text-paragraph)' }}
          >
            <span>
              {exercise.sets ? `${exercise.sets}×` : ''}{exercise.reps}
              {exercise.effort && ` @ ${exercise.effort}`}
            </span>
            {exercise.equipment && (
              <>
                <span>&bull;</span>
                <span>{exercise.equipment.replace(/_/g, ' ')}</span>
              </>
            )}
          </div>
        </div>
        <span className="p-1 shrink-0" style={{ color: 'var(--icon-cta)' }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 space-y-3 pb-2">
          {/* Tempo & Rest */}
          {(exercise.tempo || hasRest(exercise.rest)) && (
            <div
              className="text-paragraph-sm flex flex-wrap gap-x-3 gap-y-1"
              style={{ color: 'var(--text-paragraph)' }}
            >
              {exercise.tempo && <span>Tempo: {exercise.tempo}</span>}
              {hasRest(exercise.rest) && <span>Rest: {exercise.rest}</span>}
            </div>
          )}

          {/* Coaching Cues */}
          {exercise.coachingCues && (
            <p
              className="text-paragraph-sm italic"
              style={{ color: 'var(--text-paragraph)' }}
            >
              {Array.isArray(exercise.coachingCues)
                ? exercise.coachingCues.join('. ')
                : String(exercise.coachingCues)}
            </p>
          )}

          {/* Last Weight */}
          {exercise.lastWeight && (
            <p className="text-paragraph-sm" style={{ color: 'var(--text-timer)' }}>
              Last: {exercise.lastWeight}
            </p>
          )}

          {/* Regression / Progression */}
          {(exercise.regression || exercise.progression) && (
            <div
              className="text-paragraph-sm space-y-1 pt-2"
              style={{ color: 'var(--text-paragraph)' }}
            >
              {exercise.regression && (
                <p><span style={{ color: 'var(--text-disabled)' }}>Easier:</span> {exercise.regression}</p>
              )}
              {exercise.progression && (
                <p><span style={{ color: 'var(--text-disabled)' }}>Harder:</span> {exercise.progression}</p>
              )}
            </div>
          )}

          {/* Swap controls — only in expanded state, only for standard/circuit exercises */}
          {showSwapControls && (
            <div className="flex items-center gap-2 pt-1">
              {/* Previous button — only after first swap */}
              {hasPrevious && (
                <button
                  onClick={(e) => { e.stopPropagation(); onPrevious?.(); }}
                  className="flex items-center gap-1 pr-3 transition-colors"
                  style={{
                    color: 'var(--icon-cta)',
                    minHeight: '44px',
                    minWidth: '44px',
                  }}
                >
                  <ChevronLeft size={16} />
                  <span className="text-label-xs uppercase tracking-wider">Previous</span>
                </button>
              )}

              {/* Swap button */}
              <button
                onClick={(e) => { e.stopPropagation(); onSwap?.(); }}
                disabled={isSwapDisabled || isSwapLoading}
                className="flex items-center gap-1 pr-3 transition-colors"
                style={{
                  color: isSwapDisabled ? 'var(--text-disabled)' : 'var(--icon-cta)',
                  minHeight: '44px',
                  minWidth: '44px',
                  cursor: isSwapDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                {isSwapLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                <span className="text-label-xs uppercase tracking-wider">Swap</span>
              </button>
            </div>
          )}

          {/* Swap error */}
          {swapError && (
            <p className="text-paragraph-sm" style={{ color: 'var(--text-error)' }}>
              {swapError}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
