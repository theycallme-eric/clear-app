# Auth System Refactor Plan

## Problem Summary

The current auth system has accumulated complexity across 5+ hooks with race conditions, duplicate data fetching, and unclear state management. Profile data is fetched 3-4 times on app init. Navigation decisions are based on multiple boolean flags that can be in inconsistent states.

---

## Current Architecture (What Exists)

### Files Involved

| File | Purpose | Issues |
|------|---------|--------|
| `src/lib/supabase.ts` | Supabase client | Has bandaid for AbortError suppression |
| `src/hooks/useAuth.ts` | Auth state + profile check | Fetches profile twice (init + listener), no cleanup |
| `src/hooks/useHomeData.ts` | Preferences + history + streak | Fetches profile AGAIN, no mounted checks |
| `src/hooks/useOnboardingFlow.ts` | Saves onboarding data | Triggers loadHomeData which re-fetches what was just saved |
| `src/hooks/usePreferencesSync.ts` | Settings save | Different pattern than onboarding |
| `src/hooks/useAppNavigation.ts` | Screen state | Simple, no issues |
| `src/pages/Index.tsx` | Orchestrates everything | Complex useEffect with navigation logic |
| `src/lib/home-data.ts` | Data fetching functions | `fetchUserPreferences()` fetches profile + locations |

### Current Data Flow

```
App Mount
    ↓
useAuth() starts
    ├── getSession()
    ├── fetch profile (1st time)
    └── onAuthStateChange listener
            └── fetch profile (2nd time on SIGNED_IN)
    ↓
Index.tsx useEffect triggers
    ├── loadHomeData()
    │       └── fetchUserPreferences()
    │               └── fetch profile + locations (3rd time)
    └── navigateTo("home")
```

### Current State Shape

```typescript
// useAuth returns:
{
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingComplete: boolean | null;  // null is ambiguous!
  userId: string | null;
  error: string | null;
}

// useHomeData returns:
{
  workoutHistory: WorkoutHistoryEntry[];
  streakData: StreakData;
  userPreferences: UserPreferences;
  incompleteSession: IncompleteSession | null;
  isLoading: boolean;
  hasError: boolean;
}
```

### Key Problems

1. **`onboardingComplete: null`** - Is this loading? Error? Incomplete? Navigation logic doesn't handle this well.

2. **Race condition in useAuth.ts** - Initial `checkAuth()` and `onAuthStateChange` listener both fetch profile. Can run in parallel.

3. **No mounted checks in useHomeData** - `loadHomeData()` can setState after unmount.

4. **Navigation before data ready** - `navigateTo("home")` fires before `loadHomeData()` completes.

5. **Circular re-fetch after onboarding** - Onboarding saves profile, then immediately calls `loadHomeData()` which fetches the same profile.

---

## Target Architecture

### Single AuthProvider

Replace multiple hooks with one React Context that manages:
- Auth session state
- User profile (onboarding status, settings)
- User preferences (locations, sections)

```
src/
├── contexts/
│   └── AuthContext.tsx       ← NEW: Single source of truth
├── hooks/
│   ├── useAuth.ts            ← DELETE (merged into AuthContext)
│   ├── useHomeData.ts        ← SIMPLIFY (remove preferences, keep history/streak)
│   ├── useOnboardingFlow.ts  ← SIMPLIFY (use AuthContext.updateProfile)
│   ├── usePreferencesSync.ts ← DELETE (merged into AuthContext)
│   └── useAppNavigation.ts   ← KEEP (no changes)
└── pages/
    └── Index.tsx             ← SIMPLIFY (use AuthContext for routing)
```

### New State Shape

```typescript
// AuthContext provides:
type AuthStatus =
  | 'loading'           // Initial check in progress
  | 'unauthenticated'   // No session
  | 'authenticated';    // Has session (check profile for onboarding)

interface AuthState {
  status: AuthStatus;
  user: { id: string; email: string } | null;
  profile: {
    onboardingComplete: boolean;
    experienceLevel: ExperienceLevel | null;
    goal: GoalPreset | null;
    limitations: string;
    enabledSections: SectionType[];
    defaultLocationId: string | null;
  } | null;
  locations: UserLocation[];
  error: string | null;
}

interface AuthContextValue extends AuthState {
  // Actions
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateLocations: (locations: UserLocation[]) => Promise<void>;
  refreshAuth: () => Promise<void>;
}
```

