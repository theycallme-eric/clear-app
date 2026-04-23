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
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--spacing-300)',
          textAlign: 'left',
          paddingTop: 'var(--spacing-200)',
          paddingBottom: 'var(--spacing-200)',
          paddingLeft: 'var(--spacing-400)',
          paddingRight: 'var(--spacing-400)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-100)' }}>
          <h4
            className="text-label-md"
            style={{ fontWeight: 'bold', lineHeight: 1.25, textTransform: 'uppercase', fontFamily: 'var(--font-headings)', color: 'var(--text-card-header)' }}
          >
            {exercise.name}
          </h4>
          <div
            className="text-paragraph-sm"
            style={{ display: 'flex', flexWrap: 'wrap', columnGap: 'var(--spacing-300)', rowGap: 'var(--spacing-100)', color: 'var(--text-paragraph)' }}
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
        <span style={{ padding: 'var(--spacing-100)', flexShrink: 0, color: 'var(--icon-cta)' }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div style={{ paddingLeft: 'var(--spacing-400)', paddingRight: 'var(--spacing-400)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)', paddingBottom: 'var(--spacing-200)' }}>
          {/* Tempo & Rest */}
          {(exercise.tempo || hasRest(exercise.rest)) && (
            <div
              className="text-paragraph-sm"
              style={{ display: 'flex', flexWrap: 'wrap', columnGap: 'var(--spacing-300)', rowGap: 'var(--spacing-100)', color: 'var(--text-paragraph)' }}
            >
              {exercise.tempo && <span>Tempo: {exercise.tempo}</span>}
              {hasRest(exercise.rest) && <span>Rest: {exercise.rest}</span>}
            </div>
          )}

          {/* Coaching Cues */}
          {exercise.coachingCues && (
            <p
              className="text-paragraph-sm"
              style={{ fontStyle: 'italic', color: 'var(--text-paragraph)' }}
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
              className="text-paragraph-sm"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-100)', paddingTop: 'var(--spacing-200)', color: 'var(--text-paragraph)' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)', paddingTop: 'var(--spacing-100)' }}>
              {/* Previous button — only after first swap */}
              {hasPrevious && (
                <button
                  onClick={(e) => { e.stopPropagation(); onPrevious?.(); }}
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

              {/* Swap button */}
              <button
                onClick={(e) => { e.stopPropagation(); onSwap?.(); }}
                disabled={isSwapDisabled || isSwapLoading}
                className="transition-colors"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-100)',
                  paddingRight: 'var(--spacing-300)',
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
                <span className="text-label-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Swap</span>
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
