import { useNavigate } from "react-router-dom";

export const TestWorkoutScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="grain-overlay" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', paddingLeft: 'var(--spacing-400)', paddingRight: 'var(--spacing-400)' }}>
        <h1 className="text-heading-h4" style={{ fontWeight: 700, marginBottom: 'var(--spacing-400)', color: 'var(--text-header)' }}>
          Test Workout
        </h1>
        <p className="text-paragraph-sm" style={{ marginBottom: 'var(--spacing-400)', color: 'var(--text-paragraph)' }}>
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
