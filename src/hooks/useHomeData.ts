import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
    fetchWorkoutHistory,
    fetchStreakData,
    fetchUserPreferences
} from '@/lib/home-data';
import {
    WorkoutHistoryEntry,
    StreakData,
    UserPreferences,
    getDefaultUserPreferences
} from '@/types/workout';

export interface IncompleteSession {
    id: string;
    date: string;
}

interface HomeDataState {
    workoutHistory: WorkoutHistoryEntry[];
    streakData: StreakData;
    userPreferences: UserPreferences;
    incompleteSession: IncompleteSession | null;
    isLoading: boolean;
    hasError: boolean;
}

export function useHomeData(userId: string | null) {
    const [state, setState] = useState<HomeDataState>({
        workoutHistory: [],
        streakData: { currentStreak: 0, lastWorkoutDate: null, weekView: {} },
        userPreferences: getDefaultUserPreferences(),
        incompleteSession: null,
        isLoading: false,
        hasError: false,
    });

    const loadHomeData = useCallback(async () => {
        if (!userId) return;

        setState(prev => ({ ...prev, isLoading: true, hasError: false }));

        try {
            const [history, streak, preferences] = await Promise.all([
                fetchWorkoutHistory(10),
                fetchStreakData(),
                fetchUserPreferences(),
            ]);

            setState(prev => ({
                ...prev,
                workoutHistory: history,
                streakData: streak,
                userPreferences: preferences || prev.userPreferences,
                isLoading: false,
            }));
        } catch (err) {
            console.error('Error loading home data:', err);
            setState(prev => ({ ...prev, isLoading: false, hasError: true }));
        }
    }, [userId]);

    const checkForIncompleteSession = useCallback(async () => {
        if (!userId) return;

        const { data: incomplete } = await supabase
            .from('workout_sessions')
            .select('id, date')
            .eq('user_id', userId)
            .eq('is_rest_day', false)
            .is('completed_at', null)
            .order('created_at', { ascending: false })
            .limit(1);

        if (incomplete && incomplete.length > 0) {
            const session = incomplete[0] as any;
            const dateStr = new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
            setState(prev => ({
                ...prev,
                incompleteSession: { id: session.id, date: dateStr }
            }));
        }
    }, [userId]);

    const clearIncompleteSession = useCallback(() => {
        setState(prev => ({ ...prev, incompleteSession: null }));
    }, []);

    const setUserPreferences = useCallback((prefs: UserPreferences | ((prev: UserPreferences) => UserPreferences)) => {
        setState(prev => ({
            ...prev,
            userPreferences: typeof prefs === 'function' ? prefs(prev.userPreferences) : prefs,
        }));
    }, []);

    return {
        ...state,
        loadHomeData,
        checkForIncompleteSession,
        clearIncompleteSession,
        setUserPreferences,
    };
}
