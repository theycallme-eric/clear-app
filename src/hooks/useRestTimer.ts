import { useState, useRef, useCallback, useEffect } from 'react';

interface RestTimerState {
  isActive: boolean;
  remainingSeconds: number;
  totalSeconds: number;
}

/** Play a two-tone completion sound via Web Audio API */
function playCompletionSound() {
  try {
    const ctx = new AudioContext();
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    const now = ctx.currentTime;
    playTone(880, now, 0.15);
    playTone(1100, now + 0.15, 0.2);
  } catch {
    // Audio not available — silent fallback
  }
}

export function useRestTimer() {
  const [timer, setTimer] = useState<RestTimerState>({
    isActive: false,
    remainingSeconds: 0,
    totalSeconds: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const dismissTimer = useCallback(() => {
    clearTimer();
    setTimer({ isActive: false, remainingSeconds: 0, totalSeconds: 0 });
  }, [clearTimer]);

  const startTimer = useCallback((seconds: number) => {
    clearTimer();
    endTimeRef.current = Date.now() + seconds * 1000;

    setTimer({ isActive: true, remainingSeconds: seconds, totalSeconds: seconds });

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      if (remaining <= 0) {
        clearTimer();
        playCompletionSound();
        // Auto-dismiss after 2 seconds
        setTimeout(() => {
          setTimer(prev => prev.remainingSeconds <= 0 ? { isActive: false, remainingSeconds: 0, totalSeconds: 0 } : prev);
        }, 2000);
      }
      setTimer(prev => ({ ...prev, remainingSeconds: remaining }));
    }, 250);
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  return { timer, startTimer, dismissTimer };
}
