#!/usr/bin/env npx tsx
/**
 * Headless workout generation tester.
 *
 * Connects to local Supabase DB, builds the same prompt the edge function does,
 * calls Claude directly, validates the response, and prints a quality report.
 *
 * Usage:
 *   npx tsx scripts/test-generation.ts                    # Run default test suite (3 workouts)
 *   npx tsx scripts/test-generation.ts --count 10         # Generate 10 workouts
 *   npx tsx scripts/test-generation.ts --anchor squat     # Specific anchor
 *   npx tsx scripts/test-generation.ts --goal strength    # Specific goal
 *   npx tsx scripts/test-generation.ts --intensity 8      # Specific intensity
 *   npx tsx scripts/test-generation.ts --sweep            # All anchor × goal combos
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// CONFIG
// ============================================

const SUPABASE_URL = 'http://127.0.0.1:54321';
// Local dev uses the default anon/service keys from supabase init
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Read Anthropic key from supabase/.env
function getAnthropicKey(): string {
  try {
    const envContent = readFileSync(resolve(__dirname, '../supabase/.env'), 'utf-8');
    const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch { /* fall through */ }
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  throw new Error('No ANTHROPIC_API_KEY found in supabase/.env or environment');
}

// ============================================
// TYPES (mirrored from edge function)
// ============================================

interface MuscleGroupEntry {
  muscle: string;
  role: string;
}

