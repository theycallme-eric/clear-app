import { CTAButton } from "@/components/CTAButton";
import { Card } from "./Card";

interface AbandonmentModalProps {
  workoutDate: string;
  onResume: () => void;
  onAbandon: () => void;
}

/**
 * Modal shown when an incomplete workout session is detected.
 * Offers the user the choice to resume or abandon it.
 */
export const AbandonmentModal = ({ workoutDate, onResume, onAbandon }: AbandonmentModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card padding="lg" className="mx-4 max-w-sm w-full text-center">
        <h2 className="text-heading-h4 font-bold uppercase tracking-wider text-foreground mb-2">
          Incomplete Workout
        </h2>
        <p className="text-paragraph-sm text-muted-foreground mb-6">
          You have an unfinished workout from {workoutDate}. Would you like to continue or start fresh?
        </p>
        <div className="space-y-2">
          <CTAButton
            onClick={onResume}
            size="md"
            fullWidth
          >
            Resume Workout
          </CTAButton>
          <CTAButton
            onClick={onAbandon}
            variant="secondary"
            size="md"
            fullWidth
          >
            Abandon & Start Fresh
          </CTAButton>
        </div>
      </Card>
    </div>
  );
};
