import { ArrowLeft, Menu } from "lucide-react";

interface ReviewHeaderProps {
  onBack: () => void;
  onMenuClick?: () => void;
}

export const ReviewHeader = ({ onBack, onMenuClick }: ReviewHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 py-4">
      <button
        onClick={onBack}
        className="p-2 transition-colors"
        style={{ color: 'var(--icon-cta)' }}
        aria-label="Go back"
      >
        <ArrowLeft size={24} />
      </button>

      <h1
        className="text-heading-h2 font-bold tracking-wider"
        style={{ color: 'var(--text-header)' }}
      >
        CLEAR
      </h1>

      <button
        onClick={onMenuClick}
        className="p-2 transition-colors"
        style={{ color: 'var(--icon-cta)' }}
        aria-label="Menu"
      >
        <Menu size={24} />
      </button>
    </header>
  );
};
