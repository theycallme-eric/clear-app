-- Migration: Tag all 140 exercises with component_movements and exercise_role
-- Ref: Workout Anatomy Spec, Sections 3-4
-- Batched by role category for correctness.

-- ============================================
-- COMPOUND LIFTS (can_be_primary = true, heavy multi-joint)
-- ============================================

UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{knee-flexion,hip-mobility,ankle-mobility,brace}' WHERE id = 'back-squat';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{knee-flexion,hip-mobility,ankle-mobility,brace}' WHERE id = 'front-squat';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{knee-flexion,hip-mobility,brace}' WHERE id = 'pause-squat';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{knee-flexion,hip-mobility,brace}' WHERE id = 'box-squat';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{knee-flexion,hip-mobility,ankle-mobility,brace}' WHERE id = 'sumo-squat';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{hip-hinge,posterior-chain-activation,grip,brace}' WHERE id = 'deadlift';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{hip-hinge,posterior-chain-activation,grip,brace}' WHERE id = 'sumo-deadlift';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{hip-hinge,posterior-chain-activation,grip,brace,knee-flexion}' WHERE id = 'trap-bar-deadlift';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{hip-hinge,posterior-chain-activation,grip,brace}' WHERE id = 'rdl';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{hip-hinge,posterior-chain-activation,grip,brace}' WHERE id = 'snatch-grip-deadlift';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{horizontal-press,scapular-control,brace}' WHERE id = 'bench-press';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{horizontal-press,scapular-control,brace}' WHERE id = 'bench-press-incline';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{horizontal-press,scapular-control}' WHERE id = 'bench-press-decline';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{vertical-press,scapular-control,brace,shoulder-mobility}' WHERE id = 'strict-press';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{vertical-press,scapular-control,brace,triple-extension}' WHERE id = 'push-press';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{vertical-press,shoulder-mobility,scapular-control,brace}' WHERE id = 'landmine-press';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{horizontal-pull,scapular-control,brace,hip-hinge}' WHERE id = 'barbell-row';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{horizontal-pull,scapular-control,brace,hip-hinge}' WHERE id = 'pendlay-row';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{vertical-pull,scapular-control,grip,brace}' WHERE id = 'pull-ups';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{vertical-pull,scapular-control,grip,brace}' WHERE id = 'chin-ups';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{triple-extension,hip-hinge,posterior-chain-activation,grip,brace}' WHERE id = 'power-clean';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{triple-extension,hip-hinge,posterior-chain-activation,grip}' WHERE id = 'hang-clean';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{triple-extension,hip-hinge,shoulder-mobility,grip,brace}' WHERE id = 'snatch';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{triple-extension,hip-hinge,shoulder-mobility,grip}' WHERE id = 'hang-snatch';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{triple-extension,knee-flexion,hip-hinge,grip,brace}' WHERE id = 'squat-clean';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{triple-extension,vertical-press,brace}' WHERE id = 'push-jerk';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{triple-extension,vertical-press,single-leg-stability,brace}' WHERE id = 'split-jerk';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{knee-flexion,vertical-press,triple-extension,brace}' WHERE id = 'thruster';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{knee-flexion,vertical-press,triple-extension,brace}' WHERE id = 'db-thruster';
UPDATE exercise_definitions SET exercise_role = 'compound_lift', component_movements = '{knee-flexion,brace}' WHERE id = 'leg-press';

-- ============================================
-- ACCESSORIES (anchored, supporting compound lifts)
-- ============================================

-- Squat accessories
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion,single-leg-stability,hip-mobility}' WHERE id = 'bulgarian-split-squat';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion,single-leg-stability}' WHERE id = 'walking-lunges';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion,single-leg-stability}' WHERE id = 'reverse-lunges';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion,single-leg-stability}' WHERE id = 'box-step-ups';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion,single-leg-stability}' WHERE id = 'split-squat';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion,single-leg-stability,brace}' WHERE id = 'walking-lunges-oh';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion,single-leg-stability}' WHERE id = 'goblet-reverse-lunges';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion,hip-mobility,ankle-mobility}' WHERE id = 'cossack-squat-weighted';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion}' WHERE id = 'hack-squat';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion}' WHERE id = 'leg-extension';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion,hip-mobility}' WHERE id = 'sissy-squat';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion,hip-mobility,single-leg-stability}' WHERE id = 'lateral-lunges';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{knee-flexion,hip-mobility,ankle-mobility,brace}' WHERE id = 'goblet-squat';

