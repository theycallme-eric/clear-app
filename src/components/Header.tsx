import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 py-4">
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
