import { Exercise } from "@/types/workout";
import { SupersetCard } from "./StructureCards";

interface SupersetRendererProps {
    exercises: Exercise[];
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    sectionType: string;
    structure: NonNullable<Exercise['structure']>;
}

/** Renders a superset group by delegating to SupersetCard */
export const SupersetRenderer = ({
    exercises,
    onLog,
    sectionType,
    structure,
}: SupersetRendererProps) => {
    return (
        <SupersetCard
            exercises={exercises}
            onLog={onLog}
            sectionType={sectionType}
            sectionName={sectionType.replace('_', ' ')}
            structure={structure}
        />
    );
};
