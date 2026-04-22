import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { RadioButton } from "@/components/RadioButton";
import {
  GoalPreset,
  SectionType,
  GOAL_PRESETS,
  WORKOUT_SECTIONS,
} from "@/types/workout";

interface StructureSettingsProps {
  selectedGoal: GoalPreset | null;
  onGoalSelect: (goal: GoalPreset) => void;
  selectedSections: SectionType[];
  onSectionToggle: (sectionId: SectionType) => void;
  sectionsAccordionOpen: boolean;
  onToggleSectionsAccordion: () => void;
  legendOpen: boolean;
  onToggleLegend: () => void;
}

export const StructureSettings = ({
  selectedGoal,
  onGoalSelect,
  selectedSections,
  onSectionToggle,
  sectionsAccordionOpen,
  onToggleSectionsAccordion,
  legendOpen,
  onToggleLegend,
}: StructureSettingsProps) => {
  return (
    <div className="space-y-6">
      <Card cornerSize="md" padding="md">
        {/* Goal Selection */}
        <div className="mb-4">
          <p className="text-label-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-card-label)' }}>
            Goal
          </p>
          <div className="flex flex-col gap-2">
            {GOAL_PRESETS.map((preset) => (
              <RadioButton
                key={preset.value}
                selected={selectedGoal === preset.value}
                onClick={() => onGoalSelect(preset.value)}
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
              onClick={onToggleSectionsAccordion}
              className="w-full flex items-center justify-between"
            >
              <span className="text-cta-sm font-medium" style={{ color: 'var(--text-header)' }}>
                Customize Sections
              </span>
              {sectionsAccordionOpen ? (
                <ChevronUp className="w-5 h-5" style={{ color: 'var(--icon-cta)' }} />
              ) : (
                <ChevronDown className="w-5 h-5" style={{ color: 'var(--icon-cta)' }} />
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
                    <Chip
                      key={section.id}
                      variant="selectable"
                      selected={isSelected}
                      disabled={isDisabled}
                      onClick={() => onSectionToggle(section.id)}
                    >
                      {section.name}
                    </Chip>
                  );
                })}
              </div>

              {/* Legend */}
              <button
                onClick={onToggleLegend}
                className="w-full flex items-center justify-between text-cta-sm transition-colors"
                style={{ color: 'var(--text-cta)' }}
              >
                <span>What do these mean?</span>
                {legendOpen ? (
                  <ChevronUp className="w-4 h-4" style={{ color: 'var(--icon-cta)' }} />
                ) : (
                  <ChevronDown className="w-4 h-4" style={{ color: 'var(--icon-cta)' }} />
                )}
              </button>

              {legendOpen && (
                <div className="space-y-3 pt-2" style={{ borderTop: '2px solid var(--border-spacer)' }}>
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
            </div>
          )}
          </div>
        )}
      </Card>
    </div>
  );
};
