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
import type { GeneratedWorkout, WorkoutSection, Exercise, SectionType } from '@/types/workout';
import type { Database } from '@/types/database';
import { DB_TO_SECTION } from './section-mapping';

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
      coachingCues: undefined,
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

/** UUID mapping returned by save_generated_workout RPC */
export interface SavedWorkoutUUIDs {
  session_id: string;
  sections: Array<{
    id: string;
    order_index: number;
    exercises: Array<{ id: string; order_index: number }>;
  }>;
}

/**
 * Save a generated workout to the database using atomic RPC.
 *
 * Returns the session ID and all section/exercise UUIDs in a single atomic call.
 * This ensures the frontend can map logged data directly to DB rows without
 * a separate fetch that could fail independently.
 */
export async function saveGeneratedWorkout(
  workout: GenerateWorkoutResponse,
  locationId: string
): Promise<{ sessionId: string; uuids: SavedWorkoutUUIDs } | GenerationError> {
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
        coaching_cues: exercise.coaching_cues || null,
        order_index: exerciseIndex,
        structure: exercise.structure || null,
      })),
    }));

    // Single atomic RPC call — returns session ID + all section/exercise UUIDs
    const { data: rpcResult, error: rpcError } = await supabase.rpc('save_generated_workout', {
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

    const uuids = rpcResult as SavedWorkoutUUIDs;

    logger.workout.info('saveGeneratedWorkout completed (atomic)', {
      sessionId: uuids.session_id,
      sectionsCount: uuids.sections.length,
      exercisesCount: uuids.sections.reduce((sum: number, s: { exercises: Array<unknown> }) => sum + s.exercises.length, 0),
      durationMs,
    });

    return { sessionId: uuids.session_id, uuids };

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
 * Fetch DB UUIDs for sections and exercises of a saved session.
 * Used to inject real database IDs into the frontend GeneratedWorkout object
 * so that loggedData keys become actual DB UUIDs for persistence.
 */
/**
 * Inject database UUIDs into a GeneratedWorkout object.
 * Replaces frontend-generated section/exercise IDs with real DB UUIDs
 * so that all downstream logging uses the correct keys for persistence.
 */
export function injectDBUUIDs(
  workout: GeneratedWorkout,
  uuids: SavedWorkoutUUIDs
): GeneratedWorkout {
  return {
    ...workout,
    sections: workout.sections.map((section, sIndex) => {
      const dbSection = uuids.sections[sIndex];
      if (!dbSection) return section;

      return {
        ...section,
        id: dbSection.id,
        exercises: section.exercises.map((exercise, eIndex) => {
          const dbExercise = dbSection.exercises[eIndex];
          if (!dbExercise) return exercise;
          return { ...exercise, id: dbExercise.id };
        }),
      };
    }),
  };
}

/**
 * Complete a workout session — marks it as finished with duration, mood, notes,
 * and persists exercise-level logged data, structure results, and section timestamps.
 */
export async function completeWorkoutSession(
  sessionId: string,
  data: {
    durationMins: number;
    mood: number | null;
    sessionNotes: string;
    loggedData?: Record<string, { weight?: string; reps?: string; notes?: string }>;
    structureResults?: Record<string, {
      structure_type: string;
      rounds_completed?: number;
      completion_time_seconds?: number;
      completed_under_cap?: boolean;
      rep_scheme?: string;
      highest_rung?: number | null;
      notes?: string | null;
    }>;
  }
): Promise<{ error?: string; partialFailures?: number }> {
  let partialFailureCount = 0;

  // 1. Update session-level data (existing behavior)
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

  // 2. Persist exercise-level data (weights, notes)
  if (data.loggedData) {
    const exerciseEntries = Object.entries(data.loggedData).filter(
      ([, entry]) => entry.weight || entry.notes
    );

    if (exerciseEntries.length > 0) {
      const exerciseResults = await Promise.all(
        exerciseEntries.map(([exerciseId, entry]) =>
          supabase
            .from('exercises')
            .update({
              weight_logged: entry.weight || null,
              exercise_notes: entry.notes || null,
            })
            .eq('id', exerciseId)
            .then(({ error: updateError }) => ({ exerciseId, error: updateError }))
        )
      );

      const failures = exerciseResults.filter(r => r.error);
      if (failures.length > 0) {
        partialFailureCount += failures.length;
        logger.workout.warn(`${failures.length}/${exerciseEntries.length} exercise updates failed`, {
          sessionId,
          failedIds: failures.map(f => f.exerciseId).join(', '),
          errors: failures.map(f => f.error?.message).join('; '),
        });
      } else {
        logger.workout.info(`${exerciseEntries.length} exercise(s) logged`, { sessionId });
      }
    }
  }

  // 3. Persist structure results (timed section outcomes)
  if (data.structureResults) {
    const structureEntries = Object.entries(data.structureResults).filter(
      ([, entry]) => entry.structure_type
    );

    if (structureEntries.length > 0) {
      const structureResults = await Promise.all(
        structureEntries.map(([sectionId, entry]) =>
          supabase
            .from('structure_results')
            .insert({
              section_id: sectionId,
              structure_type: entry.structure_type,
              completion_time_seconds: entry.completion_time_seconds ?? null,
              completed_under_cap: entry.completed_under_cap ?? null,
              rounds_completed: entry.rounds_completed ?? null,
              rep_scheme: entry.rep_scheme ?? null,
              highest_rung: entry.highest_rung ?? null,
              notes: entry.notes ?? null,
            })
            .then(({ error: insertError }) => ({ sectionId, error: insertError }))
        )
      );

      const failures = structureResults.filter(r => r.error);
      if (failures.length > 0) {
        partialFailureCount += failures.length;
        logger.workout.warn(`${failures.length}/${structureEntries.length} structure_results inserts failed`, {
          sessionId,
          errors: failures.map(f => `${f.sectionId}: ${f.error?.message}`).join('; '),
        });
      } else {
        logger.workout.info(`${structureEntries.length} structure result(s) saved`, { sessionId });
      }
    }
  }

  // 4. Mark all sections as completed
  const { data: sections, error: sectionsError } = await supabase
    .from('workout_sections')
    .select('id')
    .eq('session_id', sessionId);

  if (!sectionsError && sections && sections.length > 0) {
    const sectionResults = await Promise.all(
      sections.map(section =>
        supabase
          .from('workout_sections')
          .update({
            status: 'completed' as const,
            completed_at: new Date().toISOString(),
          })
          .eq('id', section.id)
          .then(({ error: updateError }) => ({ sectionId: section.id, error: updateError }))
      )
    );

    const failures = sectionResults.filter(r => r.error);
    if (failures.length > 0) {
      logger.workout.warn(`${failures.length}/${sections.length} section timestamp updates failed`, {
        sessionId,
        errors: failures.map(f => `${f.sectionId}: ${f.error?.message}`).join('; '),
      });
    }
  }

  return partialFailureCount > 0 ? { partialFailures: partialFailureCount } : {};
}

// ─── Repeat Workout Functions ───────────────────────────────────────────────

/** Shape of raw section data for creating a repeat session */
export interface RepeatSectionInput {
  section_type: string;
  order_index: number;
  section_notes: string | null;
  exercises: Array<{
    exercise_id: string;
    equipment_used: string;
    sets: number | null;
    reps: string;
    effort_percent: number | null;
    tempo: string | null;
    rest_seconds: number | null;
    coaching_cues: string | null;
    order_index: number;
    structure?: Record<string, unknown> | null;
  }>;
}

/**
 * Fetch raw section + exercise data from a completed session.
 * Returns data in the format needed by the save_generated_workout RPC.
 */
export async function fetchSessionForRepeat(sessionId: string): Promise<{
  sections: RepeatSectionInput[];
  metadata: { anchor: string; intensity: number; durationMins: number; goalPreset?: string };
} | null> {
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .select('anchor, intensity, duration_mins, goal_preset')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    logger.workout.error('fetchSessionForRepeat: session fetch failed', { error: sessionError?.message });
    return null;
  }

  const { data: sections, error: sectionsError } = await supabase
    .from('workout_sections')
    .select('*, exercises(*)')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true });

  if (sectionsError || !sections) {
    logger.workout.error('fetchSessionForRepeat: sections fetch failed', { error: sectionsError?.message });
    return null;
  }

  return {
    sections: sections.map(section => ({
      section_type: section.section_type,
      order_index: section.order_index,
      section_notes: section.section_notes,
      exercises: (section.exercises || [])
        .sort((a: { order_index?: number }, b: { order_index?: number }) =>
          (a.order_index || 0) - (b.order_index || 0)
        )
        .map((ex: Database['public']['Tables']['exercises']['Row']) => ({
          exercise_id: ex.exercise_id,
          equipment_used: ex.equipment_used || 'bodyweight',
          sets: ex.sets,
          reps: ex.reps || '1',
          effort_percent: ex.effort_percent,
          tempo: ex.tempo,
          rest_seconds: ex.rest_seconds,
          coaching_cues: ex.coaching_cues,
          order_index: ex.order_index || 0,
          structure: ex.structure as Record<string, unknown> | null,
        })),
    })),
    metadata: {
      anchor: session.anchor,
      intensity: session.intensity,
      durationMins: session.duration_mins || 0,
      goalPreset: session.goal_preset || undefined,
    },
  };
}

