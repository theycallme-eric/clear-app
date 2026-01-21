// Generated TypeScript types for Clear Supabase database
// Based on migrations created 2026-01-20

// ============================================
// ENUM TYPES
// ============================================

export type ExperienceLevel = 'new' | 'some' | 'confident';

export type GoalPreset = 'strength' | 'balanced' | 'conditioning' | 'quick';

export type EquipmentTier = 'minimal' | 'home' | 'building' | 'full';

export type AnchorType =
  | 'squat'
  | 'hinge'
  | 'press'
  | 'pull'
  | 'power'
  | 'surprise'
  | 'upper_body'
  | 'lower_body'
  | 'full_body';

export type SectionType =
  | 'warmup'
  | 'mobility'
  | 'primary_lift'
  | 'accessory'
  | 'skill_power'
  | 'carries'
  | 'core'
  | 'stability_balance'
  | 'conditioning'
  | 'cooldown';

export type StreakStatus = 'active' | 'paused';

export type StreakPauseReason = 'injury' | 'sick' | 'vacation';

export type RestDayReason = 'rest' | 'injury' | 'sick';

export type MovementCategory = 'lower_body' | 'upper_body' | 'core' | 'full_body';

// ============================================
// TABLE TYPES
// ============================================

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  experience_level: ExperienceLevel | null;
  goal_preset: GoalPreset | null;
  limitations: string | null;
  enabled_sections: SectionType[];
  streak_count: number;
  streak_start_date: string | null;
  streak_status: StreakStatus;
  streak_pause_reason: StreakPauseReason | null;
  streak_pause_start: string | null;
  consecutive_rest_days: number;
  onboarding_completed: boolean;
  default_location_id: string | null;
}

export interface Location {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  tier: EquipmentTier;
  equipment: string[];
  is_default: boolean;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  location_id: string | null;
  created_at: string;
  updated_at: string;
  date: string;
  anchor: AnchorType;
  intensity: number;
  goal_preset: GoalPreset | null;
  time_target_mins: number | null;
  generation_notes: string | null;
  duration_mins: number | null;
  mood: string | null;
  session_notes: string | null;
  counts_for_streak: boolean;
  is_rest_day: boolean;
  rest_day_reason: RestDayReason | null;
  prompt_version: string | null;
  completed_at: string | null;
}

