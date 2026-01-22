// Types for workout generation API
// Shared between frontend and Supabase Edge Function

// ============================================
// REQUEST TYPES
// ============================================

export interface GenerateWorkoutRequest {
  intensity: number; // 1-10
  anchor: string;
  duration_mins: number;
  location_id?: string; // Optional if equipment provided
  location_name?: string; // For display in prompt
  equipment?: string[]; // Direct equipment list (alternative to location_id)
  experience_level?: string; // Optional override
  limitations?: string; // Optional override
  enabled_sections?: string[]; // Optional override
  notes?: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface GenerateWorkoutResponse {
  workout: GeneratedWorkout;
  metadata: GenerationMetadata;
}

export interface GenerationMetadata {
  prompt_version: string;
  generated_at: string;
  request: {
    intensity: number;
    anchor: string;
    duration_mins: number;
    location_id: string;
  };
}

// ============================================
// WORKOUT STRUCTURE TYPES
// ============================================

export interface GeneratedWorkout {
  title: string;
  overview: string;
  estimated_duration_mins: number;
  intensity_description: string;
  sections: GeneratedSection[];
}

export interface GeneratedSection {
  section_type: SectionType;
  section_title: string;
  section_notes: string | null;
  estimated_duration_mins: number;
  exercises: GeneratedExercise[];
}

export interface GeneratedExercise {
  exercise_id: string;
  name: string;
  equipment: string;

  // Prescription
  sets: number | null;
  reps: string; // "8" or "30 sec" or "5 breaths" or "AMRAP"
  effort_percent: number | null; // e.g., 70 for "@ 70%"
  tempo: string | null; // e.g., "3-1-2" (eccentric-pause-concentric)
  rest_seconds: number | null;

  // Guidance
  coaching_cues: string[];
  regression: string | null;

  // Structure hints
  structure: ExerciseStructure;
}

export type ExerciseStructure =
  | { type: 'standard' }
  | { type: 'superset'; paired_with: string }
  | { type: 'circuit'; circuit_id: string }
  | { type: 'emom'; minutes: number }
  | { type: 'amrap'; minutes: number }
  | { type: 'afap'; time_cap_mins: number; pattern: string }
  | { type: 'timed'; work_seconds: number; rest_seconds: number };

export type SectionType =
  | 'warmup'
  | 'mobility'
  | 'primary_lift'
  | 'accessory'
  | 'core'
  | 'conditioning'
  | 'cooldown';

// ============================================
// ERROR TYPES
// ============================================

export interface GenerationError {
  error: string;
  details?: string;
}

// ============================================
// HELPER TYPE GUARDS
// ============================================

export function isGenerationError(
  response: GenerateWorkoutResponse | GenerationError
): response is GenerationError {
  return 'error' in response;
}

export function isStructureSuperset(
  structure: ExerciseStructure
): structure is { type: 'superset'; paired_with: string } {
  return structure.type === 'superset';
}

export function isStructureCircuit(
  structure: ExerciseStructure
): structure is { type: 'circuit'; circuit_id: string } {
  return structure.type === 'circuit';
}

export function isStructureEmom(
  structure: ExerciseStructure
): structure is { type: 'emom'; minutes: number } {
  return structure.type === 'emom';
}

export function isStructureAmrap(
  structure: ExerciseStructure
): structure is { type: 'amrap'; minutes: number } {
  return structure.type === 'amrap';
}

export function isStructureAfap(
  structure: ExerciseStructure
): structure is { type: 'afap'; time_cap_mins: number; pattern: string } {
  return structure.type === 'afap';
}

export function isStructureTimed(
  structure: ExerciseStructure
): structure is { type: 'timed'; work_seconds: number; rest_seconds: number } {
  return structure.type === 'timed';
}
