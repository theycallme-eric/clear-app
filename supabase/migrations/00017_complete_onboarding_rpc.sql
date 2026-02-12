-- Migration: Create atomic complete_onboarding RPC function
-- This function handles location creation and profile update in a single transaction
-- to prevent race conditions between onAuthStateChange and completeOnboarding

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
  -- Step 1: Upsert location (creates or updates based on user_id + name)
  INSERT INTO locations (user_id, name, tier, equipment, is_default)
  VALUES (p_user_id, p_location_name, p_location_tier, p_equipment, true)
  ON CONFLICT (user_id, name) DO UPDATE SET
    tier = EXCLUDED.tier,
    equipment = EXCLUDED.equipment,
    is_default = true,
    updated_at = NOW()
  RETURNING id INTO v_location_id;

  -- Step 2: Update profile atomically in same transaction
  UPDATE profiles SET
    onboarding_completed = true,
    experience_level = p_experience_level,
    goal_preset = p_goal_preset,
    enabled_sections = p_sections,
    limitations = p_limitations,
    default_location_id = v_location_id,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Return location ID so client can update local state
  RETURN v_location_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION complete_onboarding TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION complete_onboarding IS
  'Atomically completes user onboarding by creating/updating location and marking profile as onboarded.
   This prevents race conditions where TOKEN_REFRESHED could read stale profile data between
   the location insert and profile update.';
