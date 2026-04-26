import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { clearStayLoggedIn } from '@/lib/auth-storage';
import { UserLocation, SectionType, ExperienceLevel, GoalPreset, EquipmentTier } from '@/types/workout';
import type { Database } from '@/types/database';
import { SECTION_TO_DB, DB_TO_SECTION } from '@/lib/section-mapping';

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

interface OnboardingData {
  location: {
    name: string;
    tier: EquipmentTier;
    equipment: string[];
  };
  experienceLevel: ExperienceLevel;
  goal: GoalPreset;
  sections: SectionType[];
  limitations: string;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateLocations: (locations: UserLocation[]) => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Auth configuration - can be adjusted based on observed performance
const AUTH_CONFIG = {
  sessionTimeoutMs: 8000,  // Increased from 5s for slow networks
  maxRetries: 2,
  retryDelayMs: 1000,
};

// Retry utility with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  options: { maxRetries: number; delayMs: number; operationName: string }
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= options.maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      logger.auth.warn(`${options.operationName} attempt ${attempt} failed`, {
        error: lastError.message,
        willRetry: attempt <= options.maxRetries,
      });

      if (attempt <= options.maxRetries) {
        const delay = options.delayMs * attempt;  // Linear backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    profile: null,
    locations: [],
    error: null,
  });

  const queryClient = useQueryClient();
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  // Operation lock prevents fetchUserData from running during write operations
  // This prevents TOKEN_REFRESHED from reading stale data during completeOnboarding
  const operationLockRef = useRef<string | null>(null);

  // Prevents concurrent fetchUserData calls from multiple rapid TOKEN_REFRESHED events
  const fetchInProgressRef = useRef(false);

  // Fetch profile and locations for a user
  const fetchUserData = useCallback(async (userId: string): Promise<{ profile: Profile; locations: UserLocation[] } | null> => {
    logger.auth.debug('fetchUserData started', { userId });
    const startTime = performance.now();

    try {
      // Fetch profile and locations in parallel
      const [profileResult, locationsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('locations').select('*').eq('user_id', userId),
      ]);

      if (profileResult.error) {
        logger.auth.error('Profile fetch error', { error: profileResult.error.message, userId });
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

      type LocationRow = Database['public']['Tables']['locations']['Row'];
      const locations: UserLocation[] = dbLocations.map((loc: LocationRow) => ({
        id: loc.id,
        name: loc.name,
        tier: loc.tier as EquipmentTier,
        equipment: loc.equipment || [],
      }));

      logger.auth.info('fetchUserData completed', {
        userId,
        durationMs: Math.round(performance.now() - startTime),
        locationsCount: locations.length,
        onboardingComplete: profile.onboardingComplete,
      });
      return { profile, locations };
    } catch (err) {
      logger.auth.error('fetchUserData exception', {
        userId,
        error: err instanceof Error ? err.message : String(err),
        durationMs: Math.round(performance.now() - startTime),
      });
      return null;
    }
  }, []);

  // Initialize auth state
  const initialize = useCallback(async () => {
    if (initializingRef.current) {
      logger.auth.debug('initialize skipped - already in progress');
      return;
    }
    initializingRef.current = true;
    logger.auth.info('initialize started');
    const startTime = performance.now();

    try {
      // Use a timeout flag instead of Promise.race to avoid AbortError
      // The request continues but we move on if it takes too long
      let timedOut = false;
      const timeoutId = setTimeout(() => {
        timedOut = true;
        if (mountedRef.current) {
          logger.auth.warn('getSession timed out', {
            timeoutMs: AUTH_CONFIG.sessionTimeoutMs,
            durationMs: Math.round(performance.now() - startTime),
          });
          // Fall back to unauthenticated on timeout - user can retry
          setState({
            status: 'unauthenticated',
            user: null,
            profile: null,
            locations: [],
            error: 'Connection timed out. Please try again.',
          });
        }
      }, AUTH_CONFIG.sessionTimeoutMs);

      const { data: { session }, error } = await supabase.auth.getSession();
      clearTimeout(timeoutId);

      // If we already timed out and set state, don't overwrite
      if (timedOut) {
        // Request completed late - if there's a session, update state
        if (session && mountedRef.current) {
          logger.auth.info('Late session received after timeout, updating state', { userId: session.user.id });
          const userData = await fetchUserData(session.user.id);
          if (mountedRef.current) {
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
        return;
      }

      if (!mountedRef.current) return;

      if (error || !session) {
        logger.auth.info('initialize: no session', { error: error?.message });
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

      logger.auth.info('initialize completed successfully', {
        userId: session.user.id,
        onboardingComplete: userData.profile.onboardingComplete,
        durationMs: Math.round(performance.now() - startTime),
      });
      setState({
        status: 'authenticated',
        user: { id: session.user.id, email: session.user.email || '' },
        profile: userData.profile,
        locations: userData.locations,
        error: null,
      });
    } catch (err) {
      logger.auth.error('initialize exception', { error: err instanceof Error ? err.message : String(err) });
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
        logger.auth.debug('onAuthStateChange', { event, hasSession: !!session });

        if (!mountedRef.current) return;

        if (event === 'SIGNED_OUT' || !session) {
          logger.auth.info('Auth state: signed out');
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
          // During initialization, skip this handler to avoid a deadlock:
          // supabase.from() calls getSession() which awaits initializePromise,
          // but _notifyAllSubscribers (which calls this callback) runs INSIDE
          // initializePromise — creating a circular await that hangs forever.
          // initialize() handles the initial profile fetch after getSession() resolves.
          if (initializingRef.current) {
            logger.auth.debug('Skipping auth event during initialization (deadlock prevention)', { event });
            return;
          }

          // Skip fetch if a write operation is in progress to prevent race conditions
          if (operationLockRef.current) {
            logger.auth.info('Skipping fetchUserData due to operation lock', { lock: operationLockRef.current, event });
            return;
          }

          // Deduplicate: skip if a fetch is already running from a prior event
          if (fetchInProgressRef.current) {
            logger.auth.debug('Skipping duplicate fetchUserData — already in progress', { event });
            return;
          }

          // Fetch user data with retry for resilience against transient failures
          fetchInProgressRef.current = true;
          let userData: { profile: Profile; locations: UserLocation[] } | null = null;
          try {
            userData = await withRetry(
              () => fetchUserData(session.user.id),
              {
                maxRetries: AUTH_CONFIG.maxRetries,
                delayMs: AUTH_CONFIG.retryDelayMs,
                operationName: 'fetchUserData (auth event)',
              }
            );
          } catch {
            // withRetry exhausted - userData will be null, handled below
            logger.auth.error('fetchUserData failed after retries', { event });
          } finally {
            fetchInProgressRef.current = false;
          }

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

    // Cross-tab sign-out: detect when auth tokens are removed from storage by another tab
    const handleStorageChange = (e: StorageEvent) => {
      // Supabase stores tokens under keys starting with 'sb-'
      if (e.key?.startsWith('sb-') && e.oldValue && !e.newValue && mountedRef.current) {
        logger.auth.info('Cross-tab sign-out detected');
        setState({
          status: 'unauthenticated',
          user: null,
          profile: null,
          locations: [],
          error: null,
        });
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initialize, fetchUserData]);

  // Actions
  const signOut = useCallback(async () => {
    // Clear local state FIRST — supabase.auth.signOut() can hang on Vercel
    // (promise never settles), so we can't depend on it completing
    clearStayLoggedIn();
    queryClient.clear();
    setState({
      status: 'unauthenticated',
      user: null,
      profile: null,
      locations: [],
      error: null,
    });
    // Best-effort server-side session revocation (fire-and-forget)
    supabase.auth.signOut().catch((error) => {
      logger.auth.warn('signOut server revocation failed', { error });
    });
  }, [queryClient]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!state.user) {
      logger.auth.warn('updateProfile called without user');
      return;
    }

    logger.auth.debug('updateProfile started', { updates: Object.keys(updates) });

    // Save previous state for rollback on error
    const previousProfile = state.profile;

    // Optimistic update
    setState(prev => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...updates } : null,
      error: null,
    }));

    // Prepare database update
    type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
    const dbUpdates: ProfileUpdate = {};
    if (updates.experienceLevel !== undefined) dbUpdates.experience_level = updates.experienceLevel;
    if (updates.goal !== undefined) dbUpdates.goal_preset = updates.goal;
    if (updates.limitations !== undefined) dbUpdates.limitations = updates.limitations || null;
    if (updates.enabledSections !== undefined) {
      dbUpdates.enabled_sections = updates.enabledSections.map(
        s => SECTION_TO_DB[s] || s
      ) as Database['public']['Enums']['section_type'][];
    }
    if (updates.defaultLocationId !== undefined) dbUpdates.default_location_id = updates.defaultLocationId;
    if (updates.onboardingComplete !== undefined) dbUpdates.onboarding_completed = updates.onboardingComplete;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', state.user.id);

    if (error) {
      logger.auth.error('updateProfile failed, rolling back', { error: error.message });
      // Rollback optimistic update on failure
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          profile: previousProfile,
          error: 'Failed to save profile changes',
        }));
      }
      throw error;  // Let caller know it failed
    } else {
      logger.auth.info('updateProfile succeeded');
    }
  }, [state.user, state.profile]);

  const updateLocations = useCallback(async (newLocations: UserLocation[]) => {
    if (!state.user) {
      logger.auth.warn('updateLocations called without user');
      return;
    }

    // Save previous state for rollback on error
    const previousLocations = state.locations;

    const oldIds = new Set(previousLocations.map(l => l.id));
    const newIds = new Set(newLocations.map(l => l.id));

    const toDelete = previousLocations.filter(l => !newIds.has(l.id));
    const toCreate = newLocations.filter(l => !oldIds.has(l.id));
    const toUpdate = newLocations.filter(l => oldIds.has(l.id));

    logger.auth.debug('updateLocations started', {
      toDelete: toDelete.length,
      toCreate: toCreate.length,
      toUpdate: toUpdate.length,
    });

    // Optimistic update
    setState(prev => ({ ...prev, locations: newLocations, error: null }));

    try {
      // Delete removed locations
      for (const oldLoc of toDelete) {
        const { error } = await supabase.from('locations').delete().eq('id', oldLoc.id);
        if (error) throw error;
      }

      // Upsert new/updated locations
      for (const loc of newLocations) {
        const equipmentForDb = loc.equipment.map(e =>
          e.toLowerCase().replace(/ /g, '_').replace(/[()\/]/g, '')
        );

        if (oldIds.has(loc.id)) {
          // Update existing
          const { error } = await supabase
            .from('locations')
            .update({ name: loc.name, tier: loc.tier, equipment: equipmentForDb })
            .eq('id', loc.id);
          if (error) throw error;
        } else {
          // Create new
          const { data, error } = await supabase
            .from('locations')
            .insert({
              user_id: state.user.id,
              name: loc.name,
              tier: loc.tier,
              equipment: equipmentForDb,
            })
            .select('id')
            .single();

          if (error) throw error;

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
      logger.auth.info('updateLocations succeeded');
    } catch (err) {
      logger.auth.error('updateLocations failed, rolling back', { error: err instanceof Error ? err.message : String(err) });
      // Rollback optimistic update on failure
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          locations: previousLocations,
          error: 'Failed to save location changes',
        }));
      }
      throw err;  // Let caller know it failed
    }
  }, [state.user, state.locations]);

  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    if (!state.user) {
      logger.auth.warn('completeOnboarding called without user');
      return;
    }

    logger.auth.info('completeOnboarding started', { userId: state.user.id });
    const startTime = performance.now();

    // Acquire lock to prevent TOKEN_REFRESHED from interfering
    if (operationLockRef.current) {
      const err = `Cannot complete onboarding: ${operationLockRef.current} in progress`;
      logger.auth.error('completeOnboarding lock conflict', { existingLock: operationLockRef.current });
      throw new Error(err);
    }
    operationLockRef.current = 'completeOnboarding';
    logger.auth.debug('Operation lock acquired', { lock: 'completeOnboarding' });

    const equipmentForDb = data.location.equipment.map(e =>
      e.toLowerCase().replace(/ /g, '_').replace(/[()\/]/g, '')
    );
    const enabledSectionsForDb = data.sections.map(s => SECTION_TO_DB[s] || s);

    try {
      // Use atomic RPC to create location + update profile in single transaction
      // This prevents race conditions where TOKEN_REFRESHED could read stale data
      const { data: locationId, error: rpcError } = await supabase.rpc('complete_onboarding', {
        p_user_id: state.user.id,
        p_location_name: data.location.name,
        p_location_tier: data.location.tier,
        p_equipment: equipmentForDb,
        p_experience_level: data.experienceLevel,
        p_goal_preset: data.goal,
        p_sections: enabledSectionsForDb as Database['public']['Enums']['section_type'][],
        p_limitations: data.limitations || undefined,
      });

      if (rpcError) {
        logger.auth.error('completeOnboarding RPC failed', { error: rpcError.message });
        throw rpcError;
      }

      logger.auth.info('completeOnboarding RPC succeeded', {
        locationId,
        durationMs: Math.round(performance.now() - startTime),
      });

      // Update local state with returned location ID
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          profile: {
            onboardingComplete: true,
            experienceLevel: data.experienceLevel,
            goal: data.goal,
            limitations: data.limitations,
            enabledSections: data.sections,
            defaultLocationId: locationId,
          },
          locations: [{
            id: locationId,
            name: data.location.name,
            tier: data.location.tier,
            equipment: data.location.equipment,
          }],
        }));
      }
    } catch (err) {
      logger.auth.error('completeOnboarding exception', {
        error: err instanceof Error ? err.message : String(err),
        durationMs: Math.round(performance.now() - startTime),
      });
      throw err;
    } finally {
      // Always release lock
      operationLockRef.current = null;
      logger.auth.debug('Operation lock released', { lock: 'completeOnboarding' });
    }
  }, [state.user]);

  const refreshAuth = useCallback(async () => {
    initializingRef.current = false;
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
