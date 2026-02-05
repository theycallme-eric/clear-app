import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserPreferences } from "@/types/workout";

export const usePreferencesSync = (
    userPreferences: UserPreferences,
    setUserPreferences: (prefs: UserPreferences | ((prev: UserPreferences) => UserPreferences)) => void
) => {

    const handleSavePreferences = async (newPreferences: UserPreferences) => {
        const oldPreferences = userPreferences;
        setUserPreferences(newPreferences);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // 1. Handle location changes FIRST (before profile update, since profile references location_id)
            const oldLocationIds = new Set(oldPreferences.locations.map(l => l.id));
            const newLocationIds = new Set(newPreferences.locations.map(l => l.id));
            let resolvedDefaultLocationId = newPreferences.defaultLocationId;

            // Deleted locations
            for (const oldLoc of oldPreferences.locations) {
                if (!newLocationIds.has(oldLoc.id)) {
                    await supabase.from('locations').delete().eq('id', oldLoc.id);
                }
            }

            // New or updated locations
            for (const newLoc of newPreferences.locations) {
                const equipmentForDb = newLoc.equipment.map(e =>
                    e.toLowerCase().replace(/ /g, '_').replace(/[()\/]/g, '')
                );

                if (oldLocationIds.has(newLoc.id)) {
                    // Update existing
                    const oldLoc = oldPreferences.locations.find(l => l.id === newLoc.id);
                    if (oldLoc && (oldLoc.name !== newLoc.name || oldLoc.tier !== newLoc.tier ||
                        JSON.stringify(oldLoc.equipment) !== JSON.stringify(newLoc.equipment))) {
                        await supabase
                            .from('locations')
                            .update({
                                name: newLoc.name,
                                tier: newLoc.tier,
                                equipment: equipmentForDb,
                            })
                            .eq('id', newLoc.id);
                    }
                } else {
                    // Create new location (or update if name already exists)
                    // Uses upsert to handle edge cases where location name already exists
                    const { data: created } = await supabase
                        .from('locations')
                        .upsert({
                            user_id: user.id,
                            name: newLoc.name,
                            tier: newLoc.tier,
                            equipment: equipmentForDb,
                            is_default: newPreferences.defaultLocationId === newLoc.id,
                        }, {
                            onConflict: 'user_id,name',
                            ignoreDuplicates: false, // Update existing if found
                        })
                        .select('id')
                        .single();

                    // Replace client-side UUID with real database ID
                    if (created) {
                        if (resolvedDefaultLocationId === newLoc.id) {
                            resolvedDefaultLocationId = created.id;
                        }
                        setUserPreferences(prev => ({
                            ...prev,
                            locations: prev.locations.map(l =>
                                l.id === newLoc.id ? { ...l, id: created.id } : l
                            ),
                            defaultLocationId: prev.defaultLocationId === newLoc.id
                                ? created.id
                                : prev.defaultLocationId,
                        }));
                    }
                }
            }

            // Update default location flag in locations table
            if (newPreferences.defaultLocationId !== oldPreferences.defaultLocationId) {
                await supabase
                    .from('locations')
                    .update({ is_default: false })
                    .eq('user_id', user.id)
                    .neq('id', resolvedDefaultLocationId || '');

                if (resolvedDefaultLocationId) {
                    await supabase
                        .from('locations')
                        .update({ is_default: true })
                        .eq('id', resolvedDefaultLocationId);
                }
            }

            // 2. Update profile fields (after locations exist in DB)
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
            const enabledSectionsForDb = newPreferences.sections.map(s => sectionTypeMap[s] || s);

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    experience_level: newPreferences.experienceLevel,
                    goal_preset: newPreferences.goal,
                    limitations: newPreferences.limitations || null,
                    enabled_sections: enabledSectionsForDb,
                    default_location_id: resolvedDefaultLocationId,
                })
                .eq('id', user.id);

            if (profileError) {
                console.error('Profile update error:', profileError);
            }
        } catch (err) {
            console.error('Error saving preferences:', err);
            toast.error('Failed to save some settings');
        }
    };

    return { handleSavePreferences };
};
