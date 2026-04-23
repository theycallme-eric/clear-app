-- Exercise Muscle Groups Junction Table
-- Adds muscle group metadata to exercise definitions for intelligent workout programming.
-- Enables: thematic coherence, accessory selection, weekly coverage tracking.

-- Create the junction table
CREATE TABLE exercise_muscle_groups (
  exercise_id TEXT NOT NULL REFERENCES exercise_definitions(id) ON DELETE CASCADE,
  muscle_group TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('primary', 'synergist', 'stabilizer')),
  PRIMARY KEY (exercise_id, muscle_group, role)
);

-- Index for efficient lookups by muscle group
CREATE INDEX idx_exercise_muscle_groups_muscle ON exercise_muscle_groups(muscle_group);
CREATE INDEX idx_exercise_muscle_groups_role ON exercise_muscle_groups(muscle_group, role);

-- RLS: public read access (reference data)
ALTER TABLE exercise_muscle_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercise muscle groups are viewable by everyone"
  ON exercise_muscle_groups FOR SELECT USING (true);

-- ============================================
-- POPULATE MUSCLE GROUP DATA
-- ============================================
-- Vocabulary: quads, hamstrings, glutes, calves, adductors, hip_flexors,
--   pecs, lats, traps, rhomboids, delts, rotator_cuff, biceps, triceps, forearms,
--   core, obliques, erectors

-- ---- SQUAT EXERCISES ----

INSERT INTO exercise_muscle_groups (exercise_id, muscle_group, role) VALUES
-- air-squat
('air-squat', 'quads', 'primary'),
('air-squat', 'glutes', 'primary'),
('air-squat', 'hamstrings', 'synergist'),
('air-squat', 'core', 'stabilizer'),
('air-squat', 'calves', 'stabilizer'),

-- back-squat
('back-squat', 'quads', 'primary'),
('back-squat', 'glutes', 'primary'),
('back-squat', 'hamstrings', 'synergist'),
('back-squat', 'core', 'stabilizer'),
('back-squat', 'erectors', 'stabilizer'),

-- front-squat
('front-squat', 'quads', 'primary'),
('front-squat', 'glutes', 'synergist'),
('front-squat', 'core', 'stabilizer'),
('front-squat', 'erectors', 'stabilizer'),
('front-squat', 'delts', 'stabilizer'),

-- leg-press
('leg-press', 'quads', 'primary'),
('leg-press', 'glutes', 'synergist'),
('leg-press', 'hamstrings', 'synergist'),

-- goblet-squat
('goblet-squat', 'quads', 'primary'),
('goblet-squat', 'glutes', 'primary'),
('goblet-squat', 'core', 'stabilizer'),
('goblet-squat', 'hamstrings', 'synergist'),

-- bulgarian-split-squat
('bulgarian-split-squat', 'quads', 'primary'),
('bulgarian-split-squat', 'glutes', 'primary'),
('bulgarian-split-squat', 'hamstrings', 'synergist'),
('bulgarian-split-squat', 'core', 'stabilizer'),
('bulgarian-split-squat', 'adductors', 'stabilizer'),

-- walking-lunges
('walking-lunges', 'quads', 'primary'),
('walking-lunges', 'glutes', 'primary'),
('walking-lunges', 'hamstrings', 'synergist'),
('walking-lunges', 'core', 'stabilizer'),

-- reverse-lunges
('reverse-lunges', 'quads', 'primary'),
('reverse-lunges', 'glutes', 'primary'),
('reverse-lunges', 'hamstrings', 'synergist'),
('reverse-lunges', 'core', 'stabilizer'),

-- box-step-ups
('box-step-ups', 'quads', 'primary'),
('box-step-ups', 'glutes', 'primary'),
('box-step-ups', 'hamstrings', 'synergist'),
('box-step-ups', 'calves', 'stabilizer'),

-- sumo-squat
('sumo-squat', 'quads', 'primary'),
('sumo-squat', 'glutes', 'primary'),
('sumo-squat', 'adductors', 'primary'),
('sumo-squat', 'hamstrings', 'synergist'),
('sumo-squat', 'core', 'stabilizer'),

