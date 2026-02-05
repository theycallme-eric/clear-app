import { useEffect, useState } from "react";
import { Play, Pause, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

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

    return (
        <div className={cn("flex flex-col items-center gap-3 p-4 glass-card rounded-xl", className)}>
            {label && <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>}

            <div className="relative flex items-center justify-center w-32 h-32">
                {/* Progress Ring Background */}
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="60"
                        className="stroke-muted/20 fill-none"
                        strokeWidth="6"
                    />
                    {mode === 'countdown' && (
                        <circle
                            cx="64"
                            cy="64"
                            r="60"
                            className="stroke-clear-orange fill-none transition-all duration-1000 ease-linear"
                            strokeWidth="6"
                            strokeDasharray={377}
                            strokeDashoffset={377 - (377 * progressPercent) / 100}
                            strokeLinecap="round"
                        />
                    )}
                </svg>

                {/* Time Display */}
                <div className="flex flex-col items-center z-10">
                    <span className={cn("text-4xl font-mono font-bold tracking-tight title-text",
                        timeLeft <= 10 && mode === 'countdown' && isActive ? "text-destructive animate-pulse" : ""
                    )}>
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-2">
                <button
                    onClick={toggleTimer}
                    className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full transition-all",
                        isActive
                            ? "bg-secondary text-foreground hover:bg-secondary/80"
                            : "bg-clear-orange text-white hover:bg-clear-orange/90 shadow-lg shadow-clear-orange/20"
                    )}
                >
                    {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                <button
                    onClick={resetTimer}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                    <RefreshCw size={18} />
                </button>
            </div>
        </div>
    );
};
