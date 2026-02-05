// Workout Generation API Client
// Calls the generate-workout Supabase Edge Function

import { supabase } from './supabase';
import type {
  GenerateWorkoutRequest,
  GenerateWorkoutResponse,
  GenerationError,
  GeneratedWorkout as APIGeneratedWorkout,
} from '@/types/generation';
import type { GeneratedWorkout, WorkoutSection, Exercise } from '@/types/workout';

export { isGenerationError } from '@/types/generation';

/**
 * Transform API response to frontend workout type
 */
export function transformAPIWorkoutToFrontend(
  apiWorkout: APIGeneratedWorkout,
  intensity: number,
  anchor: string
): GeneratedWorkout {
  const sections: WorkoutSection[] = apiWorkout.sections.map((section, sectionIndex) => {
    // Map API section_type to frontend type
    const typeMap: Record<string, WorkoutSection['type']> = {
      warmup: 'warmup',
      mobility: 'warmup',
      primary_lift: 'primary',
      accessory: 'accessory',
      core: 'rotational',
      conditioning: 'conditioning',
      cooldown: 'cooldown',
    };

    const exercises: Exercise[] = section.exercises.map((ex, exIndex) => ({
      id: ex.exercise_id || `${section.section_type}-${exIndex}`,
      name: ex.name,
      sets: ex.sets || 1,
      reps: typeof ex.reps === 'string' && ex.reps.includes(' ')
        ? ex.reps  // Keep string reps like "30 sec" or "8 each side"
        : parseInt(ex.reps) || 1,
      effort: ex.effort_percent ? `${ex.effort_percent}%` : undefined,
      tempo: ex.tempo || undefined,
      rest: ex.rest_seconds ? `${ex.rest_seconds}s` : undefined,
      coachingCues: ex.coaching_cues?.join('. ') || undefined,
      regression: ex.regression || undefined,
      equipment: ex.equipment || undefined,
      structure: ex.structure || { type: 'standard' },
    }));

    return {
      id: section.section_type + '-' + sectionIndex,
      name: section.section_title,
      type: typeMap[section.section_type] || 'accessory',
      exercises,
    };
  });

  return {
    id: crypto.randomUUID(),
    title: apiWorkout.title,
    description: apiWorkout.overview,
    duration: `${apiWorkout.estimated_duration_mins}m`,
    intensity,
    anchor: anchor.toUpperCase(),
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
  try {
    // Get current session for auth
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log('Session check:', { hasSession: !!session, error: sessionError });

    if (sessionError || !session) {
      return { error: 'Not authenticated', details: 'Please sign in to generate workouts' };
    }

    console.log('Calling Edge Function with token:', session.access_token.substring(0, 20) + '...');

    // Call the Edge Function with explicit auth header
    const { data, error } = await supabase.functions.invoke('generate-workout', {
      body: request,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    console.log('Edge Function response:', { data, error });
    console.log('Error details:', error ? JSON.stringify(error, null, 2) : 'no error');

    if (error) {
      // Check if it's an auth error from the function itself
      const errorMsg = data?.error || error.message || 'Unknown error';
      console.log('Error message:', errorMsg);
      return {
        error: 'Failed to generate workout',
        details: errorMsg,
      };
    }

    return data as GenerateWorkoutResponse;

  } catch (err) {
    console.error('generateWorkout error:', err);
    return {
      error: 'Network error',
      details: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Save a generated workout to the database
 *
 * @param workout - The generated workout response
 * @param locationId - The location ID for this session
 * @returns The created workout session ID or error
 */
export async function saveGeneratedWorkout(
  workout: GenerateWorkoutResponse,
  locationId: string
): Promise<{ sessionId: string } | GenerationError> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Not authenticated' };
    }

    // Create workout session
    const sessionInsert = {
      user_id: user.id,
      location_id: locationId,
      date: new Date().toISOString().split('T')[0],
      anchor: workout.metadata.request.anchor,
      intensity: workout.metadata.request.intensity,
      time_target_mins: workout.metadata.request.duration_mins,
      prompt_version: workout.metadata.prompt_version,
    };
    console.log('Inserting workout_session:', sessionInsert);

    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert(sessionInsert)
      .select('id')
      .single();

    if (sessionError || !session) {
      console.error('workout_sessions insert error:', sessionError);
      return {
        error: 'Failed to save workout session',
        details: sessionError?.message,
      };
    }
    console.log('Session created with ID:', session.id);

    // Create sections and exercises
    for (let sectionIndex = 0; sectionIndex < workout.workout.sections.length; sectionIndex++) {
      const section = workout.workout.sections[sectionIndex];

      const { data: sectionData, error: sectionError } = await supabase
        .from('workout_sections')
        .insert({
          session_id: session.id,
          section_type: section.section_type as any,
          order_index: sectionIndex,
          section_notes: section.section_notes,
        })
        .select('id')
        .single();

      if (sectionError || !sectionData) {
        console.error('Failed to save section:', sectionError);
        continue;
      }

      // Create exercises for this section
      const exerciseInserts = section.exercises.map((exercise, exerciseIndex) => ({
        section_id: sectionData.id,
        exercise_id: exercise.exercise_id,
        equipment_used: exercise.equipment || null,
        sets: exercise.sets || null,
        reps: exercise.reps || null,
        effort_percent: exercise.effort_percent || null,
        tempo: exercise.tempo || null,
        rest_seconds: exercise.rest_seconds || null,
        coaching_cues: exercise.coaching_cues?.join('\n') || null,
        order_index: exerciseIndex,
      }));

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exerciseInserts);

      if (exercisesError) {
        console.error('Failed to save exercises:', exercisesError);
      }
    }

    return { sessionId: session.id };

  } catch (err) {
    return {
      error: 'Failed to save workout',
      details: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
