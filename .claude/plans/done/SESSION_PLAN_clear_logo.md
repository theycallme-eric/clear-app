# Session Plan: ClearLogo Component

## Session Goal
Create a reusable `<ClearLogo />` React component that renders the Clear wordmark with a glowing scan line and brightness differential treatment.

## Context
- Reference: `design-tokens.json`, `src/index.css` for token values
- Visual spec: The HTML prototype at `.claude/inbox/clear-logo-exploration.html` (drop this file alongside this plan)
- Current state: No logo component exists. "CLEAR" text is likely hardcoded wherever it appears.

---

## Design Spec

The logo is the word **CLEAR** in **Oxanium Bold, uppercase, wide letter-spacing (0.18em)**, split by a horizontal scan line.

### Core Treatment: Brightness Differential + Glow Scanline
- The text is split into two halves by a horizontal line at ~57% from top
- **Top half:** full brightness (`--color-text-primary` / near-white)
- **Bottom half:** reduced brightness (~55% opacity of the same color)
- **Scan line:** a 1-2px horizontal bar in theme orange, extending 12% beyond the wordmark on each side
- **Scan line glow:** `box-shadow` using theme orange at multiple blur radii (8px/20px/40px, decreasing opacity)

### Color Rules
- Use CSS custom properties from the existing design system, NOT hardcoded hex values
- The scan line color should use the theme's primary/accent orange token
- Text color should use the existing text color token
- This should respect theme switching if the app supports it

### Sizes
The component needs a `size` prop with these presets:

| Size | Font Size | Scan Line Height | Context |
|------|-----------|------------------|---------|
| `sm` | 14px | 1px | Nav bar |
| `md` | 24px | 1px | Header |
| `lg` | 48px | 2px | Feature |
| `xl` | 72px | 2px | Hero / Splash |

### Boot Animation (optional prop)
When `boot={true}` is passed:
1. The wordmark starts hidden (masked)
2. The scan line starts at the top
3. On mount, the scan line sweeps down to its resting position (57%) over ~800ms with `cubic-bezier(0.16, 0.6, 0.4, 1)` easing
4. As the scan line passes, it reveals the text behind it (the mask recedes)
5. The scan line then stays at its resting position — this is the static logo

The animation plays once on mount. Without the `boot` prop, the logo renders in its final static state immediately.

### Icon Variant
When `variant="icon"` is passed:
- Renders only the letter **C** (same font treatment)
- Inside a container with `border-radius: 16px` and a subtle orange border at ~15% opacity
- The scan line cuts through the C at the same 54% position
- Background is the app's dark background color
- Use this for favicon or small icon contexts

---

## Tasks

### 1. Create the ClearLogo component

**Do:**
- Create `src/components/ClearLogo.tsx` (or `.jsx`, match the project's convention)
- Implement the brightness differential using CSS `clip-path: inset(...)` to split the text into top/bottom halves
- Implement the scan line as a positioned pseudo-element or a styled div
- Add the glow via box-shadow on the scan line
- Props: `size` (sm/md/lg/xl, default md), `boot` (boolean, default false), `variant` ("wordmark" | "icon", default "wordmark")
- Use Tailwind classes where they exist for the values you need; use inline styles or a small CSS module only for things Tailwind can't express (clip-path, specific box-shadow with theme colors, animation keyframes)

**Acceptance:**
- `<ClearLogo />` renders the brightness differential wordmark with glowing scan line at `md` size
- `<ClearLogo size="xl" boot />` plays the scan-down reveal animation once on mount
- `<ClearLogo variant="icon" size="lg" />` renders the C-in-container icon
- No hardcoded color hex values — all colors reference design tokens / CSS custom properties
- Component works on dark backgrounds (the only background it'll ever be on)

---

### 2. Replace existing CLEAR text with the component

**Do:**
- Search the codebase for any hardcoded "CLEAR" text used as branding/logo (headers, splash screens, etc.)
- Replace with `<ClearLogo />` using the appropriate size prop for context
- If there's a splash/loading screen, use `<ClearLogo size="xl" boot />` there

**Acceptance:**
- All branding instances of "CLEAR" now use the component
- Sizes are appropriate to context (small in nav, large in splash)
- Boot animation only plays on splash/loading — not in the persistent header

---

### 3. Add Oxanium font if not already loaded

**Do:**
- Check if Oxanium is already imported in the project (it should be — it's in the design system)
- If not, add it via Google Fonts import or local font file, matching how other project fonts are loaded
- The logo component should reference `font-family: 'Oxanium'` (or the Tailwind class if one is configured)

**Acceptance:**
- Oxanium Bold renders correctly in the logo
- No FOUT (flash of unstyled text) — font loading matches existing pattern

---

## Design System Compliance
- All colors via CSS custom properties / design tokens — zero hardcoded hex
- Font: Oxanium Bold, uppercase, letter-spacing 0.18em
- Follow existing component file patterns (check how other shared components are structured)
- The HTML prototype is a visual reference, not code to copy — translate the intent into idiomatic React using the project's patterns

## After Session
- [ ] Update SESSION_LOG.md with: Date, Tasks Completed, Files Touched
- [ ] Update PROJECT_MAP.md if a new shared components directory was created
- [ ] Confirm: "Session complete. ClearLogo component created and integrated. Log updated."
