import { ArrowLeft, Menu } from "lucide-react";
import { ClearLogo } from "@/components/ClearLogo";
import { TimerDisplay } from "@/components/TimerDisplay";
import { ChamferedFrame } from "@/components/ChamferedFrame";
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
      return <ClearLogo size="md" />;
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
    <header className="sticky top-0 z-40 flex items-stretch h-12 backdrop-blur-xl">
      {/* Main body — chamfered frame, bottom border only, no accent bar */}
      <ChamferedFrame
        cornerSize="md"
        surfaceColor="var(--surface-heading)"
        borderColor="var(--border-heading)"
        hasLeftBorder={true}
        bottomBorderOnly
        className="flex-1"
      >
        <div className="grid grid-cols-[48px_1fr_48px] items-center h-full px-4">
          <div className="flex items-center justify-start">
            {renderLeft()}
          </div>
          <div className="flex items-center justify-center">
            {renderCenter()}
          </div>
          <div className="flex items-center justify-end">
            {renderRight()}
          </div>
        </div>
      </ChamferedFrame>
    </header>
  );
};
