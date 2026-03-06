/**
 * CLEAR Icon Set — solid, geometric, angular.
 * Drop-in replacements for lucide-react icons.
 *
 * Design language:
 * - Solid fills (not stroked outlines)
 * - Angular/geometric construction
 * - Chamfered tips on directional icons (signature CLEAR detail)
 * - Chunky proportions — reads like stamped HUD glyphs
 *
 * All icons use a 24x24 viewBox and accept size/className/style props
 * matching the lucide-react API for easy migration.
 */

export interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Svg = ({
  size = 24,
  className,
  style,
  children,
}: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
    aria-hidden="true"
  >
    {children}
  </svg>
);

// ─── Directional (chamfered tips) ───

export const ChevronRight = (props: IconProps) => (
  <Svg {...props}>
    <path d="M7 3L17 10.5V13.5L7 21V16L13 12L7 8V3Z" />
  </Svg>
);

export const ChevronLeft = (props: IconProps) => (
  <Svg {...props}>
    <path d="M17 3L7 10.5V13.5L17 21V16L11 12L17 8V3Z" />
  </Svg>
);

export const ChevronDown = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 7L10.5 17H13.5L21 7H16L12 12L8 7H3Z" />
  </Svg>
);

export const ChevronUp = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 17L10.5 7H13.5L21 17H16L12 12L8 17H3Z" />
  </Svg>
);

export const ArrowRight = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 9H13V4L21 10.5V13.5L13 20V15H3V9Z" />
  </Svg>
);

export const ArrowLeft = (props: IconProps) => (
  <Svg {...props}>
    <path d="M21 9H11V4L3 10.5V13.5L11 20V15H21V9Z" />
  </Svg>
);

// ─── Actions ───

export const Menu = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 4H21V7H3V4Z M3 10.5H21V13.5H3V10.5Z M3 17H21V20H3V17Z" />
  </Svg>
);

export const X = (props: IconProps) => (
  <Svg {...props}>
    <path d="M6 3L12 9L18 3L21 6L15 12L21 18L18 21L12 15L6 21L3 18L9 12L3 6Z" />
  </Svg>
);

export const Plus = (props: IconProps) => (
  <Svg {...props}>
    <path d="M10 3H14V10H21V14H14V21H10V14H3V10H10V3Z" />
  </Svg>
);

export const Minus = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 10H21V14H3V10Z" />
  </Svg>
);

export const Check = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 12L6.5 9L11 14L18 5L20.5 7.5L11 20L4 12Z" />
  </Svg>
);

// ─── Status / Feedback ───

export const RefreshCw = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 4V9H15L17.5 6.5C16 5 14.1 4 12 4C7.6 4 4 7.6 4 12H2C2 6.5 6.5 2 12 2C14.7 2 17.1 3.1 18.9 4.9L20 4Z" />
    <path d="M4 20V15H9L6.5 17.5C8 19 9.9 20 12 20C16.4 20 20 16.4 20 12H22C22 17.5 17.5 22 12 22C9.3 22 6.9 20.9 5.1 19.1L4 20Z" />
  </Svg>
);

export const Loader2 = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 2H14V6H12V2Z" opacity="1" />
    <path d="M12 18H14V22H12V18Z" opacity="0.4" />
    <path d="M22 12V14H18V12H22Z" opacity="0.7" />
    <path d="M6 12V14H2V12H6Z" opacity="0.5" />
    <path d="M18.4 4.2L19.8 5.6L17 8.4L15.6 7L18.4 4.2Z" opacity="0.85" />
    <path d="M7 15.6L8.4 17L5.6 19.8L4.2 18.4L7 15.6Z" opacity="0.45" />
    <path d="M19.8 18.4L18.4 19.8L15.6 17L17 15.6L19.8 18.4Z" opacity="0.55" />
    <path d="M8.4 7L7 8.4L4.2 5.6L5.6 4.2L8.4 7Z" opacity="0.3" />
  </Svg>
);

export const Eye = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 5C6 5 2 12 2 12C2 12 6 19 12 19C18 19 22 12 22 12C22 12 18 5 12 5ZM12 16C9.8 16 8 14.2 8 12C8 9.8 9.8 8 12 8C14.2 8 16 9.8 16 12C16 14.2 14.2 16 12 16Z" />
    <rect x="10.5" y="10.5" width="3" height="3" />
  </Svg>
);

export const EyeOff = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 3L21 20L19.5 21.5L16.5 18.5C15.1 19.2 13.6 19.5 12 19.5C6 19.5 2 12 2 12C2 12 3.9 8.7 7 6.5L2.5 2L4 3Z" />
    <path d="M12 5C13.4 5 14.8 5.3 16 5.8L12.2 9.6C10.6 9.8 9.2 11.2 9 12.8L5.5 9.3C6.8 7.8 9 6 12 5Z" />
    <path d="M22 12C22 12 20.1 15.3 17 17.5L14.5 15C15.4 14.2 16 13.2 16 12C16 11.5 15.9 11 15.7 10.6L22 12Z" />
  </Svg>
);

export const CircleCheck = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM6.5 12L8.5 9.5L11 12.5L16 6.5L18 9L11 18L6.5 12Z" />
  </Svg>
);

export const CircleX = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM8.5 6.5L12 10L15.5 6.5L17.5 8.5L14 12L17.5 15.5L15.5 17.5L12 14L8.5 17.5L6.5 15.5L10 12L6.5 8.5L8.5 6.5Z" />
  </Svg>
);

