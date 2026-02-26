import { useState } from "react";
import { ArrowLeft, ChevronRight, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { RadioButton } from "@/components/RadioButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPreferences,
  UserLocation,
  EquipmentTier,
  GoalPreset,
  SectionType,
  EQUIPMENT_BY_TIER,
  GOAL_PRESETS,
  WORKOUT_SECTIONS,
  SECTIONS_BY_GOAL,
} from "@/types/workout";
import { toast } from "@/components/ui/sonner";
import { SignOutConfirmModal } from "@/components/SignOutConfirmModal";

interface SettingsScreenProps {
  userPreferences: UserPreferences;
  onSavePreferences: (preferences: UserPreferences) => void;
  onBack: () => void;
  onOpenDeveloper?: () => void;
  onLaunchTestWorkout?: () => void;
  onSignOut: () => void;
}

type SettingsView =
  | "hub"
  | "locations"
  | "editLocation"
  | "addLocation"
  | "structure"
  | "limitations";

const TIER_OPTIONS: { value: EquipmentTier; label: string; description: string }[] = [
  { value: 'minimal', label: 'Minimal', description: 'Bodyweight, bands, mat' },
  { value: 'home', label: 'Home Gym', description: 'Dumbbells, bench, basics' },
  { value: 'building', label: 'Building Gym', description: 'Rack, barbell, dumbbells' },
  { value: 'full', label: 'Full Gym', description: 'Commercial, everything' },
];

