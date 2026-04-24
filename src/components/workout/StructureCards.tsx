import { ExerciseStructure, Exercise, ExerciseSetData } from "@/types/workout";
import { ActiveExerciseCard } from "./ActiveExerciseCard";
import { Card } from "../Card";

interface StructureCardProps {
    exercises: Exercise[];
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    onSetLog?: (id: string, data: ExerciseSetData) => void;
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

export const SupersetCard = ({ exercises, onLog, onSetLog, sectionType }: StructureCardProps) => {
    // Get the shared rest from the last exercise
    const lastExercise = exercises[exercises.length - 1];
    const pairRest = hasRest(lastExercise?.rest) ? lastExercise.rest : null;

    return (
        <Card
            cornerSize="md"
            padding="none"
        >
            <div style={{ padding: 'var(--spacing-300) var(--spacing-400) var(--spacing-100)' }}>
                <span
                    className="text-label-xs"
                    style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-card-label)' }}
                >
                    {sectionType ? `${sectionType.replace('_', ' ')} \u2022 Superset` : 'Superset'}
                </span>
            </div>
            {/* Vertical connector + exercises */}
            <div style={{ display: 'flex', marginLeft: 'var(--spacing-400)' }}>
                {/* Connector line — trimmed to align with exercise text */}
                <div
                    style={{ width: '2px', margin: 'var(--spacing-300) 0', flexShrink: 0, backgroundColor: 'var(--text-header)' }}
                />
                <div style={{ paddingLeft: 'var(--spacing-200)', flex: 1, minWidth: 0, paddingBottom: 'var(--spacing-300)' }}>
                    {exercises.map((exercise, i) => (
                        <ActiveExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onLog={onLog}
                            onSetLog={onSetLog}
                            sectionType={sectionType}
                            bare
                            pairLabel={`A${i + 1}`}
                        />
                    ))}
                </div>
            </div>
            {/* Consolidated rest after pair */}
            {pairRest && (
                <div style={{ padding: 'var(--spacing-100) var(--spacing-400) var(--spacing-300)' }}>
                    <span
                        className="text-label-xs"
                        style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-paragraph)' }}
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
            <div style={{ padding: 'var(--spacing-300) var(--spacing-400) var(--spacing-100)' }}>
                <span
                    className="text-label-xs"
                    style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-card-label)' }}
                >
                    {sectionType
                        ? `${sectionType.replace('_', ' ')} \u2022 ${rounds ? `Circuit \u2022 ${rounds} Rounds` : 'Circuit'}`
                        : rounds ? `Circuit \u2022 ${rounds} Rounds` : 'Circuit'}
                </span>
            </div>

            {/* EACH ROUND label */}
            {exercises.length >= 2 && (
                <div style={{ padding: '0 var(--spacing-400)', marginTop: 'var(--spacing-100)', marginBottom: 'calc(-1 * var(--spacing-100))' }}>
                    <span
                        className="text-label-xs"
                        style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-card-label)' }}
                    >
                        Each Round:
                    </span>
                </div>
            )}

            <div style={{ paddingBottom: 'var(--spacing-300)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-100)' }}>
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
                <div style={{ padding: 'var(--spacing-100) var(--spacing-400) var(--spacing-300)' }}>
                    <span
                        className="text-label-xs"
                        style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-paragraph)' }}
                    >
                        {roundRest} rest between rounds
                    </span>
                </div>
            )}
        </Card>
    );
};
