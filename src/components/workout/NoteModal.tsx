import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CTAButton } from "../CTAButton";
import { Textarea } from "../ui/textarea";
import { Card } from "../Card";

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
      <Card padding="none" className="relative w-full max-w-md animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '2px solid var(--border-spacer)' }}>
          <h3 className="text-heading-h5 font-bold uppercase text-clear-orange">
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
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="185lbs x 8,8,8,7"
            autoFocus
            className="min-h-[120px]"
          />
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 p-4" style={{ borderTop: '2px solid var(--border-spacer)' }}>
          <CTAButton
            onClick={onClose}
            variant="secondary"
            size="md"
            className="flex-1"
          >
            Cancel
          </CTAButton>
          <CTAButton
            onClick={handleSave}
            size="md"
            className="flex-1"
          >
            Save
          </CTAButton>
        </div>
      </Card>
    </div>
  );
};
