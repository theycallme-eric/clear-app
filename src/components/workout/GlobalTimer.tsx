import { useEffect, useState } from "react";
import { TimerDisplay } from "@/components/TimerDisplay";

interface GlobalTimerProps {
    isRunning: boolean;
    onTimeUpdate?: (seconds: number) => void;
    startTime?: number;
}

export const GlobalTimer = ({ isRunning, onTimeUpdate, startTime }: GlobalTimerProps) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning) {
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

    return (
        <div
            className="scanlines"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-300) var(--spacing-500)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                backgroundColor: 'color-mix(in srgb, var(--background) 80%, transparent)',
            }}
        >
            <TimerDisplay elapsedSeconds={elapsedSeconds} />
        </div>
    );
};
