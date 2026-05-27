import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, X, Plus, Clock } from "@/components/icons";
import { Exercise, ExerciseSetData, SetLog } from "@/types/workout";
import { ChamferedFrame } from "../ChamferedFrame";
import { Card } from "../Card";
import { Input } from "../ui/input";
import { ExerciseNotes } from "./ExerciseNotes";

interface ActiveExerciseCardProps {
    exercise: Exercise;
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    /** Called with per-set data for exercises that use set-by-set logging */
    onSetLog?: (id: string, data: ExerciseSetData) => void;
    /** Called when user taps Rest button — triggers rest timer */
    onRestStart?: (restSeconds: number) => void;
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
const WEIGHTED_EQUIPMENT = ['barbell', 'dumbbell', 'dumbbells', 'kettlebell', 'kettlebells', 'cable', 'cable machine', 'machine', 'ez bar', 'trap bar', 'smith machine', 'plate'];

/** Check if a rest value is meaningful (non-zero, non-empty) */
const hasRest = (rest?: string): boolean => {
    if (!rest) return false;
    const cleaned = rest.toLowerCase().replace(/\s/g, '');
    return cleaned !== '0s' && cleaned !== '0' && cleaned !== '';
};

/** Parse rest string to seconds */
const parseRestSeconds = (rest?: string): number => {
    if (!rest) return 0;
    const num = parseInt(rest);
    return isNaN(num) ? 0 : num;
};

/** Format sets×reps into compact prescription */
const formatPrescription = (sets: number | null, reps: string): string => {
    if (sets) return `${sets}×${reps}`;
    return `${reps} reps`;
};

/** Build initial per-set state from exercise data */
function buildInitialSets(exercise: Exercise, hasWeight: boolean): SetLog[] {
    const numSets = exercise.sets || 1;
    const prescribedReps = parseInt(exercise.reps);
    const defaultReps = isNaN(prescribedReps) ? undefined : prescribedReps;

    return Array.from({ length: numSets }, (_, i) => {
        const lastSet = exercise.lastSetData?.[i];
        return {
            setNumber: i + 1,
            weight: lastSet?.weight ?? undefined,
            weightUnit: lastSet?.weightUnit || 'lbs',
            reps: lastSet?.reps ?? defaultReps,
        };
    });
}

/** Generate a summary string from set logs for backward compat */
function summarizeSets(sets: SetLog[], hasWeight: boolean): string {
    if (sets.length === 0) return '';
    const parts = sets
        .filter(s => (hasWeight ? s.weight != null : s.reps != null))
        .map(s => {
            if (hasWeight && s.weight != null && s.reps != null) {
                return `${s.weight}×${s.reps}`;
            } else if (hasWeight && s.weight != null) {
                return `${s.weight}`;
            } else if (s.reps != null) {
                return `${s.reps}`;
            }
            return '';
        })
        .filter(Boolean);

    if (parts.length > 1 && parts.every(p => p === parts[0])) {
        return `${parts[0]} (${parts.length} sets)`;
    }
    return parts.join(', ');
}

/** Reusable rest timer button with chamfered frame */
export const RestButton = ({ restLabel, onStart }: { restLabel: string; onStart: () => void }) => (
    <button onClick={onStart} style={{ width: '100%' }}>
        <ChamferedFrame
            cornerSize="sm"
            surfaceColor="var(--surface-timer)"
            borderColor="var(--border-timer)"
        >
            <div
                className="text-cta-xs"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-200)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-timer)',
                    padding: 'var(--spacing-200) var(--spacing-300)',
                }}
            >
                <Clock size={14} />
                Rest {restLabel}
            </div>
        </ChamferedFrame>
    </button>
);

