import { Exercise } from "@/types/workout";
import { CircuitCard } from "./StructureCards";

interface CircuitRendererProps {
    exercises: Exercise[];
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    sectionType: string;
    structure: NonNullable<Exercise['structure']>;
}

/** Renders a circuit group by delegating to CircuitCard */
export const CircuitRenderer = ({
    exercises,
    onLog,
    sectionType,
    structure,
}: CircuitRendererProps) => {
    return (
        <CircuitCard
            exercises={exercises}
            onLog={onLog}
            sectionType={sectionType}
            sectionName={sectionType.replace('_', ' ')}
            structure={structure}
        />
    );
};