-- pause-squat
('pause-squat', 'quads', 'primary'),
('pause-squat', 'glutes', 'primary'),
('pause-squat', 'core', 'stabilizer'),
('pause-squat', 'erectors', 'stabilizer'),

-- box-squat
('box-squat', 'quads', 'primary'),
('box-squat', 'glutes', 'primary'),
('box-squat', 'hamstrings', 'synergist'),
('box-squat', 'core', 'stabilizer'),

-- split-squat
('split-squat', 'quads', 'primary'),
('split-squat', 'glutes', 'primary'),
('split-squat', 'hamstrings', 'synergist'),
('split-squat', 'core', 'stabilizer'),

-- walking-lunges-oh
('walking-lunges-oh', 'quads', 'primary'),
('walking-lunges-oh', 'glutes', 'primary'),
('walking-lunges-oh', 'core', 'stabilizer'),
('walking-lunges-oh', 'delts', 'stabilizer'),

-- goblet-reverse-lunges
('goblet-reverse-lunges', 'quads', 'primary'),
('goblet-reverse-lunges', 'glutes', 'primary'),
('goblet-reverse-lunges', 'hamstrings', 'synergist'),
('goblet-reverse-lunges', 'core', 'stabilizer'),

-- cossack-squat-weighted
('cossack-squat-weighted', 'quads', 'primary'),
('cossack-squat-weighted', 'glutes', 'primary'),
('cossack-squat-weighted', 'adductors', 'primary'),
('cossack-squat-weighted', 'hamstrings', 'synergist'),

-- hack-squat
('hack-squat', 'quads', 'primary'),
('hack-squat', 'glutes', 'synergist'),

-- leg-extension
('leg-extension', 'quads', 'primary'),

-- sissy-squat
('sissy-squat', 'quads', 'primary'),
('sissy-squat', 'hip_flexors', 'synergist'),
('sissy-squat', 'core', 'stabilizer'),

-- lateral-lunges
('lateral-lunges', 'quads', 'primary'),
('lateral-lunges', 'glutes', 'primary'),
('lateral-lunges', 'adductors', 'primary'),
('lateral-lunges', 'hamstrings', 'synergist'),

-- ---- HINGE EXERCISES ----

-- deadlift
('deadlift', 'hamstrings', 'primary'),
('deadlift', 'glutes', 'primary'),
('deadlift', 'erectors', 'primary'),
('deadlift', 'lats', 'synergist'),
('deadlift', 'traps', 'synergist'),
('deadlift', 'core', 'stabilizer'),
('deadlift', 'forearms', 'stabilizer'),

-- rdl
('rdl', 'hamstrings', 'primary'),
('rdl', 'glutes', 'primary'),
('rdl', 'erectors', 'synergist'),
('rdl', 'core', 'stabilizer'),

-- single-leg-rdl
('single-leg-rdl', 'hamstrings', 'primary'),
('single-leg-rdl', 'glutes', 'primary'),
('single-leg-rdl', 'erectors', 'synergist'),
('single-leg-rdl', 'core', 'stabilizer'),

-- hip-thrust
('hip-thrust', 'glutes', 'primary'),
('hip-thrust', 'hamstrings', 'synergist'),
('hip-thrust', 'core', 'stabilizer'),

-- bb-hip-thrust
('bb-hip-thrust', 'glutes', 'primary'),
('bb-hip-thrust', 'hamstrings', 'synergist'),
('bb-hip-thrust', 'core', 'stabilizer'),

-- glute-bridge
('glute-bridge', 'glutes', 'primary'),
('glute-bridge', 'hamstrings', 'synergist'),
('glute-bridge', 'core', 'stabilizer'),

-- single-leg-glute-bridge
('single-leg-glute-bridge', 'glutes', 'primary'),
('single-leg-glute-bridge', 'hamstrings', 'synergist'),
('single-leg-glute-bridge', 'core', 'stabilizer'),

-- swing
('swing', 'glutes', 'primary'),
('swing', 'hamstrings', 'primary'),
('swing', 'core', 'synergist'),
('swing', 'erectors', 'synergist'),
('swing', 'delts', 'stabilizer'),

