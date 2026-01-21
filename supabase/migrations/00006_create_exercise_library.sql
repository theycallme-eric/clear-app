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
