import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Dumbbell,
  Star,
} from "@/components/icons";
import { WorkoutListItem } from "@/components/WorkoutListItem";
import { FavoriteListItem } from "@/components/FavoriteListItem";
import { PageHeader } from "@/components/PageHeader";
import { TabbedPanel } from "@/components/TabbedPanel";
import { AppLayout } from "@/layouts";
import { MovementPattern, GoalPreset, GOAL_PRESETS } from "@/types/workout";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/Card";
import { FilterDropdown, FilterToggle, type FilterOption } from "@/components/FilterDropdown";
import { useHomeDataContext } from "@/contexts/HomeDataContext";
import { getFavorites, getMostRecentSessionId, SavedWorkoutSummary } from "@/lib/favorites-api";
import { queryKeys } from "@/lib/query-keys";

type TabValue = 'history' | 'favorites';
type AnchorFilter = MovementPattern | 'ALL';
type IntensityFilter = 'ALL' | '1-2' | '3-4' | '5-6' | '7-8' | '9-10';
type GoalFilter = GoalPreset | 'ALL';

const ANCHOR_OPTIONS: FilterOption<AnchorFilter>[] = [
  { value: 'ALL', label: 'All Anchors' },
  { value: 'squat', label: 'Squat' },
  { value: 'hinge', label: 'Hinge' },
  { value: 'press', label: 'Press' },
  { value: 'pull', label: 'Pull' },
  { value: 'power', label: 'Power' },
];

const INTENSITY_OPTIONS: FilterOption<IntensityFilter>[] = [
  { value: 'ALL', label: 'All Levels' },
  { value: '1-2', label: '1-2 (Light)' },
  { value: '3-4', label: '3-4 (Easy)' },
  { value: '5-6', label: '5-6 (Mod)' },
  { value: '7-8', label: '7-8 (Hard)' },
  { value: '9-10', label: '9-10 (Max)' },
];

const GOAL_OPTIONS: FilterOption<GoalFilter>[] = [
  { value: 'ALL', label: 'All Goals' },
  ...GOAL_PRESETS.map(g => ({ value: g.value as GoalFilter, label: g.label })),
];

function FavoritesList({ anchorFilter, intensityFilter, goalFilter }: { anchorFilter: AnchorFilter; intensityFilter: IntensityFilter; goalFilter: GoalFilter }) {
  const navigate = useNavigate();
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: queryKeys.favorites(),
    queryFn: getFavorites,
  });

  const isActiveFilter = anchorFilter !== 'ALL' || intensityFilter !== 'ALL' || goalFilter !== 'ALL';

  const filteredFavorites = favorites.filter((fav) => {
    if (anchorFilter !== 'ALL' && fav.anchor !== anchorFilter) return false;
    if (intensityFilter !== 'ALL' && fav.intensity != null) {
      const [min, max] = intensityFilter.split('-').map(Number);
      if (fav.intensity < min || fav.intensity > max) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Card key={i} padding="md" showLeftColumn={false}>
            <div className="h-4 rounded" style={{ backgroundColor: 'var(--surface-card-accent)', width: '60%' }} />
            <div className="h-3 rounded mt-2" style={{ backgroundColor: 'var(--surface-card-accent)', width: '40%' }} />
          </Card>
        ))}
      </div>
    );
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

  if (filteredFavorites.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No Matches"
        description="Try adjusting your filters"
        showLeftColumn={false}
      />
    );
  }

  const handleFavoriteClick = async (fav: SavedWorkoutSummary) => {
    if (!fav.originalSessionId) return;
    // Show the most recent completion's data, falling back to original session
    const sessionId = await getMostRecentSessionId(fav.id, fav.originalSessionId);
    navigate(`/history/${sessionId}`, { state: { savedWorkoutId: fav.id } });
  };

  return (
    <div className="space-y-2">
      {filteredFavorites.map((fav: SavedWorkoutSummary) => (
        <FavoriteListItem
          key={fav.id}
          favorite={fav}
          onClick={() => handleFavoriteClick(fav)}
          showLeftColumn={false}
        />
      ))}
    </div>
  );
}

