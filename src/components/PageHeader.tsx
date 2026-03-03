import { ArrowLeft, Menu } from "lucide-react";
import { TimerDisplay } from "@/components/TimerDisplay";
import { useEffect, useState } from "react";

interface TimerProps {
  isRunning: boolean;
  startTime?: number;
  onTimeUpdate?: (seconds: number) => void;
}

interface PageHeaderProps {
  left?: 'back' | React.ReactNode;
  center?: 'logo' | 'timer' | string;
  right?: 'menu' | React.ReactNode;
  onBack?: () => void;
  onMenu?: () => void;
  timerProps?: TimerProps;
}

export const PageHeader = ({
  left,
  center = 'logo',
  right,
  onBack,
  onMenu,
  timerProps,
}: PageHeaderProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (center !== 'timer' || !timerProps?.isRunning) return;

    const start = timerProps.startTime || Date.now() - (elapsedSeconds * 1000);

    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - start) / 1000);
      setElapsedSeconds(seconds);
      timerProps.onTimeUpdate?.(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [center, timerProps?.isRunning, timerProps?.startTime, timerProps?.onTimeUpdate]);

  // Left slot
  const renderLeft = () => {
    if (left === 'back') {
      return (
        <button
          onClick={onBack}
          className="p-2 transition-colors"
          style={{ color: 'var(--icon-cta)' }}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
      );
    }
    if (left) return <>{left}</>;
    return null;
  };

  // Center slot
  const renderCenter = () => {
    if (center === 'logo') {
      return (
        <h1
          className="text-heading-h2 font-bold tracking-wider glow-emissive"
          style={{ color: 'var(--text-header)' }}
        >
          CLEAR
        </h1>
      );
    }
    if (center === 'timer') {
      return <TimerDisplay elapsedSeconds={elapsedSeconds} />;
    }
    // String title
    return (
      <h1
        className="text-heading-h4 font-bold tracking-wider uppercase"
        style={{ color: 'var(--text-header)' }}
      >
        {center}
      </h1>
    );
  };

  // Right slot
  const renderRight = () => {
    if (right === 'menu') {
      return (
        <button
          onClick={onMenu}
          className="p-2 transition-colors"
          style={{ color: 'var(--icon-cta)' }}
          aria-label="Menu"
        >
          <Menu size={24} />
        </button>
      );
    }
    if (right) return <>{right}</>;
    return null;
  };

  return (
    <header className="grid grid-cols-[48px_1fr_48px] items-center px-4 py-4">
      <div className="flex items-center justify-start">
        {renderLeft()}
      </div>
      <div className="flex items-center justify-center">
        {renderCenter()}
      </div>
      <div className="flex items-center justify-end">
        {renderRight()}
      </div>
    </header>
  );
};