-- good-morning
('good-morning', 'hamstrings', 'primary'),
('good-morning', 'erectors', 'primary'),
('good-morning', 'glutes', 'synergist'),
('good-morning', 'core', 'stabilizer'),

-- cable-pull-through
('cable-pull-through', 'glutes', 'primary'),
('cable-pull-through', 'hamstrings', 'synergist'),
('cable-pull-through', 'core', 'stabilizer'),

-- back-extension
('back-extension', 'erectors', 'primary'),
('back-extension', 'glutes', 'synergist'),
('back-extension', 'hamstrings', 'synergist'),

-- reverse-hyper
('reverse-hyper', 'glutes', 'primary'),
('reverse-hyper', 'hamstrings', 'synergist'),
('reverse-hyper', 'erectors', 'synergist'),

-- leg-curl
('leg-curl', 'hamstrings', 'primary'),
('leg-curl', 'calves', 'synergist'),

-- nordic-curl
('nordic-curl', 'hamstrings', 'primary'),
('nordic-curl', 'calves', 'synergist'),
('nordic-curl', 'glutes', 'stabilizer'),

-- trap-bar-deadlift
('trap-bar-deadlift', 'quads', 'primary'),
('trap-bar-deadlift', 'glutes', 'primary'),
('trap-bar-deadlift', 'hamstrings', 'synergist'),
('trap-bar-deadlift', 'erectors', 'synergist'),
('trap-bar-deadlift', 'traps', 'synergist'),
('trap-bar-deadlift', 'core', 'stabilizer'),

-- sumo-deadlift
('sumo-deadlift', 'glutes', 'primary'),
('sumo-deadlift', 'hamstrings', 'primary'),
('sumo-deadlift', 'quads', 'synergist'),
('sumo-deadlift', 'adductors', 'synergist'),
('sumo-deadlift', 'erectors', 'synergist'),
('sumo-deadlift', 'core', 'stabilizer'),

-- ---- PRESS EXERCISES ----

-- bench-press
('bench-press', 'pecs', 'primary'),
('bench-press', 'triceps', 'synergist'),
('bench-press', 'delts', 'synergist'),
('bench-press', 'core', 'stabilizer'),

-- bench-press-incline
('bench-press-incline', 'pecs', 'primary'),
('bench-press-incline', 'delts', 'primary'),
('bench-press-incline', 'triceps', 'synergist'),

-- bench-press-decline
('bench-press-decline', 'pecs', 'primary'),
('bench-press-decline', 'triceps', 'synergist'),
('bench-press-decline', 'delts', 'stabilizer'),

-- strict-press
('strict-press', 'delts', 'primary'),
('strict-press', 'triceps', 'synergist'),
('strict-press', 'core', 'stabilizer'),
('strict-press', 'traps', 'stabilizer'),

-- push-press
('push-press', 'delts', 'primary'),
('push-press', 'triceps', 'synergist'),
('push-press', 'quads', 'synergist'),
('push-press', 'core', 'stabilizer'),
('push-press', 'glutes', 'synergist'),

-- push-ups
('push-ups', 'pecs', 'primary'),
('push-ups', 'triceps', 'synergist'),
('push-ups', 'delts', 'synergist'),
('push-ups', 'core', 'stabilizer'),

-- dips
('dips', 'pecs', 'primary'),
('dips', 'triceps', 'primary'),
('dips', 'delts', 'synergist'),

-- lateral-raises
('lateral-raises', 'delts', 'primary'),
('lateral-raises', 'traps', 'synergist'),

-- tricep-extensions
('tricep-extensions', 'triceps', 'primary'),

-- db-incline-press
('db-incline-press', 'pecs', 'primary'),
('db-incline-press', 'delts', 'synergist'),
('db-incline-press', 'triceps', 'synergist'),

-- db-chest-flys
('db-chest-flys', 'pecs', 'primary'),
('db-chest-flys', 'delts', 'stabilizer'),

-- cable-chest-flys
('cable-chest-flys', 'pecs', 'primary'),
('cable-chest-flys', 'delts', 'stabilizer'),

