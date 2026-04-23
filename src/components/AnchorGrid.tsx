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
        className="text-label-xs"
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 'var(--spacing-400)',
          display: 'block',
          color: "var(--text-card-label)",
        }}
      >
        Focus Area
      </label>

      {/* Stacked single column layout */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-200)',
      }}>
        {ANCHORS.map((anchor) => {
          const isPower = anchor === "POWER";
          const isDisabled = isPower && disablePower;

          if (isDisabled) {
            return (
              <div key={anchor} style={{ opacity: 0.3, pointerEvents: 'none' }}>
                <RadioButton
                  selected={false}
                  onClick={() => {}}
                  label={anchor}
                  style={{ width: '100%' }}
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
              style={{ width: '100%' }}
            />
          );
        })}
      </div>
    </Card>
  );
};
