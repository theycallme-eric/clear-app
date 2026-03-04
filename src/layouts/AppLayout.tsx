import { ReactNode } from "react";

interface AppLayoutProps {
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export const AppLayout = ({ header, footer, children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen grain-overlay">
      <div className={`max-w-md mx-auto ${footer ? 'pb-32' : 'pb-8'}`}>
        {header}
        <div className="px-4">
          {children}
        </div>
      </div>
      {footer}
    </div>
  );
};
