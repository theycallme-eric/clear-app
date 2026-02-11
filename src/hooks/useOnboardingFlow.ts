import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
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
        description: "You're all set.",
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