/**
 * Create a new workout session for a repeat workout.
 * Calls the same save_generated_workout RPC used for fresh generation.
 */
export async function createRepeatSession(
  metadata: { anchor: string; intensity: number; durationMins?: number; goalPreset?: string },
  sections: RepeatSectionInput[]
): Promise<{ sessionId: string; uuids: SavedWorkoutUUIDs } | { error: string }> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'Not authenticated' };

  // Look up user's default location
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_location_id')
    .eq('id', user.id)
    .single();

  const locationId = profile?.default_location_id || null;

  const { data: rpcResult, error: rpcError } = await supabase.rpc('save_generated_workout', {
    p_user_id: user.id,
    p_location_id: locationId,
    p_date: new Date().toISOString().split('T')[0],
    p_anchor: metadata.anchor as Database['public']['Enums']['anchor_type'],
    p_intensity: metadata.intensity,
    p_time_target_mins: metadata.durationMins || undefined,
    p_goal_preset: (metadata.goalPreset || 'balanced') as Database['public']['Enums']['goal_preset'],
    p_sections: sections,
  });

  if (rpcError) {
    logger.workout.error('createRepeatSession RPC failed', { error: rpcError.message });
    return { error: rpcError.message };
  }

  const uuids = rpcResult as SavedWorkoutUUIDs;
  logger.workout.info('Repeat session created', { sessionId: uuids.session_id });
  return { sessionId: uuids.session_id, uuids };
}

