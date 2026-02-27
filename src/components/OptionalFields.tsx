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
        className="text-label-xs uppercase tracking-widest mb-3 block"
        style={{ color: "var(--text-card-label)" }}
      >
        Duration
      </label>

      <div className="flex gap-2">
        {DURATION_PRESETS.map((preset) => (
          <RadioButton
            key={preset}
            selected={selectedOption === preset}
            onClick={() => handlePresetClick(preset)}
            label={preset}
            className="flex-1"
          />
        ))}
      </div>
      <RadioButton
        selected={selectedOption === "custom"}
        onClick={handleCustomClick}
        label="Custom"
        className="w-full mt-2"
      />

      {selectedOption === "custom" && (
        <div className="mt-3">
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
        className="text-label-xs uppercase tracking-widest mb-3 block"
        style={{ color: "var(--text-card-label)" }}
      >
        Notes
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Any notes or modifications..."
        className="min-h-[85px]"
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
    <div className="space-y-4">
      <DurationSelector value={time} onChange={onTimeChange} />
      <NotesField value={notes} onChange={onNotesChange} />
    </div>
  );
};
