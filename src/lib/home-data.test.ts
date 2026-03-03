import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase before importing home-data
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockNot = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockGte = vi.fn();
const mockIs = vi.fn();
const mockSingle = vi.fn();

const chainMock = () => ({
  select: mockSelect.mockReturnThis(),
  eq: mockEq.mockReturnThis(),
  not: mockNot.mockReturnThis(),
  order: mockOrder.mockReturnThis(),
  limit: mockLimit.mockReturnThis(),
  gte: mockGte.mockReturnThis(),
  is: mockIs.mockReturnThis(),
  single: mockSingle,
});

const mockFrom = vi.fn();

vi.mock('./supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => {
      mockFrom(...args);
      return chainMock();
    },
  },
}));

vi.mock('./logger', () => ({
  logger: {
    data: { error: vi.fn(), info: vi.fn(), debug: vi.fn() },
    auth: { error: vi.fn(), info: vi.fn(), debug: vi.fn() },
  },
}));

import { fetchWorkoutHistory, fetchStreakData } from './home-data';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchWorkoutHistory', () => {
  it('returns empty array on Supabase error', async () => {
    mockLimit.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });

    const result = await fetchWorkoutHistory(10);
    expect(result).toEqual([]);
  });

  it('returns mapped entries on success', async () => {
    mockLimit.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          date: '2025-01-15',
          anchor: 'squat',
          intensity: 7,
          duration_mins: 45,
          goal_preset: 'strength',
          mood: '4',
          session_notes: 'Great session',
          completed_at: '2025-01-15T12:00:00Z',
        },
      ],
      error: null,
    });

    const result = await fetchWorkoutHistory(10);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].anchor).toBe('SQUAT');
    expect(result[0].intensity).toBe(7);
    expect(result[0].duration).toBe(45);
    expect(result[0].mood).toBe(4);
  });
});

describe('fetchStreakData', () => {
  it('returns zero-streak default on Supabase error', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });

    const result = await fetchStreakData();
    expect(result).toEqual({
      currentStreak: 0,
      lastWorkoutDate: null,
      weekView: {},
    });
  });

  it('returns zero streak when no sessions exist', async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    const result = await fetchStreakData();
    expect(result.currentStreak).toBe(0);
    expect(result.lastWorkoutDate).toBeNull();
  });
});
