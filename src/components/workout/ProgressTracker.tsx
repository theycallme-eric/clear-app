import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
    /** Progress value 0-100 */
    progress: number;
    className?: string;
}

/**
 * ProgressTracker - Section progress bar styled like the intensity slider.
 * Orange border, dark track, filled portion.
 */
export function ProgressTracker({ progress, className }: ProgressTrackerProps) {
    const clamped = Math.min(100, Math.max(0, progress));

    return (
        <div
            className={cn("w-full", className)}
            style={{
                height: '10px',
                border: '2px solid var(--border-slider)',
                padding: '1px',
            }}
        >
            <div
                className="h-full transition-all duration-300"
                style={{
                    width: `${clamped}%`,
                    background: 'var(--surface-slider-active)',
                }}
            />
        </div>
    );
}
