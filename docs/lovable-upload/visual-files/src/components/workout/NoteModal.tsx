import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface NoteModalProps {
  isOpen: boolean;
  title: string;
  initialNote?: string;
  onSave: (note: string) => void;
  onClose: () => void;
}

export const NoteModal = ({ 
  isOpen, 
  title, 
  initialNote = "", 
  onSave, 
  onClose 
}: NoteModalProps) => {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md glass-card animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <h3 className="font-display text-lg font-bold uppercase text-clear-orange">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="185lbs x 8,8,8,7"
            className="w-full h-32 p-4 glass-input rounded-none text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-clear-orange"
            autoFocus
          />
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-border/30">
          <button
            onClick={onClose}
            className="flex-1 py-3 ghost-button font-display font-bold uppercase tracking-wide text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 glow-button font-display font-bold uppercase tracking-wide text-foreground"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
