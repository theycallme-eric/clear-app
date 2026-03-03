import { ReactNode } from "react";

interface WorkoutLayoutProps {
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

export const WorkoutLayout = ({ header, footer, children, onTouchStart, onTouchEnd }: WorkoutLayoutProps) => {
  return (
    <div
      className="min-h-screen grain-overlay flex flex-col pb-28 relative"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="sticky top-0 z-10 backdrop-blur-md"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-neutral-900) 80%, transparent)' }}
      >
        {header}
      </div>
      <div className="max-w-md mx-auto w-full px-4 pt-2">
        {children}
      </div>
      {footer}
    </div>
  );
};
