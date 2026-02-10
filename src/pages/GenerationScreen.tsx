import { useState } from "react";
import { Header } from "@/components/Header";
import { IntensitySlider } from "@/components/IntensitySlider";
import { AnchorGrid, AnchorType } from "@/components/AnchorGrid";
import { LocationAccordion } from "@/components/LocationAccordion";
import { OptionalFields } from "@/components/OptionalFields";
import { GenerateButton } from "@/components/GenerateButton";
import { UserPreferences } from "@/types/workout";

interface GenerationScreenProps {
  onGenerate: (params: WorkoutParams) => void;
  userPreferences: UserPreferences;
  isGenerating?: boolean;
  onOpenSettings?: () => void;
}

export interface WorkoutParams {
  intensity: number;
  anchor: AnchorType | null;
  location: string;
  time: string;
  notes: string;
}

export const GenerationScreen = ({ onGenerate, userPreferences, isGenerating = false, onOpenSettings }: GenerationScreenProps) => {
  const defaultLocation = userPreferences.locations.find(
    l => l.id === userPreferences.defaultLocationId
  ) || userPreferences.locations[0];

  const [intensity, setIntensity] = useState(7);
  const [anchor, setAnchor] = useState<AnchorType | null>(null);
  const [location, setLocation] = useState(defaultLocation?.name || "Gym");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");


  const handleGenerate = () => {
    onGenerate({
      intensity,
      anchor,
      location,
      time,
      notes,
    });
  };

  const canGenerate = anchor !== null;

  return (
    <div className="min-h-screen grain-overlay">
      <div className="max-w-md mx-auto pb-24">
        <Header onMenuClick={onOpenSettings} />
        
        <div className="px-4 space-y-6">
          <IntensitySlider value={intensity} onChange={setIntensity} />
          
          <AnchorGrid selected={anchor} onSelect={setAnchor} />
          
          <LocationAccordion selected={location} onSelect={setLocation} locations={userPreferences.locations} />
          
          <OptionalFields
            time={time}
            notes={notes}
            onTimeChange={setTime}
            onNotesChange={setNotes}
          />
        </div>
        
        <GenerateButton onClick={handleGenerate} disabled={!canGenerate} isLoading={isGenerating} />
      </div>
    </div>
  );
};
