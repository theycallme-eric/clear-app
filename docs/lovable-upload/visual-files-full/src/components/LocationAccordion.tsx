import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserLocation } from "@/types/workout";

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
    <div className="glass-card rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground block mb-1">
            Location
          </span>
          <span className="font-display text-lg font-semibold text-foreground">
            {displayName}
          </span>
        </div>
        <ChevronDown
          size={20}
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 space-y-2">
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => {
                  onSelect(location.name);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded font-body text-sm transition-colors",
                  selected === location.name
                    ? "bg-accent/20 text-accent"
                    : "text-foreground/80 hover:bg-secondary/10 hover:text-foreground"
                )}
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