export const HistoryScreen = () => {
  const navigate = useNavigate();
  const { workoutHistory } = useHomeDataContext();

  const [activeTab, setActiveTab] = useState<TabValue>('history');
  const [anchorFilter, setAnchorFilter] = useState<AnchorFilter>('ALL');
  const [intensityFilter, setIntensityFilter] = useState<IntensityFilter>('ALL');
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('ALL');

  const filteredWorkouts = workoutHistory.filter((workout) => {
    if (anchorFilter !== 'ALL' && workout.anchor !== anchorFilter) return false;
    if (intensityFilter !== 'ALL') {
      const [min, max] = intensityFilter.split('-').map(Number);
      if (workout.intensity < min || workout.intensity > max) return false;
    }
    if (goalFilter !== 'ALL' && workout.goal !== goalFilter) return false;
    return true;
  });

  const sortedWorkouts = [...filteredWorkouts].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const groupedByMonth = sortedWorkouts.reduce((groups, workout) => {
    const monthKey = workout.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[monthKey]) groups[monthKey] = [];
    groups[monthKey].push(workout);
    return groups;
  }, {} as Record<string, typeof workoutHistory>);

  const isActiveFilter = anchorFilter !== 'ALL' || intensityFilter !== 'ALL' || goalFilter !== 'ALL';

  const resetFilters = () => {
    setAnchorFilter('ALL');
    setIntensityFilter('ALL');
    setGoalFilter('ALL');
  };

  return (
    <AppLayout header={<PageHeader left="back" onBack={() => navigate("/")} center="History" right="menu" onMenu={() => navigate("/settings")} />}>
      <div className="pt-6">
        <TabbedPanel
          tabs={[
            { value: 'history' as const, label: 'History' },
            { value: 'favorites' as const, label: 'Favorites' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        >
          {/* Filters */}
          <h3
            className="text-label-xs uppercase tracking-widest mb-2"
            style={{ color: 'var(--text-card-label)' }}
          >
            Filters
          </h3>
          <div className="flex gap-2 flex-wrap mb-4">
            <FilterToggle active={!isActiveFilter} onClick={resetFilters} />
            <FilterDropdown label="Anchor" options={ANCHOR_OPTIONS} value={anchorFilter} onChange={setAnchorFilter} />
            <FilterDropdown label="Intensity" options={INTENSITY_OPTIONS} value={intensityFilter} onChange={setIntensityFilter} />
            <FilterDropdown label="Goal" options={GOAL_OPTIONS} value={goalFilter} onChange={setGoalFilter} />
          </div>

          {/* Tab content */}
          {activeTab === 'history' && (
            <>
              {Object.keys(groupedByMonth).length === 0 ? (
                <EmptyState
                  icon={Dumbbell}
                  title={isActiveFilter ? "No Matches" : "No Workouts Yet"}
                  description={isActiveFilter ? "Try adjusting your filters" : "Complete a workout to see it here"}
                  showLeftColumn={false}
                />
              ) : (
                <div className="space-y-6 stagger-reveal">
                  {Object.entries(groupedByMonth).map(([month, workouts]) => (
                    <div key={month}>
                      <h2
                        className="text-label-xs uppercase tracking-widest mb-3"
                        style={{ color: 'var(--text-card-label)' }}
                      >
                        {month}
                      </h2>
                      <div className="space-y-2">
                        {workouts.map((workout) => (
                          <WorkoutListItem
                            key={workout.id}
                            workout={workout}
                            onClick={() => navigate(`/history/${workout.id}`)}
                            showLeftColumn={false}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'favorites' && <FavoritesList anchorFilter={anchorFilter} intensityFilter={intensityFilter} goalFilter={goalFilter} />}
        </TabbedPanel>
      </div>
    </AppLayout>
  );
};
