-- Migration: Seed exercise library with initial data
-- Created: 2026-01-20
-- Source: Clear_-_Exercise_Library.md

-- ============================================
-- MOVEMENT PATTERNS
-- ============================================

INSERT INTO movement_patterns (id, name, category, anchor, description) VALUES
  -- SQUAT patterns
  ('squat-bilateral', 'Bilateral Squat', 'lower_body', 'squat', 'Two-legged squatting movements'),
  ('squat-unilateral', 'Unilateral Squat', 'lower_body', 'squat', 'Single-leg squat variations'),

  -- HINGE patterns
  ('hinge-deadlift', 'Deadlift', 'lower_body', 'hinge', 'Hip-hinge pulling from floor'),
  ('hinge-hip-thrust', 'Hip Thrust', 'lower_body', 'hinge', 'Hip extension movements'),
  ('hinge-swing', 'Swing', 'lower_body', 'hinge', 'Ballistic hip-hinge movements'),

  -- PRESS patterns
  ('press-horizontal', 'Horizontal Press', 'upper_body', 'press', 'Pressing away from torso'),
  ('press-vertical', 'Vertical Press', 'upper_body', 'press', 'Pressing overhead'),
  ('press-accessory', 'Press Accessory', 'upper_body', 'press', 'Isolation pressing movements'),

  -- PULL patterns
  ('pull-vertical', 'Vertical Pull', 'upper_body', 'pull', 'Pulling from overhead'),
  ('pull-horizontal', 'Horizontal Pull', 'upper_body', 'pull', 'Rowing movements'),
  ('pull-accessory', 'Pull Accessory', 'upper_body', 'pull', 'Isolation pulling movements'),

  -- POWER patterns
  ('power-clean', 'Clean', 'full_body', 'power', 'Olympic clean variations'),
  ('power-snatch', 'Snatch', 'full_body', 'power', 'Snatch variations'),
  ('power-thruster', 'Thruster', 'full_body', 'power', 'Squat to press combination'),

  -- CORE patterns
  ('core-anti-rotation', 'Anti-Rotation', 'core', 'surprise', 'Resisting rotation'),
  ('core-flexion', 'Core Flexion', 'core', 'surprise', 'Spinal flexion movements'),
  ('core-stability', 'Core Stability', 'core', 'surprise', 'Isometric core holds'),

  -- CONDITIONING patterns
  ('conditioning-plyometric', 'Plyometric', 'full_body', 'surprise', 'Jumping and explosive movements'),
  ('conditioning-locomotion', 'Locomotion', 'full_body', 'surprise', 'Running and moving patterns');

