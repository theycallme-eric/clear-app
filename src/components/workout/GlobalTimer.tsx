import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface GlobalTimerProps {
    isRunning: boolean;
    onTimeUpdate?: (seconds: number) => void;
    startTime?: number; // timestamp
}

export const GlobalTimer = ({ isRunning, onTimeUpdate, startTime }: GlobalTimerProps) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning) {
            // If we have a startTime, calculate elapsed from that to handle background/tab switching
            // Otherwise fallback to incremental (less accurate)
            const start = startTime || Date.now() - (elapsedSeconds * 1000);

            interval = setInterval(() => {
                const now = Date.now();
                const seconds = Math.floor((now - start) / 1000);
                setElapsedSeconds(seconds);
                onTimeUpdate?.(seconds);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning, startTime, onTimeUpdate]);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="sticky top-0 z-10 flex items-center justify-center gap-2 py-2 mb-4 backdrop-blur-md bg-background/80 border-b border-border/50 transition-all duration-300">
            <Clock size={16} className="text-clear-orange animate-pulse" />
            <span className="font-mono text-xl font-bold tracking-widest text-foreground">
                {formatTime(elapsedSeconds)}
            </span>
        </div>
    );
};
