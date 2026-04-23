import { ReactNode } from "react";

interface OnboardingLayoutProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export const OnboardingLayout = ({ header, footer, children }: OnboardingLayoutProps) => {
  return (
    <div className="grain-overlay" style={{ minHeight: '100vh' }}>
      {header}
      <div style={{
        maxWidth: '28rem',
        margin: '0 auto',
        paddingTop: 'var(--spacing-1000)',
        paddingBottom: 'var(--spacing-1300)',
      }}>
        <div style={{ padding: '0 var(--spacing-400)' }}>
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
};
