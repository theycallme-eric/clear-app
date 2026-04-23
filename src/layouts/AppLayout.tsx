import { ReactNode } from "react";

interface AppLayoutProps {
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export const AppLayout = ({ header, footer, children }: AppLayoutProps) => {
  return (
    <div className="grain-overlay" style={{ minHeight: '100vh' }}>
      {header}
      <div style={{
        maxWidth: '28rem',
        margin: '0 auto',
        paddingTop: 'var(--spacing-1000)',
        paddingBottom: footer ? 'var(--spacing-1300)' : 'var(--spacing-700)',
      }}>
        <div style={{ padding: '0 var(--spacing-400)' }}>
          {children}
        </div>
      </div>
      {footer}
    </div>
  );
};
