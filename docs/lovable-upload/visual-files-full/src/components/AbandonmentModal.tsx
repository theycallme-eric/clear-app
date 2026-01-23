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
      <div className="glass-card p-6 mx-4 max-w-sm w-full text-center">
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground mb-2">
          Incomplete Workout
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          You have an unfinished workout from {workoutDate}. Would you like to continue or start fresh?
        </p>
        <div className="space-y-2">
          <button
            onClick={onResume}
            className="w-full py-3 bg-clear-orange text-background font-display text-sm uppercase tracking-wider hover:bg-clear-orange/90 transition-colors"
          >
            Resume Workout
          </button>
          <button
            onClick={onAbandon}
            className="w-full py-3 ghost-button text-sm"
          >
            Abandon & Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
};
