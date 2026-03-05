-- Migration: Drop unique constraint on (session_id, section_type)
-- A workout can legitimately have multiple sections of the same type
-- (e.g., two accessory blocks). The prompt guides Claude on section balance.

DROP INDEX IF EXISTS idx_workout_sections_unique_type;
