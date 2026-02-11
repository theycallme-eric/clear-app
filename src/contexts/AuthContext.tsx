import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { UserLocation, SectionType, ExperienceLevel, GoalPreset, EquipmentTier } from '@/types/workout';

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
        tier: loc.tier as EquipmentTier,
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
      // Timeout after 5 seconds to prevent infinite loading
      const timeoutPromise = new Promise<{ data: { session: null }, error: { message: string } }>((resolve) => {
        setTimeout(() => resolve({
          data: { session: null },
          error: { message: 'Auth initialization timed out' }
        }), 5000);
      });

      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        timeoutPromise,
      ]);

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
        .upsert({
          user_id: state.user.id,
          name: data.location.name,
          tier: data.location.tier,
          equipment: equipmentForDb,
          is_default: true,
        }, {
          onConflict: 'user_id,name',
          ignoreDuplicates: false,
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
            tier: data.location.tier,
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
