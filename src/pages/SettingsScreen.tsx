import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { CTAButton } from "@/components/CTAButton";
import {
  UserPreferences,
  UserLocation,
  EquipmentTier,
  GoalPreset,
  SectionType,
  EQUIPMENT_BY_TIER,
  SECTIONS_BY_GOAL,
} from "@/types/workout";
import { toast } from "@/components/ui/sonner";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { SettingsHub } from "@/pages/settings/SettingsHub";
import { LocationList, LocationEditor } from "@/pages/settings/LocationSettings";
import { StructureSettings } from "@/pages/settings/StructureSettings";
import { LimitationsSettings } from "@/pages/settings/LimitationsSettings";
import { useAuthContext } from "@/contexts/AuthContext";

type SettingsView =
  | "hub"
  | "locations"
  | "editLocation"
  | "addLocation"
  | "structure"
  | "limitations";

export const SettingsScreen = () => {
  const navigate = useNavigate();
  const { profile, locations, updateProfile, updateLocations, signOut } = useAuthContext();

  // Build preferences from AuthContext
  const userPreferences: UserPreferences = {
    onboardingComplete: profile?.onboardingComplete || false,
    locations,
    defaultLocationId: profile?.defaultLocationId || null,
    experienceLevel: profile?.experienceLevel || null,
    goal: profile?.goal || null,
    sections: profile?.enabledSections || [],
    limitations: profile?.limitations || '',
  };

  const handleSavePreferences = async (newPreferences: UserPreferences) => {
    await updateProfile({
      experienceLevel: newPreferences.experienceLevel,
      goal: newPreferences.goal,
      limitations: newPreferences.limitations,
      enabledSections: newPreferences.sections,
      defaultLocationId: newPreferences.defaultLocationId,
    });
    await updateLocations(newPreferences.locations);
  };

  const [currentView, setCurrentView] = useState<SettingsView>("hub");
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({ ...userPreferences });

  // Location editing state
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [locationName, setLocationName] = useState("");
  const [selectedTier, setSelectedTier] = useState<EquipmentTier>("building");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [equipmentAccordionOpen, setEquipmentAccordionOpen] = useState(false);

  // Structure editing state
  const [selectedGoal, setSelectedGoal] = useState<GoalPreset | null>(preferences.goal);
  const [selectedSections, setSelectedSections] = useState<SectionType[]>([...preferences.sections]);
  const [sectionsAccordionOpen, setSectionsAccordionOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);


  // Limitations editing state
  const [limitations, setLimitations] = useState(preferences.limitations);

  // Handle tier selection
  const handleTierSelect = (tier: EquipmentTier) => {
    setSelectedTier(tier);
    setSelectedEquipment([...EQUIPMENT_BY_TIER[tier]]);
  };

  // Handle equipment toggle
  const handleEquipmentToggle = (equipment: string) => {
    if (equipment === 'Bodyweight') return;
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  // Handle goal selection
  const handleGoalSelect = (goal: GoalPreset) => {
    setSelectedGoal(goal);
    setSelectedSections([...SECTIONS_BY_GOAL[goal]]);
  };

  // Handle section toggle
  const handleSectionToggle = (sectionId: SectionType) => {
    setSelectedSections(prev => {
      const newSections = prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId];

      if (sectionId === 'primary' && prev.includes('primary')) {
        return newSections.filter(s => s !== 'accessory');
      }
      return newSections;
    });
  };

  // Start editing a location
  const startEditLocation = (location: UserLocation) => {
    setEditingLocationId(location.id);
    setLocationName(location.name);
    setSelectedTier(location.tier);
    setSelectedEquipment([...location.equipment]);
    setEquipmentAccordionOpen(false);
    setCurrentView("editLocation");
  };

  // Start adding a new location
  const startAddLocation = () => {
    setEditingLocationId(null);
    setLocationName("");
    setSelectedTier("building");
    setSelectedEquipment([...EQUIPMENT_BY_TIER.building]);
    setEquipmentAccordionOpen(false);
    setCurrentView("addLocation");
  };

  // Save location
  const saveLocation = () => {
    if (!locationName.trim()) {
      toast.error("Please enter a location name");
      return;
    }

    const newLocation: UserLocation = {
      id: editingLocationId || crypto.randomUUID(),
      name: locationName.trim(),
      tier: selectedTier,
      equipment: selectedEquipment,
    };

    let newLocations: UserLocation[];
    if (editingLocationId) {
      newLocations = preferences.locations.map(loc =>
        loc.id === editingLocationId ? newLocation : loc
      );
    } else {
      newLocations = [...preferences.locations, newLocation];
    }

    const updatedPrefs = {
      ...preferences,
      locations: newLocations,
      defaultLocationId: preferences.defaultLocationId || newLocation.id,
    };
    setPreferences(updatedPrefs);
    handleSavePreferences(updatedPrefs);
    toast.success(editingLocationId ? "Location updated" : "Location added");
    setCurrentView("locations");
  };

  // Delete location
  const deleteLocation = () => {
    if (preferences.locations.length <= 1) {
      toast.error("Cannot delete your only location");
      return;
    }

    const newLocations = preferences.locations.filter(loc => loc.id !== editingLocationId);
    const newDefaultId = preferences.defaultLocationId === editingLocationId
      ? newLocations[0]?.id || null
      : preferences.defaultLocationId;

    const updatedPrefs = {
      ...preferences,
      locations: newLocations,
      defaultLocationId: newDefaultId,
    };
    setPreferences(updatedPrefs);
    handleSavePreferences(updatedPrefs);
    toast.success("Location deleted");
    setCurrentView("locations");
  };

  // Set default location
  const setDefaultLocation = (locationId: string) => {
    const updatedPrefs = {
      ...preferences,
      defaultLocationId: locationId,
    };
    setPreferences(updatedPrefs);
    handleSavePreferences(updatedPrefs);
  };

  // Save workout structure
  const saveStructure = () => {
    const updatedPrefs = {
      ...preferences,
      goal: selectedGoal,
      sections: selectedSections,
    };
    setPreferences(updatedPrefs);
    handleSavePreferences(updatedPrefs);
    toast.success("Workout structure updated");
    setCurrentView("hub");
  };

  // Save limitations
  const saveLimitations = () => {
    const updatedPrefs = {
      ...preferences,
      limitations: limitations,
    };
    setPreferences(updatedPrefs);
    handleSavePreferences(updatedPrefs);
    toast.success("Limitations updated");
    setCurrentView("hub");
  };

  // Clear limitations
  const clearLimitations = () => {
    setLimitations("");
  };

  // Navigate back based on current view
  const handleBack = () => {
    switch (currentView) {
      case "hub":
        navigate("/");
        break;
      case "editLocation":
      case "addLocation":
        setCurrentView("locations");
        break;
      default:
        setCurrentView("hub");
    }
  };

  // Get current title
  const getTitle = () => {
    switch (currentView) {
      case "hub": return "Settings";
      case "locations": return "Locations";
      case "editLocation": return "Edit Location";
      case "addLocation": return "Add Location";
      case "structure": return "Workout Structure";
      case "limitations": return "Limitations";
    }
  };

  // Navigate to structure view with fresh state from preferences
  const navigateToStructure = () => {
    setSelectedGoal(preferences.goal);
    setSelectedSections([...preferences.sections]);
    setSectionsAccordionOpen(false);
    setLegendOpen(false);
    setCurrentView("structure");
  };

  // Navigate to limitations view with fresh state from preferences
  const navigateToLimitations = () => {
    setLimitations(preferences.limitations);
    setCurrentView("limitations");
  };

  // Get default location
  const defaultLocation = preferences.locations.find(loc => loc.id === preferences.defaultLocationId);

  const saveFooter = (currentView === "editLocation" || currentView === "addLocation" ||
    currentView === "structure" || currentView === "limitations") ? (
    <div
      className="fixed bottom-0 left-0 right-0 p-4 z-40"
      style={{ background: 'linear-gradient(to top, var(--background), var(--background) 60%, transparent)' }}
    >
      <div className="max-w-md mx-auto">
        <CTAButton
          onClick={() => {
            if (currentView === "editLocation" || currentView === "addLocation") {
              saveLocation();
            } else if (currentView === "structure") {
              saveStructure();
            } else if (currentView === "limitations") {
              saveLimitations();
            }
          }}
          size="lg"
          fullWidth
        >
          Save
        </CTAButton>
      </div>
    </div>
  ) : undefined;

  return (
    <AppLayout
      header={<PageHeader left="back" onBack={handleBack} center={getTitle()} />}
      footer={saveFooter}
    >
      <div className="pt-6 stagger-reveal">
      {currentView === "hub" && (
        <SettingsHub
          preferences={preferences}
          defaultLocation={defaultLocation}
          onNavigateLocations={() => setCurrentView("locations")}
          onNavigateStructure={navigateToStructure}
          onNavigateLimitations={navigateToLimitations}
          onOpenDeveloper={() => navigate("/dev/gallery")}
          onLaunchTestWorkout={() => navigate("/dev/test-workout")}
          onSignOutRequest={() => setShowSignOutConfirm(true)}
        />
      )}

      {currentView === "locations" && (
        <LocationList
          preferences={preferences}
          onSetDefault={setDefaultLocation}
          onEditLocation={startEditLocation}
          onAddLocation={startAddLocation}
        />
      )}

      {(currentView === "editLocation" || currentView === "addLocation") && (
        <LocationEditor
          isEditing={currentView === "editLocation"}
          locationName={locationName}
          onLocationNameChange={setLocationName}
          selectedTier={selectedTier}
          onTierSelect={handleTierSelect}
          selectedEquipment={selectedEquipment}
          onEquipmentToggle={handleEquipmentToggle}
          equipmentAccordionOpen={equipmentAccordionOpen}
          onToggleEquipmentAccordion={() => setEquipmentAccordionOpen(!equipmentAccordionOpen)}
          canDelete={preferences.locations.length > 1}
          onDelete={deleteLocation}
        />
      )}

      {currentView === "structure" && (
        <StructureSettings
          selectedGoal={selectedGoal}
          onGoalSelect={handleGoalSelect}
          selectedSections={selectedSections}
          onSectionToggle={handleSectionToggle}
          sectionsAccordionOpen={sectionsAccordionOpen}
          onToggleSectionsAccordion={() => setSectionsAccordionOpen(!sectionsAccordionOpen)}
          legendOpen={legendOpen}
          onToggleLegend={() => setLegendOpen(!legendOpen)}
        />
      )}

      {currentView === "limitations" && (
        <LimitationsSettings
          limitations={limitations}
          onLimitationsChange={setLimitations}
          onClear={clearLimitations}
        />
      )}

      {showSignOutConfirm && (
        <ConfirmationModal
          title="Sign Out"
          description="Are you sure you want to sign out?"
          confirmLabel="Sign Out"
          onConfirm={() => {
            setShowSignOutConfirm(false);
            signOut();
          }}
          onCancel={() => setShowSignOutConfirm(false)}
        />
      )}
      </div>
    </AppLayout>
  );
};