export const SettingsScreen = ({
  userPreferences,
  onSavePreferences,
  onBack,
  onOpenDeveloper,
  onLaunchTestWorkout,
  onSignOut,
}: SettingsScreenProps) => {
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
    onSavePreferences(updatedPrefs);
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
    onSavePreferences(updatedPrefs);
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
    onSavePreferences(updatedPrefs);
  };

  // Save workout structure
  const saveStructure = () => {
    const updatedPrefs = {
      ...preferences,
      goal: selectedGoal,
      sections: selectedSections,
    };
    setPreferences(updatedPrefs);
    onSavePreferences(updatedPrefs);
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
    onSavePreferences(updatedPrefs);
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
        onBack();
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

  // Get default location
  const defaultLocation = preferences.locations.find(loc => loc.id === preferences.defaultLocationId);

  return (
    <div className="min-h-screen grain-overlay">
      <div className="max-w-md mx-auto pb-32">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4">
          <button
            onClick={handleBack}
            className="p-2 text-foreground/80 hover:text-foreground transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-heading-h4 font-bold tracking-wider text-foreground uppercase">
            {getTitle()}
          </h1>
          <div className="w-10" />
        </header>

        <div className="px-4">
          {/* Settings Hub */}
          {currentView === "hub" && (
            <div className="space-y-6">
              {/* Workout Setup Section */}
              <div>
                <p className="text-label-xs uppercase tracking-widest text-muted-foreground mb-3">
                  Workout Setup
                </p>
                <div className="space-y-2">
                  {/* Locations */}
                  <Card onClick={() => setCurrentView("locations")} padding="md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-label-sm text-foreground uppercase">
                          Locations / Equipment
                        </p>
                        <p className="text-muted-foreground text-paragraph-sm mt-0.5">
                          {defaultLocation?.name || "Not set"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Card>

                  {/* Workout Structure */}
                  <Card
                    onClick={() => {
                      setSelectedGoal(preferences.goal);
                      setSelectedSections([...preferences.sections]);
                      setSectionsAccordionOpen(false);
                      setLegendOpen(false);
                      setCurrentView("structure");
                    }}
                    padding="md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-label-sm text-foreground uppercase">
                          Workout Structure
                        </p>
                        <p className="text-muted-foreground text-paragraph-sm mt-0.5">
                          {GOAL_PRESETS.find(g => g.value === preferences.goal)?.label || "Not set"} • {preferences.sections.length} sections
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Card>

                  {/* Limitations */}
                  <Card
                    onClick={() => {
                      setLimitations(preferences.limitations);
                      setCurrentView("limitations");
                    }}
                    padding="md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-label-sm text-foreground uppercase">
                          Limitations
                        </p>
                        <p className="text-muted-foreground text-paragraph-sm mt-0.5 truncate max-w-[250px]">
                          {preferences.limitations ? `"${preferences.limitations.slice(0, 30)}${preferences.limitations.length > 30 ? '...' : ''}"` : "None set"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Card>
                </div>
              </div>

              {/* About Section */}
              <div>
                <p className="text-label-xs uppercase tracking-widest text-muted-foreground mb-3">
                  About
                </p>
                <div className="space-y-2">
                  <Card onClick={() => toast.info("Feedback form coming soon!")} padding="md">
                    <div className="flex items-center justify-between">
                      <p className="text-label-sm text-foreground uppercase">
                        Send Feedback
                      </p>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Card>

                  <Card padding="md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-label-sm text-foreground uppercase">
                          About Clear
                        </p>
                        <p className="text-muted-foreground text-paragraph-sm mt-0.5">
                          Version 1.0.0
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Developer Section */}
              {(onOpenDeveloper || onLaunchTestWorkout) && (
                <div>
                  <p className="text-label-xs uppercase tracking-widest text-muted-foreground mb-3">
                    Developer
                  </p>
                  <div className="space-y-2">
                    {onOpenDeveloper && (
                      <Card onClick={onOpenDeveloper} padding="md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-label-sm text-foreground uppercase">
                              Component Gallery
                            </p>
                            <p className="text-muted-foreground text-paragraph-sm mt-0.5">
                              Audit design system components
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </Card>
                    )}
                    {onLaunchTestWorkout && (
                      <Card onClick={onLaunchTestWorkout} padding="md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-label-sm text-foreground uppercase">
                              Test Workout
                            </p>
                            <p className="text-muted-foreground text-paragraph-sm mt-0.5">
                              All structure types in one session
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Sign Out */}
              <div
                className="pt-4"
                style={{ '--text-cta': 'var(--color-red-400)', '--text-cta-hover': 'var(--color-red-300)' } as React.CSSProperties}
              >
                <CTAButton
                  onClick={() => setShowSignOutConfirm(true)}
                  variant="secondary"
                  size="md"
                  fullWidth
                >
                  Sign Out
                </CTAButton>
              </div>
            </div>
          )}

          {/* Locations List */}
          {currentView === "locations" && (
            <div className="space-y-4">
              <Card cornerSize="md" padding="md">
                <p className="text-label-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Default Location
                </p>
                <div className="flex flex-col gap-2">
                  {preferences.locations.map((location) => {
                    // Filter out Bodyweight and take first 3 items for display
                    const displayEquipment = location.equipment
                      .filter(e => e !== 'Bodyweight')
                      .slice(0, 3);
                    const remainingCount = location.equipment.length - displayEquipment.length - (location.equipment.includes('Bodyweight') ? 1 : 0);
                    const equipmentDesc = displayEquipment.join(', ') +
                      (remainingCount > 0 ? ` +${remainingCount} more` : '');

                    return (
                      <RadioButton
                        key={location.id}
                        selected={preferences.defaultLocationId === location.id}
                        onClick={() => setDefaultLocation(location.id)}
                        label={location.name}
                        description={equipmentDesc}
                        className="w-full"
                        onEdit={() => startEditLocation(location)}
                      />
                    );
                  })}
                </div>
              </Card>

              <Card onClick={startAddLocation} padding="md" className="text-center">
                <span className="text-label-sm" style={{ color: 'var(--icon-cta)' }}>
                  + Add Location
                </span>
              </Card>
            </div>
          )}

          {/* Edit/Add Location */}
          {(currentView === "editLocation" || currentView === "addLocation") && (
            <div className="space-y-6">
              <Card cornerSize="md" padding="md">
                {/* Location Name */}
                <div className="space-y-2 mb-6">
                  <label className="block text-paragraph-sm text-foreground">
                    Location Name
                  </label>
                  <Input
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="My Gym"
                  />
                </div>

                {/* Equipment Type */}
                <div className="mb-4">
                  <p className="text-label-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Equipment Type
                  </p>
                  <div className="flex flex-col gap-2">
                    {TIER_OPTIONS.map((tier) => (
                      <RadioButton
                        key={tier.value}
                        selected={selectedTier === tier.value}
                        onClick={() => handleTierSelect(tier.value)}
                        label={tier.label}
                        description={tier.description}
                        className="w-full"
                      />
                    ))}
                  </div>
                </div>

                {/* Customize Equipment Accordion */}
                <div className="pt-4 -mx-4 px-4" style={{ borderTop: '2px solid var(--border-spacer)' }}>
                  <button
                    onClick={() => setEquipmentAccordionOpen(!equipmentAccordionOpen)}
                    className="w-full flex items-center justify-between"
                  >
                    <span className="text-cta-sm font-medium text-foreground">
                      Customize Equipment
                    </span>
                    {equipmentAccordionOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  {equipmentAccordionOpen && (
                    <div className="pt-4">
                      <div className="flex flex-wrap gap-2">
                        {EQUIPMENT_BY_TIER.full.map((equipment) => {
                          const isSelected = selectedEquipment.includes(equipment);
                          const isBodyweight = equipment === 'Bodyweight';

                          return (
                            <Chip
                              key={equipment}
                              variant="selectable"
                              selected={isSelected}
                              onClick={() => handleEquipmentToggle(equipment)}
                              disabled={isBodyweight}
                            >
                              {equipment}
                            </Chip>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Delete Location (only for editing existing) */}
              {currentView === "editLocation" && preferences.locations.length > 1 && (
                <CTAButton
                  onClick={deleteLocation}
                  variant="secondary"
                  size="md"
                  fullWidth
                  className="[--btn-text:theme(colors.rose.500)]"
                >
                  Delete Location
                </CTAButton>
              )}
            </div>
          )}

          {/* Workout Structure */}
          {currentView === "structure" && (
            <div className="space-y-6">
              <Card cornerSize="md" padding="md">
                {/* Goal Selection */}
                <div className="mb-4">
                  <p className="text-label-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Goal
                  </p>
                  <div className="flex flex-col gap-2">
                    {GOAL_PRESETS.map((preset) => (
                      <RadioButton
                        key={preset.value}
                        selected={selectedGoal === preset.value}
                        onClick={() => handleGoalSelect(preset.value)}
                        label={preset.label}
                        description={preset.description}
                        className="w-full"
                      />
                    ))}
                  </div>
                </div>

                {/* Sections Accordion */}
                {selectedGoal && (
                  <div className="pt-4 -mx-4 px-4" style={{ borderTop: '2px solid var(--border-spacer)' }}>
                    <button
                      onClick={() => setSectionsAccordionOpen(!sectionsAccordionOpen)}
                      className="w-full flex items-center justify-between"
                    >
                      <span className="text-cta-sm font-medium text-foreground">
                        Customize Sections
                      </span>
                      {sectionsAccordionOpen ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>

                    {sectionsAccordionOpen && (
                      <div className="pt-4 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {WORKOUT_SECTIONS.map((section) => {
                          const isSelected = selectedSections.includes(section.id);
                          const isAccessory = section.id === 'accessory';
                          const primaryOff = !selectedSections.includes('primary');
                          const isDisabled = isAccessory && primaryOff;

                          return (
                            <button
                              key={section.id}
                              onClick={() => !isDisabled && handleSectionToggle(section.id)}
                              disabled={isDisabled}
                              className={cn(
                                "px-2 py-1 text-label-xs uppercase tracking-wide transition-all",
                                isSelected
                                  ? "border text-[var(--text-label-selected)] border-[var(--border-chip-selected)] bg-[var(--color-green-alpha-200)]"
                                  : isDisabled
                                  ? "bg-transparent border border-muted-foreground/20 text-muted-foreground/40 cursor-not-allowed"
                                  : "bg-transparent border border-muted-foreground/30 text-muted-foreground hover:border-[var(--border-chip)]"
                              )}
                            >
                              {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                              {section.name}
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <button
                        onClick={() => setLegendOpen(!legendOpen)}
                        className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>What do these mean?</span>
                        {legendOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {legendOpen && (
                        <div className="space-y-3 pt-2" style={{ borderTop: '2px solid var(--border-spacer)' }}>
                          {WORKOUT_SECTIONS.map((section) => (
                            <div key={section.id}>
                              <p className="text-label-xs uppercase tracking-wide" style={{ color: 'var(--text-card-label)' }}>
                                {section.name}
                              </p>
                              <p className="text-muted-foreground text-paragraph-sm">
                                {section.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Limitations */}
          {currentView === "limitations" && (
            <div className="space-y-6">
              <Card cornerSize="md" padding="md">
                <div className="mb-4">
                  <h2 className="text-heading-h4 font-bold uppercase tracking-wider text-foreground">
                    Anything We Should<br />Work Around?
                  </h2>
                  <p className="text-muted-foreground text-paragraph-sm mt-2">
                    Old injuries, problem areas, or movements you want to avoid.
                  </p>
                </div>

                <Textarea
                  value={limitations}
                  onChange={(e) => setLimitations(e.target.value)}
                  placeholder="Bad left shoulder from years ago. Overhead press feels sketchy sometimes."
                  className="min-h-[120px]"
                />
              </Card>

              {limitations && (
                <CTAButton
                  onClick={clearLimitations}
                  variant="secondary"
                  size="sm"
                  fullWidth
                >
                  Clear All
                </CTAButton>
              )}
            </div>
          )}
        </div>

        {/* Fixed Bottom Save Button */}
        {(currentView === "editLocation" || currentView === "addLocation" ||
          currentView === "structure" || currentView === "limitations") && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
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
        )}
      </div>

      {showSignOutConfirm && (
        <SignOutConfirmModal
          onConfirm={() => {
            setShowSignOutConfirm(false);
            onSignOut();
          }}
          onCancel={() => setShowSignOutConfirm(false)}
        />
      )}
    </div>
  );
};