### New Data Flow

```
App Mount
    ↓
AuthProvider initializes
    ├── getSession()
    ├── If session exists:
    │       └── fetch profile + locations (ONCE)
    └── Setup onAuthStateChange listener
            └── On SIGNED_IN: fetch profile + locations (ONCE)
    ↓
Index.tsx reads AuthContext
    ├── status === 'loading' → LoadingScreen
    ├── status === 'unauthenticated' → WelcomeScreen
    └── status === 'authenticated'
            ├── profile.onboardingComplete === false → OnboardingScreen
            └── profile.onboardingComplete === true → HomeScreen
                    ↓
                HomeScreen mounts
                    └── useHomeData() fetches history + streak (NOT profile)
```

---

## Implementation Steps

### Step 1: Create AuthContext

Create `src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { UserLocation, SectionType, ExperienceLevel, GoalPreset } from '@/types/workout';

// Types
type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

interface Profile {
  onboardingComplete: boolean;
  experienceLevel: ExperienceLevel | null;
  goal: GoalPreset | null;
  limitations: string;
  enabledSections: SectionType[];
  defaultLocationId: string | null;
}

interface AuthState {
  status: AuthStatus;
  user: { id: string; email: string } | null;
  profile: Profile | null;
  locations: UserLocation[];
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateLocations: (locations: UserLocation[]) => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

interface OnboardingData {
  location: {
    name: string;
    tier: string;
    equipment: string[];
  };
  experienceLevel: ExperienceLevel;
  goal: GoalPreset;
  sections: SectionType[];
  limitations: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Section type mapping (frontend ↔ database)
const SECTION_TO_DB: Record<string, string> = {
  warmup: 'warmup',
  mobility: 'mobility',
  primary: 'primary_lift',
  accessory: 'accessory',
  skill: 'skill_power',
  carries: 'carries',
  core: 'core',
  stability: 'stability_balance',
  conditioning: 'conditioning',
  cooldown: 'cooldown',
};

const DB_TO_SECTION: Record<string, SectionType> = {
  warmup: 'warmup',
  mobility: 'mobility',
  primary_lift: 'primary',
  accessory: 'accessory',
  skill_power: 'skill',
  carries: 'carries',
  core: 'core',
  stability_balance: 'stability',
  conditioning: 'conditioning',
  cooldown: 'cooldown',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    profile: null,
    locations: [],
    error: null,
  });

  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  // Fetch profile and locations for a user
  const fetchUserData = useCallback(async (userId: string): Promise<{ profile: Profile; locations: UserLocation[] } | null> => {
    try {
      // Fetch profile and locations in parallel
      const [profileResult, locationsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('locations').select('*').eq('user_id', userId),
      ]);

      if (profileResult.error) {
        console.error('Profile fetch error:', profileResult.error);
        return null;
      }

      const dbProfile = profileResult.data;
      const dbLocations = locationsResult.data || [];

      // Map database format to app format
      const profile: Profile = {
        onboardingComplete: dbProfile.onboarding_completed || false,
        experienceLevel: dbProfile.experience_level as ExperienceLevel | null,
        goal: dbProfile.goal_preset as GoalPreset | null,
        limitations: dbProfile.limitations || '',
        enabledSections: (dbProfile.enabled_sections || []).map(
          (s: string) => DB_TO_SECTION[s] || s
        ) as SectionType[],
        defaultLocationId: dbProfile.default_location_id,
      };

      const locations: UserLocation[] = dbLocations.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        tier: loc.tier,
        equipment: loc.equipment || [],
      }));

      return { profile, locations };
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  }, []);

  // Initialize auth state
  const initialize = useCallback(async () => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!mountedRef.current) return;

      if (error || !session) {
        setState({
          status: 'unauthenticated',
          user: null,
          profile: null,
          locations: [],
          error: error?.message || null,
        });
        return;
      }

      // Have session, fetch user data
      const userData = await fetchUserData(session.user.id);

      if (!mountedRef.current) return;

      if (!userData) {
        // Profile fetch failed but user is authenticated
        // Default to showing onboarding
        setState({
          status: 'authenticated',
          user: { id: session.user.id, email: session.user.email || '' },
          profile: {
            onboardingComplete: false,
            experienceLevel: null,
            goal: null,
            limitations: '',
            enabledSections: [],
            defaultLocationId: null,
          },
          locations: [],
          error: 'Failed to load profile',
        });
        return;
      }

      setState({
        status: 'authenticated',
        user: { id: session.user.id, email: session.user.email || '' },
        profile: userData.profile,
        locations: userData.locations,
        error: null,
      });
    } catch (err) {
      console.error('Auth initialization error:', err);
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          status: 'unauthenticated',
          error: 'Auth initialization failed',
        }));
      }
    } finally {
      initializingRef.current = false;
    }
  }, [fetchUserData]);

  // Setup auth listener
  useEffect(() => {
    mountedRef.current = true;

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;

        if (event === 'SIGNED_OUT' || !session) {
          setState({
            status: 'unauthenticated',
            user: null,
            profile: null,
            locations: [],
            error: null,
          });
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const userData = await fetchUserData(session.user.id);

          if (!mountedRef.current) return;

          setState({
            status: 'authenticated',
            user: { id: session.user.id, email: session.user.email || '' },
            profile: userData?.profile || {
              onboardingComplete: false,
              experienceLevel: null,
              goal: null,
              limitations: '',
              enabledSections: [],
              defaultLocationId: null,
            },
            locations: userData?.locations || [],
            error: userData ? null : 'Failed to load profile',
          });
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [initialize, fetchUserData]);

  // Actions
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!state.user) return;

    // Optimistic update
    setState(prev => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...updates } : null,
    }));

    // Prepare database update
    const dbUpdates: Record<string, any> = {};
    if (updates.experienceLevel !== undefined) dbUpdates.experience_level = updates.experienceLevel;
    if (updates.goal !== undefined) dbUpdates.goal_preset = updates.goal;
    if (updates.limitations !== undefined) dbUpdates.limitations = updates.limitations || null;
    if (updates.enabledSections !== undefined) {
      dbUpdates.enabled_sections = updates.enabledSections.map(s => SECTION_TO_DB[s] || s);
    }
    if (updates.defaultLocationId !== undefined) dbUpdates.default_location_id = updates.defaultLocationId;
    if (updates.onboardingComplete !== undefined) dbUpdates.onboarding_completed = updates.onboardingComplete;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', state.user.id);

    if (error) {
      console.error('Profile update error:', error);
      // Could rollback here if needed
    }
  }, [state.user]);

  const updateLocations = useCallback(async (newLocations: UserLocation[]) => {
    if (!state.user) return;

    const oldLocations = state.locations;
    const oldIds = new Set(oldLocations.map(l => l.id));
    const newIds = new Set(newLocations.map(l => l.id));

    // Optimistic update
    setState(prev => ({ ...prev, locations: newLocations }));

    try {
      // Delete removed locations
      for (const oldLoc of oldLocations) {
        if (!newIds.has(oldLoc.id)) {
          await supabase.from('locations').delete().eq('id', oldLoc.id);
        }
      }

      // Upsert new/updated locations
      for (const loc of newLocations) {
        const equipmentForDb = loc.equipment.map(e =>
          e.toLowerCase().replace(/ /g, '_').replace(/[()\/]/g, '')
        );

        if (oldIds.has(loc.id)) {
          // Update existing
          await supabase
            .from('locations')
            .update({ name: loc.name, tier: loc.tier, equipment: equipmentForDb })
            .eq('id', loc.id);
        } else {
          // Create new
          const { data } = await supabase
            .from('locations')
            .insert({
              user_id: state.user.id,
              name: loc.name,
              tier: loc.tier,
              equipment: equipmentForDb,
            })
            .select('id')
            .single();

          // Update local state with real ID
          if (data && mountedRef.current) {
            setState(prev => ({
              ...prev,
              locations: prev.locations.map(l =>
                l.id === loc.id ? { ...l, id: data.id } : l
              ),
            }));
          }
        }
      }
    } catch (err) {
      console.error('Location update error:', err);
    }
  }, [state.user, state.locations]);

  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    if (!state.user) return;

    const equipmentForDb = data.location.equipment.map(e =>
      e.toLowerCase().replace(/ /g, '_').replace(/[()\/]/g, '')
    );

    try {
      // 1. Create location
      const { data: newLocation, error: locError } = await supabase
        .from('locations')
        .insert({
          user_id: state.user.id,
          name: data.location.name,
          tier: data.location.tier,
          equipment: equipmentForDb,
          is_default: true,
        })
        .select('id')
        .single();

      if (locError) throw locError;

      // 2. Update profile
      const enabledSectionsForDb = data.sections.map(s => SECTION_TO_DB[s] || s);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          experience_level: data.experienceLevel,
          goal_preset: data.goal,
          limitations: data.limitations || null,
          enabled_sections: enabledSectionsForDb,
          default_location_id: newLocation.id,
        })
        .eq('id', state.user.id);

      if (profileError) throw profileError;

      // 3. Update local state (no re-fetch needed!)
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          profile: {
            onboardingComplete: true,
            experienceLevel: data.experienceLevel,
            goal: data.goal,
            limitations: data.limitations,
            enabledSections: data.sections,
            defaultLocationId: newLocation.id,
          },
          locations: [{
            id: newLocation.id,
            name: data.location.name,
            tier: data.location.tier as any,
            equipment: data.location.equipment,
          }],
        }));
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      throw err;
    }
  }, [state.user]);

  const refreshAuth = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'loading' }));
    await initialize();
  }, [initialize]);

  const value: AuthContextValue = {
    ...state,
    signOut,
    updateProfile,
    updateLocations,
    completeOnboarding,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

// Convenience hooks
export function useIsAuthenticated() {
  const { status } = useAuthContext();
  return status === 'authenticated';
}

export function useUser() {
  const { user } = useAuthContext();
  return user;
}
```

