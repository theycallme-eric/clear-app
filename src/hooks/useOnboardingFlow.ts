import { useState, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { logger } from '@/lib/logger';
import { UserPreferences } from '@/types/workout';

export const useOnboardingFlow = (onSuccess: () => void) => {
  const { completeOnboarding } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const handleOnboardingComplete = async (preferences: UserPreferences) => {
    // Synchronous guard — useState alone can't prevent double-clicks
    // because React batches state updates
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

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
        description: "You're all set.",
      });

      onSuccess();
    } catch (err) {
      logger.auth.error('Onboarding error', { error: err instanceof Error ? err.message : String(err) });
      toast.error('Something went wrong', {
        description: 'Please try again.',
      });
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return { handleOnboardingComplete, isSubmitting };
};
