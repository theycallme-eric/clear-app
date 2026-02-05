import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthState {
    isLoading: boolean;
    isAuthenticated: boolean;
    onboardingComplete: boolean | null;
    userId: string | null;
    error: string | null;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        isLoading: true,
        isAuthenticated: false,
        onboardingComplete: null,
        userId: null,
        error: null,
    });

    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            try {
                // Create a timeout promise to prevent hanging indefinitely
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Auth check timed out')), 10000);
                });

                // Race the session check against the timeout
                const sessionPromise = supabase.auth.getSession();

                // @ts-ignore - Promise.race types can be tricky with different return types
                const result = await Promise.race([sessionPromise, timeoutPromise]) as any;

                // Handle timeout or other errors thrown
                if (!mounted) return;

                const { data: { session }, error: sessionError } = result;

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    // Don't show toast for "Auth session missing!" style errors which are common when not logged in
                    if (!sessionError.message.includes('Auth session missing')) {
                        toast.error("Connection issue", { description: "Please check your network and try again." });
                    }
                    setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, error: sessionError.message }));
                    return;
                }

                if (!session) {
                    setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
                    return;
                }

                // User is authenticated, check onboarding status
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("onboarding_completed")
                    .eq("id", session.user.id)
                    .single();

                if (profileError) {
                    console.error('Profile fetch error:', profileError);
                    setAuthState({
                        isLoading: false,
                        isAuthenticated: true,
                        onboardingComplete: false, // Default to false so they go to onboarding and logic can handle it
                        userId: session.user.id,
                        error: profileError.message
                    });
                    return;
                }

                setAuthState({
                    isLoading: false,
                    isAuthenticated: true,
                    onboardingComplete: profile?.onboarding_completed ?? false,
                    userId: session.user.id,
                    error: null
                });

            } catch (err) {
                console.error('Auth check failed:', err);
                // If it's a timeout or network abort, fail gracefully to "Not Authenticated"
                // so the user can at least see the Welcome Screen and try to Sign In manually.
                if (mounted) {
                    setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, error: "Auth check failed" }));
                }
            }
        };

        checkAuth();

        // Auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                if (event === 'SIGNED_OUT') {
                    setAuthState({
                        isLoading: false,
                        isAuthenticated: false,
                        onboardingComplete: null,
                        userId: null,
                        error: null,
                    });
                } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    if (session?.user) {
                        // Check profile again on sign in
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("onboarding_completed")
                            .eq("id", session.user.id)
                            .single();

                        // If unmounted during await
                        if (!mounted) return;

                        setAuthState({
                            isLoading: false,
                            isAuthenticated: true,
                            onboardingComplete: profile?.onboarding_completed ?? false,
                            userId: session.user.id,
                            error: null
                        });
                    }
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return authState;
}