-- Hinge accessories
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{hip-hinge,posterior-chain-activation,single-leg-stability}' WHERE id = 'single-leg-rdl';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{posterior-chain-activation}' WHERE id = 'hip-thrust';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{posterior-chain-activation}' WHERE id = 'bb-hip-thrust';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{hip-hinge,posterior-chain-activation,triple-extension}' WHERE id = 'swing';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{hip-hinge,posterior-chain-activation,brace}' WHERE id = 'good-morning';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{hip-hinge,posterior-chain-activation}' WHERE id = 'cable-pull-through';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{posterior-chain-activation,hip-hinge}' WHERE id = 'back-extension';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{posterior-chain-activation,hip-hinge}' WHERE id = 'reverse-hyper';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{posterior-chain-activation}' WHERE id = 'leg-curl';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{posterior-chain-activation}' WHERE id = 'nordic-curl';

-- Press accessories
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{vertical-press,shoulder-mobility}' WHERE id = 'arnold-press';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-press}' WHERE id = 'db-incline-press';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-press}' WHERE id = 'db-chest-flys';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-press}' WHERE id = 'cable-chest-flys';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-press}' WHERE id = 'incline-db-fly';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-press,brace}' WHERE id = 'close-grip-bench';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-press,vertical-press}' WHERE id = 'dips';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-press,brace}' WHERE id = 'decline-push-ups';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-press,anti-rotation,brace}' WHERE id = 'renegade-push-ups';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{vertical-press}' WHERE id = 'lateral-raises';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{vertical-press}' WHERE id = 'frontal-raises';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{vertical-press}' WHERE id = 'tricep-extensions';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{vertical-press}' WHERE id = 'tricep-cable-pulldowns';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{vertical-press}' WHERE id = 'skull-crushers';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{vertical-press}' WHERE id = 'overhead-tricep-extension';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-press,brace}' WHERE id = 'push-ups';

-- Pull accessories
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{vertical-pull,scapular-control}' WHERE id = 'lat-pulldown';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{vertical-pull,scapular-control}' WHERE id = 'assisted-pull-ups';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-pull,scapular-control}' WHERE id = 'cable-rows';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-pull,scapular-control,anti-rotation}' WHERE id = 'three-point-row';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-pull,scapular-control}' WHERE id = 'meadows-row';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{horizontal-pull,scapular-control,brace}' WHERE id = 'inverted-rows';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{vertical-pull,scapular-control}' WHERE id = 'straight-arm-pulldown';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{scapular-control,shoulder-mobility}' WHERE id = 'face-pulls';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{scapular-control,shoulder-mobility}' WHERE id = 'rear-delt-flys';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{grip}' WHERE id = 'bicep-curls';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{grip}' WHERE id = 'hammer-curls';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{grip}' WHERE id = 'preacher-curls';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{vertical-press,grip}' WHERE id = 'curl-to-press';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{grip}' WHERE id = 'shrugs';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{triple-extension,scapular-control}' WHERE id = 'high-pulls';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{shoulder-mobility}' WHERE id = 'external-rotation';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{shoulder-mobility}' WHERE id = 'internal-rotation';

-- Power accessories
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{triple-extension,scapular-control,grip}' WHERE id = 'muscle-clean';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{triple-extension,hip-hinge,grip}' WHERE id = 'clean-pull';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{vertical-press,knee-flexion,brace}' WHERE id = 'sotts-press';

-- ============================================
-- ACTIVATION (bodyweight movement prep)
-- ============================================

