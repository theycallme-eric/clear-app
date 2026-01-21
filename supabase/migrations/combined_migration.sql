-- Migration: Create custom enum types for Clear app
-- Created: 2026-01-20

-- Experience level (onboarding)
CREATE TYPE experience_level AS ENUM ('new', 'some', 'confident');

-- Goal presets
CREATE TYPE goal_preset AS ENUM ('strength', 'balanced', 'conditioning', 'quick');

-- Equipment tiers
CREATE TYPE equipment_tier AS ENUM ('minimal', 'home', 'building', 'full');

-- Anchor types (workout focus)
-- Note: 'power' replaces former 'rotation' anchor
CREATE TYPE anchor_type AS ENUM (
  'squat',
  'hinge',
  'press',
  'pull',
  'power',
  'surprise',
  'upper_body',
  'lower_body',
  'full_body'
);

-- Section types (workout structure)
CREATE TYPE section_type AS ENUM (
  'warmup',
  'mobility',
  'primary_lift',
  'accessory',
  'skill_power',
  'carries',
  'core',
  'stability_balance',
  'conditioning',
  'cooldown'
);

-- Streak status
CREATE TYPE streak_status AS ENUM ('active', 'paused');

-- Streak pause reasons
CREATE TYPE streak_pause_reason AS ENUM ('injury', 'sick', 'vacation');

-- Rest day reasons
CREATE TYPE rest_day_reason AS ENUM ('rest', 'injury', 'sick');

-- Movement pattern categories (for exercise library)
CREATE TYPE movement_category AS ENUM ('lower_body', 'upper_body', 'core', 'full_body');
-- Migration: Create profiles table (extends Supabase auth.users)
-- Created: 2026-01-20

CREATE TABLE profiles (
  -- Primary key references Supabase auth
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Onboarding data
  experience_level experience_level,
  goal_preset goal_preset,
  limitations TEXT,  -- Free text, parsed by LLM
  enabled_sections section_type[] DEFAULT ARRAY[
    'warmup',
    'primary_lift',
    'accessory',
    'core',
    'conditioning',
    'cooldown'
  ]::section_type[],

  -- Streak tracking
  streak_count INTEGER NOT NULL DEFAULT 0,
  streak_start_date DATE,
  streak_status streak_status NOT NULL DEFAULT 'active',
  streak_pause_reason streak_pause_reason,
  streak_pause_start DATE,
  consecutive_rest_days INTEGER NOT NULL DEFAULT 0,

  -- App state
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  default_location_id UUID  -- FK added after locations table created
);

-- Index for quick profile lookups
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
-- Migration: Create locations table
-- Created: 2026-01-20

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  name TEXT NOT NULL,  -- "Building Gym", "Home", etc.
  tier equipment_tier NOT NULL,
  equipment TEXT[] NOT NULL DEFAULT ARRAY['bodyweight']::TEXT[],  -- Array of equipment IDs

  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_locations_is_default ON locations(user_id, is_default) WHERE is_default = TRUE;

-- Trigger for updated_at
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key from profiles to locations (now that locations exists)
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_default_location
  FOREIGN KEY (default_location_id) REFERENCES locations(id) ON DELETE SET NULL;

-- Function to ensure only one default location per user
CREATE OR REPLACE FUNCTION ensure_single_default_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE locations
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_default_location
  BEFORE INSERT OR UPDATE ON locations
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION ensure_single_default_location();
-- Migration: Create workout_sessions table
-- Created: 2026-01-20

CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,  -- Null for rest days
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Date of workout (YYYY-MM-DD)
  date DATE NOT NULL,

  -- Generation inputs
  anchor anchor_type NOT NULL,
  intensity SMALLINT NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  goal_preset goal_preset,  -- Snapshot at generation time
  time_target_mins SMALLINT,
  generation_notes TEXT,  -- "Shoulder feels tight today"

  -- Execution results
  duration_mins SMALLINT,  -- Actual time taken
  mood TEXT,  -- Emoji captured post-workout
  session_notes TEXT,  -- Overall session notes
  counts_for_streak BOOLEAN NOT NULL DEFAULT TRUE,  -- False if duration < 5 min

  -- Rest day handling
  is_rest_day BOOLEAN NOT NULL DEFAULT FALSE,
  rest_day_reason rest_day_reason,

  -- Metadata
  prompt_version TEXT,  -- Which prompt generated this workout
  completed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_rest_day CHECK (
    (is_rest_day = FALSE) OR
    (is_rest_day = TRUE AND location_id IS NULL)
  ),
  CONSTRAINT valid_rest_day_reason CHECK (
    (is_rest_day = FALSE AND rest_day_reason IS NULL) OR
    (is_rest_day = TRUE)
  )
);

-- Indexes
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_date ON workout_sessions(user_id, date DESC);
CREATE INDEX idx_workout_sessions_anchor ON workout_sessions(user_id, anchor);
CREATE INDEX idx_workout_sessions_intensity ON workout_sessions(user_id, intensity);
CREATE INDEX idx_workout_sessions_completed ON workout_sessions(user_id, completed_at)
  WHERE completed_at IS NOT NULL;

-- Unique constraint: one session per user per day
CREATE UNIQUE INDEX idx_workout_sessions_unique_date
  ON workout_sessions(user_id, date);

-- Trigger for updated_at
CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Migration: Create workout_sections table
-- Created: 2026-01-20

CREATE TABLE workout_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Section details
  section_type section_type NOT NULL,
  order_index SMALLINT NOT NULL,  -- 0, 1, 2... for ordering
  section_notes TEXT,  -- Notes for whole section

  -- Timing (optional, for future analytics)
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_workout_sections_session_id ON workout_sections(session_id);
CREATE INDEX idx_workout_sections_order ON workout_sections(session_id, order_index);

-- Unique constraint: one section type per session (no duplicate sections)
CREATE UNIQUE INDEX idx_workout_sections_unique_type
  ON workout_sections(session_id, section_type);

-- Trigger for updated_at
CREATE TRIGGER update_workout_sections_updated_at
  BEFORE UPDATE ON workout_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Migration: Create exercise library tables (movement_patterns and exercise_definitions)
-- Created: 2026-01-20

-- Movement patterns (e.g., "squat", "hinge", "horizontal-press")
CREATE TABLE movement_patterns (
  id TEXT PRIMARY KEY,  -- 'squat', 'hinge', 'horizontal-press'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  name TEXT NOT NULL,  -- "Squat", "Hip Hinge"
  category movement_category NOT NULL,  -- lower_body, upper_body, core, full_body
  anchor anchor_type NOT NULL,  -- Which anchor this pattern maps to
  description TEXT
);

