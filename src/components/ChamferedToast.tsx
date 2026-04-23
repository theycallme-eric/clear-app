import { ReactNode } from "react";
import { CircleCheck, CircleX, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { ChamferedFrame } from "./ChamferedFrame";
import { LeftColumn } from "./LeftColumn";

type ToastVariant = "success" | "error" | "info";

interface ChamferedToastProps {
  id: string | number;
  variant: ToastVariant;
  title: string;
  description?: string;
  icon?: ReactNode;
}

/**
 * ChamferedToast - Toast notification matching Figma design
 *
 * Structure (from Figma):
 * - 12px left accent column
 * - Center content with icon + title
 * - 12px chamfered corner
 * - Fixed 68px height
 * - No close button, no description
 */
function ChamferedToast({
  id,
  variant,
  title,
  description,
  icon,
}: ChamferedToastProps) {
  const variantConfig = {
    success: {
      surface: "var(--surface-success)",
      accent: "var(--surface-success-accent)",
      border: "var(--border-success)",
      text: "var(--text-success)",
      defaultIcon: <CircleCheck style={{ width: 24, height: 24 }} />,
    },
    error: {
      surface: "var(--surface-error)",
      accent: "var(--surface-error-accent)",
      border: "var(--border-error)",
      text: "var(--text-error)",
      defaultIcon: <CircleX style={{ width: 24, height: 24 }} />,
    },
    info: {
      surface: "var(--surface-info)",
      accent: "var(--surface-info-accent)",
      border: "var(--border-info)",
      text: "var(--text-info)",
      defaultIcon: <CircleAlert style={{ width: 24, height: 24 }} />,
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      className="scanlines"
      style={{
        position: 'relative',
        display: 'grid',
        width: 'calc(100vw - 32px)',
        maxWidth: 349,
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        gridTemplateColumns: '10px 1fr',
        ...(description ? { minHeight: 68 } : { height: 68 }),
      }}
      onClick={() => toast.dismiss(id)}
    >
      {/* Left accent column - 12px wide, overlaps 2px into next column */}
      <LeftColumn
        size="sm"
        surfaceColor={config.accent}
        borderColor={config.border}
        style={{ position: 'relative', zIndex: 10, height: '100%', width: 12 }}
      />

      {/* Main body with chamfered corner */}
      <ChamferedFrame
        cornerSize="sm"
        surfaceColor={config.surface}
        borderColor={config.border}
        hasLeftBorder={false}
        style={{ height: '100%' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-200)',
            height: '100%',
            padding: `0 var(--spacing-300)`,
            color: config.text,
          }}
        >
          {/* Icon */}
          <span style={{ flexShrink: 0 }}>
            {icon || config.defaultIcon}
          </span>

          {/* Title + Description */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p className="text-label-md" style={{ fontWeight: 500 }}>
              {title}
            </p>
            {description && (
              <p className="text-label-sm" style={{ opacity: 0.8 }}>
                {description}
              </p>
            )}
          </div>
        </div>
      </ChamferedFrame>
    </div>
  );
}

/**
 * Toast helper functions
 */
export const chamferedToast = {
  success: (title: string, options?: { description?: string; icon?: ReactNode }) => {
    return toast.custom((id) => (
      <ChamferedToast
        id={id}
        variant="success"
        title={title}
        description={options?.description}
        icon={options?.icon}
      />
    ));
  },

  error: (title: string, options?: { description?: string; icon?: ReactNode }) => {
    return toast.custom((id) => (
      <ChamferedToast
        id={id}
        variant="error"
        title={title}
        description={options?.description}
        icon={options?.icon}
      />
    ));
  },

  info: (title: string, options?: { description?: string; icon?: ReactNode }) => {
    return toast.custom((id) => (
      <ChamferedToast
        id={id}
        variant="info"
        title={title}
        description={options?.description}
        icon={options?.icon}
      />
    ));
  },
};

export { ChamferedToast };
