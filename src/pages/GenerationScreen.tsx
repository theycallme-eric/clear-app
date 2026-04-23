import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { IntensitySlider } from "@/components/IntensitySlider";
import { AnchorGrid, AnchorType } from "@/components/AnchorGrid";
import { LocationAccordion } from "@/components/LocationAccordion";
import { OptionalFields } from "@/components/OptionalFields";
import { GenerateButton } from "@/components/GenerateButton";
import { FullscreenLoader } from "@/components/ScanLoader";
import { useAuthContext } from "@/contexts/AuthContext";
import { useWorkoutFlowContext } from "@/contexts/WorkoutFlowContext";
import { GOAL_PRESETS, INTENSITY_RANGE_BY_GOAL } from "@/types/workout";

export const GenerationScreen = () => {
  const navigate = useNavigate();
  const { profile, locations } = useAuthContext();
  const { handleGenerate: generateWorkout, isGenerating, cancelGeneration } = useWorkoutFlowContext();

  const defaultLocation = locations.find(
    l => l.id === profile?.defaultLocationId
  ) || locations[0];

  // Goal comes from profile (set in Settings), not per-workout
  const goal = profile?.goal || 'balanced';
  const goalPreset = GOAL_PRESETS.find(g => g.value === goal);
  const intensityRange = INTENSITY_RANGE_BY_GOAL[goal];

  const [intensity, setIntensity] = useState(intensityRange.default);
  const [anchor, setAnchor] = useState<AnchorType | null>(null);
  const [location, setLocation] = useState(defaultLocation?.name || "Gym");
  const [time, setTime] = useState("45");
  const [notes, setNotes] = useState("");

  const handleGenerate = () => {
    generateWorkout({
      intensity,
      anchor,
      location,
      time,
      notes,
    }, () => navigate("/review"));
  };

  const canGenerate = anchor !== null && time !== "";

  return (
    <>
    <FullscreenLoader message="GENERATING WORKOUT" visible={isGenerating} onCancel={cancelGeneration} />
    <AppLayout
      header={<PageHeader left="back" onBack={() => navigate("/")} right="menu" onMenu={() => navigate("/settings")} />}
      footer={<GenerateButton onClick={handleGenerate} disabled={!canGenerate} isLoading={isGenerating} />}
    >
      <div className="stagger-reveal" style={{ paddingTop: 'var(--spacing-600)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-600)' }}>
        <div className="goal-badge">
          <span className="goal-badge__label">TRAINING GOAL</span>
          <span className="goal-badge__value">{goalPreset?.label || 'Balanced'}</span>
          <span className="goal-badge__hint">{goalPreset?.description}</span>
        </div>

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
    </>
  );
};
