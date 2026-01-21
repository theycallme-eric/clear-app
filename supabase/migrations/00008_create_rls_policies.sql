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
