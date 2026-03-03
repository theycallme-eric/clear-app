export const queryKeys = {
  workoutHistory: (userId: string) => ['workoutHistory', userId] as const,
  streakData: (userId: string) => ['streakData', userId] as const,
  incompleteSession: (userId: string) => ['incompleteSession', userId] as const,
  workoutDetail: (sessionId: string) => ['workoutDetail', sessionId] as const,
};
