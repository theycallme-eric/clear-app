import { WorkoutSection, Exercise } from "@/types/workout";
import { ActiveExerciseCard } from "./ActiveExerciseCard";
import { isLadderReps, parseRungs } from "./LadderRungs";
import { Card } from "../Card";
import { TimedRenderer } from "./TimedRenderer";
import { SupersetRenderer } from "./SupersetRenderer";
import { CircuitRenderer } from "./CircuitRenderer";
import { LadderRenderer } from "./LadderRenderer";

export interface StructureResultData {
    structure_type: string;
    rounds_completed?: number;
    completion_time_seconds?: number;
    completed_under_cap?: boolean;
    rep_scheme?: string;
    highest_rung?: number | null;
    notes?: string | null;
}

interface SectionRendererProps {
    section: WorkoutSection;
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    /** Called when a timed section completes with structure-level result data */
    onStructureResult?: (sectionName: string, data: StructureResultData) => void;
}

const TIMED_TYPES = ['emom', 'amrap', 'for_time'];
const WRAP_ALL_SECTIONS = ['warmup', 'cooldown', 'mobility'];

/** Group exercises into superset/circuit clusters or standalone exercises */
function groupExercises(exercises: Exercise[]) {
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
}

export const SectionRenderer = ({
    section,
    onLog,
    onStructureResult,
}: SectionRendererProps) => {

    const firstStructure = section.exercises[0]?.structure;
    const isTimedSection = TIMED_TYPES.includes(firstStructure?.type || '');

    // Timed sections: EMOM, AMRAP, For Time (including timed ladders)
    if (isTimedSection) {
        return (
            <TimedRenderer
                section={section}
                firstStructure={firstStructure!}
                onLog={onLog}
                onStructureResult={onStructureResult}
            />
        );
    }

    // Ladder detection for non-timed sections
    const firstReps = section.exercises[0]?.reps || '';
    const sectionHasLadder = isLadderReps(firstReps);
    const sectionRungs = sectionHasLadder ? parseRungs(firstReps) : [];

    // Warmup/Mobility/Cooldown: all exercises in one card
    const wrapAll = WRAP_ALL_SECTIONS.includes(section.type);

    if (wrapAll) {
        return (
            <Card cornerSize="md" padding="none">
                <div className="px-4 pt-3 pb-2">
                    <span
                        className="text-label-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--text-card-label)' }}
                    >
                        {section.type.replace('_', ' ')}
                    </span>
                </div>
                <div className="pb-3">
                    {section.exercises.map((exercise, i) => (
                        <div key={exercise.id}>
                            {i > 0 && (
                                <div className="mx-4 my-1" style={{ borderTop: '2px solid var(--border-spacer)' }} />
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

    // Group exercises for structure detection
    const groups = groupExercises(section.exercises);

    // Non-timed sections: standard layout with section labels
    const standaloneExercises = groups.filter(item => !('type' in item) || (item.type !== 'superset' && item.type !== 'circuit')) as Exercise[];
    const structureGroups = groups.filter(item => 'type' in item && (item.type === 'superset' || item.type === 'circuit'));

    return (
        <div className="space-y-4">
            {/* Non-timed ladder section */}
            {sectionHasLadder && (
                <LadderRenderer
                    section={section}
                    rungs={sectionRungs}
                    onLog={onLog}
                />
            )}

            {/* Non-ladder content */}
            {!sectionHasLadder && (
                <>
                    {/* Structure groups (superset, circuit) with section prefix */}
                    {structureGroups.map((item, idx) => {
                        const group = item as { type: 'superset' | 'circuit'; exercises: Exercise[]; structure: any };
                        if (group.type === 'superset') {
                            return (
                                <SupersetRenderer
                                    key={`group-${idx}`}
                                    exercises={group.exercises}
                                    onLog={onLog}
                                    sectionType={section.type}
                                    structure={group.structure}
                                />
                            );
                        } else {
                            return (
                                <CircuitRenderer
                                    key={`group-${idx}`}
                                    exercises={group.exercises}
                                    onLog={onLog}
                                    sectionType={section.type}
                                    structure={group.structure}
                                />
                            );
                        }
                    })}

                    {/* Standalone exercises wrapped in a section card */}
                    {standaloneExercises.length > 0 && (
                        <Card cornerSize="md" padding="none">
                            <div className="px-4 pt-3 pb-1">
                                <span
                                    className="text-label-xs font-bold uppercase tracking-widest"
                                    style={{ color: 'var(--text-card-label)' }}
                                >
                                    {section.type.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="pb-3">
                                {standaloneExercises.map((ex, i) => (
                                    <div key={ex.id}>
                                        {i > 0 && (
                                            <div className="mx-4" style={{ borderTop: '2px solid var(--border-spacer)' }} />
                                        )}
                                        <ActiveExerciseCard
                                            exercise={ex}
                                            onLog={onLog}
                                            sectionType={section.type}
                                            bare
                                            defaultExpanded={standaloneExercises.length === 1}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};
