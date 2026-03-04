import { ReactNode } from "react";

interface AuthLayoutProps {
  header?: ReactNode;
  children: ReactNode;
}

export const AuthLayout = ({ header, children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen grain-overlay flex flex-col">
      {header}
      <div className="flex-1 flex flex-col px-6 pt-12">
        {children}
      </div>
    </div>
  );
};
