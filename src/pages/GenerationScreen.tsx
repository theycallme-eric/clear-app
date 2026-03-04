import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { IntensitySlider } from "@/components/IntensitySlider";
import { AnchorGrid, AnchorType } from "@/components/AnchorGrid";
import { GoalSelector } from "@/components/GoalSelector";
import { LocationAccordion } from "@/components/LocationAccordion";
import { OptionalFields } from "@/components/OptionalFields";
import { GenerateButton } from "@/components/GenerateButton";
import { useAuthContext } from "@/contexts/AuthContext";
import { useWorkoutFlowContext } from "@/contexts/WorkoutFlowContext";
import { GoalPreset, INTENSITY_RANGE_BY_GOAL } from "@/types/workout";

export const GenerationScreen = () => {
  const navigate = useNavigate();
  const { profile, locations } = useAuthContext();
  const { handleGenerate: generateWorkout, isGenerating } = useWorkoutFlowContext();

  const defaultLocation = locations.find(
    l => l.id === profile?.defaultLocationId
  ) || locations[0];

  const [goal, setGoal] = useState<GoalPreset | null>(null);
  const [intensity, setIntensity] = useState(7);
  const [anchor, setAnchor] = useState<AnchorType | null>(null);
  const [location, setLocation] = useState(defaultLocation?.name || "Gym");
  const [time, setTime] = useState("45");
  const [notes, setNotes] = useState("");

  const handleGoalChange = useCallback((newGoal: GoalPreset) => {
    setGoal(newGoal);
    const range = INTENSITY_RANGE_BY_GOAL[newGoal];
    setIntensity(prev => {
      if (prev < range.min) return range.min;
      if (prev > range.max) return range.max;
      return prev;
    });

    if (newGoal === 'active_recovery' && anchor === 'POWER') {
      setAnchor(null);
    }
  }, [anchor]);

  const handleGenerate = () => {
    generateWorkout({
      intensity,
      anchor,
      goal,
      location,
      time,
      notes,
    }, () => navigate("/review"));
  };

  const canGenerate = goal !== null && anchor !== null && time !== "";
  const intensityRange = goal ? INTENSITY_RANGE_BY_GOAL[goal] : { min: 1, max: 10 };

  return (
    <AppLayout
      header={<PageHeader right="menu" onMenu={() => navigate("/settings")} />}
      footer={<GenerateButton onClick={handleGenerate} disabled={!canGenerate} isLoading={isGenerating} />}
    >
      <div className="pt-6 space-y-6 stagger-reveal">
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

        <LocationAccordion selected={location} onSelect={setLocation} locations={locations} />

        <OptionalFields
          time={time}
          notes={notes}
          onTimeChange={setTime}
          onNotesChange={setNotes}
        />
      </div>
    </AppLayout>
  );
};
