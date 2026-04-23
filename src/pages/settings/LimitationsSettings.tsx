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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-600)' }}>
      <Card cornerSize="md" padding="md">
        <div style={{ marginBottom: 'var(--spacing-400)' }}>
          <h2 className="text-heading-h4" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-header)' }}>
            Anything We Should<br />Work Around?
          </h2>
          <p className="text-paragraph-sm" style={{ marginTop: 'var(--spacing-200)', color: 'var(--text-paragraph)' }}>
            Old injuries, problem areas, or movements you want to avoid.
          </p>
        </div>

        <Textarea
          value={limitations}
          onChange={(e) => onLimitationsChange(e.target.value)}
          placeholder="Bad left shoulder from years ago. Overhead press feels sketchy sometimes."
          style={{ minHeight: 120 }}
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
