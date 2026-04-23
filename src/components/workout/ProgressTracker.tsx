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
            className={className}
            style={{
                width: '100%',
                height: '10px',
                border: '2px solid var(--border-slider)',
                padding: '1px',
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${clamped}%`,
                    background: 'var(--surface-slider-active)',
                    transition: 'all 300ms',
                }}
            />
        </div>
    );
}
