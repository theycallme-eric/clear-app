import { Menu } from "lucide-react";
import { Card } from "../Card";

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
    <Card cornerSize="md" padding="md">
      <div className="flex items-center justify-between">
        {/* A: Section info - left side, stacked vertically, centered */}
        <div className="flex flex-col items-center">
          <span
            className="text-label-xs uppercase tracking-wider px-2 py-0.5"
            style={{
              color: "var(--text-paragraph)",
              border: "1px solid var(--border-card)",
            }}
          >
            {sectionName}
          </span>
          <span className="text-paragraph-xs mt-1" style={{ color: "var(--text-paragraph)" }}>
            ({currentSection + 1}/{totalSections})
          </span>
        </div>

        {/* C: Timer - centered */}
        <span
          className="text-time-lg font-bold tracking-wider"
          style={{ color: "var(--text-timer)" }}
        >
          {formatTime(sectionTime)}
        </span>

        {/* B: Menu - right side */}
        <button
          className="p-2 transition-colors hover:opacity-80"
          style={{ color: "var(--text-paragraph)" }}
          aria-label="Menu"
        >
          <Menu size={24} />
        </button>
      </div>
    </Card>
  );
};
