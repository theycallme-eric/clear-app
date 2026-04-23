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
    <div
      className={cn("grain-overlay", className)}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ClearLogo size="lg" boot />
      {subtitle && (
        <p
          className="text-label-sm animate-pulse"
          style={{ marginTop: 'var(--spacing-300)', color: 'var(--text-paragraph)' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
