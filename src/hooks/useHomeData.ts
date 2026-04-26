import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWorkoutHistory, fetchStreakData, fetchIncompleteSession } from '@/lib/home-data';
import { queryKeys } from '@/lib/query-keys';
import type { WorkoutHistoryEntry, StreakData } from '@/types/workout';

export interface IncompleteSession {
  id: string;
  date: string;
}

const DEFAULT_STREAK: StreakData = { currentStreak: 0, lastWorkoutDate: null, weekView: {} };

export function useHomeData(userId: string | null) {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: queryKeys.workoutHistory(userId!),
    queryFn: () => fetchWorkoutHistory(10),
    enabled: !!userId,
  });

  const streakQuery = useQuery({
    queryKey: queryKeys.streakData(userId!),
    queryFn: fetchStreakData,
    enabled: !!userId,
  });

  const incompleteQuery = useQuery({
    queryKey: queryKeys.incompleteSession(userId!),
    queryFn: () => fetchIncompleteSession(userId!),
    enabled: !!userId,
  });

  const loadHomeData = useCallback(async () => {
    if (!userId) return;
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.workoutHistory(userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.streakData(userId) }),
      ]);
    } catch {
      // Query invalidation is best-effort — data will refresh on next visit
    }
  }, [userId, queryClient]);

  const checkForIncompleteSession = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey: queryKeys.incompleteSession(userId) });
  }, [userId, queryClient]);

  const clearIncompleteSession = useCallback(() => {
    if (!userId) return;
    queryClient.setQueryData(queryKeys.incompleteSession(userId), null);
  }, [userId, queryClient]);

  return {
    workoutHistory: (historyQuery.data ?? []) as WorkoutHistoryEntry[],
    streakData: (streakQuery.data ?? DEFAULT_STREAK) as StreakData,
    incompleteSession: (incompleteQuery.data ?? null) as IncompleteSession | null,
    isLoading: historyQuery.isLoading || streakQuery.isLoading,
    hasError: historyQuery.isError || streakQuery.isError,
    loadHomeData,
    checkForIncompleteSession,
    clearIncompleteSession,
  };
}
