import { supabase } from './supabase';
import { logger } from './logger';
import type { Database } from '@/types/database';

type SavedWorkoutRow = Database['public']['Tables']['saved_workouts']['Row'];

export interface SavedWorkoutSummary {
  id: string;
  originalSessionId: string | null;
  title: string;
  anchor: string | null;
  intensity: number | null;
  durationMins: number | null;
  timesCompleted: number;
  lastCompletedAt: string | null;
  createdAt: string;
}

/**
 * Check if a session has been favorited.
 * Returns the saved_workout ID if it exists.
 */
export async function isFavorited(
  sessionId: string
): Promise<{ isFavorited: boolean; savedWorkoutId?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isFavorited: false };

  const { data, error } = await supabase
    .from('saved_workouts')
    .select('id')
    .eq('user_id', user.id)
    .eq('original_session_id', sessionId)
    .maybeSingle();

  if (error) {
    logger.data.error('isFavorited check failed', { error: error.message });
    return { isFavorited: false };
  }

  return data
    ? { isFavorited: true, savedWorkoutId: data.id }
    : { isFavorited: false };
}

/**
 * Save a workout as a favorite.
 * @param sessionId - The workout session to favorite
 * @param fromSummary - If true, counts as first completion (times_completed=1)
 */
export async function saveFavorite(
  sessionId: string,
  fromSummary: boolean
): Promise<{ savedWorkoutId: string } | { error: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check if already favorited
  const existing = await isFavorited(sessionId);
  if (existing.isFavorited) {
    return { savedWorkoutId: existing.savedWorkoutId! };
  }

  // Fetch the session + sections + exercises to build snapshot
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    logger.data.error('saveFavorite: session fetch failed', { error: sessionError?.message });
    return { error: 'Could not load workout session' };
  }

  const { data: sections, error: sectionsError } = await supabase
    .from('workout_sections')
    .select('*, exercises(*)')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true });

  if (sectionsError) {
    logger.data.error('saveFavorite: sections fetch failed', { error: sectionsError.message });
    return { error: 'Could not load workout sections' };
  }

  // Build the JSONB snapshot (matches GeneratedWorkout shape for reload)
  const snapshot = {
    sections: (sections || []).map(section => ({
      section_type: section.section_type,
      order_index: section.order_index,
      section_notes: section.section_notes,
      exercises: (section.exercises || [])
        .sort((a: { order_index?: number }, b: { order_index?: number }) =>
          (a.order_index || 0) - (b.order_index || 0)
        )
        .map((ex: Database['public']['Tables']['exercises']['Row']) => ({
          exercise_id: ex.exercise_id,
          equipment_used: ex.equipment_used,
          sets: ex.sets,
          reps: ex.reps,
          effort_percent: ex.effort_percent,
          tempo: ex.tempo,
          rest_seconds: ex.rest_seconds,
          coaching_cues: ex.coaching_cues,
          order_index: ex.order_index,
          structure: ex.structure ?? null,
        })),
    })),
  };

  const title = `${(session.anchor || 'workout').replace(/^\w/, (c: string) => c.toUpperCase())} Workout`;

  const { data: saved, error: saveError } = await supabase
    .from('saved_workouts')
    .insert({
      user_id: user.id,
      original_session_id: sessionId,
      workout_snapshot: snapshot,
      title,
      anchor: session.anchor,
      intensity: session.intensity,
      duration_mins: session.duration_mins,
      times_completed: fromSummary ? 1 : 0,
      last_completed_at: fromSummary ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (saveError || !saved) {
    logger.data.error('saveFavorite: insert failed', { error: saveError?.message });
    return { error: 'Failed to save favorite' };
  }

  // If from summary, record this session as the first completion
  if (fromSummary) {
    const { error: completionError } = await supabase
      .from('saved_workout_completions')
      .insert({
        saved_workout_id: saved.id,
        session_id: sessionId,
      });

    if (completionError) {
      logger.data.warn('saveFavorite: completion record failed', { error: completionError.message });
    }
  }

  logger.data.info('Workout favorited', { savedWorkoutId: saved.id, fromSummary });
  return { savedWorkoutId: saved.id };
}

/**
 * Remove a workout from favorites.
 * CASCADE handles deleting completions.
 */
export async function removeFavorite(
  savedWorkoutId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('saved_workouts')
    .delete()
    .eq('id', savedWorkoutId);

  if (error) {
    logger.data.error('removeFavorite failed', { error: error.message });
    return { success: false, error: error.message };
  }

  logger.data.info('Favorite removed', { savedWorkoutId });
  return { success: true };
}

/**
 * Rename a saved workout.
 */
export async function renameFavorite(
  savedWorkoutId: string,
  newTitle: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('saved_workouts')
    .update({ title: newTitle })
    .eq('id', savedWorkoutId);

  if (error) {
    logger.data.error('renameFavorite failed', { error: error.message });
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all favorites for the current user, ordered by creation date.
 */
export async function getFavorites(): Promise<SavedWorkoutSummary[]> {
  const { data, error } = await supabase
    .from('saved_workouts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    logger.data.error('getFavorites failed', { error: error.message });
    return [];
  }

  return (data || []).map((row: SavedWorkoutRow) => ({
    id: row.id,
    originalSessionId: row.original_session_id,
    title: row.title,
    anchor: row.anchor,
    intensity: row.intensity,
    durationMins: row.duration_mins,
    timesCompleted: row.times_completed ?? 0,
    lastCompletedAt: row.last_completed_at,
    createdAt: row.created_at,
  }));
}

/**
 * Get full detail for a single favorite including completion history.
 */
export async function getFavoriteDetail(savedWorkoutId: string) {
  const { data: saved, error } = await supabase
    .from('saved_workouts')
    .select('*')
    .eq('id', savedWorkoutId)
    .single();

  if (error || !saved) {
    logger.data.error('getFavoriteDetail failed', { error: error?.message });
    return null;
  }

  // Fetch completion history
  const { data: completions, error: completionsError } = await supabase
    .from('saved_workout_completions')
    .select('*, workout_sessions(date, duration_mins, mood)')
    .eq('saved_workout_id', savedWorkoutId)
    .order('completed_at', { ascending: false });

  if (completionsError) {
    logger.data.warn('getFavoriteDetail: completions fetch failed', { error: completionsError.message });
  }

  return {
    ...saved,
    completions: completions || [],
  };
}

/**
 * Get the session ID from the most recent completion of a saved workout.
 * Returns the original session ID if no completions exist.
 */
export async function getMostRecentSessionId(
  savedWorkoutId: string,
  originalSessionId: string
): Promise<string> {
  const { data, error } = await supabase
    .from('saved_workout_completions')
    .select('session_id')
    .eq('saved_workout_id', savedWorkoutId)
    .order('completed_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0 || !data[0].session_id) {
    return originalSessionId;
  }

  return data[0].session_id;
}

/**
 * Fetch the most recent completion's exercise data (weights + notes) for a saved workout.
 * Returns a map keyed by "{section_order_index}-{exercise_order_index}" → { weight, notes }.
 */
export async function getLastExerciseData(
  savedWorkoutId: string
): Promise<Record<string, { weight?: string; notes?: string }>> {
  // Find the most recent completion's session
  const { data: completions, error: compError } = await supabase
    .from('saved_workout_completions')
    .select('session_id')
    .eq('saved_workout_id', savedWorkoutId)
    .order('completed_at', { ascending: false })
    .limit(1);

  if (compError || !completions || completions.length === 0) {
    return {};
  }

  const lastSessionId = completions[0].session_id;
  if (!lastSessionId) return {};

  // Fetch exercises from that session with weights and notes
  const { data: sections, error: sectionsError } = await supabase
    .from('workout_sections')
    .select('order_index, exercises(order_index, weight_logged, exercise_notes)')
    .eq('session_id', lastSessionId)
    .order('order_index', { ascending: true });

  if (sectionsError || !sections) return {};

  const result: Record<string, { weight?: string; notes?: string }> = {};
  for (const section of sections) {
    const exercises = (section.exercises || []) as Array<{
      order_index: number;
      weight_logged: string | null;
      exercise_notes: string | null;
    }>;
    for (const ex of exercises) {
      if (ex.weight_logged || ex.exercise_notes) {
        result[`${section.order_index}-${ex.order_index}`] = {
          weight: ex.weight_logged || undefined,
          notes: ex.exercise_notes || undefined,
        };
      }
    }
  }

  return result;
}

/**
 * Fetch all session notes from all completions of a saved workout.
 * Returns chronologically ordered list (newest first) for the running log.
 */
export async function getSessionNotesHistory(
  savedWorkoutId: string
): Promise<Array<{ date: string; notes: string }>> {
  const { data, error } = await supabase
    .from('saved_workout_completions')
    .select('completed_at, workout_sessions(date, session_notes)')
    .eq('saved_workout_id', savedWorkoutId)
    .order('completed_at', { ascending: false });

  if (error || !data) return [];

  const entries: Array<{ date: string; notes: string }> = [];
  for (const completion of data) {
    const raw = completion.workout_sessions;
    const session = raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as { date: string; session_notes: string | null })
      : null;
    if (session?.session_notes) {
      entries.push({
        date: session.date,
        notes: session.session_notes,
      });
    }
  }

  return entries;
}

/**
 * Fetch previous best structure results for a saved workout's timed sections.
 * Returns a map keyed by section order_index → best result.
 */
export async function getPreviousBests(
  savedWorkoutId: string
): Promise<Record<number, { structureType: string; value: number }>> {
  // Get all completion session IDs
  const { data: completions, error: compError } = await supabase
    .from('saved_workout_completions')
    .select('session_id')
    .eq('saved_workout_id', savedWorkoutId);

  if (compError || !completions || completions.length === 0) return {};

  const sessionIds = completions
    .map(c => c.session_id)
    .filter((id): id is string => id !== null);

  if (sessionIds.length === 0) return {};

  // Fetch sections once — build ID list and order map
  const { data: sectionData, error: sectionsError } = await supabase
    .from('workout_sections')
    .select('id, order_index')
    .in('session_id', sessionIds);

  if (sectionsError || !sectionData || sectionData.length === 0) return {};

  const sectionOrderMap: Record<string, number> = {};
  const sectionIds: string[] = [];
  for (const s of sectionData) {
    sectionOrderMap[s.id] = s.order_index;
    sectionIds.push(s.id);
  }

  // Fetch structure results using the section IDs
  const { data: results, error: resultsError } = await supabase
    .from('structure_results')
    .select('structure_type, completion_time_seconds, rounds_completed, section_id')
    .in('section_id', sectionIds);

  if (resultsError || !results) return {};

  // Find best per section order_index
  const bests: Record<number, { structureType: string; value: number }> = {};

  for (const r of results) {
    const orderIndex = r.section_id ? sectionOrderMap[r.section_id] : undefined;
    if (orderIndex === undefined) continue;

    if (r.structure_type === 'for_time' && r.completion_time_seconds != null) {
      const current = bests[orderIndex];
      if (!current || r.completion_time_seconds < current.value) {
        bests[orderIndex] = { structureType: 'for_time', value: r.completion_time_seconds };
      }
    } else if (r.structure_type === 'amrap' && r.rounds_completed != null) {
      const current = bests[orderIndex];
      if (!current || r.rounds_completed > current.value) {
        bests[orderIndex] = { structureType: 'amrap', value: r.rounds_completed };
      }
    }
  }

  return bests;
}

/**
 * Record a completion of a favorited workout.
 * Increments times_completed and updates last_completed_at.
 */
export async function recordFavoriteCompletion(
  savedWorkoutId: string,
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  // Insert completion record
  const { error: insertError } = await supabase
    .from('saved_workout_completions')
    .insert({
      saved_workout_id: savedWorkoutId,
      session_id: sessionId,
    });

  if (insertError) {
    logger.data.error('recordFavoriteCompletion insert failed', { error: insertError.message });
    return { success: false, error: insertError.message };
  }

  // Update denormalized fields — count from completions table (race-safe)
  const { count } = await supabase
    .from('saved_workout_completions')
    .select('*', { count: 'exact', head: true })
    .eq('saved_workout_id', savedWorkoutId);

  const { error: updateError } = await supabase
    .from('saved_workouts')
    .update({
      times_completed: count ?? 1,
      last_completed_at: new Date().toISOString(),
    })
    .eq('id', savedWorkoutId);

  if (updateError) {
    logger.data.error('recordFavoriteCompletion update failed', { error: updateError.message });
    return { success: false, error: updateError.message };
  }

  return { success: true };
}
