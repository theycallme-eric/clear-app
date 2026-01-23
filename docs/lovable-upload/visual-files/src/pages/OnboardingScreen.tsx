import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UserPreferences,
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

interface OnboardingScreenProps {
  onComplete: (preferences: UserPreferences) => void;
}

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

const TIER_OPTIONS: { value: EquipmentTier; label: string; description: string }[] = [
  { value: 'minimal', label: 'Minimal', description: 'Bodyweight, bands, mat' },
  { value: 'home', label: 'Home Gym', description: 'Dumbbells, bench, basics' },
  { value: 'building', label: 'Building Gym', description: 'Rack, barbell, dumbbells' },
  { value: 'full', label: 'Full Gym', description: 'Commercial, everything' },
];

export const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const [step, setStep] = useState<OnboardingStep>(1);

  // Step 1: Equipment/Location
  const [selectedTier, setSelectedTier] = useState<EquipmentTier | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [equipmentAccordionOpen, setEquipmentAccordionOpen] = useState(false);

  // Step 2: Experience Level
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);

  // Step 3: Goals & Structure
  const [goal, setGoal] = useState<GoalPreset | null>(null);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [sectionsAccordionOpen, setSectionsAccordionOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  // Step 4: Limitations
  const [limitations, setLimitations] = useState("");

  // Handle tier selection
  const handleTierSelect = (tier: EquipmentTier) => {
    setSelectedTier(tier);
    setSelectedEquipment([...EQUIPMENT_BY_TIER[tier]]);
  };

  // Handle equipment toggle
  const handleEquipmentToggle = (equipment: string) => {
    if (equipment === 'Bodyweight') return; // Always on
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  // Handle goal selection
  const handleGoalSelect = (selectedGoal: GoalPreset) => {
    setGoal(selectedGoal);
    setSections([...SECTIONS_BY_GOAL[selectedGoal]]);
  };

  // Handle section toggle
  const handleSectionToggle = (sectionId: SectionType) => {
    setSections(prev => {
      const newSections = prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId];

      // If Primary Lift is toggled off, also remove Accessory
      if (sectionId === 'primary' && prev.includes('primary')) {
        return newSections.filter(s => s !== 'accessory');
      }

      return newSections;
    });
  };

  // Navigation
  const handleNext = () => {
    if (step < 5) setStep((step + 1) as OnboardingStep);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as OnboardingStep);
  };

  const handleEditStep = (targetStep: OnboardingStep) => {
    setStep(targetStep);
  };

  // Complete onboarding
  const handleComplete = () => {
    const locationId = crypto.randomUUID();
    const preferences: UserPreferences = {
      onboardingComplete: true,
      locations: [
        {
          id: locationId,
          name: TIER_OPTIONS.find(t => t.value === selectedTier)?.label || 'My Gym',
          tier: selectedTier!,
          equipment: selectedEquipment,
        },
      ],
      defaultLocationId: locationId,
      experienceLevel: experienceLevel!,
      goal: goal!,
      sections: sections,
      limitations: limitations,
    };
    onComplete(preferences);
  };

  // Check if current step is complete
  const canProceed = () => {
    switch (step) {
      case 1: return selectedTier !== null;
      case 2: return experienceLevel !== null;
      case 3: return goal !== null && sections.length > 0;
      case 4: return true; // Limitations is optional
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen grain-overlay">
      <div className="max-w-md mx-auto pb-32">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="p-2 text-foreground/80 hover:text-foreground transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={24} />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <h1 className="font-display text-3xl font-bold tracking-wider text-foreground">
            CLEAR
          </h1>
          <div className="w-10" />
        </header>

        <div className="px-4">
          {/* Step 1: Equipment/Location */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
                What's Your Gym Setup?
              </h2>

              <div className="space-y-3">
                {TIER_OPTIONS.map((tier) => (
                  <button
                    key={tier.value}
                    onClick={() => handleTierSelect(tier.value)}
                    className={cn(
                      "w-full glass-card p-4 text-left transition-all",
                      selectedTier === tier.value
                        ? "border-clear-orange"
                        : "hover:border-clear-orange/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          selectedTier === tier.value
                            ? "border-clear-orange bg-clear-orange"
                            : "border-muted-foreground"
                        )}
                      >
                        {selectedTier === tier.value && (
                          <div className="w-2 h-2 bg-background rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                          {tier.label}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {tier.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Equipment Accordion */}
              {selectedTier && (
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
                          const isAvailable = EQUIPMENT_BY_TIER[selectedTier].includes(equipment);
                          const isSelected = selectedEquipment.includes(equipment);
                          const isBodyweight = equipment === 'Bodyweight';

                          return (
                            <button
                              key={equipment}
                              onClick={() => !isBodyweight && handleEquipmentToggle(equipment)}
                              disabled={isBodyweight}
                              className={cn(
                                "px-3 py-1.5 text-xs font-mono uppercase tracking-wide transition-all",
                                isSelected
                                  ? "bg-clear-lime/20 border border-clear-lime text-clear-lime"
                                  : isAvailable
                                  ? "bg-transparent border border-muted-foreground/30 text-muted-foreground hover:border-clear-orange/50"
                                  : "bg-transparent border border-muted-foreground/20 text-muted-foreground/40 cursor-not-allowed"
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
              )}

              <p className="text-muted-foreground text-sm text-center">
                You can add more locations later
              </p>
            </div>
          )}

          {/* Step 2: Experience Level */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
                How Familiar Are You<br />With the Gym?
              </h2>

              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setExperienceLevel(level.value)}
                    className={cn(
                      "w-full glass-card p-4 text-left transition-all",
                      experienceLevel === level.value
                        ? "border-clear-orange"
                        : "hover:border-clear-orange/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                          experienceLevel === level.value
                            ? "border-clear-orange bg-clear-orange"
                            : "border-muted-foreground"
                        )}
                      >
                        {experienceLevel === level.value && (
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

          {/* Step 3: Goals & Structure */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
                What Are You Going For?
              </h2>

              <div className="space-y-3">
                {GOAL_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handleGoalSelect(preset.value)}
                    className={cn(
                      "w-full glass-card p-4 text-left transition-all",
                      goal === preset.value
                        ? "border-clear-orange"
                        : "hover:border-clear-orange/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          goal === preset.value
                            ? "border-clear-orange bg-clear-orange"
                            : "border-muted-foreground"
                        )}
                      >
                        {goal === preset.value && (
                          <div className="w-2 h-2 bg-background rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                          {preset.label}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Sections Accordion */}
              {goal && (
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
                          const isSelected = sections.includes(section.id);
                          const isAccessory = section.id === 'accessory';
                          const primaryOff = !sections.includes('primary');
                          const isDisabled = isAccessory && primaryOff;

                          return (
                            <button
                              key={section.id}
                              onClick={() => !isDisabled && handleSectionToggle(section.id)}
                              disabled={isDisabled}
                              className={cn(
                                "px-3 py-1.5 text-xs font-mono uppercase tracking-wide transition-all",
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

              <p className="text-muted-foreground text-sm text-center">
                You can change this anytime
              </p>
            </div>
          )}

          {/* Step 4: Limitations */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
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
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
                Here's Your Setup
              </h2>

              {/* Location */}
              <div className="glass-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Location
                    </p>
                    <p className="font-display text-lg font-semibold text-foreground">
                      {TIER_OPTIONS.find(t => t.value === selectedTier)?.label}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {selectedEquipment.slice(0, 5).join(', ')}
                      {selectedEquipment.length > 5 && ` +${selectedEquipment.length - 5} more`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditStep(1)}
                    className="text-clear-orange text-sm hover:text-clear-orange/80 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Experience */}
              <div className="glass-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Experience
                    </p>
                    <p className="font-display text-lg font-semibold text-foreground">
                      {EXPERIENCE_LEVELS.find(l => l.value === experienceLevel)?.label}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditStep(2)}
                    className="text-clear-orange text-sm hover:text-clear-orange/80 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Workout Structure */}
              <div className="glass-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Workout Structure
                    </p>
                    <p className="font-display text-lg font-semibold text-foreground">
                      {GOAL_PRESETS.find(g => g.value === goal)?.label} ({sections.length} sections)
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditStep(3)}
                    className="text-clear-orange text-sm hover:text-clear-orange/80 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Limitations */}
              <div className="glass-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Limitations
                    </p>
                    <p className="font-display text-lg font-semibold text-foreground">
                      {limitations ? `"${limitations.slice(0, 50)}${limitations.length > 50 ? '...' : ''}"` : 'None specified'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditStep(4)}
                    className="text-clear-orange text-sm hover:text-clear-orange/80 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-md mx-auto space-y-3">
            {step === 4 ? (
              <div className="flex gap-3">
                <button
                  onClick={handleNext}
                  className="flex-1 ghost-button py-3 text-sm"
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 glow-button py-3 font-display text-sm font-semibold uppercase tracking-wide disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : step === 5 ? (
              <button
                onClick={handleComplete}
                className="w-full glow-button py-4 font-display text-lg font-semibold uppercase tracking-wide"
              >
                Generate First Workout
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="w-full glow-button py-4 font-display text-lg font-semibold uppercase tracking-wide disabled:opacity-50"
              >
                Next
              </button>
            )}

            <p className="text-center text-muted-foreground text-sm">
              Step {step} of 5
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
