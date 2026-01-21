-- Migration: Create profiles table (extends Supabase auth.users)
-- Created: 2026-01-20

CREATE TABLE profiles (
  -- Primary key references Supabase auth
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Onboarding data
  experience_level experience_level,
  goal_preset goal_preset,
  limitations TEXT,  -- Free text, parsed by LLM
  enabled_sections section_type[] DEFAULT ARRAY[
    'warmup',
    'primary_lift',
    'accessory',
    'core',
    'conditioning',
    'cooldown'
  ]::section_type[],

  -- Streak tracking
  streak_count INTEGER NOT NULL DEFAULT 0,
  streak_start_date DATE,
  streak_status streak_status NOT NULL DEFAULT 'active',
  streak_pause_reason streak_pause_reason,
  streak_pause_start DATE,
  consecutive_rest_days INTEGER NOT NULL DEFAULT 0,

  -- App state
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  default_location_id UUID  -- FK added after locations table created
);

-- Index for quick profile lookups
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
