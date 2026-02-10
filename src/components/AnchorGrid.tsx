import { cn } from "@/lib/utils";
import { Card } from "./Card";

// User-facing anchor options
const ANCHORS = [
  "LOWER BODY",
  "UPPER BODY",
  "FULL BODY",
  "SURPRISE",
] as const;

export type AnchorType = typeof ANCHORS[number];

// Movement patterns (sent to API, stored in DB)
export type MovementPattern = "squat" | "hinge" | "press" | "pull" | "power";

interface AnchorGridProps {
  selected: AnchorType | null;
  onSelect: (anchor: AnchorType) => void;
}

export const AnchorGrid = ({ selected, onSelect }: AnchorGridProps) => {
  return (
    <Card cornerSize="md" padding="lg">
      <label
        className="font-mono text-xs uppercase tracking-widest mb-4 block"
        style={{ color: "var(--text-paragraph)" }}
      >
        Focus Area
      </label>

      {/* 2x2 grid for anchor options */}
      <div className="grid grid-cols-2 gap-3">
        {ANCHORS.map((anchor) => (
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
    </Card>
  );
};
