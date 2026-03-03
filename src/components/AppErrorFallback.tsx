import { useState } from "react";
import type { FallbackProps } from "react-error-boundary";

/**
 * Top-level crash screen shown when the entire app fails to render.
 * Uses only inline styles and CSS variables — no component imports,
 * since the component tree itself may be broken.
 */
export function AppErrorFallback({ error }: FallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-neutral-900)",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <h1
          style={{
            fontFamily: "Rajdhani, sans-serif",
            fontWeight: 700,
            fontSize: "1.5rem",
            color: "var(--color-red-300)",
            marginBottom: 8,
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "0.875rem",
            color: "var(--color-neutral-300)",
            marginBottom: 24,
          }}
        >
          The app hit an unexpected error. Reloading usually fixes it.
        </p>

        <button
          onClick={() => window.location.reload()}
          style={{
            fontFamily: "Rajdhani, sans-serif",
            fontWeight: 600,
            fontSize: "0.875rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "10px 24px",
            border: "1px solid var(--color-orange-500)",
            borderRadius: 8,
            background: "var(--color-orange-alpha-400)",
            color: "var(--color-blue-100)",
            cursor: "pointer",
          }}
        >
          Reload
        </button>

        {import.meta.env.DEV && (
          <div style={{ marginTop: 24, textAlign: "left" }}>
            <button
              onClick={() => setShowDetails((prev) => !prev)}
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "0.75rem",
                color: "var(--color-neutral-400)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {showDetails ? "Hide" : "Show"} error details
            </button>
            {showDetails && (
              <pre
                style={{
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 6,
                  background: "var(--color-neutral-alpha-200)",
                  color: "var(--color-red-300)",
                  fontSize: "0.7rem",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                {error?.message}
                {"\n"}
                {error?.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
