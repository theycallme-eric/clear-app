import { WorkoutSection, Exercise } from "@/types/workout";
import { ActiveExerciseCard } from "./ActiveExerciseCard";
import { SupersetCard, CircuitCard } from "./StructureCards";
import { SectionTimer } from "./SectionTimer";

interface SectionRendererProps {
    section: WorkoutSection;
    completedExercises: Set<string>;
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    onComplete: (id: string, completed: boolean) => void;
    sectionStartedAt?: number; // timestamp
}

export const SectionRenderer = ({
    section,
    completedExercises,
    onLog,
    onComplete,
    sectionStartedAt
}: SectionRendererProps) => {

    // Helper to group exercises
    const groupExercises = (exercises: Exercise[]) => {
        const groups: (Exercise | { type: 'superset' | 'circuit'; exercises: Exercise[]; structure: any })[] = [];

        let i = 0;
        while (i < exercises.length) {
            const ex = exercises[i];
            const structure = ex.structure || { type: 'standard' };

            if (structure.type === 'superset') {
                const supersetGroup = [ex];
                // Look ahead for paired exercise (simple adjacency check for now)
                if (i + 1 < exercises.length) {
                    const next = exercises[i + 1];
                    const nextStruct = next.structure;

                    if (nextStruct?.type === 'superset' && nextStruct.paired_with === ex.id) {
                        supersetGroup.push(next);
                        i++;
                    } else if (structure.paired_with === next.id) {
                        supersetGroup.push(next);
                        i++;
                    }
                }
                groups.push({ type: 'superset', exercises: supersetGroup, structure });
            } else if (structure.type === 'circuit') {
                const circuitId = structure.circuit_id;
                const circuitGroup = [ex];
                // Collect all subsequent exercises with same circuitId
                let j = i + 1;
                while (j < exercises.length) {
                    const nextAndStruct = exercises[j].structure;
                    if (nextAndStruct?.type === 'circuit' && nextAndStruct.circuit_id === circuitId) {
                        circuitGroup.push(exercises[j]);
                        j++;
                    } else {
                        break;
                    }
                }
                groups.push({ type: 'circuit', exercises: circuitGroup, structure });
                i = j - 1; // Advance main cursor
            } else {
                groups.push(ex);
            }
            i++;
        }
        return groups;
    };

    const groups = groupExercises(section.exercises);

    // Determine timer mode based on grouping or specific section type?
    // Actually section-level timer (AMRAP/EMOM) logic should be here or above.
    // The structure applies to exercises. If it's a 'circuit', 'emom', 'amrap', 'for_time'
    // usually ALL exercises in the section share that structure type (or at least the first one defines the section vibe).
    // For AMRAP/EMOM/For Time, the structure is usually defined on the exercises.

    const firstStructure = section.exercises[0]?.structure;
    const isTimedSection = ['emom', 'amrap', 'for_time'].includes(firstStructure?.type || '');

    const timerMode = firstStructure?.type === 'for_time' ? 'countup' : 'countdown';
    const initialSeconds = (firstStructure?.type === 'emom' || firstStructure?.type === 'amrap')
        ? (firstStructure.minutes || 0) * 60
        : (firstStructure?.type === 'for_time' ? (firstStructure.time_cap_mins || 0) * 60 : 0);

    return (
        <div className="space-y-6">
            {/* Section Timer (for conditioning/timed sections) */}
            {isTimedSection && (
                <SectionTimer
                    mode={timerMode}
                    initialSeconds={initialSeconds}
                    autoStart={true}
                    label={firstStructure?.type?.replace('_', ' ')}
                    className="mb-4"
                />
            )}

            {groups.map((item, idx) => {
                if ('type' in item && (item.type === 'superset' || item.type === 'circuit')) {
                    if (item.type === 'superset') {
                        return (
                            <SupersetCard
                                key={`group-${idx}`}
                                exercises={item.exercises}
                                onLog={onLog}
                                onComplete={onComplete}
                                completedIds={completedExercises}
                                structure={item.structure}
                            />
                        );
                    } else {
                        return (
                            <CircuitCard
                                key={`group-${idx}`}
                                exercises={item.exercises}
                                onLog={onLog}
                                onComplete={onComplete}
                                completedIds={completedExercises}
                                structure={item.structure}
                            />
                        );
                    }
                } else {
                    // Standard single exercise
                    const ex = item as Exercise;
                    return (
                        <ActiveExerciseCard
                            key={ex.id}
                            exercise={ex}
                            onLog={onLog}
                            onComplete={onComplete}
                            isCompleted={completedExercises.has(ex.id)}
                        />
                    );
                }
            })}
        </div>
    );
};
