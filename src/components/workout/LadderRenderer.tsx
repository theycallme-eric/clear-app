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
            <div className="px-4 pt-3 pb-2 space-y-2">
                <div className="flex items-baseline gap-2">
                    <span
                        className="text-label-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--text-card-label)' }}
                    >
                        {section.type.replace('_', ' ')} &bull; Ladder:
                    </span>
                </div>
                <LadderRungs rungs={rungs} mode="text" />
                {exerciseCount >= 2 && (
                    <div className="mt-2">
                        <span
                            className="text-label-xs font-bold uppercase tracking-widest"
                            style={{ color: 'var(--text-card-label)' }}
                        >
                            Each Rung:
                        </span>
                    </div>
                )}
            </div>
            <div className="pb-3">
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
