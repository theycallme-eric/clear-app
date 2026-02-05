-- Migration: Allow multiple workouts per day
-- The unique date constraint was too restrictive - users should be able to:
-- - Generate multiple workouts per day
-- - Do morning and evening sessions
-- - Regenerate if they don't like the first workout

-- Drop the unique constraint on (user_id, date)
DROP INDEX IF EXISTS idx_workout_sessions_unique_date;

-- Keep a regular index for query performance (fetching workouts by date)
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date
ON public.workout_sessions(user_id, date);
