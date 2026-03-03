import { describe, it, expect } from 'vitest';
import { isGenerationError } from '@/types/generation';
import { transformAPIWorkoutToFrontend } from './workout-api';
import type { GenerateWorkoutResponse, GeneratedWorkout as APIGeneratedWorkout } from '@/types/generation';

describe('isGenerationError', () => {
  it('returns true for error responses', () => {
    expect(isGenerationError({ error: 'something broke' })).toBe(true);
  });

  it('returns true for error with details', () => {
    expect(isGenerationError({ error: 'fail', details: 'more info' })).toBe(true);
  });

  it('returns false for valid workout responses', () => {
    const response: GenerateWorkoutResponse = {
      workout: {
        title: 'Test',
        overview: 'A test workout',
        estimated_duration_mins: 30,
        intensity_description: 'moderate',
        sections: [],
      },
      metadata: {
        prompt_version: '1.0',
        generated_at: new Date().toISOString(),
        request: { intensity: 5, anchor: 'squat', goal: 'strength', duration_mins: 30, location_id: 'loc1' },
      },
    };
    expect(isGenerationError(response)).toBe(false);
  });
});

describe('transformAPIWorkoutToFrontend', () => {
  const makeAPIWorkout = (overrides?: Partial<APIGeneratedWorkout>): APIGeneratedWorkout => ({
    title: 'Morning Strength',
    overview: 'A solid strength session',
    estimated_duration_mins: 45,
    intensity_description: 'moderate',
    sections: [
      {
        section_type: 'warmup',
        section_title: 'Warm-up',
        section_notes: null,
        estimated_duration_mins: 5,
        exercises: [
          {
            exercise_id: 'jumping-jacks',
            name: 'Jumping Jacks',
            equipment: 'none',
            sets: 2,
            reps: '20',
            effort_percent: null,
            tempo: null,
            rest_seconds: null,
            coaching_cues: ['Keep light on feet'],
            regression: null,
            structure: { type: 'standard' },
          },
        ],
      },
      {
        section_type: 'primary_lift',
        section_title: 'Main Lift',
        section_notes: null,
        estimated_duration_mins: 20,
        exercises: [
          {
            exercise_id: 'back-squat',
            name: 'Back Squat',
            equipment: 'barbell',
            sets: 4,
            reps: '6',
            effort_percent: 80,
            tempo: '3-1-2',
            rest_seconds: 120,
            coaching_cues: ['Brace core', 'Knees track toes'],
            regression: 'Goblet squat',
            structure: { type: 'standard' },
          },
        ],
      },
    ],
    ...overrides,
  });

  it('maps title and description from API fields', () => {
    const result = transformAPIWorkoutToFrontend(makeAPIWorkout(), 7, 'squat');
    expect(result.title).toBe('Morning Strength');
    expect(result.description).toBe('A solid strength session');
  });

  it('maps duration to string format', () => {
    const result = transformAPIWorkoutToFrontend(makeAPIWorkout(), 7, 'squat');
    expect(result.duration).toBe('45m');
  });

  it('uppercases anchor', () => {
    const result = transformAPIWorkoutToFrontend(makeAPIWorkout(), 5, 'hinge');
    expect(result.anchor).toBe('HINGE');
  });

  it('passes through intensity and goal', () => {
    const result = transformAPIWorkoutToFrontend(makeAPIWorkout(), 8, 'press', 'hypertrophy');
    expect(result.intensity).toBe(8);
    expect(result.goal).toBe('hypertrophy');
  });

  it('maps section types correctly', () => {
    const result = transformAPIWorkoutToFrontend(makeAPIWorkout(), 5, 'squat');
    expect(result.sections[0].type).toBe('warmup');
    expect(result.sections[1].type).toBe('primary');
  });

  it('maps exercise fields', () => {
    const result = transformAPIWorkoutToFrontend(makeAPIWorkout(), 5, 'squat');
    const squat = result.sections[1].exercises[0];
    expect(squat.name).toBe('Back Squat');
    expect(squat.sets).toBe(4);
    expect(squat.reps).toBe('6');
    expect(squat.effort).toBe('80%');
    expect(squat.tempo).toBe('3-1-2');
    expect(squat.rest).toBe('120s');
    expect(squat.regression).toBe('Goblet squat');
  });

  it('preserves string reps like "30 sec"', () => {
    const api = makeAPIWorkout({
      sections: [
        {
          section_type: 'warmup',
          section_title: 'Warm-up',
          section_notes: null,
          estimated_duration_mins: 5,
          exercises: [
            {
              exercise_id: 'plank',
              name: 'Plank',
              equipment: 'none',
              sets: 3,
              reps: '30 sec',
              effort_percent: null,
              tempo: null,
              rest_seconds: null,
              coaching_cues: [],
              regression: null,
              structure: { type: 'standard' },
            },
          ],
        },
      ],
    });
    const result = transformAPIWorkoutToFrontend(api, 5, 'squat');
    expect(result.sections[0].exercises[0].reps).toBe('30 sec');
  });
});
