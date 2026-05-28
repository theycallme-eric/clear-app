import { Exercise, ExerciseSetData } from "@/types/workout";
import { CircuitCard } from "./StructureCards";

interface CircuitRendererProps {
    exercises: Exercise[];
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    onSetLog?: (id: string, data: ExerciseSetData) => void;
    onRestStart?: (restSeconds: number) => void;
    sectionType: string;
    structure: NonNullable<Exercise['structure']>;
}

/** Renders a circuit group by delegating to CircuitCard */
export const CircuitRenderer = ({
    exercises,
    onLog,
    onSetLog,
    onRestStart,
    sectionType,
    structure,
}: CircuitRendererProps) => {
    return (
        <CircuitCard
            exercises={exercises}
            onLog={onLog}
            onSetLog={onSetLog}
            onRestStart={onRestStart}
            sectionType={sectionType}
            sectionName={sectionType.replace('_', ' ')}
            structure={structure}
        />
    );
};
