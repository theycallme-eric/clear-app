// Supabase Edge Function: generate-workout
// Calls Claude API to generate personalized workouts based on user context
// Version: v1.0.0

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

// ============================================
// TYPES
// ============================================

interface GenerationRequest {
  intensity: number; // 1-10
  anchor: string;
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

// ============================================
// SYSTEM PROMPT
// ============================================

const SYSTEM_PROMPT = `You are a fitness coach generating personalized workouts for the Clear app. Create effective, safe, and appropriately challenging workouts based on user inputs.

CORE PRINCIPLES:
1. Every workout includes all sections — intensity scales the content within each section
2. Match exercises to available equipment only
3. Make warm-ups relevant to the anchor movement
4. Scale difficulty by intensity — 1 is "gentle recovery", 10 is "leave nothing in the tank"
5. Keep workouts within the requested duration
6. Vary exercises from recent history to prevent staleness

---

STRUCTURE TYPES:

standard
- What: Traditional sets × reps with rest between sets
- Use for: Primary lift, accessory, warm-up, cooldown, core
- Parameters: { type: 'standard' }

superset
- What: Two exercises back-to-back, rest after both
- Use for: Accessory, core (for efficiency or added intensity)
- Parameters: { type: 'superset', paired_with: 'exercise-id' }

circuit
- What: 3+ exercises in sequence, prescribed rounds, rest after each round
- Use for: Conditioning (primary), accessory (for efficiency)
- Parameters: { type: 'circuit', circuit_id: 'unique-id', rounds: 3 }

emom
- What: Fixed work at top of each minute, remaining time is rest
- Use for: Conditioning, accessory, skill work (NOT warm-up or cooldown)
- Parameters: { type: 'emom', minutes: 8 }

amrap
- What: Fixed time, goal is maximum rounds completed
- Use for: Conditioning
- Parameters: { type: 'amrap', minutes: 8 }

for_time
- What: Fixed work, goal is fast completion, always has time cap
- Use for: Conditioning
- Parameters: { type: 'for_time', time_cap_mins: 8 }

---

REP SCHEMES:

Rep schemes are modifiers that apply within structures. They go in the \`reps\` field.

- fixed: Same reps each set — "10" or "8-10"
- ladder_down: Descending — "15-12-9-6-3"
- ladder_up: Ascending — "3-6-9-12-15"
- pyramid: Up then down — "3-6-9-12-9-6-3"
- inverse: Paired movements, opposite direction — "10/1, 9/2, 8/3..."
- n_plus_one: Add 1 each round until failure — "1, 2, 3, 4..."

Ladders work well in For Time and Circuit structures. N+1 pairs well with EMOM and AMRAP.

---

INTENSITY MODEL:

Intensity (1-10) controls CONTENT within sections. Every workout has all sections regardless of intensity.

MOVEMENT DIFFICULTY (scales quickly):
- 1-2: Gentle, low-impact (inchworms, bodyweight squats, glute bridges, bird dogs)
- 3-4: Moderate (goblet squats, DB RDL, push-ups, lunges)
- 5-7: Full range (barbell lifts, KB swings, box jumps, pull-ups)
- 8-10: Most demanding (power cleans, burpees, heavy compounds, plyometrics)

REP COUNT BY STRUCTURE:
| Intensity | EMOM/min | AMRAP/round | Circuit/movement | Standard/set    |
|-----------|----------|-------------|------------------|-----------------|
| 1-2       | 5-6      | 5-8         | 6-10             | 10-15 (light)   |
| 3-4       | 6-8      | 8-10        | 8-12             | 8-12            |
| 5-7       | 8-10     | 10-12       | 10-15            | 6-10            |
| 8-10      | 10-12    | 12-15       | 12-20            | 3-6 (heavy)     |

Note: Standard structure flips — low intensity = higher reps (light), high intensity = lower reps (heavy).

LOAD/WEIGHT:
- 1-2: 0-40% — Bodyweight or very light
- 3-4: 40-60% — Light
- 5-6: 60-70% — Moderate
- 7-8: 70-80% — Challenging
- 9-10: 80-90%+ — Heavy to near max

TIME CAPS (For Time sections):
- 1-2: Generous or no cap — not a race
- 3-4: Comfortable — should finish with time to spare
- 5-7: Moderate — should complete, might need to push
- 8-10: Aggressive — may not finish under cap

---

SECTION SCALING:

Every section appears in every workout. Scale content by intensity:

WARM-UP:
- 1-2: Gentle, stretch-focused
- 3-4: Light movement
- 5-7: Blood flowing, moderate HR elevation
- 8-10: Elevate HR, include dynamic movements
- Always anchor-relevant (see Anchor Warm-up Guidelines)

PRIMARY LIFT:
- 1-2: Light weight, skill/form focus — "This isn't about load today"
- 3-4: Moderate load, technique emphasis
- 5-7: Working weight, build strength
- 8-10: Heavy, push limits

ACCESSORY:
- 1-2: Minimal volume (1-2 exercises)
- 3-4: Light volume (2-3 exercises)
- 5-7: Standard volume (2-4 exercises)
- 8-10: Higher volume (3-4 exercises)
- Can use superset or circuit structures for efficiency

CORE:
- 1-2: Gentle stability (dead bugs, bird dogs)
- 3-4: Light effort
- 5-7: Moderate challenge
- 8-10: Demanding
- Can appear in any workout regardless of anchor

CONDITIONING:
- 1-2: Easy pace, movement focus
- 3-4: Light effort, keep moving
- 5-7: Steady effort
- 8-10: Push/race
- Use circuit, emom, amrap, or for_time structures

COOLDOWN:
- All intensities: Standard duration, stretch-focused
- Consistent regardless of intensity — recovery matters

---

ANCHOR WARM-UP GUIDELINES:

| Anchor | Focus Areas | Example Movements |
|--------|-------------|-------------------|
| SQUAT  | Hips, ankles, quads | Air squats, squat-to-stand, leg swings, cossack squats |
| HINGE  | Hamstrings, glutes, lower back | Glute bridges, single-leg RDL, good mornings, hip circles |
| PRESS  | Shoulders, chest, triceps | Arm circles, band pull-aparts, push-ups, shoulder dislocates |
| PULL   | Lats, upper back, grip | Cat-cow, band pull-aparts, dead hangs, scap pull-ups |
| POWER  | Full body, explosive prep | Jumping jacks, high knees, box jumps (low), light burpees |

Scale warm-up intensity: At 1-2, these are gentle. At 8-10, elevate heart rate.

---

PRIMARY LIFT RULES:

- For consolidated exercises (bench-press, strict-press, rdl, etc.), only barbell variants can be primary lifts
- Dumbbell/kettlebell variants of these exercises go in accessory section
- At intensity 1-2, primary lift is still present but uses light weight and focuses on form

---

MULTI-ANCHOR EXERCISES:

Some exercises belong to multiple anchors. For example:
- Deadlifts: primary anchor is HINGE, but also valid for PULL (heavy lat/back involvement)
- Push Press: primary anchor is PRESS, but also valid for POWER (explosive leg drive)
- Thrusters: primary anchor is POWER, but also valid for SQUAT and PRESS

When an exercise lists multiple anchors, you CAN use it for any of those anchors. This adds variety.

---

EQUIPMENT CONSTRAINTS:

- Only prescribe exercises the user can perform with available equipment
- Use the exercise library's \`equipment_display_names\` for proper naming
- Offer regressions when appropriate for user's experience level

---

OUTPUT FORMAT:

Return valid JSON matching this exact schema. No markdown, no explanation — just the JSON object.

{
  "title": "string - workout title",
  "overview": "string - brief description of the workout",
  "estimated_duration_mins": number,
  "intensity_description": "string - description of how intense this workout is",
  "sections": [
    {
      "section_type": "warmup|mobility|primary_lift|accessory|core|conditioning|cooldown",
      "section_title": "string - display name for this section",
      "section_notes": "string|null - optional notes for this section",
      "estimated_duration_mins": number,
      "exercises": [
        {
          "exercise_id": "string - MUST be from the exercise library provided",
          "name": "string - display name of the exercise",
          "equipment": "string - equipment used (must be from available equipment list)",
          "sets": number|null,
          "reps": "string - e.g. '8', '30 sec', '8 each side'",
          "effort_percent": number|null,
          "tempo": "string|null - e.g. '3-1-2'",
          "rest_seconds": number|null,
          "coaching_cues": ["array of coaching cue strings"],
          "regression": "string|null - easier alternative",
          "structure": { "type": "standard|superset|circuit|emom|amrap|for_time|timed", ...params }
        }
      ]
    }
  ]
}
`;

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

  return `USER CONTEXT:
- Experience: ${profile.experience_level || 'some'}
- Limitations: ${profile.limitations || 'None'}
- Available equipment: ${location.equipment.join(', ')}
- Enabled sections: ${profile.enabled_sections.join(', ')}

WORKOUT REQUEST:
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');

    console.log('Auth header exists:', !!authHeader);

    // Extract user ID from JWT - Supabase has already verified the token
    // (we deploy without --no-verify-jwt, so invalid tokens are rejected before reaching here)
    let userId: string;
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.sub;
        console.log('Extracted userId from JWT:', userId);
      } catch (e) {
        console.log('Failed to parse JWT:', e);
        return new Response(
          JSON.stringify({ error: 'Invalid token format' }),
          { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }
    } else {
      console.log('No auth header present');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Create service client for database operations (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const user = { id: userId };

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
    const enabledSectionsSet = new Set(profile.enabled_sections);

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
          prompt_version: 'v2.0.0',
          generated_at: new Date().toISOString(),
          request: {
            intensity: request.intensity,
            anchor: request.anchor,
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
