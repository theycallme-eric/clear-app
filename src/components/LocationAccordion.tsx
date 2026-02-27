import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserLocation } from "@/types/workout";
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
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <span
            className="text-label-xs uppercase tracking-widest block mb-1"
            style={{ color: "var(--text-card-label)" }}
          >
            Location
          </span>
          <span
            className="text-heading-h5 font-medium"
            style={{ color: "var(--text-header)" }}
          >
            {displayName}
          </span>
        </div>
        <ChevronDown
          size={20}
          className={cn(
            "transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          style={{ color: "var(--text-paragraph)" }}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 flex flex-col gap-2">
            {locations.map((location) => (
              <RadioButton
                key={location.id}
                selected={selected === location.name}
                onClick={() => {
                  onSelect(location.name);
                  setIsOpen(false);
                }}
                label={location.name}
                className="w-full"
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
