import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 py-4">
      <h1 className="font-display text-3xl font-bold tracking-wider text-foreground">
        CLEAR
      </h1>
      <button
        onClick={onMenuClick}
        className="p-2 text-foreground/80 hover:text-foreground transition-colors"
        aria-label="Menu"
      >
        <Menu size={24} />
      </button>
    </header>
  );
};
