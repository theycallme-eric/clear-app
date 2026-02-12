import { ExerciseStructure, Exercise, SectionType } from "@/types/workout";
import { ActiveExerciseCard } from "./ActiveExerciseCard";
import { Card } from "../Card";

interface StructureCardProps {
    exercises: Exercise[];
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    onComplete: (id: string, completed: boolean) => void;
    completedIds: Set<string>;
    structure: ExerciseStructure;
    sectionType?: SectionType;
}

/**
 * SupersetCard - Displays paired exercises as a superset group.
 *
 * Figma design: Shows "SUPER SET" label at top with exercises listed below,
 * wrapped in a single card container.
 */
export const SupersetCard = ({
    exercises,
    onLog,
    onComplete,
    completedIds,
    sectionType
}: StructureCardProps) => {
    return (
        <Card
            padding="md"
            cornerSize="md"
            surfaceColor="var(--color-orange-alpha-050)"
            className="overflow-hidden"
        >
            {/* Superset Label */}
            <div className="mb-3">
                <span
                    className="text-label-xs uppercase tracking-wider"
                    style={{ color: "var(--color-orange-300)" }}
                >
                    {sectionType ? sectionType.toUpperCase() : "ACCESSORY"}
                </span>
            </div>

            {/* Superset Header */}
            <h3
                className="text-heading-h5 font-bold uppercase mb-3"
                style={{ color: "var(--text-header)" }}
            >
                Super Set
            </h3>

            {/* Exercise list within superset */}
            <div className="space-y-3">
                {exercises.map((exercise, index) => {
                    const isCompleted = completedIds.has(exercise.id);

                    // Build metadata
                    const metadataParts: string[] = [];
                    if (exercise.equipment) {
                        metadataParts.push(exercise.equipment.toLowerCase().replace(/_/g, " "));
                    }
                    if (exercise.sets && exercise.reps) {
                        metadataParts.push(`${exercise.sets} x ${exercise.reps}`);
                    } else if (exercise.reps) {
                        metadataParts.push(exercise.reps);
                    }

                    return (
                        <div
                            key={exercise.id}
                            className="flex items-start gap-3"
                            style={{
                                opacity: isCompleted ? 0.6 : 1
                            }}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => onComplete(exercise.id, !isCompleted)}
                                className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0"
                                style={{
                                    borderColor: isCompleted
                                        ? "var(--color-green-500)"
                                        : "var(--color-orange-alpha-400)",
                                    backgroundColor: isCompleted
                                        ? "var(--color-green-alpha-200)"
                                        : "transparent"
                                }}
                            >
                                {isCompleted && (
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        style={{ color: "var(--color-green-500)" }}
                                    >
                                        <path
                                            d="M2 6L5 9L10 3"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </button>

                            {/* Exercise info */}
                            <div className="flex-1">
                                <p
                                    className="text-paragraph-md"
                                    style={{
                                        color: "var(--color-blue-300)",
                                        textDecoration: isCompleted ? "line-through" : "none"
                                    }}
                                >
                                    {exercise.name.toLowerCase()} • {metadataParts.join(" • ")}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

/**
 * CircuitCard - Displays a circuit of exercises with round tracking.
 *
 * Figma design: Shows "CIRCUIT: X ROUNDS" header with exercise list.
 */
export const CircuitCard = ({
    exercises,
    onLog,
    onComplete,
    completedIds,
    structure,
    sectionType
}: StructureCardProps) => {
    const rounds = 'rounds' in structure ? structure.rounds : undefined;

    return (
        <Card
            padding="md"
            cornerSize="md"
            surfaceColor="var(--color-orange-alpha-050)"
            className="overflow-hidden"
        >
            {/* Section Label */}
            <div className="mb-3">
                <span
                    className="text-label-xs uppercase tracking-wider"
                    style={{ color: "var(--color-orange-300)" }}
                >
                    {sectionType ? sectionType.toUpperCase() : "CONDITIONING"}
                </span>
            </div>

            {/* Circuit Header */}
            <h3
                className="text-heading-h5 font-bold uppercase mb-4"
                style={{ color: "var(--text-header)" }}
            >
                Circuit: {rounds ? `${rounds} Rounds` : "Complete All"}
            </h3>

            {/* Exercise list */}
            <div className="space-y-3">
                {exercises.map((exercise) => {
                    const isCompleted = completedIds.has(exercise.id);

                    return (
                        <div
                            key={exercise.id}
                            className="flex items-start gap-3"
                            style={{
                                opacity: isCompleted ? 0.6 : 1
                            }}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => onComplete(exercise.id, !isCompleted)}
                                className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0"
                                style={{
                                    borderColor: isCompleted
                                        ? "var(--color-green-500)"
                                        : "var(--color-orange-alpha-400)",
                                    backgroundColor: isCompleted
                                        ? "var(--color-green-alpha-200)"
                                        : "transparent"
                                }}
                            >
                                {isCompleted && (
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        style={{ color: "var(--color-green-500)" }}
                                    >
                                        <path
                                            d="M2 6L5 9L10 3"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </button>

                            {/* Exercise info */}
                            <div className="flex-1">
                                <p
                                    className="text-paragraph-md"
                                    style={{
                                        color: "var(--color-blue-300)",
                                        textDecoration: isCompleted ? "line-through" : "none"
                                    }}
                                >
                                    {exercise.name.toLowerCase()} • {exercise.reps}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