-- Exercise definitions (canonical exercise library)
CREATE TABLE exercise_definitions (
  id TEXT PRIMARY KEY,  -- 'back-squat', 'goblet-squat'
  pattern_id TEXT NOT NULL REFERENCES movement_patterns(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  name TEXT NOT NULL,  -- Display name: "Back Squat"

  -- Equipment
  equipment_options TEXT[] NOT NULL,  -- ['barbell', 'smith_machine']
  default_equipment TEXT NOT NULL,  -- 'barbell'

  -- Progressions
  regression TEXT REFERENCES exercise_definitions(id) ON DELETE SET NULL,  -- Easier variant
  progression TEXT REFERENCES exercise_definitions(id) ON DELETE SET NULL,  -- Harder variant

  -- Metadata
  coaching_cues TEXT[],  -- Default cues for this exercise
  sections section_type[] NOT NULL,  -- Which sections this can appear in
  can_be_primary BOOLEAN NOT NULL DEFAULT FALSE,  -- Can this be a primary lift?

  -- Constraints
  CONSTRAINT valid_default_equipment CHECK (default_equipment = ANY(equipment_options))
);

-- Indexes
CREATE INDEX idx_exercise_definitions_pattern ON exercise_definitions(pattern_id);
CREATE INDEX idx_exercise_definitions_sections ON exercise_definitions USING GIN(sections);
CREATE INDEX idx_exercise_definitions_equipment ON exercise_definitions USING GIN(equipment_options);
CREATE INDEX idx_exercise_definitions_primary ON exercise_definitions(can_be_primary) WHERE can_be_primary = TRUE;

-- Trigger for updated_at
CREATE TRIGGER update_exercise_definitions_updated_at
  BEFORE UPDATE ON exercise_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Migration: Create exercises table (instances in a workout)
-- Created: 2026-01-20

CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES workout_sections(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercise_definitions(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Equipment used (which variant from exercise_definitions.equipment_options)
  equipment_used TEXT NOT NULL,

  -- Prescription (from AI generation)
  sets SMALLINT,
  reps TEXT NOT NULL,  -- "8" or "30 sec" or "5 breaths" or "AMRAP"
  effort_percent SMALLINT CHECK (effort_percent IS NULL OR (effort_percent >= 0 AND effort_percent <= 100)),
  tempo TEXT,  -- "2-1-2" (eccentric-pause-concentric)
  rest_seconds SMALLINT,
  coaching_cues TEXT,  -- Specific cues for this instance

  -- User input during execution
  weight_logged TEXT,  -- "185lbs" or "35lbs each" or "185lbs x 8,8,8,7"
  exercise_notes TEXT,  -- "Felt heavy but moved well"

  -- Ordering within section
  order_index SMALLINT NOT NULL
);

-- Indexes
CREATE INDEX idx_exercises_section_id ON exercises(section_id);
CREATE INDEX idx_exercises_exercise_id ON exercises(exercise_id);
CREATE INDEX idx_exercises_order ON exercises(section_id, order_index);

-- Trigger for updated_at
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper view: Get exercises with full session context (for historical queries)
CREATE VIEW exercises_with_context AS
SELECT
  e.*,
  ed.name AS exercise_name,
  ed.pattern_id,
  mp.anchor,
  ws.section_type,
  wsess.user_id,
  wsess.date AS workout_date,
  wsess.intensity AS workout_intensity
FROM exercises e
JOIN exercise_definitions ed ON e.exercise_id = ed.id
JOIN movement_patterns mp ON ed.pattern_id = mp.id
JOIN workout_sections ws ON e.section_id = ws.id
JOIN workout_sessions wsess ON ws.session_id = wsess.id;
-- Migration: Create Row Level Security policies
-- Created: 2026-01-20

-- Enable RLS on all user-owned tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Exercise library tables are read-only for all authenticated users
ALTER TABLE movement_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_definitions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profile is auto-created via trigger, no insert policy needed for users

-- ============================================
-- LOCATIONS POLICIES
-- ============================================

-- Users can read their own locations
CREATE POLICY "Users can view own locations"
  ON locations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create locations for themselves
CREATE POLICY "Users can create own locations"
  ON locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own locations
CREATE POLICY "Users can update own locations"
  ON locations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own locations
CREATE POLICY "Users can delete own locations"
  ON locations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- WORKOUT_SESSIONS POLICIES
-- ============================================

-- Users can read their own sessions
CREATE POLICY "Users can view own sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create sessions for themselves
CREATE POLICY "Users can create own sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- WORKOUT_SECTIONS POLICIES
-- ============================================

-- Users can read sections of their own sessions
CREATE POLICY "Users can view own sections"
  ON workout_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_sections.session_id
      AND ws.user_id = auth.uid()
    )
  );

-- Users can create sections for their own sessions
CREATE POLICY "Users can create own sections"
  ON workout_sections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_sections.session_id
      AND ws.user_id = auth.uid()
    )
  );

-- Users can update sections of their own sessions
CREATE POLICY "Users can update own sections"
  ON workout_sections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_sections.session_id
      AND ws.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_sections.session_id
      AND ws.user_id = auth.uid()
    )
  );

