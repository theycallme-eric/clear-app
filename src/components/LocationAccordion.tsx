import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { UserLocation } from "@/types/workout";
import { Card } from "./Card";
import { RadioButton } from "./RadioButton";

interface LocationAccordionProps {
  selected: string;
  onSelect: (location: string) => void;
  locations: UserLocation[];
}

export const LocationAccordion = ({ selected, onSelect, locations }: LocationAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLocation = locations.find(l => l.name === selected) || locations[0];
  const displayName = selectedLocation?.name || selected;

  return (
    <Card cornerSize="md" padding="none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--spacing-400)',
          textAlign: 'left',
        }}
      >
        <div>
          <span
            className="text-label-xs"
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 'var(--spacing-100)', color: "var(--text-card-label)" }}
          >
            Location
          </span>
          <span
            className="text-heading-h5"
            style={{ fontWeight: 'bold', color: "var(--icon-cta)" }}
          >
            {displayName}
          </span>
        </div>
        <ChevronDown
          size={20}
          style={{
            color: "var(--icon-cta)",
            transition: 'transform 200ms',
            transform: isOpen ? 'rotate(180deg)' : undefined,
          }}
        />
      </button>

      {isOpen && (
        <div style={{ paddingLeft: 'var(--spacing-400)', paddingRight: 'var(--spacing-400)', paddingBottom: 'var(--spacing-400)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
          {locations.map((location) => (
            <RadioButton
              key={location.id}
              selected={selected === location.name}
              onClick={() => {
                onSelect(location.name);
                setIsOpen(false);
              }}
              label={location.name}
              style={{ width: '100%' }}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
