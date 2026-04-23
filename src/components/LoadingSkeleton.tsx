import { cn } from "@/lib/utils";
import { Card } from "./Card";

interface SkeletonCardProps {
  className?: string;
  showLeftColumn?: boolean;
}

/**
 * Individual skeleton card placeholder.
 * Uses chamfered Card for consistent design system treatment.
 */
export const SkeletonCard = ({ className, showLeftColumn }: SkeletonCardProps) => {
  return (
    <Card className={cn("animate-pulse", className)} cornerSize="sm" padding="md" showLeftColumn={showLeftColumn}>
      <div style={{ height: 'var(--spacing-400)', width: '75%', marginBottom: 'var(--spacing-200)', backgroundColor: 'var(--surface-skeleton)' }} />
      <div style={{ height: 'var(--spacing-300)', width: '50%', backgroundColor: 'var(--surface-skeleton)' }} />
    </Card>
  );
};

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
  showLeftColumn?: boolean;
}

/**
 * List of skeleton cards for content loading states.
 * Used for history lists, home dashboard sections, etc.
 */
export const LoadingSkeleton = ({ count = 3, className, showLeftColumn }: LoadingSkeletonProps) => {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showLeftColumn={showLeftColumn} />
      ))}
    </div>
  );
};