interface ExerciseDefinition {
  id: string;
  name: string;
  equipment_options: string[];
  sections: string[];
  regression: string | null;
  can_be_primary: boolean;
  anchors: string[] | null;
  primary_anchor: string | null;
  muscle_groups: MuscleGroupEntry[] | null;
  component_movements: string[] | null;
  exercise_role: string | null;
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
  regression: string | null;
  structure: { type: string; group_id?: string; [key: string]: unknown };
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

interface TestCase {
  name: string;
  anchor: string;
  goal: string;
  intensity: number;
  duration: number;
  equipment: string[];
}

interface TestResult {
  testCase: TestCase;
  workout: GeneratedWorkout | null;
  errors: string[];
  warnings: string[];
  durationMs: number;
  musclesCovered: { primary: string[]; synergist: string[] };
}

// ============================================
// PROMPT BUILDING (same logic as edge function)
// ============================================

function buildExerciseListing(exercises: ExerciseDefinition[]): string {
  return exercises.map((ex) => {
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
}

function buildUserPrompt(tc: TestCase, exerciseListStr: string): string {
  return `USER CONTEXT:
- Experience: confident
- Limitations: None
- Available equipment: ${tc.equipment.join(', ')}
- Enabled sections: warmup, mobility, primary_lift, accessory, core, conditioning, cooldown

WORKOUT REQUEST:
- Training Goal: ${tc.goal}
- Intensity: ${tc.intensity}/10
- Anchor: ${tc.anchor}
- Duration: ${tc.duration} minutes
- Location: Test Gym
- Notes: None

RECENT HISTORY (avoid repeating):
- Last 3 anchors: None
- Recent exercises to vary from: None

EXERCISE LIBRARY (you MUST only use exercise_id values from this list):
${exerciseListStr}

Generate a workout matching these parameters. Use ONLY exercise IDs from the library above. Return JSON only.`;
}

// ============================================
// VALIDATION
// ============================================

function validateWorkout(
  workout: GeneratedWorkout,
  exerciseIds: Set<string>,
  availableEquipment: Set<string>,
  tc: TestCase,
  muscleMap: Map<string, MuscleGroupEntry[]>,
  componentMap: Map<string, string[]>
): { errors: string[]; warnings: string[]; musclesCovered: { primary: string[]; synergist: string[] } } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const primaryMuscles = new Set<string>();
  const synergistMuscles = new Set<string>();

  // Check all exercise IDs exist
  for (const section of workout.sections) {
    for (const ex of section.exercises) {
      if (!exerciseIds.has(ex.exercise_id)) {
        errors.push(`Unknown exercise_id: ${ex.exercise_id}`);
      }
      if (!availableEquipment.has(ex.equipment)) {
        errors.push(`Unavailable equipment "${ex.equipment}" for ${ex.name}`);
      }

      // Track muscle coverage
      const muscles = muscleMap.get(ex.exercise_id) || [];
      for (const m of muscles) {
        if (m.role === 'primary') primaryMuscles.add(m.muscle);
        else if (m.role === 'synergist') synergistMuscles.add(m.muscle);
      }

      // Check structure group_id rules
      if (ex.structure.type !== 'standard' && !ex.structure.group_id) {
        errors.push(`${ex.name}: non-standard structure "${ex.structure.type}" missing group_id`);
      }
    }

    // Variety rule: no two exercises in a section share >75% components
    for (let i = 0; i < section.exercises.length; i++) {
      for (let j = i + 1; j < section.exercises.length; j++) {
        const aComps = componentMap.get(section.exercises[i].exercise_id) || [];
        const bComps = componentMap.get(section.exercises[j].exercise_id) || [];
        if (aComps.length > 0 && bComps.length > 0) {
          const aSet = new Set(aComps);
          const bSet = new Set(bComps);
          const shared = aComps.filter(c => bSet.has(c)).length;
          const minLen = Math.min(aSet.size, bSet.size);
          if (minLen > 0 && shared / minLen > 0.75) {
            warnings.push(
              `Variety: ${section.exercises[i].name} & ${section.exercises[j].name} share ${shared}/${minLen} components in ${section.section_type}`
            );
          }
        }
      }
    }
  }

  // Check duration
  const durationDiff = Math.abs(workout.estimated_duration_mins - tc.duration);
  const tolerance = tc.duration * 0.1;
  if (durationDiff > tolerance) {
    warnings.push(`Duration ${workout.estimated_duration_mins}m vs requested ${tc.duration}m (±10% = ${tolerance}m tolerance)`);
  }

  // Check warmup exists
  const hasWarmup = workout.sections.some(s => s.section_type === 'warmup');
  if (!hasWarmup) warnings.push('No warmup section');

  // Check cooldown exists
  const hasCooldown = workout.sections.some(s => s.section_type === 'cooldown');
  if (!hasCooldown) warnings.push('No cooldown section');

  // Component coverage: warmup must cover primary lift's component_movements
  const primarySection = workout.sections.find(s => s.section_type === 'primary_lift');
  const warmupSection = workout.sections.find(s => s.section_type === 'warmup');
  if (primarySection && warmupSection) {
    const primaryExercise = primarySection.exercises[0];
    if (primaryExercise) {
      const primaryComponents = componentMap.get(primaryExercise.exercise_id) || [];
      if (primaryComponents.length > 0) {
        const warmupComponents = new Set<string>();
        for (const wEx of warmupSection.exercises) {
          const comps = componentMap.get(wEx.exercise_id) || [];
          for (const c of comps) warmupComponents.add(c);
        }
        const gaps = primaryComponents.filter(c => !warmupComponents.has(c));
        if (gaps.length > 0) {
          warnings.push(`Warmup component gaps for ${primaryExercise.name}: missing [${gaps.join(', ')}]`);
        }
      }
    }

    // Also check muscle overlap (existing check)
    const primaryMuscleSet = new Set<string>();
    for (const ex of primarySection.exercises) {
      const muscles = muscleMap.get(ex.exercise_id) || [];
      for (const m of muscles) {
        if (m.role === 'primary') primaryMuscleSet.add(m.muscle);
      }
    }
    const warmupMuscleSet = new Set<string>();
    for (const ex of warmupSection.exercises) {
      const muscles = muscleMap.get(ex.exercise_id) || [];
      for (const m of muscles) warmupMuscleSet.add(m.muscle);
    }
    const overlap = [...primaryMuscleSet].filter(m => warmupMuscleSet.has(m));
    if (overlap.length === 0 && primaryMuscleSet.size > 0) {
      warnings.push(`Warmup doesn't target any primary muscles from primary lift (primary: ${[...primaryMuscleSet].join(',')})`);
    }
  }

  // Check cooldown relevance: should stretch muscles used in session
  const cooldownSection = workout.sections.find(s => s.section_type === 'cooldown');
  if (cooldownSection) {
    const cooldownMuscles = new Set<string>();
    for (const ex of cooldownSection.exercises) {
      const muscles = muscleMap.get(ex.exercise_id) || [];
      for (const m of muscles) cooldownMuscles.add(m.muscle);
    }
    const overlap = [...primaryMuscles].filter(m => cooldownMuscles.has(m));
    if (overlap.length === 0 && primaryMuscles.size > 0) {
      warnings.push(`Cooldown doesn't target any primary muscles worked in session`);
    }
  }

  return {
    errors,
    warnings,
    musclesCovered: {
      primary: [...primaryMuscles].sort(),
      synergist: [...synergistMuscles].sort(),
    },
  };
}

// ============================================
// CLAUDE API CALL
// ============================================

async function callClaude(systemPrompt: string, userPrompt: string, apiKey: string): Promise<GeneratedWorkout> {
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
  let content = result.content[0]?.text?.trim() || '';

  // Strip markdown fences
  if (content.startsWith('```')) {
    content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  return JSON.parse(content);
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string): string | undefined => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 ? args[idx + 1] : undefined;
  };
  const hasFlag = (name: string): boolean => args.includes(`--${name}`);

  const apiKey = getAnthropicKey();
  console.log('✓ Anthropic API key found');

  // Load system prompt
  const promptPath = resolve(__dirname, '../supabase/functions/generate-workout/prompt.ts');
  const promptModule = readFileSync(promptPath, 'utf-8');
  const systemPromptMatch = promptModule.match(/export const SYSTEM_PROMPT = `([\s\S]*?)`;/);
  if (!systemPromptMatch) throw new Error('Could not extract SYSTEM_PROMPT from prompt.ts');
  const systemPrompt = systemPromptMatch[1];
  console.log(`✓ System prompt loaded (${systemPrompt.length} chars)`);

  // Connect to local Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Fetch exercise library
  const { data: exercises, error } = await supabase
    .from('exercise_definitions_with_anchors')
    .select('id, name, equipment_options, sections, regression, can_be_primary, anchors, primary_anchor, muscle_groups, component_movements, exercise_role');

  if (error || !exercises) {
    throw new Error(`Failed to fetch exercises: ${error?.message}`);
  }
  console.log(`✓ Exercise library loaded (${exercises.length} exercises)`);

  // Build muscle map for validation
  const muscleMap = new Map<string, MuscleGroupEntry[]>();
  for (const ex of exercises) {
    if (ex.muscle_groups) muscleMap.set(ex.id, ex.muscle_groups);
  }

  // Build component map for validation
  const componentMap = new Map<string, string[]>();
  for (const ex of exercises) {
    if (ex.component_movements?.length) componentMap.set(ex.id, ex.component_movements);
  }

  // Full gym equipment
  const fullEquipment = [
    'bodyweight', 'resistance_bands', 'mat', 'foam_roller',
    'dumbbells', 'kettlebells', 'bench_flat', 'pull-up_bar', 'trx__suspension_trainer',
    'barbell', 'squat_rack__cage', 'cable_machine', 'adjustable_bench',
    'lat_pulldown', 'rowing_machine', 'assault_bike',
  ];

  const availableEquipmentSet = new Set(fullEquipment);

  // Filter exercises to available equipment
  const availableExercises = exercises.filter((ex: any) => {
    return (ex.equipment_options || []).some((eq: string) => availableEquipmentSet.has(eq));
  });
  console.log(`✓ ${availableExercises.length} exercises available with current equipment`);

  const exerciseIds = new Set(exercises.map((e: any) => e.id));
  const exerciseListStr = buildExerciseListing(availableExercises as ExerciseDefinition[]);

  // Build test cases
  let testCases: TestCase[];

  if (hasFlag('sweep')) {
    // All combinations
    const anchors = ['squat', 'hinge', 'press', 'pull', 'power'];
    const goals = ['strength', 'hypertrophy', 'conditioning', 'balanced'];
    testCases = [];
    for (const anchor of anchors) {
      for (const goal of goals) {
        testCases.push({
          name: `${anchor}/${goal}`,
          anchor,
          goal,
          intensity: 6,
          duration: 45,
          equipment: fullEquipment,
        });
      }
    }
  } else {
    const count = parseInt(getArg('count') || '3');
    const anchor = getArg('anchor');
    const goal = getArg('goal');
    const intensity = parseInt(getArg('intensity') || '0');

    if (anchor || goal || intensity) {
      // Single specific test
      testCases = [{
        name: `${anchor || 'squat'}/${goal || 'balanced'}@${intensity || 6}`,
        anchor: anchor || 'squat',
        goal: goal || 'balanced',
        intensity: intensity || 6,
        duration: 45,
        equipment: fullEquipment,
      }];
    } else {
      // Default diverse test suite
      const presets: Array<{ anchor: string; goal: string; intensity: number }> = [
        { anchor: 'squat', goal: 'strength', intensity: 7 },
        { anchor: 'press', goal: 'hypertrophy', intensity: 6 },
        { anchor: 'pull', goal: 'balanced', intensity: 5 },
        { anchor: 'hinge', goal: 'conditioning', intensity: 8 },
        { anchor: 'power', goal: 'balanced', intensity: 7 },
      ];
      testCases = presets.slice(0, count).map(p => ({
        name: `${p.anchor}/${p.goal}@${p.intensity}`,
        anchor: p.anchor,
        goal: p.goal,
        intensity: p.intensity,
        duration: 45,
        equipment: fullEquipment,
      }));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`RUNNING ${testCases.length} GENERATION TEST(S)`);
  console.log(`${'='.repeat(60)}\n`);

  const results: TestResult[] = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`[${i + 1}/${testCases.length}] ${tc.name} ...`);

    const userPrompt = buildUserPrompt(tc, exerciseListStr);
    const start = Date.now();

    try {
      const workout = await callClaude(systemPrompt, userPrompt, apiKey);
      const elapsed = Date.now() - start;

      const validation = validateWorkout(workout, exerciseIds, availableEquipmentSet, tc, muscleMap, componentMap);

      results.push({
        testCase: tc,
        workout,
        errors: validation.errors,
        warnings: validation.warnings,
        durationMs: elapsed,
        musclesCovered: validation.musclesCovered,
      });

      const status = validation.errors.length > 0 ? '✗ FAIL' : validation.warnings.length > 0 ? '⚠ WARN' : '✓ PASS';
      console.log(`  ${status} (${(elapsed / 1000).toFixed(1)}s) "${workout.title}"`);
      console.log(`  Sections: ${workout.sections.map(s => s.section_type).join(' → ')}`);
      console.log(`  Duration: ${workout.estimated_duration_mins}m (requested ${tc.duration}m)`);
      console.log(`  Exercises: ${workout.sections.reduce((sum, s) => sum + s.exercises.length, 0)}`);
      console.log(`  Primary muscles: ${validation.musclesCovered.primary.join(', ')}`);

      if (validation.errors.length > 0) {
        console.log(`  ERRORS:`);
        for (const e of validation.errors) console.log(`    - ${e}`);
      }
      if (validation.warnings.length > 0) {
        console.log(`  WARNINGS:`);
        for (const w of validation.warnings) console.log(`    - ${w}`);
      }
      console.log();
    } catch (err) {
      const elapsed = Date.now() - start;
      results.push({
        testCase: tc,
        workout: null,
        errors: [`Generation failed: ${err instanceof Error ? err.message : String(err)}`],
        warnings: [],
        durationMs: elapsed,
        musclesCovered: { primary: [], synergist: [] },
      });
      console.log(`  ✗ FAIL (${(elapsed / 1000).toFixed(1)}s): ${err instanceof Error ? err.message : err}\n`);
    }
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(60)}`);

  const passed = results.filter(r => r.errors.length === 0 && r.warnings.length === 0).length;
  const warned = results.filter(r => r.errors.length === 0 && r.warnings.length > 0).length;
  const failed = results.filter(r => r.errors.length > 0).length;

  console.log(`  Pass: ${passed}  Warn: ${warned}  Fail: ${failed}  Total: ${results.length}`);
  console.log(`  Avg generation time: ${(results.reduce((s, r) => s + r.durationMs, 0) / results.length / 1000).toFixed(1)}s`);

  // Structure usage stats
  const structureTypes = new Map<string, number>();
  for (const r of results) {
    if (!r.workout) continue;
    for (const s of r.workout.sections) {
      for (const ex of s.exercises) {
        const t = ex.structure.type;
        structureTypes.set(t, (structureTypes.get(t) || 0) + 1);
      }
    }
  }
  console.log(`  Structures used: ${[...structureTypes.entries()].map(([k, v]) => `${k}(${v})`).join(', ')}`);

  // Muscle coverage across all workouts
  const allPrimary = new Set<string>();
  for (const r of results) {
    for (const m of r.musclesCovered.primary) allPrimary.add(m);
  }
  console.log(`  Unique primary muscles hit: ${allPrimary.size} (${[...allPrimary].sort().join(', ')})`);

  if (failed > 0) {
    console.log('\nFAILED TESTS:');
    for (const r of results.filter(r => r.errors.length > 0)) {
      console.log(`  ${r.testCase.name}:`);
      for (const e of r.errors) console.log(`    - ${e}`);
    }
  }

  console.log();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
