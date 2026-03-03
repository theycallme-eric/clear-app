import { useState } from "react";
import { ArrowLeft, Dumbbell, Zap, AlertCircle, User, HelpCircle, Maximize2, Pencil } from "lucide-react";

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

interface ComponentGalleryProps {
  onBack: () => void;
}

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
export const ComponentGallery = ({ onBack }: ComponentGalleryProps) => {
  // Local state for interactive demos (no app side effects)
  const [intensityValue, setIntensityValue] = useState(7);
  const [anchorValue, setAnchorValue] = useState<AnchorType | null>("LOWER BODY");
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchOn, setSwitchOn] = useState(true);
  const [radioTextSelected, setRadioTextSelected] = useState<string | null>("Option A");
  const [radioIconSelected, setRadioIconSelected] = useState<number | null>(1);

  const sampleLocations = [
    { id: "1", name: "Home Gym", tier: "home" as const, equipment: ["Dumbbells", "Bench"] },
    { id: "2", name: "Commercial Gym", tier: "full" as const, equipment: ["Barbell", "Rack", "Cables"] },
  ];

  return (
    <div className="min-h-screen grain-overlay">
      <div className="max-w-md mx-auto pb-32">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4">
          <button
            onClick={onBack}
            className="p-2 transition-colors"
            style={{ color: 'var(--icon-cta)' }}
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-heading-h4 font-bold tracking-wider uppercase" style={{ color: 'var(--text-header)' }}>
            Component Gallery
          </h1>
          <div className="w-10" />
        </header>

        <div className="px-4 space-y-8">

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
              <LoadingScreen message="CLEAR" subtitle="Loading your data..." className="min-h-0 h-full" />
            </ChamferedCard>
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
      </div>
    </div >
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

function ColorSwatch({ name, style }: { name: string; style: React.CSSProperties }) {
  return (
    <div className="text-center">
      <div className="w-full aspect-square" style={style} />
      <p className="text-label-xs mt-1" style={{ fontSize: '9px', color: 'var(--text-disabled)' }}>{name}</p>
    </div>
  );
}