export interface WorkoutSection {
  id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  section_type: SectionType;
  order_index: number;
  section_notes: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface Exercise {
  id: string;
  section_id: string;
  exercise_id: string;
  created_at: string;
  updated_at: string;
  equipment_used: string;
  sets: number | null;
  reps: string;
  effort_percent: number | null;
  tempo: string | null;
  rest_seconds: number | null;
  coaching_cues: string | null;
  weight_logged: string | null;
  exercise_notes: string | null;
  order_index: number;
}

export interface MovementPattern {
  id: string;
  created_at: string;
  name: string;
  category: MovementCategory;
  anchor: AnchorType;
  description: string | null;
}

export interface ExerciseDefinition {
  id: string;
  pattern_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  equipment_options: string[];
  default_equipment: string;
  regression: string | null;
  progression: string | null;
  coaching_cues: string[] | null;
  sections: SectionType[];
  can_be_primary: boolean;
}

// ============================================
// INSERT TYPES (for creating new records)
// ============================================

export interface ProfileInsert {
  id: string; // Must match auth.users id
  experience_level?: ExperienceLevel | null;
  goal_preset?: GoalPreset | null;
  limitations?: string | null;
  enabled_sections?: SectionType[];
  streak_count?: number;
  streak_start_date?: string | null;
  streak_status?: StreakStatus;
  streak_pause_reason?: StreakPauseReason | null;
  streak_pause_start?: string | null;
  consecutive_rest_days?: number;
  onboarding_completed?: boolean;
  default_location_id?: string | null;
}

export interface ProfileUpdate {
  experience_level?: ExperienceLevel | null;
  goal_preset?: GoalPreset | null;
  limitations?: string | null;
  enabled_sections?: SectionType[];
  streak_count?: number;
  streak_start_date?: string | null;
  streak_status?: StreakStatus;
  streak_pause_reason?: StreakPauseReason | null;
  streak_pause_start?: string | null;
  consecutive_rest_days?: number;
  onboarding_completed?: boolean;
  default_location_id?: string | null;
}

export interface LocationInsert {
  user_id: string;
  name: string;
  tier: EquipmentTier;
  equipment?: string[];
  is_default?: boolean;
}

export interface LocationUpdate {
  name?: string;
  tier?: EquipmentTier;
  equipment?: string[];
  is_default?: boolean;
}

export interface WorkoutSessionInsert {
  user_id: string;
  location_id?: string | null;
  date: string;
  anchor: AnchorType;
  intensity: number;
  goal_preset?: GoalPreset | null;
  time_target_mins?: number | null;
  generation_notes?: string | null;
  duration_mins?: number | null;
  mood?: string | null;
  session_notes?: string | null;
  counts_for_streak?: boolean;
  is_rest_day?: boolean;
  rest_day_reason?: RestDayReason | null;
  prompt_version?: string | null;
  completed_at?: string | null;
}

export interface WorkoutSessionUpdate {
  location_id?: string | null;
  date?: string;
  anchor?: AnchorType;
  intensity?: number;
  goal_preset?: GoalPreset | null;
  time_target_mins?: number | null;
  generation_notes?: string | null;
  duration_mins?: number | null;
  mood?: string | null;
  session_notes?: string | null;
  counts_for_streak?: boolean;
  is_rest_day?: boolean;
  rest_day_reason?: RestDayReason | null;
  prompt_version?: string | null;
  completed_at?: string | null;
}

export interface WorkoutSectionInsert {
  session_id: string;
  section_type: SectionType;
  order_index: number;
  section_notes?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface WorkoutSectionUpdate {
  section_type?: SectionType;
  order_index?: number;
  section_notes?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface ExerciseInsert {
  section_id: string;
  exercise_id: string;
  equipment_used: string;
  sets?: number | null;
  reps: string;
  effort_percent?: number | null;
  tempo?: string | null;
  rest_seconds?: number | null;
  coaching_cues?: string | null;
  weight_logged?: string | null;
  exercise_notes?: string | null;
  order_index: number;
}

export interface ExerciseUpdate {
  exercise_id?: string;
  equipment_used?: string;
  sets?: number | null;
  reps?: string;
  effort_percent?: number | null;
  tempo?: string | null;
  rest_seconds?: number | null;
  coaching_cues?: string | null;
  weight_logged?: string | null;
  exercise_notes?: string | null;
  order_index?: number;
}

// ============================================
// SUPABASE DATABASE TYPE (for client)
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      locations: {
        Row: Location;
        Insert: LocationInsert;
        Update: LocationUpdate;
      };
      workout_sessions: {
        Row: WorkoutSession;
        Insert: WorkoutSessionInsert;
        Update: WorkoutSessionUpdate;
      };
      workout_sections: {
        Row: WorkoutSection;
        Insert: WorkoutSectionInsert;
        Update: WorkoutSectionUpdate;
      };
      exercises: {
        Row: Exercise;
        Insert: ExerciseInsert;
        Update: ExerciseUpdate;
      };
      movement_patterns: {
        Row: MovementPattern;
        Insert: never; // Read-only
        Update: never; // Read-only
      };
      exercise_definitions: {
        Row: ExerciseDefinition;
        Insert: never; // Read-only
        Update: never; // Read-only
      };
    };
    Enums: {
      experience_level: ExperienceLevel;
      goal_preset: GoalPreset;
      equipment_tier: EquipmentTier;
      anchor_type: AnchorType;
      section_type: SectionType;
      streak_status: StreakStatus;
      streak_pause_reason: StreakPauseReason;
      rest_day_reason: RestDayReason;
      movement_category: MovementCategory;
    };
  };
}

// ============================================
// HELPER TYPES
// ============================================

// Full workout with all nested data
export interface WorkoutSessionWithDetails extends WorkoutSession {
  location: Location | null;
  sections: WorkoutSectionWithExercises[];
}

export interface WorkoutSectionWithExercises extends WorkoutSection {
  exercises: ExerciseWithDefinition[];
}

export interface ExerciseWithDefinition extends Exercise {
  definition: ExerciseDefinition;
}

// Dashboard data
export interface DashboardData {
  streak: {
    count: number;
    start_date: string | null;
    status: StreakStatus;
  };
  week_view: DayStatus[];
  recent_sessions: WorkoutSession[];
  quick_start_suggestion: {
    intensity: number;
    anchor: AnchorType;
  } | null;
}

export interface DayStatus {
  date: string;
  status: 'workout' | 'rest' | 'empty';
  session_id?: string;
}

// Exercise history for a specific exercise
export interface ExerciseHistory {
  exercise_id: string;
  exercise_name: string;
  occurrences: number;
  weight_range: { min: number; max: number } | null;
  last_performed: string | null;
  recent_notes: string[];
}
