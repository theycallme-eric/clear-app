import { Card } from "./Card";
import { CTAButton } from "./CTAButton";

interface EmptyStateProps {
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  showLeftColumn?: boolean;
}

/**
 * Empty state with optional icon, message, and CTA.
 * Used when lists or sections have no data yet.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  showLeftColumn,
}: EmptyStateProps) => {
  return (
    <Card padding="lg" className={className} showLeftColumn={showLeftColumn}>
      <div style={{ textAlign: 'center' }}>
        {Icon && (
          <Icon style={{ width: 'var(--spacing-800)', height: 'var(--spacing-800)', marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--spacing-400)', color: 'var(--text-disabled)' }} />
        )}
        <p
          className="text-heading-h5"
          style={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-100)', color: 'var(--text-header)' }}
        >
          {title}
        </p>
        {description && (
          <p className="text-paragraph-sm" style={{ marginBottom: 'var(--spacing-400)', color: 'var(--text-paragraph)' }}>
            {description}
          </p>
        )}
        {actionLabel && onAction && (
          <CTAButton onClick={onAction} size="sm">
            {actionLabel}
          </CTAButton>
        )}
      </div>
    </Card>
  );
};
