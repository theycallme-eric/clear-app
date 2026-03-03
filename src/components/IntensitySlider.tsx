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
        className="text-label-xs uppercase tracking-widest mb-4 block"
        style={{ color: "var(--text-card-label)" }}
      >
        Intensity Level
      </label>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="intensity-slider w-full"
              style={{
                background: `linear-gradient(to right, var(--surface-slider-active) 0%, var(--surface-slider-active) ${fillPercent}%, var(--surface-slider-inactive) ${fillPercent}%, var(--surface-slider-inactive) 100%)`,
              }}
            />
          </div>

          <div
            className="flex justify-between mt-2 text-label-xs"
            style={{ color: "var(--text-paragraph)" }}
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
          className="w-16 h-16"
        >
          <div className="flex items-center justify-center h-full">
            <span
              className="text-heading-h1 font-bold"
              style={{ color: "var(--text-header)" }}
            >
              {value}
            </span>
          </div>
        </ChamferedFrame>
      </div>
    </Card>
  );
};
