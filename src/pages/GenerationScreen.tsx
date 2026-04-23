import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { IntensitySlider } from "@/components/IntensitySlider";
import { LocationAccordion } from "@/components/LocationAccordion";
import { OptionalFields } from "@/components/OptionalFields";
import { GenerateButton } from "@/components/GenerateButton";
import { FullscreenLoader } from "@/components/ScanLoader";
import { Card } from "@/components/Card";
import { useAuthContext } from "@/contexts/AuthContext";
import { useWorkoutFlowContext } from "@/contexts/WorkoutFlowContext";
import { useSuggestedAnchor } from "@/hooks/useSuggestedAnchor";
import { INTENSITY_RANGE_BY_GOAL } from "@/types/workout";

export const GenerationScreen = () => {
  const navigate = useNavigate();
  const { profile, locations } = useAuthContext();
  const { handleGenerate: generateWorkout, isGenerating, cancelGeneration } = useWorkoutFlowContext();
  const { suggestedAnchor, reason, isLoading: anchorLoading } = useSuggestedAnchor();

  const defaultLocation = locations.find(
    l => l.id === profile?.defaultLocationId
  ) || locations[0];

  // Goal comes from profile (set in Settings), not per-workout
  const goal = profile?.goal || 'balanced';
  const intensityRange = INTENSITY_RANGE_BY_GOAL[goal];

  const [intensity, setIntensity] = useState(intensityRange.default);
  const [location, setLocation] = useState(defaultLocation?.name || "Gym");
  const [time, setTime] = useState("45");
  const [notes, setNotes] = useState("");

  const handleGenerate = () => {
    generateWorkout({
      intensity,
      anchor: suggestedAnchor,
      location,
      time,
      notes,
    }, () => navigate("/review"));
  };

  const canGenerate = time !== "" && !anchorLoading;

  return (
    <>
    <FullscreenLoader message="GENERATING WORKOUT" visible={isGenerating} onCancel={cancelGeneration} />
    <AppLayout
      header={<PageHeader left="back" onBack={() => navigate("/")} right="menu" onMenu={() => navigate("/settings")} />}
      footer={<GenerateButton onClick={handleGenerate} disabled={!canGenerate} isLoading={isGenerating} />}
    >
      <div className="stagger-reveal" style={{ paddingTop: 'var(--spacing-600)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-600)' }}>
        <Card cornerSize="md" padding="md">
          <span
            className="text-label-xs"
            style={{ color: 'var(--text-card-label)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 'var(--spacing-200)' }}
          >
            Recommended Focus
          </span>
          {anchorLoading ? (
            <span className="text-paragraph-sm" style={{ color: 'var(--text-muted)' }}>Analyzing coverage...</span>
          ) : (
            <>
              <span
                className="text-heading-h4"
                style={{ color: 'var(--text-header)', display: 'block', marginBottom: 'var(--spacing-100)' }}
              >
                {suggestedAnchor}
              </span>
              {reason && (
                <span className="text-paragraph-sm" style={{ color: 'var(--text-muted)' }}>
                  {reason}
                </span>
              )}
            </>
          )}
        </Card>

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
