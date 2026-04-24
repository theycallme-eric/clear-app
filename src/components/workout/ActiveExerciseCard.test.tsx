import { describe, it, expect } from 'vitest';
import type { Exercise, SetLog } from '@/types/workout';

// Extract the pure logic from ActiveExerciseCard for testing.
// These mirror the inline functions in the component.

const WEIGHTED_EQUIPMENT = ['barbell', 'dumbbell', 'dumbbells', 'kettlebell', 'cable', 'machine', 'ez bar', 'trap bar', 'smith machine', 'plate'];

function detectPerSetInputs(exercise: Exercise, onSetLog: boolean): boolean {
  const showInputs = true; // assume non-warmup
  const hasWeight = !!(exercise.equipment && WEIGHTED_EQUIPMENT.includes(exercise.equipment.toLowerCase()));
  const isNumericReps = /^\d+$/.test(exercise.reps);
  const hasStandardSets = exercise.sets != null && exercise.sets > 0;
  const isTimedStructure = ['emom', 'amrap', 'for_time'].includes(exercise.structure?.type || '');
  const isCircuit = exercise.structure?.type === 'circuit';
  return showInputs && isNumericReps && hasStandardSets && !isTimedStructure && !isCircuit && onSetLog;
}

function buildInitialSets(exercise: Exercise, hasWeight: boolean): SetLog[] {
  const numSets = exercise.sets || 1;
  const prescribedReps = parseInt(exercise.reps);
  const defaultReps = isNaN(prescribedReps) ? undefined : prescribedReps;
  return Array.from({ length: numSets }, (_, i) => {
    const lastSet = exercise.lastSetData?.[i];
    return {
      setNumber: i + 1,
      weight: lastSet?.weight ?? undefined,
      weightUnit: lastSet?.weightUnit || 'lbs',
      reps: lastSet?.reps ?? defaultReps,
    };
  });
}

function summarizeSets(sets: SetLog[], hasWeight: boolean): string {
  if (sets.length === 0) return '';
  const parts = sets
    .filter(s => (hasWeight ? s.weight != null : s.reps != null))
    .map(s => {
      if (hasWeight && s.weight != null && s.reps != null) return `${s.weight}×${s.reps}`;
      if (hasWeight && s.weight != null) return `${s.weight}`;
      if (s.reps != null) return `${s.reps}`;
      return '';
    })
    .filter(Boolean);
  if (parts.length > 1 && parts.every(p => p === parts[0])) {
    return `${parts[0]} (${parts.length} sets)`;
  }
  return parts.join(', ');
}

const baseExercise: Exercise = {
  id: 'ex1',
  name: 'Back Squat',
  sets: 4,
  reps: '8',
  equipment: 'barbell',
  structure: { type: 'standard' },
};

describe('Per-set detection heuristic', () => {
  it('enables per-set for standard barbell exercise with numeric reps', () => {
    expect(detectPerSetInputs(baseExercise, true)).toBe(true);
  });

  it('disables per-set when onSetLog is not provided', () => {
    expect(detectPerSetInputs(baseExercise, false)).toBe(false);
  });

  it('disables per-set for non-numeric reps ("30 sec")', () => {
    expect(detectPerSetInputs({ ...baseExercise, reps: '30 sec' }, true)).toBe(false);
  });

  it('disables per-set for "10 each" reps', () => {
    expect(detectPerSetInputs({ ...baseExercise, reps: '10 each' }, true)).toBe(false);
  });

  it('disables per-set for AMRAP exercises', () => {
    expect(detectPerSetInputs({
      ...baseExercise,
      structure: { type: 'amrap', minutes: 10, group_id: 'g1' },
    }, true)).toBe(false);
  });

  it('disables per-set for EMOM exercises', () => {
    expect(detectPerSetInputs({
      ...baseExercise,
      structure: { type: 'emom', minutes: 10, group_id: 'g1' },
    }, true)).toBe(false);
  });

  it('disables per-set for circuit exercises', () => {
    expect(detectPerSetInputs({
      ...baseExercise,
      structure: { type: 'circuit', circuit_id: 'c1', rounds: 3, group_id: 'g1' },
    }, true)).toBe(false);
  });

  it('disables per-set for for_time exercises', () => {
    expect(detectPerSetInputs({
      ...baseExercise,
      structure: { type: 'for_time', time_cap_mins: 10, group_id: 'g1' },
    }, true)).toBe(false);
  });

  it('enables per-set for bodyweight exercises with numeric reps', () => {
    expect(detectPerSetInputs({
      ...baseExercise,
      equipment: undefined, // bodyweight
      reps: '10',
    }, true)).toBe(true);
  });

  it('disables per-set when sets is null', () => {
    expect(detectPerSetInputs({ ...baseExercise, sets: null }, true)).toBe(false);
  });

  it('enables per-set for superset exercises', () => {
    expect(detectPerSetInputs({
      ...baseExercise,
      structure: { type: 'superset', paired_with: 'ex2', group_id: 'g1' },
    }, true)).toBe(true);
  });
});

