// Supabase Edge Function: generate-workout
// Calls Claude API to generate personalized workouts based on user context
// Version: v1.0.0

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { SYSTEM_PROMPT } from './prompt.ts';

// ============================================
// TYPES
// ============================================

type GoalType = 'strength' | 'hypertrophy' | 'conditioning' | 'balanced' | 'active_recovery';

// Sections that each goal typically generates — used for validation
const VALID_SECTIONS_BY_GOAL: Record<GoalType, string[]> = {
  strength: ['warmup', 'primary_lift', 'accessory', 'core', 'cooldown'],
  hypertrophy: ['warmup', 'primary_lift', 'accessory', 'core', 'cooldown'],
  conditioning: ['warmup', 'conditioning', 'accessory', 'core', 'cooldown'],
  balanced: ['warmup', 'mobility', 'primary_lift', 'accessory', 'core', 'conditioning', 'cooldown'],
  active_recovery: ['warmup', 'mobility', 'cooldown'],
};

interface GenerationRequest {
  intensity: number; // 1-10
  anchor: string;
  goal?: GoalType; // Training goal — defaults to 'balanced'
  duration_mins: number;
  location_id?: string; // Optional if equipment provided directly
  location_name?: string; // For display in prompt
  equipment?: string[]; // Direct equipment list (alternative to location_id)
  experience_level?: string; // Optional override
  limitations?: string; // Optional override
  enabled_sections?: string[]; // Optional override
  notes?: string;
}

interface ExerciseStructure {
  type: 'standard' | 'superset' | 'circuit' | 'emom' | 'amrap' | 'for_time';
  paired_with?: string;
  circuit_id?: string;
  group_id?: string;
  rounds?: number;
  minutes?: number;
  time_cap_mins?: number;
}

interface GeneratedExercise {
  exercise_id: string;
  name: string;
  equipment: string;
  sets: number | null;
  reps: string;
  effort_percent: number | null;
  tempo: string | null;
  rest_seconds: number | null;
  coaching_cues: string[];
  regression: string | null;
  structure: ExerciseStructure;
}

interface GeneratedSection {
  section_type: string;
  section_title: string;
  section_notes: string | null;
  estimated_duration_mins: number;
  exercises: GeneratedExercise[];
}

interface GeneratedWorkout {
  title: string;
  overview: string;
  estimated_duration_mins: number;
  intensity_description: string;
  sections: GeneratedSection[];
}

interface UserProfile {
  experience_level: string | null;
  limitations: string | null;
  enabled_sections: string[];
}

interface Location {
  name: string;
  equipment: string[];
}

interface RecentWorkout {
  anchor: string;
  exercise_ids: string[];
}

// System prompt imported from ./prompt.ts

// ============================================
// HELPER FUNCTIONS
// ============================================

interface ExerciseDefinition {
  id: string;
  name: string;
  equipment_options: string[];
  default_equipment: string;
  sections: string[];
  coaching_cues: string[] | null;
  regression: string | null;
  can_be_primary: boolean;
  equipment_display_names: Record<string, string> | null;
  anchors: string[] | null; // All anchors this exercise belongs to
  primary_anchor: string | null; // The main anchor for this exercise
}

function buildUserPrompt(
  profile: UserProfile,
  location: Location,
  request: GenerationRequest,
  recentWorkouts: RecentWorkout[],
  availableExercises: ExerciseDefinition[]
): string {
  const recentAnchors = recentWorkouts.map((w) => w.anchor).join(', ') || 'None';
  const recentExercises = [...new Set(recentWorkouts.flatMap((w) => w.exercise_ids))]
    .slice(0, 15)
    .join(', ') || 'None';

  // Build the exercise library section for the prompt
  const exerciseListStr = availableExercises.map((ex) => {
    const equipStr = ex.equipment_options.join(', ');
    const sectionsStr = ex.sections.join(', ');
    const cuesStr = ex.coaching_cues?.join('; ') || '';
    // [PRIMARY] only applies to barbell variants of consolidated exercises
    const hasBarbellOption = ex.equipment_options.includes('barbell');
    const primaryStr = ex.can_be_primary && hasBarbellOption ? ' [PRIMARY w/barbell]' : '';
    const regressionStr = ex.regression ? ` regression:${ex.regression}` : '';
    // Include anchors so Claude knows which exercises work for which focus
    const anchorsStr = ex.anchors?.length ? ` anchors:[${ex.anchors.join(', ')}]` : '';
    return `  ${ex.id} | ${ex.name} | equipment:[${equipStr}] | sections:[${sectionsStr}]${primaryStr}${anchorsStr}${regressionStr} | cues:[${cuesStr}]`;
  }).join('\n');

  const goal = request.goal || 'balanced';

  return `USER CONTEXT:
- Experience: ${profile.experience_level || 'some'}
- Limitations: ${profile.limitations || 'None'}
- Available equipment: ${location.equipment.join(', ')}
- Enabled sections: ${profile.enabled_sections.join(', ')}

WORKOUT REQUEST:
- Training Goal: ${goal}
- Intensity: ${request.intensity}/10
- Anchor: ${request.anchor}
- Duration: ${request.duration_mins} minutes
- Location: ${location.name}
- Notes: ${request.notes || 'None'}

RECENT HISTORY (avoid repeating):
- Last 3 anchors: ${recentAnchors}
- Recent exercises to vary from: ${recentExercises}

EXERCISE LIBRARY (you MUST only use exercise_id values from this list):
${exerciseListStr}

Generate a workout matching these parameters. Use ONLY exercise IDs from the library above. Return JSON only.`;
}