-- tricep-cable-pulldowns
('tricep-cable-pulldowns', 'triceps', 'primary'),

-- frontal-raises
('frontal-raises', 'delts', 'primary'),
('frontal-raises', 'pecs', 'synergist'),

-- decline-push-ups
('decline-push-ups', 'pecs', 'primary'),
('decline-push-ups', 'delts', 'primary'),
('decline-push-ups', 'triceps', 'synergist'),
('decline-push-ups', 'core', 'stabilizer'),

-- renegade-push-ups
('renegade-push-ups', 'pecs', 'primary'),
('renegade-push-ups', 'triceps', 'synergist'),
('renegade-push-ups', 'core', 'primary'),
('renegade-push-ups', 'lats', 'synergist'),

-- close-grip-bench
('close-grip-bench', 'triceps', 'primary'),
('close-grip-bench', 'pecs', 'synergist'),
('close-grip-bench', 'delts', 'stabilizer'),

-- arnold-press
('arnold-press', 'delts', 'primary'),
('arnold-press', 'triceps', 'synergist'),
('arnold-press', 'traps', 'stabilizer'),

-- skull-crushers
('skull-crushers', 'triceps', 'primary'),

-- overhead-tricep-extension
('overhead-tricep-extension', 'triceps', 'primary'),

-- incline-db-fly
('incline-db-fly', 'pecs', 'primary'),
('incline-db-fly', 'delts', 'synergist'),

-- landmine-press
('landmine-press', 'delts', 'primary'),
('landmine-press', 'pecs', 'synergist'),
('landmine-press', 'triceps', 'synergist'),
('landmine-press', 'core', 'stabilizer'),

-- ---- PULL EXERCISES ----

-- barbell-row
('barbell-row', 'lats', 'primary'),
('barbell-row', 'rhomboids', 'primary'),
('barbell-row', 'traps', 'synergist'),
('barbell-row', 'biceps', 'synergist'),
('barbell-row', 'core', 'stabilizer'),
('barbell-row', 'erectors', 'stabilizer'),

-- lat-pulldown
('lat-pulldown', 'lats', 'primary'),
('lat-pulldown', 'biceps', 'synergist'),
('lat-pulldown', 'rhomboids', 'synergist'),

-- pull-ups
('pull-ups', 'lats', 'primary'),
('pull-ups', 'biceps', 'synergist'),
('pull-ups', 'rhomboids', 'synergist'),
('pull-ups', 'core', 'stabilizer'),
('pull-ups', 'forearms', 'stabilizer'),

-- cable-rows
('cable-rows', 'lats', 'primary'),
('cable-rows', 'rhomboids', 'primary'),
('cable-rows', 'traps', 'synergist'),
('cable-rows', 'biceps', 'synergist'),

-- three-point-row
('three-point-row', 'lats', 'primary'),
('three-point-row', 'rhomboids', 'synergist'),
('three-point-row', 'biceps', 'synergist'),
('three-point-row', 'core', 'stabilizer'),

-- face-pulls
('face-pulls', 'rhomboids', 'primary'),
('face-pulls', 'rotator_cuff', 'primary'),
('face-pulls', 'delts', 'synergist'),
('face-pulls', 'traps', 'synergist'),

-- bicep-curls
('bicep-curls', 'biceps', 'primary'),
('bicep-curls', 'forearms', 'synergist'),

-- rear-delt-flys
('rear-delt-flys', 'delts', 'primary'),
('rear-delt-flys', 'rhomboids', 'synergist'),
('rear-delt-flys', 'traps', 'synergist'),

-- shrugs
('shrugs', 'traps', 'primary'),
('shrugs', 'forearms', 'stabilizer'),

-- assisted-pull-ups
('assisted-pull-ups', 'lats', 'primary'),
('assisted-pull-ups', 'biceps', 'synergist'),
('assisted-pull-ups', 'rhomboids', 'synergist'),

-- high-pulls
('high-pulls', 'traps', 'primary'),
('high-pulls', 'delts', 'primary'),
('high-pulls', 'biceps', 'synergist'),
('high-pulls', 'core', 'stabilizer'),