### Step 2: Simplify useHomeData

Modify `src/hooks/useHomeData.ts` to ONLY fetch history, streak, and incomplete session. Remove preferences since AuthContext handles that.

```typescript
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchWorkoutHistory, fetchStreakData } from '@/lib/home-data';
import { WorkoutHistoryEntry, StreakData } from '@/types/workout';

export interface IncompleteSession {
  id: string;
  date: string;
}

interface HomeDataState {
  workoutHistory: WorkoutHistoryEntry[];
  streakData: StreakData;
  incompleteSession: IncompleteSession | null;
  isLoading: boolean;
  hasError: boolean;
}

export function useHomeData(userId: string | null) {
  const [state, setState] = useState<HomeDataState>({
    workoutHistory: [],
    streakData: { currentStreak: 0, lastWorkoutDate: null, weekView: {} },
    incompleteSession: null,
    isLoading: false,
    hasError: false,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadHomeData = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, isLoading: true, hasError: false }));

    try {
      const [history, streak] = await Promise.all([
        fetchWorkoutHistory(10),
        fetchStreakData(),
      ]);

      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        workoutHistory: history,
        streakData: streak,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Error loading home data:', err);
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false, hasError: true }));
      }
    }
  }, [userId]);

  const checkForIncompleteSession = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: incomplete } = await supabase
        .from('workout_sessions')
        .select('id, date')
        .eq('user_id', userId)
        .eq('is_rest_day', false)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!mountedRef.current) return;

      if (incomplete && incomplete.length > 0) {
        const session = incomplete[0];
        const dateStr = new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        setState(prev => ({
          ...prev,
          incompleteSession: { id: session.id, date: dateStr }
        }));
      }
    } catch (err) {
      console.error('Error checking incomplete session:', err);
    }
  }, [userId]);

  const clearIncompleteSession = useCallback(() => {
    setState(prev => ({ ...prev, incompleteSession: null }));
  }, []);

  return {
    ...state,
    loadHomeData,
    checkForIncompleteSession,
    clearIncompleteSession,
  };
}
```

