import { ExerciseStructure, Exercise } from "@/types/workout";
import { ActiveExerciseCard } from "./ActiveExerciseCard";
import { Card } from "../Card";

interface StructureCardProps {
    exercises: Exercise[];
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    onComplete: (id: string, completed: boolean) => void;
    completedIds: Set<string>;
    structure: ExerciseStructure; // Context for the group
}

export const SupersetCard = ({ exercises, onLog, onComplete, completedIds }: StructureCardProps) => {
    return (
        <Card
            cornerSize="md"
            padding="none"
            surfaceColor="transparent"
            borderColor="var(--border-card)"
            accentColor="var(--surface-card-accent)"
        >
            <div className="p-1">
                {/* Superset label */}
                <div className="px-3 py-1.5">
                    <span
                        className="text-label-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--border-card)' }}
                    >
                        Superset
                    </span>
                </div>

                {/* Grouped exercises */}
                <div className="space-y-1">
                    {exercises.map((exercise) => (
                        <ActiveExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onLog={onLog}
                            onComplete={onComplete}
                            isCompleted={completedIds.has(exercise.id)}
                        />
                    ))}
                </div>
            </div>
        </Card>
    );
};

export const CircuitCard = ({ exercises, onLog, onComplete, completedIds, structure }: StructureCardProps) => {
    const rounds = 'rounds' in structure ? structure.rounds : undefined;

    return (
        <Card
            cornerSize="md"
            padding="none"
            surfaceColor="transparent"
            borderColor="var(--border-card)"
            accentColor="var(--surface-card-accent)"
        >
            <div className="p-1">
                {/* Circuit header */}
                <div className="px-3 py-1.5 flex items-center justify-between">
                    <span
                        className="text-label-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--border-card)' }}
                    >
                        {rounds ? `Circuit · ${rounds} Rounds` : 'Circuit'}
                    </span>
                </div>

                {/* Exercises in circuit */}
                <div className="space-y-1">
                    {exercises.map((exercise) => (
                        <ActiveExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onLog={onLog}
                            onComplete={onComplete}
                            isCompleted={completedIds.has(exercise.id)}
                        />
                    ))}
                </div>
            </div>
        </Card>
    );
};
