import { CTAButton } from "@/components/CTAButton";
import { Card } from "./Card";

interface ConfirmationModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'var(--surface-overlay)' }}
    >
      <Card padding="lg" className="mx-4 max-w-sm w-full text-center">
        <h2
          className="text-heading-h4 font-bold uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-header)' }}
        >
          {title}
        </h2>
        <p className="text-paragraph-sm mb-6" style={{ color: 'var(--text-paragraph)' }}>
          {description}
        </p>
        <div className="space-y-2">
          <CTAButton onClick={onConfirm} size="md" fullWidth>
            {confirmLabel}
          </CTAButton>
          <CTAButton onClick={onCancel} variant="secondary" size="md" fullWidth>
            {cancelLabel}
          </CTAButton>
        </div>
      </Card>
    </div>
  );
}
