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
