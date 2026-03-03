import { CTAButton } from "@/components/CTAButton";
import { Card } from "./Card";

interface SignOutConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const SignOutConfirmModal = ({ onConfirm, onCancel }: SignOutConfirmModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(23, 23, 23, 0.8)' }}
    >
      <Card padding="lg" className="mx-4 max-w-sm w-full text-center">
        <h2
          className="text-heading-h4 font-bold uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-header)' }}
        >
          Sign Out
        </h2>
        <p className="text-paragraph-sm mb-6" style={{ color: 'var(--text-paragraph)' }}>
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
