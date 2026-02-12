-- Migration: Add indexes to optimize RLS policy performance
-- The nested EXISTS queries in RLS policies can be slow without proper indexes
-- These indexes help speed up the foreign key lookups in RLS checks

-- Index for workout_sections -> workout_sessions lookups
-- Used by RLS policies that check if section belongs to user's session
CREATE INDEX IF NOT EXISTS idx_workout_sections_session_id
  ON workout_sections(session_id);

-- Index for exercises -> workout_sections lookups
-- Used by RLS policies that traverse exercises -> sections -> sessions -> user
CREATE INDEX IF NOT EXISTS idx_exercises_section_id
  ON exercises(section_id);

-- Composite index for common query pattern: user's workouts by date
-- Speeds up history queries and recent workout lookups
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date
  ON workout_sessions(user_id, date DESC);

-- Partial index for incomplete sessions (workouts in progress)
-- Used by the abandonment check and resume functionality
CREATE INDEX IF NOT EXISTS idx_workout_sessions_incomplete
  ON workout_sessions(user_id, created_at DESC)
  WHERE completed_at IS NULL;

-- Index for locations by user (already covered by RLS but helps queries)
CREATE INDEX IF NOT EXISTS idx_locations_user_id
  ON locations(user_id);

-- Analyze tables to update statistics for query planner
ANALYZE workout_sessions;
ANALYZE workout_sections;
ANALYZE exercises;
ANALYZE locations;

-- Add comment explaining the migration
COMMENT ON INDEX idx_workout_sessions_incomplete IS
  'Partial index for finding incomplete workout sessions (completed_at IS NULL).
   Used by resumption logic to find workouts that were abandoned mid-session.';
