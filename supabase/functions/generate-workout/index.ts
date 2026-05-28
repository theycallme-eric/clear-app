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
// ANCHOR-AWARE EXERCISE FILTERING
// ============================================

// For balanced programming, include exercises from the contrasting anchor
const CONTRASTING_ANCHORS: Record<string, string[]> = {
  squat: ['pull'],   // lower push ↔ upper pull
  hinge: ['press'],  // posterior ↔ anterior press
  press: ['pull'],   // push ↔ pull
  pull: ['press'],   // pull ↔ push
  power: [],         // full-body — self-contained
};

// Roles that pass regardless of anchor (warmup/cooldown/conditioning universals)
const ANCHOR_EXEMPT_ROLES = new Set([
  'activation', 'mobility', 'conditioning', 'stability', 'cardio',
]);

// If anchor filtering produces fewer than this many exercises, skip it
const ANCHOR_FILTER_MIN_THRESHOLD = 20;

/**
 * Filter exercises to only those relevant to the day's anchor + thematic needs.
 * Reduces prompt size without losing workout quality.
 *
 * An exercise passes if ANY of:
 *   (a) Its anchors array contains the day's anchor
 *   (b) Its exercise_role is anchor-exempt (conditioning, mobility, etc.)
 *   (c) Its anchors array contains a contrasting anchor for the day
 */
function filterByAnchor(
  exercises: ExerciseDefinition[],
  dayAnchor: string
): ExerciseDefinition[] {
  const contrastingAnchors = CONTRASTING_ANCHORS[dayAnchor] || [];

  const filtered = exercises.filter((ex) => {
    const exAnchors = ex.anchors || [];

    // (a) Direct anchor match
    if (exAnchors.includes(dayAnchor)) return true;

    // (b) Role-exempt (warmup/cooldown/conditioning universals)
    if (ex.exercise_role && ANCHOR_EXEMPT_ROLES.has(ex.exercise_role)) return true;

    // (c) Contrasting anchor for balanced programming
    if (contrastingAnchors.some((ca) => exAnchors.includes(ca))) return true;

    return false;
  });

  // Safety net: if filtered list is too small, skip anchor filtering
  if (filtered.length < ANCHOR_FILTER_MIN_THRESHOLD) {
    console.log(`[Anchor Filter] Skipped: ${filtered.length} exercises below threshold (${ANCHOR_FILTER_MIN_THRESHOLD}). Using full list (${exercises.length}).`);
    return exercises;
  }

  console.log(`[Anchor Filter] anchor=${dayAnchor}: ${exercises.length} → ${filtered.length} exercises`);
  return filtered;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

interface MuscleGroupEntry {
  muscle: string;
  role: 'primary' | 'synergist' | 'stabilizer';
}

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
  muscle_groups: MuscleGroupEntry[] | null; // Muscle group data
  component_movements: string[] | null; // Movement primitives
  exercise_role: string | null; // compound_lift, accessory, activation, mobility, conditioning, stability, cardio
}

interface CoverageEntry {
  muscle_group: string;
  primary_count: number;
  synergist_count: number;
  last_date: string | null;
}

