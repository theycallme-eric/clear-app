import { ReactNode } from "react";

interface AuthLayoutProps {
  header?: ReactNode;
  children: ReactNode;
}

export const AuthLayout = ({ header, children }: AuthLayoutProps) => {
  return (
    <div className="grain-overlay" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {header}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 var(--spacing-600)', paddingTop: 'var(--spacing-1000)' }}>
        {children}
      </div>
    </div>
  );
};