-- ============================================
-- EXERCISE DEFINITIONS - SQUAT ANCHOR
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- Primary Lift Eligible
  ('back-squat', 'squat-bilateral', 'Back Squat', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Chest up, core braced', 'Knees track over toes', 'Hip crease below knee']),

  ('front-squat', 'squat-bilateral', 'Front Squat', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Elbows high, upper back tight', 'Upright torso', 'Full depth']),

  ('leg-press', 'squat-bilateral', 'Leg Press', ARRAY['leg_press'], 'leg_press',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Full range of motion', 'Do not lock knees', 'Control the negative']),

  -- Accessory Only
  ('goblet-squat', 'squat-bilateral', 'Goblet Squat', ARRAY['dumbbells', 'kettlebells'], 'dumbbells',
   ARRAY['accessory', 'warmup']::section_type[], FALSE,
   ARRAY['Weight at chest', 'Elbows inside knees', 'Upright torso']),

  ('bulgarian-split-squat', 'squat-unilateral', 'Bulgarian Split Squat', ARRAY['dumbbells', 'barbell', 'bodyweight'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Rear foot elevated', 'Vertical shin on front leg', 'Control the descent']),

  ('walking-lunges', 'squat-unilateral', 'Walking Lunges', ARRAY['dumbbells', 'barbell', 'bodyweight'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Long stride', 'Knee tracks over toe', 'Upright torso']),

  ('reverse-lunges', 'squat-unilateral', 'Reverse Lunges', ARRAY['dumbbells', 'barbell', 'bodyweight'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Step back with control', 'Front knee stable', 'Drive through front heel']),

  ('box-step-ups', 'squat-unilateral', 'Box Step-ups', ARRAY['box', 'dumbbells'], 'box',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Full foot on box', 'Drive through heel', 'Minimal push from rear leg']);

-- ============================================
-- EXERCISE DEFINITIONS - HINGE ANCHOR
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- Primary Lift Eligible
  ('deadlift', 'hinge-deadlift', 'Deadlift', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Neutral spine', 'Bar close to body', 'Hip and knee extension together']),

  ('romanian-deadlift', 'hinge-deadlift', 'Romanian Deadlift (RDL)', ARRAY['barbell', 'dumbbells'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Slight knee bend', 'Hinge at hips', 'Feel hamstring stretch']),

  -- Accessory Only
  ('db-rdl', 'hinge-deadlift', 'Dumbbell RDL', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Weights close to legs', 'Push hips back', 'Maintain flat back']),

  ('single-leg-rdl', 'hinge-deadlift', 'Single-Leg RDL', ARRAY['dumbbells', 'kettlebells', 'bodyweight'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Hinge at hip', 'Back leg extends for balance', 'Square hips']),

  ('hip-thrust', 'hinge-hip-thrust', 'Hip Thrust', ARRAY['barbell', 'dumbbells', 'bodyweight'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Shoulders on bench', 'Drive through heels', 'Full hip extension at top']),

  ('glute-bridge', 'hinge-hip-thrust', 'Glute Bridge', ARRAY['bodyweight', 'dumbbells', 'barbell'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Feet hip-width', 'Squeeze glutes at top', 'Do not hyperextend']),

  ('kb-swing', 'hinge-swing', 'Kettlebell Swing', ARRAY['kettlebells'], 'kettlebells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Hip snap, not arm pull', 'Bell to shoulder height', 'Hinge, not squat']);

-- ============================================
-- EXERCISE DEFINITIONS - PRESS ANCHOR
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- Primary Lift Eligible
  ('bench-press-flat', 'press-horizontal', 'Bench Press (Flat)', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Feet flat, back arched', 'Bar to mid-chest', 'Drive through heels']),

  ('bench-press-incline', 'press-horizontal', 'Bench Press (Incline)', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['30-45 degree angle', 'Bar to upper chest', 'Shoulder blades pinched']),

  ('strict-press', 'press-vertical', 'Strict Press', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['No leg drive', 'Bar close to face', 'Full lockout overhead']),

  ('push-press', 'press-vertical', 'Push Press', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Dip and drive', 'Quick hip extension', 'Catch overhead with straight arms']),

  -- Accessory Only
  ('db-bench-press', 'press-horizontal', 'Dumbbell Bench Press', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Weights touch at top', 'Control the descent', 'Full range of motion']),

  ('db-strict-press', 'press-vertical', 'Dumbbell Strict Press', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Core tight', 'Press straight up', 'Full lockout']),

  ('push-ups', 'press-horizontal', 'Push-ups', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory', 'conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Body in straight line', 'Chest to floor', 'Full arm extension']),

  ('dips', 'press-vertical', 'Dips', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Lean forward for chest', 'Upright for triceps', 'Full range of motion']),

  ('lateral-raises', 'press-accessory', 'Lateral Raises', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Slight bend in elbow', 'Lead with pinky', 'Control the negative']),

  ('tricep-extensions', 'press-accessory', 'Tricep Extensions', ARRAY['dumbbells', 'cable_machine'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Elbows fixed', 'Full extension', 'Squeeze at bottom']);

-- ============================================
-- EXERCISE DEFINITIONS - PULL ANCHOR
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- Primary Lift Eligible
  ('barbell-row', 'pull-horizontal', 'Barbell Row (Bent Over)', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Neutral spine, hinged forward', 'Bar to ribcage', 'Squeeze shoulder blades']),

  -- Accessory Only
  ('lat-pulldown', 'pull-vertical', 'Lat Pulldown', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Lean back slightly', 'Pull to upper chest', 'Squeeze lats at bottom']),

  ('pull-ups', 'pull-vertical', 'Pull-ups', ARRAY['bodyweight', 'pullup_bar'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Dead hang start', 'Chin over bar', 'Control the descent']),

  ('cable-rows', 'pull-horizontal', 'Cable Rows', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Chest up', 'Pull to stomach', 'Squeeze shoulder blades']),

  ('three-point-row', 'pull-horizontal', '3-Point Row', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['One hand on bench', 'Row to hip', 'Minimal rotation']),

  ('face-pulls', 'pull-accessory', 'Face Pulls', ARRAY['cable_machine', 'resistance_bands'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Pull to face level', 'External rotation at peak', 'Squeeze rear delts']),

  ('bicep-curls', 'pull-accessory', 'Bicep Curls', ARRAY['dumbbells', 'barbell', 'cable_machine'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Elbows fixed', 'Full range of motion', 'Control the negative']);

-- ============================================
-- EXERCISE DEFINITIONS - POWER ANCHOR
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- Primary Lift Eligible
  ('power-clean', 'power-clean', 'Power Clean', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Triple extension', 'High pull, fast elbows', 'Catch in quarter squat']),

  ('hang-clean', 'power-clean', 'Hang Clean', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Start at hang position', 'Explosive hip drive', 'Fast turnover']),

  ('thruster', 'power-thruster', 'Thruster', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Front squat to press', 'Use leg drive', 'One fluid motion']),

  -- Accessory Only
  ('db-thruster', 'power-thruster', 'Dumbbell Thruster', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Dumbbells at shoulders', 'Full squat depth', 'Press overhead at top']),

  ('db-snatch', 'power-snatch', 'Dumbbell Snatch', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['One arm at a time', 'Hip drive, high pull', 'Catch overhead']),

  ('kb-snatch', 'power-snatch', 'Kettlebell Snatch', ARRAY['kettlebells'], 'kettlebells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Hip snap', 'Punch through at top', 'Soft catch']);

-- ============================================
-- EXERCISE DEFINITIONS - CORE
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  ('plank', 'core-stability', 'Plank', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup']::section_type[], FALSE,
   ARRAY['Straight line from head to heels', 'Engage core', 'Do not sag hips']),

  ('hollow-body-hold', 'core-stability', 'Hollow Body Hold', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup']::section_type[], FALSE,
   ARRAY['Lower back pressed to floor', 'Arms and legs extended', 'No arch in back']),

  ('dead-bugs', 'core-anti-rotation', 'Dead Bugs', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Lower back flat', 'Opposite arm and leg extend', 'Control the movement']),

  ('bird-dogs', 'core-anti-rotation', 'Bird Dogs', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup', 'mobility']::section_type[], FALSE,
   ARRAY['On all fours', 'Extend opposite arm and leg', 'Keep hips level']),

  ('russian-twists', 'core-anti-rotation', 'Russian Twists', ARRAY['bodyweight', 'dumbbells', 'kettlebells'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Lean back slightly', 'Rotate from core', 'Feet off ground for challenge']),

  ('hanging-knee-tucks', 'core-flexion', 'Hanging Knee Tucks', ARRAY['pullup_bar'], 'pullup_bar',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Dead hang start', 'Bring knees to chest', 'Control the descent']);

-- ============================================
-- EXERCISE DEFINITIONS - CONDITIONING
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  ('box-jumps', 'conditioning-plyometric', 'Box Jumps', ARRAY['box'], 'box',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Swing arms for power', 'Land softly', 'Step down to reset']),

  ('squat-jumps', 'conditioning-plyometric', 'Squat Jumps', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Full squat depth', 'Explosive jump', 'Soft landing']),

  ('burpees', 'conditioning-plyometric', 'Burpees', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Chest to floor', 'Explosive jump', 'Full extension at top']),

  ('runners', 'conditioning-locomotion', 'Runners (High Knees)', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Drive knees high', 'Quick turnover', 'Stay on balls of feet']);

-- ============================================
-- EXERCISE DEFINITIONS - WARMUP/MOBILITY
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  ('air-squat', 'squat-bilateral', 'Air Squat', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'conditioning']::section_type[], FALSE,
   ARRAY['Full depth', 'Knees track over toes', 'Arms forward for balance']),

  ('worlds-greatest-stretch', 'conditioning-locomotion', 'World''s Greatest Stretch', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Lunge position', 'Rotate and reach', 'Open up hips and thoracic']);

-- ============================================
-- SET UP PROGRESSIONS/REGRESSIONS
-- ============================================

-- Squat progressions
UPDATE exercise_definitions SET progression = 'goblet-squat' WHERE id = 'air-squat';
UPDATE exercise_definitions SET regression = 'air-squat', progression = 'back-squat' WHERE id = 'goblet-squat';
UPDATE exercise_definitions SET regression = 'goblet-squat' WHERE id = 'back-squat';

-- Hinge progressions
UPDATE exercise_definitions SET progression = 'romanian-deadlift' WHERE id = 'glute-bridge';
UPDATE exercise_definitions SET regression = 'glute-bridge', progression = 'deadlift' WHERE id = 'romanian-deadlift';
UPDATE exercise_definitions SET regression = 'romanian-deadlift' WHERE id = 'deadlift';

-- Pull progressions
UPDATE exercise_definitions SET progression = 'pull-ups' WHERE id = 'lat-pulldown';
UPDATE exercise_definitions SET regression = 'lat-pulldown' WHERE id = 'pull-ups';
