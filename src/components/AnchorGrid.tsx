import { cn } from "@/lib/utils";

const ANCHORS = [
  "SQUAT",
  "HINGE", 
  "PRESS",
  "PULL",
  "ROTATION",
  "SURPRISE",
] as const;

export type AnchorType = typeof ANCHORS[number];

interface AnchorGridProps {
  selected: AnchorType | null;
  onSelect: (anchor: AnchorType) => void;
}

export const AnchorGrid = ({ selected, onSelect }: AnchorGridProps) => {
  return (
    <div className="glass-card rounded-lg p-6">
      <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 block">
        Anchor Movement
      </label>
      
      <div className="grid grid-cols-3 gap-3">
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
    </div>
  );
};