async function callClaudeAPI(
  systemPrompt: string,
  userPrompt: string
): Promise<GeneratedWorkout> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  const content = result.content[0]?.text;

  if (!content) {
    throw new Error('Empty response from Claude API');
  }

  // Parse JSON response - strip markdown code fences if present
  let jsonContent = content.trim();

  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  if (jsonContent.startsWith('```')) {
    // Remove opening fence (```json or ```)
    jsonContent = jsonContent.replace(/^```(?:json)?\s*\n?/, '');
    // Remove closing fence
    jsonContent = jsonContent.replace(/\n?```\s*$/, '');
  }

  try {
    return JSON.parse(jsonContent);
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${jsonContent.substring(0, 200)}...`);
  }
}

function validateWorkout(
  workout: GeneratedWorkout,
  exerciseLibrary: Set<string>,
  availableEquipment: Set<string>,
  enabledSections: Set<string>,
  requestedDuration: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check exercise IDs exist
  for (const section of workout.sections) {
    for (const exercise of section.exercises) {
      if (!exerciseLibrary.has(exercise.exercise_id)) {
        errors.push(`Unknown exercise_id: ${exercise.exercise_id}`);
      }

      // Check equipment is available
      if (!availableEquipment.has(exercise.equipment)) {
        errors.push(
          `Exercise "${exercise.name}" requires unavailable equipment: ${exercise.equipment}`
        );
      }
    }

    // Check section types match enabled sections
    const sectionType = section.section_type;
    if (!enabledSections.has(sectionType)) {
      errors.push(`Section type "${sectionType}" not in user's enabled sections`);
    }
  }

  // Check duration within ±10%
  const durationDiff = Math.abs(workout.estimated_duration_mins - requestedDuration);
  const tolerance = requestedDuration * 0.1;
  if (durationDiff > tolerance) {
    errors.push(
      `Duration ${workout.estimated_duration_mins} mins is not within ±10% of requested ${requestedDuration} mins`
    );
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  // Debug: Log all headers
  console.log('=== Edge Function Request ===');
  console.log('Method:', req.method);
  const headerObj: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headerObj[key] = key.toLowerCase() === 'authorization' ? value.substring(0, 50) + '...' : value;
  });
  console.log('Headers:', JSON.stringify(headerObj));

  try {
    // Parse request body
    const request: GenerationRequest = await req.json();
    console.log('Request body parsed:', { intensity: request.intensity, anchor: request.anchor, duration_mins: request.duration_mins });

    // Validate required fields
    if (!request.intensity || !request.anchor || !request.duration_mins) {
      console.log('Validation failed: missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: intensity, anchor, duration_mins' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Must have either location_id OR equipment
    if (!request.location_id && !request.equipment) {
      console.log('Validation failed: missing location_id and equipment');
      return new Response(
        JSON.stringify({ error: 'Must provide either location_id or equipment array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate intensity range
    if (request.intensity < 1 || request.intensity > 10) {
      console.log('Validation failed: intensity out of range');
      return new Response(
        JSON.stringify({ error: 'Intensity must be between 1 and 10' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');

    console.log('Auth header exists:', !!authHeader);

    // Verify authorization header exists
    if (!authHeader) {
      console.log('No auth header present');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Create authenticated client to properly verify the JWT
    // This verifies the signature, expiry, and extracts the user
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // getUser() verifies the JWT and returns the authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      console.log('Auth verification failed:', authError?.message || 'No user');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    console.log('Verified userId:', user.id);

    // Create service client for database operations that need to bypass RLS
    // (e.g., fetching exercise definitions which are read-only for all users)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user profile (optional - can use request overrides)
    let profile: UserProfile = {
      experience_level: request.experience_level || 'some',
      limitations: request.limitations || null,
      enabled_sections: request.enabled_sections || ['warmup', 'mobility', 'primary_lift', 'accessory', 'core', 'conditioning', 'cooldown'],
    };

    // Try to fetch profile from DB if available
    const { data: dbProfile } = await supabase
      .from('profiles')
      .select('experience_level, limitations, enabled_sections')
      .eq('id', user.id)
      .single();

    if (dbProfile) {
      profile = {
        experience_level: request.experience_level || dbProfile.experience_level || 'some',
        limitations: request.limitations || dbProfile.limitations || null,
        enabled_sections: request.enabled_sections || dbProfile.enabled_sections || profile.enabled_sections,
      };
    }

    // Get location/equipment - either from DB or direct from request
    let location: Location;

    if (request.location_id) {
      // Fetch location from DB
      const { data: dbLocation, error: locationError } = await supabase
        .from('locations')
        .select('name, equipment')
        .eq('id', request.location_id)
        .eq('user_id', user.id)
        .single();

      if (locationError || !dbLocation) {
        return new Response(
          JSON.stringify({ error: 'Location not found or not owned by user' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      location = dbLocation;
    } else {
      // Use equipment directly from request
      location = {
        name: request.location_name || 'Gym',
        equipment: request.equipment!,
      };
    }

    // Fetch recent workouts (last 5 sessions)
    const { data: recentSessions } = await supabase
      .from('workout_sessions')
      .select(`
        anchor,
        workout_sections (
          exercises (
            exercise_id
          )
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5);

    const recentWorkouts: RecentWorkout[] = (recentSessions || []).map((session: any) => ({
      anchor: session.anchor,
      exercise_ids: session.workout_sections?.flatMap((s: any) =>
        s.exercises?.map((e: any) => e.exercise_id) || []
      ) || [],
    }));

    // Fetch exercise library with full details for prompt injection
    // Use the view that includes all anchors (primary and secondary)
    const { data: exerciseDefinitions } = await supabase
      .from('exercise_definitions_with_anchors')
      .select('id, name, equipment_options, default_equipment, sections, coaching_cues, regression, can_be_primary, equipment_display_names, anchors, primary_anchor');

    // Build available equipment set (always include bodyweight)
    const availableEquipment = new Set([...location.equipment, 'bodyweight']);

    // Derive enabled sections from per-workout goal (takes priority over profile)
    const goal: GoalType = (request.goal as GoalType) || 'balanced';
    const goalSections = VALID_SECTIONS_BY_GOAL[goal] || VALID_SECTIONS_BY_GOAL.balanced;
    const enabledSectionsSet = new Set(
      request.enabled_sections || goalSections
    );

    // Filter exercises: must have at least one equipment option available AND
    // at least one section that matches the user's enabled sections
    const availableExercises = (exerciseDefinitions || []).filter((ex: any) => {
      const hasEquipment = (ex.equipment_options || []).some((eq: string) =>
        availableEquipment.has(eq)
      );
      const hasSection = (ex.sections || []).some((s: string) =>
        enabledSectionsSet.has(s)
      );
      return hasEquipment && hasSection;
    });

    const exerciseLibrary = new Set((exerciseDefinitions || []).map((e: any) => e.id));

    // Build prompts
    const userPrompt = buildUserPrompt(
      profile as UserProfile,
      location as Location,
      request,
      recentWorkouts,
      availableExercises as ExerciseDefinition[]
    );

    // Call Claude API
    let workout: GeneratedWorkout;
    let retryCount = 0;
    const maxRetries = 1;

    while (true) {
      try {
        workout = await callClaudeAPI(SYSTEM_PROMPT, userPrompt);

        // Validate the generated workout
        const validation = validateWorkout(
          workout,
          exerciseLibrary,
          availableEquipment,
          enabledSectionsSet,
          request.duration_mins
        );

        if (validation.valid) {
          break;
        }

        if (retryCount >= maxRetries) {
          // Log validation errors but return workout anyway (with warning)
          console.warn('Validation errors after retry:', validation.errors);
          break;
        }

        // Retry with clarification
        retryCount++;
        console.warn(`Validation failed, retrying (${retryCount}/${maxRetries}):`, validation.errors);

      } catch (error) {
        if (retryCount >= maxRetries) {
          throw error;
        }
        retryCount++;
        console.warn(`Generation failed, retrying (${retryCount}/${maxRetries}):`, error);
      }
    }

    // Return generated workout with metadata
    return new Response(
      JSON.stringify({
        workout,
        metadata: {
          prompt_version: 'v3.0.0',
          generated_at: new Date().toISOString(),
          request: {
            intensity: request.intensity,
            anchor: request.anchor,
            goal,
            duration_mins: request.duration_mins,
            location_id: request.location_id,
          },
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Error generating workout:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to generate workout',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
