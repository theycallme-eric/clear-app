import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_LOCATIONS = [
  "Home Gym",
  "Commercial Gym",
  "Outdoor Park",
  "Hotel Room",
];

interface LocationAccordionProps {
  selected: string;
  onSelect: (location: string) => void;
}

export const LocationAccordion = ({ selected, onSelect }: LocationAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
            {selected}
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
            {PRESET_LOCATIONS.map((location) => (
              <button
                key={location}
                onClick={() => {
                  onSelect(location);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded font-body text-sm transition-colors",
                  selected === location
                    ? "bg-accent/20 text-accent"
                    : "text-foreground/80 hover:bg-secondary/10 hover:text-foreground"
                )}
              >
                {location}
              </button>
            ))}
            
            <button className="w-full flex items-center gap-2 px-3 py-2 text-accent text-sm font-medium hover:bg-accent/10 rounded transition-colors">
              <Plus size={16} />
              Add New Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
