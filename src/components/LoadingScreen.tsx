import { cn } from "@/lib/utils";
import { ClearLogo } from "@/components/ClearLogo";

interface LoadingScreenProps {
  subtitle?: string;
  className?: string;
}

/**
 * Full-screen loading state. Used for app initialization and major transitions.
 * Shows the ClearLogo with boot animation as visual feedback.
 */
export const LoadingScreen = ({ subtitle, className }: LoadingScreenProps) => {
  return (
    <div className={cn("min-h-screen grain-overlay flex flex-col items-center justify-center", className)}>
      <ClearLogo size="lg" boot />
      {subtitle && (
        <p
          className="mt-3 text-label-sm animate-pulse"
          style={{ color: 'var(--text-paragraph)' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
