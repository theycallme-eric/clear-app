import { Card } from "./Card";
import { ChamferedFrame } from "./ChamferedFrame";

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const IntensitySlider = ({ value, onChange, min = 1, max = 10 }: IntensitySliderProps) => {
  // Calculate fill percentage based on dynamic range
  const range = max - min;
  const fillPercent = range > 0 ? ((value - min) / range) * 100 : 0;

  return (
    <Card cornerSize="md" padding="lg">
      <label
        className="text-label-xs"
        style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--spacing-400)', display: 'block', color: "var(--text-card-label)" }}
      >
        Intensity Level
      </label>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-400)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="intensity-slider"
              style={{
                width: '100%',
                background: `linear-gradient(to right, var(--surface-slider-active) 0%, var(--surface-slider-active) ${fillPercent}%, var(--surface-slider-inactive) ${fillPercent}%, var(--surface-slider-inactive) 100%)`,
              }}
            />
          </div>

          <div
            className="text-label-xs"
            style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-200)', color: "var(--text-paragraph)" }}
          >
            <span>{min}</span>
            {/* Show midpoint label if range is wide enough */}
            {range >= 4 && <span>{Math.round((min + max) / 2)}</span>}
            <span>{max}</span>
          </div>
        </div>

        {/* Value display with chamfered corner */}
        <ChamferedFrame
          cornerSize="sm"
          surfaceColor="var(--surface-card-accent)"
          borderColor="var(--border-card)"
          hasLeftBorder={true}
          style={{ width: '4rem', height: '4rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <span
              className="text-heading-h1"
              style={{ fontWeight: 'bold', color: "var(--text-header)" }}
            >
              {value}
            </span>
          </div>
        </ChamferedFrame>
      </div>
    </Card>
  );
};
