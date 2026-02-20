import { useEffect, useState } from "react";
import { Play, Pause, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "../Card";

interface SectionTimerProps {
    mode: 'countdown' | 'countup';
    initialSeconds?: number; // Target duration for countdown, or starting point for countup
    onComplete?: () => void;
    autoStart?: boolean;
    label?: string;
    className?: string;
}

export const SectionTimer = ({
    mode,
    initialSeconds = 0,
    onComplete,
    autoStart = false,
    label,
    className
}: SectionTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(mode === 'countdown' ? initialSeconds : 0);
    const [isActive, setIsActive] = useState(autoStart);
    const isComplete = mode === 'countdown' && timeLeft === 0 && !isActive && initialSeconds > 0;
    const isLowTime = mode === 'countdown' && isActive && timeLeft <= 10 && timeLeft > 0;

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

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'countdown' ? initialSeconds : 0);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const progressPercent = mode === 'countdown' && initialSeconds > 0
        ? ((initialSeconds - timeLeft) / initialSeconds) * 100
        : 0;

    // Timer ring colors based on state
    const ringColor = isLowTime
        ? 'var(--color-red-500)'
        : isComplete
            ? 'var(--color-green-500)'
            : 'var(--border-card)';

    const timeColor = isLowTime
        ? 'var(--color-red-400)'
        : isComplete
            ? 'var(--color-green-400)'
            : 'var(--text-header)';

    return (
        <Card cornerSize="md" padding="none" className={className}>
            <div className="flex flex-col items-center gap-3 p-4">
            {label && (
                <span
                    className="text-label-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-paragraph)" }}
                >
                    {label}
                </span>
            )}

            <div className="relative flex items-center justify-center w-32 h-32">
                {/* Progress Ring Background */}
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="60"
                        className="fill-none"
                        style={{ stroke: 'var(--color-neutral-alpha-200)' }}
                        strokeWidth="6"
                    />
                    {mode === 'countdown' && (
                        <circle
                            cx="64"
                            cy="64"
                            r="60"
                            className="fill-none transition-all duration-1000 ease-linear"
                            style={{ stroke: ringColor }}
                            strokeWidth="6"
                            strokeDasharray={377}
                            strokeDashoffset={377 - (377 * progressPercent) / 100}
                            strokeLinecap="square"
                        />
                    )}
                </svg>

                {/* Time Display */}
                <div className="flex flex-col items-center z-10">
                    <span
                        className={cn(
                            "text-time-xl font-bold tracking-tight",
                            isLowTime && "animate-pulse"
                        )}
                        style={{ color: timeColor }}
                    >
                        {formatTime(timeLeft)}
                    </span>
                    {isComplete && (
                        <span
                            className="text-label-xs font-bold uppercase"
                            style={{ color: 'var(--color-green-500)' }}
                        >
                            Done
                        </span>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-2">
                <button
                    onClick={toggleTimer}
                    className={cn(
                        "flex items-center justify-center w-12 h-12 transition-all border-2",
                        isActive
                            ? "border-[var(--color-neutral-alpha-400)] bg-[var(--color-neutral-alpha-200)]"
                            : "border-[var(--border-card)] bg-[var(--surface-cta-primary)]"
                    )}
                    style={{ color: isActive ? 'var(--text-paragraph)' : 'var(--text-cta)' }}
                >
                    {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                <button
                    onClick={resetTimer}
                    className="flex items-center justify-center w-10 h-10 border border-[var(--color-neutral-alpha-300)] bg-[var(--color-neutral-alpha-100)] transition-colors hover:bg-[var(--color-neutral-alpha-200)]"
                    style={{ color: 'var(--text-paragraph)' }}
                >
                    <RefreshCw size={18} />
                </button>
            </div>
            </div>
        </Card>
    );
};
