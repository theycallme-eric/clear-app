import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Zap, AlertCircle, User, HelpCircle, Maximize2, Pencil } from "lucide-react";
import {
  ChevronRight as ClearChevronRight,
  ChevronLeft as ClearChevronLeft,
  ChevronDown as ClearChevronDown,
  ChevronUp as ClearChevronUp,
  ArrowRight as ClearArrowRight,
  ArrowLeft as ClearArrowLeft,
  Menu as ClearMenu,
  X as ClearX,
  Plus as ClearPlus,
  Minus as ClearMinus,
  Check as ClearCheck,
  RefreshCw as ClearRefreshCw,
  Loader2 as ClearLoader2,
  Eye as ClearEye,
  EyeOff as ClearEyeOff,
  CircleCheck as ClearCircleCheck,
  CircleX as ClearCircleX,
  CircleAlert as ClearCircleAlert,
  Zap as ClearZap,
  Flame as ClearFlame,
  Star as ClearStar,
  Dumbbell as ClearDumbbell,
  Clock as ClearClock,
  Gauge as ClearGauge,
  Target as ClearTarget,
  Crosshair as ClearCrosshair,
  FileText as ClearFileText,
  Pencil as ClearPencil,
  User as ClearUser,
  Frown as ClearFrown,
  Meh as ClearMeh,
  Smile as ClearSmile,
  SmilePlus as ClearSmilePlus,
  ThumbsDown as ClearThumbsDown,
  AlertCircle as ClearAlertCircle,
  HelpCircle as ClearHelpCircle,
  Maximize2 as ClearMaximize2,
} from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Custom app components
import { IntensitySlider } from "@/components/IntensitySlider";
import { AnchorGrid, AnchorType } from "@/components/AnchorGrid";
import { LocationAccordion } from "@/components/LocationAccordion";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LoadingSkeleton, SkeletonCard } from "@/components/LoadingSkeleton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { ActionButton } from "@/components/ActionButton";
import { ActionCard } from "@/components/ActionCard";
import { Card as ChamferedCard } from "@/components/Card";
import { CTAButton } from "@/components/CTAButton";
import { RadioButton } from "@/components/RadioButton";
import { Chip } from "@/components/Chip";
import { toast } from "@/components/ui/sonner";
import { TabBar } from "@/components/TabBar";
import { FilterDropdown, FilterToggle, type FilterOption } from "@/components/FilterDropdown";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { WeekStreakDisplay } from "@/components/WeekStreakDisplay";
import { WorkoutListItem } from "@/components/WorkoutListItem";
import { FavoriteListItem } from "@/components/FavoriteListItem";
import type { WorkoutHistoryEntry } from "@/types/workout";
import type { SavedWorkoutSummary } from "@/lib/favorites-api";

/**
 * Component Gallery — Developer tool for auditing the design system.
 *
 * How it works:
 * - Manual registration of components with explicit imports
 * - Grouped by category with representative variants
 * - Read-only: no side effects or app state changes
 *
 * To add a new component:
 * 1. Import it at the top of this file
 * 2. Add a new <Section> block in the appropriate category
 * 3. Render with sensible default props
 */
