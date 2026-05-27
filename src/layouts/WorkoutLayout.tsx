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
    <>
      <div
        className="grain-overlay"
        style={{ minHeight: '100vh' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {header}
        <div style={{
          maxWidth: '28rem',
          margin: '0 auto',
          paddingTop: 'var(--spacing-1100)',
          paddingBottom: footer ? 'var(--spacing-1300)' : 'var(--spacing-700)',
        }}>
          <div style={{ padding: '0 var(--spacing-400)' }}>
            {children}
          </div>
        </div>
      </div>
      {footer}
    </>
  );
};
