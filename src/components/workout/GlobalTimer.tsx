import { useEffect, useState } from "react";

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

    // Chamfered bottom-right corner clip paths
    // Outer = border layer, inner = fill layer (inset 2px for border width)
    const outerClip = 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)';
    const innerClip = 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)';

    return (
        <div className="sticky top-0 z-10 flex items-center justify-center px-5 py-3 backdrop-blur-md bg-background/80">
            {/* Timer pill with chamfered corner */}
            <div
                className="relative"
                style={{
                    clipPath: outerClip,
                    background: 'var(--border-radio-select)',
                }}
            >
                <div
                    className="bg-[var(--surface-radio-selected)]"
                    style={{
                        margin: '2px',
                        clipPath: innerClip,
                    }}
                >
                    <span
                        className="block px-5 text-heading-h4 font-bold text-center"
                        style={{ color: 'var(--text-radio-text-select)' }}
                    >
                        {formatTime(elapsedSeconds)}
                    </span>
                </div>
            </div>
        </div>
    );
};
