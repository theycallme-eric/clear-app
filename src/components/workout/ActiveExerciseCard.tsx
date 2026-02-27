import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
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
    const [weight, setWeight] = useState(exercise.weight_logged || "");
    const [reps, setReps] = useState(exercise.reps || "");
    const [note, setNote] = useState("");

    const showInputs = !sectionType || !HIDE_INPUTS_SECTIONS.includes(sectionType);
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
        ? { className: cn("overflow-hidden transition-opacity duration-200", isEmomInactive && "opacity-40", className) }
        : { padding: "none" as const, className: cn("overflow-hidden transition-opacity duration-200", isEmomInactive && "opacity-40", className) };

    return (
        <Wrapper {...wrapperProps}>
            {/* EMOM active accent bar */}
            {isEmomActive && (
                <div
                    className="h-0.5"
                    style={{ backgroundColor: 'var(--border-cta-primary)' }}
                />
            )}
            {/* Header - Always visible (glanceable) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn("w-full flex items-start gap-3 text-left", bare ? "py-2 px-4" : "p-4")}
            >
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                        <h3
                            className="text-heading-h6 font-bold leading-tight uppercase"
                            style={{ color: isEmomInactive ? 'var(--text-disabled)' : 'var(--text-header)' }}
                        >
                            {pairLabel && (
                                <span
                                    className="text-label-xs font-bold uppercase tracking-widest mr-2"
                                    style={{ color: 'var(--text-header)' }}
                                >
                                    {pairLabel}
                                </span>
                            )}
                            {exercise.name}
                        </h3>
                        {minuteLabel && (
                            <span
                                className="text-label-xs uppercase tracking-wider shrink-0"
                                style={{ color: 'var(--text-paragraph)' }}
                            >
                                {minuteLabel}
                            </span>
                        )}
                    </div>
                    {/* Compact prescription */}
                    <div
                        className="text-paragraph-sm flex flex-wrap gap-x-3 gap-y-1"
                        style={{ color: 'var(--text-paragraph)' }}
                    >
                        {!hideReps && (
                            <span>{formatPrescription(exercise.sets, exercise.reps)}</span>
                        )}
                    </div>
                </div>
                <span className="p-1 shrink-0" style={{ color: 'var(--icon-cta)' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>

            {/* Expanded Area */}
            {isExpanded && (
                <div className={cn("px-4 space-y-3", bare ? "pb-2" : "pb-4")}>
                    {/* Tempo & Rest details */}
                    {(exercise.tempo || hasRest(exercise.rest)) && (
                        <div
                            className="text-paragraph-sm flex flex-wrap gap-x-3 gap-y-1"
                            style={{ color: 'var(--text-paragraph)' }}
                        >
                            {exercise.tempo && <span>Tempo: {exercise.tempo}</span>}
                            {hasRest(exercise.rest) && <span>Rest: {exercise.rest}</span>}
                        </div>
                    )}

                    {/* Coaching Cues */}
                    {exercise.coachingCues && (
                        <p
                            className="text-paragraph-sm italic"
                            style={{ color: 'var(--text-paragraph)' }}
                        >
                            {Array.isArray(exercise.coachingCues)
                                ? exercise.coachingCues.join(". ")
                                : String(exercise.coachingCues)}
                        </p>
                    )}

                    {/* Regression / Progression */}
                    {(exercise.regression || exercise.progression) && (
                        <div
                            className="text-paragraph-sm space-y-1 pt-2"
                            style={{ color: 'var(--text-paragraph)' }}
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
                        <div className={hasWeight ? "grid grid-cols-2 gap-3" : ""}>
                            {hasWeight && (
                                <div className="space-y-2">
                                    <label
                                        className="text-label-xs uppercase tracking-wider"
                                        style={{ color: 'var(--text-disabled)' }}
                                    >
                                        Weight
                                    </label>
                                    <Input
                                        value={weight}
                                        onChange={(e) => handleWeightChange(e.target.value)}
                                        placeholder={exercise.lastWeight || "lbs/kg"}
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label
                                    className="text-label-xs uppercase tracking-wider"
                                    style={{ color: 'var(--text-disabled)' }}
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
