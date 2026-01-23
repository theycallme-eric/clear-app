interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const IntensitySlider = ({ value, onChange }: IntensitySliderProps) => {
  return (
    <div className="glass-card rounded-lg p-6">
      <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 block">
        Intensity Level
      </label>
      
      <div className="flex items-center gap-6">
        <div className="flex-1">
          <input
            type="range"
            min="1"
            max="10"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="intensity-slider w-full"
          />
          
          <div className="flex justify-between mt-2 text-xs font-mono text-muted-foreground">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
        
        <div className="w-20 h-20 flex items-center justify-center glass-card rounded-lg">
          <span className="font-display text-5xl font-bold text-accent">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
};
