// Home Dashboard Data Fetching
// Queries for workout history and streak calculation

import { supabase } from './supabase';
import type { WorkoutHistoryEntry, StreakData, AnchorType } from '@/types/workout';

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
    console.error('Error fetching workout history:', error);
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
    console.error('Error fetching streak data:', error);
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
 * Fetch full workout detail (sections + exercises) for a specific session
 */
export async function fetchWorkoutDetail(sessionId: string): Promise<import('@/types/workout').WorkoutHistoryEntry | null> {
  const { data: session, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    console.error('Error fetching workout detail:', error);
    return null;
  }

  // Fetch sections with exercises
  const { data: sections, error: sectionsError } = await supabase
    .from('workout_sections')
    .select('*, exercises(*)')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true });

  if (sectionsError) {
    console.error('Error fetching sections:', sectionsError);
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
      .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
      .map((ex: any) => ({
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
    console.error('Error fetching profile:', error);
    return null;
  }

  const { data: locationData, error: locError } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', user.id);

  if (locError) {
    console.error('Error fetching locations:', locError);
  }

  // Map database section types back to frontend types
  const sectionTypeMap: Record<string, import('@/types/workout').SectionType> = {
    warmup: 'warmup',
    mobility: 'mobility',
    primary_lift: 'primary',
    accessory: 'accessory',
    skill_power: 'skill',
    carries: 'carries',
    core: 'core',
    stability_balance: 'stability',
    conditioning: 'conditioning',
    cooldown: 'cooldown',
  };

  const enabledSections = (profile.enabled_sections || []).map(
    (s: string) => sectionTypeMap[s] || s
  ) as import('@/types/workout').SectionType[];

  // Map locations from database format to frontend format
  const locations = (locationData || []).map((loc: any) => ({
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
