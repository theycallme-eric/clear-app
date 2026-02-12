import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

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
      <div className="space-y-2">
        <label className="block text-paragraph-sm text-foreground">
          Duration
        </label>
        <Input
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          placeholder="45 min"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-paragraph-sm text-foreground">
          Notes
        </label>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Any notes or modifications..."
          className="min-h-[85px]"
        />
      </div>
    </div>
  );
};
