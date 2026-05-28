import { X } from '@/components/icons';
import { ChamferedFrame } from '@/components/ChamferedFrame';

interface RestTimerBarProps {
  remainingSeconds: number;
  totalSeconds: number;
  onDismiss: () => void;
  /** Render inline (no fixed positioning). For gallery/preview use. */
  inline?: boolean;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`;
  return `${s}`;
}

export function RestTimerBar({ remainingSeconds, totalSeconds, onDismiss, inline }: RestTimerBarProps) {
  const isLow = remainingSeconds <= 5;
  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;
  const textColor = isLow ? 'var(--text-timer-low)' : 'var(--text-timer)';

  const bar = (
    <ChamferedFrame
      cornerSize="sm"
      surfaceColor={isLow ? 'var(--surface-timer-low)' : 'var(--surface-timer)'}
      borderColor={isLow ? 'var(--border-timer-low)' : 'var(--border-timer)'}
      hasLeftBorder
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-300)',
        padding: 'var(--spacing-200) var(--spacing-400)',
      }}>
        <span
          className="text-label-xs"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 'bold',
            color: textColor,
            flexShrink: 0,
          }}
        >
          Rest
        </span>

        <div style={{
          flex: 1,
          height: 4,
          backgroundColor: isLow
            ? 'color-mix(in srgb, var(--text-timer-low) 20%, transparent)'
            : 'color-mix(in srgb, var(--text-timer) 20%, transparent)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            backgroundColor: textColor,
            transition: 'width 0.25s linear',
          }} />
        </div>

        <span
          className="text-time-lg"
          style={{
            fontWeight: 'bold',
            color: textColor,
            minWidth: 40,
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {formatCountdown(remainingSeconds)}
        </span>

        <button
          onClick={onDismiss}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            flexShrink: 0,
            color: textColor,
          }}
        >
          <X size={16} />
        </button>
      </div>
    </ChamferedFrame>
  );

  if (inline) return bar;

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: 0,
      right: 0,
      zIndex: 45,
      display: 'flex',
      justifyContent: 'center',
      padding: '0 var(--spacing-400)',
    }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        {bar}
      </div>
    </div>
  );
}
