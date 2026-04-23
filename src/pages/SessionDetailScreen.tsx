import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ThumbsDown,
  Frown,
  Meh,
  Smile,
  SmilePlus,
  ChevronDown,
  ChevronRight,
  FileText,
  Star,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Card } from "@/components/Card";
import { CTAButton } from "@/components/CTAButton";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { fetchWorkoutDetail } from "@/lib/home-data";
import { Input } from "@/components/ui/input";
import { isFavorited as checkIsFavorited, saveFavorite, removeFavorite, renameFavorite, getFavoriteDetail } from "@/lib/favorites-api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/components/ui/sonner";
import { useWorkoutFlowContext } from "@/contexts/WorkoutFlowContext";
import { formatDateTitle } from "@/lib/date-utils";
import type { LoggedSection, LoggedStructureResult } from "@/types/workout";

const MOOD_ICONS: Record<number, React.FC<IconProps>> = {
  1: ThumbsDown,
  2: Frown,
  3: Meh,
  4: Smile,
  5: SmilePlus,
};

/** Format seconds as MM:SS */
function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** Render structure result badge for timed sections */
function StructureResultBadge({ result }: { result: LoggedStructureResult }) {
  const parts: string[] = [];

  if (result.structureType === 'amrap') {
    if (result.roundsCompleted != null) {
      parts.push(`${result.roundsCompleted} round${result.roundsCompleted !== 1 ? 's' : ''}`);
    }
    if (result.completionTimeSeconds != null) {
      parts.push(formatTime(result.completionTimeSeconds));
    }
  } else if (result.structureType === 'for_time') {
    if (result.completedUnderCap) {
      parts.push('Completed');
      if (result.completionTimeSeconds != null) {
        parts.push(formatTime(result.completionTimeSeconds));
      }
    } else {
      parts.push('Cap reached');
      if (result.highestRung != null) {
        parts.push(`rung ${result.highestRung + 1}`);
      }
    }
  }

  if (result.notes) {
    parts.push(result.notes);
  }

  if (parts.length === 0) return null;

  return (
    <p className="text-paragraph-sm" style={{ marginTop: 'var(--spacing-100)', color: 'var(--text-timer)' }}>
      {parts.join(' • ')}
    </p>
  );
}

/** Check if a section has any logged data (weights or notes) */
function sectionHasLoggedData(section: LoggedSection): boolean {
  return section.exercises.some(ex => ex.weight || ex.note);
}

