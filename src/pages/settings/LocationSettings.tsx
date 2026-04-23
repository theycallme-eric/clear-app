import { ChevronDown, ChevronUp } from "lucide-react";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { RadioButton } from "@/components/RadioButton";
import { Input } from "@/components/ui/input";
import {
  UserPreferences,
  UserLocation,
  EquipmentTier,
  EQUIPMENT_BY_TIER,
} from "@/types/workout";

const TIER_OPTIONS: { value: EquipmentTier; label: string; description: string }[] = [
  { value: 'minimal', label: 'Minimal', description: 'Bodyweight, bands, mat' },
  { value: 'home', label: 'Home Gym', description: 'Dumbbells, bench, basics' },
  { value: 'building', label: 'Building Gym', description: 'Rack, barbell, dumbbells' },
  { value: 'full', label: 'Full Gym', description: 'Commercial, everything' },
];

// --- Location List View ---

interface LocationListProps {
  preferences: UserPreferences;
  onSetDefault: (locationId: string) => void;
  onEditLocation: (location: UserLocation) => void;
  onAddLocation: () => void;
}

export const LocationList = ({
  preferences,
  onSetDefault,
  onEditLocation,
  onAddLocation,
}: LocationListProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-400)' }}>
      <Card cornerSize="md" padding="md">
        <p className="text-label-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--spacing-400)', color: 'var(--text-card-label)' }}>
          Default Location
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
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
                onClick={() => onSetDefault(location.id)}
                label={location.name}
                description={equipmentDesc}
                style={{ width: '100%' }}
                onEdit={() => onEditLocation(location)}
              />
            );
          })}
        </div>
      </Card>

      <Card onClick={onAddLocation} padding="md" style={{ textAlign: 'center' }}>
        <span className="text-label-sm" style={{ color: 'var(--icon-cta)' }}>
          + Add Location
        </span>
      </Card>
    </div>
  );
};

// --- Location Edit/Add View ---

interface LocationEditorProps {
  isEditing: boolean;
  locationName: string;
  onLocationNameChange: (name: string) => void;
  selectedTier: EquipmentTier;
  onTierSelect: (tier: EquipmentTier) => void;
  selectedEquipment: string[];
  onEquipmentToggle: (equipment: string) => void;
  equipmentAccordionOpen: boolean;
  onToggleEquipmentAccordion: () => void;
  canDelete: boolean;
  onDelete: () => void;
}

export const LocationEditor = ({
  isEditing,
  locationName,
  onLocationNameChange,
  selectedTier,
  onTierSelect,
  selectedEquipment,
  onEquipmentToggle,
  equipmentAccordionOpen,
  onToggleEquipmentAccordion,
  canDelete,
  onDelete,
}: LocationEditorProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-600)' }}>
      <Card cornerSize="md" padding="md">
        {/* Location Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)', marginBottom: 'var(--spacing-600)' }}>
          <label className="text-label-xs" style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-card-label)' }}>
            Location Name
          </label>
          <Input
            value={locationName}
            onChange={(e) => onLocationNameChange(e.target.value)}
            placeholder="My Gym"
          />
        </div>

        {/* Equipment Type */}
        <div style={{ marginBottom: 'var(--spacing-400)' }}>
          <p className="text-label-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--spacing-200)', color: 'var(--text-card-label)' }}>
            Equipment Type
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
            {TIER_OPTIONS.map((tier) => (
              <RadioButton
                key={tier.value}
                selected={selectedTier === tier.value}
                onClick={() => onTierSelect(tier.value)}
                label={tier.label}
                description={tier.description}
                style={{ width: '100%' }}
              />
            ))}
          </div>
        </div>

        {/* Customize Equipment Accordion */}
        <div style={{ paddingTop: 'var(--spacing-400)', marginLeft: 'calc(var(--spacing-400) * -1)', marginRight: 'calc(var(--spacing-400) * -1)', paddingLeft: 'var(--spacing-400)', paddingRight: 'var(--spacing-400)', borderTop: '2px solid var(--border-spacer)' }}>
          <button
            onClick={onToggleEquipmentAccordion}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span className="text-cta-sm" style={{ fontWeight: 500, color: 'var(--text-header)' }}>
              Customize Equipment
            </span>
            {equipmentAccordionOpen ? (
              <ChevronUp style={{ width: 20, height: 20, color: 'var(--icon-cta)' }} />
            ) : (
              <ChevronDown style={{ width: 20, height: 20, color: 'var(--icon-cta)' }} />
            )}
          </button>

          {equipmentAccordionOpen && (
            <div style={{ paddingTop: 'var(--spacing-400)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-200)' }}>
                {EQUIPMENT_BY_TIER.full.map((equipment) => {
                  const isSelected = selectedEquipment.includes(equipment);
                  const isBodyweight = equipment === 'Bodyweight';

                  return (
                    <Chip
                      key={equipment}
                      variant="selectable"
                      selected={isSelected}
                      onClick={() => onEquipmentToggle(equipment)}
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
      {isEditing && canDelete && (
        <CTAButton
          onClick={onDelete}
          variant="secondary"
          size="md"
          fullWidth
          style={{ '--btn-text': 'rgb(244, 63, 94)' } as React.CSSProperties}
        >
          Delete Location
        </CTAButton>
      )}
    </div>
  );
};
