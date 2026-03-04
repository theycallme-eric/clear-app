import { ReactNode } from "react";

interface OnboardingLayoutProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export const OnboardingLayout = ({ header, footer, children }: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen grain-overlay">
      {header}
      <div className="max-w-md mx-auto pt-12 pb-32">
        <div className="px-4">
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
};
