import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Exercise, SectionType } from "@/types/workout";
import { Card } from "../Card";
import { SectionLabel } from "./SectionLabel";

interface ActiveExerciseCardProps {
    exercise: Exercise;
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    onComplete: (id: string, completed: boolean) => void;
    isCompleted: boolean;
    /** Section type for the label (ANCHOR, ACCESSORY, etc.) */
    sectionType?: SectionType;
    /** Whether to show the section label */
    showSectionLabel?: boolean;
    className?: string;
}

export const ActiveExerciseCard = ({
    exercise,
    onLog,
    onComplete,
    isCompleted,
    sectionType,
    showSectionLabel = false,
    className
}: ActiveExerciseCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    // Local state for inputs to avoid excessive re-renders/lag, flush on blur/change
    const [weight, setWeight] = useState(exercise.weight_logged || "");
    const [reps, setReps] = useState(exercise.reps || "");

    const handleWeightChange = (v: string) => {
        setWeight(v);
        onLog(exercise.id, { weight: v });
    };

    const handleRepsChange = (v: string) => {
        setReps(v);
        onLog(exercise.id, { reps: v });
    };

    // Build metadata parts
    const metadataParts: string[] = [];
    if (exercise.sets && exercise.reps) {
        metadataParts.push(`${exercise.sets} sets`);
        metadataParts.push(`${exercise.reps} reps`);
    } else if (exercise.reps) {
        metadataParts.push(exercise.reps);
    }
    if (exercise.rest) {
        metadataParts.push(`Rest: ${exercise.rest}`);
    }

    return (
        <Card
            padding="none"
            showLeftColumn={!isCompleted}
            cornerSize="md"
            surfaceColor="var(--color-orange-alpha-050)"
            className={cn(
                "overflow-hidden transition-all duration-300",
                isCompleted && "opacity-60",
                className
            )}
        >
            {/* Header / Main Row */}
            <div className="p-4 flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={() => onComplete(exercise.id, !isCompleted)}
                    className={cn(
                        "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                        isCompleted
                            ? "border-[var(--color-green-500)]"
                            : "border-[var(--color-orange-alpha-400)] hover:border-[var(--color-orange-500)]"
                    )}
                    style={{
                        backgroundColor: isCompleted ? "var(--color-green-alpha-200)" : "transparent"
                    }}
                >
                    {isCompleted && (
                        <Check
                            size={14}
                            strokeWidth={3}
                            style={{ color: "var(--color-green-500)" }}
                        />
                    )}
                </button>

                {/* Info */}
                <div className="flex-1 space-y-1">
                    {/* Section label if shown */}
                    {showSectionLabel && sectionType && (
                        <SectionLabel type={sectionType} className="mb-1" />
                    )}

                    <div className="flex justify-between items-start">
                        <h3
                            className={cn(
                                "text-heading-h5 font-bold leading-tight uppercase",
                                isCompleted && "line-through"
                            )}
                            style={{
                                color: isCompleted
                                    ? "var(--color-neutral-400)"
                                    : "var(--text-header)"
                            }}
                        >
                            {exercise.name}
                        </h3>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 -m-1"
                            style={{ color: "var(--color-orange-500)" }}
                        >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>

                    <p
                        className="text-paragraph-sm"
                        style={{ color: "var(--color-blue-300)" }}
                    >
                        {metadataParts.join(" • ")}
                    </p>
                </div>
            </div>

            {/* Expanded / Input Area */}
            {(isExpanded || !isCompleted) && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Coaching Cues */}
                    {exercise.coachingCues && (
                        <div
                            className="text-paragraph-sm p-3 rounded-lg italic flex gap-2"
                            style={{
                                backgroundColor: "var(--color-orange-alpha-100)",
                                color: "var(--text-paragraph)"
                            }}
                        >
                            <Info
                                size={16}
                                className="shrink-0 mt-0.5"
                                style={{ color: "var(--color-orange-500)" }}
                            />
                            <p>
                                {Array.isArray(exercise.coachingCues)
                                    ? exercise.coachingCues.join(". ")
                                    : String(exercise.coachingCues)}
                            </p>
                        </div>
                    )}

                    {/* Logging Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label
                                className="text-label-xs uppercase tracking-wider"
                                style={{ color: "var(--color-blue-300)" }}
                            >
                                Weight
                            </label>
                            <input
                                type="text"
                                value={weight}
                                onChange={(e) => handleWeightChange(e.target.value)}
                                placeholder={exercise.lastWeight || "lbs/kg"}
                                className="w-full rounded-lg px-3 py-2 text-paragraph-sm focus:outline-none focus:ring-1"
                                style={{
                                    backgroundColor: "var(--color-orange-alpha-050)",
                                    border: "1px solid var(--border-card)",
                                    color: "var(--text-paragraph)"
                                }}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label
                                className="text-label-xs uppercase tracking-wider"
                                style={{ color: "var(--color-blue-300)" }}
                            >
                                Reps
                            </label>
                            <input
                                type="text"
                                value={reps}
                                onChange={(e) => handleRepsChange(e.target.value)}
                                placeholder={exercise.reps}
                                className="w-full rounded-lg px-3 py-2 text-paragraph-sm focus:outline-none focus:ring-1"
                                style={{
                                    backgroundColor: "var(--color-orange-alpha-050)",
                                    border: "1px solid var(--border-card)",
                                    color: "var(--text-paragraph)"
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};
