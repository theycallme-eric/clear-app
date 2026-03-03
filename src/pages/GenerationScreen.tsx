import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { IntensitySlider } from "@/components/IntensitySlider";
import { AnchorGrid, AnchorType } from "@/components/AnchorGrid";
import { GoalSelector } from "@/components/GoalSelector";
import { LocationAccordion } from "@/components/LocationAccordion";
import { OptionalFields } from "@/components/OptionalFields";
import { GenerateButton } from "@/components/GenerateButton";
import { UserPreferences, GoalPreset, INTENSITY_RANGE_BY_GOAL } from "@/types/workout";

interface GenerationScreenProps {
  onGenerate: (params: WorkoutParams) => void;
  userPreferences: UserPreferences;
  isGenerating?: boolean;
  onOpenSettings?: () => void;
}

export interface WorkoutParams {
  intensity: number;
  anchor: AnchorType | null;
  goal: GoalPreset | null;
  location: string;
  time: string;
  notes: string;
}

export const GenerationScreen = ({ onGenerate, userPreferences, isGenerating = false, onOpenSettings }: GenerationScreenProps) => {
  const defaultLocation = userPreferences.locations.find(
    l => l.id === userPreferences.defaultLocationId
  ) || userPreferences.locations[0];

  const [goal, setGoal] = useState<GoalPreset | null>(null);
  const [intensity, setIntensity] = useState(7);
  const [anchor, setAnchor] = useState<AnchorType | null>(null);
  const [location, setLocation] = useState(defaultLocation?.name || "Gym");
  const [time, setTime] = useState("45");
  const [notes, setNotes] = useState("");

  // When goal changes, clamp intensity to the valid range
  const handleGoalChange = useCallback((newGoal: GoalPreset) => {
    setGoal(newGoal);
    const range = INTENSITY_RANGE_BY_GOAL[newGoal];
    setIntensity(prev => {
      if (prev < range.min) return range.min;
      if (prev > range.max) return range.max;
      return prev;
    });

    // If switching to active_recovery and Power is selected, deselect anchor
    if (newGoal === 'active_recovery' && anchor === 'POWER') {
      setAnchor(null);
    }
  }, [anchor]);

  const handleGenerate = () => {
    onGenerate({
      intensity,
      anchor,
      goal,
      location,
      time,
      notes,
    });
  };

  const canGenerate = goal !== null && anchor !== null && time !== "";

  // Get intensity range for current goal (or full range if no goal selected)
  const intensityRange = goal ? INTENSITY_RANGE_BY_GOAL[goal] : { min: 1, max: 10 };

  return (
    <div className="min-h-screen grain-overlay">
      <div className="max-w-md mx-auto pb-24">
        <Header onMenuClick={onOpenSettings} />

        <div className="px-4 space-y-6">
          <GoalSelector selected={goal} onSelect={handleGoalChange} />

          <AnchorGrid
            selected={anchor}
            onSelect={setAnchor}
            disablePower={goal === 'active_recovery'}
          />

          <IntensitySlider
            value={intensity}
            onChange={setIntensity}
            min={intensityRange.min}
            max={intensityRange.max}
          />

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
