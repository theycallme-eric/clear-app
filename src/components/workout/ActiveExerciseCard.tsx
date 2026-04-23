import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "@/components/icons";
import { Exercise } from "@/types/workout";
import { Card } from "../Card";
import { Input } from "../ui/input";
import { ExerciseNotes } from "./ExerciseNotes";

interface ActiveExerciseCardProps {
    exercise: Exercise;
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    /** Section type — hides weight/reps for warmup, cooldown, mobility */
    sectionType?: string;
    /** Render without Card wrapper (for use inside structure cards like Superset/Circuit) */
    bare?: boolean;
    /** EMOM: 'active' highlights this exercise, 'inactive' dims it */
    emomState?: 'active' | 'inactive';
    /** EMOM minute assignment label (e.g. "ODD MIN", "EVEN MIN") */
    minuteLabel?: string | null;
    /** Pair/sequence label shown before exercise name (e.g. "A1", "A2", "1.", "2.") */
    pairLabel?: string | null;
    /** Hide reps from summary line (ladder sections show reps once at section level) */
    hideReps?: boolean;
    /** Start with the expanded detail area open */
    defaultExpanded?: boolean;
    className?: string;
}

const HIDE_INPUTS_SECTIONS = ['warmup', 'cooldown', 'mobility'];

/** Check if a rest value is meaningful (non-zero, non-empty) */
const hasRest = (rest?: string): boolean => {
    if (!rest) return false;
    const cleaned = rest.toLowerCase().replace(/\s/g, '');
    return cleaned !== '0s' && cleaned !== '0' && cleaned !== '';
};

/** Format sets×reps into compact prescription */
const formatPrescription = (sets: number | null, reps: string): string => {
    if (sets) return `${sets}×${reps}`;
    return `${reps} reps`;
};

