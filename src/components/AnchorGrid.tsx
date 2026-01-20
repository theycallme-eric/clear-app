import { cn } from "@/lib/utils";

// Primary Lift anchors (movement pattern focus)
const PRIMARY_ANCHORS = [
  "SQUAT",
  "HINGE",
  "PRESS",
  "PULL",
  "ROTATION",
  "SURPRISE",
] as const;

// Non-Primary Lift anchors (body region focus)
const BODY_ANCHORS = [
  "UPPER BODY",
  "LOWER BODY",
  "FULL BODY",
] as const;

export type PrimaryAnchorType = typeof PRIMARY_ANCHORS[number];
export type BodyAnchorType = typeof BODY_ANCHORS[number];
export type AnchorType = PrimaryAnchorType | BodyAnchorType;

interface AnchorGridProps {
  selected: AnchorType | null;
  onSelect: (anchor: AnchorType) => void;
  hasPrimaryLift?: boolean; // Whether Primary Lift section is enabled
}

export const AnchorGrid = ({ selected, onSelect, hasPrimaryLift = true }: AnchorGridProps) => {
  const anchors = hasPrimaryLift ? PRIMARY_ANCHORS : BODY_ANCHORS;

  return (
    <div className="glass-card rounded-lg p-6">
      <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 block">
        {hasPrimaryLift ? "Anchor Movement" : "Focus Area"}
      </label>

      {hasPrimaryLift ? (
        // 3x2 grid for primary lift anchors
        <div className="grid grid-cols-3 gap-3">
          {anchors.map((anchor) => (
            <button
              key={anchor}
              onClick={() => onSelect(anchor)}
              className={cn(
                "h-14 rounded-none font-display text-sm font-semibold uppercase tracking-wide transition-all duration-200",
                selected === anchor
                  ? "selection-active"
                  : "selection-inactive text-foreground/90 hover:text-foreground"
              )}
            >
              {anchor}
            </button>
          ))}
        </div>
      ) : (
        // 2+1 layout for body anchors
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {BODY_ANCHORS.slice(0, 2).map((anchor) => (
              <button
                key={anchor}
                onClick={() => onSelect(anchor)}
                className={cn(
                  "h-14 rounded-none font-display text-sm font-semibold uppercase tracking-wide transition-all duration-200",
                  selected === anchor
                    ? "selection-active"
                    : "selection-inactive text-foreground/90 hover:text-foreground"
                )}
              >
                {anchor}
              </button>
            ))}
          </div>
          <button
            onClick={() => onSelect("FULL BODY")}
            className={cn(
              "w-full h-14 rounded-none font-display text-sm font-semibold uppercase tracking-wide transition-all duration-200",
              selected === "FULL BODY"
                ? "selection-active"
                : "selection-inactive text-foreground/90 hover:text-foreground"
            )}
          >
            FULL BODY
          </button>
        </div>
      )}
    </div>
  );
};
