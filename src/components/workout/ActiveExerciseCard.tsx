import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Exercise } from "@/types/workout";

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

    const handleWeightChange = (v: string) => {
        setWeight(v);
        onLog(exercise.id, { weight: v });
    };

    const handleRepsChange = (v: string) => {
        setReps(v);
        onLog(exercise.id, { reps: v });
    };

    return (
        <div className={cn(
            "glass-card overflow-hidden transition-all duration-300",
            isCompleted ? "opacity-60 bg-secondary/30" : "border-l-4 border-l-clear-orange",
            className
        )}>
            {/* Header / Main Row */}
            <div className="p-4 flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={() => onComplete(exercise.id, !isCompleted)}
                    className={cn(
                        "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        isCompleted
                            ? "bg-clear-orange border-clear-orange text-white"
                            : "border-muted-foreground/30 hover:border-clear-orange"
                    )}
                >
                    {isCompleted && <Check size={14} strokeWidth={3} />}
                </button>

                {/* Info */}
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                        <h3 className={cn("text-paragraph-lg font-bold leading-tight", isCompleted && "line-through text-muted-foreground")}>
                            {exercise.name}
                        </h3>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-muted-foreground hover:text-foreground p-1"
                        >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>

                    <div className="text-paragraph-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                        {exercise.sets && <span>{exercise.sets} sets</span>}
                        <span>{exercise.reps} reps</span>
                        {exercise.tempo && <span>Tempo: {exercise.tempo}</span>}
                        {exercise.rest && <span>Rest: {exercise.rest}</span>}
                    </div>
                </div>
            </div>

            {/* Expanded / Input Area */}
            {(isExpanded || !isCompleted) && (
                <div className="px-4 pb-4 space-y-4">

                    {/* Coaching Cues */}
                    {exercise.coachingCues && (
                        <div className="text-paragraph-sm bg-secondary/50 p-3 rounded-lg text-foreground/80 italic flex gap-2">
                            <Info size={16} className="text-clear-orange shrink-0 mt-0.5" />
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
                            <label className="text-label-xs text-muted-foreground uppercase tracking-wider">
                                Weight
                            </label>
                            <input
                                type="text"
                                value={weight}
                                onChange={(e) => handleWeightChange(e.target.value)}
                                placeholder={exercise.lastWeight || "lbs/kg"}
                                className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-paragraph-sm focus:outline-none focus:ring-1 focus:ring-clear-orange"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-label-xs text-muted-foreground uppercase tracking-wider">
                                Reps
                            </label>
                            <input
                                type="text"
                                value={reps}
                                onChange={(e) => handleRepsChange(e.target.value)}
                                placeholder={exercise.reps} // Use target reps as placeholder
                                className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-paragraph-sm focus:outline-none focus:ring-1 focus:ring-clear-orange"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
