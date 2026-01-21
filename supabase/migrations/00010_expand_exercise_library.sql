-- Migration: Expand exercise library (Phase 2)
-- Created: 2026-01-21
-- Adds ~55 exercises to bring total to ~100

-- ============================================
-- NEW MOVEMENT PATTERNS
-- ============================================

INSERT INTO movement_patterns (id, name, category, anchor, description) VALUES
  ('squat-machine', 'Machine Squat', 'lower_body', 'squat', 'Machine-based squat movements'),
  ('hinge-extension', 'Back Extension', 'lower_body', 'hinge', 'Spinal extension movements'),
  ('press-isolation', 'Press Isolation', 'upper_body', 'press', 'Single-joint pressing movements'),
  ('pull-isolation', 'Pull Isolation', 'upper_body', 'pull', 'Single-joint pulling movements'),
  ('power-jerk', 'Jerk', 'full_body', 'power', 'Jerk variations'),
  ('core-rotation', 'Core Rotation', 'core', 'surprise', 'Rotational core movements'),
  ('conditioning-carry', 'Loaded Carry', 'full_body', 'surprise', 'Carrying movements'),
  ('mobility-stretch', 'Stretch', 'full_body', 'surprise', 'Static and dynamic stretches')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SQUAT EXERCISES (Missing + New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- From doc (missing)
  ('sumo-squat', 'squat-bilateral', 'Sumo Squat', ARRAY['barbell', 'dumbbells', 'kettlebells'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Wide stance, toes out', 'Knees track over toes', 'Upright torso']),

  ('walking-lunges-oh', 'squat-unilateral', 'Walking Lunges (Overhead)', ARRAY['dumbbells', 'barbell'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Weight locked overhead', 'Core tight', 'Controlled steps']),

  ('goblet-reverse-lunges', 'squat-unilateral', 'Goblet Reverse Lunges', ARRAY['dumbbells', 'kettlebells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Weight at chest', 'Step back with control', 'Front knee stable']),

  ('cossack-squat-weighted', 'squat-unilateral', 'Cossack Squat (Weighted)', ARRAY['dumbbells', 'kettlebells'], 'kettlebells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Side-to-side movement', 'Heel stays down', 'Full depth on working leg']),

  -- New additions
  ('hack-squat', 'squat-machine', 'Hack Squat', ARRAY['hack_squat'], 'hack_squat',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Shoulder pads secure', 'Full depth', 'Control the negative']),

  ('leg-extension', 'squat-machine', 'Leg Extension', ARRAY['leg_curl_extension'], 'leg_curl_extension',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Controlled movement', 'Squeeze at top', 'Do not use momentum']),

  ('sissy-squat', 'squat-bilateral', 'Sissy Squat', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Lean back, knees forward', 'Heels raised', 'Quad isolation']),

  ('pause-squat', 'squat-bilateral', 'Pause Squat', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['2-3 second pause at bottom', 'Stay tight in hole', 'No bounce']),

  ('box-squat', 'squat-bilateral', 'Box Squat', ARRAY['barbell', 'box'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Sit back onto box', 'Pause briefly', 'Explode up']),

  ('split-squat', 'squat-unilateral', 'Split Squat', ARRAY['dumbbells', 'barbell', 'bodyweight'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Static stance', 'Vertical torso', 'Back knee toward floor']),

  ('lateral-lunges', 'squat-unilateral', 'Lateral Lunges', ARRAY['dumbbells', 'bodyweight'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Step wide to side', 'Sit back into hip', 'Push back to start'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- HINGE EXERCISES (Missing + New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- From doc (missing)
  ('single-leg-glute-bridge', 'hinge-hip-thrust', 'Single-Leg Glute Bridge', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory', 'core']::section_type[], FALSE,
   ARRAY['One leg extended', 'Drive through heel', 'Level hips']),

  ('db-swing', 'hinge-swing', 'Dumbbell Swing', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Hip snap, not arm pull', 'Two hands on one dumbbell', 'Hinge pattern']),

  -- New additions
  ('good-morning', 'hinge-deadlift', 'Good Morning', ARRAY['barbell'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Bar on back', 'Hinge at hips', 'Slight knee bend']),

  ('cable-pull-through', 'hinge-hip-thrust', 'Cable Pull-Through', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Face away from cable', 'Hinge and pull through', 'Squeeze glutes at top']),

  ('back-extension', 'hinge-extension', 'Back Extension', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Hinge at hips', 'Neutral spine', 'Squeeze glutes at top']),

  ('reverse-hyper', 'hinge-extension', 'Reverse Hyperextension', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Torso fixed', 'Lift legs with glutes', 'Control the swing']),

  ('leg-curl', 'hinge-deadlift', 'Leg Curl', ARRAY['leg_curl_extension'], 'leg_curl_extension',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Full range of motion', 'Control the negative', 'Squeeze hamstrings']),

  ('nordic-curl', 'hinge-deadlift', 'Nordic Curl', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Control the descent', 'Use hands to push back up', 'Progress slowly']),

  ('trap-bar-deadlift', 'hinge-deadlift', 'Trap Bar Deadlift', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Neutral grip', 'Drive through floor', 'More quad involvement']),

  ('sumo-deadlift', 'hinge-deadlift', 'Sumo Deadlift', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Wide stance', 'Toes out', 'Push knees out'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRESS EXERCISES (Missing + New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- From doc (missing)
  ('bench-press-decline', 'press-horizontal', 'Bench Press (Decline)', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Secure feet', 'Bar to lower chest', 'Control the descent']),

  ('landmine-press', 'press-vertical', 'Landmine Press', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Staggered stance', 'Press at angle', 'Core engaged']),

  ('db-incline-press', 'press-horizontal', 'Dumbbell Incline Press', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['30-45 degree angle', 'Weights touch at top', 'Full stretch at bottom']),

  ('db-push-press', 'press-vertical', 'Dumbbell Push Press', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Dip and drive', 'Use leg power', 'Lock out overhead']),

  ('db-chest-flys', 'press-horizontal', 'Dumbbell Chest Flys', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Slight elbow bend', 'Wide arc motion', 'Squeeze chest at top']),

  ('cable-chest-flys', 'press-horizontal', 'Cable Chest Flys', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Constant tension', 'Hands meet at center', 'Control both directions']),

  ('tricep-cable-pulldowns', 'press-accessory', 'Tricep Cable Pulldowns', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Elbows pinned', 'Full extension', 'Squeeze at bottom']),

  ('frontal-raises', 'press-accessory', 'Frontal Raises', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Lift to shoulder height', 'Control the descent', 'Avoid swinging']),

  ('decline-push-ups', 'press-horizontal', 'Decline Push-ups', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Feet elevated', 'Targets upper chest', 'Full range of motion']),

  ('renegade-push-ups', 'press-horizontal', 'Renegade Push-ups', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Push-up then row', 'Minimize hip rotation', 'Wide stance for stability']),

  -- New additions
  ('close-grip-bench', 'press-horizontal', 'Close-Grip Bench Press', ARRAY['barbell'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Hands shoulder-width', 'Elbows tucked', 'Tricep emphasis']),

  ('arnold-press', 'press-vertical', 'Arnold Press', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Rotate as you press', 'Start palms facing you', 'Full overhead lockout']),

  ('skull-crushers', 'press-isolation', 'Skull Crushers', ARRAY['barbell', 'dumbbells'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Lower to forehead', 'Elbows fixed', 'Extend fully']),

  ('overhead-tricep-extension', 'press-isolation', 'Overhead Tricep Extension', ARRAY['dumbbells', 'cable_machine'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Elbows by ears', 'Full stretch at bottom', 'Squeeze at top']),

  ('incline-db-fly', 'press-horizontal', 'Incline Dumbbell Fly', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Incline bench', 'Wide arc', 'Upper chest focus'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PULL EXERCISES (Missing + New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- From doc (missing)
  ('rear-delt-flys', 'pull-accessory', 'Rear Delt Flys', ARRAY['dumbbells', 'cable_machine'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Bent over position', 'Lead with elbows', 'Squeeze rear delts']),

  ('shrugs', 'pull-accessory', 'Shrugs', ARRAY['dumbbells', 'barbell'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Straight up, not rolling', 'Hold at top', 'Control the negative']),

  ('assisted-pull-ups', 'pull-vertical', 'Assisted Pull-ups', ARRAY['assisted_pullup_dip'], 'assisted_pullup_dip',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Full range of motion', 'Control the movement', 'Progress to less assistance']),

  ('high-pulls', 'pull-vertical', 'High Pulls', ARRAY['kettlebells', 'dumbbells'], 'kettlebells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Explosive hip drive', 'Elbows high', 'Weight close to body']),

  ('curl-to-press', 'pull-accessory', 'Curl to Press', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Curl then press overhead', 'One fluid motion', 'Control both phases']),

  ('external-rotation', 'pull-accessory', 'External Rotation', ARRAY['cable_machine', 'resistance_bands'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Elbow at 90 degrees', 'Rotate outward', 'Rotator cuff health']),

  ('internal-rotation', 'pull-accessory', 'Internal Rotation', ARRAY['cable_machine', 'resistance_bands'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Elbow at 90 degrees', 'Rotate inward', 'Prehab exercise']),

  -- New additions
  ('chin-ups', 'pull-vertical', 'Chin-ups', ARRAY['bodyweight', 'pullup_bar'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Supinated grip', 'Chin over bar', 'More bicep involvement']),

  ('pendlay-row', 'pull-horizontal', 'Pendlay Row', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Bar from floor each rep', 'Explosive pull', 'Torso parallel']),

  ('meadows-row', 'pull-horizontal', 'Meadows Row', ARRAY['barbell'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Landmine setup', 'Staggered stance', 'Pull to hip']),

  ('hammer-curls', 'pull-accessory', 'Hammer Curls', ARRAY['dumbbells'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Neutral grip', 'Targets brachialis', 'No swinging']),

  ('preacher-curls', 'pull-accessory', 'Preacher Curls', ARRAY['dumbbells', 'barbell'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Arms on pad', 'Full extension', 'Isolation movement']),

  ('inverted-rows', 'pull-horizontal', 'Inverted Rows', ARRAY['bodyweight', 'barbell'], 'bodyweight',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Body straight', 'Pull chest to bar', 'Scale with body angle']),

  ('straight-arm-pulldown', 'pull-vertical', 'Straight-Arm Pulldown', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Arms straight throughout', 'Pull to thighs', 'Lat isolation'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POWER EXERCISES (Missing + New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- From doc (missing)
  ('squat-clean', 'power-clean', 'Squat Clean', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Full squat catch', 'Fast elbows', 'Stand up from bottom']),

  ('sotts-press', 'power-thruster', 'Sotts Press', ARRAY['dumbbells', 'kettlebells', 'barbell'], 'dumbbells',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Press from squat bottom', 'Core tight', 'Mobility required']),

  ('landmine-rotation', 'core-rotation', 'Landmine Rotation', ARRAY['barbell'], 'barbell',
   ARRAY['accessory', 'core']::section_type[], FALSE,
   ARRAY['Rotate from hips', 'Arms extended', 'Control the arc']),

  -- New additions
  ('push-jerk', 'power-jerk', 'Push Jerk', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Dip, drive, dip under', 'Catch with soft knees', 'Stand to finish']),

  ('split-jerk', 'power-jerk', 'Split Jerk', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Split stance catch', 'Front shin vertical', 'Recover to standing']),

  ('hang-snatch', 'power-snatch', 'Hang Snatch', ARRAY['barbell'], 'barbell',
   ARRAY['primary_lift', 'accessory']::section_type[], TRUE,
   ARRAY['Start at hang', 'Wide grip', 'Catch overhead']),

  ('muscle-clean', 'power-clean', 'Muscle Clean', ARRAY['barbell'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['No dip under', 'Pull and turn over', 'Upper body strength']),

  ('clean-pull', 'power-clean', 'Clean Pull', ARRAY['barbell'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Triple extension', 'Shrug at top', 'No catch']),

  ('snatch-grip-deadlift', 'power-snatch', 'Snatch-Grip Deadlift', ARRAY['barbell'], 'barbell',
   ARRAY['accessory']::section_type[], FALSE,
   ARRAY['Wide grip', 'Upper back work', 'Full extension'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CORE EXERCISES (Missing + New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  -- From doc (missing)
  ('russian-twists', 'core-rotation', 'Russian Twists', ARRAY['bodyweight', 'dumbbells', 'kettlebells'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Lean back slightly', 'Rotate fully each side', 'Feet up for challenge']),

  ('bicycles', 'core-flexion', 'Bicycles', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup', 'conditioning']::section_type[], FALSE,
   ARRAY['Opposite elbow to knee', 'Extend leg fully', 'Controlled pace']),

  ('flutter-kicks', 'core-stability', 'Flutter Kicks', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup', 'conditioning']::section_type[], FALSE,
   ARRAY['Lower back pressed down', 'Small kicks', 'Continuous movement']),

  ('leg-raises', 'core-flexion', 'Leg Raises', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Keep legs straight', 'Lower with control', 'Press lower back down']),

  ('mountain-climbers', 'core-stability', 'Mountain Climbers', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core', 'warmup', 'conditioning']::section_type[], FALSE,
   ARRAY['Plank position', 'Drive knees to chest', 'Keep hips level']),

  ('v-ups', 'core-flexion', 'V-Ups', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Arms and legs meet at top', 'Controlled descent', 'Full body crunch']),

  -- New additions
  ('ab-wheel-rollout', 'core-stability', 'Ab Wheel Rollout', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Extend as far as possible', 'Keep core tight', 'Roll back with control']),

  ('pallof-press', 'core-anti-rotation', 'Pallof Press', ARRAY['cable_machine', 'resistance_bands'], 'cable_machine',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Resist rotation', 'Press straight out', 'Hold at extension']),

  ('side-plank', 'core-stability', 'Side Plank', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Stack feet or stagger', 'Hips up', 'Straight line']),

  ('hanging-leg-raises', 'core-flexion', 'Hanging Leg Raises', ARRAY['pullup_bar'], 'pullup_bar',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Dead hang', 'Straight legs to parallel', 'Control the descent']),

  ('cable-woodchops', 'core-rotation', 'Cable Woodchops', ARRAY['cable_machine'], 'cable_machine',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['High to low or low to high', 'Rotate through core', 'Arms stay extended']),

  ('toes-to-bar', 'core-flexion', 'Toes to Bar', ARRAY['pullup_bar'], 'pullup_bar',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Kip or strict', 'Toes touch bar', 'Control the descent']),

  ('l-sit', 'core-stability', 'L-Sit', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['core']::section_type[], FALSE,
   ARRAY['Legs parallel to floor', 'Arms straight', 'Depress shoulders'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CONDITIONING EXERCISES (New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  ('battle-ropes', 'conditioning-plyometric', 'Battle Ropes', ARRAY['battle_ropes'], 'battle_ropes',
   ARRAY['conditioning']::section_type[], FALSE,
   ARRAY['Alternating waves', 'Core engaged', 'Athletic stance']),

  ('rowing-machine', 'conditioning-locomotion', 'Rowing Machine', ARRAY['rowing_machine'], 'rowing_machine',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Legs, back, arms sequence', 'Drive through heels', 'Controlled return']),

  ('assault-bike', 'conditioning-locomotion', 'Assault Bike', ARRAY['assault_bike'], 'assault_bike',
   ARRAY['conditioning']::section_type[], FALSE,
   ARRAY['Full body effort', 'Push and pull arms', 'Pace yourself']),

  ('sled-push', 'conditioning-locomotion', 'Sled Push', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning']::section_type[], FALSE,
   ARRAY['Low body angle', 'Drive through legs', 'Short powerful steps']),

  ('sled-pull', 'conditioning-locomotion', 'Sled Pull', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning']::section_type[], FALSE,
   ARRAY['Hand over hand or backward drag', 'Stay low', 'Continuous tension']),

  ('jump-rope', 'conditioning-plyometric', 'Jump Rope', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Stay on balls of feet', 'Wrists do the work', 'Relaxed shoulders']),

  ('bear-crawl', 'conditioning-locomotion', 'Bear Crawl', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['conditioning', 'warmup']::section_type[], FALSE,
   ARRAY['Opposite hand and foot', 'Knees low', 'Core engaged'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- LOADED CARRIES (New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  ('farmers-carry', 'conditioning-carry', 'Farmers Carry', ARRAY['dumbbells', 'kettlebells'], 'dumbbells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Tall posture', 'Shoulders back', 'Controlled steps']),

  ('suitcase-carry', 'conditioning-carry', 'Suitcase Carry', ARRAY['dumbbells', 'kettlebells'], 'dumbbells',
   ARRAY['accessory', 'conditioning', 'core']::section_type[], FALSE,
   ARRAY['One side only', 'Stay vertical', 'Anti-lateral flexion']),

  ('overhead-carry', 'conditioning-carry', 'Overhead Carry', ARRAY['dumbbells', 'kettlebells'], 'kettlebells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Weight locked overhead', 'Core tight', 'Controlled steps']),

  ('rack-carry', 'conditioning-carry', 'Front Rack Carry', ARRAY['kettlebells'], 'kettlebells',
   ARRAY['accessory', 'conditioning']::section_type[], FALSE,
   ARRAY['Bells in rack position', 'Elbows up', 'Upright posture'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MOBILITY/WARMUP EXERCISES (New)
-- ============================================

INSERT INTO exercise_definitions (id, pattern_id, name, equipment_options, default_equipment, sections, can_be_primary, coaching_cues) VALUES
  ('cat-cow', 'mobility-stretch', 'Cat-Cow', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Alternate arch and round', 'Move with breath', 'Full spinal movement']),

  ('pigeon-stretch', 'mobility-stretch', 'Pigeon Stretch', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility', 'cooldown']::section_type[], FALSE,
   ARRAY['Front shin parallel if possible', 'Square hips', 'Breathe into stretch']),

  ('couch-stretch', 'mobility-stretch', 'Couch Stretch', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility', 'cooldown']::section_type[], FALSE,
   ARRAY['Back foot on wall or couch', 'Squeeze glute', 'Hip flexor stretch']),

  ('90-90-stretch', 'mobility-stretch', '90/90 Stretch', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility', 'cooldown']::section_type[], FALSE,
   ARRAY['Both legs at 90 degrees', 'Rotate between sides', 'Hip mobility']),

  ('thoracic-rotations', 'mobility-stretch', 'Thoracic Rotations', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Open up chest', 'Rotate through mid-back', 'Follow hand with eyes']),

  ('leg-swings', 'mobility-stretch', 'Leg Swings', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Forward/back and side/side', 'Controlled swing', 'Hold something for balance']),

  ('arm-circles', 'mobility-stretch', 'Arm Circles', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Small to large circles', 'Both directions', 'Shoulder warm-up']),

  ('hip-circles', 'mobility-stretch', 'Hip Circles', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Standing or all fours', 'Full range of motion', 'Both directions']),

  ('downward-dog', 'mobility-stretch', 'Downward Dog', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility', 'cooldown']::section_type[], FALSE,
   ARRAY['Hips high', 'Heels toward floor', 'Straight arms']),

  ('childs-pose', 'mobility-stretch', 'Child''s Pose', ARRAY['bodyweight'], 'bodyweight',
   ARRAY['warmup', 'mobility', 'cooldown']::section_type[], FALSE,
   ARRAY['Sit back on heels', 'Arms extended or by sides', 'Relax and breathe']),

  ('foam-rolling', 'mobility-stretch', 'Foam Rolling', ARRAY['foam_roller'], 'foam_roller',
   ARRAY['warmup', 'cooldown']::section_type[], FALSE,
   ARRAY['Roll slowly', 'Pause on tight spots', 'Breathe through discomfort']),

  ('banded-pull-aparts', 'mobility-stretch', 'Banded Pull-Aparts', ARRAY['resistance_bands'], 'resistance_bands',
   ARRAY['warmup', 'accessory']::section_type[], FALSE,
   ARRAY['Band at shoulder height', 'Pull apart to chest', 'Squeeze shoulder blades']),

  ('band-dislocates', 'mobility-stretch', 'Band Dislocates', ARRAY['resistance_bands'], 'resistance_bands',
   ARRAY['warmup', 'mobility']::section_type[], FALSE,
   ARRAY['Wide grip on band', 'Rotate overhead and behind', 'Shoulder mobility'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- UPDATE PROGRESSIONS
-- ============================================

-- Squat progressions
UPDATE exercise_definitions SET progression = 'split-squat' WHERE id = 'air-squat';
UPDATE exercise_definitions SET regression = 'air-squat', progression = 'goblet-squat' WHERE id = 'split-squat';

-- Pull-up progressions
UPDATE exercise_definitions SET progression = 'lat-pulldown' WHERE id = 'assisted-pull-ups';
UPDATE exercise_definitions SET regression = 'assisted-pull-ups' WHERE id = 'lat-pulldown';
UPDATE exercise_definitions SET progression = 'chin-ups' WHERE id = 'pull-ups';
UPDATE exercise_definitions SET regression = 'pull-ups' WHERE id = 'chin-ups';

-- Push-up progressions
UPDATE exercise_definitions SET progression = 'decline-push-ups' WHERE id = 'push-ups';
UPDATE exercise_definitions SET regression = 'push-ups' WHERE id = 'decline-push-ups';

-- Core progressions
UPDATE exercise_definitions SET progression = 'hanging-leg-raises' WHERE id = 'leg-raises';
UPDATE exercise_definitions SET regression = 'leg-raises', progression = 'toes-to-bar' WHERE id = 'hanging-leg-raises';
UPDATE exercise_definitions SET regression = 'hanging-leg-raises' WHERE id = 'toes-to-bar';