/** Collapsible section: exercises always visible, expand to see logged weights/notes */
function SectionBlock({ section }: { section: LoggedSection }) {
  const [expanded, setExpanded] = useState(false);
  const hasLoggedData = sectionHasLoggedData(section);

  return (
    <Card cornerSize="md" padding="none">
      {/* Section header */}
      <div style={{ paddingLeft: 'var(--spacing-400)', paddingRight: 'var(--spacing-400)', paddingTop: 'var(--spacing-300)', paddingBottom: 'var(--spacing-300)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)' }}>
            <span
              className="text-label-xs"
              style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-card-label)' }}
            >
              {section.name}
            </span>
          </div>
          {hasLoggedData && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ color: 'var(--text-card-label)' }}
            >
              {expanded
                ? <ChevronDown size={16} />
                : <ChevronRight size={16} />
              }
            </button>
          )}
        </div>
      </div>

      {/* Structure result summary */}
      {section.structureResult && (
        <div style={{ paddingLeft: 'var(--spacing-400)', paddingRight: 'var(--spacing-400)', marginTop: 'calc(var(--spacing-100) * -1)', paddingBottom: 'var(--spacing-200)' }}>
          <span
            className="text-label-xs"
            style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-timer)' }}
          >
            {section.structureResult.structureType.replace('_', ' ')}
          </span>
          <StructureResultBadge result={section.structureResult} />
        </div>
      )}

      {/* Exercise list — always visible */}
      <div style={{ paddingLeft: 'var(--spacing-400)', paddingRight: 'var(--spacing-400)', paddingBottom: 'var(--spacing-300)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)' }}>
        <div
          style={{ height: 1, backgroundColor: 'var(--border-spacer)' }}
        />

        {section.exercises.map((exercise) => (
          <div key={exercise.id}>
            {/* Exercise name */}
            <p
              className="text-label-sm"
              style={{ fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.25, color: 'var(--text-card-header)' }}
            >
              {exercise.name}
            </p>

            {/* Prescription: sets×reps + equipment */}
            <p
              className="text-paragraph-sm"
              style={{ marginTop: 2, color: 'var(--text-paragraph)' }}
            >
              {exercise.sets}×{exercise.reps}
              {exercise.equipment && ` • ${exercise.equipment}`}
            </p>

            {/* Logged data: weight + notes — only when expanded */}
            {expanded && (
              <>
                {exercise.weight && (
                  <p
                    className="text-label-xs"
                    style={{ marginTop: 'var(--spacing-100)', fontWeight: 700, color: 'var(--text-timer)' }}
                  >
                    {exercise.weight}
                  </p>
                )}

                {exercise.note && (
                  <p
                    className="text-paragraph-sm"
                    style={{ marginTop: 'var(--spacing-100)', display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-100)', color: 'var(--text-timer)' }}
                  >
                    <FileText size={12} style={{ marginTop: 2, flexShrink: 0 }} />
                    {exercise.note}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export const SessionDetailScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { handleRepeatFromHistory, handleRepeatFromFavorite } = useWorkoutFlowContext();

  // If navigated from favorites, we have the savedWorkoutId in route state
  const savedWorkoutId = (location.state as { savedWorkoutId?: string } | null)?.savedWorkoutId || null;

  const [favoriteState, setFavoriteState] = useState<{
    isFav: boolean;
    savedWorkoutId?: string;
    loading: boolean;
  }>({ isFav: false, loading: true });
  const [showUnfavoriteModal, setShowUnfavoriteModal] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  // Favorite name editing
  const [favoriteName, setFavoriteName] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");

  const { data: workout, isLoading, isError } = useQuery({
    queryKey: queryKeys.workoutDetail(id!),
    queryFn: () => fetchWorkoutDetail(id!),
    enabled: !!id,
  });

  // Check favorite status on load
  // If navigated from favorites tab, we already know the savedWorkoutId
  useEffect(() => {
    if (!id) return;
    if (savedWorkoutId) {
      setFavoriteState({ isFav: true, savedWorkoutId, loading: false });
      // Fetch the favorite's custom title
      getFavoriteDetail(savedWorkoutId).then(detail => {
        if (detail?.title) setFavoriteName(detail.title);
      });
      return;
    }
    checkIsFavorited(id).then(result => {
      setFavoriteState({
        isFav: result.isFavorited,
        savedWorkoutId: result.savedWorkoutId,
        loading: false,
      });
      // Fetch title if favorited
      if (result.isFavorited && result.savedWorkoutId) {
        getFavoriteDetail(result.savedWorkoutId).then(detail => {
          if (detail?.title) setFavoriteName(detail.title);
        });
      }
    });
  }, [id, savedWorkoutId]);

  useEffect(() => {
    if (isError || (workout === null && !isLoading)) {
      toast.error("Couldn't load workout details");
      navigate("/history", { replace: true });
    }
  }, [isError, workout, isLoading, navigate]);

  const handleToggleFavorite = async () => {
    if (!id) return;

    if (favoriteState.isFav) {
      // Show confirmation modal before unfavoriting
      setShowUnfavoriteModal(true);
      return;
    }

    // Optimistic UI
    setFavoriteState(prev => ({ ...prev, isFav: true, loading: false }));

    const result = await saveFavorite(id, false);
    if ('error' in result) {
      // Revert
      setFavoriteState(prev => ({ ...prev, isFav: false }));
      toast.error("Couldn't save favorite");
    } else {
      setFavoriteState({ isFav: true, savedWorkoutId: result.savedWorkoutId, loading: false });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites() });
      toast.success("Added to favorites");
    }
  };

  const handleConfirmUnfavorite = async () => {
    setShowUnfavoriteModal(false);
    if (!favoriteState.savedWorkoutId) return;

    // Optimistic UI
    const prevId = favoriteState.savedWorkoutId;
    setFavoriteState({ isFav: false, savedWorkoutId: undefined, loading: false });

    const result = await removeFavorite(prevId);
    if (!result.success) {
      // Revert
      setFavoriteState({ isFav: true, savedWorkoutId: prevId, loading: false });
      toast.error("Couldn't remove favorite");
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites() });
      toast.success("Removed from favorites");
    }
  };

  const handleStartEditName = () => {
    setEditNameValue(favoriteName || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = editNameValue.trim();
    if (!trimmed || !favoriteState.savedWorkoutId) {
      setIsEditingName(false);
      return;
    }
    setFavoriteName(trimmed);
    setIsEditingName(false);
    const result = await renameFavorite(favoriteState.savedWorkoutId, trimmed);
    if (!result.success) {
      toast.error("Couldn't rename favorite");
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites() });
    }
  };

  const handleRepeat = async () => {
    if (!id || isRepeating) return;
    setIsRepeating(true);
    try {
      if (savedWorkoutId) {
        await handleRepeatFromFavorite(savedWorkoutId, () => navigate("/review"));
      } else {
        await handleRepeatFromHistory(id, () => navigate("/review"));
      }
    } finally {
      setIsRepeating(false);
    }
  };

  return (
    <AppLayout header={<PageHeader left="back" onBack={() => navigate("/history")} center="Session" right="menu" onMenu={() => navigate("/settings")} />}>
      <div className="stagger-reveal" style={{ paddingTop: 'var(--spacing-600)' }}>
        {isLoading || !workout ? (
          <LoadingSkeleton count={4} />
        ) : (
          <>
            <Card padding="md" style={{ marginBottom: 'var(--spacing-600)' }}>
              {/* Date + star toggle */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--spacing-200)' }}>
                <h1
                  className="text-heading-h4"
                  style={{ fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-header)' }}
                >
                  {formatDateTitle(workout.date)}
                </h1>
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteState.loading}
                  style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 'calc(var(--spacing-200) * -1)', marginTop: 'calc(var(--spacing-100) * -1)' }}
                >
                  <Star
                    size={24}
                    style={{
                      color: favoriteState.isFav ? 'var(--icon-badge)' : 'var(--text-disabled)',
                      opacity: favoriteState.loading ? 0.3 : 1,
                    }}
                  />
                </button>
              </div>

              {/* Favorite name + edit link */}
              {favoriteState.isFav && (
                <div style={{ marginBottom: 'var(--spacing-200)', marginTop: 'calc(var(--spacing-100) * -1)' }}>
                  {isEditingName ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)' }}>
                      <Input
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName();
                          if (e.key === 'Escape') setIsEditingName(false);
                        }}
                        autoFocus
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={handleSaveName}
                        className="text-label-xs"
                        style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-cta)' }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)' }}>
                      {favoriteName && (
                        <p
                          className="text-paragraph-sm"
                          style={{ fontWeight: 500, color: 'var(--text-paragraph)' }}
                        >
                          {favoriteName}
                        </p>
                      )}
                      <button
                        onClick={handleStartEditName}
                        className="text-label-xs"
                        style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: 'var(--text-cta)' }}
                      >
                        {favoriteName ? 'Edit Name' : 'Add Name'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Anchor, intensity + mood on right */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p
                    className="text-heading-h5"
                    style={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.025em', color: 'var(--text-header)' }}
                  >
                    {workout.anchor} &bull; Intensity {workout.intensity}
                  </p>
                  <p className="text-paragraph-sm" style={{ textTransform: 'uppercase', color: 'var(--text-paragraph)' }}>
                    {workout.duration} min {workout.goal && `\u2022 ${workout.goal}`}
                  </p>
                </div>
                {workout.mood && (() => {
                  const MoodIcon = MOOD_ICONS[workout.mood];
                  return MoodIcon ? (
                    <div style={{ color: 'var(--text-paragraph)' }}>
                      <MoodIcon size={24} />
                    </div>
                  ) : null;
                })()}
              </div>
            </Card>

            {workout.sections && workout.sections.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)' }}>
                {workout.sections.map((section) => (
                  <SectionBlock key={section.id} section={section} />
                ))}
              </div>
            ) : (
              <Card padding="md" style={{ textAlign: 'center' }}>
                <p className="text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
                  No detailed workout data available
                </p>
              </Card>
            )}

            {workout.sessionNotes && (
              <Card padding="md" style={{ marginTop: 'var(--spacing-300)' }}>
                <h2
                  className="text-label-xs"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--spacing-200)', color: 'var(--text-card-label)' }}
                >
                  Session Notes
                </h2>
                <p className="text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
                  {workout.sessionNotes}
                </p>
              </Card>
            )}

            {/* Repeat button */}
            <div style={{ marginTop: 'var(--spacing-600)', marginBottom: 'var(--spacing-400)' }}>
              <CTAButton
                onClick={handleRepeat}
                disabled={isRepeating}
                variant="secondary"
                size="lg"
                fullWidth
              >
                Repeat Workout
              </CTAButton>
            </div>
          </>
        )}
      </div>

      {showUnfavoriteModal && (
        <ConfirmationModal
          title="Remove from Favorites?"
          description="Tracked data including completion history and personal bests will be lost."
          confirmLabel="Remove"
          onConfirm={handleConfirmUnfavorite}
          onCancel={() => setShowUnfavoriteModal(false)}
        />
      )}
    </AppLayout>
  );
};
