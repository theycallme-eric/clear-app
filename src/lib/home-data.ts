// Home Dashboard Data Fetching
// Queries for workout history and streak calculation

import { supabase } from './supabase';
import { logger } from './logger';
import { DB_TO_SECTION } from './section-mapping';
import type { WorkoutHistoryEntry, StreakData, AnchorType } from '@/types/workout';
import type { Database } from '@/types/database';

/**
 * Fetch recent workout history for the current user
 */
export async function fetchWorkoutHistory(limit: number = 10): Promise<WorkoutHistoryEntry[]> {
  const { data: sessions, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('is_rest_day', false)
    .not('completed_at', 'is', null)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    logger.data.error('fetchWorkoutHistory failed', { error: error.message });
    return [];
  }

  return (sessions || []).map(session => ({
    id: session.id,
    date: new Date(session.date + 'T00:00:00'),
    anchor: session.anchor.toUpperCase() as AnchorType,
    intensity: session.intensity,
    duration: session.duration_mins || 0,
    goal: session.goal_preset || undefined,
    mood: session.mood ? parseInt(session.mood) : undefined,
    sessionNotes: session.session_notes || undefined,
  }));
}

/**
 * Calculate streak data from workout history
 *
 * Streak rules (from Backend Planning doc):
 * - Reset if: 1 missed day, 7 consecutive rest days, workout < 5 min
 * - Preserve if: workout >= 5 min, rest day marked (up to 6 consecutive)
 */
export async function fetchStreakData(): Promise<StreakData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get last 30 days of sessions
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: sessions, error } = await supabase
    .from('workout_sessions')
    .select('date, is_rest_day, counts_for_streak, duration_mins, completed_at')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    logger.data.error('fetchStreakData failed', { error: error.message });
    return { currentStreak: 0, lastWorkoutDate: null, weekView: {} };
  }

  // Build a map of date -> session info
  const dateMap = new Map<string, { isWorkout: boolean; isRest: boolean; countsForStreak: boolean }>();

  for (const session of sessions || []) {
    const dateKey = session.date;
    const isCompletedWorkout = !session.is_rest_day && session.completed_at !== null;
    const countsForStreak = session.counts_for_streak && (session.duration_mins || 0) >= 5;

    dateMap.set(dateKey, {
      isWorkout: isCompletedWorkout,
      isRest: session.is_rest_day,
      countsForStreak: countsForStreak || session.is_rest_day,
    });
  }

  // Calculate current streak
  let currentStreak = 0;
  let consecutiveRestDays = 0;
  let lastWorkoutDate: Date | null = null;

  // Start from yesterday and count backwards
  const checkDate = new Date(today);
  checkDate.setDate(checkDate.getDate() - 1);

  while (true) {
    const dateKey = checkDate.toISOString().split('T')[0];
    const dayData = dateMap.get(dateKey);

    if (!dayData) {
      // No activity on this day - streak broken
      break;
    }

    if (dayData.isWorkout && dayData.countsForStreak) {
      currentStreak++;
      consecutiveRestDays = 0;
      if (!lastWorkoutDate) {
        lastWorkoutDate = new Date(checkDate);
      }
    } else if (dayData.isRest) {
      consecutiveRestDays++;
      // 7 consecutive rest days breaks the streak
      if (consecutiveRestDays >= 7) {
        break;
      }
      // Rest days don't add to streak but don't break it either (up to 6)
    } else {
      // Day exists but doesn't count - streak broken
      break;
    }

    checkDate.setDate(checkDate.getDate() - 1);

    // Don't go back more than 30 days
    if (checkDate < thirtyDaysAgo) {
      break;
    }
  }

  // Check if today has activity
  const todayKey = today.toISOString().split('T')[0];
  const todayData = dateMap.get(todayKey);
  if (todayData?.isWorkout && todayData.countsForStreak) {
    currentStreak++;
    lastWorkoutDate = today;
  }

  // Build week view
  const weekView: Record<string, 'workout' | 'rest' | null> = {};
  const weekStart = new Date(today);
  const dayOfWeek = weekStart.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setDate(weekStart.getDate() + mondayOffset);

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    const dayData = dateMap.get(dateKey);

    if (dayData?.isWorkout) {
      weekView[dateKey] = 'workout';
    } else if (dayData?.isRest) {
      weekView[dateKey] = 'rest';
    } else {
      weekView[dateKey] = null;
    }
  }

  return {
    currentStreak,
    lastWorkoutDate,
    weekView,
  };
}

