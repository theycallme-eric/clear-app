import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

/**
 * Individual skeleton card placeholder.
 * Componentized for easy future styling/animation customization.
 */
export const SkeletonCard = ({ className }: SkeletonCardProps) => {
  return (
    <div className={cn("glass-card p-4 animate-pulse", className)}>
      <div className="h-4 bg-muted-foreground/10 rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted-foreground/10 rounded w-1/2" />
    </div>
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