describe('buildInitialSets', () => {
  it('creates correct number of sets from exercise prescription', () => {
    const sets = buildInitialSets(baseExercise, true);
    expect(sets).toHaveLength(4);
    expect(sets[0].setNumber).toBe(1);
    expect(sets[3].setNumber).toBe(4);
  });

  it('pre-fills reps from prescription', () => {
    const sets = buildInitialSets(baseExercise, true);
    expect(sets[0].reps).toBe(8);
    expect(sets[3].reps).toBe(8);
  });

  it('pre-fills from lastSetData when available', () => {
    const exercise: Exercise = {
      ...baseExercise,
      lastSetData: [
        { setNumber: 1, weight: 135, reps: 10, weightUnit: 'lbs' },
        { setNumber: 2, weight: 155, reps: 8, weightUnit: 'lbs' },
        { setNumber: 3, weight: 175, reps: 6, weightUnit: 'lbs' },
        { setNumber: 4, weight: 185, reps: 4, weightUnit: 'lbs' },
      ],
    };
    const sets = buildInitialSets(exercise, true);
    expect(sets[0].weight).toBe(135);
    expect(sets[0].reps).toBe(10);
    expect(sets[3].weight).toBe(185);
    expect(sets[3].reps).toBe(4);
  });

  it('falls back to prescribed reps when lastSetData is shorter', () => {
    const exercise: Exercise = {
      ...baseExercise,
      lastSetData: [
        { setNumber: 1, weight: 135, reps: 10, weightUnit: 'lbs' },
      ],
    };
    const sets = buildInitialSets(exercise, true);
    expect(sets[0].weight).toBe(135);
    expect(sets[0].reps).toBe(10);
    // Sets 2-4 get prescribed reps, no weight
    expect(sets[1].weight).toBeUndefined();
    expect(sets[1].reps).toBe(8);
  });

  it('handles non-numeric reps gracefully', () => {
    const exercise: Exercise = { ...baseExercise, reps: 'AMRAP', sets: 2 };
    const sets = buildInitialSets(exercise, false);
    expect(sets).toHaveLength(2);
    expect(sets[0].reps).toBeUndefined(); // NaN → undefined
  });
});

describe('summarizeSets', () => {
  it('compresses identical sets', () => {
    const sets: SetLog[] = [
      { setNumber: 1, weight: 135, reps: 8 },
      { setNumber: 2, weight: 135, reps: 8 },
      { setNumber: 3, weight: 135, reps: 8 },
    ];
    expect(summarizeSets(sets, true)).toBe('135×8 (3 sets)');
  });

  it('lists different sets individually', () => {
    const sets: SetLog[] = [
      { setNumber: 1, weight: 135, reps: 10 },
      { setNumber: 2, weight: 155, reps: 8 },
      { setNumber: 3, weight: 175, reps: 6 },
    ];
    expect(summarizeSets(sets, true)).toBe('135×10, 155×8, 175×6');
  });

  it('shows only reps for bodyweight exercises', () => {
    const sets: SetLog[] = [
      { setNumber: 1, reps: 10 },
      { setNumber: 2, reps: 10 },
      { setNumber: 3, reps: 8 },
    ];
    expect(summarizeSets(sets, false)).toBe('10, 10, 8');
  });

  it('compresses identical bodyweight sets', () => {
    const sets: SetLog[] = [
      { setNumber: 1, reps: 10 },
      { setNumber: 2, reps: 10 },
      { setNumber: 3, reps: 10 },
    ];
    expect(summarizeSets(sets, false)).toBe('10 (3 sets)');
  });

  it('returns empty string for empty sets', () => {
    expect(summarizeSets([], true)).toBe('');
  });

  it('handles weight-only sets', () => {
    const sets: SetLog[] = [
      { setNumber: 1, weight: 135 },
      { setNumber: 2, weight: 155 },
    ];
    expect(summarizeSets(sets, true)).toBe('135, 155');
  });
});
