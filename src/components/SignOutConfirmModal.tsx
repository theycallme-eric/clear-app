import { CTAButton } from "@/components/CTAButton";
import { Card } from "./Card";

interface SignOutConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const SignOutConfirmModal = ({ onConfirm, onCancel }: SignOutConfirmModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card padding="lg" className="mx-4 max-w-sm w-full text-center">
        <h2 className="text-heading-h4 font-bold uppercase tracking-wider text-foreground mb-2">
          Sign Out
        </h2>
        <p className="text-paragraph-sm text-muted-foreground mb-6">
          Are you sure you want to sign out?
        </p>
        <div className="space-y-2">
          <CTAButton
            onClick={onConfirm}
            size="md"
            fullWidth
          >
            Sign Out
          </CTAButton>
          <CTAButton
            onClick={onCancel}
            variant="secondary"
            size="md"
            fullWidth
          >
            Cancel
          </CTAButton>
        </div>
      </Card>
    </div>
  );
};
