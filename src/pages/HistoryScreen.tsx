import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  ChevronDown,
  Dumbbell,
  Star,
} from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { MovementPattern } from "@/types/workout";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/Card";
import { ChamferedFrame } from "@/components/ChamferedFrame";
import { useHomeDataContext } from "@/contexts/HomeDataContext";
import { getFavorites, getMostRecentSessionId, SavedWorkoutSummary } from "@/lib/favorites-api";
import { queryKeys } from "@/lib/query-keys";

type TabValue = 'history' | 'favorites';
type AnchorFilter = MovementPattern | 'ALL';
type IntensityFilter = 'ALL' | '1-2' | '3-4' | '5-6' | '7-8' | '9-10';

const ANCHOR_OPTIONS: { value: AnchorFilter; label: string }[] = [
  { value: 'ALL', label: 'All Anchors' },
  { value: 'squat', label: 'Squat' },
  { value: 'hinge', label: 'Hinge' },
  { value: 'press', label: 'Press' },
  { value: 'pull', label: 'Pull' },
  { value: 'power', label: 'Power' },
];

const INTENSITY_OPTIONS: { value: IntensityFilter; label: string }[] = [
  { value: 'ALL', label: 'All Levels' },
  { value: '1-2', label: '1-2 (Light)' },
  { value: '3-4', label: '3-4 (Easy)' },
  { value: '5-6', label: '5-6 (Mod)' },
  { value: '7-8', label: '7-8 (Hard)' },
  { value: '9-10', label: '9-10 (Max)' },
];

function FavoritesList({ anchorFilter, intensityFilter }: { anchorFilter: AnchorFilter; intensityFilter: IntensityFilter }) {
  const navigate = useNavigate();
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: queryKeys.favorites(),
    queryFn: getFavorites,
  });

  const isActiveFilter = anchorFilter !== 'ALL' || intensityFilter !== 'ALL';

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
          <Card key={i} padding="md">
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
      />
    );
  }

  if (filteredFavorites.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No Matches"
        description="Try adjusting your filters"
      />
    );
  }

  const formatLastCompleted = (dateStr: string | null): string => {
    if (!dateStr) return 'Never completed';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleFavoriteClick = async (fav: SavedWorkoutSummary) => {
    if (!fav.originalSessionId) return;
    // Show the most recent completion's data, falling back to original session
    const sessionId = await getMostRecentSessionId(fav.id, fav.originalSessionId);
    navigate(`/history/${sessionId}`, { state: { savedWorkoutId: fav.id } });
  };

  return (
    <div className="space-y-2">
      {filteredFavorites.map((fav: SavedWorkoutSummary) => (
        <Card
          key={fav.id}
          onClick={() => handleFavoriteClick(fav)}
          padding="md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className="text-label-sm font-bold uppercase tracking-wide"
                style={{ color: 'var(--text-card-header)' }}
              >
                {fav.title}
              </p>
              <p
                className="text-paragraph-sm uppercase mt-1"
                style={{ color: 'var(--text-paragraph)' }}
              >
                {fav.anchor && `${fav.anchor} \u2022 `}
                {fav.durationMins && `${fav.durationMins} min \u2022 `}
                Int. {fav.intensity}
              </p>
              <p
                className="text-paragraph-sm mt-1"
                style={{ color: 'var(--text-paragraph)' }}
              >
                {fav.timesCompleted}× completed {'\u2022'} {formatLastCompleted(fav.lastCompletedAt)}
              </p>
            </div>
            <Star size={16} style={{ color: 'var(--icon-badge)' }} />
          </div>
        </Card>
      ))}
    </div>
  );
}

