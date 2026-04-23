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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-600)' }}>
      <Card cornerSize="md" padding="md">
        {/* Goal Selection */}
        <div style={{ marginBottom: 'var(--spacing-400)' }}>
          <p className="text-label-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--spacing-200)', color: 'var(--text-card-label)' }}>
            Goal
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
            {GOAL_PRESETS.map((preset) => (
              <RadioButton
                key={preset.value}
                selected={selectedGoal === preset.value}
                onClick={() => onGoalSelect(preset.value)}
                label={preset.label}
                description={preset.description}
                style={{ width: '100%' }}
              />
            ))}
          </div>
        </div>

        {/* Sections Accordion */}
        {selectedGoal && (
          <div style={{ paddingTop: 'var(--spacing-400)', marginLeft: 'calc(var(--spacing-400) * -1)', marginRight: 'calc(var(--spacing-400) * -1)', paddingLeft: 'var(--spacing-400)', paddingRight: 'var(--spacing-400)', borderTop: '2px solid var(--border-spacer)' }}>
            <button
              onClick={onToggleSectionsAccordion}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span className="text-cta-sm" style={{ fontWeight: 500, color: 'var(--text-header)' }}>
                Customize Sections
              </span>
              {sectionsAccordionOpen ? (
                <ChevronUp style={{ width: 20, height: 20, color: 'var(--icon-cta)' }} />
              ) : (
                <ChevronDown style={{ width: 20, height: 20, color: 'var(--icon-cta)' }} />
              )}
            </button>

            {sectionsAccordionOpen && (
              <div style={{ paddingTop: 'var(--spacing-400)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-400)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-200)' }}>
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
                className="text-cta-sm transition-colors"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-cta)' }}
              >
                <span>What do these mean?</span>
                {legendOpen ? (
                  <ChevronUp style={{ width: 16, height: 16, color: 'var(--icon-cta)' }} />
                ) : (
                  <ChevronDown style={{ width: 16, height: 16, color: 'var(--icon-cta)' }} />
                )}
              </button>

              {legendOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)', paddingTop: 'var(--spacing-200)', borderTop: '2px solid var(--border-spacer)' }}>
                  {WORKOUT_SECTIONS.map((section) => (
                    <div key={section.id}>
                      <p className="text-label-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.025em', color: 'var(--text-card-label)' }}>
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
