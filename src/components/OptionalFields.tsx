import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card } from "./Card";
import { RadioButton } from "./RadioButton";
import { toast } from "./ui/sonner";

const DURATION_PRESETS = ["15", "30", "45", "60"] as const;
type DurationOption = (typeof DURATION_PRESETS)[number] | "custom";

interface DurationSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

function DurationSelector({ value, onChange }: DurationSelectorProps) {
  const isPreset = DURATION_PRESETS.includes(value as typeof DURATION_PRESETS[number]);
  const [selectedOption, setSelectedOption] = useState<DurationOption>(
    isPreset ? (value as typeof DURATION_PRESETS[number]) : value ? "custom" : "45"
  );
  const [customValue, setCustomValue] = useState(isPreset ? "" : value);

  const handlePresetClick = (preset: typeof DURATION_PRESETS[number]) => {
    setSelectedOption(preset);
    onChange(preset);
  };

  const handleCustomClick = () => {
    setSelectedOption("custom");
    onChange(customValue || "");
  };

  const handleCustomBlur = () => {
    const parsed = parseInt(customValue, 10);
    if (isNaN(parsed) || parsed < 5 || parsed > 120) {
      toast.info("Duration must be between 5 and 120 minutes");
      return;
    }
    onChange(String(parsed));
  };

  return (
    <Card cornerSize="md" padding="md">
      <label
        className="text-label-xs"
        style={{ color: "var(--text-card-label)", textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--spacing-300)', display: 'block' }}
      >
        Duration
      </label>

      <div style={{ display: 'flex', gap: 'var(--spacing-200)' }}>
        {DURATION_PRESETS.map((preset) => (
          <RadioButton
            key={preset}
            selected={selectedOption === preset}
            onClick={() => handlePresetClick(preset)}
            label={preset}
            style={{ flex: 1 }}
          />
        ))}
      </div>
      <RadioButton
        selected={selectedOption === "custom"}
        onClick={handleCustomClick}
        label="Custom"
        style={{ width: '100%', marginTop: 'var(--spacing-200)' }}
      />

      {selectedOption === "custom" && (
        <div style={{ marginTop: 'var(--spacing-300)' }}>
          <Input
            type="text"
            inputMode="numeric"
            value={customValue}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              setCustomValue(digits);
              const parsed = parseInt(digits, 10);
              onChange(parsed >= 5 && parsed <= 120 ? digits : "");
            }}
            onBlur={handleCustomBlur}
            placeholder="Minutes (5–120)"
          />
        </div>
      )}
    </Card>
  );
}

interface NotesFieldProps {
  value: string;
  onChange: (value: string) => void;
}

function NotesField({ value, onChange }: NotesFieldProps) {
  return (
    <Card cornerSize="md" padding="md">
      <label
        className="text-label-xs"
        style={{ color: "var(--text-card-label)", textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--spacing-300)', display: 'block' }}
      >
        Notes
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Any notes or modifications..."
        style={{ minHeight: '85px' }}
      />
    </Card>
  );
}

interface OptionalFieldsProps {
  time: string;
  notes: string;
  onTimeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

export const OptionalFields = ({
  time,
  notes,
  onTimeChange,
  onNotesChange,
}: OptionalFieldsProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-400)' }}>
      <DurationSelector value={time} onChange={onTimeChange} />
      <NotesField value={notes} onChange={onNotesChange} />
    </div>
  );
};