### Step 3: Simplify useOnboardingFlow

Modify `src/hooks/useOnboardingFlow.ts` to use AuthContext:

```typescript
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UserPreferences } from '@/types/workout';

export const useOnboardingFlow = (onSuccess: () => void) => {
  const { completeOnboarding } = useAuthContext();

  const handleOnboardingComplete = async (preferences: UserPreferences) => {
    try {
      const locationData = preferences.locations[0];
      if (!locationData) {
        toast.error('No location provided');
        return;
      }

      await completeOnboarding({
        location: {
          name: locationData.name,
          tier: locationData.tier,
          equipment: locationData.equipment,
        },
        experienceLevel: preferences.experienceLevel || 'some',
        goal: preferences.goal || 'balanced',
        sections: preferences.sections,
        limitations: preferences.limitations,
      });

      toast.success('Setup complete!', {
        description: "Let's generate your first workout.",
      });

      onSuccess();
    } catch (err) {
      console.error('Onboarding error:', err);
      toast.error('Something went wrong', {
        description: 'Please try again.',
      });
    }
  };

  return { handleOnboardingComplete };
};
```

### Step 4: Delete usePreferencesSync

Delete `src/hooks/usePreferencesSync.ts` entirely. Its functionality is now in AuthContext's `updateProfile` and `updateLocations`.