export const ActiveExerciseCard = ({
    exercise,
    onLog,
    sectionType,
    bare = false,
    emomState,
    minuteLabel,
    pairLabel,
    hideReps = false,
    defaultExpanded = false,
    className
}: ActiveExerciseCardProps) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [weight, setWeight] = useState(exercise.weight_logged || exercise.lastWeight || "");
    const [reps, setReps] = useState(exercise.reps || "");
    const [note, setNote] = useState(exercise.lastNotes || "");

    const showInputs = !sectionType || !HIDE_INPUTS_SECTIONS.includes(sectionType);

    // Log pre-filled values on mount so they persist even if user doesn't edit
    useEffect(() => {
        const prefilled: { weight?: string; notes?: string } = {};
        if (exercise.lastWeight) prefilled.weight = exercise.lastWeight;
        if (exercise.lastNotes) prefilled.notes = exercise.lastNotes;
        if (Object.keys(prefilled).length > 0) {
            onLog(exercise.id, prefilled);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const WEIGHTED_EQUIPMENT = ['barbell', 'dumbbell', 'dumbbells', 'kettlebell', 'cable', 'machine', 'ez bar', 'trap bar', 'smith machine', 'plate'];
    const hasWeight = exercise.equipment && WEIGHTED_EQUIPMENT.includes(exercise.equipment.toLowerCase());

    const handleWeightChange = (v: string) => {
        setWeight(v);
        onLog(exercise.id, { weight: v });
    };

    const handleRepsChange = (v: string) => {
        setReps(v);
        onLog(exercise.id, { reps: v });
    };

    const handleNoteSave = (v: string) => {
        setNote(v);
        onLog(exercise.id, { notes: v });
    };

    const isEmomActive = emomState === 'active';
    const isEmomInactive = emomState === 'inactive';

    const Wrapper = bare ? 'div' : Card;
    const wrapperProps = bare
        ? { style: { overflow: 'hidden', transition: 'opacity 200ms', opacity: isEmomInactive ? 0.4 : undefined } as React.CSSProperties, className }
        : { padding: "none" as const, style: { overflow: 'hidden', transition: 'opacity 200ms', opacity: isEmomInactive ? 0.4 : undefined } as React.CSSProperties, className };

    return (
        <Wrapper {...wrapperProps}>
            {/* EMOM active accent bar */}
            {isEmomActive && (
                <div
                    style={{ height: '2px', backgroundColor: 'var(--border-cta-primary)' }}
                />
            )}
            {/* Header - Always visible (glanceable) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--spacing-300)',
                    textAlign: 'left',
                    ...(bare
                        ? { padding: 'var(--spacing-200) var(--spacing-400)' }
                        : { padding: 'var(--spacing-400)' }),
                }}
            >
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-100)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-200)' }}>
                        <h4
                            className="text-label-md"
                            style={{ fontWeight: 'bold', lineHeight: 1.2, textTransform: 'uppercase', color: isEmomInactive ? 'var(--text-disabled)' : 'var(--text-card-header)' }}
                        >
                            {pairLabel && (
                                <span
                                    className="text-label-xs"
                                    style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 'var(--spacing-200)', color: 'var(--text-card-header)' }}
                                >
                                    {pairLabel}
                                </span>
                            )}
                            {exercise.name}
                        </h4>
                        {minuteLabel && (
                            <span
                                className="text-label-xs"
                                style={{ textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, color: 'var(--text-paragraph)' }}
                            >
                                {minuteLabel}
                            </span>
                        )}
                    </div>
                    {/* Compact prescription */}
                    <div
                        className="text-paragraph-sm"
                        style={{ display: 'flex', flexWrap: 'wrap', columnGap: 'var(--spacing-300)', rowGap: 'var(--spacing-100)', color: 'var(--text-paragraph)' }}
                    >
                        {!hideReps && (
                            <span>{formatPrescription(exercise.sets, exercise.reps)}</span>
                        )}
                        {exercise.equipment && (
                            <>
                                <span>&bull;</span>
                                <span>{exercise.equipment.replace(/_/g, ' ')}</span>
                            </>
                        )}
                    </div>
                </div>
                <span style={{ padding: 'var(--spacing-100)', flexShrink: 0, color: 'var(--icon-cta)' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>

            {/* Expanded Area */}
            {isExpanded && (
                <div style={{
                    paddingLeft: 'var(--spacing-400)',
                    paddingRight: 'var(--spacing-400)',
                    paddingBottom: bare ? 'var(--spacing-200)' : 'var(--spacing-400)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-300)',
                }}>
                    {/* Tempo & Rest details */}
                    {(exercise.tempo || hasRest(exercise.rest)) && (
                        <div
                            className="text-paragraph-sm"
                            style={{ display: 'flex', flexWrap: 'wrap', columnGap: 'var(--spacing-300)', rowGap: 'var(--spacing-100)', color: 'var(--text-paragraph)' }}
                        >
                            {exercise.tempo && <span>Tempo: {exercise.tempo}</span>}
                            {hasRest(exercise.rest) && <span>Rest: {exercise.rest}</span>}
                        </div>
                    )}

                    {/* Coaching Cues */}
                    {exercise.coachingCues && (
                        <p
                            className="text-paragraph-sm"
                            style={{ fontStyle: 'italic', color: 'var(--text-paragraph)' }}
                        >
                            {Array.isArray(exercise.coachingCues)
                                ? exercise.coachingCues.join(". ")
                                : String(exercise.coachingCues)}
                        </p>
                    )}

                    {/* Regression / Progression */}
                    {(exercise.regression || exercise.progression) && (
                        <div
                            className="text-paragraph-sm"
                            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-100)', paddingTop: 'var(--spacing-200)', color: 'var(--text-paragraph)' }}
                        >
                            {exercise.regression && (
                                <p><span style={{ color: 'var(--text-disabled)' }}>Easier:</span> {exercise.regression}</p>
                            )}
                            {exercise.progression && (
                                <p><span style={{ color: 'var(--text-disabled)' }}>Harder:</span> {exercise.progression}</p>
                            )}
                        </div>
                    )}

                    {/* Weight / Reps Inputs */}
                    {showInputs && (
                        <div style={hasWeight ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-300)' } : undefined}>
                            {hasWeight && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
                                    <label
                                        className="text-label-xs"
                                        style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-disabled)' }}
                                    >
                                        Weight
                                    </label>
                                    <Input
                                        value={weight}
                                        onChange={(e) => handleWeightChange(e.target.value)}
                                        placeholder="lbs/kg"
                                    />
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
                                <label
                                    className="text-label-xs"
                                    style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-disabled)' }}
                                >
                                    Reps
                                </label>
                                <Input
                                    value={reps}
                                    onChange={(e) => handleRepsChange(e.target.value)}
                                    placeholder={exercise.reps}
                                />
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <ExerciseNotes
                        note={note}
                        onSave={handleNoteSave}
                    />
                </div>
            )}
        </Wrapper>
    );
};
