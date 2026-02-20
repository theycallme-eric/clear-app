import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Info, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Exercise } from "@/types/workout";
import { Card } from "../Card";

interface ActiveExerciseCardProps {
    exercise: Exercise;
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    onComplete: (id: string, completed: boolean) => void;
    isCompleted: boolean;
    className?: string;
}

export const ActiveExerciseCard = ({
    exercise,
    onLog,
    onComplete,
    isCompleted,
    className
}: ActiveExerciseCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    // Local state for inputs to avoid excessive re-renders/lag, flush on blur/change
    const [weight, setWeight] = useState(exercise.weight_logged || "");
    const [reps, setReps] = useState(exercise.reps || "");
    const [notes, setNotes] = useState("");
    const [showNotes, setShowNotes] = useState(false);

    const handleWeightChange = (v: string) => {
        setWeight(v);
        onLog(exercise.id, { weight: v });
    };

    const handleRepsChange = (v: string) => {
        setReps(v);
        onLog(exercise.id, { reps: v });
    };

    const handleNotesChange = (v: string) => {
        setNotes(v);
        onLog(exercise.id, { notes: v });
    };

    return (
        <Card
            padding="none"
            showLeftColumn={!isCompleted}
            surfaceColor={isCompleted ? 'var(--color-neutral-alpha-100)' : undefined}
            borderColor={isCompleted ? 'var(--color-neutral-alpha-300)' : undefined}
            accentColor={isCompleted ? 'var(--color-neutral-alpha-300)' : undefined}
            className={cn(
                "overflow-hidden transition-all duration-300",
                className
            )}
        >
            {/* Header / Main Row - Always visible (glanceable) */}
            <div className="p-4 flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={() => onComplete(exercise.id, !isCompleted)}
                    className={cn(
                        "mt-1 w-6 h-6 border-2 flex items-center justify-center shrink-0 transition-colors",
                        isCompleted
                            ? "bg-[var(--surface-success)] border-[var(--border-success)]"
                            : "border-[var(--color-neutral-alpha-400)] hover:border-[var(--border-card)]"
                    )}
                    style={{ color: isCompleted ? 'var(--text-success)' : undefined }}
                >
                    {isCompleted && <Check size={14} strokeWidth={3} />}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                        <h3
                            className={cn(
                                "text-heading-h6 font-bold leading-tight",
                                isCompleted && "line-through"
                            )}
                            style={{ color: isCompleted ? 'var(--text-disabled)' : 'var(--text-header)' }}
                        >
                            {exercise.name}
                        </h3>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 shrink-0"
                            style={{ color: 'var(--text-paragraph)' }}
                        >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>

                    {/* Rep scheme - always visible */}
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
            </div>

            {/* Expanded / Input Area */}
            {(isExpanded || !isCompleted) && (
                <div className="px-4 pb-4 space-y-3">

                    {/* Coaching Cues */}
                    {exercise.coachingCues && isExpanded && (
                        <div
                            className="text-paragraph-sm p-3 flex gap-2"
                            style={{
                                background: 'var(--color-neutral-alpha-100)',
                                border: '1px solid var(--color-neutral-alpha-200)',
                                color: 'var(--text-paragraph)',
                            }}
                        >
                            <Info size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--border-card)' }} />
                            <p className="italic">
                                {Array.isArray(exercise.coachingCues)
                                    ? exercise.coachingCues.join(". ")
                                    : String(exercise.coachingCues)}
                            </p>
                        </div>
                    )}

                    {/* Regression / Progression */}
                    {isExpanded && (exercise.regression || exercise.progression) && (
                        <div
                            className="text-paragraph-sm space-y-1 pt-2"
                            style={{
                                borderTop: '1px solid var(--color-neutral-alpha-200)',
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

                    {/* Logging Inputs */}
                    {!isCompleted && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label
                                    className="text-label-xs uppercase tracking-wider"
                                    style={{ color: 'var(--text-disabled)' }}
                                >
                                    Weight
                                </label>
                                <input
                                    type="text"
                                    value={weight}
                                    onChange={(e) => handleWeightChange(e.target.value)}
                                    placeholder={exercise.lastWeight || "lbs/kg"}
                                    className="cyber-input w-full px-3 py-2 text-paragraph-sm"
                                    style={{ color: 'var(--text-input)' }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label
                                    className="text-label-xs uppercase tracking-wider"
                                    style={{ color: 'var(--text-disabled)' }}
                                >
                                    Reps
                                </label>
                                <input
                                    type="text"
                                    value={reps}
                                    onChange={(e) => handleRepsChange(e.target.value)}
                                    placeholder={exercise.reps}
                                    className="cyber-input w-full px-3 py-2 text-paragraph-sm"
                                    style={{ color: 'var(--text-input)' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Notes toggle + input */}
                    {!isCompleted && (
                        <div>
                            {!showNotes ? (
                                <button
                                    onClick={() => setShowNotes(true)}
                                    className="flex items-center gap-1.5 text-paragraph-sm"
                                    style={{ color: 'var(--text-disabled)' }}
                                >
                                    <MessageSquare size={14} />
                                    <span>Add note</span>
                                </button>
                            ) : (
                                <div className="space-y-1.5">
                                    <label
                                        className="text-label-xs uppercase tracking-wider"
                                        style={{ color: 'var(--text-disabled)' }}
                                    >
                                        Notes
                                    </label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={(e) => handleNotesChange(e.target.value)}
                                        placeholder="How did it feel?"
                                        className="cyber-input w-full px-3 py-2 text-paragraph-sm"
                                        style={{ color: 'var(--text-input)' }}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};
