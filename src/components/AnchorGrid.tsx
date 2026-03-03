import { Card } from "./Card";
import { RadioButton } from "./RadioButton";

// User-facing anchor options
const ANCHORS = [
  "LOWER BODY",
  "UPPER BODY",
  "FULL BODY",
  "POWER",
  "SURPRISE",
] as const;

export type AnchorType = (typeof ANCHORS)[number];

// Movement patterns (sent to API, stored in DB)
export type MovementPattern = "squat" | "hinge" | "press" | "pull" | "power";

interface AnchorGridProps {
  selected: AnchorType | null;
  onSelect: (anchor: AnchorType) => void;
  /** Hide or disable the Power option (e.g., for Active Recovery) */
  disablePower?: boolean;
}

export const AnchorGrid = ({ selected, onSelect, disablePower = false }: AnchorGridProps) => {
  return (
    <Card cornerSize="md" padding="md">
      <label
        className="text-label-xs uppercase tracking-widest mb-4 block"
        style={{ color: "var(--text-card-label)" }}
      >
        Focus Area
      </label>

      {/* Stacked single column layout */}
      <div className="flex flex-col gap-2">
        {ANCHORS.map((anchor) => {
          const isPower = anchor === "POWER";
          const isDisabled = isPower && disablePower;

          if (isDisabled) {
            return (
              <div key={anchor} className="opacity-30 pointer-events-none">
                <RadioButton
                  selected={false}
                  onClick={() => {}}
                  label={anchor}
                  className="w-full"
                />
              </div>
            );
          }

          return (
            <RadioButton
              key={anchor}
              selected={selected === anchor}
              onClick={() => onSelect(anchor)}
              label={anchor}
              className="w-full"
            />
          );
        })}
      </div>
    </Card>
  );
};
