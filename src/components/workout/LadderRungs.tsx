import { ChamferedFrame } from "@/components/ChamferedFrame";

interface LadderRungsProps {
    rungs: number[];
    /** 'text' = plain numbers (during workout), 'interactive' = chamfered frames (cap reached) */
    mode?: 'text' | 'interactive';
    selectedRung?: number | null;
    onSelect?: (rungIndex: number) => void;
}

export const LadderRungs = ({
    rungs,
    mode = 'text',
    selectedRung = null,
    onSelect,
}: LadderRungsProps) => {
    // Mode A: plain text numbers — no containers
    if (mode === 'text') {
        return (
            <div className="flex gap-3 flex-wrap">
                {rungs.map((reps, i) => (
                    <span
                        key={i}
                        className="text-paragraph-md font-mono font-bold"
                        style={{ color: 'var(--text-paragraph)' }}
                    >
                        {reps}
                    </span>
                ))}
            </div>
        );
    }

    // Mode B: interactive chamfered frames
    const getState = (index: number): 'default' | 'completed' | 'selected' => {
        if (selectedRung === null) return 'default';
        if (index === selectedRung) return 'selected';
        if (index < selectedRung) return 'completed';
        return 'default';
    };

    const tokenMap = {
        default: {
            surface: 'var(--surface-radio-unselect)',
            border: 'var(--border-radio-unselected)',
            text: 'var(--text-radio-text-unselected)',
        },
        completed: {
            surface: 'var(--surface-radio-selected)',
            border: 'var(--border-radio-select)',
            text: 'var(--text-radio-text-select)',
        },
        selected: {
            surface: 'var(--surface-radio-selected)',
            border: 'var(--border-radio-select)',
            text: 'var(--text-radio-text-select)',
        },
    };

    return (
        <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-1" style={{ minWidth: 'min-content' }}>
                {rungs.map((reps, i) => {
                    const state = getState(i);
                    const tokens = tokenMap[state];

                    return (
                        <button
                            key={i}
                            onClick={() => onSelect?.(i)}
                            className="min-w-[32px] min-h-[44px] flex items-center justify-center"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            <ChamferedFrame
                                cornerSize="sm"
                                surfaceColor={tokens.surface}
                                borderColor={tokens.border}
                                hasLeftBorder={true}
                            >
                                <div className="px-2 py-1.5 flex items-center justify-center min-w-[32px] h-[36px]">
                                    <span
                                        className="text-paragraph-sm font-mono font-bold"
                                        style={{ color: tokens.text }}
                                    >
                                        {reps}
                                    </span>
                                </div>
                            </ChamferedFrame>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

/** Parse a rep string like "2-4-6-8-6-4-2 each" into rung numbers */
export const parseRungs = (reps: string): number[] =>
    reps.split('-').map(s => parseInt(s, 10)).filter(n => !isNaN(n));

/** Check if a rep scheme string indicates a ladder pattern */
export const isLadderReps = (reps: string): boolean => {
    const rungs = parseRungs(reps);
    return rungs.length >= 3;
};