export const ActiveExerciseCard = ({
    exercise,
    onLog,
    onSetLog,
    onRestStart,
    sectionType,
    bare = false,
    emomState,
    minuteLabel,
    pairLabel,
    hideReps = false,
    defaultExpanded = false,
    className
}: ActiveExerciseCardProps) => {
    const showInputs = !sectionType || !HIDE_INPUTS_SECTIONS.includes(sectionType);
    const hasWeight = !!(exercise.equipment && WEIGHTED_EQUIPMENT.includes(exercise.equipment.toLowerCase()));

    // Determine if this exercise gets per-set inputs
    const isNumericReps = /^\d+$/.test(exercise.reps);
    const hasStandardSets = exercise.sets != null && exercise.sets > 0;
    const isTimedStructure = ['emom', 'amrap', 'for_time'].includes(exercise.structure?.type || '');
    const isCircuit = exercise.structure?.type === 'circuit';
    const canLogSets = showInputs && isNumericReps && hasStandardSets && !isTimedStructure && !isCircuit && !!onSetLog;

    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [showPerSet, setShowPerSet] = useState(false);
    const [note, setNote] = useState(exercise.lastNotes || "");

    // Rest timer
    const restSeconds = parseRestSeconds(exercise.rest);
    const showRestButton = hasRest(exercise.rest) && !!onRestStart;

    // Per-set state
    const [setLogs, setSetLogs] = useState<SetLog[]>(() =>
        canLogSets ? buildInitialSets(exercise, hasWeight) : []
    );

    // Unified single-line state: applies to all sets when not in per-set mode
    const firstSet = setLogs[0];
    const [uniformWeight, setUniformWeight] = useState(
        firstSet?.weight != null ? String(firstSet.weight) : (exercise.weight_logged || exercise.lastWeight || "")
    );
    const [uniformReps, setUniformReps] = useState(
        firstSet?.reps != null ? String(firstSet.reps) : (exercise.reps || "")
    );

    // Single-input state (legacy — for non per-set exercises like bodyweight)
    const [weight, setWeight] = useState(exercise.weight_logged || exercise.lastWeight || "");
    const [reps, setReps] = useState(exercise.reps || "");

    // Emit per-set data on mount if we have pre-fill data
    useEffect(() => {
        if (canLogSets && setLogs.length > 0) {
            const summary = summarizeSets(setLogs, hasWeight);
            onSetLog(exercise.id, { sets: setLogs, notes: note || undefined });
            if (summary) {
                onLog(exercise.id, { weight: summary });
            }
        } else {
            const prefilled: { weight?: string; notes?: string } = {};
            if (exercise.lastWeight) prefilled.weight = exercise.lastWeight;
            if (exercise.lastNotes) prefilled.notes = exercise.lastNotes;
            if (Object.keys(prefilled).length > 0) {
                onLog(exercise.id, prefilled);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const emitSetLog = useCallback((updatedSets: SetLog[], updatedNote?: string) => {
        if (!onSetLog) return;
        onSetLog(exercise.id, { sets: updatedSets, notes: updatedNote || note || undefined });
        const summary = summarizeSets(updatedSets, hasWeight);
        if (summary) {
            onLog(exercise.id, { weight: summary });
        }
    }, [exercise.id, hasWeight, note, onLog, onSetLog]);

    // Uniform weight/reps: update ALL sets at once
    const handleUniformWeightChange = (v: string) => {
        setUniformWeight(v);
        const numVal = v === '' ? undefined : parseFloat(v);
        const updated = setLogs.map(s => ({ ...s, weight: isNaN(numVal as number) ? undefined : numVal }));
        setSetLogs(updated);
        emitSetLog(updated);
    };

    const handleUniformRepsChange = (v: string) => {
        setUniformReps(v);
        const numVal = v === '' ? undefined : parseInt(v);
        const updated = setLogs.map(s => ({ ...s, reps: isNaN(numVal as number) ? undefined : numVal }));
        setSetLogs(updated);
        emitSetLog(updated);
    };

    // Per-set individual handlers
    const handleSetWeightChange = (index: number, value: string) => {
        const numVal = value === '' ? undefined : parseFloat(value);
        const updated = setLogs.map((s, i) =>
            i === index ? { ...s, weight: isNaN(numVal as number) ? undefined : numVal } : s
        );
        setSetLogs(updated);
        emitSetLog(updated);
    };

    const handleSetRepsChange = (index: number, value: string) => {
        const numVal = value === '' ? undefined : parseInt(value);
        const updated = setLogs.map((s, i) =>
            i === index ? { ...s, reps: isNaN(numVal as number) ? undefined : numVal } : s
        );
        setSetLogs(updated);
        emitSetLog(updated);
    };

    const handleAddSet = () => {
        const lastSet = setLogs[setLogs.length - 1];
        const newSet: SetLog = {
            setNumber: setLogs.length + 1,
            weight: lastSet?.weight,
            weightUnit: lastSet?.weightUnit || 'lbs',
            reps: lastSet?.reps,
        };
        const updated = [...setLogs, newSet];
        setSetLogs(updated);
        emitSetLog(updated);
    };

    const handleRemoveSet = (index: number) => {
        if (setLogs.length <= 1) return;
        const updated = setLogs
            .filter((_, i) => i !== index)
            .map((s, i) => ({ ...s, setNumber: i + 1 }));
        setSetLogs(updated);
        emitSetLog(updated);
    };

    // Legacy single-input handlers (non per-set exercises)
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
        if (canLogSets) {
            emitSetLog(setLogs, v);
        }
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
                    {/* Tempo */}
                    {exercise.tempo && (
                        <p className="text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
                            Tempo: {exercise.tempo}
                        </p>
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
                            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-100)', color: 'var(--text-paragraph)' }}
                        >
                            {exercise.regression && (
                                <p><span style={{ color: 'var(--text-disabled)' }}>Easier:</span> {exercise.regression}</p>
                            )}
                            {exercise.progression && (
                                <p><span style={{ color: 'var(--text-disabled)' }}>Harder:</span> {exercise.progression}</p>
                            )}
                        </div>
                    )}

                    {/* ---- Logging inputs ---- */}
                    {canLogSets && !showPerSet && (
                        <>
                            {/* Single-line uniform inputs */}
                            <div style={{ display: 'grid', gridTemplateColumns: hasWeight ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: 'var(--spacing-300)' }}>
                                {hasWeight && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
                                        <label
                                            className="text-label-xs"
                                            style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-disabled)' }}
                                        >
                                            Weight
                                        </label>
                                        <Input
                                            type="number"
                                            inputMode="decimal"
                                            value={uniformWeight}
                                            onChange={(e) => handleUniformWeightChange(e.target.value)}
                                            placeholder="lbs"
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
                                        type="number"
                                        inputMode="numeric"
                                        value={uniformReps}
                                        onChange={(e) => handleUniformRepsChange(e.target.value)}
                                        placeholder={exercise.reps}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span
                                    className="text-paragraph-sm"
                                    style={{ color: 'var(--text-disabled)' }}
                                >
                                    {setLogs.length} sets &bull; same weight
                                </span>
                                <button
                                    onClick={() => setShowPerSet(true)}
                                    className="text-cta-xs"
                                    style={{
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        color: 'var(--text-cta)',
                                        textDecoration: 'underline',
                                        textUnderlineOffset: '3px',
                                    }}
                                >
                                    Vary Sets
                                </button>
                            </div>
                        </>
                    )}

                    {/* Per-Set Inputs (expanded) */}
                    {canLogSets && showPerSet && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
                            {/* Column headers */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: hasWeight ? '32px minmax(0, 1fr) minmax(0, 1fr) 28px' : '32px minmax(0, 1fr) 28px',
                                gap: 'var(--spacing-200)',
                                alignItems: 'center',
                            }}>
                                <span
                                    className="text-label-xs"
                                    style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-disabled)' }}
                                >
                                    Set
                                </span>
                                {hasWeight && (
                                    <span
                                        className="text-label-xs"
                                        style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-disabled)' }}
                                    >
                                        Weight
                                    </span>
                                )}
                                <span
                                    className="text-label-xs"
                                    style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-disabled)' }}
                                >
                                    Reps
                                </span>
                                <span />
                            </div>

                            {/* Set rows */}
                            {setLogs.map((set, index) => (
                                <div
                                    key={set.setNumber}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: hasWeight ? '32px minmax(0, 1fr) minmax(0, 1fr) 28px' : '32px minmax(0, 1fr) 28px',
                                        gap: 'var(--spacing-200)',
                                        alignItems: 'center',
                                    }}
                                >
                                    <span
                                        className="text-label-xs"
                                        style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-disabled)' }}
                                    >
                                        {set.setNumber}
                                    </span>
                                    {hasWeight && (
                                        <Input
                                            type="number"
                                            inputMode="decimal"
                                            value={set.weight != null ? String(set.weight) : ''}
                                            onChange={(e) => handleSetWeightChange(index, e.target.value)}
                                            placeholder="lbs"
                                        />
                                    )}
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        value={set.reps != null ? String(set.reps) : ''}
                                        onChange={(e) => handleSetRepsChange(index, e.target.value)}
                                        placeholder={exercise.reps}
                                    />
                                    <button
                                        onClick={() => handleRemoveSet(index)}
                                        style={{
                                            width: 28,
                                            height: 28,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-disabled)',
                                            opacity: setLogs.length <= 1 ? 0.3 : 1,
                                        }}
                                        disabled={setLogs.length <= 1}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {/* Add set + collapse row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <button
                                    onClick={handleAddSet}
                                    className="text-cta-xs"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-100)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        color: 'var(--text-cta)',
                                        paddingTop: 'var(--spacing-100)',
                                    }}
                                >
                                    <Plus size={14} />
                                    Add Set
                                </button>
                                <button
                                    onClick={() => setShowPerSet(false)}
                                    className="text-cta-xs"
                                    style={{
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        color: 'var(--text-disabled)',
                                        paddingTop: 'var(--spacing-100)',
                                    }}
                                >
                                    Collapse
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Legacy single Weight / Reps Inputs (non per-set exercises) */}
                    {showInputs && !canLogSets && (
                        <div style={hasWeight ? { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--spacing-300)' } : undefined}>
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

                    {/* Rest Timer Button */}
                    {showRestButton && (
                        <RestButton restLabel={exercise.rest!} onStart={() => onRestStart!(restSeconds)} />
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
