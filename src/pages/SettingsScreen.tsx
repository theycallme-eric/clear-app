import { useState } from "react";
import { ArrowLeft, ChevronRight, ChevronDown, ChevronUp, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UserPreferences,
  UserLocation,
  EquipmentTier,
  ExperienceLevel,
  GoalPreset,
  SectionType,
  EQUIPMENT_BY_TIER,
  EXPERIENCE_LEVELS,
  GOAL_PRESETS,
  WORKOUT_SECTIONS,
  SECTIONS_BY_GOAL,
} from "@/types/workout";
import { toast } from "sonner";

interface SettingsScreenProps {
  userPreferences: UserPreferences;
  onSavePreferences: (preferences: UserPreferences) => void;
  onBack: () => void;
}

type SettingsView =
  | "hub"
  | "locations"
  | "editLocation"
  | "addLocation"
  | "experience"
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
}: SettingsScreenProps) => {
  const [currentView, setCurrentView] = useState<SettingsView>("hub");
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

  // Experience editing state
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel | null>(preferences.experienceLevel);

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

  // Save experience level
  const saveExperience = () => {
    const updatedPrefs = {
      ...preferences,
      experienceLevel: selectedExperience,
    };
    setPreferences(updatedPrefs);
    onSavePreferences(updatedPrefs);
    toast.success("Experience level updated");
    setCurrentView("hub");
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
      case "experience": return "Experience Level";
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
          <h1 className="font-display text-xl font-bold tracking-wider text-foreground uppercase">
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
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                  Workout Setup
                </p>
                <div className="space-y-2">
                  {/* Locations */}
                  <button
                    onClick={() => setCurrentView("locations")}
                    className="w-full glass-card p-4 text-left hover:border-clear-orange/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-sm font-semibold text-foreground">
                          Locations / Equipment
                        </p>
                        <p className="text-muted-foreground text-sm mt-0.5">
                          {defaultLocation?.name || "Not set"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>

                  {/* Experience Level */}
                  <button
                    onClick={() => {
                      setSelectedExperience(preferences.experienceLevel);
                      setCurrentView("experience");
                    }}
                    className="w-full glass-card p-4 text-left hover:border-clear-orange/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-sm font-semibold text-foreground">
                          Experience Level
                        </p>
                        <p className="text-muted-foreground text-sm mt-0.5">
                          {EXPERIENCE_LEVELS.find(l => l.value === preferences.experienceLevel)?.label || "Not set"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>

                  {/* Workout Structure */}
                  <button
                    onClick={() => {
                      setSelectedGoal(preferences.goal);
                      setSelectedSections([...preferences.sections]);
                      setSectionsAccordionOpen(false);
                      setLegendOpen(false);
                      setCurrentView("structure");
                    }}
                    className="w-full glass-card p-4 text-left hover:border-clear-orange/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-sm font-semibold text-foreground">
                          Workout Structure
                        </p>
                        <p className="text-muted-foreground text-sm mt-0.5">
                          {GOAL_PRESETS.find(g => g.value === preferences.goal)?.label || "Not set"} • {preferences.sections.length} sections
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>

                  {/* Limitations */}
                  <button
                    onClick={() => {
                      setLimitations(preferences.limitations);
                      setCurrentView("limitations");
                    }}
                    className="w-full glass-card p-4 text-left hover:border-clear-orange/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-sm font-semibold text-foreground">
                          Limitations
                        </p>
                        <p className="text-muted-foreground text-sm mt-0.5 truncate max-w-[250px]">
                          {preferences.limitations ? `"${preferences.limitations.slice(0, 30)}${preferences.limitations.length > 30 ? '...' : ''}"` : "None set"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>
                </div>
              </div>

              {/* About Section */}
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                  About
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => toast.info("Feedback form coming soon!")}
                    className="w-full glass-card p-4 text-left hover:border-clear-orange/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-sm font-semibold text-foreground">
                        Send Feedback
                      </p>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>

                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-sm font-semibold text-foreground">
                          About Clear
                        </p>
                        <p className="text-muted-foreground text-sm mt-0.5">
                          Version 1.0.0
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Locations List */}
          {currentView === "locations" && (
            <div className="space-y-4">
              {preferences.locations.map((location) => (
                <div key={location.id} className="glass-card p-4">
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => setDefaultLocation(location.id)}
                      className="flex items-start gap-3 flex-1 text-left"
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                          preferences.defaultLocationId === location.id
                            ? "border-clear-orange bg-clear-orange"
                            : "border-muted-foreground"
                        )}
                      >
                        {preferences.defaultLocationId === location.id && (
                          <div className="w-2 h-2 bg-background rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-foreground">
                          {location.name}
                        </p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {location.equipment.slice(0, 4).join(', ')}
                          {location.equipment.length > 4 && ` +${location.equipment.length - 4} more`}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => startEditLocation(location)}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={startAddLocation}
                className="w-full glass-card p-4 text-center hover:border-clear-orange/60 transition-all"
              >
                <span className="font-display text-sm font-semibold text-clear-orange">
                  + Add Location
                </span>
              </button>
            </div>
          )}

          {/* Edit/Add Location */}
          {(currentView === "editLocation" || currentView === "addLocation") && (
            <div className="space-y-6">
              {/* Location Name */}
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Location Name
                </p>
                <div className="glass-card p-4">
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="My Gym"
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Equipment Type */}
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Equipment Type
                </p>
                <div className="space-y-2">
                  {TIER_OPTIONS.map((tier) => (
                    <button
                      key={tier.value}
                      onClick={() => handleTierSelect(tier.value)}
                      className={cn(
                        "w-full glass-card p-3 text-left transition-all",
                        selectedTier === tier.value
                          ? "border-clear-orange"
                          : "hover:border-clear-orange/40"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                            selectedTier === tier.value
                              ? "border-clear-orange bg-clear-orange"
                              : "border-muted-foreground"
                          )}
                        >
                          {selectedTier === tier.value && (
                            <div className="w-1.5 h-1.5 bg-background rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                            {tier.label}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {tier.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment Accordion */}
              <div className="glass-card">
                <button
                  onClick={() => setEquipmentAccordionOpen(!equipmentAccordionOpen)}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                    Customize Equipment
                  </span>
                  {equipmentAccordionOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {equipmentAccordionOpen && (
                  <div className="px-4 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {EQUIPMENT_BY_TIER.full.map((equipment) => {
                        const isSelected = selectedEquipment.includes(equipment);
                        const isBodyweight = equipment === 'Bodyweight';

                        return (
                          <button
                            key={equipment}
                            onClick={() => !isBodyweight && handleEquipmentToggle(equipment)}
                            disabled={isBodyweight}
                            className={cn(
                              "px-2 py-1 text-xs font-mono uppercase tracking-wide transition-all",
                              isSelected
                                ? "bg-clear-lime/20 border border-clear-lime text-clear-lime"
                                : "bg-transparent border border-muted-foreground/30 text-muted-foreground hover:border-clear-orange/50"
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                            {equipment}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Delete Location (only for editing existing) */}
              {currentView === "editLocation" && preferences.locations.length > 1 && (
                <button
                  onClick={deleteLocation}
                  className="w-full ghost-button py-3 text-sm text-rose-500 border-rose-500/50 hover:border-rose-500"
                >
                  Delete Location
                </button>
              )}
            </div>
          )}

          {/* Experience Level */}
          {currentView === "experience" && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
                How Familiar Are You<br />With the Gym?
              </h2>

              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSelectedExperience(level.value)}
                    className={cn(
                      "w-full glass-card p-4 text-left transition-all",
                      selectedExperience === level.value
                        ? "border-clear-orange"
                        : "hover:border-clear-orange/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                          selectedExperience === level.value
                            ? "border-clear-orange bg-clear-orange"
                            : "border-muted-foreground"
                        )}
                      >
                        {selectedExperience === level.value && (
                          <div className="w-2 h-2 bg-background rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                          {level.label}
                        </p>
                        <p className="text-muted-foreground text-sm mt-1">
                          {level.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Workout Structure */}
          {currentView === "structure" && (
            <div className="space-y-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                  Goal
                </p>
                <div className="space-y-2">
                  {GOAL_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handleGoalSelect(preset.value)}
                      className={cn(
                        "w-full glass-card p-3 text-left transition-all",
                        selectedGoal === preset.value
                          ? "border-clear-orange"
                          : "hover:border-clear-orange/40"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                            selectedGoal === preset.value
                              ? "border-clear-orange bg-clear-orange"
                              : "border-muted-foreground"
                          )}
                        >
                          {selectedGoal === preset.value && (
                            <div className="w-1.5 h-1.5 bg-background rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                            {preset.label}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {preset.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sections Accordion */}
              {selectedGoal && (
                <div className="glass-card">
                  <button
                    onClick={() => setSectionsAccordionOpen(!sectionsAccordionOpen)}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                      Customize Sections
                    </span>
                    {sectionsAccordionOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  {sectionsAccordionOpen && (
                    <div className="px-4 pb-4 space-y-4">
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
                                "px-2 py-1 text-xs font-mono uppercase tracking-wide transition-all",
                                isSelected
                                  ? "bg-clear-lime/20 border border-clear-lime text-clear-lime"
                                  : isDisabled
                                  ? "bg-transparent border border-muted-foreground/20 text-muted-foreground/40 cursor-not-allowed"
                                  : "bg-transparent border border-muted-foreground/30 text-muted-foreground hover:border-clear-orange/50"
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
                        <div className="space-y-3 pt-2 border-t border-muted-foreground/20">
                          {WORKOUT_SECTIONS.map((section) => (
                            <div key={section.id}>
                              <p className="font-mono text-xs uppercase tracking-wide text-clear-orange">
                                {section.name}
                              </p>
                              <p className="text-muted-foreground text-sm">
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
            </div>
          )}

          {/* Limitations */}
          {currentView === "limitations" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
                  Anything We Should<br />Work Around?
                </h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Old injuries, problem areas, or movements you want to avoid.
                </p>
              </div>

              <div className="glass-card p-4">
                <textarea
                  value={limitations}
                  onChange={(e) => setLimitations(e.target.value)}
                  placeholder="Bad left shoulder from years ago. Overhead press feels sketchy sometimes."
                  className="w-full h-32 bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none"
                />
              </div>

              {limitations && (
                <button
                  onClick={clearLimitations}
                  className="w-full ghost-button py-2 text-sm"
                >
                  Clear All
                </button>
              )}
            </div>
          )}
        </div>

        {/* Fixed Bottom Save Button */}
        {(currentView === "editLocation" || currentView === "addLocation" ||
          currentView === "experience" || currentView === "structure" ||
          currentView === "limitations") && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
            <div className="max-w-md mx-auto">
              <button
                onClick={() => {
                  if (currentView === "editLocation" || currentView === "addLocation") {
                    saveLocation();
                  } else if (currentView === "experience") {
                    saveExperience();
                  } else if (currentView === "structure") {
                    saveStructure();
                  } else if (currentView === "limitations") {
                    saveLimitations();
                  }
                }}
                className="w-full glow-button py-4 font-display text-lg font-semibold uppercase tracking-wide"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
