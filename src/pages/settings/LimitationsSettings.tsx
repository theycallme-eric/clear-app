import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { Textarea } from "@/components/ui/textarea";

interface LimitationsSettingsProps {
  limitations: string;
  onLimitationsChange: (value: string) => void;
  onClear: () => void;
}

export const LimitationsSettings = ({
  limitations,
  onLimitationsChange,
  onClear,
}: LimitationsSettingsProps) => {
  return (
    <div className="space-y-6">
      <Card cornerSize="md" padding="md">
        <div className="mb-4">
          <h2 className="text-heading-h4 font-bold uppercase tracking-wider" style={{ color: 'var(--text-header)' }}>
            Anything We Should<br />Work Around?
          </h2>
          <p className="text-paragraph-sm mt-2" style={{ color: 'var(--text-paragraph)' }}>
            Old injuries, problem areas, or movements you want to avoid.
          </p>
        </div>

        <Textarea
          value={limitations}
          onChange={(e) => onLimitationsChange(e.target.value)}
          placeholder="Bad left shoulder from years ago. Overhead press feels sketchy sometimes."
          className="min-h-[120px]"
        />
      </Card>

      {limitations && (
        <CTAButton
          onClick={onClear}
          variant="secondary"
          size="sm"
          fullWidth
        >
          Clear All
        </CTAButton>
      )}
    </div>
  );
};
