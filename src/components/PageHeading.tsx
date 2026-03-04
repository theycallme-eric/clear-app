import { ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const headingClassMap: Record<HeadingLevel, string> = {
  h1: "text-heading-h1",
  h2: "text-heading-h2",
  h3: "text-heading-h3",
  h4: "text-heading-h4",
  h5: "text-heading-h5",
  h6: "text-heading-h6",
};

interface PageHeadingProps {
  /** The heading text content */
  children: ReactNode;
  /** Semantic heading level (HTML element). Default: "h2" */
  level?: HeadingLevel;
  /** Override visual typography size independently of semantic level */
  textSize?: HeadingLevel;
  /** Additional className for the outer wrapper */
  className?: string;
}

/**
 * PageHeading — Full-bleed structural band heading.
 *
 * Renders a heading inside a tinted surface strip with top/bottom borders.
 * Uses -mx-4 to escape the standard px-4 content padding for full-bleed.
 * For layouts with different padding (e.g. AuthLayout px-6), override via className.
 */
export function PageHeading({
  children,
  level = "h2",
  textSize,
  className,
}: PageHeadingProps) {
  const Tag = level as ElementType;
  const sizeClass = headingClassMap[textSize ?? level];

  return (
    <div
      className={cn("-mx-4 px-4 py-3 text-center", className)}
      style={{
        background: "var(--surface-heading)",
        borderTop: "2px solid var(--border-heading)",
        borderBottom: "2px solid var(--border-heading)",
      }}
    >
      <Tag
        className={cn(sizeClass, "font-bold uppercase tracking-wider")}
        style={{ color: "var(--text-header)" }}
      >
        {children}
      </Tag>
    </div>
  );
}
