import { Card } from "./Card";
import { RadioButton } from "./RadioButton";

// User-facing anchor options
const ANCHORS = [
  "LOWER BODY",
  "UPPER BODY",
  "FULL BODY",
  "SURPRISE",
] as const;

export type AnchorType = (typeof ANCHORS)[number];

// Movement patterns (sent to API, stored in DB)
export type MovementPattern = "squat" | "hinge" | "press" | "pull" | "power";

interface AnchorGridProps {
  selected: AnchorType | null;
  onSelect: (anchor: AnchorType) => void;
}

export const AnchorGrid = ({ selected, onSelect }: AnchorGridProps) => {
  return (
    <Card cornerSize="md" padding="md">
      <label
        className="text-label-xs uppercase tracking-widest mb-4 block"
        style={{ color: "var(--text-paragraph)" }}
      >
        Focus Area
      </label>

      {/* Stacked single column layout */}
      <div className="flex flex-col gap-2">
        {ANCHORS.map((anchor) => (
          <RadioButton
            key={anchor}
            selected={selected === anchor}
            onClick={() => onSelect(anchor)}
            label={anchor}
            className="w-full"
          />
        ))}
      </div>
    </Card>
  );
};
