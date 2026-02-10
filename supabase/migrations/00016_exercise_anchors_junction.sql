-- Migration: Add exercise_anchors junction table for many-to-many relationship
-- This allows exercises to belong to multiple anchors (e.g., deadlift → hinge AND pull)

-- ============================================
-- CREATE JUNCTION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.exercise_anchors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id TEXT NOT NULL REFERENCES exercise_definitions(id) ON DELETE CASCADE,
    anchor anchor_type NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE, -- TRUE = this is the exercise's main anchor
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate exercise-anchor pairs
    UNIQUE(exercise_id, anchor)
);

-- Index for fast lookups by anchor
CREATE INDEX idx_exercise_anchors_anchor ON exercise_anchors(anchor);
CREATE INDEX idx_exercise_anchors_exercise ON exercise_anchors(exercise_id);

-- ============================================
-- POPULATE FROM EXISTING PATTERN RELATIONSHIPS
-- ============================================

-- Insert primary anchors from existing movement_patterns relationship
INSERT INTO exercise_anchors (exercise_id, anchor, is_primary)
SELECT
    ed.id,
    mp.anchor,
    TRUE
FROM exercise_definitions ed
JOIN movement_patterns mp ON ed.pattern_id = mp.id
ON CONFLICT (exercise_id, anchor) DO NOTHING;

-- ============================================
-- ADD SECONDARY ANCHOR MAPPINGS
-- Only inserts for exercises that actually exist
-- ============================================

-- Create temp table with desired secondary mappings
CREATE TEMP TABLE secondary_anchors_temp (exercise_id TEXT, anchor anchor_type);

INSERT INTO secondary_anchors_temp (exercise_id, anchor) VALUES
    -- Deadlift variations → also PULL (they heavily involve lats, upper back, grip)
    ('deadlift', 'pull'),
    ('romanian-deadlift', 'pull'),
    ('db-rdl', 'pull'),
    ('single-leg-rdl', 'pull'),
    -- Kettlebell Swing → also POWER (explosive hip drive)
    ('kb-swing', 'power'),
    -- Push Press → also POWER (uses leg drive for explosiveness)
    ('push-press', 'power'),
    -- Thrusters → also SQUAT and PRESS (it's a squat-to-press combo)
    ('thruster', 'squat'),
    ('thruster', 'press'),
    ('db-thruster', 'squat'),
    ('db-thruster', 'press'),
    -- Box Jumps and Squat Jumps → also POWER
    ('box-jumps', 'power'),
    ('squat-jumps', 'power'),
    -- Burpees → also POWER
    ('burpees', 'power');

-- Insert only those that have matching exercise_definitions
INSERT INTO exercise_anchors (exercise_id, anchor, is_primary)
SELECT sat.exercise_id, sat.anchor, FALSE
FROM secondary_anchors_temp sat
WHERE EXISTS (SELECT 1 FROM exercise_definitions ed WHERE ed.id = sat.exercise_id)
ON CONFLICT (exercise_id, anchor) DO NOTHING;

DROP TABLE secondary_anchors_temp;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE exercise_anchors ENABLE ROW LEVEL SECURITY;

-- Everyone can read exercise anchors (it's reference data)
CREATE POLICY "Exercise anchors are viewable by everyone"
    ON exercise_anchors FOR SELECT
    USING (true);

-- ============================================
-- HELPER VIEW FOR EASY QUERYING
-- ============================================

CREATE OR REPLACE VIEW exercise_definitions_with_anchors AS
SELECT
    ed.*,
    ARRAY_AGG(ea.anchor ORDER BY ea.is_primary DESC) AS anchors,
    (SELECT ea2.anchor FROM exercise_anchors ea2 WHERE ea2.exercise_id = ed.id AND ea2.is_primary = TRUE LIMIT 1) AS primary_anchor
FROM exercise_definitions ed
LEFT JOIN exercise_anchors ea ON ed.id = ea.exercise_id
GROUP BY ed.id;
