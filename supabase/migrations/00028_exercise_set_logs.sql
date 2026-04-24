-- Exercise Set Logs: per-set weight/reps tracking
-- Enables set-by-set logging (e.g., 135x10, 155x8, 175x6, 185x4)

CREATE TABLE exercise_set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_row_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number SMALLINT NOT NULL,
  weight NUMERIC,
  weight_unit TEXT DEFAULT 'lbs' CHECK (weight_unit IN ('lbs', 'kg')),
  reps SMALLINT,
  rpe NUMERIC CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10)),
  is_warmup_set BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(exercise_row_id, set_number)
);

CREATE INDEX idx_exercise_set_logs_exercise ON exercise_set_logs(exercise_row_id);

ALTER TABLE exercise_set_logs ENABLE ROW LEVEL SECURITY;

-- RLS: users can only access set logs for their own exercises
-- Join chain: exercise_set_logs → exercises → workout_sections → workout_sessions → user_id

CREATE POLICY "Users can view their own set logs"
  ON exercise_set_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN workout_sections ws ON ws.id = e.section_id
      JOIN workout_sessions s ON s.id = ws.session_id
      WHERE e.id = exercise_set_logs.exercise_row_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own set logs"
  ON exercise_set_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN workout_sections ws ON ws.id = e.section_id
      JOIN workout_sessions s ON s.id = ws.session_id
      WHERE e.id = exercise_set_logs.exercise_row_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own set logs"
  ON exercise_set_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN workout_sections ws ON ws.id = e.section_id
      JOIN workout_sessions s ON s.id = ws.session_id
      WHERE e.id = exercise_set_logs.exercise_row_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own set logs"
  ON exercise_set_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN workout_sections ws ON ws.id = e.section_id
      JOIN workout_sessions s ON s.id = ws.session_id
      WHERE e.id = exercise_set_logs.exercise_row_id
        AND s.user_id = auth.uid()
    )
  );