### Step 5: Update Index.tsx

Rewrite `src/pages/Index.tsx` to use AuthContext:

```typescript
import { useEffect } from "react";
// ... other imports
import { useAuthContext } from "@/contexts/AuthContext";
import { useHomeData } from "@/hooks/useHomeData";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
// ... other hook imports

const Index = () => {
  const {
    status,
    user,
    profile,
    locations,
    updateProfile,
    updateLocations
  } = useAuthContext();

  const { currentScreen, navigateTo } = useAppNavigation();

  const {
    workoutHistory,
    streakData,
    incompleteSession,
    isLoading: isLoadingHomeData,
    hasError: homeDataError,
    loadHomeData,
    checkForIncompleteSession,
    clearIncompleteSession,
  } = useHomeData(user?.id || null);

  // Build UserPreferences from AuthContext for components that need it
  const userPreferences = {
    onboardingComplete: profile?.onboardingComplete || false,
    locations,
    defaultLocationId: profile?.defaultLocationId || null,
    experienceLevel: profile?.experienceLevel || null,
    goal: profile?.goal || null,
    sections: profile?.enabledSections || [],
    limitations: profile?.limitations || '',
  };

  const { handleOnboardingComplete } = useOnboardingFlow(() => {
    loadHomeData();
    navigateTo("home");
  });

  const workoutFlow = useWorkoutFlow(userPreferences, loadHomeData, workoutHistory);
  const historyDetail = useHistoryDetail();

  // Navigation based on auth status
  useEffect(() => {
    // Component Gallery direct access
    if (currentScreen === 'componentGallery') return;

    // Loading - wait
    if (status === 'loading') {
      if (currentScreen !== 'loading') navigateTo('loading');
      return;
    }

    // Not authenticated - show welcome
    if (status === 'unauthenticated') {
      if (!['welcome', 'signIn', 'createAccount'].includes(currentScreen)) {
        navigateTo('welcome');
      }
      return;
    }

    // Authenticated - check onboarding
    if (status === 'authenticated') {
      if (!profile?.onboardingComplete) {
        if (currentScreen !== 'onboarding') {
          navigateTo('onboarding');
        }
        return;
      }

      // Onboarding complete - go to home if on auth screens
      if (['loading', 'welcome', 'signIn', 'createAccount', 'onboarding'].includes(currentScreen)) {
        loadHomeData();
        checkForIncompleteSession();
        navigateTo('home');
      }
    }
  }, [status, profile?.onboardingComplete, currentScreen]);

  // Handle preferences save (for SettingsScreen)
  const handleSavePreferences = async (newPreferences: typeof userPreferences) => {
    await updateProfile({
      experienceLevel: newPreferences.experienceLevel,
      goal: newPreferences.goal,
      limitations: newPreferences.limitations,
      enabledSections: newPreferences.sections,
      defaultLocationId: newPreferences.defaultLocationId,
    });
    await updateLocations(newPreferences.locations);
  };

  // ... rest of component unchanged (handlers, JSX)
  // Replace handleSignInSuccess to just navigate:
  const handleSignInSuccess = async (onboardingComplete: boolean) => {
    // Auth listener will handle state update
    // Just navigate based on onboarding status
    if (onboardingComplete) {
      loadHomeData();
      checkForIncompleteSession();
      navigateTo("home");
    } else {
      navigateTo("onboarding");
    }
  };

  // ... return JSX unchanged
};
```

