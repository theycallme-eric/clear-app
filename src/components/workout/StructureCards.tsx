import { ExerciseStructure, Exercise } from "@/types/workout";
import { ActiveExerciseCard } from "./ActiveExerciseCard";
import { Card } from "../Card";

interface StructureCardProps {
    exercises: Exercise[];
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    sectionType?: string;
    structure: ExerciseStructure;
}

export const SupersetCard = ({ exercises, onLog, sectionType }: StructureCardProps) => {
    return (
        <Card
            cornerSize="md"
            padding="none"
        >
            <div className="px-4 pt-3 pb-1">
                <span
                    className="text-label-xs font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-card-label)' }}
                >
                    Superset
                </span>
            </div>
            <div>
                {exercises.map((exercise, i) => (
                    <div key={exercise.id}>
                        {i > 0 && (
                            <div className="mx-4" style={{ borderTop: '2px solid var(--border-spacer)' }} />
                        )}
                        <ActiveExerciseCard
                            exercise={exercise}
                            onLog={onLog}
                            sectionType={sectionType}
                            bare
                        />
                    </div>
                ))}
            </div>
        </Card>
    );
};

export const CircuitCard = ({ exercises, onLog, sectionType, structure }: StructureCardProps) => {
    const rounds = 'rounds' in structure ? structure.rounds : undefined;

    return (
        <Card
            cornerSize="md"
            padding="none"
        >
            <div className="px-4 pt-3 pb-1">
                <span
                    className="text-label-xs font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-card-label)' }}
                >
                    {rounds ? `Circuit · ${rounds} Rounds` : 'Circuit'}
                </span>
            </div>
            <div>
                {exercises.map((exercise, i) => (
                    <div key={exercise.id}>
                        {i > 0 && (
                            <div className="mx-4" style={{ borderTop: '2px solid var(--border-spacer)' }} />
                        )}
                        <ActiveExerciseCard
                            exercise={exercise}
                            onLog={onLog}
                            sectionType={sectionType}
                            bare
                        />
                    </div>
                ))}
            </div>
        </Card>
    );
};
