import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { CTAButton } from "./CTAButton";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
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
    <Card padding="lg" className={cn("text-center", className)} showLeftColumn={showLeftColumn}>
      {Icon && (
        <Icon className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--text-disabled)' }} />
      )}
      <p
        className="text-heading-h5 font-medium uppercase tracking-wide mb-1"
        style={{ color: 'var(--text-header)' }}
      >
        {title}
      </p>
      {description && (
        <p className="text-paragraph-sm mb-4" style={{ color: 'var(--text-paragraph)' }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <CTAButton onClick={onAction} size="sm">
          {actionLabel}
        </CTAButton>
      )}
    </Card>
  );
};
