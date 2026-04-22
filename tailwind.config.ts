import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      spacing: {
        // Primitives — map to existing CSS vars in src/index.css
        'px': '1px',
        '0': '0px',
        '0.5': 'var(--spacing-50)',   // 2px
        '1': 'var(--spacing-100)',    // 4px
        '2': 'var(--spacing-200)',    // 8px
        '3': 'var(--spacing-300)',    // 12px
        '4': 'var(--spacing-400)',    // 16px
        '5': 'var(--spacing-500)',    // 20px
        '6': 'var(--spacing-600)',    // 24px
        '8': 'var(--spacing-700)',    // 32px
        '10': 'var(--spacing-800)',   // 40px
        '12': 'var(--spacing-1000)',  // 48px
        '14': 'var(--spacing-1100)',  // 56px
        '16': 'var(--spacing-1200)',  // 64px
        '24': 'var(--spacing-1300)',  // 96px
        '32': 'var(--spacing-1400)',  // 128px
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      fontFamily: {
        // Figma-aligned naming
        headings: ["Rajdhani", "sans-serif"],
        paragraph: ["Space Grotesk", "sans-serif"],
        label: ["Oxanium", "monospace"],
        // Legacy aliases (for backward compatibility during migration)
        display: ["Rajdhani", "sans-serif"],
        body: ["Space Grotesk", "sans-serif"],
        mono: ["Oxanium", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px var(--brand-glow-medium)" },
          "50%": { boxShadow: "0 0 16px var(--color-orange-alpha-500)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
