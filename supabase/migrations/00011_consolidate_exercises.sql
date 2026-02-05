-- Migration: Consolidate exercise definitions with equipment display names
-- Created: February 2026
-- Purpose: Equipment becomes a modifier for exercises, not a separate entry
-- CORRECTED v2: Insert new → Update FKs → Delete old (avoids FK conflicts)

-- ============================================
-- SCHEMA CHANGE
-- ============================================

ALTER TABLE exercise_definitions
ADD COLUMN IF NOT EXISTS equipment_display_names JSONB;

-- ============================================
-- CONSOLIDATE: bench-press
-- Merge bench-press-flat + db-bench-press → bench-press
-- ============================================

-- 1. Create new consolidated entry
INSERT INTO exercise_definitions (
  id, pattern_id, name, equipment_options, default_equipment,
  sections, can_be_primary, coaching_cues, regression, progression, equipment_display_names
)
SELECT
  'bench-press',
  pattern_id,
  'Bench Press',
  ARRAY['barbell', 'dumbbells'],
  'barbell',
  sections,
  can_be_primary,
  coaching_cues,
  regression,
  progression,
  '{"barbell": "Barbell Bench Press", "dumbbells": "Dumbbell Bench Press"}'::jsonb
FROM exercise_definitions WHERE id = 'bench-press-flat'
ON CONFLICT (id) DO NOTHING;

-- 2. Update FK references
UPDATE exercises SET exercise_id = 'bench-press' WHERE exercise_id = 'bench-press-flat';
UPDATE exercises SET exercise_id = 'bench-press' WHERE exercise_id = 'db-bench-press';

-- 3. Delete old entries
DELETE FROM exercise_definitions WHERE id = 'bench-press-flat';
DELETE FROM exercise_definitions WHERE id = 'db-bench-press';

-- ============================================
-- CONSOLIDATE: strict-press (ID stays same, just add equipment)
-- ============================================

UPDATE exercises SET exercise_id = 'strict-press' WHERE exercise_id = 'db-strict-press';

UPDATE exercise_definitions
SET
  equipment_options = ARRAY['barbell', 'dumbbells'],
  equipment_display_names = '{"barbell": "Barbell Strict Press", "dumbbells": "Dumbbell Strict Press"}'::jsonb
WHERE id = 'strict-press';

DELETE FROM exercise_definitions WHERE id = 'db-strict-press';

-- ============================================
-- CONSOLIDATE: push-press (ID stays same, just add equipment)
-- ============================================

UPDATE exercises SET exercise_id = 'push-press' WHERE exercise_id = 'db-push-press';

UPDATE exercise_definitions
SET
  equipment_options = ARRAY['barbell', 'dumbbells'],
  equipment_display_names = '{"barbell": "Barbell Push Press", "dumbbells": "Dumbbell Push Press"}'::jsonb
WHERE id = 'push-press';

DELETE FROM exercise_definitions WHERE id = 'db-push-press';

-- ============================================
-- CONSOLIDATE: rdl
-- Merge romanian-deadlift + db-rdl → rdl
-- ============================================

-- 1. Create new consolidated entry
INSERT INTO exercise_definitions (
  id, pattern_id, name, equipment_options, default_equipment,
  sections, can_be_primary, coaching_cues, regression, progression, equipment_display_names
)
SELECT
  'rdl',
  pattern_id,
  'RDL',
  ARRAY['barbell', 'dumbbells', 'kettlebells'],
  'barbell',
  sections,
  can_be_primary,
  coaching_cues,
  regression,
  progression,
  '{"barbell": "Barbell RDL", "dumbbells": "Dumbbell RDL", "kettlebells": "Kettlebell RDL"}'::jsonb
FROM exercise_definitions WHERE id = 'romanian-deadlift'
ON CONFLICT (id) DO NOTHING;

-- 2. Update progressions/regressions
UPDATE exercise_definitions SET progression = 'rdl' WHERE progression = 'romanian-deadlift';
UPDATE exercise_definitions SET regression = 'rdl' WHERE regression = 'romanian-deadlift';

-- 3. Update FK references
UPDATE exercises SET exercise_id = 'rdl' WHERE exercise_id = 'romanian-deadlift';
UPDATE exercises SET exercise_id = 'rdl' WHERE exercise_id = 'db-rdl';

-- 4. Delete old entries
DELETE FROM exercise_definitions WHERE id = 'romanian-deadlift';
DELETE FROM exercise_definitions WHERE id = 'db-rdl';

-- ============================================
-- CONSOLIDATE: snatch
-- Merge kb-snatch + db-snatch → snatch
-- ============================================

