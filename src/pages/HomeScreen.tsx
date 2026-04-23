import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { TabbedPanel } from "@/components/TabbedPanel";
import { Zap, Flame, Dumbbell, Star } from "@/components/icons";
import { WeekStreakDisplay } from "@/components/WeekStreakDisplay";
import { WorkoutListItem } from "@/components/WorkoutListItem";
import { FavoriteListItem } from "@/components/FavoriteListItem";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useHomeDataContext } from "@/contexts/HomeDataContext";
import { useWorkoutFlowContext } from "@/contexts/WorkoutFlowContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { toast } from "@/components/ui/sonner";
import { getSuggestedAnchor, getSuggestedIntensity } from "@/types/workout";
import { getFavorites, getMostRecentSessionId, type SavedWorkoutSummary } from "@/lib/favorites-api";
import { queryKeys } from "@/lib/query-keys";

type HomeTab = 'history' | 'favorites';

function HomeFavoritesList() {
  const navigate = useNavigate();
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: queryKeys.favorites(),
    queryFn: getFavorites,
  });

  if (isLoading) {
    return <LoadingSkeleton count={3} showLeftColumn={false} />;
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No Favorites Yet"
        description="Star a workout from history or after completing one"
        showLeftColumn={false}
      />
    );
  }

  const handleFavoriteClick = async (fav: SavedWorkoutSummary) => {
    if (!fav.originalSessionId) return;
    const sessionId = await getMostRecentSessionId(fav.id, fav.originalSessionId);
    navigate(`/history/${sessionId}`, { state: { savedWorkoutId: fav.id } });
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
        {favorites.map((fav) => (
          <FavoriteListItem
            key={fav.id}
            favorite={fav}
            onClick={() => handleFavoriteClick(fav)}
            showLeftColumn={false}
          />
        ))}
      </div>

      <button
        onClick={() => navigate("/history")}
        className="text-paragraph-sm transition-colors"
        style={{ width: '100%', marginTop: 'var(--spacing-300)', paddingTop: 'var(--spacing-200)', paddingBottom: 'var(--spacing-200)', textAlign: 'center', fontWeight: 500, color: 'var(--text-cta)' }}
      >
        View All Favorites
      </button>
    </>
  );
}

