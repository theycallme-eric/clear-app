-- RPC: suggest_anchor
-- Returns a recommended focus area based on muscle group coverage from the last 7 days.
-- Groups muscle groups by body region, scores by staleness and underwork,
-- and maps the most underworked region to an AnchorType.

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
      AND ws.completed_at IS NOT NULL
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
    JOIN exercise_muscle_groups emg ON emg.exercise_id = ex.exercise_id
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
  -- Include regions with zero hits
  all_regions AS (
    SELECT region FROM (VALUES ('lower'), ('upper_push'), ('upper_pull'), ('core')) AS r(region)
  ),
  scored AS (
    SELECT
      ar.region,
      COALESCE(rs.primary_hits, 0) AS primary_hits,
      COALESCE(rs.synergist_hits, 0) AS synergist_hits,
      rs.last_hit,
      COALESCE(rs.days_since, 8) AS days_since, -- never hit = 8 days (max staleness)
      -- Score: higher = more underworked. Weight staleness heavily.
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

  -- If no data at all (new user, no sessions), return FULL BODY default
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