-- 1. Create new consolidated entry
INSERT INTO exercise_definitions (
  id, pattern_id, name, equipment_options, default_equipment,
  sections, can_be_primary, coaching_cues, regression, progression, equipment_display_names
)
SELECT
  'snatch',
  pattern_id,
  'Snatch',
  ARRAY['kettlebells', 'dumbbells'],
  'dumbbells',
  sections,
  can_be_primary,
  coaching_cues,
  regression,
  progression,
  '{"kettlebells": "Kettlebell Snatch", "dumbbells": "Dumbbell Snatch"}'::jsonb
FROM exercise_definitions WHERE id = 'kb-snatch'
ON CONFLICT (id) DO NOTHING;

-- 2. Update FK references
UPDATE exercises SET exercise_id = 'snatch' WHERE exercise_id = 'kb-snatch';
UPDATE exercises SET exercise_id = 'snatch' WHERE exercise_id = 'db-snatch';

-- 3. Delete old entries
DELETE FROM exercise_definitions WHERE id = 'kb-snatch';
DELETE FROM exercise_definitions WHERE id = 'db-snatch';

-- ============================================
-- SPLIT: hip-thrust
-- Current: hip-thrust (BB/DB/BW) → bb-hip-thrust (BB) + hip-thrust (DB/BW)
-- ============================================

-- 1. Create bb-hip-thrust
INSERT INTO exercise_definitions (
  id, pattern_id, name, equipment_options, default_equipment,
  sections, can_be_primary, coaching_cues, equipment_display_names
)
SELECT
  'bb-hip-thrust',
  pattern_id,
  'Barbell Hip Thrust',
  ARRAY['barbell'],
  'barbell',
  sections,
  FALSE,
  coaching_cues,
  NULL
FROM exercise_definitions WHERE id = 'hip-thrust'
ON CONFLICT (id) DO NOTHING;

-- 2. Update historical exercises that used barbell
UPDATE exercises
SET exercise_id = 'bb-hip-thrust'
WHERE exercise_id = 'hip-thrust' AND equipment_used = 'barbell';

-- 3. Update hip-thrust to DB/BW only
UPDATE exercise_definitions
SET
  equipment_options = ARRAY['dumbbells', 'bodyweight'],
  default_equipment = 'bodyweight',
  equipment_display_names = '{"dumbbells": "Dumbbell Hip Thrust", "bodyweight": "Bodyweight Hip Thrust"}'::jsonb
WHERE id = 'hip-thrust';

-- ============================================
-- CONSOLIDATE: swing (rename kb-swing → swing, delete db-swing)
-- ============================================

-- 1. Create new entry
INSERT INTO exercise_definitions (
  id, pattern_id, name, equipment_options, default_equipment,
  sections, can_be_primary, coaching_cues, regression, progression, equipment_display_names
)
SELECT
  'swing',
  pattern_id,
  'Kettlebell Swing',
  ARRAY['kettlebells'],
  'kettlebells',
  sections,
  can_be_primary,
  coaching_cues,
  regression,
  progression,
  NULL
FROM exercise_definitions WHERE id = 'kb-swing'
ON CONFLICT (id) DO NOTHING;

-- 2. Update FK references
UPDATE exercises SET exercise_id = 'swing' WHERE exercise_id = 'kb-swing';
UPDATE exercises SET exercise_id = 'swing' WHERE exercise_id = 'db-swing';

-- 3. Delete old entries
DELETE FROM exercise_definitions WHERE id = 'kb-swing';
DELETE FROM exercise_definitions WHERE id = 'db-swing';

-- ============================================
-- ADD display names to already-consolidated exercises
-- ============================================

UPDATE exercise_definitions
SET equipment_display_names = '{"dumbbells": "Dumbbell Goblet Squat", "kettlebells": "Kettlebell Goblet Squat"}'::jsonb
WHERE id = 'goblet-squat' AND equipment_display_names IS NULL;

UPDATE exercise_definitions
SET equipment_display_names = '{"dumbbells": "Dumbbell Single-Leg RDL", "kettlebells": "Kettlebell Single-Leg RDL", "bodyweight": "Bodyweight Single-Leg RDL"}'::jsonb
WHERE id = 'single-leg-rdl' AND equipment_display_names IS NULL;

UPDATE exercise_definitions
SET equipment_display_names = '{"bodyweight": "Bodyweight Glute Bridge", "dumbbells": "Dumbbell Glute Bridge", "barbell": "Barbell Glute Bridge"}'::jsonb
WHERE id = 'glute-bridge' AND equipment_display_names IS NULL;

UPDATE exercise_definitions
SET equipment_display_names = '{"bodyweight": "Bodyweight Russian Twists", "dumbbells": "Dumbbell Russian Twists", "kettlebells": "Kettlebell Russian Twists"}'::jsonb
WHERE id = 'russian-twists' AND equipment_display_names IS NULL;

-- ============================================
-- VERIFICATION QUERY (run separately after migration)
-- SELECT id, name, equipment_options, equipment_display_names, can_be_primary
-- FROM exercise_definitions
-- WHERE equipment_display_names IS NOT NULL
-- ORDER BY id;
-- ============================================
