import { useNavigate } from "react-router-dom";
import { PageHeading } from "@/components/PageHeading";

export const TestWorkoutScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grain-overlay flex items-center justify-center">
      <div className="text-center px-4">
        <PageHeading level="h1" textSize="h4" className="mx-0 mb-4">Test Workout</PageHeading>
        <p className="text-paragraph-sm mb-4" style={{ color: 'var(--text-paragraph)' }}>
          Use the main flow to test workouts: Generate → Review → Workout
        </p>
        <button
          onClick={() => navigate("/settings")}
          className="text-cta-sm"
          style={{ color: 'var(--text-cta)' }}
        >
          Back to Settings
        </button>
      </div>
    </div>
  );
};