-- Users can delete sections of their own sessions
CREATE POLICY "Users can delete own sections"
  ON workout_sections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_sections.session_id
      AND ws.user_id = auth.uid()
    )
  );

-- ============================================
-- EXERCISES POLICIES
-- ============================================

-- Users can read exercises of their own sessions
CREATE POLICY "Users can view own exercises"
  ON exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_sections wsec
      JOIN workout_sessions ws ON ws.id = wsec.session_id
      WHERE wsec.id = exercises.section_id
      AND ws.user_id = auth.uid()
    )
  );

-- Users can create exercises for their own sessions
CREATE POLICY "Users can create own exercises"
  ON exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sections wsec
      JOIN workout_sessions ws ON ws.id = wsec.session_id
      WHERE wsec.id = exercises.section_id
      AND ws.user_id = auth.uid()
    )
  );

-- Users can update exercises of their own sessions
CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sections wsec
      JOIN workout_sessions ws ON ws.id = wsec.session_id
      WHERE wsec.id = exercises.section_id
      AND ws.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sections wsec
      JOIN workout_sessions ws ON ws.id = wsec.session_id
      WHERE wsec.id = exercises.section_id
      AND ws.user_id = auth.uid()
    )
  );

-- Users can delete exercises of their own sessions
CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sections wsec
      JOIN workout_sessions ws ON ws.id = wsec.session_id
      WHERE wsec.id = exercises.section_id
      AND ws.user_id = auth.uid()
    )
  );

-- ============================================
-- EXERCISE LIBRARY POLICIES (Read-only for all)
-- ============================================

-- All authenticated users can read movement patterns
CREATE POLICY "Authenticated users can view movement patterns"
  ON movement_patterns FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can read exercise definitions
CREATE POLICY "Authenticated users can view exercise definitions"
  ON exercise_definitions FOR SELECT
  TO authenticated
  USING (true);

-- Note: Only service_role (backend) can insert/update/delete exercise library data
-- This is enforced by not having INSERT/UPDATE/DELETE policies for authenticated users
-- Migration: Seed exercise library with initial data
-- Created: 2026-01-20
-- Source: Clear_-_Exercise_Library.md

-- ============================================
-- MOVEMENT PATTERNS
-- ============================================

INSERT INTO movement_patterns (id, name, category, anchor, description) VALUES
  -- SQUAT patterns
  ('squat-bilateral', 'Bilateral Squat', 'lower_body', 'squat', 'Two-legged squatting movements'),
  ('squat-unilateral', 'Unilateral Squat', 'lower_body', 'squat', 'Single-leg squat variations'),

  -- HINGE patterns
  ('hinge-deadlift', 'Deadlift', 'lower_body', 'hinge', 'Hip-hinge pulling from floor'),
  ('hinge-hip-thrust', 'Hip Thrust', 'lower_body', 'hinge', 'Hip extension movements'),
  ('hinge-swing', 'Swing', 'lower_body', 'hinge', 'Ballistic hip-hinge movements'),

  -- PRESS patterns
  ('press-horizontal', 'Horizontal Press', 'upper_body', 'press', 'Pressing away from torso'),
  ('press-vertical', 'Vertical Press', 'upper_body', 'press', 'Pressing overhead'),
  ('press-accessory', 'Press Accessory', 'upper_body', 'press', 'Isolation pressing movements'),

  -- PULL patterns
  ('pull-vertical', 'Vertical Pull', 'upper_body', 'pull', 'Pulling from overhead'),
  ('pull-horizontal', 'Horizontal Pull', 'upper_body', 'pull', 'Rowing movements'),
  ('pull-accessory', 'Pull Accessory', 'upper_body', 'pull', 'Isolation pulling movements'),

  -- POWER patterns
  ('power-clean', 'Clean', 'full_body', 'power', 'Olympic clean variations'),
  ('power-snatch', 'Snatch', 'full_body', 'power', 'Snatch variations'),
  ('power-thruster', 'Thruster', 'full_body', 'power', 'Squat to press combination'),

  -- CORE patterns
  ('core-anti-rotation', 'Anti-Rotation', 'core', 'surprise', 'Resisting rotation'),
  ('core-flexion', 'Core Flexion', 'core', 'surprise', 'Spinal flexion movements'),
  ('core-stability', 'Core Stability', 'core', 'surprise', 'Isometric core holds'),

  -- CONDITIONING patterns
  ('conditioning-plyometric', 'Plyometric', 'full_body', 'surprise', 'Jumping and explosive movements'),
  ('conditioning-locomotion', 'Locomotion', 'full_body', 'surprise', 'Running and moving patterns');

