import { Card } from "./Card";
import { RadioButton } from "./RadioButton";
import { GoalPreset, GOAL_PRESETS } from "@/types/workout";

interface GoalSelectorProps {
  selected: GoalPreset | null;
  onSelect: (goal: GoalPreset) => void;
}

export const GoalSelector = ({ selected, onSelect }: GoalSelectorProps) => {
  return (
    <Card cornerSize="md" padding="md">
      <label
        className="text-label-xs"
        style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--spacing-400)', display: 'block', color: "var(--text-card-label)" }}
      >
        Training Goal
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
        {GOAL_PRESETS.map((preset) => (
          <RadioButton
            key={preset.value}
            selected={selected === preset.value}
            onClick={() => onSelect(preset.value)}
            label={preset.label}
            style={{ width: '100%' }}
          />
        ))}
      </div>
    </Card>
  );
};
