-- Create table for tracking results of timed/scored sections
CREATE TABLE structure_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES workout_sections(id) ON DELETE CASCADE,
  structure_type TEXT NOT NULL,
  
  -- Time tracking
  completion_time_seconds INTEGER,
  completed_under_cap BOOLEAN,
  
  -- Round tracking
  rounds_completed INTEGER,
  
  -- Rep scheme tracking
  rep_scheme TEXT,
  highest_rung INTEGER,
  
  -- Meta
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by section
CREATE INDEX idx_structure_results_section_id ON structure_results(section_id);

-- Index for querying by structure type (for analytics)
CREATE INDEX idx_structure_results_type ON structure_results(structure_type);

-- RLS Policies
ALTER TABLE structure_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own structure results"
  ON structure_results FOR SELECT
  USING (
    section_id IN (
      SELECT ws.id FROM workout_sections ws
      JOIN workout_sessions wses ON ws.session_id = wses.id
      WHERE wses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own structure results"
  ON structure_results FOR INSERT
  WITH CHECK (
    section_id IN (
      SELECT ws.id FROM workout_sections ws
      JOIN workout_sessions wses ON ws.session_id = wses.id
      WHERE wses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own structure results"
  ON structure_results FOR UPDATE
  USING (
    section_id IN (
      SELECT ws.id FROM workout_sections ws
      JOIN workout_sessions wses ON ws.session_id = wses.id
      WHERE wses.user_id = auth.uid()
    )
  );
