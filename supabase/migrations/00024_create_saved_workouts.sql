-- Migration: Create saved_workouts and saved_workout_completions tables
-- Enables the favorites feature: users can save workouts and track progression.

-- ─── saved_workouts ───

CREATE TABLE saved_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  original_session_id UUID REFERENCES workout_sessions(id),
  workout_snapshot JSONB NOT NULL,
  title TEXT NOT NULL,
  anchor TEXT,
  intensity SMALLINT,
  duration_mins SMALLINT,
  times_completed INTEGER DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_workouts_user_id ON saved_workouts(user_id);
CREATE INDEX idx_saved_workouts_original_session ON saved_workouts(original_session_id);
CREATE UNIQUE INDEX uq_saved_workouts_user_session ON saved_workouts(user_id, original_session_id);

CREATE TRIGGER update_saved_workouts_updated_at
  BEFORE UPDATE ON saved_workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE saved_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved workouts"
  ON saved_workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved workouts"
  ON saved_workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved workouts"
  ON saved_workouts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved workouts"
  ON saved_workouts FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON saved_workouts TO authenticated;

-- ─── saved_workout_completions ───

CREATE TABLE saved_workout_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_workout_id UUID NOT NULL REFERENCES saved_workouts(id) ON DELETE CASCADE,
  session_id UUID REFERENCES workout_sessions(id),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_workout_completions_saved_id ON saved_workout_completions(saved_workout_id);

ALTER TABLE saved_workout_completions ENABLE ROW LEVEL SECURITY;

-- RLS: join through saved_workouts to check user_id
CREATE POLICY "Users can view own completion records"
  ON saved_workout_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM saved_workouts
      WHERE saved_workouts.id = saved_workout_completions.saved_workout_id
        AND saved_workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own completion records"
  ON saved_workout_completions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_workouts
      WHERE saved_workouts.id = saved_workout_completions.saved_workout_id
        AND saved_workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own completion records"
  ON saved_workout_completions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM saved_workouts
      WHERE saved_workouts.id = saved_workout_completions.saved_workout_id
        AND saved_workouts.user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, DELETE ON saved_workout_completions TO authenticated;
