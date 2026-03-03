import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { fetchWorkoutHistory, fetchStreakData, fetchIncompleteSession } from '@/lib/home-data';
import { WorkoutHistoryEntry, StreakData } from '@/types/workout';

export interface IncompleteSession {
  id: string;
  date: string;
}

interface HomeDataState {
  workoutHistory: WorkoutHistoryEntry[];
  streakData: StreakData;
  incompleteSession: IncompleteSession | null;
  isLoading: boolean;
  hasError: boolean;
}

export function useHomeData(userId: string | null) {
  const [state, setState] = useState<HomeDataState>({
    workoutHistory: [],
    streakData: { currentStreak: 0, lastWorkoutDate: null, weekView: {} },
    incompleteSession: null,
    isLoading: false,
    hasError: false,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadHomeData = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, isLoading: true, hasError: false }));

    try {
      const [history, streak] = await Promise.all([
        fetchWorkoutHistory(10),
        fetchStreakData(),
      ]);

      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        workoutHistory: history,
        streakData: streak,
        isLoading: false,
      }));
    } catch (err) {
      logger.data.error('loadHomeData failed', { error: err instanceof Error ? err.message : String(err) });
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false, hasError: true }));
      }
    }
  }, [userId]);

  const checkForIncompleteSession = useCallback(async () => {
    if (!userId) return;

    try {
      const session = await fetchIncompleteSession(userId);
      if (!mountedRef.current) return;

      if (session) {
        setState(prev => ({
          ...prev,
          incompleteSession: session
        }));
      }
    } catch (err) {
      logger.data.error('checkForIncompleteSession failed', { error: err instanceof Error ? err.message : String(err) });
    }
  }, [userId]);

  const clearIncompleteSession = useCallback(() => {
    setState(prev => ({ ...prev, incompleteSession: null }));
  }, []);

  return {
    ...state,
    loadHomeData,
    checkForIncompleteSession,
    clearIncompleteSession,
  };
}
