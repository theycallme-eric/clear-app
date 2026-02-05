import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserPreferences } from "@/types/workout";

export const useOnboardingFlow = (onSuccess: () => void) => {
    const handleOnboardingComplete = async (preferences: UserPreferences) => {
        // Optimistically update local state if needed (passed via onSuccess or similar)
        // but here we primarily care about the async save

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Not authenticated");
            return;
        }

        try {
            // 1. Create the location with equipment
            const locationData = preferences.locations[0];
            if (locationData) {
                // Convert equipment names to snake_case for database
                const equipmentForDb = locationData.equipment.map(e =>
                    e.toLowerCase().replace(/ /g, '_').replace(/[()\/]/g, '')
                );

                // Use upsert to handle edge cases where location already exists
                // (e.g., if onboarding runs twice due to navigation issues)
                const { data: newLocation, error: locationError } = await supabase
                    .from("locations")
                    .upsert({
                        user_id: user.id,
                        name: locationData.name,
                        tier: locationData.tier,
                        equipment: equipmentForDb,
                        is_default: true,
                    }, {
                        onConflict: 'user_id,name',
                        ignoreDuplicates: false, // Update existing if found
                    })
                    .select("id")
                    .single();

                if (locationError) {
                    console.error("Failed to create location:", locationError);
                    toast.error("Failed to save location");
                    return;
                }

                // 2. Map frontend section types to database section types
                const sectionTypeMap: Record<string, string> = {
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
                const enabledSectionsForDb = preferences.sections.map(s => sectionTypeMap[s] || s);

                // 3. Update profile with preferences and default location
                const { error: profileError } = await supabase
                    .from("profiles")
                    .update({
                        onboarding_completed: true,
                        experience_level: preferences.experienceLevel,
                        goal_preset: preferences.goal,
                        limitations: preferences.limitations || null,
                        enabled_sections: enabledSectionsForDb,
                        default_location_id: newLocation.id,
                    })
                    .eq("id", user.id);

                if (profileError) {
                    console.error("Failed to update profile:", profileError);
                    toast.error("Failed to save preferences");
                    return;
                }

                // Determine if we should update local state here or let the parent do it.
                // The original code called setUserPreferences inside this function.
                // For now, we will assume strict separation and return the new location ID 
                // if the caller needs it, but here we just trigger success.

                // Pass the new location ID back to the caller in case it needs to update local state immediately
                onSuccess();
            }

            toast.success("Setup complete!", {
                description: "Let's generate your first workout.",
            });

        } catch (err) {
            console.error("Onboarding error:", err);
            toast.error("Something went wrong", {
                description: "Please try again.",
            });
        }
    };

    return {
        handleOnboardingComplete
    };
};
