import { useState } from "react";
import { ArrowLeft, Dumbbell, Zap, AlertCircle } from "lucide-react";

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
import { GenerateButton } from "@/components/GenerateButton";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LoadingSkeleton, SkeletonCard } from "@/components/LoadingSkeleton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { ActionButton } from "@/components/ActionButton";
import { ActionCard } from "@/components/ActionCard";
import { CTAButton } from "@/components/CTAButton";
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
  const [anchorValue, setAnchorValue] = useState<AnchorType | null>("SQUAT");
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchOn, setSwitchOn] = useState(true);

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
            className="p-2 text-foreground/80 hover:text-foreground transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-display text-xl font-bold tracking-wider text-foreground uppercase">
            Component Gallery
          </h1>
          <div className="w-10" />
        </header>

        <div className="px-4 space-y-8">

          {/* ─── TYPOGRAPHY ─── */}
          <Section title="Typography">
            <div className="space-y-3">
              <p className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
                Display / font-display
              </p>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Mono Label / font-mono
              </p>
              <p className="font-body text-sm text-foreground">
                Body text / font-body — used for paragraph content and descriptions.
              </p>
              <p className="text-muted-foreground text-sm">
                Muted text — secondary information
              </p>
            </div>
          </Section>

          {/* ─── COLORS ─── */}
          <Section title="Colors">
            <div className="grid grid-cols-4 gap-2">
              <ColorSwatch name="orange" className="bg-clear-orange" />
              <ColorSwatch name="lime" className="bg-clear-lime" />
              <ColorSwatch name="purple" className="bg-clear-purple" />
              <ColorSwatch name="accent" className="bg-accent" />
              <ColorSwatch name="fg" className="bg-foreground" />
              <ColorSwatch name="muted" className="bg-muted-foreground" />
              <ColorSwatch name="bg" className="bg-background border border-muted-foreground/30" />
              <ColorSwatch name="card" className="bg-card border border-muted-foreground/30" />
            </div>
          </Section>

          {/* ─── BUTTONS ─── */}
          <Section title="Buttons — shadcn/ui">
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

              <Subsection label="States">
                <div className="flex gap-2">
                  <Button disabled>Disabled</Button>
                  <Button variant="outline" disabled>Disabled Outline</Button>
                </div>
              </Subsection>
            </div>
          </Section>

          <Section title="Buttons — App Custom">
            <div className="space-y-4">
              <Subsection label="glow-button">
                <button className="glow-button w-full py-3 font-display text-sm font-bold uppercase tracking-wider text-foreground">
                  Glow Button
                </button>
              </Subsection>

              <Subsection label="CTAButton secondary (replaces ghost-button)">
                <CTAButton variant="secondary" fullWidth>
                  Secondary Button
                </CTAButton>
              </Subsection>

              <Subsection label="selection-active / inactive">
                <div className="flex gap-2">
                  <button className="selection-active px-4 py-2 font-display text-sm font-semibold uppercase">
                    Active
                  </button>
                  <button className="selection-inactive px-4 py-2 font-display text-sm font-semibold uppercase text-foreground/90">
                    Inactive
                  </button>
                </div>
              </Subsection>
            </div>
          </Section>

          <Section title="ActionButton — Figma Design System">
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

          {/* ─── CHAMFERED FRAME EXAMPLES ─── */}
          <Section title="ChamferedFrame Example">
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

          {/* ─── INPUTS ─── */}
          <Section title="Inputs — shadcn/ui">
            <div className="space-y-4">
              <Subsection label="Input">
                <div className="space-y-2">
                  <Input placeholder="Placeholder text" />
                  <Input defaultValue="With value" />
                  <Input disabled placeholder="Disabled" />
                </div>
              </Subsection>

              <Subsection label="Textarea">
                <div className="space-y-2">
                  <Textarea placeholder="Placeholder text..." />
                  <Textarea disabled placeholder="Disabled" />
                </div>
              </Subsection>

              <Subsection label="Slider">
                <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
                <p className="text-xs text-muted-foreground mt-1 font-mono">Value: {sliderValue[0]}</p>
              </Subsection>

              <Subsection label="Switch">
                <div className="flex items-center gap-4">
                  <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
                  <span className="text-sm text-muted-foreground">{switchOn ? "On" : "Off"}</span>
                  <Switch disabled />
                  <span className="text-sm text-muted-foreground">Disabled</span>
                </div>
              </Subsection>
            </div>
          </Section>

          {/* ─── FEEDBACK ─── */}
          <Section title="Feedback">
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
              <Subsection label="glass-card">
                <div className="glass-card p-4">
                  <p className="font-display text-sm font-semibold text-foreground uppercase tracking-wide">
                    Glass Card
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Used throughout the app for content sections
                  </p>
                </div>
              </Subsection>

              <Subsection label="Card (shadcn/ui)">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Card Title</CardTitle>
                    <CardDescription>Card description text</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Card content goes here.</p>
                  </CardContent>
                </Card>
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
            <div className="glass-card overflow-hidden h-48 relative">
              <LoadingScreen message="CLEAR" subtitle="Loading your data..." className="min-h-0 h-full" />
            </div>
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
      <h2 className="font-mono text-xs uppercase tracking-widest text-clear-orange mb-3 border-b border-clear-orange/20 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Subsection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="text-center">
      <div className={`w-full aspect-square rounded ${className}`} />
      <p className="font-mono text-[9px] text-muted-foreground mt-1">{name}</p>
    </div>
  );
}
