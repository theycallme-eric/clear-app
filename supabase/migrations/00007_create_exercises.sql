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
