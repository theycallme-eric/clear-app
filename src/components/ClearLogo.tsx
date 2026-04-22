import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg" | "xl";
type LogoVariant = "wordmark" | "icon";

interface ClearLogoProps {
  size?: LogoSize;
  boot?: boolean;
  variant?: LogoVariant;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { fontSize: 14, scanlineHeight: 1 },
  md: { fontSize: 24, scanlineHeight: 1 },
  lg: { fontSize: 48, scanlineHeight: 2 },
  xl: { fontSize: 72, scanlineHeight: 2 },
} as const;

const SCAN_POSITION = "57%";
const ICON_SCAN_POSITION = "54%";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type BootPhase = "idle" | "animating" | "done";

export const ClearLogo = ({
  size = "md",
  boot = false,
  variant = "wordmark",
  className,
}: ClearLogoProps) => {
  const [phase, setPhase] = useState<BootPhase>(boot ? "idle" : "done");
  const { fontSize, scanlineHeight } = SIZE_CONFIG[size];

  useEffect(() => {
    if (phase !== "idle") return;
    if (prefersReducedMotion()) {
      setPhase("done");
      return;
    }
    const id = requestAnimationFrame(() => setPhase("animating"));
    return () => cancelAnimationFrame(id);
  }, [phase]);

  if (variant === "icon") {
    return (
      <IconVariant
        fontSize={fontSize}
        scanlineHeight={scanlineHeight}
        className={className}
      />
    );
  }

  const textBase: React.CSSProperties = {
    fontFamily: "var(--font-label)",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    lineHeight: 1,
    fontSize,
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Invisible sizer */}
      <span aria-hidden="true" style={{ ...textBase, visibility: "hidden" }}>
        CLEAR
      </span>

      <span className="sr-only">CLEAR</span>

      {/* Text container — clip-path reveals text during boot (no opaque mask) */}
      <div
        aria-hidden="true"
        className={phase === "animating" ? "clear-logo-text-reveal" : undefined}
        onAnimationEnd={() => setPhase("done")}
        style={{
          position: "absolute",
          inset: 0,
          clipPath: phase === "idle" ? "inset(0 0 100% 0)" : undefined,
        }}
      >
        {/* Top half — full brightness */}
        <span
          style={{
            ...textBase,
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            color: "var(--text-color)",
            clipPath: "inset(0 0 44% 0)",
          }}
        >
          CLEAR
        </span>

        {/* Bottom half — reduced brightness (dims during phase 2 of boot) */}
        <span
          className={phase === "animating" ? "clear-logo-bottom-dim" : undefined}
          style={{
            ...textBase,
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            color: "var(--text-color)",
            opacity: phase === "done" ? 0.55 : 1,
            clipPath: "inset(56% 0 0 0)",
          }}
        >
          CLEAR
        </span>
      </div>

      {/* Scan line */}
      <div
        aria-hidden="true"
        className={phase === "animating" ? "clear-logo-scanline-sweep" : undefined}
        style={{
          position: "absolute",
          left: "-12%",
          right: "-12%",
          height: scanlineHeight,
          top: phase === "idle" ? "0%" : phase === "done" ? SCAN_POSITION : undefined,
          opacity: phase === "idle" ? 0 : 1,
          zIndex: 3,
          background: "var(--brand-primary)",
          boxShadow:
            "0 0 8px var(--brand-glow-strong), 0 0 20px var(--brand-glow-medium), 0 0 40px var(--brand-glow-subtle)",
        }}
      />
    </div>
  );
};

/** Icon variant: single "C" in rounded container with scan line */
const IconVariant = ({
  fontSize,
  scanlineHeight,
  className,
}: {
  fontSize: number;
  scanlineHeight: number;
  className?: string;
}) => {
  const containerSize = Math.round(fontSize * 1.75);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden",
        className
      )}
      style={{ width: containerSize, height: containerSize, borderRadius: 16 }}
    >
      {/* Background + border */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--background)",
          border: "1px solid var(--brand-border)",
          borderRadius: 16,
        }}
      />

      <span className="sr-only">CLEAR</span>

      {/* Letter */}
      <span
        aria-hidden="true"
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: "var(--font-label)",
          fontWeight: 700,
          textTransform: "uppercase",
          color: "var(--text-color)",
          lineHeight: 1,
          fontSize,
        }}
      >
        C
      </span>

      {/* Scan line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: scanlineHeight,
          top: ICON_SCAN_POSITION,
          zIndex: 2,
          background: "var(--brand-primary)",
          boxShadow:
            "0 0 8px var(--brand-glow-strong), 0 0 20px var(--brand-glow-medium)",
        }}
      />
    </div>
  );
};
