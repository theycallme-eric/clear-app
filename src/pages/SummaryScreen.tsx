import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Flame, Star } from "@/components/icons";
import { MoodIcon, MoodValue } from "@/components/MoodIcon";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { WeekStreakDisplay } from "@/components/WeekStreakDisplay";
import { Textarea } from "@/components/ui/textarea";
import { useWorkoutFlowContext } from "@/contexts/WorkoutFlowContext";
import { useHomeDataContext } from "@/contexts/HomeDataContext";
import { saveFavorite, removeFavorite } from "@/lib/favorites-api";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

const MOOD_OPTIONS: { value: MoodValue; label: string }[] = [
  { value: 1, label: "Exhausted" },
  { value: 2, label: "Tough" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Great" },
];

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
};

export const SummaryScreen = () => {
  const navigate = useNavigate();
  const { generatedWorkout, workoutNotes, totalTime, handleFinishSession, currentSessionId, repeatSavedWorkoutId } = useWorkoutFlowContext();
  const { streakData } = useHomeDataContext();
  const queryClient = useQueryClient();

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [isFavorited, setIsFavorited] = useState(!!repeatSavedWorkoutId);
  const [savedWorkoutId, setSavedWorkoutId] = useState<string | null>(repeatSavedWorkoutId);
  const [favoriteSaving, setFavoriteSaving] = useState(false);

  if (!generatedWorkout || !workoutNotes) {
    return <Navigate to="/" replace />;
  }

  const notesHistory = generatedWorkout.sessionNotesHistory || [];
  const newStreak = streakData.currentStreak + 1;

  const handleToggleFavorite = async () => {
    if (!currentSessionId || favoriteSaving) return;
    setFavoriteSaving(true);

    if (isFavorited && savedWorkoutId) {
      // Undo — remove favorite
      setIsFavorited(false);
      const result = await removeFavorite(savedWorkoutId);
      setFavoriteSaving(false);
      if (!result.success) {
        setIsFavorited(true);
        toast.error("Couldn't remove favorite");
      } else {
        setSavedWorkoutId(null);
        queryClient.invalidateQueries({ queryKey: queryKeys.favorites() });
      }
    } else {
      // Save as favorite
      setIsFavorited(true);
      const result = await saveFavorite(currentSessionId, true);
      setFavoriteSaving(false);
      if ('error' in result) {
        setIsFavorited(false);
        toast.error("Couldn't save favorite");
      } else {
        setSavedWorkoutId(result.savedWorkoutId);
        queryClient.invalidateQueries({ queryKey: queryKeys.favorites() });
        toast.success("Added to favorites");
      }
    }
  };

  const handleFinish = async () => {
    await handleFinishSession(selectedMood, sessionNotes, () => navigate("/"));
  };

  const finishFooter = (
    <div
      className="fixed bottom-0 left-0 right-0 pt-8 pb-4 px-4 z-40"
      style={{ background: 'linear-gradient(to top, var(--color-neutral-900), var(--color-neutral-900) 60%, transparent)' }}
    >
      <div className="max-w-md mx-auto">
        <CTAButton onClick={handleFinish} size="lg" fullWidth>
          Finish
        </CTAButton>
      </div>
    </div>
  );

  return (
    <AppLayout header={<PageHeader center="Workout Complete" />} footer={finishFooter}>
      <div className="pt-6 pb-24 stagger-reveal">
        <div className="text-center mb-6">
          <h2
            className="text-heading-h2 font-bold uppercase tracking-wide glow-emissive"
            style={{ color: 'var(--text-header)' }}
          >
            Nice Work!
          </h2>
        </div>

        <Card padding="md" className="mb-6">
          <div className="flex items-start justify-between">
            <div className="text-center flex-1">
              <p
                className="text-heading-h5 font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-header)' }}
              >
                {generatedWorkout.goal ? `${generatedWorkout.goal.replace('_', ' ')} · ` : ''}{generatedWorkout.anchor} &bull; Intensity {generatedWorkout.intensity}
              </p>
              <p className="text-paragraph-sm mt-1" style={{ color: 'var(--text-paragraph)' }}>
                {formatDuration(totalTime)} &bull; {generatedWorkout.sections.length} sections
              </p>
            </div>
            {currentSessionId && (
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteSaving}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 -mt-1"
              >
                <Star
                  size={24}
                  style={{
                    color: isFavorited ? 'var(--icon-badge)' : 'var(--text-disabled)',
                    opacity: favoriteSaving ? 0.3 : 1,
                  }}
                />
              </button>
            )}
          </div>
        </Card>

        <Card padding="md" className="mb-6">
          <h3
            className="text-label-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-card-label)' }}
          >
            How Do You Feel?
          </h3>
          <div className="flex justify-between gap-2">
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selectedMood === mood.value;
              return (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className="flex-1 py-3 flex flex-col items-center justify-center gap-2 transition-all"
                  style={{ color: isSelected ? 'var(--text-label-selected)' : 'var(--text-paragraph)', opacity: isSelected ? 1 : 0.5 }}
                  aria-label={mood.label}
                >
                  <MoodIcon mood={mood.value} size={32} selected={isSelected} />
                  <span className="text-label-xs">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card padding="md" className="mb-6">
          <h3
            className="text-label-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-card-label)' }}
          >
            Session Notes
          </h3>

          {/* Previous session notes (favorite repeats only) */}
          {notesHistory.length > 0 && (
            <div className="space-y-3 mb-4">
              {notesHistory.map((entry, i) => (
                <div key={i}>
                  <p
                    className="text-label-xs uppercase tracking-wider mb-0.5"
                    style={{ color: 'var(--text-disabled)' }}
                  >
                    {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p
                    className="text-paragraph-sm"
                    style={{ color: 'var(--text-paragraph)' }}
                  >
                    {entry.notes}
                  </p>
                </div>
              ))}
              <div
                className="h-px"
                style={{ backgroundColor: 'var(--border-spacer)' }}
              />
            </div>
          )}

          <Textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder={notesHistory.length > 0 ? "Add notes for this session..." : "Add any notes about this workout..."}
            className="min-h-[96px]"
          />
        </Card>

        <Card padding="md">
          <h3
            className="text-label-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-card-label)' }}
          >
            Streak
          </h3>

          <div className="text-center mb-4">
            <span className="text-heading-h2 font-bold" style={{ color: 'var(--text-disabled)' }}>
              {streakData.currentStreak}
            </span>
            <span className="text-heading-h2 font-bold mx-2" style={{ color: 'var(--icon-badge)' }}>
              &rarr;
            </span>
            <span className="text-heading-h1 font-bold glow-emissive" style={{ color: 'var(--text-header)' }}>
              {newStreak}
            </span>
            <span className="ml-2">
              <Flame size={28} className="inline" style={{ color: 'var(--icon-badge)' }} />
            </span>
            <p className="text-label-sm mt-1" style={{ color: 'var(--text-paragraph)' }}>days</p>
          </div>

          <WeekStreakDisplay weekView={streakData.weekView} highlightToday />
        </Card>
      </div>
    </AppLayout>
  );
};
