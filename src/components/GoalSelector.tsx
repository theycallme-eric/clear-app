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
        className="text-label-xs uppercase tracking-widest mb-4 block"
        style={{ color: "var(--text-card-label)" }}
      >
        Training Goal
      </label>

      <div className="flex flex-col gap-2">
        {GOAL_PRESETS.map((preset) => (
          <RadioButton
            key={preset.value}
            selected={selected === preset.value}
            onClick={() => onSelect(preset.value)}
            label={preset.label}
            className="w-full"
          />
        ))}
      </div>
    </Card>
  );
};