UPDATE exercise_definitions SET exercise_role = 'activation', component_movements = '{knee-flexion,hip-mobility,ankle-mobility}' WHERE id = 'air-squat';
UPDATE exercise_definitions SET exercise_role = 'activation', component_movements = '{posterior-chain-activation,hip-hinge}' WHERE id = 'glute-bridge';
UPDATE exercise_definitions SET exercise_role = 'activation', component_movements = '{posterior-chain-activation,single-leg-stability}' WHERE id = 'single-leg-glute-bridge';
UPDATE exercise_definitions SET exercise_role = 'activation', component_movements = '{brace,anti-rotation}' WHERE id = 'dead-bugs';
UPDATE exercise_definitions SET exercise_role = 'activation', component_movements = '{brace,posterior-chain-activation,anti-rotation}' WHERE id = 'bird-dogs';
UPDATE exercise_definitions SET exercise_role = 'activation', component_movements = '{brace}' WHERE id = 'hollow-body-hold';
UPDATE exercise_definitions SET exercise_role = 'activation', component_movements = '{brace}' WHERE id = 'plank';
UPDATE exercise_definitions SET exercise_role = 'activation', component_movements = '{scapular-control,shoulder-mobility}' WHERE id = 'banded-pull-aparts';
UPDATE exercise_definitions SET exercise_role = 'activation', component_movements = '{shoulder-mobility,scapular-control}' WHERE id = 'band-dislocates';
UPDATE exercise_definitions SET exercise_role = 'activation', component_movements = '{shoulder-mobility}' WHERE id = 'arm-circles';

-- ============================================
-- MOBILITY (joint range, stretching, release)
-- ============================================

UPDATE exercise_definitions SET exercise_role = 'mobility', component_movements = '{hip-mobility}' WHERE id = '90-90-stretch';
UPDATE exercise_definitions SET exercise_role = 'mobility', component_movements = '{thoracic-mobility,hip-mobility}' WHERE id = 'cat-cow';
UPDATE exercise_definitions SET exercise_role = 'mobility', component_movements = '{hip-mobility,posterior-chain-activation}' WHERE id = 'pigeon-stretch';
UPDATE exercise_definitions SET exercise_role = 'mobility', component_movements = '{hip-mobility,knee-flexion}' WHERE id = 'couch-stretch';
UPDATE exercise_definitions SET exercise_role = 'mobility', component_movements = '{hip-mobility,posterior-chain-activation,ankle-mobility}' WHERE id = 'downward-dog';
UPDATE exercise_definitions SET exercise_role = 'mobility', component_movements = '{hip-mobility}' WHERE id = 'hip-circles';
UPDATE exercise_definitions SET exercise_role = 'mobility', component_movements = '{hip-mobility,posterior-chain-activation}' WHERE id = 'leg-swings';
UPDATE exercise_definitions SET exercise_role = 'mobility', component_movements = '{thoracic-mobility}' WHERE id = 'thoracic-rotations';
UPDATE exercise_definitions SET exercise_role = 'mobility', component_movements = '{hip-mobility,thoracic-mobility,ankle-mobility}' WHERE id = 'worlds-greatest-stretch';
UPDATE exercise_definitions SET exercise_role = 'mobility', component_movements = '{shoulder-mobility}' WHERE id = 'childs-pose';
UPDATE exercise_definitions SET exercise_role = 'mobility', component_movements = '{hip-mobility,posterior-chain-activation}' WHERE id = 'foam-rolling';

-- ============================================
-- CONDITIONING (full-body / sustained effort)
-- ============================================

UPDATE exercise_definitions SET exercise_role = 'conditioning', component_movements = '{cardio-output,triple-extension,landing-mechanics}' WHERE id = 'box-jumps';
UPDATE exercise_definitions SET exercise_role = 'conditioning', component_movements = '{cardio-output,triple-extension,landing-mechanics}' WHERE id = 'squat-jumps';
UPDATE exercise_definitions SET exercise_role = 'conditioning', component_movements = '{cardio-output,triple-extension,horizontal-press}' WHERE id = 'burpees';
UPDATE exercise_definitions SET exercise_role = 'conditioning', component_movements = '{cardio-output,hip-mobility}' WHERE id = 'runners';
UPDATE exercise_definitions SET exercise_role = 'conditioning', component_movements = '{cardio-output,brace,hip-mobility}' WHERE id = 'mountain-climbers';
UPDATE exercise_definitions SET exercise_role = 'conditioning', component_movements = '{cardio-output,scapular-control,brace}' WHERE id = 'battle-ropes';
UPDATE exercise_definitions SET exercise_role = 'conditioning', component_movements = '{cardio-output,brace}' WHERE id = 'bear-crawl';
UPDATE exercise_definitions SET exercise_role = 'conditioning', component_movements = '{cardio-output,knee-flexion}' WHERE id = 'sled-push';
UPDATE exercise_definitions SET exercise_role = 'conditioning', component_movements = '{cardio-output,posterior-chain-activation}' WHERE id = 'sled-pull';

