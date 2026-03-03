import { useEffect, useState } from "react";
import { ChamferedFrame } from "@/components/ChamferedFrame";

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
        <div className="sticky top-0 z-10 flex items-center justify-center px-5 py-3 backdrop-blur-md" style={{ backgroundColor: 'rgba(23, 23, 23, 0.8)' }}>
            <ChamferedFrame
                cornerSize="sm"
                surfaceColor="var(--surface-timer)"
                borderColor="var(--border-timer)"
                hasLeftBorder={true}
            >
                <span
                    className="block px-5 py-1 text-time-lg font-bold text-center"
                    style={{ color: 'var(--text-timer)' }}
                >
                    {formatTime(elapsedSeconds)}
                </span>
            </ChamferedFrame>
        </div>
    );
};
