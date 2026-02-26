import { ExerciseStructure, Exercise } from "@/types/workout";
import { ActiveExerciseCard } from "./ActiveExerciseCard";
import { Card } from "../Card";

interface StructureCardProps {
    exercises: Exercise[];
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    sectionType?: string;
    sectionName?: string;
    structure: ExerciseStructure;
}

/** Check if a rest value is meaningful (non-zero, non-empty) */
const hasRest = (rest?: string): boolean => {
    if (!rest) return false;
    const cleaned = rest.toLowerCase().replace(/\s/g, '');
    return cleaned !== '0s' && cleaned !== '0' && cleaned !== '';
};

export const SupersetCard = ({ exercises, onLog, sectionType }: StructureCardProps) => {
    // Get the shared rest from the last exercise
    const lastExercise = exercises[exercises.length - 1];
    const pairRest = hasRest(lastExercise?.rest) ? lastExercise.rest : null;

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
                    {sectionType ? `${sectionType.replace('_', ' ')} \u2022 Superset` : 'Superset'}
                </span>
            </div>
            {/* Vertical connector + exercises */}
            <div className="flex ml-4">
                {/* Connector line — trimmed to align with exercise text */}
                <div
                    className="w-0.5 my-3 shrink-0"
                    style={{ backgroundColor: 'var(--text-header)' }}
                />
                <div className="pl-2 flex-1 min-w-0 pb-3">
                    {exercises.map((exercise, i) => (
                        <ActiveExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onLog={onLog}
                            sectionType={sectionType}
                            bare
                            pairLabel={`A${i + 1}`}
                        />
                    ))}
                </div>
            </div>
            {/* Consolidated rest after pair */}
            {pairRest && (
                <div className="px-4 pb-3 pt-1">
                    <span
                        className="text-label-xs uppercase tracking-widest"
                        style={{ color: 'var(--text-paragraph)' }}
                    >
                        Rest: {pairRest} after both
                    </span>
                </div>
            )}
        </Card>
    );
};

export const CircuitCard = ({ exercises, onLog, sectionType, structure }: StructureCardProps) => {
    const rounds = 'rounds' in structure ? structure.rounds : undefined;

    // Get round rest from the last exercise
    const lastExercise = exercises[exercises.length - 1];
    const roundRest = hasRest(lastExercise?.rest) ? lastExercise.rest : null;

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
                    {sectionType
                        ? `${sectionType.replace('_', ' ')} \u2022 ${rounds ? `Circuit \u2022 ${rounds} Rounds` : 'Circuit'}`
                        : rounds ? `Circuit \u2022 ${rounds} Rounds` : 'Circuit'}
                </span>
            </div>

            {/* EACH ROUND label */}
            {exercises.length >= 2 && (
                <div className="px-4 mt-1 -mb-1">
                    <span
                        className="text-label-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--text-card-label)' }}
                    >
                        Each Round:
                    </span>
                </div>
            )}

            <div className="pb-3 space-y-1">
                {exercises.map((exercise, i) => (
                    <ActiveExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onLog={onLog}
                        sectionType={sectionType}
                        bare
                        pairLabel={`${i + 1}.`}
                    />
                ))}
            </div>

            {/* Consolidated round rest */}
            {roundRest && (
                <div className="px-4 pb-3 pt-1">
                    <span
                        className="text-label-xs uppercase tracking-widest"
                        style={{ color: 'var(--text-paragraph)' }}
                    >
                        {roundRest} rest between rounds
                    </span>
                </div>
            )}
        </Card>
    );
};