-- ============================================
-- STABILITY (anti-motion core, carries)
-- ============================================

UPDATE exercise_definitions SET exercise_role = 'stability', component_movements = '{anti-rotation,brace}' WHERE id = 'pallof-press';
UPDATE exercise_definitions SET exercise_role = 'stability', component_movements = '{anti-lateral-flexion,brace}' WHERE id = 'side-plank';
UPDATE exercise_definitions SET exercise_role = 'stability', component_movements = '{brace,grip}' WHERE id = 'farmers-carry';
UPDATE exercise_definitions SET exercise_role = 'stability', component_movements = '{anti-lateral-flexion,brace,grip}' WHERE id = 'suitcase-carry';
UPDATE exercise_definitions SET exercise_role = 'stability', component_movements = '{vertical-press,brace,shoulder-mobility}' WHERE id = 'overhead-carry';
UPDATE exercise_definitions SET exercise_role = 'stability', component_movements = '{brace,grip}' WHERE id = 'rack-carry';
UPDATE exercise_definitions SET exercise_role = 'stability', component_movements = '{brace,scapular-control}' WHERE id = 'ab-wheel-rollout';

-- ============================================
-- CARDIO (sustained heart-rate, machine-based)
-- ============================================

UPDATE exercise_definitions SET exercise_role = 'cardio', component_movements = '{cardio-output}' WHERE id = 'assault-bike';
UPDATE exercise_definitions SET exercise_role = 'cardio', component_movements = '{cardio-output,horizontal-pull}' WHERE id = 'rowing-machine';
UPDATE exercise_definitions SET exercise_role = 'cardio', component_movements = '{cardio-output,landing-mechanics}' WHERE id = 'jump-rope';

-- ============================================
-- REMAINING CORE (dynamic core exercises)
-- ============================================

UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{brace}' WHERE id = 'russian-twists';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{brace,grip}' WHERE id = 'hanging-knee-tucks';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{brace}' WHERE id = 'bicycles';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{brace}' WHERE id = 'flutter-kicks';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{brace}' WHERE id = 'leg-raises';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{brace}' WHERE id = 'v-ups';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{brace,grip}' WHERE id = 'hanging-leg-raises';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{anti-rotation,brace}' WHERE id = 'cable-woodchops';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{brace,grip}' WHERE id = 'toes-to-bar';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{brace}' WHERE id = 'l-sit';
UPDATE exercise_definitions SET exercise_role = 'accessory', component_movements = '{anti-rotation,brace}' WHERE id = 'landmine-rotation';

-- ============================================
-- VALIDATION QUERIES
-- ============================================

-- No exercises missing exercise_role (all should have been set, default is 'accessory')
DO $$
DECLARE
  empty_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO empty_count FROM exercise_definitions WHERE component_movements = '{}';
  IF empty_count > 0 THEN
    RAISE WARNING '% exercises have empty component_movements', empty_count;
  END IF;
END $$;

-- Compound lifts should have 3+ components
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, name, array_length(component_movements, 1) as n
    FROM exercise_definitions
    WHERE exercise_role = 'compound_lift' AND array_length(component_movements, 1) < 3
  LOOP
    RAISE WARNING 'Compound lift "%" has only % components', r.name, r.n;
  END LOOP;
END $$;

-- Activation/mobility should have 1+ components
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, name
    FROM exercise_definitions
    WHERE exercise_role IN ('activation', 'mobility') AND component_movements = '{}'
  LOOP
    RAISE WARNING 'Activation/mobility exercise "%" has no components', r.name;
  END LOOP;
END $$;
