import { ChamferedFrame } from "@/components/ChamferedFrame";

interface TimerDisplayProps {
  elapsedSeconds: number;
}

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const TimerDisplay = ({ elapsedSeconds }: TimerDisplayProps) => {
  return (
    <ChamferedFrame
      cornerSize="sm"
      surfaceColor="var(--surface-timer)"
      borderColor="var(--border-timer)"
      hasLeftBorder={true}
    >
      <span
        className="text-time-lg glow-emissive"
        style={{
          display: 'block',
          padding: 'var(--spacing-100) var(--spacing-500)',
          fontWeight: 'bold',
          textAlign: 'center',
          color: 'var(--text-timer)',
        }}
      >
        {formatTime(elapsedSeconds)}
      </span>
    </ChamferedFrame>
  );
};
