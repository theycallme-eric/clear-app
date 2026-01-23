import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Full-screen loading state. Used for app initialization and major transitions.
 * Componentized for easy future styling/animation customization.
 */
export const LoadingScreen = ({ message = "CLEAR", subtitle, className }: LoadingScreenProps) => {
  return (
    <div className={cn("min-h-screen grain-overlay flex flex-col items-center justify-center", className)}>
      <h1 className="font-display text-4xl font-bold tracking-wider text-foreground animate-pulse">
        {message}
      </h1>
      {subtitle && (
        <p className="mt-3 text-sm text-muted-foreground font-mono animate-pulse">
          {subtitle}
        </p>
      )}
    </div>
  );
};
