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
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, paddingTop: 'var(--spacing-700)', paddingBottom: 'var(--spacing-400)', paddingLeft: 'var(--spacing-400)', paddingRight: 'var(--spacing-400)', zIndex: 40, background: 'linear-gradient(to top, var(--background), var(--background) 60%, transparent)' }}
    >
      <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
        <CTAButton onClick={handleFinish} size="lg" fullWidth>
          Finish
        </CTAButton>
      </div>
    </div>
  );

  return (
    <AppLayout header={<PageHeader center="Workout Complete" />} footer={finishFooter}>
      <div className="stagger-reveal" style={{ paddingTop: 'var(--spacing-600)', paddingBottom: 'calc(var(--spacing-600) * 4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-600)' }}>
          <h2
            className="text-heading-h2 glow-emissive"
            style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em', color: 'var(--text-header)' }}
          >
            Nice Work!
          </h2>
        </div>

        <Card padding="md" style={{ marginBottom: 'var(--spacing-600)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <p
                className="text-heading-h5"
                style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', color: 'var(--text-header)' }}
              >
                {generatedWorkout.goal ? `${generatedWorkout.goal.replace('_', ' ')} · ` : ''}{generatedWorkout.anchor} &bull; Intensity {generatedWorkout.intensity}
              </p>
              <p className="text-paragraph-sm" style={{ marginTop: 'var(--spacing-100)', color: 'var(--text-paragraph)' }}>
                {formatDuration(totalTime)} &bull; {generatedWorkout.sections.length} sections
              </p>
            </div>
            {currentSessionId && (
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteSaving}
                style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'calc(var(--spacing-200) * -1)', marginTop: 'calc(var(--spacing-100) * -1)' }}
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

        <Card padding="md" style={{ marginBottom: 'var(--spacing-600)' }}>
          <h3
            className="text-label-xs"
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--spacing-400)', color: 'var(--text-card-label)' }}
          >
            How Do You Feel?
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-200)' }}>
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selectedMood === mood.value;
              return (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  style={{ flex: 1, paddingTop: 'var(--spacing-300)', paddingBottom: 'var(--spacing-300)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-200)', transition: 'all 150ms', color: isSelected ? 'var(--text-label-selected)' : 'var(--text-paragraph)', opacity: isSelected ? 1 : 0.5 }}
                  aria-label={mood.label}
                >
                  <MoodIcon mood={mood.value} size={32} selected={isSelected} />
                  <span className="text-label-xs">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card padding="md" style={{ marginBottom: 'var(--spacing-600)' }}>
          <h3
            className="text-label-xs"
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--spacing-400)', color: 'var(--text-card-label)' }}
          >
            Session Notes
          </h3>

          {/* Previous session notes (favorite repeats only) */}
          {notesHistory.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)', marginBottom: 'var(--spacing-400)' }}>
              {notesHistory.map((entry, i) => (
                <div key={i}>
                  <p
                    className="text-label-xs"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2, color: 'var(--text-disabled)' }}
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
                style={{ height: 1, backgroundColor: 'var(--border-spacer)' }}
              />
            </div>
          )}

          <Textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder={notesHistory.length > 0 ? "Add notes for this session..." : "Add any notes about this workout..."}
            style={{ minHeight: 96 }}
          />
        </Card>

        <Card padding="md">
          <h3
            className="text-label-xs"
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--spacing-400)', color: 'var(--text-card-label)' }}
          >
            Streak
          </h3>

          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-400)' }}>
            <span className="text-heading-h2" style={{ fontWeight: 700, color: 'var(--text-disabled)' }}>
              {streakData.currentStreak}
            </span>
            <span className="text-heading-h2" style={{ fontWeight: 700, margin: '0 var(--spacing-200)', color: 'var(--icon-badge)' }}>
              &rarr;
            </span>
            <span className="text-heading-h1 glow-emissive" style={{ fontWeight: 700, color: 'var(--text-header)' }}>
              {newStreak}
            </span>
            <span style={{ marginLeft: 'var(--spacing-200)' }}>
              <Flame size={28} style={{ display: 'inline', color: 'var(--icon-badge)' }} />
            </span>
            <p className="text-label-sm" style={{ marginTop: 'var(--spacing-100)', color: 'var(--text-paragraph)' }}>days</p>
          </div>

          <WeekStreakDisplay weekView={streakData.weekView} highlightToday />
        </Card>
      </div>
    </AppLayout>
  );
};
