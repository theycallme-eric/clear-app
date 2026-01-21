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