export const ComponentGallery = () => {
  const navigate = useNavigate();
  // Local state for interactive demos (no app side effects)
  const [intensityValue, setIntensityValue] = useState(7);
  const [anchorValue, setAnchorValue] = useState<AnchorType | null>("LOWER BODY");
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchOn, setSwitchOn] = useState(true);
  const [radioTextSelected, setRadioTextSelected] = useState<string | null>("Option A");
  const [radioIconSelected, setRadioIconSelected] = useState<number | null>(1);
  const [galleryTab, setGalleryTab] = useState<'alpha' | 'beta' | 'gamma'>('alpha');
  const [filterAnchor, setFilterAnchor] = useState<'ALL' | 'squat' | 'hinge'>('ALL');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const sampleFilterOptions: FilterOption<'ALL' | 'squat' | 'hinge'>[] = [
    { value: 'ALL', label: 'All Anchors' },
    { value: 'squat', label: 'Squat' },
    { value: 'hinge', label: 'Hinge' },
  ];

  const sampleWorkout: WorkoutHistoryEntry = {
    id: 'demo-1',
    date: new Date(),
    anchor: 'squat',
    intensity: 7,
    duration: 42,
    goal: 'strength',
  };

  const sampleFavorite: SavedWorkoutSummary = {
    id: 'demo-fav-1',
    originalSessionId: 'demo-session-1',
    title: 'Squat Day — Strength',
    anchor: 'squat',
    intensity: 7,
    durationMins: 42,
    timesCompleted: 3,
    lastCompletedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const sampleWeekView: Record<string, 'workout' | 'rest' | null> = (() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    const view: Record<string, 'workout' | 'rest' | null> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = d.toISOString().split('T')[0];
      if (i < 3) view[key] = 'workout';
      else if (i === 3) view[key] = 'rest';
      else view[key] = null;
    }
    return view;
  })();

  const sampleLocations = [
    { id: "1", name: "Home Gym", tier: "home" as const, equipment: ["Dumbbells", "Bench"] },
    { id: "2", name: "Commercial Gym", tier: "full" as const, equipment: ["Barbell", "Rack", "Cables"] },
  ];

  return (
    <AppLayout header={<PageHeader left="back" onBack={() => navigate("/settings")} center="Gallery" />}>
      <div className="pt-6 space-y-8">

          {/* ─── TYPOGRAPHY ─── */}
          <Section title="Typography — Headings (Rajdhani)">
            <div className="space-y-3">
              <p className="text-heading-h1 font-bold">Heading H1</p>
              <p className="text-heading-h2 font-bold">Heading H2</p>
              <p className="text-heading-h3 font-bold">Heading H3</p>
              <p className="text-heading-h4 font-bold">Heading H4</p>
              <p className="text-heading-h5 font-medium">Heading H5</p>
              <p className="text-heading-h6 font-medium">Heading H6</p>
            </div>
          </Section>

          <Section title="Typography — Paragraph (Space Grotesk)">
            <div className="space-y-3">
              <p className="text-paragraph-xl ">Paragraph XL — for large body text</p>
              <p className="text-paragraph-lg ">Paragraph LG — for emphasized text</p>
              <p className="text-paragraph-md ">Paragraph MD — default body text</p>
              <p className="text-paragraph-sm " style={{ color: 'var(--text-paragraph)' }}>Paragraph SM — secondary text</p>
              <p className="text-paragraph-xs " style={{ color: 'var(--text-paragraph)' }}>Paragraph XS — smallest body text</p>
            </div>
          </Section>

          <Section title="Typography — Label (Oxanium)">
            <div className="space-y-3">
              <p className="text-label-xl uppercase tracking-wider" style={{ color: 'var(--text-header)' }}>Label XL — large labels</p>
              <p className="text-label-lg uppercase tracking-wider" style={{ color: 'var(--text-header)' }}>Label LG — section labels</p>
              <p className="text-label-md uppercase tracking-wider" style={{ color: 'var(--text-header)' }}>Label MD — standard labels</p>
              <p className="text-label-sm uppercase tracking-wider" style={{ color: 'var(--text-paragraph)' }}>Label SM — small labels</p>
              <p className="text-label-xs uppercase tracking-widest" style={{ color: 'var(--text-paragraph)' }}>Label XS — tiny labels</p>
            </div>
          </Section>

          <Section title="Typography — CTA (Oxanium uppercase)">
            <div className="space-y-3">
              <p className="text-cta-lg font-bold">CTA LG — large buttons</p>
              <p className="text-cta-md font-bold">CTA MD — standard buttons</p>
              <p className="text-cta-sm font-bold">CTA SM — small buttons</p>
              <p className="text-cta-xs font-bold">CTA XS — tiny buttons</p>
            </div>
          </Section>

          <Section title="Typography — Time (Oxanium)">
            <div className="space-y-3">
              <p className="text-time-xl font-bold">12:34 — Time XL</p>
              <p className="text-time-lg font-bold">12:34 — Time LG</p>
            </div>
          </Section>

          {/* ─── COLORS ─── */}
          <Section title="Colors">
            <div className="grid grid-cols-4 gap-2">
              <ColorSwatch name="orange" style={{ backgroundColor: 'var(--color-orange-500)' }} />
              <ColorSwatch name="lime" style={{ backgroundColor: 'var(--color-green-500)' }} />
              <ColorSwatch name="purple" style={{ backgroundColor: 'var(--color-purple-500)' }} />
              <ColorSwatch name="accent" style={{ backgroundColor: 'var(--color-blue-500)' }} />
              <ColorSwatch name="fg" style={{ backgroundColor: 'var(--text-header)' }} />
              <ColorSwatch name="muted" style={{ backgroundColor: 'var(--text-paragraph)' }} />
              <ColorSwatch name="bg" style={{ backgroundColor: 'var(--color-neutral-900)', border: '1px solid var(--color-neutral-alpha-300)' }} />
              <ColorSwatch name="card" style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--color-neutral-alpha-300)' }} />
            </div>
          </Section>

          {/* ─── BUTTONS ─── */}

          <Section title="CTAButton — Using ChamferedFrame">
            <div className="space-y-4">
              <Subsection label="Sizes">
                <div className="flex flex-wrap gap-3 items-center">
                  <CTAButton size="sm">Small</CTAButton>
                  <CTAButton size="md">Medium</CTAButton>
                  <CTAButton size="lg">Large</CTAButton>
                </div>
              </Subsection>

              <Subsection label="Primary variant">
                <div className="flex flex-wrap gap-3 items-center">
                  <CTAButton variant="primary">Primary</CTAButton>
                  <CTAButton variant="primary" iconLeft={<Zap className="w-4 h-4" />}>With Icon</CTAButton>
                  <CTAButton variant="primary" disabled>Disabled</CTAButton>
                </div>
              </Subsection>

              <Subsection label="Secondary variant">
                <div className="flex flex-wrap gap-3 items-center">
                  <CTAButton variant="secondary">Secondary</CTAButton>
                  <CTAButton variant="secondary" iconRight={<Dumbbell className="w-4 h-4" />}>With Icon</CTAButton>
                  <CTAButton variant="secondary" disabled>Disabled</CTAButton>
                </div>
              </Subsection>

              <Subsection label="Transparent variant">
                <div className="flex flex-wrap gap-3 items-center">
                  <CTAButton variant="transparent">Transparent</CTAButton>
                  <CTAButton variant="transparent" iconLeft={<Zap className="w-4 h-4" />}>With Icon</CTAButton>
                  <CTAButton variant="transparent" disabled>Disabled</CTAButton>
                </div>
              </Subsection>

              <Subsection label="Full width (lg)">
                <CTAButton variant="primary" size="lg" fullWidth>Full Width Primary</CTAButton>
              </Subsection>
            </div>
          </Section>

          {/* ─── RADIO BUTTON ─── */}
          <Section title="RadioButton — Selection Component">
            <div className="space-y-4">
              <Subsection label="Text variant (selected vs unselected)">
                <div className="flex flex-wrap gap-3">
                  <RadioButton
                    selected={radioTextSelected === "Option A"}
                    onClick={() => setRadioTextSelected("Option A")}
                    label="Option A"
                  />
                  <RadioButton
                    selected={radioTextSelected === "Option B"}
                    onClick={() => setRadioTextSelected("Option B")}
                    label="Option B"
                  />
                  <RadioButton
                    selected={radioTextSelected === "Option C"}
                    onClick={() => setRadioTextSelected("Option C")}
                    label="Option C"
                  />
                </div>
              </Subsection>

              <Subsection label="Icon variant (selected vs unselected)">
                <div className="flex gap-3">
                  <RadioButton
                    selected={radioIconSelected === 1}
                    onClick={() => setRadioIconSelected(1)}
                    icon={<Dumbbell size={24} />}
                  />
                  <RadioButton
                    selected={radioIconSelected === 2}
                    onClick={() => setRadioIconSelected(2)}
                    icon={<Zap size={24} />}
                  />
                  <RadioButton
                    selected={radioIconSelected === 3}
                    onClick={() => setRadioIconSelected(3)}
                    icon={<AlertCircle size={24} />}
                  />
                </div>
              </Subsection>

              <Subsection label="Full width (for grids)">
                <div className="grid grid-cols-2 gap-3">
                  <RadioButton
                    selected={true}
                    onClick={() => {}}
                    label="SELECTED"
                    className="w-full"
                  />
                  <RadioButton
                    selected={false}
                    onClick={() => {}}
                    label="UNSELECTED"
                    className="w-full"
                  />
                </div>
              </Subsection>
            </div>
          </Section>

          {/* ─── CHIP ─── */}
          <Section title="Chip — Chamfered Selection Chips">
            <div className="space-y-4">
              <Subsection label="Label variant (display-only)">
                <div className="flex flex-wrap gap-2">
                  <Chip variant="label">Equipment</Chip>
                  <Chip variant="label">Strength</Chip>
                  <Chip variant="label">Cardio</Chip>
                </div>
              </Subsection>

              <Subsection label="Selectable variant (selected vs unselected)">
                <div className="flex flex-wrap gap-2">
                  <Chip variant="selectable" selected={true} onClick={() => {}}>
                    Dumbbells
                  </Chip>
                  <Chip variant="selectable" selected={true} onClick={() => {}}>
                    Barbell
                  </Chip>
                  <Chip variant="selectable" selected={false} onClick={() => {}}>
                    Kettlebells
                  </Chip>
                  <Chip variant="selectable" selected={false} onClick={() => {}}>
                    Cable Machine
                  </Chip>
                </div>
              </Subsection>

              <Subsection label="Disabled state">
                <div className="flex flex-wrap gap-2">
                  <Chip variant="selectable" selected={true} disabled>
                    Bodyweight
                  </Chip>
                  <Chip variant="selectable" selected={false} disabled>
                    Unavailable
                  </Chip>
                </div>
              </Subsection>
            </div>
          </Section>

          {/* ─── UNIVERSAL CARD ─── */}
          <Section title="Card — Universal Container">
            <div className="space-y-6">

              <Subsection label="Default (with left accent column)">
                <ChamferedCard>
                  <p className="text-cta-sm font-medium">
                    Universal Card
                  </p>
                  <p className="text-paragraph-sm mt-1">
                    Uses ChamferedFrame + LeftColumn pattern
                  </p>
                </ChamferedCard>
              </Subsection>

              <Subsection label="Corner sizes">
                <div className="space-y-3">
                  <ChamferedCard cornerSize="sm">
                    <span className="text-paragraph-sm">Small (8px chamfer)</span>
                  </ChamferedCard>
                  <ChamferedCard cornerSize="md">
                    <span className="text-paragraph-sm">Medium (12px chamfer)</span>
                  </ChamferedCard>
                  <ChamferedCard cornerSize="lg">
                    <span className="text-paragraph-sm">Large (24px chamfer)</span>
                  </ChamferedCard>
                </div>
              </Subsection>

              <Subsection label="Padding sizes">
                <div className="space-y-3">
                  <ChamferedCard padding="sm">
                    <span className="text-paragraph-sm">Small padding</span>
                  </ChamferedCard>
                  <ChamferedCard padding="md">
                    <span className="text-paragraph-sm">Medium padding (default)</span>
                  </ChamferedCard>
                  <ChamferedCard padding="lg">
                    <span className="text-paragraph-sm">Large padding</span>
                  </ChamferedCard>
                </div>
              </Subsection>

              <Subsection label="Interactive (onClick)">
                <ChamferedCard onClick={() => toast.info("Card clicked!")}>
                  <span className="text-paragraph-sm">Click me</span>
                </ChamferedCard>
              </Subsection>

              <Subsection label="Without left column (for nesting)">
                <ChamferedCard showLeftColumn={false}>
                  <span className="text-paragraph-sm">No accent column</span>
                </ChamferedCard>
              </Subsection>

            </div>
          </Section>

          {/* ─── INPUTS ─── */}
          <Section title="Inputs — Design System">
            <div className="space-y-4">
              <Subsection label="Input states">
                <div className="space-y-2">
                  <Input placeholder="Placeholder text" />
                  <Input defaultValue="With value (active on focus)" />
                  <Input disabled placeholder="Disabled" />
                </div>
              </Subsection>

              <Subsection label="Input with icons">
                <div className="space-y-2">
                  <Input
                    placeholder="Username"
                    iconLeft={<User size={20} />}
                    iconRight={<HelpCircle size={20} />}
                  />
                  <Input
                    placeholder="Search..."
                    iconLeft={<Zap size={20} />}
                  />
                  <Input
                    placeholder="Disabled with icons"
                    iconLeft={<User size={20} />}
                    iconRight={<HelpCircle size={20} />}
                    disabled
                  />
                </div>
              </Subsection>

              <Subsection label="Textarea states">
                <div className="space-y-2">
                  <Textarea placeholder="Enter your message here..." />
                  <Textarea defaultValue="Some existing content that can be edited" />
                  <Textarea disabled placeholder="Disabled textarea" />
                </div>
              </Subsection>

              <Subsection label="Textarea with icon (for expand/edit)">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Notes..."
                    iconRight={<Maximize2 size={20} />}
                  />
                  <Textarea
                    defaultValue="Tap the icon to edit or expand this note field."
                    iconRight={<Pencil size={20} />}
                  />
                </div>
              </Subsection>
            </div>
          </Section>

          {/* ─── FEEDBACK ─── */}
          <Section title="Feedback">
            <div className="space-y-4">
              <Subsection label="LoadingSkeleton (count=2)">
                <LoadingSkeleton count={2} />
              </Subsection>
            </div>
          </Section>

          {/* ─── TOASTS ─── */}
          <Section title="Toasts — Chamfered">
            <div className="space-y-4">
              <Subsection label="Trigger toasts">
                <div className="flex flex-wrap gap-3">
                  <CTAButton
                    size="sm"
                    onClick={() => toast.success("Action completed")}
                  >
                    Success
                  </CTAButton>
                  <CTAButton
                    size="sm"
                    variant="secondary"
                    onClick={() => toast.error("Something went wrong")}
                  >
                    Error
                  </CTAButton>
                  <CTAButton
                    size="sm"
                    variant="secondary"
                    onClick={() => toast.info("Here's some information")}
                  >
                    Info
                  </CTAButton>
                </div>
              </Subsection>
            </div>
          </Section>

          {/* ─── CARDS & CONTAINERS ─── */}
          <Section title="Cards & Containers">
            <div className="space-y-4">
              <Subsection label="ChamferedCard">
                <ChamferedCard padding="md">
                  <p className="text-cta-sm font-medium">
                    Chamfered Card
                  </p>
                  <p className="text-paragraph-sm mt-1">
                    Used throughout the app for content sections
                  </p>
                </ChamferedCard>
              </Subsection>
            </div>
          </Section>

          {/* ─── STATES ─── */}
          <Section title="States">
            <div className="space-y-4">
              <Subsection label="ErrorState (with retry)">
                <ErrorState message="Couldn't load data" onRetry={() => { }} />
              </Subsection>

              <Subsection label="EmptyState (with action)">
                <EmptyState
                  icon={Dumbbell}
                  title="No Workouts Yet"
                  description="Generate your first workout to get started"
                  actionLabel="Generate"
                  onAction={() => { }}
                />
              </Subsection>

              <Subsection label="EmptyState (minimal)">
                <EmptyState
                  icon={AlertCircle}
                  title="No Matches"
                  description="Try adjusting your filters"
                />
              </Subsection>
            </div>
          </Section>

          {/* ─── APP COMPONENTS ─── */}
          <Section title="App — IntensitySlider">
            <IntensitySlider value={intensityValue} onChange={setIntensityValue} />
          </Section>

          <Section title="App — AnchorGrid">
            <div className="space-y-4">
              <Subsection label="Primary Lift mode">
                <AnchorGrid selected={anchorValue} onSelect={setAnchorValue} />
              </Subsection>
              <Subsection label="Body focus mode (no primary lift)">
                <AnchorGrid selected={null} onSelect={() => { }} />
              </Subsection>
            </div>
          </Section>

          <Section title="App — LocationAccordion">
            <LocationAccordion
              selected="Home Gym"
              onSelect={() => { }}
              locations={sampleLocations}
            />
          </Section>

          <Section title="App — GenerateButton">
            <div className="space-y-3">
              <Subsection label="Normal (relative positioned for gallery)">
                <div className="relative h-20">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <CTAButton size="lg" fullWidth>
                      Initiate Workout
                    </CTAButton>
                  </div>
                </div>
              </Subsection>
            </div>
          </Section>

          <Section title="App — LoadingScreen">
            <ChamferedCard padding="none" className="overflow-hidden h-48 relative">
              <LoadingScreen subtitle="Loading your data..." className="min-h-0 h-full" />
            </ChamferedCard>
          </Section>

          {/* ─── TABBAR ─── */}
          <Section title="TabBar — Chamfered File-Folder Tabs">
            <div className="space-y-4">
              <Subsection label="Interactive (2 tabs)">
                <TabBar
                  tabs={[
                    { value: 'alpha' as const, label: 'Alpha' },
                    { value: 'beta' as const, label: 'Beta' },
                  ]}
                  activeTab={galleryTab === 'gamma' ? 'alpha' : galleryTab}
                  onChange={(v) => setGalleryTab(v as 'alpha' | 'beta' | 'gamma')}
                />
              </Subsection>
              <Subsection label="Interactive (3 tabs)">
                <TabBar
                  tabs={[
                    { value: 'alpha' as const, label: 'Alpha' },
                    { value: 'beta' as const, label: 'Beta' },
                    { value: 'gamma' as const, label: 'Gamma' },
                  ]}
                  activeTab={galleryTab}
                  onChange={setGalleryTab}
                />
              </Subsection>
            </div>
          </Section>

          {/* ─── FILTER DROPDOWN ─── */}
          <Section title="FilterDropdown + FilterToggle">
            <div className="space-y-4">
              <Subsection label="Filter bar (interactive)">
                <div className="flex gap-2 flex-wrap">
                  <FilterToggle active={filterAnchor === 'ALL'} onClick={() => setFilterAnchor('ALL')} />
                  <FilterDropdown label="Anchor" options={sampleFilterOptions} value={filterAnchor} onChange={setFilterAnchor} />
                </div>
              </Subsection>
            </div>
          </Section>

          {/* ─── CONFIRMATION MODAL ─── */}
          <Section title="ConfirmationModal">
            <div className="space-y-4">
              <Subsection label="Trigger">
                <CTAButton size="sm" variant="secondary" onClick={() => setShowConfirmModal(true)}>
                  Open Modal
                </CTAButton>
              </Subsection>
            </div>
          </Section>

          {/* ─── WEEK STREAK DISPLAY ─── */}
          <Section title="WeekStreakDisplay">
            <div className="space-y-4">
              <Subsection label="Mon–Wed workout, Thu rest, Fri–Sun empty">
                <WeekStreakDisplay weekView={sampleWeekView} />
              </Subsection>
              <Subsection label="With highlightToday">
                <WeekStreakDisplay weekView={sampleWeekView} highlightToday />
              </Subsection>
            </div>
          </Section>

          {/* ─── LIST ITEMS ─── */}
          <Section title="WorkoutListItem + FavoriteListItem">
            <div className="space-y-4">
              <Subsection label="WorkoutListItem">
                <WorkoutListItem workout={sampleWorkout} onClick={() => toast.info("Workout clicked")} />
              </Subsection>
              <Subsection label="FavoriteListItem">
                <FavoriteListItem favorite={sampleFavorite} onClick={() => toast.info("Favorite clicked")} />
              </Subsection>
            </div>
          </Section>

          {/* ─── ICONOGRAPHY ─── */}
          <Section title="Iconography — CLEAR Icon Set">
            <div className="space-y-6">
              <p className="text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
                Solid, geometric, angular. Chamfered tips on directional icons. Drop-in replacements for Lucide.
              </p>

              <Subsection label="Directional">
                <div className="flex flex-wrap gap-6 items-center">
                  <IconDisplay icon={<ClearChevronRight size={24} />} name="ChevronRight" />
                  <IconDisplay icon={<ClearChevronLeft size={24} />} name="ChevronLeft" />
                  <IconDisplay icon={<ClearChevronDown size={24} />} name="ChevronDown" />
                  <IconDisplay icon={<ClearChevronUp size={24} />} name="ChevronUp" />
                  <IconDisplay icon={<ClearArrowRight size={24} />} name="ArrowRight" />
                  <IconDisplay icon={<ClearArrowLeft size={24} />} name="ArrowLeft" />
                </div>
              </Subsection>

              <Subsection label="Actions">
                <div className="flex flex-wrap gap-6 items-center">
                  <IconDisplay icon={<ClearMenu size={24} />} name="Menu" />
                  <IconDisplay icon={<ClearX size={24} />} name="X" />
                  <IconDisplay icon={<ClearPlus size={24} />} name="Plus" />
                  <IconDisplay icon={<ClearMinus size={24} />} name="Minus" />
                  <IconDisplay icon={<ClearCheck size={24} />} name="Check" />
                  <IconDisplay icon={<ClearPencil size={24} />} name="Pencil" />
                  <IconDisplay icon={<ClearMaximize2 size={24} />} name="Maximize2" />
                </div>
              </Subsection>

              <Subsection label="Status / Feedback">
                <div className="flex flex-wrap gap-6 items-center">
                  <IconDisplay icon={<ClearRefreshCw size={24} />} name="RefreshCw" />
                  <IconDisplay icon={<ClearLoader2 size={24} />} name="Loader2" />
                  <IconDisplay icon={<ClearEye size={24} />} name="Eye" />
                  <IconDisplay icon={<ClearEyeOff size={24} />} name="EyeOff" />
                  <IconDisplay icon={<ClearCircleCheck size={24} />} name="CircleCheck" />
                  <IconDisplay icon={<ClearCircleX size={24} />} name="CircleX" />
                  <IconDisplay icon={<ClearCircleAlert size={24} />} name="CircleAlert" />
                  <IconDisplay icon={<ClearAlertCircle size={24} />} name="AlertCircle" />
                  <IconDisplay icon={<ClearHelpCircle size={24} />} name="HelpCircle" />
                </div>
              </Subsection>

              <Subsection label="Semantic / Content">
                <div className="flex flex-wrap gap-6 items-center">
                  <IconDisplay icon={<ClearZap size={24} />} name="Zap" />
                  <IconDisplay icon={<ClearFlame size={24} />} name="Flame" />
                  <IconDisplay icon={<ClearStar size={24} />} name="Star" />
                  <IconDisplay icon={<ClearDumbbell size={24} />} name="Dumbbell" />
                  <IconDisplay icon={<ClearClock size={24} />} name="Clock" />
                  <IconDisplay icon={<ClearGauge size={24} />} name="Gauge" />
                  <IconDisplay icon={<ClearTarget size={24} />} name="Target" />
                  <IconDisplay icon={<ClearCrosshair size={24} />} name="Crosshair" />
                  <IconDisplay icon={<ClearFileText size={24} />} name="FileText" />
                  <IconDisplay icon={<ClearUser size={24} />} name="User" />
                </div>
              </Subsection>

              <Subsection label="Mood (session debrief)">
                <div className="flex flex-wrap gap-6 items-center">
                  <IconDisplay icon={<ClearThumbsDown size={24} />} name="ThumbsDown" />
                  <IconDisplay icon={<ClearFrown size={24} />} name="Frown" />
                  <IconDisplay icon={<ClearMeh size={24} />} name="Meh" />
                  <IconDisplay icon={<ClearSmile size={24} />} name="Smile" />
                  <IconDisplay icon={<ClearSmilePlus size={24} />} name="SmilePlus" />
                </div>
              </Subsection>

              <Subsection label="With theme colors">
                <div className="flex flex-wrap gap-6 items-center">
                  <IconDisplay icon={<ClearArrowRight size={24} style={{ color: 'var(--icon-cta)' }} />} name="CTA" />
                  <IconDisplay icon={<ClearFlame size={24} style={{ color: 'var(--icon-badge)' }} />} name="Badge" />
                  <IconDisplay icon={<ClearMenu size={24} style={{ color: 'var(--text-header)' }} />} name="Header" />
                  <IconDisplay icon={<ClearClock size={24} style={{ color: 'var(--text-paragraph)' }} />} name="Muted" />
                  <IconDisplay icon={<ClearCheck size={24} style={{ color: 'var(--text-label-selected)' }} />} name="Selected" />
                </div>
              </Subsection>

              <Subsection label="Size comparison — 12 / 16 / 20 / 24">
                <div className="flex flex-wrap gap-6 items-end">
                  <IconDisplay icon={<ClearZap size={12} />} name="12px" />
                  <IconDisplay icon={<ClearZap size={16} />} name="16px" />
                  <IconDisplay icon={<ClearZap size={20} />} name="20px" />
                  <IconDisplay icon={<ClearZap size={24} />} name="24px" />
                </div>
              </Subsection>
            </div>
          </Section>

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* ═══ MUSEUM — Legacy components preserved for reference ═════════════ */}
          {/* ════════════════════════════════════════════════════════════════════ */}

          <div className="mt-16 pt-8" style={{ borderTop: '2px solid var(--border-spacer)' }}>
            <p className="text-label-lg uppercase tracking-widest mb-2" style={{ color: 'var(--text-disabled)' }}>
              Museum
            </p>
            <p className="text-paragraph-sm mb-8" style={{ color: 'var(--text-paragraph)' }}>
              Legacy components preserved to see where we came from. NOT used in the app. Do NOT reference these for any new UI work.
            </p>
          </div>

          <Section title="Museum — ActionButton (pre-ChamferedFrame)">
            <div className="space-y-4">
              <Subsection label="Primary variant">
                <div className="flex flex-wrap gap-3 items-center">
                  <ActionButton variant="primary">Primary</ActionButton>
                  <ActionButton variant="primary" iconLeft={<Zap className="w-4 h-4" />}>With Icon</ActionButton>
                  <ActionButton variant="primary" disabled>Disabled</ActionButton>
                </div>
              </Subsection>

              <Subsection label="Secondary variant">
                <div className="flex flex-wrap gap-3 items-center">
                  <ActionButton variant="secondary">Secondary</ActionButton>
                  <ActionButton variant="secondary" iconRight={<Dumbbell className="w-4 h-4" />}>With Icon</ActionButton>
                  <ActionButton variant="secondary" disabled>Disabled</ActionButton>
                </div>
              </Subsection>

              <Subsection label="Transparent variant">
                <div className="flex flex-wrap gap-3 items-center">
                  <ActionButton variant="transparent">Transparent</ActionButton>
                  <ActionButton variant="transparent" iconLeft={<Zap className="w-4 h-4" />}>With Icon</ActionButton>
                  <ActionButton variant="transparent" disabled>Disabled</ActionButton>
                </div>
              </Subsection>
            </div>
          </Section>

          <Section title="Museum — ActionCard (pre-Card)">
            <div className="space-y-6">
              <Subsection label="Small (8px Chamfer / 8px Left Col)">
                <ActionCard cornerSize="sm">
                  Small Chamfer
                </ActionCard>
              </Subsection>

              <Subsection label="Medium (12px Chamfer / 12px Left Col)">
                <ActionCard cornerSize="md">
                  Medium Chamfer (Default)
                </ActionCard>
              </Subsection>

              <Subsection label="Large (24px Chamfer / 12px Left Col)">
                <ActionCard cornerSize="lg">
                  Large Chamfer
                </ActionCard>
              </Subsection>
            </div>
          </Section>

          <Section title="Museum — shadcn/ui Buttons">
            <div className="space-y-4">
              <Subsection label="Variants">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </Subsection>

              <Subsection label="Sizes">
                <div className="flex items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon"><Zap className="w-4 h-4" /></Button>
                </div>
              </Subsection>
            </div>
          </Section>

          <Section title="Museum — shadcn/ui Inputs">
            <div className="space-y-4">
              <Subsection label="Slider">
                <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
                <p className="text-label-xs mt-1">Value: {sliderValue[0]}</p>
              </Subsection>

              <Subsection label="Switch">
                <div className="flex items-center gap-4">
                  <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
                  <span className="text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>{switchOn ? "On" : "Off"}</span>
                  <Switch disabled />
                  <span className="text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>Disabled</span>
                </div>
              </Subsection>
            </div>
          </Section>

          <Section title="Museum — shadcn/ui Feedback">
            <div className="space-y-4">
              <Subsection label="Badge variants">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </Subsection>

              <Subsection label="Progress">
                <div className="space-y-2">
                  <Progress value={25} />
                  <Progress value={66} />
                  <Progress value={100} />
                </div>
              </Subsection>

              <Subsection label="LoadingSpinner (sizes)">
                <div className="flex items-center gap-6">
                  <LoadingSpinner size="sm" />
                  <LoadingSpinner size="md" message="Loading" />
                  <LoadingSpinner size="lg" />
                </div>
              </Subsection>

              <Subsection label="SkeletonCard">
                <SkeletonCard />
              </Subsection>
            </div>
          </Section>

          <Section title="Museum — shadcn/ui Card">
            <Card>
              <CardHeader>
                <CardTitle className="text-heading-h5">Card Title</CardTitle>
                <CardDescription>Card description text</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-paragraph-sm">Card content goes here.</p>
              </CardContent>
            </Card>
          </Section>

      </div>

      {showConfirmModal && (
        <ConfirmationModal
          title="Confirm Action"
          description="This is a demo confirmation modal. No action will be taken."
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          onConfirm={() => { setShowConfirmModal(false); toast.success("Confirmed!"); }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </AppLayout>
  );
};

// ─── Helper components for gallery layout ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-label-xs uppercase tracking-widest mb-3 pb-2" style={{ color: 'var(--text-card-label)', borderBottom: '2px solid var(--border-spacer)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Subsection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-label-xs uppercase tracking-widest mb-2" style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function IconDisplay({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center justify-center" style={{ color: 'var(--text-header)' }}>
        {icon}
      </div>
      <p className="text-label-xs" style={{ fontSize: '9px', color: 'var(--text-disabled)' }}>{name}</p>
    </div>
  );
}

function ColorSwatch({ name, style }: { name: string; style: React.CSSProperties }) {
  return (
    <div className="text-center">
      <div className="w-full aspect-square" style={style} />
      <p className="text-label-xs mt-1" style={{ fontSize: '9px', color: 'var(--text-disabled)' }}>{name}</p>
    </div>
  );
}
