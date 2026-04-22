import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { OnboardingLayout } from "@/layouts";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { RadioButton } from "@/components/RadioButton";
import { Chip } from "@/components/Chip";
import { Textarea } from "@/components/ui/textarea";
import {
  EquipmentTier,
  SectionType,
  EQUIPMENT_BY_TIER,
  WORKOUT_SECTIONS,
  SECTIONS_BY_GOAL,
} from "@/types/workout";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";

type OnboardingStep = 1 | 2 | 3 | 4;

const TIER_OPTIONS: { value: EquipmentTier; label: string; description: string }[] = [
  { value: 'minimal', label: 'Minimal', description: 'Bodyweight, bands, mat' },
  { value: 'home', label: 'Home Gym', description: 'Dumbbells, bench, basics' },
  { value: 'building', label: 'Building Gym', description: 'Rack, barbell, dumbbells' },
  { value: 'full', label: 'Full Gym', description: 'Commercial, everything' },
];

// Default sections for new users (balanced preset)
const DEFAULT_SECTIONS: SectionType[] = SECTIONS_BY_GOAL.balanced;

export const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { handleOnboardingComplete } = useOnboardingFlow(() => navigate("/"));
  const [step, setStep] = useState<OnboardingStep>(1);

  // Step 1: Equipment/Location
  const [selectedTier, setSelectedTier] = useState<EquipmentTier | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [equipmentAccordionOpen, setEquipmentAccordionOpen] = useState(false);

  // Step 2: Sections
  const [sections, setSections] = useState<SectionType[]>([...DEFAULT_SECTIONS]);
  const [legendOpen, setLegendOpen] = useState(false);

  // Step 3: Limitations
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
    if (step < 4) setStep((step + 1) as OnboardingStep);
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
      experienceLevel: 'some', // Default value (not shown in UI)
      goal: 'balanced', // Default value (not shown in UI)
      sections: sections,
      limitations: limitations,
    };
    handleOnboardingComplete(preferences);
  };

  // Check if current step is complete
  const canProceed = () => {
    switch (step) {
      case 1: return selectedTier !== null;
      case 2: return sections.length > 0;
      case 3: return true; // Limitations is optional
      case 4: return true;
      default: return false;
    }
  };

  const onboardingFooter = (
    <div
      className="fixed bottom-0 left-0 right-0 p-4 z-40"
      style={{ background: 'linear-gradient(to top, var(--background), var(--background) 60%, transparent)' }}
    >
      <div className="max-w-md mx-auto space-y-3">
        {step === 3 ? (
          <div className="flex gap-3">
            <CTAButton
              onClick={handleNext}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              Skip for Now
            </CTAButton>
            <CTAButton
              onClick={handleNext}
              disabled={!canProceed()}
              size="sm"
              className="flex-1"
            >
              Next
            </CTAButton>
          </div>
        ) : step === 4 ? (
          <CTAButton
            onClick={handleComplete}
            size="lg"
            fullWidth
          >
            Complete
          </CTAButton>
        ) : (
          <CTAButton
            onClick={handleNext}
            disabled={!canProceed()}
            size="lg"
            fullWidth
          >
            Next
          </CTAButton>
        )}

        <p className="text-center text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
          Step {step} of 4
        </p>
      </div>
    </div>
  );

  return (
    <OnboardingLayout
      header={<PageHeader left={step > 1 ? 'back' : undefined} onBack={handleBack} />}
      footer={onboardingFooter}
    >
      <div className="pt-6 stagger-reveal">
          {/* Step 1: Equipment/Location */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2
                  className="text-heading-h2 font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-header)' }}
                >
                  What's Your Gym Setup?
                </h2>
                <p className="text-paragraph-sm mt-2" style={{ color: 'var(--text-paragraph)' }}>
                  What equipment do you have access to?
                </p>
              </div>

              <Card cornerSize="md" padding="md">
                <label
                  className="text-label-xs uppercase tracking-widest mb-4 block"
                  style={{ color: "var(--text-paragraph)" }}
                >
                  Location Type
                </label>

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
              </Card>

              {/* Equipment Accordion */}
              {selectedTier && (
                <Card cornerSize="md" padding="none">
                  <button
                    onClick={() => setEquipmentAccordionOpen(!equipmentAccordionOpen)}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <span className="text-cta-sm font-bold" style={{ color: 'var(--text-cta)' }}>
                      Customize Equipment
                    </span>
                    {equipmentAccordionOpen ? (
                      <ChevronUp className="w-5 h-5" style={{ color: 'var(--icon-cta)' }} />
                    ) : (
                      <ChevronDown className="w-5 h-5" style={{ color: 'var(--icon-cta)' }} />
                    )}
                  </button>

                  {equipmentAccordionOpen && (
                    <div className="px-4 pb-4">
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
                </Card>
              )}

              <p className="text-paragraph-sm text-center" style={{ color: 'var(--text-paragraph)' }}>
                You can add more locations later
              </p>
            </div>
          )}

          {/* Step 2: Workout Sections */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2
                  className="text-heading-h2 font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-header)' }}
                >
                  Workout Sections
                </h2>
                <p className="text-paragraph-sm mt-2" style={{ color: 'var(--text-paragraph)' }}>
                  Choose which parts to include in your workouts.
                </p>
              </div>

              <Card cornerSize="md" padding="md">
                <label
                  className="text-label-xs uppercase tracking-widest mb-4 block"
                  style={{ color: "var(--text-paragraph)" }}
                >
                  Workout Areas
                </label>
                <div className="flex flex-wrap gap-2">
                  {WORKOUT_SECTIONS.map((section) => {
                    const isSelected = sections.includes(section.id);
                    const isAccessory = section.id === 'accessory';
                    const primaryOff = !sections.includes('primary');
                    const isDisabled = isAccessory && primaryOff;

                    return (
                      <Chip
                        key={section.id}
                        variant="selectable"
                        selected={isSelected}
                        onClick={() => handleSectionToggle(section.id)}
                        disabled={isDisabled}
                      >
                        {section.name}
                      </Chip>
                    );
                  })}
                </div>
              </Card>

              {/* Legend */}
              <Card cornerSize="md" padding="none">
                <button
                  onClick={() => setLegendOpen(!legendOpen)}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <span className="text-cta-sm font-bold" style={{ color: 'var(--text-cta)' }}>
                    What do these mean?
                  </span>
                  {legendOpen ? (
                    <ChevronUp className="w-4 h-4" style={{ color: 'var(--icon-cta)' }} />
                  ) : (
                    <ChevronDown className="w-4 h-4" style={{ color: 'var(--icon-cta)' }} />
                  )}
                </button>

                {legendOpen && (
                  <div className="px-4 pb-4 space-y-3 pt-3" style={{ borderTop: '2px solid var(--border-spacer)' }}>
                    {WORKOUT_SECTIONS.map((section) => (
                      <div key={section.id}>
                        <p className="text-label-xs uppercase tracking-wide" style={{ color: 'var(--text-card-label)' }}>
                          {section.name}
                        </p>
                        <p className="text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
                          {section.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <p className="text-paragraph-sm text-center" style={{ color: 'var(--text-paragraph)' }}>
                You can change this anytime in settings
              </p>
            </div>
          )}

          {/* Step 3: Limitations */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2
                  className="text-heading-h2 font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-header)' }}
                >
                  Anything We Should<br />Work Around?
                </h2>
                <p className="text-paragraph-sm mt-2" style={{ color: 'var(--text-paragraph)' }}>
                  Old injuries, problem areas, or movements you want to avoid.
                </p>
              </div>

              <Card cornerSize="md" padding="md">
                <label
                  className="text-label-xs uppercase tracking-widest mb-4 block"
                  style={{ color: "var(--text-paragraph)" }}
                >
                  Limitations
                </label>
                <Textarea
                  value={limitations}
                  onChange={(e) => setLimitations(e.target.value)}
                  placeholder="Bad left shoulder from years ago. Overhead press feels sketchy sometimes."
                  className="min-h-[120px]"
                />
              </Card>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <h2
                className="text-heading-h2 font-bold uppercase tracking-wider"
                style={{ color: 'var(--text-header)' }}
              >
                Here's Your Setup
              </h2>

              {/* Location */}
              <Card padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-label-xs uppercase tracking-widest mb-1"
                      style={{ color: 'var(--text-card-label)' }}
                    >
                      Location
                    </p>
                    <p
                      className="text-heading-h5 font-bold"
                      style={{ color: 'var(--text-header)' }}
                    >
                      {TIER_OPTIONS.find(t => t.value === selectedTier)?.label}
                    </p>
                    <p className="text-paragraph-sm mt-1" style={{ color: 'var(--text-paragraph)' }}>
                      {selectedEquipment.slice(0, 5).join(', ')}
                      {selectedEquipment.length > 5 && ` +${selectedEquipment.length - 5} more`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditStep(1)}
                    className="text-label-sm transition-colors" style={{ color: 'var(--icon-cta)' }}
                  >
                    Edit
                  </button>
                </div>
              </Card>

              {/* Workout Sections */}
              <Card padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-label-xs uppercase tracking-widest mb-1"
                      style={{ color: 'var(--text-card-label)' }}
                    >
                      Workout Sections
                    </p>
                    <p
                      className="text-heading-h5 font-bold"
                      style={{ color: 'var(--text-header)' }}
                    >
                      {sections.length} sections
                    </p>
                    <p className="text-paragraph-sm mt-1" style={{ color: 'var(--text-paragraph)' }}>
                      {sections.slice(0, 4).map(s =>
                        WORKOUT_SECTIONS.find(ws => ws.id === s)?.name
                      ).join(', ')}
                      {sections.length > 4 && ` +${sections.length - 4} more`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditStep(2)}
                    className="text-label-sm transition-colors" style={{ color: 'var(--icon-cta)' }}
                  >
                    Edit
                  </button>
                </div>
              </Card>

              {/* Limitations */}
              <Card padding="md">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <p
                      className="text-label-xs uppercase tracking-widest mb-1"
                      style={{ color: 'var(--text-card-label)' }}
                    >
                      Limitations
                    </p>
                    <p
                      className="text-heading-h5 font-bold"
                      style={{ color: 'var(--text-header)' }}
                    >
                      {limitations ? `"${limitations.slice(0, 50)}${limitations.length > 50 ? '...' : ''}"` : 'None specified'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditStep(3)}
                    className="text-label-sm transition-colors" style={{ color: 'var(--icon-cta)' }}
                  >
                    Edit
                  </button>
                </div>
              </Card>
            </div>
          )}
      </div>
    </OnboardingLayout>
  );
};
