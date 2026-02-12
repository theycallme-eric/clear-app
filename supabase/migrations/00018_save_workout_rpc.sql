-- Migration: Create atomic save_generated_workout RPC function
-- This function handles workout session, sections, and exercises creation in a single transaction
-- to prevent partial saves where some sections/exercises succeed and others fail

CREATE OR REPLACE FUNCTION save_generated_workout(
  p_user_id UUID,
  p_location_id UUID,
  p_date DATE,
  p_anchor anchor_type,
  p_intensity SMALLINT,
  p_sections JSONB,  -- Array of {section_type, order_index, section_notes, exercises: [...]}
  p_time_target_mins SMALLINT DEFAULT NULL,
  p_prompt_version TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  v_section JSONB;
  v_section_id UUID;
  v_exercise JSONB;
  v_section_idx INTEGER := 0;
  v_exercise_idx INTEGER;
BEGIN
  -- Verify user exists and matches
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  -- Step 1: Create workout session
  INSERT INTO workout_sessions (
    user_id,
    location_id,
    date,
    anchor,
    intensity,
    time_target_mins,
    prompt_version,
    is_rest_day,
    counts_for_streak
  ) VALUES (
    p_user_id,
    p_location_id,
    p_date,
    p_anchor,
    p_intensity,
    p_time_target_mins,
    p_prompt_version,
    FALSE,
    FALSE  -- Will be set to TRUE when workout is completed with >= 5 min duration
  )
  RETURNING id INTO v_session_id;

  -- Step 2: Create sections and exercises
  FOR v_section IN SELECT * FROM jsonb_array_elements(p_sections)
  LOOP
    -- Create workout section
    INSERT INTO workout_sections (
      session_id,
      section_type,
      order_index,
      section_notes
    ) VALUES (
      v_session_id,
      (v_section->>'section_type')::section_type,
      v_section_idx,
      v_section->>'section_notes'
    )
    RETURNING id INTO v_section_id;

    -- Create exercises for this section
    v_exercise_idx := 0;
    FOR v_exercise IN SELECT * FROM jsonb_array_elements(v_section->'exercises')
    LOOP
      INSERT INTO exercises (
        section_id,
        exercise_id,
        equipment_used,
        sets,
        reps,
        effort_percent,
        tempo,
        rest_seconds,
        coaching_cues,
        order_index
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
        v_exercise_idx
      );
      v_exercise_idx := v_exercise_idx + 1;
    END LOOP;

    v_section_idx := v_section_idx + 1;
  END LOOP;

  -- Return session ID so client can track the workout
  RETURN v_session_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Transaction automatically rolls back on any error
    -- Re-raise with context for debugging
    RAISE EXCEPTION 'Failed to save workout: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION save_generated_workout TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION save_generated_workout IS
  'Atomically saves a generated workout with all sections and exercises in a single transaction.
   This prevents partial saves where the session is created but some sections/exercises fail,
   leaving orphaned data in the database. If any part fails, the entire operation rolls back.';
