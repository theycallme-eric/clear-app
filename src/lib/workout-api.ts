// Workout Generation API Client
// Calls the generate-workout Supabase Edge Function

import { supabase } from './supabase';
import { logger } from './logger';
import type {
  GenerateWorkoutRequest,
  GenerateWorkoutResponse,
  GenerateSectionRequest,
  GenerateSectionResponse,
  GenerationError,
  GeneratedWorkout as APIGeneratedWorkout,
} from '@/types/generation';
import type { GeneratedWorkout, WorkoutSection, Exercise } from '@/types/workout';
import type { Database } from '@/types/database';

export { isGenerationError } from '@/types/generation';

/**
 * Transform API response to frontend workout type
 */
export function transformAPIWorkoutToFrontend(
  apiWorkout: APIGeneratedWorkout,
  intensity: number,
  anchor: string,
  goal?: string
): GeneratedWorkout {
  const sections: WorkoutSection[] = apiWorkout.sections.map((section, sectionIndex) => {
    // Map API section_type to frontend type
    const typeMap: Record<string, WorkoutSection['type']> = {
      warmup: 'warmup',
      mobility: 'mobility',
      primary_lift: 'primary',
      accessory: 'accessory',
      core: 'core',
      conditioning: 'conditioning',
      cooldown: 'cooldown',
    };

    const exercises: Exercise[] = section.exercises.map((ex, exIndex) => ({
      id: ex.exercise_id || `${section.section_type}-${exIndex}`,
      name: ex.name,
      sets: ex.sets || 1,
      reps: typeof ex.reps === 'string' && ex.reps.includes(' ')
        ? ex.reps  // Keep string reps like "30 sec" or "8 each side"
        : String(parseInt(ex.reps) || 1),
      effort: ex.effort_percent ? `${ex.effort_percent}%` : undefined,
      tempo: ex.tempo || undefined,
      rest: ex.rest_seconds ? `${ex.rest_seconds}s` : undefined,
      coachingCues: ex.coaching_cues || undefined,
      regression: ex.regression || undefined,
      equipment: ex.equipment || undefined,
      structure: ex.structure
        ? ex.structure.type === 'circuit'
          ? { ...ex.structure, rounds: (ex.structure as { rounds?: number }).rounds || 1 }
          : ex.structure.type === 'afap' || ex.structure.type === 'timed'
            ? { type: 'for_time' as const, time_cap_mins: ('time_cap_mins' in ex.structure ? ex.structure.time_cap_mins : 0), group_id: ex.structure.group_id }
            : ex.structure as Exercise['structure']
        : undefined,
    }));

    return {
      id: section.section_type + '-' + sectionIndex,
      name: section.section_title,
      type: typeMap[section.section_type] || 'accessory',
      exercises,
      status: 'not_started' as const,
    };
  });

  return {
    id: crypto.randomUUID(),
    title: apiWorkout.title,
    description: apiWorkout.overview,
    duration: `${apiWorkout.estimated_duration_mins}m`,
    intensity,
    anchor: anchor.toUpperCase(),
    goal,
    sections,
  };
}

/**
 * Generate a workout using the AI Edge Function
 *
 * @param request - The workout generation parameters
 * @returns The generated workout or an error
 *
 * @example
 * ```ts
 * const result = await generateWorkout({
 *   intensity: 6,
 *   anchor: 'hinge',
 *   duration_mins: 45,
 *   location_id: 'my-location-id',
 *   notes: 'Focus on deadlifts today'
 * });
 *
 * if (isGenerationError(result)) {
 *   console.error(result.error);
 * } else {
 *   console.log(result.workout.title);
 * }
 * ```
 */
