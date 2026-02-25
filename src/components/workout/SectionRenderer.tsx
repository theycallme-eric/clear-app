import { WorkoutSection, Exercise } from "@/types/workout";
import { ActiveExerciseCard } from "./ActiveExerciseCard";
import { SupersetCard, CircuitCard } from "./StructureCards";
import { SectionTimer } from "./SectionTimer";
import { Card } from "../Card";

interface SectionRendererProps {
    section: WorkoutSection;
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    sectionStartedAt?: number;
}

const TIMED_TYPES = ['emom', 'amrap', 'for_time'];

export const SectionRenderer = ({
    section,
    onLog,
}: SectionRendererProps) => {

    const groupExercises = (exercises: Exercise[]) => {
        const groups: (Exercise | { type: 'superset' | 'circuit'; exercises: Exercise[]; structure: any })[] = [];

        let i = 0;
        while (i < exercises.length) {
            const ex = exercises[i];
            const structure = ex.structure || { type: 'standard' };

            if (structure.type === 'superset') {
                const supersetGroup = [ex];
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
                i = j - 1;
            } else {
                groups.push(ex);
            }
            i++;
        }
        return groups;
    };

    const groups = groupExercises(section.exercises);

    const firstStructure = section.exercises[0]?.structure;
    const isTimedSection = TIMED_TYPES.includes(firstStructure?.type || '');

    // Timed sections: everything in one card
    if (isTimedSection) {
        const timerMode = firstStructure?.type === 'for_time' ? 'countup' as const : 'countdown' as const;
        const initialSeconds = (firstStructure?.type === 'emom' || firstStructure?.type === 'amrap')
            ? (firstStructure.minutes || 0) * 60
            : (firstStructure?.type === 'for_time' ? (firstStructure.time_cap_mins || 0) * 60 : 0);

        const timerLabel = firstStructure?.type?.replace('_', ' ') || '';

        return (
            <Card cornerSize="md" padding="none">
                {/* Label */}
                <div className="px-4 pt-3 pb-1">
                    <span
                        className="text-label-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--text-card-label)' }}
                    >
                        {timerLabel}
                    </span>
                </div>

                {/* Timer + controls */}
                <div className="px-4 py-3">
                    <SectionTimer
                        mode={timerMode}
                        initialSeconds={initialSeconds}
                        emom={firstStructure?.type === 'emom'}
                    />
                </div>

                {/* Exercises */}
                <div>
                    {section.exercises.map((exercise, i) => (
                        <div key={exercise.id}>
                            {i > 0 && (
                                <div className="mx-4" style={{ borderTop: '2px solid var(--border-spacer)' }} />
                            )}
                            <ActiveExerciseCard
                                exercise={exercise}
                                onLog={onLog}
                                sectionType={section.type}
                                bare
                            />
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    // Non-timed sections: standard layout
    return (
        <div className="space-y-4">
            {groups.map((item, idx) => {
                if ('type' in item && (item.type === 'superset' || item.type === 'circuit')) {
                    if (item.type === 'superset') {
                        return (
                            <SupersetCard
                                key={`group-${idx}`}
                                exercises={item.exercises}
                                onLog={onLog}
                                sectionType={section.type}
                                structure={item.structure}
                            />
                        );
                    } else {
                        return (
                            <CircuitCard
                                key={`group-${idx}`}
                                exercises={item.exercises}
                                onLog={onLog}
                                sectionType={section.type}
                                structure={item.structure}
                            />
                        );
                    }
                } else {
                    const ex = item as Exercise;
                    return (
                        <ActiveExerciseCard
                            key={ex.id}
                            exercise={ex}
                            onLog={onLog}
                            sectionType={section.type}
                        />
                    );
                }
            })}
        </div>
    );
};
