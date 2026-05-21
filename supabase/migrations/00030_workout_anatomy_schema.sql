-- Migration: Workout Anatomy Spec — Schema Changes
-- Adds component_movements + exercise_role to exercise_definitions,
-- retires 'surprise' anchor, drops 'quick' goal, collapses movement_patterns table.
-- Ref: .claude/inbox/Clear_-_Workout_Anatomy_Spec (1).md

-- ============================================
-- 1. ADD NEW COLUMNS TO exercise_definitions
-- ============================================

-- Component primitives (20-value vocabulary from spec Section 3)
ALTER TABLE exercise_definitions
ADD COLUMN component_movements TEXT[] NOT NULL DEFAULT '{}';

-- Exercise role (7 values from spec Section 4)
ALTER TABLE exercise_definitions
ADD COLUMN exercise_role TEXT NOT NULL DEFAULT 'accessory'
CHECK (exercise_role IN (
  'compound_lift', 'accessory', 'activation',
  'mobility', 'conditioning', 'stability', 'cardio'
));

-- GIN index for component_movements array lookups
CREATE INDEX idx_exercise_definitions_components
ON exercise_definitions USING GIN(component_movements);

-- Index for exercise_role filtering
CREATE INDEX idx_exercise_definitions_role
ON exercise_definitions(exercise_role);

-- ============================================
-- 2. REMAP ENUM VALUES (before enum swap)
-- ============================================

-- Remap surprise → full_body in movement_patterns (source table for exercise_anchors)
UPDATE movement_patterns SET anchor = 'full_body' WHERE anchor = 'surprise';

-- Remap surprise → delete from exercise_anchors (these exercises become anchor-less)
-- Per spec Section 5: exercises tagged surprise get NULL anchor + exercise_role assignment
DELETE FROM exercise_anchors WHERE anchor = 'surprise';

-- Remap in workout_sessions (none exist but safety)
UPDATE workout_sessions SET anchor = 'full_body' WHERE anchor = 'surprise';

-- Remap quick → balanced in profiles and workout_sessions
UPDATE profiles SET goal_preset = 'balanced' WHERE goal_preset = 'quick';
UPDATE workout_sessions SET goal_preset = 'balanced' WHERE goal_preset = 'quick';

-- ============================================
-- 3. DROP DEPENDENT OBJECTS
-- ============================================

DROP VIEW IF EXISTS exercises_with_context;
DROP VIEW IF EXISTS exercise_definitions_with_anchors;

DROP FUNCTION IF EXISTS save_generated_workout(UUID, UUID, DATE, anchor_type, SMALLINT, JSONB, SMALLINT, TEXT, goal_preset);
DROP FUNCTION IF EXISTS complete_onboarding(UUID, TEXT, equipment_tier, TEXT[], experience_level, goal_preset, section_type[], TEXT);
DROP FUNCTION IF EXISTS suggest_anchor(UUID);

-- ============================================
-- 4. SWAP anchor_type ENUM (remove 'surprise')
-- ============================================

CREATE TYPE anchor_type_v2 AS ENUM (
  'squat', 'hinge', 'press', 'pull', 'power',
  'upper_body', 'lower_body', 'full_body'
);

-- Update columns that use anchor_type
ALTER TABLE movement_patterns
  ALTER COLUMN anchor TYPE anchor_type_v2 USING anchor::text::anchor_type_v2;

ALTER TABLE exercise_anchors
  ALTER COLUMN anchor TYPE anchor_type_v2 USING anchor::text::anchor_type_v2;

ALTER TABLE workout_sessions
  ALTER COLUMN anchor TYPE anchor_type_v2 USING anchor::text::anchor_type_v2;

DROP TYPE anchor_type;
ALTER TYPE anchor_type_v2 RENAME TO anchor_type;

-- ============================================
-- 5. SWAP goal_preset ENUM (remove 'quick', add 'hypertrophy' + 'active_recovery')
-- ============================================

