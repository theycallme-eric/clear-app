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
  overallTime: _overallTime
}: WorkoutHeaderProps) => {
  return (
    <Card cornerSize="md" padding="md">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* A: Section info - left side, stacked vertically, centered */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span
            className="text-label-xs"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: 'var(--spacing-50) var(--spacing-200)',
              color: "var(--text-paragraph)",
              border: "1px solid var(--border-card)",
            }}
          >
            {sectionName}
          </span>
          <span className="text-paragraph-xs" style={{ marginTop: 'var(--spacing-100)', color: "var(--text-paragraph)" }}>
            ({currentSection + 1}/{totalSections})
          </span>
        </div>

        {/* C: Timer - centered */}
        <span
          className="text-time-lg"
          style={{ fontWeight: 'bold', letterSpacing: '0.05em', color: "var(--text-timer)" }}
        >
          {formatTime(sectionTime)}
        </span>

        {/* B: Menu - right side */}
        <button
          className="transition-colors"
          style={{ padding: 'var(--spacing-200)', color: "var(--text-paragraph)" }}
          aria-label="Menu"
        >
          <Menu size={24} />
        </button>
      </div>
    </Card>
  );
};
