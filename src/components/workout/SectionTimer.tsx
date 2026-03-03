import { useEffect, useState, useCallback } from "react";
import { ChamferedFrame } from "@/components/ChamferedFrame";
import { CTAButton } from "../CTAButton";

interface SectionTimerProps {
    mode: 'countdown' | 'countup';
    initialSeconds?: number;
    /** Called when timer completes or user taps Finish. Receives elapsed seconds. */
    onFinish?: (elapsedSeconds: number) => void;
    /** Called on each state change so parent can react to completion */
    onStateChange?: (state: TimerState) => void;
    /** EMOM uses per-minute low-time warning instead of overall */
    emom?: boolean;
    /** Called each second with current minute (1-based) for EMOM sections */
    onMinuteChange?: (currentMinute: number) => void;
    /** Hide controls (when parent renders custom completion UI) */
    hideControls?: boolean;
    className?: string;
}

export type TimerState = 'idle' | 'running' | 'paused' | 'complete';

export const SectionTimer = ({
    mode,
    initialSeconds = 0,
    onFinish,
    onStateChange,
    emom = false,
    onMinuteChange,
    hideControls = false,
    className
}: SectionTimerProps) => {
    const [seconds, setSeconds] = useState(mode === 'countdown' ? initialSeconds : 0);
    const [timerState, setTimerState] = useState<TimerState>('idle');

    const totalMinutes = emom ? Math.floor(initialSeconds / 60) : 0;

    // For EMOM countdown: elapsed = initial - remaining, currentMinute is 1-based
    const currentMinute = emom && timerState !== 'idle'
        ? Math.min(Math.floor((initialSeconds - seconds) / 60) + 1, totalMinutes)
        : 0;

    // Timer color shift: green → error tokens as a "wrap it up" warning.
    // EMOM: triggers in the last 10s of each minute, resets on new minute.
    // Non-EMOM (AMRAP): triggers in the last 10s overall.
    const isLowTime = timerState === 'running' && mode === 'countdown' && seconds > 0 && (
        emom
            ? (seconds % 60 > 0 && seconds % 60 <= 10)
            : seconds <= 10
    );
    const isComplete = timerState === 'complete';

    const updateState = useCallback((newState: TimerState) => {
        setTimerState(newState);
        onStateChange?.(newState);
    }, [onStateChange]);

    // Notify parent of minute changes for EMOM active exercise highlighting
    useEffect(() => {
        if (emom && currentMinute > 0 && onMinuteChange) {
            onMinuteChange(currentMinute);
        }
    }, [emom, currentMinute, onMinuteChange]);

    useEffect(() => {
        if (timerState !== 'running') return;

        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (mode === 'countdown') {
                    if (prev <= 1) {
                        updateState('complete');
                        onFinish?.(initialSeconds);
                        return 0;
                    }
                    return prev - 1;
                }
                // Countup: auto-complete at cap if set
                const next = prev + 1;
                if (initialSeconds > 0 && next >= initialSeconds) {
                    updateState('complete');
                    onFinish?.(initialSeconds);
                    return initialSeconds;
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timerState, mode, updateState, onFinish, initialSeconds]);

    const handleStart = () => updateState('running');
    const handlePause = () => updateState('paused');
    const handleResume = () => updateState('running');

    const handleFinish = useCallback(() => {
        updateState('complete');
        // Report elapsed time: for countdown, elapsed = initial - remaining
        const elapsed = mode === 'countdown' ? initialSeconds - seconds : seconds;
        onFinish?.(elapsed);
    }, [seconds, initialSeconds, mode, onFinish, updateState]);

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Token mapping based on state
    const surfaceColor = isLowTime
        ? 'var(--surface-timer-low)'
        : 'var(--surface-timer)';

    const borderColor = isLowTime
        ? 'var(--border-timer-low)'
        : 'var(--border-timer)';

    const textColor = isLowTime
        ? 'var(--text-timer-low)'
        : 'var(--text-timer)';

    return (
        <div className={className}>
            {/* Timer display */}
            <ChamferedFrame
                cornerSize="sm"
                surfaceColor={surfaceColor}
                borderColor={borderColor}
                hasLeftBorder={true}
            >
                <div className="flex flex-col items-center py-3">
                    <span
                        className="text-time-xl font-bold text-center tracking-tight"
                        style={{ color: textColor, transition: 'color 1s ease' }}
                    >
                        {formatTime(seconds)}
                    </span>
                    {/* EMOM minute indicator */}
                    {emom && timerState !== 'idle' && !isComplete && (
                        <span
                            className="text-label-sm font-mono font-bold uppercase tracking-wider mt-1"
                            style={{ color: textColor, transition: 'color 1s ease' }}
                        >
                            MIN {currentMinute} OF {totalMinutes}
                        </span>
                    )}
                    {isComplete && (
                        <span
                            className="text-label-xs font-bold uppercase"
                            style={{ color: textColor }}
                        >
                            Done
                        </span>
                    )}
                </div>
            </ChamferedFrame>

            {/* Controls — hidden when parent renders custom completion UI */}
            {!hideControls && <div className="flex gap-3 mt-3">
                {timerState === 'idle' && (
                    <CTAButton onClick={handleStart} size="md" fullWidth>
                        Start
                    </CTAButton>
                )}

                {timerState === 'running' && (
                    <>
                        <CTAButton onClick={handlePause} variant="secondary" size="md" fullWidth>
                            Pause
                        </CTAButton>
                        <CTAButton onClick={handleFinish} size="md" fullWidth>
                            Finish
                        </CTAButton>
                    </>
                )}

                {timerState === 'paused' && (
                    <>
                        <CTAButton onClick={handleResume} variant="secondary" size="md" fullWidth>
                            Resume
                        </CTAButton>
                        <CTAButton onClick={handleFinish} size="md" fullWidth>
                            Finish
                        </CTAButton>
                    </>
                )}
            </div>}
        </div>
    );
};
