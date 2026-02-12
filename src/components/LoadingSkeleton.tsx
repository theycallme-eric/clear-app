import { cn } from "@/lib/utils";
import { Card } from "./Card";

interface SkeletonCardProps {
  className?: string;
}

/**
 * Individual skeleton card placeholder.
 * Uses chamfered Card for consistent design system treatment.
 */
export const SkeletonCard = ({ className }: SkeletonCardProps) => {
  return (
    <Card className={cn("animate-pulse", className)} cornerSize="sm" padding="md">
      <div className="h-4 bg-muted-foreground/10 w-3/4 mb-2" />
      <div className="h-3 bg-muted-foreground/10 w-1/2" />
    </Card>
  );
};

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * List of skeleton cards for content loading states.
 * Used for history lists, home dashboard sections, etc.
 */
export const LoadingSkeleton = ({ count = 3, className }: LoadingSkeletonProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
