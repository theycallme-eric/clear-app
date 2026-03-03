import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronDown, Dumbbell } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { MovementPattern } from "@/types/workout";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import { useHomeDataContext } from "@/contexts/HomeDataContext";

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

export const HistoryScreen = () => {
  const navigate = useNavigate();
  const { workoutHistory } = useHomeDataContext();

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
      <div>
        {/* Filter Section */}
        <div className="mb-6">
          <p
            className="text-label-xs uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-card-label)' }}
          >
            Filter By
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setAnchorFilter('ALL');
                setIntensityFilter('ALL');
              }}
              className={cn("px-3 py-2 text-label-xs uppercase tracking-wide transition-all border")}
              style={
                !isActiveFilter
                  ? { backgroundColor: 'var(--surface-card-accent)', borderColor: 'var(--border-card)', color: 'var(--text-cta)' }
                  : { backgroundColor: 'transparent', borderColor: 'var(--color-neutral-alpha-300)', color: 'var(--text-disabled)' }
              }
            >
              All
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setAnchorDropdownOpen(!anchorDropdownOpen);
                  setIntensityDropdownOpen(false);
                }}
                className="px-3 py-2 text-label-xs uppercase tracking-wide transition-all flex items-center gap-1 border"
                style={
                  anchorFilter !== 'ALL'
                    ? { backgroundColor: 'var(--surface-card-accent)', borderColor: 'var(--border-card)', color: 'var(--text-cta)' }
                    : { backgroundColor: 'transparent', borderColor: 'var(--color-neutral-alpha-300)', color: 'var(--text-disabled)' }
                }
              >
                {anchorFilter === 'ALL' ? 'Anchor' : anchorFilter}
                <ChevronDown className="w-3 h-3" />
              </button>

              {anchorDropdownOpen && (
                <Card padding="sm" showLeftColumn={false} className="absolute top-full left-0 mt-1 z-10 min-w-[140px]">
                  {ANCHOR_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setAnchorFilter(option.value);
                        setAnchorDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-label-xs uppercase tracking-wide transition-colors"
                      style={{
                        color: anchorFilter === option.value ? 'var(--text-cta)' : 'var(--text-paragraph)',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </Card>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setIntensityDropdownOpen(!intensityDropdownOpen);
                  setAnchorDropdownOpen(false);
                }}
                className="px-3 py-2 text-label-xs uppercase tracking-wide transition-all flex items-center gap-1 border"
                style={
                  intensityFilter !== 'ALL'
                    ? { backgroundColor: 'var(--surface-card-accent)', borderColor: 'var(--border-card)', color: 'var(--text-cta)' }
                    : { backgroundColor: 'transparent', borderColor: 'var(--color-neutral-alpha-300)', color: 'var(--text-disabled)' }
                }
              >
                {intensityFilter === 'ALL' ? 'Intensity' : intensityFilter}
                <ChevronDown className="w-3 h-3" />
              </button>

              {intensityDropdownOpen && (
                <Card padding="sm" showLeftColumn={false} className="absolute top-full left-0 mt-1 z-10 min-w-[140px]">
                  {INTENSITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setIntensityFilter(option.value);
                        setIntensityDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-label-xs uppercase tracking-wide transition-colors"
                      style={{
                        color: intensityFilter === option.value ? 'var(--text-cta)' : 'var(--text-paragraph)',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </Card>
              )}
            </div>
          </div>
        </div>

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
                        className="text-label-sm uppercase tracking-wide"
                        style={{ color: 'var(--text-header)' }}
                      >
                        {formatDate(workout.date)} &bull; {workout.anchor} &bull; Int. {workout.intensity}
                      </p>
                      <p
                        className="text-paragraph-sm flex items-center gap-1 mt-1"
                        style={{ color: 'var(--text-paragraph)' }}
                      >
                        <Clock className="w-3 h-3" />
                        {workout.duration} min
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
