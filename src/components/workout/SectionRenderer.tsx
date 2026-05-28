import { WorkoutSection, Exercise, ExerciseSetData } from "@/types/workout";
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
    /** Called with per-set data for exercises that use set-by-set logging */
    onSetLog?: (id: string, data: ExerciseSetData) => void;
    /** Called when user taps Rest button — triggers rest timer */
    onRestStart?: (restSeconds: number) => void;
    /** Called when a timed section completes with structure-level result data */
    onStructureResult?: (sectionId: string, data: StructureResultData) => void;
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
            const groupId = 'group_id' in structure ? structure.group_id : undefined;
            const supersetGroup = [ex];
            // Collect all subsequent exercises with the same superset group_id
            let j = i + 1;
            while (j < exercises.length) {
                const nextStruct = exercises[j].structure;
                if (nextStruct?.type === 'superset') {
                    const nextGroupId = 'group_id' in nextStruct ? nextStruct.group_id : undefined;
                    if (groupId && nextGroupId === groupId) {
                        supersetGroup.push(exercises[j]);
                        j++;
                        continue;
                    }
                }
                break;
            }
            i = j - 1;
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
    onSetLog,
    onRestStart,
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
                <div style={{ padding: 'var(--spacing-300) var(--spacing-400) var(--spacing-200)' }}>
                    <span
                        className="text-label-xs"
                        style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-card-label)' }}
                    >
                        {section.type.replace('_', ' ')}
                    </span>
                </div>
                <div style={{ paddingBottom: 'var(--spacing-300)' }}>
                    {section.exercises.map((exercise, i) => (
                        <div key={exercise.id}>
                            {i > 0 && (
                                <div style={{ margin: 'var(--spacing-100) var(--spacing-400)', borderTop: '2px solid var(--border-spacer)' }} />
                            )}
                            <ActiveExerciseCard
                                exercise={exercise}
                                onLog={onLog}
                                onSetLog={onSetLog}
                                onRestStart={onRestStart}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-400)' }}>
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
                                    onSetLog={onSetLog}
                                    onRestStart={onRestStart}
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
                                    onSetLog={onSetLog}
                                    onRestStart={onRestStart}
                                    sectionType={section.type}
                                    structure={group.structure}
                                />
                            );
                        }
                    })}

                    {/* Standalone exercises wrapped in a section card */}
                    {standaloneExercises.length > 0 && (
                        <Card cornerSize="md" padding="none">
                            <div style={{ padding: 'var(--spacing-300) var(--spacing-400) var(--spacing-100)' }}>
                                <span
                                    className="text-label-xs"
                                    style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-card-label)' }}
                                >
                                    {section.type.replace('_', ' ')}
                                </span>
                            </div>
                            <div style={{ paddingBottom: 'var(--spacing-300)' }}>
                                {standaloneExercises.map((ex, i) => (
                                    <div key={ex.id}>
                                        {i > 0 && (
                                            <div style={{ margin: '0 var(--spacing-400)', borderTop: '2px solid var(--border-spacer)' }} />
                                        )}
                                        <ActiveExerciseCard
                                            exercise={ex}
                                            onLog={onLog}
                                            onSetLog={onSetLog}
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
