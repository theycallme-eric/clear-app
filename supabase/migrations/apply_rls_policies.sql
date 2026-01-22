-- Apply RLS Policies (idempotent - safe to run multiple times)
-- Run this in the Supabase SQL Editor

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_definitions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own locations" ON locations;
DROP POLICY IF EXISTS "Users can create own locations" ON locations;
DROP POLICY IF EXISTS "Users can update own locations" ON locations;
DROP POLICY IF EXISTS "Users can delete own locations" ON locations;

DROP POLICY IF EXISTS "Users can view own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON workout_sessions;

DROP POLICY IF EXISTS "Users can view own sections" ON workout_sections;
DROP POLICY IF EXISTS "Users can create own sections" ON workout_sections;
DROP POLICY IF EXISTS "Users can update own sections" ON workout_sections;
DROP POLICY IF EXISTS "Users can delete own sections" ON workout_sections;

DROP POLICY IF EXISTS "Users can view own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can create own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;

DROP POLICY IF EXISTS "Authenticated users can view movement patterns" ON movement_patterns;
DROP POLICY IF EXISTS "Authenticated users can view exercise definitions" ON exercise_definitions;

-- ============================================
-- PROFILES POLICIES
-- ============================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- LOCATIONS POLICIES
-- ============================================

CREATE POLICY "Users can view own locations"
  ON locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own locations"
  ON locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own locations"
  ON locations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own locations"
  ON locations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- WORKOUT_SESSIONS POLICIES
-- ============================================

CREATE POLICY "Users can view own sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- WORKOUT_SECTIONS POLICIES
-- ============================================

CREATE POLICY "Users can view own sections"
  ON workout_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_sections.session_id
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own sections"
  ON workout_sections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = workout_sections.session_id
      AND ws.user_id = auth.uid()
    )
  );

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
-- EXERCISE LIBRARY POLICIES (Read-only)
-- ============================================

CREATE POLICY "Authenticated users can view movement patterns"
  ON movement_patterns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view exercise definitions"
  ON exercise_definitions FOR SELECT
  TO authenticated
  USING (true);

-- Done!
SELECT 'RLS policies applied successfully!' as status;
