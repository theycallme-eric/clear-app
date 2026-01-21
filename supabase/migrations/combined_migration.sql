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
-- Migration: Expand exercise library (Phase 2)
-- Created: 2026-01-21
-- Adds ~55 exercises to bring total to ~100

-- ============================================
-- NEW MOVEMENT PATTERNS
-- ============================================

INSERT INTO movement_patterns (id, name, category, anchor, description) VALUES
  ('squat-machine', 'Machine Squat', 'lower_body', 'squat', 'Machine-based squat movements'),
  ('hinge-extension', 'Back Extension', 'lower_body', 'hinge', 'Spinal extension movements'),
  ('press-isolation', 'Press Isolation', 'upper_body', 'press', 'Single-joint pressing movements'),
  ('pull-isolation', 'Pull Isolation', 'upper_body', 'pull', 'Single-joint pulling movements'),
  ('power-jerk', 'Jerk', 'full_body', 'power', 'Jerk variations'),
  ('core-rotation', 'Core Rotation', 'core', 'surprise', 'Rotational core movements'),
  ('conditioning-carry', 'Loaded Carry', 'full_body', 'surprise', 'Carrying movements'),
  ('mobility-stretch', 'Stretch', 'full_body', 'surprise', 'Static and dynamic stretches')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SQUAT EXERCISES (Missing + New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- From doc (missing)
  ('sumo-squat', 'squat-bilateral', 'Sumo Squat', ARRAY['barbell', 'dumbbells', 'kettlebells'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Wide stance, toes out', 'Knees track over toes', 'Upright torso']),

  ('walking-lunges-oh', 'squat-unilateral', 'Walking Lunges (Overhead)', ARRAY['dumbbells', 'barbell'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Weight locked overhead', 'Core tight', 'Controlled steps']),

  ('goblet-reverse-lunges', 'squat-unilateral', 'Goblet Reverse Lunges', ARRAY['dumbbells', 'kettlebells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Weight at chest', 'Step back with control', 'Front knee stable']),

  ('cossack-squat-weighted', 'squat-unilateral', 'Cossack Squat (Weighted)', ARRAY['dumbbells', 'kettlebells'], 'kettlebells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Side-to-side movement', 'Heel stays down', 'Full depth on working leg']),

  -- New additions
  ('hack-squat', 'squat-machine', 'Hack Squat', ARRAY['hack_squat'], 'hack_squat',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Shoulder pads secure', 'Full depth', 'Control the negative']),

  ('leg-extension', 'squat-machine', 'Leg Extension', ARRAY['leg_curl_extension'], 'leg_curl_extension',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Controlled movement', 'Squeeze at top', 'Do not use momentum']),

  ('sissy-squat', 'squat-bilateral', 'Sissy Squat', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Lean back, knees forward', 'Heels raised', 'Quad isolation']),

  ('pause-squat', 'squat-bilateral', 'Pause Squat', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['2-3 second pause at bottom', 'Stay tight in hole', 'No bounce']),

  ('box-squat', 'squat-bilateral', 'Box Squat', ARRAY['barbell', 'box'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Sit back onto box', 'Pause briefly', 'Explode up']),

  ('split-squat', 'squat-unilateral', 'Split Squat', ARRAY['dumbbells', 'barbell', 'bodyweight'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Static stance', 'Vertical torso', 'Back knee toward floor']),

  ('lateral-lunges', 'squat-unilateral', 'Lateral Lunges', ARRAY['dumbbells', 'bodyweight'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Step wide to side', 'Sit back into hip', 'Push back to start'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- HINGE EXERCISES (Missing + New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- From doc (missing)
  ('single-leg-glute-bridge', 'hinge-hip-thrust', 'Single-Leg Glute Bridge', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory', 'core']::section_type[], FALSE,
   ARRAY['One leg extended', 'Drive through heel', 'Level hips']),

  ('db-swing', 'hinge-swing', 'Dumbbell Swing', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Hip snap, not arm pull', 'Two hands on one dumbbell', 'Hinge pattern']),

  -- New additions
  ('good-morning', 'hinge-deadlift', 'Good Morning', ARRAY['barbell'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Bar on back', 'Hinge at hips', 'Slight knee bend']),

  ('cable-pull-through', 'hinge-hip-thrust', 'Cable Pull-Through', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Face away from cable', 'Hinge and pull through', 'Squeeze glutes at top']),

  ('back-extension', 'hinge-extension', 'Back Extension', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Hinge at hips', 'Neutral spine', 'Squeeze glutes at top']),

  ('reverse-hyper', 'hinge-extension', 'Reverse Hyperextension', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Torso fixed', 'Lift legs with glutes', 'Control the swing']),

  ('leg-curl', 'hinge-deadlift', 'Leg Curl', ARRAY['leg_curl_extension'], 'leg_curl_extension',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Full range of motion', 'Control the negative', 'Squeeze hamstrings']),

  ('nordic-curl', 'hinge-deadlift', 'Nordic Curl', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Control the descent', 'Use hands to push back up', 'Progress slowly']),

  ('trap-bar-deadlift', 'hinge-deadlift', 'Trap Bar Deadlift', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Neutral grip', 'Drive through floor', 'More quad involvement']),

  ('sumo-deadlift', 'hinge-deadlift', 'Sumo Deadlift', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Wide stance', 'Toes out', 'Push knees out'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRESS EXERCISES (Missing + New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- From doc (missing)
  ('bench-press-decline', 'press-horizontal', 'Bench Press (Decline)', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Secure feet', 'Bar to lower chest', 'Control the descent']),

  ('landmine-press', 'press-vertical', 'Landmine Press', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Staggered stance', 'Press at angle', 'Core engaged']),

  ('db-incline-press', 'press-horizontal', 'Dumbbell Incline Press', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['30-45 degree angle', 'Weights touch at top', 'Full stretch at bottom']),

  ('db-push-press', 'press-vertical', 'Dumbbell Push Press', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Dip and drive', 'Use leg power', 'Lock out overhead']),

  ('db-chest-flys', 'press-horizontal', 'Dumbbell Chest Flys', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Slight elbow bend', 'Wide arc motion', 'Squeeze chest at top']),

  ('cable-chest-flys', 'press-horizontal', 'Cable Chest Flys', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Constant tension', 'Hands meet at center', 'Control both directions']),

  ('tricep-cable-pulldowns', 'press-accessory', 'Tricep Cable Pulldowns', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Elbows pinned', 'Full extension', 'Squeeze at bottom']),

  ('frontal-raises', 'press-accessory', 'Frontal Raises', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Lift to shoulder height', 'Control the descent', 'Avoid swinging']),

  ('decline-push-ups', 'press-horizontal', 'Decline Push-ups', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Feet elevated', 'Targets upper chest', 'Full range of motion']),

  ('renegade-push-ups', 'press-horizontal', 'Renegade Push-ups', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Push-up then row', 'Minimize hip rotation', 'Wide stance for stability']),

  -- New additions
  ('close-grip-bench', 'press-horizontal', 'Close-Grip Bench Press', ARRAY['barbell'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Hands shoulder-width', 'Elbows tucked', 'Tricep emphasis']),

  ('arnold-press', 'press-vertical', 'Arnold Press', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Rotate as you press', 'Start palms facing you', 'Full overhead lockout']),

  ('skull-crushers', 'press-isolation', 'Skull Crushers', ARRAY['barbell', 'dumbbells'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Lower to forehead', 'Elbows fixed', 'Extend fully']),

  ('overhead-tricep-extension', 'press-isolation', 'Overhead Tricep Extension', ARRAY['dumbbells', 'cable_machine'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Elbows by ears', 'Full stretch at bottom', 'Squeeze at top']),

  ('incline-db-fly', 'press-horizontal', 'Incline Dumbbell Fly', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Incline bench', 'Wide arc', 'Upper chest focus'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PULL EXERCISES (Missing + New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- From doc (missing)
  ('rear-delt-flys', 'pull-accessory', 'Rear Delt Flys', ARRAY['dumbbells', 'cable_machine'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Bent over position', 'Lead with elbows', 'Squeeze rear delts']),

  ('shrugs', 'pull-accessory', 'Shrugs', ARRAY['dumbbells', 'barbell'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Straight up, not rolling', 'Hold at top', 'Control the negative']),

  ('assisted-pull-ups', 'pull-vertical', 'Assisted Pull-ups', ARRAY['assisted_pullup_dip'], 'assisted_pullup_dip',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Full range of motion', 'Control the movement', 'Progress to less assistance']),

  ('high-pulls', 'pull-vertical', 'High Pulls', ARRAY['kettlebells', 'dumbbells'], 'kettlebells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Explosive hip drive', 'Elbows high', 'Weight close to body']),

  ('curl-to-press', 'pull-accessory', 'Curl to Press', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Curl then press overhead', 'One fluid motion', 'Control both phases']),

  ('external-rotation', 'pull-accessory', 'External Rotation', ARRAY['cable_machine', 'resistance_bands'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Elbow at 90 degrees', 'Rotate outward', 'Rotator cuff health']),

  ('internal-rotation', 'pull-accessory', 'Internal Rotation', ARRAY['cable_machine', 'resistance_bands'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Elbow at 90 degrees', 'Rotate inward', 'Prehab exercise']),

  -- New additions
  ('chin-ups', 'pull-vertical', 'Chin-ups', ARRAY['bodyweight', 'pullup_bar'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Supinated grip', 'Chin over bar', 'More bicep involvement']),

  ('pendlay-row', 'pull-horizontal', 'Pendlay Row', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Bar from floor each rep', 'Explosive pull', 'Torso parallel']),

  ('meadows-row', 'pull-horizontal', 'Meadows Row', ARRAY['barbell'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Landmine setup', 'Staggered stance', 'Pull to hip']),

  ('hammer-curls', 'pull-accessory', 'Hammer Curls', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Neutral grip', 'Targets brachialis', 'No swinging']),

  ('preacher-curls', 'pull-accessory', 'Preacher Curls', ARRAY['dumbbells', 'barbell'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Arms on pad', 'Full extension', 'Isolation movement']),

  ('inverted-rows', 'pull-horizontal', 'Inverted Rows', ARRAY['bodyweight', 'barbell'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Body straight', 'Pull chest to bar', 'Scale with body angle']),

  ('straight-arm-pulldown', 'pull-vertical', 'Straight-Arm Pulldown', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Arms straight throughout', 'Pull to thighs', 'Lat isolation'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POWER EXERCISES (Missing + New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- From doc (missing)
  ('squat-clean', 'power-clean', 'Squat Clean', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Full squat catch', 'Fast elbows', 'Stand up from bottom']),

  ('sotts-press', 'power-thruster', 'Sotts Press', ARRAY['dumbbells', 'kettlebells', 'barbell'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Press from squat bottom', 'Core tight', 'Mobility required']),

  ('landmine-rotation', 'core-rotation', 'Landmine Rotation', ARRAY['barbell'], 'barbell',
   ARRAY['accessory', 'core']::section_type[], FALSE,
   ARRAY['Rotate from hips', 'Arms extended', 'Control the arc']),

  -- New additions
  ('push-jerk', 'power-jerk', 'Push Jerk', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Dip, drive, dip under', 'Catch with soft knees', 'Stand to finish']),

  ('split-jerk', 'power-jerk', 'Split Jerk', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Split stance catch', 'Front shin vertical', 'Recover to standing']),

  ('hang-snatch', 'power-snatch', 'Hang Snatch', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Start at hang', 'Wide grip', 'Catch overhead']),

  ('muscle-clean', 'power-clean', 'Muscle Clean', ARRAY['barbell'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['No dip under', 'Pull and turn over', 'Upper body strength']),

  ('clean-pull', 'power-clean', 'Clean Pull', ARRAY['barbell'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Triple extension', 'Shrug at top', 'No catch']),

  ('snatch-grip-deadlift', 'power-snatch', 'Snatch-Grip Deadlift', ARRAY['barbell'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Wide grip', 'Upper back work', 'Full extension'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CORE EXERCISES (Missing + New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- From doc (missing)
  ('russian-twists', 'core-rotation', 'Russian Twists', ARRAY['bodyweight', 'dumbbells', 'kettlebells'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Lean back slightly', 'Rotate fully each side', 'Feet up for challenge']),

  ('bicycles', 'core-flexion', 'Bicycles', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup', 'conditioning']::section_type[], FALSE,
   ARRAY['Opposite elbow to knee', 'Extend leg fully', 'Controlled pace']),

  ('flutter-kicks', 'core-stability', 'Flutter Kicks', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup', 'conditioning']::section_type[], FALSE,
   ARRAY['Lower back pressed down', 'Small kicks', 'Continuous movement']),

  ('leg-raises', 'core-flexion', 'Leg Raises', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Keep legs straight', 'Lower with control', 'Press lower back down']),

  ('mountain-climbers', 'core-stability', 'Mountain Climbers', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup', 'conditioning']::section_type[], FALSE,
   ARRAY['Plank position', 'Drive knees to chest', 'Keep hips level']),

  ('v-ups', 'core-flexion', 'V-Ups', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Arms and legs meet at top', 'Controlled descent', 'Full body crunch']),

  -- New additions
  ('ab-wheel-rollout', 'core-stability', 'Ab Wheel Rollout', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Extend as far as possible', 'Keep core tight', 'Roll back with control']),

  ('pallof-press', 'core-anti-rotation', 'Pallof Press', ARRAY['cable_machine', 'resistance_bands'], 'cable_machine',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Resist rotation', 'Press straight out', 'Hold at extension']),

  ('side-plank', 'core-stability', 'Side Plank', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Stack feet or stagger', 'Hips up', 'Straight line']),

  ('hanging-leg-raises', 'core-flexion', 'Hanging Leg Raises', ARRAY['pullup_bar'], 'pullup_bar',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Dead hang', 'Straight legs to parallel', 'Control the descent']),

  ('cable-woodchops', 'core-rotation', 'Cable Woodchops', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['High to low or low to high', 'Rotate through core', 'Arms stay extended']),

  ('toes-to-bar', 'core-flexion', 'Toes to Bar', ARRAY['pullup_bar'], 'pullup_bar',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Kip or strict', 'Toes touch bar', 'Control the descent']),

  ('l-sit', 'core-stability', 'L-Sit', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Legs parallel to floor', 'Arms straight', 'Depress shoulders'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CONDITIONING EXERCISES (New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  ('battle-ropes', 'conditioning-plyometric', 'Battle Ropes', ARRAY['battle_ropes'], 'battle_ropes',
   ARRAY['conditioning']::section_type[], FALSE,
   ARRAY['Alternating waves', 'Core engaged', 'Athletic stance']),

  ('rowing-machine', 'conditioning-locomotion', 'Rowing Machine', ARRAY['rowing_machine'], 'rowing_machine',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Legs, back, arms sequence', 'Drive through heels', 'Controlled return']),

  ('assault-bike', 'conditioning-locomotion', 'Assault Bike', ARRAY['assault_bike'], 'assault_bike',
   ARRAY['conditioning']::section_type[], FALSE,
   ARRAY['Full body effort', 'Push and pull arms', 'Pace yourself']),

  ('sled-push', 'conditioning-locomotion', 'Sled Push', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning']::section_type[], FALSE,
   ARRAY['Low body angle', 'Drive through legs', 'Short powerful steps']),

  ('sled-pull', 'conditioning-locomotion', 'Sled Pull', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning']::section_type[], FALSE,
   ARRAY['Hand over hand or backward drag', 'Stay low', 'Continuous tension']),

  ('jump-rope', 'conditioning-plyometric', 'Jump Rope', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Stay on balls of feet', 'Wrists do the work', 'Relaxed shoulders']),

  ('bear-crawl', 'conditioning-locomotion', 'Bear Crawl', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Opposite hand and foot', 'Knees low', 'Core engaged'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- LOADED CARRIES (New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  ('farmers-carry', 'conditioning-carry', 'Farmers Carry', ARRAY['dumbbells', 'kettlebells'], 'dumbbells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Tall posture', 'Shoulders back', 'Controlled steps']),

  ('suitcase-carry', 'conditioning-carry', 'Suitcase Carry', ARRAY['dumbbells', 'kettlebells'], 'dumbbells',
   ARRAY['accessory', 'conditioning', 'core']::section_type[], FALSE,
   ARRAY['One side only', 'Stay vertical', 'Anti-lateral flexion']),

  ('overhead-carry', 'conditioning-carry', 'Overhead Carry', ARRAY['dumbbells', 'kettlebells'], 'kettlebells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Weight locked overhead', 'Core tight', 'Controlled steps']),

  ('rack-carry', 'conditioning-carry', 'Front Rack Carry', ARRAY['kettlebells'], 'kettlebells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Bells in rack position', 'Elbows up', 'Upright posture'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MOBILITY/WARMUP EXERCISES (New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  ('cat-cow', 'mobility-stretch', 'Cat-Cow', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Alternate arch and round', 'Move with breath', 'Full spinal movement']),

  ('pigeon-stretch', 'mobility-stretch', 'Pigeon Stretch', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility', 'cooldown']::section_type[], FALSE,
   ARRAY['Front shin parallel if possible', 'Square hips', 'Breathe into stretch']),

  ('couch-stretch', 'mobility-stretch', 'Couch Stretch', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility', 'cooldown']::section_type[], FALSE,
   ARRAY['Back foot on wall or couch', 'Squeeze glute', 'Hip flexor stretch']),

  ('90-90-stretch', 'mobility-stretch', '90/90 Stretch', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility', 'cooldown']::section_type[], FALSE,
   ARRAY['Both legs at 90 degrees', 'Rotate between sides', 'Hip mobility']),

  ('thoracic-rotations', 'mobility-stretch', 'Thoracic Rotations', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Open up chest', 'Rotate through mid-back', 'Follow hand with eyes']),

  ('leg-swings', 'mobility-stretch', 'Leg Swings', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Forward/back and side/side', 'Controlled swing', 'Hold something for balance']),

  ('arm-circles', 'mobility-stretch', 'Arm Circles', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Small to large circles', 'Both directions', 'Shoulder warm-up']),

  ('hip-circles', 'mobility-stretch', 'Hip Circles', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Standing or all fours', 'Full range of motion', 'Both directions']),

  ('downward-dog', 'mobility-stretch', 'Downward Dog', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility', 'cooldown']::section_type[], FALSE,
   ARRAY['Hips high', 'Heels toward floor', 'Straight arms']),

  ('childs-pose', 'mobility-stretch', 'Child''s Pose', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility', 'cooldown']::section_type[], FALSE,
   ARRAY['Sit back on heels', 'Arms extended or by sides', 'Relax and breathe']),

  ('foam-rolling', 'mobility-stretch', 'Foam Rolling', ARRAY['foam_roller'], 'foam_roller',
   ARRAY['warmup', 'cooldown']::section_type[], FALSE,
   ARRAY['Roll slowly', 'Pause on tight spots', 'Breathe through discomfort']),

  ('banded-pull-aparts', 'mobility-stretch', 'Banded Pull-Aparts', ARRAY['resistance_bands'], 'resistance_bands',
   ARRAY['warmup', 'accessory']::section_type[], FALSE,
   ARRAY['Band at shoulder height', 'Pull apart to chest', 'Squeeze shoulder blades']),

  ('band-dislocates', 'mobility-stretch', 'Band Dislocates', ARRAY['resistance_bands'], 'resistance_bands',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Wide grip on band', 'Rotate overhead and behind', 'Shoulder mobility'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- UPDATE PROGRESSIONS
-- ============================================

-- Squat progressions
UPDATE exercise_definitions SET progression = 'split-squat' WHERE id = 'air-squat';
UPDATE exercise_definitions SET regression = 'air-squat', progression = 'goblet-squat' WHERE id = 'split-squat';

-- Pull-up progressions
UPDATE exercise_definitions SET progression = 'lat-pulldown' WHERE id = 'assisted-pull-ups';
UPDATE exercise_definitions SET regression = 'assisted-pull-ups' WHERE id = 'lat-pulldown';
UPDATE exercise_definitions SET progression = 'chin-ups' WHERE id = 'pull-ups';
UPDATE exercise_definitions SET regression = 'pull-ups' WHERE id = 'chin-ups';

-- Push-up progressions
UPDATE exercise_definitions SET progression = 'decline-push-ups' WHERE id = 'push-ups';
UPDATE exercise_definitions SET regression = 'push-ups' WHERE id = 'decline-push-ups';

-- Core progressions
UPDATE exercise_definitions SET progression = 'hanging-leg-raises' WHERE id = 'leg-raises';
UPDATE exercise_definitions SET regression = 'leg-raises', progression = 'toes-to-bar' WHERE id = 'hanging-leg-raises';
UPDATE exercise_definitions SET regression = 'hanging-leg-raises' WHERE id = 'toes-to-bar';