export const HomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<HomeTab>('favorites');
  const {
    workoutHistory,
    streakData,
    isLoading,
    hasError,
    loadHomeData,
    incompleteSession,
    clearIncompleteSession,
  } = useHomeDataContext();
  const workoutFlow = useWorkoutFlowContext();

  const hasHistory = workoutHistory.length > 0;
  const suggestedIntensity = getSuggestedIntensity(workoutHistory);
  const suggestedAnchor = getSuggestedAnchor(workoutHistory);

  const handleMarkRestDay = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          date: today,
          is_rest_day: true,
          counts_for_streak: true,
          anchor: 'full_body',
          intensity: 0,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info("Already logged today");
        } else {
          logger.data.error('Error marking rest day', { error: error.message });
          toast.error("Failed to mark rest day");
        }
        return;
      }

      toast.success("Rest day marked!", { description: "Your streak is preserved." });
      await loadHomeData();
    } catch (err) {
      logger.data.error('Error marking rest day', { error: err instanceof Error ? err.message : String(err) });
      toast.error("Something went wrong");
    }
  };

  const handleAbandonIncomplete = async () => {
    if (!incompleteSession) return;
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', incompleteSession.id);
    if (error) {
      logger.data.error('Error abandoning incomplete session', { error: error.message });
      toast.error("Failed to abandon workout");
      return;
    }
    clearIncompleteSession();
    await loadHomeData();
  };

  const handleResumeIncomplete = async () => {
    if (!incompleteSession) return;
    const success = await workoutFlow.handleResumeIncomplete(incompleteSession.id);
    if (success) {
      clearIncompleteSession();
      navigate("/review");
    } else {
      toast.info("Couldn't load workout details. Starting fresh.");
      handleAbandonIncomplete();
    }
  };

  return (
    <AppLayout header={<PageHeader right="menu" onMenu={() => navigate("/settings")} />}>
      <div className="stagger-reveal" style={{ paddingTop: 'var(--spacing-600)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-600)' }}>
        <Card
          onClick={() => navigate("/generate")}
          padding="md"
          borderColor="var(--border-cta-primary)"
          accentColor="var(--surface-cta-primary-accent)"
          surfaceColor="var(--surface-cta-primary)"
        >
          <h2
            className="text-heading-h2"
            style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-200)', color: 'var(--text-on-cta)' }}
          >
            Generate Workout
          </h2>
          <p className="text-paragraph-sm" style={{ color: 'var(--text-on-cta)' }}>
            Set intensity, anchor, and build your session
          </p>
        </Card>

        <Card
          onClick={hasHistory ? () => workoutFlow.handleQuickStart(suggestedIntensity, suggestedAnchor, () => navigate("/review")) : undefined}
          padding="md"
          className={!hasHistory ? "cursor-not-allowed" : ""}
          style={!hasHistory ? { opacity: 0.5 } : undefined}
          borderColor="var(--border-cta-primary)"
          accentColor="var(--surface-cta-primary-accent)"
          surfaceColor="var(--surface-cta-primary)"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)', marginBottom: 'var(--spacing-200)' }}>
            <Zap style={{ width: 20, height: 20, color: 'var(--icon-on-cta)' }} />
            <span
              className="text-heading-h5"
              style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-on-cta)' }}
            >
              Quick Start
            </span>
          </div>
          {hasHistory ? (
            <p className="text-paragraph-sm" style={{ color: 'var(--text-on-cta)' }}>
              Intensity: {suggestedIntensity} &bull; Anchor: {suggestedAnchor}
            </p>
          ) : (
            <p className="text-paragraph-sm" style={{ color: 'var(--text-on-cta)' }}>
              Start your first workout
            </p>
          )}
        </Card>

        <Card padding="md">
          <h3
            className="text-label-xs"
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--spacing-400)', color: 'var(--text-card-label)' }}
          >
            Streak
          </h3>

          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-400)' }}>
            <span className="text-heading-h1 glow-emissive" style={{ fontWeight: 700, color: 'var(--text-header)' }}>
              {streakData.currentStreak}
            </span>
            <span style={{ marginLeft: 'var(--spacing-200)' }}>
              <Flame style={{ display: 'inline', width: 32, height: 32, color: 'var(--icon-badge)' }} />
            </span>
            <p className="text-label-sm" style={{ marginTop: 'var(--spacing-100)', color: 'var(--text-paragraph)' }}>days</p>
          </div>

          <WeekStreakDisplay weekView={streakData.weekView} style={{ marginBottom: 'var(--spacing-400)' }} />

          {streakData.weekView[new Date().toISOString().split('T')[0]] !== 'workout' && <CTAButton onClick={handleMarkRestDay} variant="secondary" size="sm" fullWidth>
            Mark Rest Day
          </CTAButton>}
        </Card>

        {/* History / Favorites tabs */}
        <TabbedPanel
          tabs={[
            { value: 'favorites' as const, label: 'Favorites' },
            { value: 'history' as const, label: 'History' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        >
          {activeTab === 'history' && (
            <>
              {isLoading ? (
                <LoadingSkeleton count={3} showLeftColumn={false} />
              ) : hasError ? (
                <ErrorState message="Couldn't load workouts" onRetry={loadHomeData} showLeftColumn={false} />
              ) : workoutHistory.length === 0 ? (
                <Card padding="md" showLeftColumn={false}>
                  <div style={{ textAlign: 'center' }}>
                    <Dumbbell style={{ width: 40, height: 40, margin: '0 auto', marginBottom: 'var(--spacing-400)', color: 'var(--text-disabled)' }} />
                    <p
                      className="text-heading-h5"
                      style={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: 'var(--spacing-100)', color: 'var(--text-header)' }}
                    >
                      No Workouts Yet
                    </p>
                    <p className="text-paragraph-sm" style={{ marginBottom: 'var(--spacing-400)', color: 'var(--text-paragraph)' }}>
                      Generate your first workout to get started
                    </p>
                    <CTAButton onClick={() => navigate("/generate")} variant="secondary" size="sm" fullWidth>
                      Generate
                    </CTAButton>
                  </div>
                </Card>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
                    {workoutHistory.slice(0, 3).map((workout) => (
                      <WorkoutListItem
                        key={workout.id}
                        workout={workout}
                        onClick={() => navigate(`/history/${workout.id}`)}
                        showLeftColumn={false}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => navigate("/history")}
                    className="text-paragraph-sm transition-colors"
                    style={{ width: '100%', marginTop: 'var(--spacing-300)', paddingTop: 'var(--spacing-200)', paddingBottom: 'var(--spacing-200)', textAlign: 'center', fontWeight: 500, color: 'var(--text-cta)' }}
                  >
                    View All History
                  </button>
                </>
              )}
            </>
          )}

          {activeTab === 'favorites' && (
            <HomeFavoritesList />
          )}
        </TabbedPanel>
      </div>

      {incompleteSession && (
        <ConfirmationModal
          title="Incomplete Workout"
          description={`You have an unfinished workout from ${incompleteSession.date}. Would you like to continue or start fresh?`}
          confirmLabel="Resume Workout"
          cancelLabel="Abandon & Start Fresh"
          onConfirm={handleResumeIncomplete}
          onCancel={handleAbandonIncomplete}
        />
      )}
    </AppLayout>
  );
};
