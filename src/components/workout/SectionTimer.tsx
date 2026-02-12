import { useEffect, useState } from "react";
import { Play, Pause, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChamferedFrame } from "../ChamferedFrame";

interface SectionTimerProps {
    mode: 'countdown' | 'countup';
    initialSeconds?: number;
    onComplete?: () => void;
    autoStart?: boolean;
    label?: string;
    className?: string;
    /** Compact mode - just the timer display without controls */
    compact?: boolean;
}

/**
 * SectionTimer - Green chamfered timer display for timed workout sections.
 *
 * Figma design: Green background with chamfered corner, large digital display,
 * optional START button below.
 */
export const SectionTimer = ({
    mode,
    initialSeconds = 0,
    onComplete,
    autoStart = false,
    label,
    className,
    compact = false
}: SectionTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(mode === 'countdown' ? initialSeconds : 0);
    const [isActive, setIsActive] = useState(autoStart);
    const [hasStarted, setHasStarted] = useState(autoStart);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (mode === 'countdown') {
                        if (prev <= 1) {
                            clearInterval(interval);
                            setIsActive(false);
                            onComplete?.();
                            return 0;
                        }
                        return prev - 1;
                    } else {
                        return prev + 1;
                    }
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, mode, onComplete]);

    const startTimer = () => {
        setIsActive(true);
        setHasStarted(true);
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setHasStarted(false);
        setTimeLeft(mode === 'countdown' ? initialSeconds : 0);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isLowTime = timeLeft <= 10 && mode === 'countdown' && isActive;
    const isComplete = mode === 'countdown' && timeLeft === 0 && hasStarted;

    return (
        <div className={cn("space-y-3", className)}>
            {/* Timer Display */}
            <ChamferedFrame
                cornerSize="md"
                surfaceColor={isComplete ? "var(--color-orange-alpha-200)" : "var(--color-green-alpha-200)"}
                borderColor={isComplete ? "var(--color-orange-500)" : "var(--color-green-500)"}
                hasLeftBorder={true}
            >
                <div className="flex flex-col items-center justify-center py-4 px-6">
                    {label && (
                        <span
                            className="text-label-xs font-bold uppercase tracking-wider mb-2"
                            style={{ color: isComplete ? "var(--color-orange-500)" : "var(--color-green-600)" }}
                        >
                            {label}
                        </span>
                    )}

                    <span
                        className={cn(
                            "text-time-xl font-bold tracking-tight",
                            isLowTime && "animate-pulse"
                        )}
                        style={{
                            color: isLowTime
                                ? "var(--color-red-500)"
                                : isComplete
                                    ? "var(--color-orange-500)"
                                    : "var(--color-neutral-900)",
                            fontFamily: "var(--font-label)",
                            fontSize: "3rem",
                            lineHeight: 1
                        }}
                    >
                        {formatTime(timeLeft)}
                    </span>

                    {/* Inline controls when active */}
                    {hasStarted && !compact && (
                        <div className="flex items-center gap-3 mt-3">
                            <button
                                onClick={toggleTimer}
                                className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
                                style={{
                                    backgroundColor: isActive
                                        ? "var(--color-neutral-200)"
                                        : "var(--color-green-500)",
                                    color: isActive
                                        ? "var(--color-neutral-700)"
                                        : "white"
                                }}
                            >
                                {isActive ? (
                                    <Pause size={20} fill="currentColor" />
                                ) : (
                                    <Play size={20} fill="currentColor" className="ml-0.5" />
                                )}
                            </button>

                            <button
                                onClick={resetTimer}
                                className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                                style={{
                                    backgroundColor: "var(--color-neutral-200)",
                                    color: "var(--color-neutral-600)"
                                }}
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </ChamferedFrame>

            {/* START Button - shown before timer starts */}
            {!hasStarted && !compact && (
                <ChamferedFrame
                    cornerSize="sm"
                    surfaceColor="var(--color-blue-400)"
                    borderColor="var(--color-blue-500)"
                    hasLeftBorder={true}
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={startTimer}
                >
                    <button
                        onClick={startTimer}
                        className="w-full py-3 text-center"
                    >
                        <span
                            className="text-cta-md font-bold uppercase tracking-wider"
                            style={{ color: "white" }}
                        >
                            Start
                        </span>
                    </button>
                </ChamferedFrame>
            )}
        </div>
    );
};