CREATE TYPE goal_preset_v2 AS ENUM (
  'strength', 'hypertrophy', 'conditioning', 'balanced', 'active_recovery'
);

ALTER TABLE profiles
  ALTER COLUMN goal_preset TYPE goal_preset_v2 USING goal_preset::text::goal_preset_v2;

ALTER TABLE workout_sessions
  ALTER COLUMN goal_preset TYPE goal_preset_v2 USING goal_preset::text::goal_preset_v2;

DROP TYPE goal_preset;
ALTER TYPE goal_preset_v2 RENAME TO goal_preset;

-- ============================================
-- 6. COLLAPSE movement_patterns TABLE
-- ============================================

-- Drop FK constraint and column from exercise_definitions
ALTER TABLE exercise_definitions DROP CONSTRAINT exercise_definitions_pattern_id_fkey;
ALTER TABLE exercise_definitions DROP COLUMN pattern_id;

-- Drop the index that referenced pattern_id
DROP INDEX IF EXISTS idx_exercise_definitions_pattern;

-- Drop the movement_patterns table
DROP TABLE movement_patterns;

-- ============================================
-- 7. RECREATE VIEWS
-- ============================================

-- exercise_definitions_with_anchors — now includes component_movements and exercise_role
CREATE VIEW exercise_definitions_with_anchors AS
SELECT
  ed.*,
  COALESCE(
    ARRAY_AGG(DISTINCT ea.anchor) FILTER (WHERE ea.anchor IS NOT NULL),
    '{}'::anchor_type[]
  ) AS anchors,
  (
    SELECT ea2.anchor
    FROM exercise_anchors ea2
    WHERE ea2.exercise_id = ed.id AND ea2.is_primary = true
    LIMIT 1
  ) AS primary_anchor,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object('muscle', emg.muscle_group, 'role', emg.role)
      )
      FROM exercise_muscle_groups emg
      WHERE emg.exercise_id = ed.id
    ),
    '[]'::jsonb
  ) AS muscle_groups
FROM exercise_definitions ed
LEFT JOIN exercise_anchors ea ON ea.exercise_id = ed.id
GROUP BY ed.id;

-- exercises_with_context — rebuilt WITHOUT movement_patterns join
-- Gets anchor from exercise_anchors instead
CREATE VIEW exercises_with_context AS
SELECT
  e.*,
  ed.name AS exercise_name,
  (SELECT ea.anchor FROM exercise_anchors ea WHERE ea.exercise_id = ed.id AND ea.is_primary = true LIMIT 1) AS anchor,
  ws.section_type,
  wsess.user_id,
  wsess.date AS workout_date,
  wsess.intensity AS workout_intensity
FROM exercises e
JOIN exercise_definitions ed ON e.exercise_id = ed.id
JOIN workout_sections ws ON e.section_id = ws.id
JOIN workout_sessions wsess ON ws.session_id = wsess.id;

-- ============================================
-- 8. RECREATE FUNCTIONS
-- ============================================