/**
 * Check for an incomplete (started but not finished) workout session
 */
export async function fetchIncompleteSession(userId: string): Promise<{ id: string; date: string } | null> {
  const { data: incomplete } = await supabase
    .from('workout_sessions')
    .select('id, date')
    .eq('user_id', userId)
    .eq('is_rest_day', false)
    .is('completed_at', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (incomplete && incomplete.length > 0) {
    const session = incomplete[0];
    const dateStr = new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return { id: session.id, date: dateStr };
  }

  return null;
}

/**
 * Fetch full workout detail (sections + exercises) for a specific session
 */
export async function fetchWorkoutDetail(sessionId: string): Promise<import('@/types/workout').WorkoutHistoryEntry | null> {
  const { data: session, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    logger.data.error('fetchWorkoutDetail failed', { error: error.message });
    return null;
  }

  // Fetch sections with exercises
  const { data: sections, error: sectionsError } = await supabase
    .from('workout_sections')
    .select('*, exercises(*)')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true });

  if (sectionsError) {
    logger.data.error('fetchWorkoutDetail sections failed', { error: sectionsError.message });
  }

  // Map section type to display name
  const sectionNameMap: Record<string, string> = {
    warmup: 'Warm-up',
    mobility: 'Mobility',
    primary_lift: 'Primary Lift',
    accessory: 'Accessory',
    skill_power: 'Skill / Power',
    carries: 'Carries',
    core: 'Core',
    stability_balance: 'Stability',
    conditioning: 'Conditioning',
    cooldown: 'Cooldown',
  };

  const loggedSections: import('@/types/workout').LoggedSection[] = (sections || []).map(section => ({
    id: section.id,
    name: sectionNameMap[section.section_type] || section.section_type,
    exercises: (section.exercises || [])
      .sort((a: { order_index?: number }, b: { order_index?: number }) => (a.order_index || 0) - (b.order_index || 0))
      .map((ex: Database['public']['Tables']['exercises']['Row']) => ({
        id: ex.id,
        name: ex.exercise_id?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Unknown',
        sets: ex.sets || 1,
        reps: ex.reps || '—',
        weight: ex.weight_logged || undefined,
        note: ex.exercise_notes || undefined,
      })),
  }));

  return {
    id: session.id,
    date: new Date(session.date + 'T00:00:00'),
    anchor: session.anchor.toUpperCase() as AnchorType,
    intensity: session.intensity,
    duration: session.duration_mins || 0,
    goal: session.goal_preset || undefined,
    mood: session.mood ? parseInt(session.mood) : undefined,
    sessionNotes: session.session_notes || undefined,
    sections: loggedSections,
  };
}

/**
 * Fetch user's profile and convert to UserPreferences format
 */
export async function fetchUserPreferences(): Promise<import('@/types/workout').UserPreferences | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch profile and locations separately to avoid ambiguous relationship error
  // (profiles has both default_location_id FK and locations has user_id FK)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    logger.data.error('fetchUserPreferences failed', { error: error.message });
    return null;
  }

  const { data: locationData, error: locError } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', user.id);

  if (locError) {
    logger.data.error('fetchUserPreferences locations failed', { error: locError.message });
  }

  // Map database section types back to frontend types
  const enabledSections = (profile.enabled_sections || []).map(
    (s: string) => DB_TO_SECTION[s] || s
  ) as import('@/types/workout').SectionType[];

  // Map locations from database format to frontend format
  type LocationRow = Database['public']['Tables']['locations']['Row'];
  const locations = (locationData || []).map((loc: LocationRow) => ({
    id: loc.id,
    name: loc.name,
    tier: loc.tier as import('@/types/workout').EquipmentTier,
    equipment: loc.equipment || [],
  }));

  return {
    onboardingComplete: profile.onboarding_completed || false,
    experienceLevel: profile.experience_level as import('@/types/workout').ExperienceLevel | null,
    goal: profile.goal_preset as import('@/types/workout').GoalPreset | null,
    limitations: profile.limitations || '',
    sections: enabledSections,
    locations,
    defaultLocationId: profile.default_location_id || (locations[0]?.id ?? null),
  };
}
