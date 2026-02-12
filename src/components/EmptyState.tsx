import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { CTAButton } from "./CTAButton";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
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
}: EmptyStateProps) => {
  return (
    <Card padding="lg" className={cn("text-center", className)}>
      {Icon && (
        <Icon className="w-10 h-10 mx-auto mb-4 text-muted-foreground/50" />
      )}
      <p className="text-heading-h5 font-medium text-foreground uppercase tracking-wide mb-1">
        {title}
      </p>
      {description && (
        <p className="text-paragraph-sm text-muted-foreground mb-4">
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
