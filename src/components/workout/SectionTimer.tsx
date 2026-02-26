import { useEffect, useState, useCallback } from "react";
import { ChamferedFrame } from "@/components/ChamferedFrame";
import { CTAButton } from "../CTAButton";

interface SectionTimerProps {
    mode: 'countdown' | 'countup';
    initialSeconds?: number;
    onFinish?: (remainingSeconds: number) => void;
    /** EMOM uses per-minute low-time warning instead of overall */
    emom?: boolean;
    className?: string;
}

type TimerState = 'idle' | 'running' | 'paused' | 'complete';

export const SectionTimer = ({
    mode,
    initialSeconds = 0,
    onFinish,
    emom = false,
    className
}: SectionTimerProps) => {
    const [seconds, setSeconds] = useState(mode === 'countdown' ? initialSeconds : 0);
    const [timerState, setTimerState] = useState<TimerState>('idle');

    // EMOM: low-time triggers in the last 10s of each minute
    // Others: low-time triggers in the last 10s overall
    const isLowTime = timerState === 'running' && mode === 'countdown' && seconds > 0 && (
        emom
            ? (seconds % 60 > 0 && seconds % 60 <= 10)
            : seconds <= 10
    );
    const isComplete = timerState === 'complete';

    useEffect(() => {
        if (timerState !== 'running') return;

        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (mode === 'countdown') {
                    if (prev <= 1) {
                        setTimerState('complete');
                        return 0;
                    }
                    return prev - 1;
                }
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timerState, mode]);

    const handleStart = () => setTimerState('running');
    const handlePause = () => setTimerState('paused');
    const handleResume = () => setTimerState('running');

    const handleFinish = useCallback(() => {
        setTimerState('complete');
        onFinish?.(seconds);
    }, [seconds, onFinish]);

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Token mapping based on state
    const surfaceColor = isLowTime
        ? 'var(--surface-error)'
        : 'var(--surface-radio-selected)';

    const borderColor = isLowTime
        ? 'var(--border-error)'
        : 'var(--border-radio-select)';

    const textColor = isLowTime
        ? 'var(--text-error)'
        : 'var(--text-radio-text-select)';

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

            {/* Controls */}
            <div className="flex gap-3 mt-3">
                {timerState === 'idle' && (
                    <CTAButton onClick={handleStart} size="md" fullWidth>
                        Start
                    </CTAButton>
                )}

                {timerState === 'running' && (
                    <>
                        <CTAButton onClick={handlePause} size="md" fullWidth>
                            Pause
                        </CTAButton>
                        <CTAButton onClick={handleFinish} variant="secondary" size="md" fullWidth>
                            Finish
                        </CTAButton>
                    </>
                )}

                {timerState === 'paused' && (
                    <>
                        <CTAButton onClick={handleResume} size="md" fullWidth>
                            Resume
                        </CTAButton>
                        <CTAButton onClick={handleFinish} variant="secondary" size="md" fullWidth>
                            Finish
                        </CTAButton>
                    </>
                )}
            </div>
        </div>
    );
};
