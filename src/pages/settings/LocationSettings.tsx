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
    <div className="space-y-4">
      <Card cornerSize="md" padding="md">
        <p className="text-label-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-card-label)' }}>
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
                onClick={() => onSetDefault(location.id)}
                label={location.name}
                description={equipmentDesc}
                className="w-full"
                onEdit={() => onEditLocation(location)}
              />
            );
          })}
        </div>
      </Card>

      <Card onClick={onAddLocation} padding="md" className="text-center">
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
    <div className="space-y-6">
      <Card cornerSize="md" padding="md">
        {/* Location Name */}
        <div className="space-y-2 mb-6">
          <label className="block text-label-xs uppercase tracking-widest" style={{ color: 'var(--text-card-label)' }}>
            Location Name
          </label>
          <Input
            value={locationName}
            onChange={(e) => onLocationNameChange(e.target.value)}
            placeholder="My Gym"
          />
        </div>

        {/* Equipment Type */}
        <div className="mb-4">
          <p className="text-label-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-card-label)' }}>
            Equipment Type
          </p>
          <div className="flex flex-col gap-2">
            {TIER_OPTIONS.map((tier) => (
              <RadioButton
                key={tier.value}
                selected={selectedTier === tier.value}
                onClick={() => onTierSelect(tier.value)}
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
            onClick={onToggleEquipmentAccordion}
            className="w-full flex items-center justify-between"
          >
            <span className="text-cta-sm font-medium" style={{ color: 'var(--text-header)' }}>
              Customize Equipment
            </span>
            {equipmentAccordionOpen ? (
              <ChevronUp className="w-5 h-5" style={{ color: 'var(--icon-cta)' }} />
            ) : (
              <ChevronDown className="w-5 h-5" style={{ color: 'var(--icon-cta)' }} />
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
          className="[--btn-text:theme(colors.rose.500)]"
        >
          Delete Location
        </CTAButton>
      )}
    </div>
  );
};
