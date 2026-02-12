import { CTAButton } from "@/components/CTAButton";
import { Card } from "./ui/Card";

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
      <Card className="p-6 mx-4 max-w-sm w-full text-center">
        <h2 className="text-heading-h4 font-bold uppercase tracking-wider text-foreground mb-2">
          Incomplete Workout
        </h2>
        <p className="text-paragraph-sm text-muted-foreground mb-6">
          You have an unfinished workout from {workoutDate}. Would you like to continue or start fresh?
        </p>
        <div className="space-y-2">
          <button
            onClick={onResume}
            className="w-full py-3 bg-clear-orange text-background text-cta-sm hover:bg-clear-orange/90 transition-colors"
          >
            Resume Workout
          </button>
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
