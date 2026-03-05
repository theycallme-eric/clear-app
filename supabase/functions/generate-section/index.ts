// Supabase Edge Function: generate-section
// Handles exercise swap operations for the Review screen (Screen 2)
// Supports single exercise swap, unit swap, and full section regeneration
// Version: v1.0.0

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

// ============================================
// TYPES
// ============================================

interface SwapTarget {
  exercise_name?: string;   // for single swap
  group_id?: string;        // for unit swap
  structure_type?: string;  // 'superset' | 'emom' | 'amrap' | 'afap' | 'timed'
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

interface SwapRequest {
  session_context: {
    intensity: number;
    anchor: string;
    goal?: string;
    location_id?: string;
    equipment?: string[];
  };
  section_type: string;
  exclude_exercises?: string[];
  swap_mode: 'section' | 'single' | 'unit';
  swap_target: SwapTarget;
  keep_exercises: GeneratedExercise[];
  current_section: GeneratedSection;
}

interface ExerciseDefinition {
  id: string;
  name: string;
  equipment_options: string[];
  sections: string[];
  coaching_cues: string[] | null;
  regression: string | null;
  can_be_primary: boolean;
  anchors: string[] | null;
}

// ============================================
// PROMPT BUILDERS
// ============================================

function buildSwapSystemPrompt(): string {
  return `You are a fitness coach assisting with exercise swaps in the Clear app. You will receive a section from a workout and instructions on what to replace. Your job is to return the FULL section with the replacement(s) made.

RULES:
1. Only replace what is asked — preserve everything else exactly
2. The replacement must fit the same role in the section
3. Never duplicate an exercise that's staying in the section or listed in exclude_exercises
4. Match the intensity level and available equipment
5. Maintain the same structure type for unit swaps (if replacing an AMRAP, return an AMRAP)
6. All non-standard exercises MUST include group_id in their structure. Exercises in the same group share the same group_id.
7. Use ONLY exercise_id values from the provided exercise library
8. Return valid JSON matching the section schema — no markdown, no explanation

OUTPUT FORMAT:
{
  "section_type": "string",
  "section_title": "string",
  "section_notes": "string|null",
  "estimated_duration_mins": number,
  "exercises": [
    {
      "exercise_id": "string - MUST be from exercise library",
      "name": "string",
      "equipment": "string",
      "sets": number|null,
      "reps": "string",
      "effort_percent": number|null,
      "tempo": "string|null",
      "rest_seconds": number|null,
      "regression": "string|null",
      "structure": { "type": "standard|superset|circuit|emom|amrap|for_time|timed", "group_id": "string (required for non-standard)", ...params }
    }
  ]
}`;
}

function buildSwapUserPrompt(
  request: SwapRequest,
  equipment: string[],
  exerciseLibrary: ExerciseDefinition[]
): string {
  const { swap_mode, swap_target, keep_exercises, current_section, session_context, exclude_exercises } = request;

  const keepNames = keep_exercises.map(e => e.name).join(', ') || 'None';
  const excludeNames = (exclude_exercises || []).join(', ') || 'None';
  const equipmentStr = equipment.join(', ');

  // Build exercise library for the prompt
  const exerciseListStr = exerciseLibrary.map(ex => {
    const equipStr = ex.equipment_options.join(', ');
    const sectionsStr = ex.sections.join(', ');
    const anchorsStr = ex.anchors?.length ? ` anchors:[${ex.anchors.join(', ')}]` : '';
    return `  ${ex.id} | ${ex.name} | equipment:[${equipStr}] | sections:[${sectionsStr}]${anchorsStr}`;
  }).join('\n');

  let swapInstructions = '';

  if (swap_mode === 'single') {
    // Check if the target exercise is in a circuit
    const targetExercise = current_section.exercises.find(
      e => e.name === swap_target.exercise_name
    );
    const isCircuit = targetExercise?.structure?.type === 'circuit';

    if (isCircuit) {
      const circuitId = targetExercise.structure.circuit_id || targetExercise.structure.group_id;
      const otherCircuitExercises = current_section.exercises
        .filter(e =>
          e.name !== swap_target.exercise_name &&
          (e.structure?.circuit_id === circuitId || e.structure?.group_id === circuitId)
        )
        .map(e => e.name)
        .join(', ');
      const otherSectionExercises = current_section.exercises
        .filter(e =>
          e.name !== swap_target.exercise_name &&
          e.structure?.circuit_id !== circuitId &&
          e.structure?.group_id !== circuitId
        )
        .map(e => e.name)
        .join(', ') || 'None';

      swapInstructions = `SWAP MODE: single (within circuit)
Replace ONLY "${swap_target.exercise_name}" in this circuit.
Other circuit exercises (the replacement must complement these): ${otherCircuitExercises}
Other section exercises (do not duplicate): ${otherSectionExercises}
The replacement should:
- Fit the circuit's flow and intent
- Use available equipment: ${equipmentStr}
- Maintain similar work/rest timing
Return the full section with ONE circuit exercise replaced.`;
    } else {
      swapInstructions = `SWAP MODE: single
Replace ONLY "${swap_target.exercise_name}" in this section.
Exercises staying (do not duplicate these): ${keepNames}
The replacement should:
- Fit the same role in the section
- Use available equipment: ${equipmentStr}
- Match intensity level: ${session_context.intensity}/10
- Not duplicate any exercise in the full workout
Return the full section with ONE exercise replaced.`;
    }
  } else if (swap_mode === 'unit') {
    const groupExercises = current_section.exercises
      .filter(e => e.structure?.group_id === swap_target.group_id)
      .map(e => e.name)
      .join(', ');
    const otherSectionExercises = current_section.exercises
      .filter(e => e.structure?.group_id !== swap_target.group_id)
      .map(e => e.name)
      .join(', ') || 'None';

    swapInstructions = `SWAP MODE: unit
Replace the entire ${swap_target.structure_type} group: ${groupExercises}
Other exercises in this section (do not duplicate): ${otherSectionExercises}
The replacement group should:
- Serve the same training purpose as the original group
- Maintain the same structure type (${swap_target.structure_type})
- Use available equipment: ${equipmentStr}
- Match intensity level: ${session_context.intensity}/10
Return the full section with the group replaced.`;
  } else {
    // section mode — regenerate entire section
    swapInstructions = `SWAP MODE: section
Regenerate the entire "${current_section.section_title}" section.
The replacement section should:
- Serve the same purpose (${request.section_type})
- Use available equipment: ${equipmentStr}
- Match intensity level: ${session_context.intensity}/10
- Not duplicate exercises from other sections
Return a completely new section.`;
  }

  return `${swapInstructions}

CONTEXT:
- Anchor: ${session_context.anchor}
- Goal: ${session_context.goal || 'balanced'}
- Intensity: ${session_context.intensity}/10
- Section type: ${request.section_type}
- Exercises to exclude (from other sections): ${excludeNames}

CURRENT SECTION:
${JSON.stringify(current_section, null, 2)}

EXERCISE LIBRARY (you MUST only use exercise_id values from this list):
${exerciseListStr}

Return the full updated section as JSON only.`;
}

// ============================================
// HELPERS
// ============================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function callClaudeAPI(
  systemPrompt: string,
  userPrompt: string
): Promise<GeneratedSection> {
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

  // Parse JSON — strip markdown code fences if present
  let jsonContent = content.trim();
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```(?:json)?\s*\n?/, '');
    jsonContent = jsonContent.replace(/\n?```\s*$/, '');
  }

  try {
    return JSON.parse(jsonContent);
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${jsonContent.substring(0, 200)}...`);
  }
}

function validateSection(
  section: GeneratedSection,
  exerciseLibrary: Set<string>,
  availableEquipment: Set<string>,
  request: SwapRequest
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const exercise of section.exercises) {
    if (!exerciseLibrary.has(exercise.exercise_id)) {
      errors.push(`Unknown exercise_id: ${exercise.exercise_id}`);
    }
    if (!availableEquipment.has(exercise.equipment)) {
      errors.push(`Unavailable equipment: ${exercise.equipment} for "${exercise.name}"`);
    }
    // Validate group_id on non-standard structures
    if (exercise.structure?.type !== 'standard' && !exercise.structure?.group_id) {
      errors.push(`Missing group_id on non-standard exercise: "${exercise.name}"`);
    }
  }

  // For unit swaps, verify structure type is maintained
  if (request.swap_mode === 'unit' && request.swap_target.structure_type) {
    const replacementExercises = section.exercises.filter(
      e => e.structure?.group_id && e.structure.group_id !== request.swap_target.group_id
    );
    // Check new group has the correct structure type
    const newGroupExercises = section.exercises.filter(
      e => e.structure?.group_id &&
        !request.keep_exercises.some(k => k.exercise_id === e.exercise_id)
    );
    for (const ex of newGroupExercises) {
      if (ex.structure?.type !== request.swap_target.structure_type) {
        errors.push(
          `Structure type mismatch: expected ${request.swap_target.structure_type}, got ${ex.structure?.type} for "${ex.name}"`
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const request: SwapRequest = await req.json();

    // Validate required fields
    if (!request.swap_mode || !request.session_context || !request.current_section) {
      return jsonResponse(
        { error: 'Missing required fields: swap_mode, session_context, current_section' },
        400
      );
    }

    if (request.swap_mode === 'single' && !request.swap_target?.exercise_name) {
      return jsonResponse(
        { error: 'Single swap requires swap_target.exercise_name' },
        400
      );
    }

    if (request.swap_mode === 'unit' && !request.swap_target?.group_id) {
      return jsonResponse(
        { error: 'Unit swap requires swap_target.group_id' },
        400
      );
    }

    // Auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return jsonResponse({ error: 'Authorization required' }, 401);
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401);
    }

    // Service client for DB reads
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get equipment
    let equipment: string[];

    if (request.session_context.location_id) {
      const { data: location, error: locError } = await supabase
        .from('locations')
        .select('equipment')
        .eq('id', request.session_context.location_id)
        .eq('user_id', user.id)
        .single();

      if (locError || !location) {
        return jsonResponse({ error: 'Location not found' }, 404);
      }
      equipment = [...location.equipment, 'bodyweight'];
    } else if (request.session_context.equipment) {
      equipment = [...request.session_context.equipment, 'bodyweight'];
    } else {
      return jsonResponse({ error: 'Must provide location_id or equipment' }, 400);
    }

    // Fetch exercise library filtered to available equipment and section type
    const { data: exerciseDefinitions } = await supabase
      .from('exercise_definitions_with_anchors')
      .select('id, name, equipment_options, sections, coaching_cues, regression, can_be_primary, anchors');

    const availableEquipmentSet = new Set(equipment);

    const availableExercises = (exerciseDefinitions || []).filter((ex: any) => {
      const hasEquipment = (ex.equipment_options || []).some((eq: string) =>
        availableEquipmentSet.has(eq)
      );
      const hasSection = (ex.sections || []).some((s: string) =>
        s === request.section_type
      );
      return hasEquipment && hasSection;
    }) as ExerciseDefinition[];

    const exerciseLibrarySet = new Set((exerciseDefinitions || []).map((e: any) => e.id));

    // Build prompts
    const systemPrompt = buildSwapSystemPrompt();
    const userPrompt = buildSwapUserPrompt(request, equipment, availableExercises);

    // Call Claude API with retry
    let section: GeneratedSection;
    let retryCount = 0;
    const maxRetries = 1;

    while (true) {
      try {
        section = await callClaudeAPI(systemPrompt, userPrompt);

        const validation = validateSection(
          section,
          exerciseLibrarySet,
          availableEquipmentSet,
          request
        );

        if (validation.valid) {
          break;
        }

        if (retryCount >= maxRetries) {
          console.warn('Validation errors after retry:', validation.errors);
          break;
        }

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

    return jsonResponse({
      section,
      metadata: {
        swap_mode: request.swap_mode,
        swap_target: request.swap_target,
        generated_at: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error in generate-section:', error);

    return jsonResponse(
      {
        error: 'Failed to generate section',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});