-- curl-to-press
('curl-to-press', 'biceps', 'primary'),
('curl-to-press', 'delts', 'primary'),
('curl-to-press', 'core', 'stabilizer'),

-- external-rotation
('external-rotation', 'rotator_cuff', 'primary'),
('external-rotation', 'delts', 'stabilizer'),

-- internal-rotation
('internal-rotation', 'rotator_cuff', 'primary'),
('internal-rotation', 'delts', 'stabilizer'),

-- chin-ups
('chin-ups', 'lats', 'primary'),
('chin-ups', 'biceps', 'primary'),
('chin-ups', 'rhomboids', 'synergist'),
('chin-ups', 'core', 'stabilizer'),

-- pendlay-row
('pendlay-row', 'lats', 'primary'),
('pendlay-row', 'rhomboids', 'primary'),
('pendlay-row', 'traps', 'synergist'),
('pendlay-row', 'biceps', 'synergist'),
('pendlay-row', 'erectors', 'stabilizer'),

-- meadows-row
('meadows-row', 'lats', 'primary'),
('meadows-row', 'rhomboids', 'synergist'),
('meadows-row', 'traps', 'synergist'),
('meadows-row', 'biceps', 'synergist'),

-- hammer-curls
('hammer-curls', 'biceps', 'primary'),
('hammer-curls', 'forearms', 'primary'),

-- preacher-curls
('preacher-curls', 'biceps', 'primary'),

-- inverted-rows
('inverted-rows', 'lats', 'primary'),
('inverted-rows', 'rhomboids', 'primary'),
('inverted-rows', 'biceps', 'synergist'),
('inverted-rows', 'core', 'stabilizer'),

-- straight-arm-pulldown
('straight-arm-pulldown', 'lats', 'primary'),
('straight-arm-pulldown', 'triceps', 'synergist'),
('straight-arm-pulldown', 'core', 'stabilizer'),

-- ---- POWER EXERCISES ----

-- power-clean
('power-clean', 'glutes', 'primary'),
('power-clean', 'hamstrings', 'primary'),
('power-clean', 'quads', 'synergist'),
('power-clean', 'traps', 'synergist'),
('power-clean', 'delts', 'synergist'),
('power-clean', 'core', 'stabilizer'),
('power-clean', 'erectors', 'stabilizer'),

-- hang-clean
('hang-clean', 'glutes', 'primary'),
('hang-clean', 'hamstrings', 'primary'),
('hang-clean', 'traps', 'synergist'),
('hang-clean', 'quads', 'synergist'),
('hang-clean', 'core', 'stabilizer'),

-- thruster
('thruster', 'quads', 'primary'),
('thruster', 'glutes', 'primary'),
('thruster', 'delts', 'primary'),
('thruster', 'triceps', 'synergist'),
('thruster', 'core', 'stabilizer'),

-- db-thruster
('db-thruster', 'quads', 'primary'),
('db-thruster', 'glutes', 'primary'),
('db-thruster', 'delts', 'primary'),
('db-thruster', 'triceps', 'synergist'),
('db-thruster', 'core', 'stabilizer'),

-- snatch
('snatch', 'glutes', 'primary'),
('snatch', 'hamstrings', 'primary'),
('snatch', 'delts', 'synergist'),
('snatch', 'traps', 'synergist'),
('snatch', 'core', 'stabilizer'),

-- squat-clean
('squat-clean', 'quads', 'primary'),
('squat-clean', 'glutes', 'primary'),
('squat-clean', 'hamstrings', 'synergist'),
('squat-clean', 'traps', 'synergist'),
('squat-clean', 'core', 'stabilizer'),

-- sotts-press
('sotts-press', 'delts', 'primary'),
('sotts-press', 'quads', 'synergist'),
('sotts-press', 'core', 'stabilizer'),
('sotts-press', 'triceps', 'synergist'),

-- push-jerk
('push-jerk', 'delts', 'primary'),
('push-jerk', 'triceps', 'synergist'),
('push-jerk', 'quads', 'synergist'),
('push-jerk', 'glutes', 'synergist'),
('push-jerk', 'core', 'stabilizer'),

