import { createContext, useContext, ReactNode } from 'react';
import { useHomeData, IncompleteSession } from '@/hooks/useHomeData';
import { useAuthContext } from '@/contexts/AuthContext';
import { WorkoutHistoryEntry, StreakData } from '@/types/workout';

interface HomeDataContextValue {
  workoutHistory: WorkoutHistoryEntry[];
  streakData: StreakData;
  incompleteSession: IncompleteSession | null;
  isLoading: boolean;
  hasError: boolean;
  loadHomeData: () => Promise<void>;
  checkForIncompleteSession: () => Promise<void>;
  clearIncompleteSession: () => void;
}

const HomeDataContext = createContext<HomeDataContextValue | null>(null);

export function HomeDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const homeData = useHomeData(user?.id || null);

  return (
    <HomeDataContext.Provider value={homeData}>
      {children}
    </HomeDataContext.Provider>
  );
}

export function useHomeDataContext() {
  const context = useContext(HomeDataContext);
  if (!context) {
    throw new Error('useHomeDataContext must be used within a HomeDataProvider');
  }
  return context;
}
