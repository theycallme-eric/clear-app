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
      <div>
        <label className="text-label-xs uppercase tracking-widest text-muted-foreground mb-2 block">
          Duration
        </label>
        <input
          type="text"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          placeholder="45 min"
          className="glass-input w-full px-4 py-3 text-paragraph-md placeholder:text-muted-foreground/50"
        />
      </div>
      
      <div>
        <label className="text-label-xs uppercase tracking-widest text-muted-foreground mb-2 block">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Any notes or modifications..."
          rows={3}
          className="glass-input w-full px-4 py-3 text-paragraph-md placeholder:text-muted-foreground/50 resize-none"
        />
      </div>
    </div>
  );
};
