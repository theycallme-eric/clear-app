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
      <div className="h-4 w-3/4 mb-2" style={{ backgroundColor: 'var(--color-neutral-alpha-100)' }} />
      <div className="h-3 w-1/2" style={{ backgroundColor: 'var(--color-neutral-alpha-100)' }} />
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
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showLeftColumn={showLeftColumn} />
      ))}
    </div>
  );
};
