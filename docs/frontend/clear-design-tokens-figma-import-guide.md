# CLEAR Design Tokens — Figma Import Guide

## Recommended Plugin

**Tokens Studio for Figma** (formerly Figma Tokens)
- Free tier supports JSON import
- Handles nested token structures (color scales, typography composites, spacing)
- Supports token references and aliases
- [Install from Figma Community](https://www.figma.com/community/plugin/843461159747178978)

---

## Step-by-Step Import

### 1. Install Tokens Studio
- Open Figma → Plugins → Search "Tokens Studio" → Install

### 2. Import the JSON
1. Open Tokens Studio plugin panel
2. Click the **Settings** gear icon (bottom-left)
3. Under "Token Storage", select **Local document**
4. Go back to the main panel → click the **folder icon** or "Manage themes"
5. Click **Import** → select `clear-design-tokens.json`
6. The tokens will populate under their groups: `colors`, `typography`, `spacing`, `borderRadius`, `effects`, `components`, `sizing`

### 3. Apply Tokens as Styles
1. In Tokens Studio, select the token groups you want to convert
2. Click **Create Styles** (paintbrush icon at bottom):
   - **Color tokens** → become Figma Color Styles
   - **Typography text styles** → become Figma Text Styles
   - **Effects (shadows)** → become Figma Effect Styles
3. This gives you a full style library matching the codebase

### 4. Organize in Figma
- Tokens import with `/` separators creating folder hierarchy
- Example: `colors/purple/500` → folder `colors` → subfolder `purple` → style `500`
- Rename or reorganize as needed in the Styles panel

---

## Manual Adjustments Needed After Import

### Colors
- **HSL to Hex**: The JSON already provides hex values, so no conversion needed
- **Opacity variants**: Tokens like `glassCard.background` use `rgba()` with alpha. Tokens Studio handles these, but verify the opacity renders correctly in Figma's color picker

### Typography
- **Font availability**: Ensure `Oxanium`, `Rajdhani`, and `Inter` are installed locally or available via Google Fonts in Figma
- **Text styles**: The JSON provides `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, and `letterSpacing` as individual tokens. You'll need to manually compose these into Figma Text Styles by:
  1. Creating a text layer
  2. Applying each typography token (family, size, weight, etc.)
  3. Saving as a Text Style
- **Letter spacing**: JSON uses `em` units (e.g., `"0.05em"`). Figma uses `%` for letter spacing. Convert: `0.05em` = `5%`

### Effects
- **Backdrop blur**: Figma supports backdrop blur natively on frames, but Tokens Studio may not auto-apply it. Manually set:
  - Glass card: `backdrop-filter: blur(12px)` → Frame → Fill → enable "Backdrop blur" → 12px
- **CSS gradients**: The `grain` overlay and gradient backgrounds can't be directly tokenized. Recreate manually:
  - Background gradient: `linear-gradient(135deg, #0f0a1a, #1a0f2e, #0a1628)` → use Figma's gradient fill tool
- **Box shadows**: The `glow` effects use `box-shadow` with color values. These import as Effect Styles but verify the spread/blur values match

### Components
- **Border shorthand**: Tokens like `"border": "1px solid rgba(...)"` need to be broken into separate stroke weight + stroke color in Figma
- **Hover/Active states**: CSS pseudo-states (`:hover`, `:active`) don't have a Figma equivalent. Create these as component variants instead:
  - Default state
  - Hover state
  - Active/Pressed state
  - Disabled state
- **Transitions**: `transition` values (e.g., `"all 0.3s ease"`) are CSS-only. Note these in your Figma component documentation for developer handoff

### Spacing & Sizing
- **rem to px**: All spacing/sizing values are in `rem`. Tokens Studio can handle rem→px conversion if you set the base font size to `16px` in plugin settings
- **Semantic spacing**: Tokens like `spacing.semantic.cardPadding: "1.5rem"` → `24px` in Figma

---

## What Couldn't Be Automated

| Item | Reason | Workaround |
|------|--------|------------|
| **Backdrop blur effect** | Not a standard token type | Apply manually to glass-card frames |
| **CSS gradients** | Multi-stop gradients aren't tokenizable | Recreate with Figma gradient tool |
| **Grain/noise texture** | SVG filter effect | Use Figma noise fill plugin or texture image |
| **Hover/focus/active states** | CSS pseudo-classes | Create as Figma component variants |
| **Transitions/animations** | Motion isn't a Figma token | Document in component descriptions |
| **`clamp()` responsive sizing** | CSS function, not static value | Use Figma's auto-layout constraints instead |
| **Tailwind utility mappings** | Build-tool concern | Reference `tailwind.config.ts` for dev handoff |
| **CSS custom properties** | Runtime variable system | Tokens Studio variables cover this partially |
| **Glassmorphic composite** | Combines blur + transparency + border | Build as a Figma component with all effects applied |

---

## Tips

- **Use Figma Variables (2024+)**: If on a paid Figma plan, consider importing color and spacing tokens as Figma Variables instead of Styles. Variables support modes (light/dark) and are the newer standard.
- **Token references**: The JSON uses flat values, not references. If you want `semantic.accent` to reference `orange.500`, set this up manually in Tokens Studio using `{colors.orange.500}` syntax.
- **Keep in sync**: When the codebase tokens change, re-export the JSON and re-import into Tokens Studio. The plugin will show diffs.
- **Component library**: After importing tokens, build your Figma component library (buttons, cards, inputs) using the imported styles. This ensures design-to-code parity.