async function buildCoverageContext(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<CoverageEntry[]> {
  // Get completed sessions from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().split('T')[0];

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select(`
      date,
      workout_sections (
        exercises (
          exercise_id
        )
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('date', cutoff)
    .order('date', { ascending: false });

  if (!sessions?.length) return [];

  // Collect all exercise IDs with their dates
  const exerciseDates: { exercise_id: string; date: string }[] = [];
  for (const session of sessions) {
    for (const section of session.workout_sections || []) {
      for (const exercise of (section as any).exercises || []) {
        exerciseDates.push({ exercise_id: exercise.exercise_id, date: session.date });
      }
    }
  }

  if (!exerciseDates.length) return [];

  // Get muscle groups for these exercises
  const uniqueExIds = [...new Set(exerciseDates.map(e => e.exercise_id))];
  const { data: muscleData } = await supabase
    .from('exercise_muscle_groups')
    .select('exercise_id, muscle_group, role')
    .in('exercise_id', uniqueExIds);

  if (!muscleData?.length) return [];

  // Build a map: exercise_id -> muscle groups
  const exMuscleMap = new Map<string, { muscle_group: string; role: string }[]>();
  for (const row of muscleData) {
    if (!exMuscleMap.has(row.exercise_id)) exMuscleMap.set(row.exercise_id, []);
    exMuscleMap.get(row.exercise_id)!.push({ muscle_group: row.muscle_group, role: row.role });
  }

  // Aggregate coverage
  const coverage = new Map<string, { primary: number; synergist: number; lastDate: string | null }>();

  for (const { exercise_id, date } of exerciseDates) {
    const muscles = exMuscleMap.get(exercise_id) || [];
    for (const { muscle_group, role } of muscles) {
      if (!coverage.has(muscle_group)) {
        coverage.set(muscle_group, { primary: 0, synergist: 0, lastDate: null });
      }
      const entry = coverage.get(muscle_group)!;
      if (role === 'primary') entry.primary++;
      else if (role === 'synergist') entry.synergist++;
      if (!entry.lastDate || date > entry.lastDate) entry.lastDate = date;
    }
  }

  return Array.from(coverage.entries()).map(([muscle_group, data]) => ({
    muscle_group,
    primary_count: data.primary,
    synergist_count: data.synergist,
    last_date: data.lastDate,
  })).sort((a, b) => b.primary_count - a.primary_count);
}

function formatCoverageForPrompt(coverage: CoverageEntry[]): string {
  if (!coverage.length) return '';

  const today = new Date();
  const lines = coverage.map(c => {
    const daysAgo = c.last_date
      ? Math.round((today.getTime() - new Date(c.last_date).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const lastStr = daysAgo !== null ? `last: ${daysAgo}d ago` : 'not hit';
    return `- ${c.muscle_group}: ${c.primary_count}x primary, ${c.synergist_count}x synergist (${lastStr})`;
  }).join('\n');

  return `\nWEEKLY COVERAGE (last 7 days):\n${lines}`;
}

function buildUserPrompt(
  profile: UserProfile,
  location: Location,
  request: GenerationRequest,
  recentWorkouts: RecentWorkout[],
  availableExercises: ExerciseDefinition[],
  coverageContext: string
): string {
  const recentAnchors = recentWorkouts.map((w) => w.anchor).join(', ') || 'None';
  const recentExercises = [...new Set(recentWorkouts.flatMap((w) => w.exercise_ids))]
    .slice(0, 15)
    .join(', ') || 'None';

  // Build the exercise library section for the prompt
  const exerciseListStr = availableExercises.map((ex) => {
    const equipStr = ex.equipment_options.join(', ');
    const sectionsStr = ex.sections.join(', ');
    const hasBarbellOption = ex.equipment_options.includes('barbell');
    const primaryStr = ex.can_be_primary && hasBarbellOption ? '[PRIMARY w/barbell] ' : '';
    const regressionStr = ex.regression ? ` | regression:${ex.regression}` : '';
    const anchorsStr = ex.anchors?.length ? ` | anchors:[${ex.anchors.join(',')}]` : '';
    const roleStr = ex.exercise_role ? ` | role:${ex.exercise_role}` : '';
    const componentsStr = ex.component_movements?.length
      ? ` | components:[${ex.component_movements.join(',')}]`
      : '';
    const musclesStr = ex.muscle_groups?.length
      ? ` | muscles:[${ex.muscle_groups.map(m => `${m.muscle}:${m.role}`).join(',')}]`
      : '';
    return `  ${ex.id} | ${ex.name}${roleStr} | equipment:[${equipStr}] | sections:[${sectionsStr}] ${primaryStr}${anchorsStr}${componentsStr}${musclesStr}${regressionStr}`;
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
${coverageContext}
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
      .select('experience_level, limitations, enabled_sections, goal_preset')
      .eq('id', user.id)
      .single();

    if (dbProfile) {
      profile = {
        experience_level: request.experience_level || dbProfile.experience_level || 'some',
        limitations: request.limitations || dbProfile.limitations || null,
        enabled_sections: request.enabled_sections || dbProfile.enabled_sections || profile.enabled_sections,
      };
      // Read goal from profile if not provided in request
      if (!request.goal && dbProfile.goal_preset) {
        request.goal = dbProfile.goal_preset as GoalType;
      }
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
      .select('id, name, equipment_options, default_equipment, sections, coaching_cues, regression, can_be_primary, equipment_display_names, anchors, primary_anchor, muscle_groups, component_movements, exercise_role');

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
    const equipmentFiltered = (exerciseDefinitions || []).filter((ex: any) => {
      const hasEquipment = (ex.equipment_options || []).some((eq: string) =>
        availableEquipment.has(eq)
      );
      const hasSection = (ex.sections || []).some((s: string) =>
        enabledSectionsSet.has(s)
      );
      return hasEquipment && hasSection;
    });

    // Anchor-aware filtering: keep only exercises relevant to today's focus
    const availableExercises = filterByAnchor(
      equipmentFiltered as ExerciseDefinition[],
      request.anchor
    );

    const exerciseLibrary = new Set((exerciseDefinitions || []).map((e: any) => e.id));

    // Build weekly muscle group coverage context
    const coverage = await buildCoverageContext(supabase, user.id);
    const coverageContext = formatCoverageForPrompt(coverage);

    // Build prompts
    const userPrompt = buildUserPrompt(
      profile as UserProfile,
      location as Location,
      request,
      recentWorkouts,
      availableExercises as ExerciseDefinition[],
      coverageContext
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

    // Warmup component verification (logging only, no rejection in v1)
    try {
      const primarySection = workout.sections.find(
        (s: GeneratedSection) => s.section_type === 'primary_lift'
      );
      const warmupSection = workout.sections.find(
        (s: GeneratedSection) => s.section_type === 'warmup'
      );
      if (primarySection && warmupSection) {
        const primaryExercise = primarySection.exercises[0];
        if (primaryExercise) {
          const primaryDef = (availableExercises as ExerciseDefinition[]).find(
            (e) => e.id === primaryExercise.exercise_id
          );
          if (primaryDef?.component_movements?.length) {
            const warmupComponents = new Set<string>();
            for (const wEx of warmupSection.exercises) {
              const wDef = (availableExercises as ExerciseDefinition[]).find(
                (e) => e.id === wEx.exercise_id
              );
              if (wDef?.component_movements) {
                for (const c of wDef.component_movements) warmupComponents.add(c);
              }
            }
            const gaps = primaryDef.component_movements.filter(
              (c: string) => !warmupComponents.has(c)
            );
            if (gaps.length > 0) {
              console.log(
                `[Warmup Component Gap] Primary: ${primaryDef.id} (${primaryDef.component_movements.join(',')}) | Gaps: ${gaps.join(',')}`
              );
            }
          }
        }
      }
    } catch (verifyErr) {
      console.warn('Warmup verification error (non-fatal):', verifyErr);
    }

    // Return generated workout with metadata
    return new Response(
      JSON.stringify({
        workout,
        metadata: {
          prompt_version: 'v4.0.0',
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
