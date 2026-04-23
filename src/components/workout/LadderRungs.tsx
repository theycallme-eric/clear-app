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
            <div style={{ display: 'flex', gap: 'var(--spacing-300)', flexWrap: 'wrap' }}>
                {rungs.map((reps, i) => (
                    <span
                        key={i}
                        className="text-paragraph-md"
                        style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--text-paragraph)' }}
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
        <div style={{ overflowX: 'auto', marginLeft: 'calc(-1 * var(--spacing-400))', marginRight: 'calc(-1 * var(--spacing-400))', paddingLeft: 'var(--spacing-400)', paddingRight: 'var(--spacing-400)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-100)', minWidth: 'min-content' }}>
                {rungs.map((reps, i) => {
                    const state = getState(i);
                    const tokens = tokenMap[state];

                    return (
                        <button
                            key={i}
                            onClick={() => onSelect?.(i)}
                            style={{ minWidth: '32px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent' }}
                        >
                            <ChamferedFrame
                                cornerSize="sm"
                                surfaceColor={tokens.surface}
                                borderColor={tokens.border}
                                hasLeftBorder={true}
                            >
                                <div style={{ padding: 'var(--spacing-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', height: '36px' }}>
                                    <span
                                        className="text-paragraph-sm"
                                        style={{ fontFamily: 'monospace', fontWeight: 'bold', color: tokens.text }}
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
export const parseRungs = (reps: string | number): number[] => {
    const str = String(reps);
    return str.split('-').map(s => parseInt(s, 10)).filter(n => !isNaN(n));
};

/** Check if a rep scheme string indicates a ladder pattern */
export const isLadderReps = (reps: string | number): boolean => {
    if (typeof reps === 'number') return false;
    const rungs = parseRungs(reps);
    return rungs.length >= 3;
};
