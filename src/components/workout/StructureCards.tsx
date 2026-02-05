import { ExerciseStructure, Exercise } from "@/types/workout";
import { ActiveExerciseCard } from "./ActiveExerciseCard";
import { cn } from "@/lib/utils";

interface StructureCardProps {
    exercises: Exercise[];
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    onComplete: (id: string, completed: boolean) => void;
    completedIds: Set<string>;
    structure: ExerciseStructure; // Context for the group
}

export const SupersetCard = ({ exercises, onLog, onComplete, completedIds }: StructureCardProps) => {
    return (
        <div className="relative pl-3">
            {/* Connecting Line and Label */}
            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-clear-orange via-clear-orange/50 to-clear-orange rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-background py-2">
                <div className="text-[10px] font-bold text-clear-orange uppercase tracking-widest writing-vertical-lr rotate-180">
                    Superset
                </div>
            </div>

            <div className="space-y-4">
                {exercises.map((exercise) => (
                    <ActiveExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onLog={onLog}
                        onComplete={onComplete}
                        isCompleted={completedIds.has(exercise.id)}
                        className="border-l-0" // Remove individual card border since we have the superset line
                    />
                ))}
            </div>
        </div>
    );
};

export const CircuitCard = ({ exercises, onLog, onComplete, completedIds, structure }: StructureCardProps) => {
    const rounds = 'rounds' in structure ? structure.rounds : undefined;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {rounds ? `${rounds} Rounds` : 'Circuit'}
                </span>
            </div>

            <div className="space-y-3">
                {exercises.map((exercise, index) => (
                    <div key={exercise.id} className="relative">
                        {/* Simple connecting line for circuit flow */}
                        {index !== exercises.length - 1 && (
                            <div className="absolute left-6 bottom-[-12px] h-3 w-0.5 bg-border/50 z-0" />
                        )}
                        <ActiveExerciseCard
                            exercise={exercise}
                            onLog={onLog}
                            onComplete={onComplete}
                            isCompleted={completedIds.has(exercise.id)}
                            className="z-10 relative"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
