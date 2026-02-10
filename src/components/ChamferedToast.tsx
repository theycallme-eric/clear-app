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
  icon,
}: ChamferedToastProps) {
  const variantConfig = {
    success: {
      surface: "var(--surface-success)",
      accent: "var(--surface-success-accent)",
      border: "var(--border-success)",
      text: "var(--text-success)",
      defaultIcon: <CircleCheck className="size-6" />,
    },
    error: {
      surface: "var(--surface-error)",
      accent: "var(--surface-error-accent)",
      border: "var(--border-error)",
      text: "var(--text-error)",
      defaultIcon: <CircleX className="size-6" />,
    },
    info: {
      surface: "var(--surface-info)",
      accent: "var(--surface-info-accent)",
      border: "var(--border-info)",
      text: "var(--text-info)",
      defaultIcon: <CircleAlert className="size-6" />,
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      className="flex items-stretch w-[349px] h-[68px] cursor-pointer"
      onClick={() => toast.dismiss(id)}
    >
      {/* Left accent column - 12px wide */}
      <LeftColumn
        size="sm"
        surfaceColor={config.accent}
        borderColor={config.border}
        className="relative z-10 !w-[12px]"
      />

      {/* Main body with chamfered corner */}
      <ChamferedFrame
        cornerSize="sm"
        surfaceColor={config.surface}
        borderColor={config.border}
        hasLeftBorder={false}
        className="flex-1 -ml-[2px] h-full"
      >
        <div
          className="flex items-center gap-2 h-full px-3"
          style={{ color: config.text }}
        >
          {/* Icon */}
          <span className="shrink-0">
            {icon || config.defaultIcon}
          </span>

          {/* Title */}
          <p className="font-label text-base font-medium">
            {title}
          </p>
        </div>
      </ChamferedFrame>
    </div>
  );
}

/**
 * Toast helper functions
 */
export const chamferedToast = {
  success: (title: string, options?: { icon?: ReactNode }) => {
    return toast.custom((id) => (
      <ChamferedToast
        id={id}
        variant="success"
        title={title}
        icon={options?.icon}
      />
    ));
  },

  error: (title: string, options?: { icon?: ReactNode }) => {
    return toast.custom((id) => (
      <ChamferedToast
        id={id}
        variant="error"
        title={title}
        icon={options?.icon}
      />
    ));
  },

  info: (title: string, options?: { icon?: ReactNode }) => {
    return toast.custom((id) => (
      <ChamferedToast
        id={id}
        variant="info"
        title={title}
        icon={options?.icon}
      />
    ));
  },
};

export { ChamferedToast };
