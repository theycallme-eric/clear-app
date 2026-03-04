import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { PageHeading } from "@/components/PageHeading";
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
      <PageHeading level="h2" textSize="h4">Anything We Should Work Around?</PageHeading>

      <Card cornerSize="md" padding="md">
        <p className="text-paragraph-sm mb-4" style={{ color: 'var(--text-paragraph)' }}>
          Old injuries, problem areas, or movements you want to avoid.
        </p>

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
