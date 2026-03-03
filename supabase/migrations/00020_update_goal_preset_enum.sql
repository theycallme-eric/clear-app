-- Migration: Update goal_preset enum for v3 goal-based generation
-- Adds: hypertrophy, active_recovery
-- 'quick' remains in enum for backward compat but is removed from UI

ALTER TYPE goal_preset ADD VALUE IF NOT EXISTS 'hypertrophy';
ALTER TYPE goal_preset ADD VALUE IF NOT EXISTS 'active_recovery';