-- split-jerk
('split-jerk', 'delts', 'primary'),
('split-jerk', 'triceps', 'synergist'),
('split-jerk', 'quads', 'synergist'),
('split-jerk', 'glutes', 'synergist'),
('split-jerk', 'core', 'stabilizer'),
('split-jerk', 'hip_flexors', 'stabilizer'),

-- hang-snatch
('hang-snatch', 'glutes', 'primary'),
('hang-snatch', 'hamstrings', 'primary'),
('hang-snatch', 'delts', 'synergist'),
('hang-snatch', 'traps', 'synergist'),
('hang-snatch', 'core', 'stabilizer'),

-- muscle-clean
('muscle-clean', 'traps', 'primary'),
('muscle-clean', 'delts', 'synergist'),
('muscle-clean', 'biceps', 'synergist'),
('muscle-clean', 'core', 'stabilizer'),

-- clean-pull
('clean-pull', 'hamstrings', 'primary'),
('clean-pull', 'glutes', 'primary'),
('clean-pull', 'traps', 'synergist'),
('clean-pull', 'erectors', 'synergist'),
('clean-pull', 'core', 'stabilizer'),

-- snatch-grip-deadlift
('snatch-grip-deadlift', 'hamstrings', 'primary'),
('snatch-grip-deadlift', 'glutes', 'primary'),
('snatch-grip-deadlift', 'erectors', 'primary'),
('snatch-grip-deadlift', 'lats', 'synergist'),
('snatch-grip-deadlift', 'traps', 'synergist'),
('snatch-grip-deadlift', 'core', 'stabilizer'),

-- ---- CORE EXERCISES ----

-- plank
('plank', 'core', 'primary'),
('plank', 'delts', 'stabilizer'),
('plank', 'glutes', 'stabilizer'),

-- hollow-body-hold
('hollow-body-hold', 'core', 'primary'),
('hollow-body-hold', 'hip_flexors', 'synergist'),

-- dead-bugs
('dead-bugs', 'core', 'primary'),
('dead-bugs', 'hip_flexors', 'synergist'),

-- bird-dogs
('bird-dogs', 'core', 'primary'),
('bird-dogs', 'erectors', 'synergist'),
('bird-dogs', 'glutes', 'synergist'),

-- russian-twists
('russian-twists', 'obliques', 'primary'),
('russian-twists', 'core', 'synergist'),

-- hanging-knee-tucks
('hanging-knee-tucks', 'core', 'primary'),
('hanging-knee-tucks', 'hip_flexors', 'synergist'),
('hanging-knee-tucks', 'forearms', 'stabilizer'),

-- bicycles
('bicycles', 'core', 'primary'),
('bicycles', 'obliques', 'primary'),
('bicycles', 'hip_flexors', 'synergist'),

-- flutter-kicks
('flutter-kicks', 'core', 'primary'),
('flutter-kicks', 'hip_flexors', 'synergist'),

-- leg-raises
('leg-raises', 'core', 'primary'),
('leg-raises', 'hip_flexors', 'synergist'),

-- mountain-climbers
('mountain-climbers', 'core', 'primary'),
('mountain-climbers', 'hip_flexors', 'synergist'),
('mountain-climbers', 'delts', 'stabilizer'),

-- v-ups
('v-ups', 'core', 'primary'),
('v-ups', 'hip_flexors', 'synergist'),

-- ab-wheel-rollout
('ab-wheel-rollout', 'core', 'primary'),
('ab-wheel-rollout', 'lats', 'synergist'),
('ab-wheel-rollout', 'delts', 'stabilizer'),

-- pallof-press
('pallof-press', 'core', 'primary'),
('pallof-press', 'obliques', 'primary'),

-- side-plank
('side-plank', 'obliques', 'primary'),
('side-plank', 'core', 'synergist'),
('side-plank', 'glutes', 'stabilizer'),

-- hanging-leg-raises
('hanging-leg-raises', 'core', 'primary'),
('hanging-leg-raises', 'hip_flexors', 'synergist'),
('hanging-leg-raises', 'forearms', 'stabilizer'),