-- ============================================
-- EXERCISE DEFINITIONS - SQUAT ANCHOR
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- Primary Lift Eligible
  ('back-squat', 'squat-bilateral', 'Back Squat', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Chest up, core braced', 'Knees track over toes', 'Hip crease below knee']),

  ('front-squat', 'squat-bilateral', 'Front Squat', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Elbows high, upper back tight', 'Upright torso', 'Full depth']),

  ('leg-press', 'squat-bilateral', 'Leg Press', ARRAY['leg_press'], 'leg_press',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Full range of motion', 'Do not lock knees', 'Control the negative']),

  -- Accessory Only
  ('goblet-squat', 'squat-bilateral', 'Goblet Squat', ARRAY['dumbbells', 'kettlebells'], 'dumbbells',
   ARRAY['accessory', 'warmup']::section_type[], FALSE,
   ARRAY['Weight at chest', 'Elbows inside knees', 'Upright torso']),

  ('bulgarian-split-squat', 'squat-unilateral', 'Bulgarian Split Squat', ARRAY['dumbbells', 'barbell', 'bodyweight'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Rear foot elevated', 'Vertical shin on front leg', 'Control the descent']),

  ('walking-lunges', 'squat-unilateral', 'Walking Lunges', ARRAY['dumbbells', 'barbell', 'bodyweight'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Long stride', 'Knee tracks over toe', 'Upright torso']),

  ('reverse-lunges', 'squat-unilateral', 'Reverse Lunges', ARRAY['dumbbells', 'barbell', 'bodyweight'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Step back with control', 'Front knee stable', 'Drive through front heel']),

  ('box-step-ups', 'squat-unilateral', 'Box Step-ups', ARRAY['box', 'dumbbells'], 'box',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Full foot on box', 'Drive through heel', 'Minimal push from rear leg']);

-- ============================================
-- EXERCISE DEFINITIONS - HINGE ANCHOR
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- Primary Lift Eligible
  ('deadlift', 'hinge-deadlift', 'Deadlift', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Neutral spine', 'Bar close to body', 'Hip and knee extension together']),

  ('romanian-deadlift', 'hinge-deadlift', 'Romanian Deadlift (RDL)', ARRAY['barbell', 'dumbbells'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Slight knee bend', 'Hinge at hips', 'Feel hamstring stretch']),

  -- Accessory Only
  ('db-rdl', 'hinge-deadlift', 'Dumbbell RDL', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Weights close to legs', 'Push hips back', 'Maintain flat back']),

  ('single-leg-rdl', 'hinge-deadlift', 'Single-Leg RDL', ARRAY['dumbbells', 'kettlebells', 'bodyweight'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Hinge at hip', 'Back leg extends for balance', 'Square hips']),

  ('hip-thrust', 'hinge-hip-thrust', 'Hip Thrust', ARRAY['barbell', 'dumbbells', 'bodyweight'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Shoulders on bench', 'Drive through heels', 'Full hip extension at top']),

  ('glute-bridge', 'hinge-hip-thrust', 'Glute Bridge', ARRAY['bodyweight', 'dumbbells', 'barbell'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Feet hip-width', 'Squeeze glutes at top', 'Do not hyperextend']),

  ('kb-swing', 'hinge-swing', 'Kettlebell Swing', ARRAY['kettlebells'], 'kettlebells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Hip snap, not arm pull', 'Bell to shoulder height', 'Hinge, not squat']);

-- ============================================
-- EXERCISE DEFINITIONS - PRESS ANCHOR
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- Primary Lift Eligible
  ('bench-press-flat', 'press-horizontal', 'Bench Press (Flat)', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Feet flat, back arched', 'Bar to mid-chest', 'Drive through heels']),

  ('bench-press-incline', 'press-horizontal', 'Bench Press (Incline)', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['30-45 degree angle', 'Bar to upper chest', 'Shoulder blades pinched']),

  ('strict-press', 'press-vertical', 'Strict Press', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['No leg drive', 'Bar close to face', 'Full lockout overhead']),

  ('push-press', 'press-vertical', 'Push Press', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Dip and drive', 'Quick hip extension', 'Catch overhead with straight arms']),

  -- Accessory Only
  ('db-bench-press', 'press-horizontal', 'Dumbbell Bench Press', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Weights touch at top', 'Control the descent', 'Full range of motion']),

  ('db-strict-press', 'press-vertical', 'Dumbbell Strict Press', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Core tight', 'Press straight up', 'Full lockout']),

  ('push-ups', 'press-horizontal', 'Push-ups', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory', 'conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Body in straight line', 'Chest to floor', 'Full arm extension']),

  ('dips', 'press-vertical', 'Dips', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Lean forward for chest', 'Upright for triceps', 'Full range of motion']),

  ('lateral-raises', 'press-accessory', 'Lateral Raises', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Slight bend in elbow', 'Lead with pinky', 'Control the negative']),

  ('tricep-extensions', 'press-accessory', 'Tricep Extensions', ARRAY['dumbbells', 'cable_machine'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Elbows fixed', 'Full extension', 'Squeeze at bottom']);

-- ============================================
-- EXERCISE DEFINITIONS - PULL ANCHOR
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- Primary Lift Eligible
  ('barbell-row', 'pull-horizontal', 'Barbell Row (Bent Over)', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Neutral spine, hinged forward', 'Bar to ribcage', 'Squeeze shoulder blades']),

  -- Accessory Only
  ('lat-pulldown', 'pull-vertical', 'Lat Pulldown', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Lean back slightly', 'Pull to upper chest', 'Squeeze lats at bottom']),

  ('pull-ups', 'pull-vertical', 'Pull-ups', ARRAY['bodyweight', 'pullup_bar'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Dead hang start', 'Chin over bar', 'Control the descent']),

  ('cable-rows', 'pull-horizontal', 'Cable Rows', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Chest up', 'Pull to stomach', 'Squeeze shoulder blades']),

  ('three-point-row', 'pull-horizontal', '3-Point Row', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['One hand on bench', 'Row to hip', 'Minimal rotation']),

  ('face-pulls', 'pull-accessory', 'Face Pulls', ARRAY['cable_machine', 'resistance_bands'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Pull to face level', 'External rotation at peak', 'Squeeze rear delts']),

  ('bicep-curls', 'pull-accessory', 'Bicep Curls', ARRAY['dumbbells', 'barbell', 'cable_machine'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Elbows fixed', 'Full range of motion', 'Control the negative']);

-- ============================================
-- EXERCISE DEFINITIONS - POWER ANCHOR
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- Primary Lift Eligible
  ('power-clean', 'power-clean', 'Power Clean', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Triple extension', 'High pull, fast elbows', 'Catch in quarter squat']),

  ('hang-clean', 'power-clean', 'Hang Clean', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Start at hang position', 'Explosive hip drive', 'Fast turnover']),

  ('thruster', 'power-thruster', 'Thruster', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Front squat to press', 'Use leg drive', 'One fluid motion']),

  -- Accessory Only
  ('db-thruster', 'power-thruster', 'Dumbbell Thruster', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Dumbbells at shoulders', 'Full squat depth', 'Press overhead at top']),

  ('db-snatch', 'power-snatch', 'Dumbbell Snatch', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['One arm at a time', 'Hip drive, high pull', 'Catch overhead']),

  ('kb-snatch', 'power-snatch', 'Kettlebell Snatch', ARRAY['kettlebells'], 'kettlebells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Hip snap', 'Punch through at top', 'Soft catch']);

-- ============================================
-- EXERCISE DEFINITIONS - CORE
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  ('plank', 'core-stability', 'Plank', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup']::section_type[], FALSE,
   ARRAY['Straight line from head to heels', 'Engage core', 'Do not sag hips']),

  ('hollow-body-hold', 'core-stability', 'Hollow Body Hold', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup']::section_type[], FALSE,
   ARRAY['Lower back pressed to floor', 'Arms and legs extended', 'No arch in back']),

  ('dead-bugs', 'core-anti-rotation', 'Dead Bugs', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Lower back flat', 'Opposite arm and leg extend', 'Control the movement']),

  ('bird-dogs', 'core-anti-rotation', 'Bird Dogs', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup', 'mobility']::section_type[], FALSE,
   ARRAY['On all fours', 'Extend opposite arm and leg', 'Keep hips level']),

  ('russian-twists', 'core-anti-rotation', 'Russian Twists', ARRAY['bodyweight', 'dumbbells', 'kettlebells'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Lean back slightly', 'Rotate from core', 'Feet off ground for challenge']),

  ('hanging-knee-tucks', 'core-flexion', 'Hanging Knee Tucks', ARRAY['pullup_bar'], 'pullup_bar',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Dead hang start', 'Bring knees to chest', 'Control the descent']);

-- ============================================
-- EXERCISE DEFINITIONS - CONDITIONING
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  ('box-jumps', 'conditioning-plyometric', 'Box Jumps', ARRAY['box'], 'box',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Swing arms for power', 'Land softly', 'Step down to reset']),

  ('squat-jumps', 'conditioning-plyometric', 'Squat Jumps', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Full squat depth', 'Explosive jump', 'Soft landing']),

  ('burpees', 'conditioning-plyometric', 'Burpees', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Chest to floor', 'Explosive jump', 'Full extension at top']),

  ('runners', 'conditioning-locomotion', 'Runners (High Knees)', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Drive knees high', 'Quick turnover', 'Stay on balls of feet']);

-- ============================================
-- EXERCISE DEFINITIONS - WARMUP/MOBILITY
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  ('air-squat', 'squat-bilateral', 'Air Squat', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'conditioning']::section_type[], FALSE,
   ARRAY['Full depth', 'Knees track over toes', 'Arms forward for balance']),

  ('worlds-greatest-stretch', 'conditioning-locomotion', 'World''s Greatest Stretch', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Lunge position', 'Rotate and reach', 'Open up hips and thoracic']);

-- ============================================
-- SET UP PROGRESSIONS/REGRESSIONS
-- ============================================

-- Squat progressions
UPDATE exercise_definitions SET progression = 'goblet-squat' WHERE id = 'air-squat';
UPDATE exercise_definitions SET regression = 'air-squat', progression = 'back-squat' WHERE id = 'goblet-squat';
UPDATE exercise_definitions SET regression = 'goblet-squat' WHERE id = 'back-squat';

-- Hinge progressions
UPDATE exercise_definitions SET progression = 'romanian-deadlift' WHERE id = 'glute-bridge';
UPDATE exercise_definitions SET regression = 'glute-bridge', progression = 'deadlift' WHERE id = 'romanian-deadlift';
UPDATE exercise_definitions SET regression = 'romanian-deadlift' WHERE id = 'deadlift';

-- Pull progressions
UPDATE exercise_definitions SET progression = 'pull-ups' WHERE id = 'lat-pulldown';
UPDATE exercise_definitions SET regression = 'lat-pulldown' WHERE id = 'pull-ups';