/** Section display name mapping */
const SECTION_NAME_MAP: Record<string, string> = {
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

/**
 * Build a GeneratedWorkout from raw section data.
 * Used when repeating a workout from history or favorites.
 */
export function buildWorkoutFromSections(
  rawSections: RepeatSectionInput[],
  metadata: { anchor: string; intensity: number; durationMins?: number; goal?: string }
): GeneratedWorkout {
  const sections: WorkoutSection[] = rawSections.map((section, sIndex) => ({
    id: `${section.section_type}-${sIndex}`,
    name: SECTION_NAME_MAP[section.section_type] || section.section_type,
    type: (DB_TO_SECTION[section.section_type] || 'accessory') as SectionType,
    status: 'not_started' as const,
    exercises: section.exercises.map((ex, eIndex) => ({
      id: `${section.section_type}-${sIndex}-ex-${eIndex}`,
      name: ex.exercise_id?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown Exercise',
      sets: ex.sets,
      reps: ex.reps,
      effort: ex.effort_percent ? `${ex.effort_percent}%` : undefined,
      tempo: ex.tempo || undefined,
      rest: ex.rest_seconds ? `${ex.rest_seconds}s` : undefined,
      equipment: ex.equipment_used && ex.equipment_used !== 'bodyweight'
        ? ex.equipment_used.replace(/_/g, ' ')
        : undefined,
      structure: ex.structure as Exercise['structure'],
    })),
  }));

  return {
    id: crypto.randomUUID(),
    title: `${metadata.anchor.replace(/^\w/, c => c.toUpperCase())} Workout`,
    description: '',
    duration: metadata.durationMins ? `${metadata.durationMins}m` : '45m',
    intensity: metadata.intensity,
    anchor: metadata.anchor.toUpperCase(),
    goal: metadata.goal,
    sections,
  };
}
