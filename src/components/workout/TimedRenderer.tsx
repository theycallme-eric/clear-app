import { useState, useCallback, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { WorkoutSection, Exercise } from "@/types/workout";
import { ActiveExerciseCard } from "./ActiveExerciseCard";
import { SectionTimer, TimerState } from "./SectionTimer";
import { LadderRungs, parseRungs, isLadderReps } from "./LadderRungs";
import { Card } from "../Card";
import { ChamferedFrame } from "../ChamferedFrame";
import { ExerciseNotes } from "./ExerciseNotes";
import { StructureResultData } from "./SectionRenderer";

interface TimedRendererProps {
    section: WorkoutSection;
    firstStructure: NonNullable<Exercise['structure']>;
    onLog: (id: string, data: { weight?: string; reps?: string; notes?: string }) => void;
    onStructureResult?: (sectionName: string, data: StructureResultData) => void;
}

/** Helper: generate EMOM minute assignment label for an exercise */
function getEmomMinuteLabel(exerciseIndex: number, totalExercises: number): string | null {
    if (totalExercises <= 1) return null;
    if (totalExercises === 2) {
        return exerciseIndex === 0 ? 'ODD MIN' : 'EVEN MIN';
    }
    // 3+ exercises: show the minute pattern
    const minutes: number[] = [];
    for (let m = exerciseIndex + 1; m <= 20; m += totalExercises) {
        minutes.push(m);
        if (minutes.length >= 3) break;
    }
    return `MIN ${minutes.join(', ')}\u2026`;
}

/** Timed section (EMOM/AMRAP/For Time) rendered as a single card */
export const TimedRenderer = ({
    section,
    firstStructure,
    onLog,
    onStructureResult,
}: TimedRendererProps) => {
    const [currentMinute, setCurrentMinute] = useState(0);
    const [timerState, setTimerState] = useState<TimerState>('idle');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // AMRAP completion state
    const [roundsCompleted, setRoundsCompleted] = useState(0);
    const [partialNote, setPartialNote] = useState('');

    // Ladder state
    const [selectedRung, setSelectedRung] = useState<number | null>(null);
    const [finishedEarly, setFinishedEarly] = useState(false);

    const isEmom = firstStructure.type === 'emom';
    const isAmrap = firstStructure.type === 'amrap';
    const isForTime = firstStructure.type === 'for_time';
    const isComplete = timerState === 'complete';
    const exerciseCount = section.exercises.length;

    // Ladder detection: check if first exercise reps look like a ladder pattern
    const firstReps = section.exercises[0]?.reps || '';
    const isLadder = isForTime && isLadderReps(firstReps);
    const ladderRungs = isLadder ? parseRungs(firstReps) : [];
    // Extract the rep pattern string (before any " each" suffix)
    const ladderPattern = isLadder ? firstReps.replace(/\s*each.*$/i, '').trim() : '';

    // Report AMRAP results to parent when data changes
    useEffect(() => {
        if (isAmrap && isComplete && onStructureResult) {
            onStructureResult(section.name, {
                structure_type: 'amrap',
                rounds_completed: roundsCompleted,
                completion_time_seconds: elapsedSeconds,
                notes: partialNote || null,
            });
        }
    }, [isAmrap, isComplete, roundsCompleted, elapsedSeconds, partialNote, onStructureResult, section.name]);

    // Report ladder For Time results to parent
    useEffect(() => {
        if (isLadder && isComplete && onStructureResult) {
            onStructureResult(section.name, {
                structure_type: 'for_time',
                completion_time_seconds: elapsedSeconds,
                completed_under_cap: finishedEarly,
                rep_scheme: ladderPattern,
                highest_rung: finishedEarly ? null : (selectedRung ?? null),
            });
        }
    }, [isLadder, isComplete, elapsedSeconds, finishedEarly, selectedRung, ladderPattern, onStructureResult, section.name]);

    const timerMode = firstStructure.type === 'for_time' ? 'countup' as const : 'countdown' as const;
    const initialSeconds = (firstStructure.type === 'emom' || firstStructure.type === 'amrap')
        ? (firstStructure.minutes || 0) * 60
        : (firstStructure.type === 'for_time' ? (firstStructure.time_cap_mins || 0) * 60 : 0);

    const timerLabel = firstStructure.type?.replace('_', ' ') || '';

    const handleMinuteChange = useCallback((minute: number) => {
        setCurrentMinute(minute);
    }, []);

    const handleTimerStateChange = useCallback((state: TimerState) => {
        setTimerState(state);
    }, []);

    const handleFinish = useCallback((elapsed: number) => {
        setElapsedSeconds(elapsed);
        // For ladder: if elapsed < cap, user finished early (completed the ladder)
        if (isLadder && initialSeconds > 0 && elapsed < initialSeconds) {
            setFinishedEarly(true);
            setSelectedRung(ladderRungs.length - 1); // All rungs completed
        }
    }, [isLadder, initialSeconds, ladderRungs.length]);

    // EMOM: determine which exercise is active based on current minute
    const activeExerciseIndex = isEmom && currentMinute > 0 && exerciseCount > 1
        ? (currentMinute - 1) % exerciseCount
        : -1;

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <Card cornerSize="md" padding="none">
            {/* Label */}
            <div className="px-4 pt-3 pb-1">
                <span
                    className="text-label-xs font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-card-label)' }}
                >
                    {isAmrap && isComplete ? `${section.type.replace('_', ' ')} \u2022 AMRAP Complete`
                        : isLadder && isComplete && finishedEarly ? `${section.type.replace('_', ' ')} \u2022 Complete`
                        : isLadder && isComplete ? `${section.type.replace('_', ' ')} \u2022 Cap Reached`
                        : `${section.type.replace('_', ' ')} \u2022 ${timerLabel}`}
                </span>
            </div>

            {/* Timer + controls */}
            <div className="px-4 py-3">
                <SectionTimer
                    mode={timerMode}
                    initialSeconds={initialSeconds}
                    emom={isEmom}
                    onMinuteChange={isEmom ? handleMinuteChange : undefined}
                    onStateChange={handleTimerStateChange}
                    onFinish={handleFinish}
                    hideControls={(isAmrap && isComplete) || (isLadder && isComplete)}
                />
            </div>

            {/* Ladder: cap reached -- interactive rung selector (Path B only) */}
            {isLadder && isComplete && !finishedEarly && (
                <div className="px-4 pb-3 space-y-3">
                    <span
                        className="text-label-xs font-bold uppercase tracking-widest block text-center"
                        style={{ color: 'var(--text-header)' }}
                    >
                        How far did you get?
                    </span>
                    <LadderRungs
                        rungs={ladderRungs}
                        mode="interactive"
                        selectedRung={selectedRung}
                        onSelect={setSelectedRung}
                    />
                </div>
            )}

            {/* Ladder: rep scheme label + plain text rungs (during workout / after early finish) */}
            {isLadder && (finishedEarly || !isComplete) && (
                <div className="px-4 pb-2 space-y-2">
                    <div className="flex items-baseline gap-2">
                        <span
                            className="text-label-xs font-bold uppercase tracking-widest"
                            style={{ color: 'var(--text-card-label)' }}
                        >
                            Ladder:
                        </span>
                        {firstStructure.type === 'for_time' && !isComplete && (
                            <span
                                className="text-label-xs uppercase tracking-widest"
                                style={{ color: 'var(--text-paragraph)', opacity: 0.6 }}
                            >
                                {firstStructure.time_cap_mins} min cap
                            </span>
                        )}
                    </div>
                    <LadderRungs rungs={ladderRungs} mode="text" />
                </div>
            )}

            {/* AMRAP completion UI */}
            {isAmrap && isComplete && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Elapsed time confirmation */}
                    <div className="text-center">
                        <span
                            className="text-time-lg font-bold font-mono opacity-60"
                            style={{ color: 'var(--text-timer)' }}
                        >
                            {formatTime(elapsedSeconds)} ✓
                        </span>
                    </div>

                    {/* Rounds stepper */}
                    <div className="space-y-2">
                        <span
                            className="text-label-xs font-bold uppercase tracking-widest block text-center"
                            style={{ color: 'var(--text-header)' }}
                        >
                            Rounds Completed
                        </span>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => setRoundsCompleted(prev => Math.max(0, prev - 1))}
                                className="min-w-[48px] min-h-[48px] flex items-center justify-center"
                            >
                                <ChamferedFrame
                                    cornerSize="sm"
                                    surfaceColor="var(--surface-cta-secondary)"
                                    borderColor="var(--border-cta-secondary)"
                                >
                                    <div className="px-3 py-2">
                                        <Minus size={24} style={{ color: 'var(--text-cta)' }} />
                                    </div>
                                </ChamferedFrame>
                            </button>

                            <span
                                className="text-time-xl font-bold font-mono min-w-[60px] text-center"
                                style={{ color: 'var(--text-timer)' }}
                            >
                                {roundsCompleted}
                            </span>

                            <button
                                onClick={() => setRoundsCompleted(prev => prev + 1)}
                                className="min-w-[48px] min-h-[48px] flex items-center justify-center"
                            >
                                <ChamferedFrame
                                    cornerSize="sm"
                                    surfaceColor="var(--surface-cta-primary)"
                                    borderColor="var(--border-cta-primary)"
                                >
                                    <div className="px-3 py-2">
                                        <Plus size={24} style={{ color: 'var(--text-cta)' }} />
                                    </div>
                                </ChamferedFrame>
                            </button>
                        </div>
                    </div>

                    {/* Partial round notes */}
                    <ExerciseNotes
                        note={partialNote}
                        onSave={setPartialNote}
                    />
                </div>
            )}

            {/* AMRAP "each round" label for multi-exercise sections */}
            {isAmrap && exerciseCount >= 2 && (
                <div className="px-4 mt-3 -mb-1">
                    <span
                        className="text-label-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--text-card-label)' }}
                    >
                        Each Round:
                    </span>
                </div>
            )}

            {/* Ladder "each rung" label for multi-exercise sections */}
            {isLadder && exerciseCount >= 2 && (
                <div className="px-4 mt-2 -mb-1">
                    <span
                        className="text-label-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--text-card-label)' }}
                    >
                        Each Rung:
                    </span>
                </div>
            )}

            {/* Exercises */}
            <div className="pb-3 space-y-1">
                {section.exercises.map((exercise, i) => {
                    // Interval exercises render as annotations, not full cards
                    if (exercise.is_interval_exercise) {
                        return (
                            <div key={exercise.id} className="px-4 -mt-2 pb-2">
                                <span
                                    className="text-paragraph-sm italic"
                                    style={{ color: 'var(--text-paragraph)' }}
                                >
                                    {exercise.reps} {exercise.name} between each set
                                </span>
                            </div>
                        );
                    }

                    // EMOM highlighting: active vs inactive
                    const emomState = isEmom && exerciseCount > 1 && currentMinute > 0
                        ? (i === activeExerciseIndex ? 'active' : 'inactive')
                        : undefined;

                    const minuteLabel = isEmom
                        ? getEmomMinuteLabel(i, exerciseCount)
                        : null;

                    return (
                        <ActiveExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onLog={onLog}
                            sectionType={section.type}
                            bare
                            emomState={emomState}
                            minuteLabel={minuteLabel}
                            hideReps={isLadder}
                        />
                    );
                })}
            </div>
        </Card>
    );
};