export const HistoryScreen = () => {
  const navigate = useNavigate();
  const { workoutHistory } = useHomeDataContext();

  const [activeTab, setActiveTab] = useState<TabValue>('favorites');
  const [anchorFilter, setAnchorFilter] = useState<AnchorFilter>('ALL');
  const [intensityFilter, setIntensityFilter] = useState<IntensityFilter>('ALL');
  const [anchorDropdownOpen, setAnchorDropdownOpen] = useState(false);
  const [intensityDropdownOpen, setIntensityDropdownOpen] = useState(false);

  const filteredWorkouts = workoutHistory.filter((workout) => {
    if (anchorFilter !== 'ALL' && workout.anchor !== anchorFilter) return false;
    if (intensityFilter !== 'ALL') {
      const [min, max] = intensityFilter.split('-').map(Number);
      if (workout.intensity < min || workout.intensity > max) return false;
    }
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

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) return "Today";
    if (dateOnly.getTime() === yesterdayOnly.getTime()) return "Yesterday";

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isActiveFilter = anchorFilter !== 'ALL' || intensityFilter !== 'ALL';

  return (
    <AppLayout header={<PageHeader left="back" onBack={() => navigate("/")} center="History" right="menu" onMenu={() => navigate("/settings")} />}>
      <div className="pt-6">
        {/* Tabs */}
        <div className="flex mb-6 border-b" style={{ borderColor: 'var(--border-spacer)' }}>
          {(['history', 'favorites'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-label-xs font-bold uppercase tracking-widest text-center transition-colors"
              style={{
                color: activeTab === tab ? 'var(--text-cta)' : 'var(--text-disabled)',
                borderBottom: activeTab === tab ? '2px solid var(--border-cta-primary)' : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter Section — shared across both tabs */}
        <div className="mb-6">
          <div className="flex gap-2">
            {/* All button */}
            <ChamferedFrame
              cornerSize="sm"
              hasLeftBorder
              surfaceColor={!isActiveFilter ? 'var(--surface-card-accent)' : 'transparent'}
              borderColor={!isActiveFilter ? 'var(--border-card)' : 'var(--color-neutral-alpha-300)'}
            >
              <button
                onClick={() => {
                  setAnchorFilter('ALL');
                  setIntensityFilter('ALL');
                  setAnchorDropdownOpen(false);
                  setIntensityDropdownOpen(false);
                }}
                className="px-3 py-2 text-label-xs uppercase tracking-wide"
                style={{ color: !isActiveFilter ? 'var(--text-cta)' : 'var(--text-disabled)' }}
              >
                All
              </button>
            </ChamferedFrame>

            {/* Anchor dropdown */}
            <div className="relative">
              <ChamferedFrame
                cornerSize="sm"
                hasLeftBorder
                surfaceColor={anchorFilter !== 'ALL' || anchorDropdownOpen ? 'var(--surface-card-accent)' : 'transparent'}
                borderColor={anchorFilter !== 'ALL' || anchorDropdownOpen ? 'var(--border-card)' : 'var(--color-neutral-alpha-300)'}
              >
                <button
                  onClick={() => {
                    setAnchorDropdownOpen(!anchorDropdownOpen);
                    setIntensityDropdownOpen(false);
                  }}
                  className="px-3 py-2 text-label-xs uppercase tracking-wide flex items-center gap-1"
                  style={{ color: anchorFilter !== 'ALL' || anchorDropdownOpen ? 'var(--text-cta)' : 'var(--text-disabled)' }}
                >
                  {anchorFilter === 'ALL' ? 'Anchor' : anchorFilter}
                  <ChevronDown size={12} />
                </button>
              </ChamferedFrame>

              {anchorDropdownOpen && (
                <ChamferedFrame
                  cornerSize="sm"
                  hasLeftBorder
                  surfaceColor="var(--surface-dropdown)"
                  borderColor="var(--border-dropdown)"
                  className="absolute top-full left-0 mt-1 z-10 min-w-[140px] backdrop-blur-md scanlines"
                >
                  <div className="py-1">
                    {ANCHOR_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setAnchorFilter(option.value);
                          setAnchorDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-label-xs uppercase tracking-wide transition-colors"
                        style={{
                          color: anchorFilter === option.value ? 'var(--text-dropdown-selected)' : 'var(--text-dropdown)',
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </ChamferedFrame>
              )}
            </div>

            {/* Intensity dropdown */}
            <div className="relative">
              <ChamferedFrame
                cornerSize="sm"
                hasLeftBorder
                surfaceColor={intensityFilter !== 'ALL' || intensityDropdownOpen ? 'var(--surface-card-accent)' : 'transparent'}
                borderColor={intensityFilter !== 'ALL' || intensityDropdownOpen ? 'var(--border-card)' : 'var(--color-neutral-alpha-300)'}
              >
                <button
                  onClick={() => {
                    setIntensityDropdownOpen(!intensityDropdownOpen);
                    setAnchorDropdownOpen(false);
                  }}
                  className="px-3 py-2 text-label-xs uppercase tracking-wide flex items-center gap-1"
                  style={{ color: intensityFilter !== 'ALL' || intensityDropdownOpen ? 'var(--text-cta)' : 'var(--text-disabled)' }}
                >
                  {intensityFilter === 'ALL' ? 'Intensity' : intensityFilter}
                  <ChevronDown size={12} />
                </button>
              </ChamferedFrame>

              {intensityDropdownOpen && (
                <ChamferedFrame
                  cornerSize="sm"
                  hasLeftBorder
                  surfaceColor="var(--surface-dropdown)"
                  borderColor="var(--border-dropdown)"
                  className="absolute top-full left-0 mt-1 z-10 min-w-[140px] backdrop-blur-md scanlines"
                >
                  <div className="py-1">
                    {INTENSITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setIntensityFilter(option.value);
                          setIntensityDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-label-xs uppercase tracking-wide transition-colors"
                        style={{
                          color: intensityFilter === option.value ? 'var(--text-dropdown-selected)' : 'var(--text-dropdown)',
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </ChamferedFrame>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'history' && (
          <>
            {Object.keys(groupedByMonth).length === 0 ? (
              <EmptyState
                icon={Dumbbell}
                title={isActiveFilter ? "No Matches" : "No Workouts Yet"}
                description={isActiveFilter ? "Try adjusting your filters" : "Complete a workout to see it here"}
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
                        <Card
                          key={workout.id}
                          onClick={() => navigate(`/history/${workout.id}`)}
                          padding="md"
                        >
                          <p
                            className="text-label-sm font-bold uppercase tracking-wide"
                            style={{ color: 'var(--text-card-header)' }}
                          >
                            {formatDate(workout.date)}
                          </p>
                          <p
                            className="text-paragraph-sm uppercase mt-1"
                            style={{ color: 'var(--text-paragraph)' }}
                          >
                            {workout.anchor} {'\u2022'} Int. {workout.intensity}
                            {workout.goal ? ` \u2022 ${workout.goal}` : ''}
                          </p>
                          <p
                            className="text-paragraph-sm flex items-center gap-1 mt-1"
                            style={{ color: 'var(--text-paragraph)' }}
                          >
                            <Clock size={12} />
                            {workout.duration} min
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'favorites' && <FavoritesList anchorFilter={anchorFilter} intensityFilter={intensityFilter} />}
      </div>
    </AppLayout>
  );
};
