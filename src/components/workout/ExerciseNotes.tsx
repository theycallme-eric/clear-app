import { useState } from "react";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ExerciseNotesProps {
    note: string;
    onSave: (note: string) => void;
    className?: string;
}

/**
 * ExerciseNotes - Reusable notes component for exercise cards.
 *
 * States:
 * 1. Closed, no notes: "NOTES:" + "+" button
 * 2. Editing: "NOTES:" + "+" + Textarea + SAVE / CANCEL
 * 3. Closed with preview: "NOTES:" + "EDIT" + note text
 */
export function ExerciseNotes({ note, onSave, className }: ExerciseNotesProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(note);

    const hasNote = note.trim().length > 0;

    const handleSave = () => {
        onSave(draft.trim());
        setIsEditing(false);
    };

    const handleCancel = () => {
        setDraft(note);
        setIsEditing(false);
    };

    const handleOpen = () => {
        setDraft(note);
        setIsEditing(true);
    };

    return (
        <div className={className}>
            {/* Header row */}
            <div className="flex items-center justify-between">
                <span
                    className="text-label-sm font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-color)' }}
                >
                    Notes:
                </span>
                {!isEditing && !hasNote && (
                    <button
                        onClick={handleOpen}
                        style={{ color: 'var(--icon-cta)' }}
                    >
                        <Plus size={20} />
                    </button>
                )}
                {!isEditing && hasNote && (
                    <button
                        onClick={handleOpen}
                        className="text-label-sm font-bold uppercase tracking-wider"
                        style={{ color: 'var(--icon-cta)' }}
                    >
                        Edit
                    </button>
                )}
            </div>

            {/* Editing state */}
            {isEditing && (
                <div className="mt-2 space-y-2">
                    <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Add a note..."
                        autoFocus
                    />
                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            className="text-label-sm font-bold uppercase tracking-wider"
                            style={{ color: 'var(--icon-cta)' }}
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="text-label-sm font-bold uppercase tracking-wider"
                            style={{ color: 'var(--icon-cta)' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Note preview (closed with note) */}
            {!isEditing && hasNote && (
                <p
                    className="mt-1 text-paragraph-sm"
                    style={{ color: 'var(--text-paragraph)' }}
                >
                    {note}
                </p>
            )}
        </div>
    );
}
