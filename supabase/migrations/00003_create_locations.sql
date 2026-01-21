-- Migration: Create locations table
-- Created: 2026-01-20

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  name TEXT NOT NULL,  -- "Building Gym", "Home", etc.
  tier equipment_tier NOT NULL,
  equipment TEXT[] NOT NULL DEFAULT ARRAY['bodyweight']::TEXT[],  -- Array of equipment IDs

  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_locations_is_default ON locations(user_id, is_default) WHERE is_default = TRUE;

-- Trigger for updated_at
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key from profiles to locations (now that locations exists)
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_default_location
  FOREIGN KEY (default_location_id) REFERENCES locations(id) ON DELETE SET NULL;

-- Function to ensure only one default location per user
CREATE OR REPLACE FUNCTION ensure_single_default_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE locations
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_default_location
  BEFORE INSERT OR UPDATE ON locations
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION ensure_single_default_location();
