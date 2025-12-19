import { Menu } from "lucide-react";

interface WorkoutHeaderProps {
  sectionName: string;
  currentSection: number;
  totalSections: number;
  sectionTime: number;
  overallTime: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const WorkoutHeader = ({
  sectionName,
  currentSection,
  totalSections,
  sectionTime,
  overallTime
}: WorkoutHeaderProps) => {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        {/* A: Section info - left side, stacked vertically, centered */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground font-display uppercase tracking-wider border border-border/50 px-2 py-0.5">
            {sectionName}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            ({currentSection + 1}/{totalSections})
          </span>
        </div>
        
        {/* C: Timer - centered */}
        <span className="font-mono text-3xl text-clear-lime font-bold tracking-wider">
          {formatTime(sectionTime)}
        </span>
        
        {/* B: Menu - right side */}
        <button
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Menu"
        >
          <Menu size={24} />
        </button>
      </div>
    </div>
  );
};
