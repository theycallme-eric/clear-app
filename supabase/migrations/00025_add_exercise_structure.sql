-- Migration: Add structure JSONB to exercises table and update RPC
-- Stores the exercise structure (EMOM/AMRAP/For Time/Superset/Circuit) so it
-- survives round-trips through the DB and can be restored on repeat workouts.

-- ─── Add column ───

ALTER TABLE exercises ADD COLUMN structure JSONB;

COMMENT ON COLUMN exercises.structure IS
  'Exercise structure metadata (type, group_id, minutes, time_cap_mins, etc.). '
  'Null for standard exercises. Examples: '
  '{"type":"emom","minutes":8,"group_id":"emom-1"}, '
  '{"type":"amrap","minutes":10,"group_id":"amrap-1"}, '
  '{"type":"for_time","time_cap_mins":12,"group_id":"ft-1"}, '
  '{"type":"superset","paired_with":"barbell-curl","group_id":"ss-1"}';

-- ─── Update RPC to store structure ───

DROP FUNCTION IF EXISTS save_generated_workout(UUID, UUID, DATE, anchor_type, SMALLINT, JSONB, SMALLINT, TEXT, goal_preset);

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

COMMENT ON FUNCTION save_generated_workout IS
  'Atomically saves a generated workout and returns the session ID plus all
   section/exercise UUIDs, so the frontend can map logged data directly to DB rows.';
