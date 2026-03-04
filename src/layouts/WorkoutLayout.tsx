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
      {header}
      <div className="max-w-md mx-auto w-full px-4 pt-14">
        {children}
      </div>
      {footer}
    </div>
  );
};
