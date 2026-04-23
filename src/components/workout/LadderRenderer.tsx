import { WorkoutSection } from "@/types/workout";
import { ActiveExerciseCard } from "./ActiveExerciseCard";
import { LadderRungs } from "./LadderRungs";
import { Card } from "../Card";

interface LadderRendererProps {
    section: WorkoutSection;
    rungs: number[];
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
}

/** Renders a non-timed ladder section with rung display and exercises */
export const LadderRenderer = ({
    section,
    rungs,
    onLog,
}: LadderRendererProps) => {
    const exerciseCount = section.exercises.length;

    return (
        <Card cornerSize="md" padding="none">
            <div style={{ padding: 'var(--spacing-300) var(--spacing-400) var(--spacing-200)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-200)' }}>
                    <span
                        className="text-label-xs"
                        style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-card-label)' }}
                    >
                        {section.type.replace('_', ' ')} &bull; Ladder:
                    </span>
                </div>
                <LadderRungs rungs={rungs} mode="text" />
                {exerciseCount >= 2 && (
                    <div style={{ marginTop: 'var(--spacing-200)' }}>
                        <span
                            className="text-label-xs"
                            style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-card-label)' }}
                        >
                            Each Rung:
                        </span>
                    </div>
                )}
            </div>
            <div style={{ paddingBottom: 'var(--spacing-300)' }}>
                {section.exercises.map((exercise) => (
                    <ActiveExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onLog={onLog}
                        sectionType={section.type}
                        bare
                        hideReps
                        defaultExpanded={section.exercises.length === 1}
                    />
                ))}
            </div>
        </Card>
    );
};
