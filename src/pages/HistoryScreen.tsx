import { useState } from "react";
import { ArrowLeft, Menu, Clock, ChevronDown } from "lucide-react";
import { WorkoutHistoryEntry, AnchorType } from "@/types/workout";
import { cn } from "@/lib/utils";

interface HistoryScreenProps {
  workoutHistory: WorkoutHistoryEntry[];
  onBack: () => void;
  onSelectWorkout: (workoutId: string) => void;
  onOpenSettings: () => void;
}

type AnchorFilter = AnchorType | 'ALL';
type IntensityFilter = 'ALL' | '1-2' | '3-4' | '5-6' | '7-8' | '9-10';

const ANCHOR_OPTIONS: { value: AnchorFilter; label: string }[] = [
  { value: 'ALL', label: 'All Anchors' },
  { value: 'SQUAT', label: 'Squat' },
  { value: 'HINGE', label: 'Hinge' },
  { value: 'PRESS', label: 'Press' },
  { value: 'PULL', label: 'Pull' },
  { value: 'ROTATION', label: 'Rotation' },
  { value: 'SURPRISE', label: 'Surprise' },
];

const INTENSITY_OPTIONS: { value: IntensityFilter; label: string }[] = [
  { value: 'ALL', label: 'All Levels' },
  { value: '1-2', label: '1-2 (Light)' },
  { value: '3-4', label: '3-4 (Easy)' },
  { value: '5-6', label: '5-6 (Mod)' },
  { value: '7-8', label: '7-8 (Hard)' },
  { value: '9-10', label: '9-10 (Max)' },
];

export const HistoryScreen = ({
  workoutHistory,
  onBack,
  onSelectWorkout,
  onOpenSettings,
}: HistoryScreenProps) => {
  const [anchorFilter, setAnchorFilter] = useState<AnchorFilter>('ALL');
  const [intensityFilter, setIntensityFilter] = useState<IntensityFilter>('ALL');
  const [anchorDropdownOpen, setAnchorDropdownOpen] = useState(false);
  const [intensityDropdownOpen, setIntensityDropdownOpen] = useState(false);

  // Filter workouts
  const filteredWorkouts = workoutHistory.filter((workout) => {
    if (anchorFilter !== 'ALL' && workout.anchor !== anchorFilter) return false;
    if (intensityFilter !== 'ALL') {
      const [min, max] = intensityFilter.split('-').map(Number);
      if (workout.intensity < min || workout.intensity > max) return false;
    }
    return true;
  });

  // Group by month
  const groupedByMonth = filteredWorkouts.reduce((groups, workout) => {
    const monthKey = workout.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(workout);
    return groups;
  }, {} as Record<string, WorkoutHistoryEntry[]>);

  // Format date for display
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
    <div className="min-h-screen grain-overlay">
      <div className="max-w-md mx-auto pb-8">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4">
          <button
            onClick={onBack}
            className="p-2 text-foreground/80 hover:text-foreground transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-display text-xl font-bold tracking-wider text-foreground uppercase">
            History
          </h1>
          <button
            onClick={onOpenSettings}
            className="p-2 text-foreground/80 hover:text-foreground transition-colors"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="px-4">
          {/* Filter Section */}
          <div className="mb-6">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Filter By
            </p>
            <div className="flex gap-2">
              {/* All Chip */}
              <button
                onClick={() => {
                  setAnchorFilter('ALL');
                  setIntensityFilter('ALL');
                }}
                className={cn(
                  "px-3 py-2 text-xs font-mono uppercase tracking-wide transition-all",
                  !isActiveFilter
                    ? "bg-clear-orange/20 border border-clear-orange text-clear-orange"
                    : "bg-transparent border border-muted-foreground/30 text-muted-foreground hover:border-clear-orange/50"
                )}
              >
                All
              </button>

              {/* Anchor Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setAnchorDropdownOpen(!anchorDropdownOpen);
                    setIntensityDropdownOpen(false);
                  }}
                  className={cn(
                    "px-3 py-2 text-xs font-mono uppercase tracking-wide transition-all flex items-center gap-1",
                    anchorFilter !== 'ALL'
                      ? "bg-clear-orange/20 border border-clear-orange text-clear-orange"
                      : "bg-transparent border border-muted-foreground/30 text-muted-foreground hover:border-clear-orange/50"
                  )}
                >
                  {anchorFilter === 'ALL' ? 'Anchor' : anchorFilter}
                  <ChevronDown className="w-3 h-3" />
                </button>

                {anchorDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 z-10 glass-card p-2 min-w-[140px]">
                    {ANCHOR_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setAnchorFilter(option.value);
                          setAnchorDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs font-mono uppercase tracking-wide transition-colors",
                          anchorFilter === option.value
                            ? "text-clear-orange"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Intensity Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIntensityDropdownOpen(!intensityDropdownOpen);
                    setAnchorDropdownOpen(false);
                  }}
                  className={cn(
                    "px-3 py-2 text-xs font-mono uppercase tracking-wide transition-all flex items-center gap-1",
                    intensityFilter !== 'ALL'
                      ? "bg-clear-orange/20 border border-clear-orange text-clear-orange"
                      : "bg-transparent border border-muted-foreground/30 text-muted-foreground hover:border-clear-orange/50"
                  )}
                >
                  {intensityFilter === 'ALL' ? 'Intensity' : intensityFilter}
                  <ChevronDown className="w-3 h-3" />
                </button>

                {intensityDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 z-10 glass-card p-2 min-w-[140px]">
                    {INTENSITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setIntensityFilter(option.value);
                          setIntensityDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs font-mono uppercase tracking-wide transition-colors",
                          intensityFilter === option.value
                            ? "text-clear-orange"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Workout List Grouped by Month */}
          {Object.keys(groupedByMonth).length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-muted-foreground">No workouts found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByMonth).map(([month, workouts]) => (
                <div key={month}>
                  <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    {month}
                  </h2>
                  <div className="space-y-2">
                    {workouts.map((workout) => (
                      <button
                        key={workout.id}
                        onClick={() => onSelectWorkout(workout.id)}
                        className="w-full glass-card p-4 text-left hover:border-clear-orange/60 transition-all"
                      >
                        <p className="font-display text-sm font-semibold text-foreground uppercase tracking-wide">
                          {formatDate(workout.date)} &bull; {workout.anchor} &bull; Int. {workout.intensity}
                        </p>
                        <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {workout.duration} min
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
