import { useState, useEffect, useRef, useCallback } from 'react';
import { ScanLoader } from './ScanLoader';

// ============================================
// TYPES
// ============================================

interface BootScreenProps {
  /** True when auth/data has resolved — boot will finish current sweep then exit */
  ready: boolean;
  /** Called after final sweep completes — parent navigates here */
  onComplete: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const BOOT_MESSAGES = [
  'AUTHENTICATING USER',
  'LOADING TRAINING HISTORY',
  'CALIBRATING INTENSITY',
  'GENERATING WORKOUT',
  'SYSTEM READY',
];

const TYPEWRITER_MS = 42;

// ============================================
// COMPONENT
// ============================================

export const BootScreen = ({ ready, onComplete }: BootScreenProps) => {
  const [sweepCount, setSweepCount] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const typewriterRef = useRef<ReturnType<typeof setInterval>>(null);
  const hasCompletedRef = useRef(false);
  const readyRef = useRef(ready);

  // Keep ref in sync so the sweep callback sees latest value
  readyRef.current = ready;

  // Typewriter effect for status messages
  const typeMessage = useCallback((text: string) => {
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    setDisplayText('');
    let i = 0;
    typewriterRef.current = setInterval(() => {
      if (i < text.length) {
        i++;
        setDisplayText(text.slice(0, i));
      } else {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
      }
    }, TYPEWRITER_MS);
  }, []);

  // Type the first message on mount
  useEffect(() => {
    typeMessage(BOOT_MESSAGES[0]);
    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, [typeMessage]);

  // Handle sweep completion — called when ScanLoader finishes one down sweep
  const handleSweepComplete = useCallback(() => {
    if (hasCompletedRef.current) return;

    const nextSweep = sweepCount + 1;

    // If ready OR all messages played, exit
    if (readyRef.current || nextSweep >= BOOT_MESSAGES.length) {
      hasCompletedRef.current = true;
      setIsRunning(false);
      setProgress(100);
      onComplete();
      return;
    }

    // Advance to next sweep — key change will remount ScanLoader for fresh sweep
    setSweepCount(nextSweep);
    setProgress(Math.round((nextSweep / BOOT_MESSAGES.length) * 100));
    typeMessage(BOOT_MESSAGES[nextSweep]);
  }, [sweepCount, onComplete, typeMessage]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(23, 23, 23, 0.15)',
      }}
    >
      {/* Canvas — fills entire screen, key forces remount per sweep */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <ScanLoader
          key={sweepCount}
          direction="down-once"
          running={isRunning}
          onSweepComplete={handleSweepComplete}
        />
      </div>

      {/* Logo */}
      <div style={{ position: 'relative', zIndex: 10, userSelect: 'none' }}>
        <h1
          style={{
            fontWeight: 'bold',
            textTransform: 'uppercase',
            position: 'relative',
            fontFamily: "'Oxanium', monospace",
            fontSize: 'clamp(52px, 12vw, 80px)',
            letterSpacing: '0.18em',
            color: 'var(--foreground)',
            lineHeight: 1,
          }}
        >
          CLEAR
          {/* Rule across logo at 57% */}
          <span
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              left: '-12%',
              right: '-12%',
              height: '2px',
              top: '57%',
              background: 'var(--primary)',
              boxShadow: '0 0 8px var(--primary), 0 0 20px color-mix(in srgb, var(--primary) 40%, transparent), 0 0 40px color-mix(in srgb, var(--primary) 15%, transparent)',
            }}
          />
        </h1>
      </div>

      {/* Status message */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: 'calc(var(--spacing-600) + var(--spacing-100))',
          minHeight: '18px',
          fontFamily: "'Oxanium', monospace",
          fontWeight: 500,
          fontSize: '11px',
          letterSpacing: '0.32em',
          color: 'var(--primary)',
          textTransform: 'uppercase',
        }}
      >
        {displayText}
      </div>

      {/* Progress bar — bottom center */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          bottom: '52px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(260px, 65vw)',
        }}
      >
        <div
          style={{
            textAlign: 'right',
            marginBottom: '6px',
            fontSize: '9px',
            letterSpacing: '0.3em',
            color: 'color-mix(in srgb, var(--primary) 40%, transparent)',
          }}
        >
          {progress}%
        </div>
        <div
          style={{
            height: '1px',
            background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--primary)',
              boxShadow: '0 0 6px color-mix(in srgb, var(--primary) 70%, transparent)',
              transition: 'width 0.08s linear',
            }}
          />
        </div>
      </div>
    </div>
  );
};
