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
      className="grain-overlay"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '7rem',
        position: 'relative',
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {header}
      <div style={{
        maxWidth: '28rem',
        margin: '0 auto',
        width: '100%',
        padding: '0 var(--spacing-400)',
        paddingTop: 'var(--spacing-1100)',
      }}>
        {children}
      </div>
      {footer}
    </div>
  );
};