export async function generateWorkout(
  request: GenerateWorkoutRequest
): Promise<GenerateWorkoutResponse | GenerationError> {
  logger.workout.info('generateWorkout started', {
    anchor: request.anchor,
    intensity: request.intensity,
    durationMins: request.duration_mins,
  });
  const startTime = performance.now();

  try {
    // Get current session for auth
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      logger.workout.error('generateWorkout: not authenticated', { error: sessionError?.message });
      return { error: 'Not authenticated', details: 'Please sign in to generate workouts' };
    }

    logger.workout.debug('Calling Edge Function');

    // Call the Edge Function with explicit auth header
    const { data, error } = await supabase.functions.invoke('generate-workout', {
      body: request,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const durationMs = Math.round(performance.now() - startTime);

    if (error) {
      const errorMsg = data?.error || error.message || 'Unknown error';
      logger.workout.error('generateWorkout Edge Function error', { error: errorMsg, durationMs });
      return {
        error: 'Failed to generate workout',
        details: errorMsg,
      };
    }

    logger.workout.info('generateWorkout succeeded', {
      durationMs,
      workoutTitle: data?.workout?.title,
      sectionsCount: data?.workout?.sections?.length,
    });
    return data as GenerateWorkoutResponse;

  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    logger.workout.error('generateWorkout exception', {
      error: err instanceof Error ? err.message : String(err),
      durationMs,
    });
    return {
      error: 'Network error',
      details: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate a replacement section using the AI Edge Function (exercise swap)
 */
export async function generateSection(
  request: GenerateSectionRequest
): Promise<GenerateSectionResponse | GenerationError> {
  logger.workout.info('generateSection started', {
    swapMode: request.swap_mode,
    sectionType: request.section_type,
  });
  const startTime = performance.now();

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      logger.workout.error('generateSection: not authenticated');
      return { error: 'Not authenticated', details: 'Please sign in to swap exercises' };
    }

    const { data, error } = await supabase.functions.invoke('generate-section', {
      body: request,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const durationMs = Math.round(performance.now() - startTime);

    if (error) {
      const errorMsg = data?.error || error.message || 'Unknown error';
      logger.workout.error('generateSection error', { error: errorMsg, durationMs });
      return { error: 'Failed to generate section', details: errorMsg };
    }

    logger.workout.info('generateSection succeeded', {
      durationMs,
      swapMode: request.swap_mode,
      exerciseCount: data?.section?.exercises?.length,
    });
    return data as GenerateSectionResponse;

  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    logger.workout.error('generateSection exception', {
      error: err instanceof Error ? err.message : String(err),
      durationMs,
    });
    return {
      error: 'Network error',
      details: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Save a generated workout to the database using atomic RPC
 *
 * Uses save_generated_workout RPC to ensure all-or-nothing save:
 * - Session, sections, and exercises are saved in a single transaction
 * - If any part fails, the entire operation rolls back
 * - No orphaned data from partial saves
 *
 * @param workout - The generated workout response
 * @param locationId - The location ID for this session
 * @returns The created workout session ID or error
 */
export async function saveGeneratedWorkout(
  workout: GenerateWorkoutResponse,
  locationId: string
): Promise<{ sessionId: string } | GenerationError> {
  logger.workout.info('saveGeneratedWorkout started (atomic RPC)', { locationId });
  const startTime = performance.now();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      logger.workout.error('saveGeneratedWorkout: not authenticated');
      return { error: 'Not authenticated' };
    }

    // Transform sections to RPC format
    const sectionsForRpc = workout.workout.sections.map((section, sectionIndex) => ({
      section_type: section.section_type,
      order_index: sectionIndex,
      section_notes: section.section_notes || null,
      exercises: section.exercises.map((exercise, exerciseIndex) => ({
        exercise_id: exercise.exercise_id,
        equipment_used: exercise.equipment || 'bodyweight',
        sets: exercise.sets || null,
        reps: exercise.reps || '1',
        effort_percent: exercise.effort_percent || null,
        tempo: exercise.tempo || null,
        rest_seconds: exercise.rest_seconds || null,
        coaching_cues: exercise.coaching_cues?.join('\n') || null,
        order_index: exerciseIndex,
      })),
    }));

    // Single atomic RPC call - all or nothing
    const { data: sessionId, error: rpcError } = await supabase.rpc('save_generated_workout', {
      p_user_id: user.id,
      p_location_id: locationId,
      p_date: new Date().toISOString().split('T')[0],
      p_anchor: workout.metadata.request.anchor as Database['public']['Enums']['anchor_type'],
      p_intensity: workout.metadata.request.intensity,
      p_time_target_mins: workout.metadata.request.duration_mins || undefined,
      p_prompt_version: workout.metadata.prompt_version || undefined,
      p_goal_preset: (workout.metadata.request.goal || 'balanced') as Database['public']['Enums']['goal_preset'],
      p_sections: sectionsForRpc,
    });

    const durationMs = Math.round(performance.now() - startTime);

    if (rpcError) {
      logger.workout.error('saveGeneratedWorkout RPC failed', {
        error: rpcError.message,
        durationMs,
      });
      return {
        error: 'Failed to save workout',
        details: rpcError.message,
      };
    }

    logger.workout.info('saveGeneratedWorkout completed (atomic)', {
      sessionId,
      sectionsCount: sectionsForRpc.length,
      exercisesCount: sectionsForRpc.reduce((sum, s) => sum + s.exercises.length, 0),
      durationMs,
    });

    return { sessionId };

  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    logger.workout.error('saveGeneratedWorkout exception', {
      error: err instanceof Error ? err.message : String(err),
      durationMs,
    });
    return {
      error: 'Failed to save workout',
      details: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Complete a workout session — marks it as finished with duration, mood, and notes.
 */
export async function completeWorkoutSession(
  sessionId: string,
  data: {
    durationMins: number;
    mood: number | null;
    sessionNotes: string;
  }
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({
      completed_at: new Date().toISOString(),
      duration_mins: data.durationMins,
      mood: data.mood !== null ? String(data.mood) : null,
      session_notes: data.sessionNotes || null,
      counts_for_streak: data.durationMins >= 5,
    })
    .eq('id', sessionId);

  if (error) {
    logger.workout.error('completeWorkoutSession failed', { error: error.message, sessionId });
    return { error: error.message };
  }

  logger.workout.info('completeWorkoutSession succeeded', { sessionId, durationMins: String(data.durationMins) });
  return {};
}
