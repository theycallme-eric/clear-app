-- Migration: Create custom enum types for Clear app
-- Created: 2026-01-20

-- Experience level (onboarding)
CREATE TYPE experience_level AS ENUM ('new', 'some', 'confident');

-- Goal presets
CREATE TYPE goal_preset AS ENUM ('strength', 'balanced', 'conditioning', 'quick');

-- Equipment tiers
CREATE TYPE equipment_tier AS ENUM ('minimal', 'home', 'building', 'full');

-- Anchor types (workout focus)
-- Note: 'power' replaces former 'rotation' anchor
CREATE TYPE anchor_type AS ENUM (
  'squat',
  'hinge',
  'press',
  'pull',
  'power',
  'surprise',
  'upper_body',
  'lower_body',
  'full_body'
);

-- Section types (workout structure)
CREATE TYPE section_type AS ENUM (
  'warmup',
  'mobility',
  'primary_lift',
  'accessory',
  'skill_power',
  'carries',
  'core',
  'stability_balance',
  'conditioning',
  'cooldown'
);

-- Streak status
CREATE TYPE streak_status AS ENUM ('active', 'paused');

-- Streak pause reasons
CREATE TYPE streak_pause_reason AS ENUM ('injury', 'sick', 'vacation');

-- Rest day reasons
CREATE TYPE rest_day_reason AS ENUM ('rest', 'injury', 'sick');

-- Movement pattern categories (for exercise library)
CREATE TYPE movement_category AS ENUM ('lower_body', 'upper_body', 'core', 'full_body');