export const CircleAlert = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM11 7H13V14H11V7ZM11 16H13V18H11V16Z" />
  </Svg>
);

// ─── Semantic / Content ───

export const Zap = (props: IconProps) => (
  <Svg {...props}>
    <path d="M13 2L4 13H11L10 22L20 11H13L13 2Z" />
  </Svg>
);

export const Flame = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 2C12 2 7 8 7 13C7 16.3 9.2 19 12 20C14.8 19 17 16.3 17 13C17 8 12 2 12 2ZM12 17C10.7 17 9.5 15.8 9.5 14C9.5 11.5 12 8 12 8C12 8 14.5 11.5 14.5 14C14.5 15.8 13.3 17 12 17Z" />
  </Svg>
);

export const Star = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 2L14.5 8.5H21L16 13L18 20L12 16L6 20L8 13L3 8.5H9.5L12 2Z" />
  </Svg>
);

export const Dumbbell = (props: IconProps) => (
  <Svg {...props}>
    <path d="M2 10H4V8H7V10H17V8H20V10H22V14H20V16H17V14H7V16H4V14H2V10Z" />
  </Svg>
);

export const Clock = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM11 6H13V12H17V14H11V6Z" />
  </Svg>
);

export const Gauge = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3C6.5 3 2 7.5 2 13C2 15.8 3.1 18.3 4.9 20H19.1C20.9 18.3 22 15.8 22 13C22 7.5 17.5 3 12 3ZM13 8L14.5 13.5L12 15L9.5 13.5L13 8Z" />
  </Svg>
);

export const Target = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 6C8.7 6 6 8.7 6 12C6 15.3 8.7 18 12 18C15.3 18 18 15.3 18 12C18 8.7 15.3 6 12 6ZM12 9C10.3 9 9 10.3 9 12C9 13.7 10.3 15 12 15C13.7 15 15 13.7 15 12C15 10.3 13.7 9 12 9Z" />
  </Svg>
);

export const Crosshair = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M11 2H13V5.1C16.4 5.6 19 8.5 19 12H13V18.9C16.4 18.4 19 15.5 19 12H22V11H19C19 7.7 16.9 4.9 14 3.6V2H13V3.1C12.7 3 12.3 3 12 3C11.7 3 11.3 3 11 3.1V2ZM11 5.1V8H13V5.1C15.3 5.6 17 7.6 17 10V11H14V13H17V14C17 16.4 15.3 18.4 13 18.9V16H11V18.9C8.7 18.4 7 16.4 7 14V13H10V11H7V10C7 7.6 8.7 5.6 11 5.1ZM5 11H2V13H5V11Z" />
  </Svg>
);

export const FileText = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M4 2H15L20 7V22H4V2ZM14 3H5V21H19V8H14V3ZM7 11H17V13H7V11ZM7 15H14V17H7V15Z" />
  </Svg>
);

export const Pencil = (props: IconProps) => (
  <Svg {...props}>
    <path d="M16.5 3.5L20.5 7.5L8 20H4V16L16.5 3.5Z" />
  </Svg>
);

export const User = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 4C9.8 4 8 5.8 8 8C8 10.2 9.8 12 12 12C14.2 12 16 10.2 16 8C16 5.8 14.2 4 12 4Z" />
    <path d="M4 20C4 16.7 7.6 14 12 14C16.4 14 20 16.7 20 20V21H4V20Z" />
  </Svg>
);

// ─── Mood (session debrief) ───

export const Frown = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM8 9H10V11H8V9ZM14 9H16V11H14V9ZM8 17L9 15H15L16 17H8Z" />
  </Svg>
);

export const Meh = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM8 9H10V11H8V9ZM14 9H16V11H14V9ZM8 15H16V17H8V15Z" />
  </Svg>
);

export const Smile = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM8 9H10V11H8V9ZM14 9H16V11H14V9ZM8 15L9 17H15L16 15H8Z" />
  </Svg>
);

export const SmilePlus = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM8 9H10V11H8V9ZM14 9H16V11H14V9ZM8 14L9 16H15L16 14H8ZM19 4H21V6H23V8H21V10H19V8H17V6H19V4Z" />
  </Svg>
);

export const ThumbsDown = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 3H8V13H4V3Z" />
    <path d="M8 3H14L16 7V13H12L13 18L10 20L8 13V3Z" />
  </Svg>
);

// ─── Remaining utility ───

export const AlertCircle = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM11 7H13V14H11V7ZM11 16H13V18H11V16Z" />
  </Svg>
);

export const HelpCircle = (props: IconProps) => (
  <Svg {...props}>
    <path fillRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM10 8.5C10 7.7 10.9 7 12 7C13.1 7 14 7.7 14 8.5C14 9.3 13.1 10 12 10H11V13H13V11.5C14.7 11 16 9.9 16 8.5C16 6.6 14.2 5 12 5C9.8 5 8 6.6 8 8.5H10ZM11 16H13V18H11V16Z" />
  </Svg>
);

export const Maximize2 = (props: IconProps) => (
  <Svg {...props}>
    <path d="M15 3H21V9H19V5H15V3Z" />
    <path d="M9 3H3V9H5V5H9V3Z" />
    <path d="M15 21H21V15H19V19H15V21Z" />
    <path d="M9 21H3V15H5V19H9V21Z" />
  </Svg>
);
