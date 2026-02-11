import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchWorkoutHistory, fetchStreakData } from '@/lib/home-data';
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
      console.error('Error loading home data:', err);
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false, hasError: true }));
      }
    }
  }, [userId]);

  const checkForIncompleteSession = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: incomplete } = await supabase
        .from('workout_sessions')
        .select('id, date')
        .eq('user_id', userId)
        .eq('is_rest_day', false)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!mountedRef.current) return;

      if (incomplete && incomplete.length > 0) {
        const session = incomplete[0];
        const dateStr = new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        setState(prev => ({
          ...prev,
          incompleteSession: { id: session.id, date: dateStr }
        }));
      }
    } catch (err) {
      console.error('Error checking incomplete session:', err);
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