-- cable-woodchops
('cable-woodchops', 'obliques', 'primary'),
('cable-woodchops', 'core', 'synergist'),
('cable-woodchops', 'delts', 'stabilizer'),

-- toes-to-bar
('toes-to-bar', 'core', 'primary'),
('toes-to-bar', 'hip_flexors', 'synergist'),
('toes-to-bar', 'lats', 'synergist'),
('toes-to-bar', 'forearms', 'stabilizer'),

-- l-sit
('l-sit', 'core', 'primary'),
('l-sit', 'hip_flexors', 'primary'),
('l-sit', 'triceps', 'stabilizer'),

-- landmine-rotation
('landmine-rotation', 'obliques', 'primary'),
('landmine-rotation', 'core', 'synergist'),
('landmine-rotation', 'delts', 'stabilizer'),

-- ---- CONDITIONING EXERCISES ----

-- box-jumps
('box-jumps', 'quads', 'primary'),
('box-jumps', 'glutes', 'primary'),
('box-jumps', 'calves', 'synergist'),
('box-jumps', 'hamstrings', 'synergist'),
('box-jumps', 'core', 'stabilizer'),

-- squat-jumps
('squat-jumps', 'quads', 'primary'),
('squat-jumps', 'glutes', 'primary'),
('squat-jumps', 'calves', 'synergist'),
('squat-jumps', 'core', 'stabilizer'),

-- burpees
('burpees', 'quads', 'primary'),
('burpees', 'pecs', 'synergist'),
('burpees', 'delts', 'synergist'),
('burpees', 'core', 'synergist'),
('burpees', 'glutes', 'synergist'),

-- runners
('runners', 'hip_flexors', 'primary'),
('runners', 'quads', 'synergist'),
('runners', 'calves', 'synergist'),
('runners', 'core', 'stabilizer'),

-- battle-ropes
('battle-ropes', 'delts', 'primary'),
('battle-ropes', 'core', 'primary'),
('battle-ropes', 'forearms', 'synergist'),
('battle-ropes', 'lats', 'synergist'),

-- rowing-machine
('rowing-machine', 'lats', 'primary'),
('rowing-machine', 'quads', 'primary'),
('rowing-machine', 'glutes', 'synergist'),
('rowing-machine', 'biceps', 'synergist'),
('rowing-machine', 'core', 'stabilizer'),

-- assault-bike
('assault-bike', 'quads', 'primary'),
('assault-bike', 'glutes', 'synergist'),
('assault-bike', 'hamstrings', 'synergist'),
('assault-bike', 'core', 'stabilizer'),

-- sled-push
('sled-push', 'quads', 'primary'),
('sled-push', 'glutes', 'primary'),
('sled-push', 'calves', 'synergist'),
('sled-push', 'core', 'stabilizer'),
('sled-push', 'delts', 'stabilizer'),

-- sled-pull
('sled-pull', 'hamstrings', 'primary'),
('sled-pull', 'glutes', 'primary'),
('sled-pull', 'lats', 'synergist'),
('sled-pull', 'biceps', 'synergist'),

-- jump-rope
('jump-rope', 'calves', 'primary'),
('jump-rope', 'quads', 'synergist'),
('jump-rope', 'core', 'stabilizer'),
('jump-rope', 'forearms', 'stabilizer'),

-- bear-crawl
('bear-crawl', 'core', 'primary'),
('bear-crawl', 'delts', 'primary'),
('bear-crawl', 'quads', 'synergist'),
('bear-crawl', 'hip_flexors', 'synergist'),

-- ---- LOADED CARRIES ----

-- farmers-carry
('farmers-carry', 'traps', 'primary'),
('farmers-carry', 'forearms', 'primary'),
('farmers-carry', 'core', 'primary'),
('farmers-carry', 'glutes', 'stabilizer'),

-- suitcase-carry
('suitcase-carry', 'obliques', 'primary'),
('suitcase-carry', 'core', 'primary'),
('suitcase-carry', 'forearms', 'primary'),
('suitcase-carry', 'traps', 'synergist'),

