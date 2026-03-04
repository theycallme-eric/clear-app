import { useNavigate } from "react-router-dom";

export const TestWorkoutScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grain-overlay flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-heading-h4 font-bold mb-4" style={{ color: 'var(--text-header)' }}>
          Test Workout
        </h1>
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