-- save_generated_workout (same body as migration 00025, updated enum types)
CREATE OR REPLACE FUNCTION save_generated_workout(
  p_user_id UUID,
  p_location_id UUID,
  p_date DATE,
  p_anchor anchor_type,
  p_intensity SMALLINT,
  p_sections JSONB,
  p_time_target_mins SMALLINT DEFAULT NULL,
  p_prompt_version TEXT DEFAULT NULL,
  p_goal_preset goal_preset DEFAULT 'balanced'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  v_section JSONB;
  v_section_id UUID;
  v_exercise JSONB;
  v_exercise_id UUID;
  v_section_idx INTEGER := 0;
  v_exercise_idx INTEGER;
  v_sections_out JSONB := '[]'::JSONB;
  v_exercises_out JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  INSERT INTO workout_sessions (
    user_id, location_id, date, anchor, intensity, goal_preset,
    time_target_mins, prompt_version, is_rest_day, counts_for_streak
  ) VALUES (
    p_user_id, p_location_id, p_date, p_anchor, p_intensity, p_goal_preset,
    p_time_target_mins, p_prompt_version, FALSE, FALSE
  )
  RETURNING id INTO v_session_id;

  FOR v_section IN SELECT * FROM jsonb_array_elements(p_sections)
  LOOP
    INSERT INTO workout_sections (
      session_id, section_type, order_index, section_notes
    ) VALUES (
      v_session_id,
      (v_section->>'section_type')::section_type,
      v_section_idx,
      v_section->>'section_notes'
    )
    RETURNING id INTO v_section_id;

    v_exercise_idx := 0;
    v_exercises_out := '[]'::JSONB;

    FOR v_exercise IN SELECT * FROM jsonb_array_elements(v_section->'exercises')
    LOOP
      INSERT INTO exercises (
        section_id, exercise_id, equipment_used, sets, reps,
        effort_percent, tempo, rest_seconds, coaching_cues, order_index,
        structure
      ) VALUES (
        v_section_id,
        v_exercise->>'exercise_id',
        COALESCE(v_exercise->>'equipment_used', 'bodyweight'),
        (v_exercise->>'sets')::SMALLINT,
        COALESCE(v_exercise->>'reps', '1'),
        (v_exercise->>'effort_percent')::SMALLINT,
        v_exercise->>'tempo',
        (v_exercise->>'rest_seconds')::SMALLINT,
        v_exercise->>'coaching_cues',
        v_exercise_idx,
        v_exercise->'structure'
      )
      RETURNING id INTO v_exercise_id;

      v_exercises_out := v_exercises_out || jsonb_build_object(
        'id', v_exercise_id,
        'order_index', v_exercise_idx
      );
      v_exercise_idx := v_exercise_idx + 1;
    END LOOP;

    v_sections_out := v_sections_out || jsonb_build_object(
      'id', v_section_id,
      'order_index', v_section_idx,
      'exercises', v_exercises_out
    );
    v_section_idx := v_section_idx + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'sections', v_sections_out
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to save workout: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

GRANT EXECUTE ON FUNCTION save_generated_workout TO authenticated;

-- complete_onboarding (same body as migration 00017, updated enum types)
CREATE OR REPLACE FUNCTION complete_onboarding(
  p_user_id UUID,
  p_location_name TEXT,
  p_location_tier equipment_tier,
  p_equipment TEXT[],
  p_experience_level experience_level,
  p_goal_preset goal_preset,
  p_sections section_type[],
  p_limitations TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_location_id UUID;
BEGIN
  INSERT INTO locations (user_id, name, tier, equipment, is_default)
  VALUES (p_user_id, p_location_name, p_location_tier, p_equipment, true)
  ON CONFLICT (user_id, name) DO UPDATE SET
    tier = EXCLUDED.tier,
    equipment = EXCLUDED.equipment,
    is_default = true,
    updated_at = NOW()
  RETURNING id INTO v_location_id;

  UPDATE profiles SET
    onboarding_completed = true,
    experience_level = p_experience_level,
    goal_preset = p_goal_preset,
    enabled_sections = p_sections,
    limitations = p_limitations,
    default_location_id = v_location_id,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN v_location_id;
END;
$$;

GRANT EXECUTE ON FUNCTION complete_onboarding TO authenticated;

-- suggest_anchor (same body as migration 00027, just needs fresh enum reference)
CREATE OR REPLACE FUNCTION suggest_anchor(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH recent_sessions AS (
    SELECT ws.id AS session_id, ws.date
    FROM workout_sessions ws
    WHERE ws.user_id = p_user_id
      AND ws.status = 'completed'
      AND ws.date >= (CURRENT_DATE - INTERVAL '7 days')
  ),
  exercise_muscles AS (
    SELECT
      emg.muscle_group,
      emg.role,
      rs.date
    FROM recent_sessions rs
    JOIN workout_sections wsec ON wsec.session_id = rs.session_id
    JOIN exercises ex ON ex.section_id = wsec.id
    JOIN exercise_muscle_groups emg ON emg.exercise_id = ex.id
  ),
  region_mapping AS (
    SELECT
      muscle_group,
      role,
      date,
      CASE
        WHEN muscle_group IN ('quads', 'hamstrings', 'glutes', 'calves', 'hip_flexors') THEN 'lower'
        WHEN muscle_group IN ('pecs', 'front_delts', 'side_delts', 'triceps') THEN 'upper_push'
        WHEN muscle_group IN ('lats', 'rhomboids', 'rear_delts', 'biceps', 'traps') THEN 'upper_pull'
        WHEN muscle_group IN ('abs', 'obliques', 'erectors') THEN 'core'
        ELSE 'other'
      END AS region
    FROM exercise_muscles
  ),
  region_scores AS (
    SELECT
      region,
      COUNT(*) FILTER (WHERE role = 'primary') AS primary_hits,
      COUNT(*) FILTER (WHERE role = 'synergist') AS synergist_hits,
      MAX(date) AS last_hit,
      EXTRACT(DAY FROM (CURRENT_DATE - MAX(date))) AS days_since
    FROM region_mapping
    WHERE region != 'other'
    GROUP BY region
  ),
  all_regions AS (
    SELECT region FROM (VALUES ('lower'), ('upper_push'), ('upper_pull'), ('core')) AS r(region)
  ),
  scored AS (
    SELECT
      ar.region,
      COALESCE(rs.primary_hits, 0) AS primary_hits,
      COALESCE(rs.synergist_hits, 0) AS synergist_hits,
      rs.last_hit,
      COALESCE(rs.days_since, 8) AS days_since,
      (COALESCE(rs.days_since, 8) * 10) - (COALESCE(rs.primary_hits, 0) * 3) AS score
    FROM all_regions ar
    LEFT JOIN region_scores rs ON rs.region = ar.region
  ),
  best AS (
    SELECT * FROM scored ORDER BY score DESC LIMIT 1
  )
  SELECT json_build_object(
    'suggested_anchor',
    CASE best.region
      WHEN 'lower' THEN 'LOWER BODY'
      WHEN 'upper_push' THEN 'UPPER BODY'
      WHEN 'upper_pull' THEN 'UPPER BODY'
      WHEN 'core' THEN 'FULL BODY'
      ELSE 'FULL BODY'
    END,
    'reason',
    CASE
      WHEN best.days_since >= 8 OR best.last_hit IS NULL THEN
        CASE best.region
          WHEN 'lower' THEN 'Lower body — not trained this week'
          WHEN 'upper_push' THEN 'Upper body (push) — not trained this week'
          WHEN 'upper_pull' THEN 'Upper body (pull) — not trained this week'
          WHEN 'core' THEN 'Core — not trained this week'
          ELSE 'Full body — no recent data'
        END
      ELSE
        CASE best.region
          WHEN 'lower' THEN 'Lower body — last trained ' || best.days_since || ' days ago'
          WHEN 'upper_push' THEN 'Upper body (push) — last trained ' || best.days_since || ' days ago'
          WHEN 'upper_pull' THEN 'Upper body (pull) — last trained ' || best.days_since || ' days ago'
          WHEN 'core' THEN 'Core — last trained ' || best.days_since || ' days ago'
          ELSE 'Full body — last trained ' || best.days_since || ' days ago'
        END
    END,
    'coverage',
    (SELECT json_agg(json_build_object(
      'region', s.region,
      'primary_hits', s.primary_hits,
      'synergist_hits', s.synergist_hits,
      'days_since', s.days_since
    )) FROM scored s)
  ) INTO result
  FROM best;

  IF result IS NULL THEN
    result := json_build_object(
      'suggested_anchor', 'FULL BODY',
      'reason', 'No recent workout data — starting with full body',
      'coverage', '[]'::json
    );
  END IF;

  RETURN result;
END;
$$;
