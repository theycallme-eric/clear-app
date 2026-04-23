import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { width: 'var(--spacing-400)', height: 'var(--spacing-400)', borderWidth: '2px' },
  md: { width: 'var(--spacing-600)', height: 'var(--spacing-600)', borderWidth: '2px' },
  lg: { width: 'var(--spacing-700)', height: 'var(--spacing-700)', borderWidth: '3px' },
};

/**
 * Inline loading spinner for buttons and in-place loading.
 * Componentized for easy future styling/animation customization.
 */
export const LoadingSpinner = ({ size = "md", className, message }: LoadingSpinnerProps) => {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-200)' }}>
      <div
        className="animate-spin"
        style={{
          ...sizeStyles[size],
          borderRadius: '9999px',
          borderStyle: 'solid',
          borderColor: 'var(--border-subtle)',
          borderTopColor: 'var(--border-card)',
        }}
      />
      {message && (
        <span className="text-label-sm" style={{ fontFamily: 'monospace', color: 'var(--text-paragraph)' }}>{message}</span>
      )}
    </div>
  );
};
