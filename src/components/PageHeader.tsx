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
          className="transition-colors"
          style={{ color: 'var(--icon-cta)', padding: 'var(--spacing-200)' }}
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
        className="text-heading-h4"
        style={{ color: 'var(--text-header)', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase' }}
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
          className="transition-colors"
          style={{ color: 'var(--icon-cta)', padding: 'var(--spacing-200)' }}
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
    <header
      className="scanlines"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'stretch',
        height: '48px',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Main body — chamfered frame, bottom border only, no accent bar */}
      <ChamferedFrame
        cornerSize="md"
        surfaceColor="var(--surface-heading)"
        borderColor="var(--border-heading)"
        hasLeftBorder={true}
        bottomBorderOnly
        style={{ flex: 1 }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr 48px',
          alignItems: 'center',
          height: '100%',
          padding: '0 var(--spacing-400)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            {renderLeft()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderCenter()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {renderRight()}
          </div>
        </div>
      </ChamferedFrame>
    </header>
  );
};
