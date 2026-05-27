import { Exercise, ExerciseSetData } from "@/types/workout";
import { SupersetCard } from "./StructureCards";

interface SupersetRendererProps {
    exercises: Exercise[];
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    onSetLog?: (id: string, data: ExerciseSetData) => void;
    onRestStart?: (restSeconds: number) => void;
    sectionType: string;
    structure: NonNullable<Exercise['structure']>;
}

/** Renders a superset group by delegating to SupersetCard */
export const SupersetRenderer = ({
    exercises,
    onLog,
    onSetLog,
    onRestStart,
    sectionType,
    structure,
}: SupersetRendererProps) => {
    return (
        <SupersetCard
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
