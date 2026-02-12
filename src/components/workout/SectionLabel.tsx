import { cn } from "@/lib/utils";

type SectionType =
  | "warmup"
  | "primary"
  | "anchor"
  | "accessory"
  | "conditioning"
  | "core"
  | "mobility"
  | "cooldown";

interface SectionLabelProps {
  /** The section type to display */
  type: SectionType;
  /** Additional className */
  className?: string;
}

/**
 * SectionLabel - Displays the section type as an uppercase label.
 *
 * Used at the top of exercise cards to indicate the workout section context.
 * Examples: WARMUP, ANCHOR, ACCESSORY, CONDITIONING, CORE, MOBILITY
 */
export function SectionLabel({ type, className }: SectionLabelProps) {
  // Map section types to display labels
  const labelMap: Record<SectionType, string> = {
    warmup: "WARMUP",
    primary: "ANCHOR",
    anchor: "ANCHOR",
    accessory: "ACCESSORY",
    conditioning: "CONDITIONING",
    core: "CORE",
    mobility: "MOBILITY",
    cooldown: "COOLDOWN",
  };

  const label = labelMap[type] || type.toUpperCase();

  return (
    <span
      className={cn(
        "text-label-xs uppercase tracking-wider",
        className
      )}
      style={{ color: "var(--color-orange-300)" }}
    >
      {label}
    </span>
  );
}