-- overhead-carry
('overhead-carry', 'delts', 'primary'),
('overhead-carry', 'core', 'primary'),
('overhead-carry', 'traps', 'synergist'),
('overhead-carry', 'triceps', 'stabilizer'),

-- rack-carry
('rack-carry', 'core', 'primary'),
('rack-carry', 'biceps', 'synergist'),
('rack-carry', 'erectors', 'stabilizer'),
('rack-carry', 'glutes', 'stabilizer'),

-- ---- MOBILITY / WARMUP / STRETCHES ----
-- (air-squat already covered above)

-- worlds-greatest-stretch
('worlds-greatest-stretch', 'hip_flexors', 'primary'),
('worlds-greatest-stretch', 'hamstrings', 'primary'),
('worlds-greatest-stretch', 'core', 'synergist'),

-- cat-cow
('cat-cow', 'erectors', 'primary'),
('cat-cow', 'core', 'synergist'),

-- pigeon-stretch
('pigeon-stretch', 'glutes', 'primary'),
('pigeon-stretch', 'hip_flexors', 'primary'),

-- couch-stretch
('couch-stretch', 'hip_flexors', 'primary'),
('couch-stretch', 'quads', 'primary'),

-- 90-90-stretch
('90-90-stretch', 'glutes', 'primary'),
('90-90-stretch', 'hip_flexors', 'primary'),

-- thoracic-rotations
('thoracic-rotations', 'erectors', 'primary'),
('thoracic-rotations', 'obliques', 'synergist'),

-- leg-swings
('leg-swings', 'hip_flexors', 'primary'),
('leg-swings', 'hamstrings', 'synergist'),
('leg-swings', 'glutes', 'synergist'),

-- arm-circles
('arm-circles', 'delts', 'primary'),
('arm-circles', 'rotator_cuff', 'synergist'),

-- hip-circles
('hip-circles', 'hip_flexors', 'primary'),
('hip-circles', 'glutes', 'synergist'),
('hip-circles', 'adductors', 'synergist'),

-- downward-dog
('downward-dog', 'hamstrings', 'primary'),
('downward-dog', 'calves', 'primary'),
('downward-dog', 'delts', 'synergist'),
('downward-dog', 'lats', 'synergist'),

-- childs-pose
('childs-pose', 'lats', 'primary'),
('childs-pose', 'erectors', 'synergist'),

-- foam-rolling (general — targets vary by application)
('foam-rolling', 'quads', 'primary'),
('foam-rolling', 'hamstrings', 'primary'),
('foam-rolling', 'glutes', 'primary'),

-- banded-pull-aparts
('banded-pull-aparts', 'rhomboids', 'primary'),
('banded-pull-aparts', 'rotator_cuff', 'synergist'),
('banded-pull-aparts', 'delts', 'synergist'),

-- band-dislocates
('band-dislocates', 'delts', 'primary'),
('band-dislocates', 'rotator_cuff', 'primary');

-- ============================================
-- UPDATE VIEW: Include aggregated muscle groups
-- ============================================

-- Drop and recreate the view to include muscle group data
DROP VIEW IF EXISTS exercise_definitions_with_anchors;

CREATE VIEW exercise_definitions_with_anchors AS
SELECT
  ed.*,
  COALESCE(
    ARRAY_AGG(DISTINCT ea.anchor) FILTER (WHERE ea.anchor IS NOT NULL),
    '{}'::anchor_type[]
  ) AS anchors,
  (
    SELECT ea2.anchor
    FROM exercise_anchors ea2
    WHERE ea2.exercise_id = ed.id AND ea2.is_primary = true
    LIMIT 1
  ) AS primary_anchor,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object('muscle', emg.muscle_group, 'role', emg.role)
      )
      FROM exercise_muscle_groups emg
      WHERE emg.exercise_id = ed.id
    ),
    '[]'::jsonb
  ) AS muscle_groups
FROM exercise_definitions ed
LEFT JOIN exercise_anchors ea ON ea.exercise_id = ed.id
GROUP BY ed.id;