### Step 6: Wrap App with AuthProvider

Update `src/main.tsx` (or wherever the app root is):

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

### Step 7: Remove old useAuth hook

Delete `src/hooks/useAuth.ts` since AuthContext replaces it.

### Step 8: Clean up supabase.ts

Remove the AbortError suppression since we no longer have race conditions:

```typescript
// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

declare global {
  var __supabase: SupabaseClient<Database> | undefined;
}

export const supabase =
  globalThis.__supabase ?? createClient<Database>(supabaseUrl, supabaseAnonKey);

if (import.meta.hot) {
  globalThis.__supabase = supabase;
}

export type { Database } from '@/types/database';
```

---

## Files Changed Summary

| File | Action |
|------|--------|
| `src/contexts/AuthContext.tsx` | CREATE - New unified auth context |
| `src/hooks/useAuth.ts` | DELETE - Replaced by AuthContext |
| `src/hooks/usePreferencesSync.ts` | DELETE - Merged into AuthContext |
| `src/hooks/useHomeData.ts` | MODIFY - Remove preferences, add mounted check |
| `src/hooks/useOnboardingFlow.ts` | MODIFY - Use AuthContext.completeOnboarding |
| `src/pages/Index.tsx` | MODIFY - Use AuthContext, simplify navigation |
| `src/lib/supabase.ts` | MODIFY - Remove AbortError workaround |
| `src/main.tsx` | MODIFY - Wrap with AuthProvider |

---

## Testing Criteria

After implementation, verify:

1. **Fresh user flow:**
   - App loads → Welcome screen
   - Sign up → Onboarding screen
   - Complete onboarding → Home screen (no console errors)
   - Profile fetched only ONCE during entire flow

2. **Returning user flow:**
   - App loads → Home screen directly (after brief loading)
   - Profile + locations fetched ONCE
   - History and streak load separately

3. **Settings save:**
   - Change location/sections in settings
   - Verify changes persist on refresh
   - No duplicate API calls

4. **Sign out/in:**
   - Sign out → Welcome screen
   - Sign in → Home screen (if onboarded)
   - No stale state from previous session

5. **No console errors:**
   - No AbortError messages
   - No "state update on unmounted component" warnings
   - No duplicate profile fetches in Network tab

6. **HMR works:**
   - Hot reload during development doesn't break auth state

---

## Key Improvements

| Before | After |
|--------|-------|
| Profile fetched 3-4 times | Profile fetched 1 time |
| `onboardingComplete: null` ambiguous | Clear `status` enum |
| 5 hooks managing auth state | 1 AuthContext |
| No cleanup/mounted checks | Proper cleanup everywhere |
| Navigation before data ready | Data ready before navigation |
| AbortError workaround needed | Clean architecture, no workarounds |
| Circular re-fetch after onboarding | State updated directly, no re-fetch |

---

*Plan created: February 2025*
