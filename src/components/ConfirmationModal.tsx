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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        backgroundColor: 'var(--surface-overlay)',
      }}
    >
      <Card
        padding="lg"
        style={{
          margin: `0 var(--spacing-400)`,
          maxWidth: '24rem',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h2
          className="text-heading-h4"
          style={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--spacing-200)',
            color: 'var(--text-header)',
          }}
        >
          {title}
        </h2>
        <p
          className="text-paragraph-sm"
          style={{
            marginBottom: 'var(--spacing-600)',
            color: 'var(--text-paragraph)',
          }}
        >
          {description}
        </p>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-200)',
        }}>
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
