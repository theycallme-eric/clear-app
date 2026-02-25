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
    className?: string;
}

const HIDE_INPUTS_SECTIONS = ['warmup', 'cooldown', 'mobility'];

export const ActiveExerciseCard = ({
    exercise,
    onLog,
    sectionType,
    bare = false,
    className
}: ActiveExerciseCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [weight, setWeight] = useState(exercise.weight_logged || "");
    const [reps, setReps] = useState(exercise.reps || "");
    const [note, setNote] = useState("");

    const showInputs = !sectionType || !HIDE_INPUTS_SECTIONS.includes(sectionType);
    const isBodyweight = !exercise.equipment || exercise.equipment.toLowerCase() === 'bodyweight';

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

    const Wrapper = bare ? 'div' : Card;
    const wrapperProps = bare
        ? { className: cn("overflow-hidden", className) }
        : { padding: "none" as const, className: cn("overflow-hidden", className) };

    return (
        <Wrapper {...wrapperProps}>
            {/* Header - Always visible (glanceable) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-start gap-3 text-left"
            >
                <div className="flex-1 min-w-0 space-y-1">
                    <h3
                        className="text-heading-h6 font-bold leading-tight uppercase"
                        style={{ color: 'var(--text-header)' }}
                    >
                        {exercise.name}
                    </h3>
                    <div
                        className="text-paragraph-sm flex flex-wrap gap-x-3 gap-y-1"
                        style={{ color: 'var(--text-paragraph)' }}
                    >
                        {exercise.sets && <span>{exercise.sets} sets</span>}
                        <span>{exercise.reps} reps</span>
                        {exercise.tempo && <span>Tempo: {exercise.tempo}</span>}
                        {exercise.rest && <span>Rest: {exercise.rest}</span>}
                    </div>
                </div>
                <span className="p-1 shrink-0" style={{ color: 'var(--icon-cta)' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>

            {/* Expanded Area */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
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
                            style={{
                                borderTop: '2px solid var(--border-spacer)',
                                color: 'var(--text-paragraph)',
                            }}
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
                        <div className={isBodyweight ? "" : "grid grid-cols-2 gap-3"}>
                            {!isBodyweight && (
                                <div className="space-y-1.5">
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
                            <div className="space-y-1.5">
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
