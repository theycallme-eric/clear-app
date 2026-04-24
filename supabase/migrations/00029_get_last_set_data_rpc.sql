-- RPC: get_last_set_data
-- Returns per-exercise set history from the most recent completed session
-- for each given exercise_definition_id. Falls back to legacy weight_logged
-- for pre-migration data.

CREATE OR REPLACE FUNCTION get_last_set_data(
  p_user_id UUID,
  p_exercise_definition_ids TEXT[]
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH latest_exercises AS (
    -- Find the most recent exercise row for each definition_id
    SELECT DISTINCT ON (e.exercise_id)
      e.id AS exercise_row_id,
      e.exercise_id AS definition_id,
      e.weight_logged,
      s.completed_at
    FROM exercises e
    JOIN workout_sections ws ON ws.id = e.section_id
    JOIN workout_sessions s ON s.id = ws.session_id
    WHERE s.user_id = p_user_id
      AND s.completed_at IS NOT NULL
      AND e.exercise_id = ANY(p_exercise_definition_ids)
    ORDER BY e.exercise_id, s.completed_at DESC
  ),
  set_data AS (
    -- Get set logs for those exercise rows
    SELECT
      le.definition_id,
      json_agg(
        json_build_object(
          'setNumber', esl.set_number,
          'weight', esl.weight,
          'weightUnit', esl.weight_unit,
          'reps', esl.reps,
          'rpe', esl.rpe
        ) ORDER BY esl.set_number
      ) AS sets
    FROM latest_exercises le
    JOIN exercise_set_logs esl ON esl.exercise_row_id = le.exercise_row_id
    GROUP BY le.definition_id
  ),
  legacy_data AS (
    -- Fallback: exercises without set logs use weight_logged
    SELECT
      le.definition_id,
      le.weight_logged
    FROM latest_exercises le
    LEFT JOIN exercise_set_logs esl ON esl.exercise_row_id = le.exercise_row_id
    WHERE esl.id IS NULL
      AND le.weight_logged IS NOT NULL
  )
  SELECT json_build_object(
    'setData', COALESCE(
      (SELECT json_object_agg(definition_id, sets) FROM set_data),
      '{}'::json
    ),
    'legacyData', COALESCE(
      (SELECT json_object_agg(definition_id, weight_logged) FROM legacy_data),
      '{}'::json
    )
  ) INTO result;

  RETURN result;
END;
$$;
