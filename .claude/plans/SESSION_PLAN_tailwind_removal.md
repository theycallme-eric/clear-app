## Session Goal
Remove Tailwind CSS entirely from the CLEAR app. Replace all Tailwind utility classes with CSS custom properties and vanilla CSS.

## Context
- The CLEAR design system uses CSS custom properties exclusively for theming/tokens
- Tailwind is currently used in ~67 files, almost entirely for layout utilities (flex, gap, padding, margin, grid, positioning)
- 12 shadcn/ui files in `src/components/ui/` are the only Tailwind *color* token consumers
- The user explicitly wants zero Tailwind: "I would like to not use any tailwind if we could though"
- CLAUDE.md already says: "Do not introduce: Tailwind, styled-components, MUI, Chakra, or any CSS/component framework"
- Estimate: 2-3 sessions of work

## What Tailwind is doing today

### Layout utilities (~67 files)
The vast majority of Tailwind usage is layout: `flex`, `flex-col`, `items-center`, `justify-between`, `gap-2`, `px-4`, `py-2`, `w-full`, `min-h-screen`, `grid`, `grid-cols-*`, `space-y-*`, `fixed`, `absolute`, `relative`, `z-*`, etc.

These need to be replaced with either:
- Inline styles (for one-off layout)
- CSS classes in index.css or component-scoped styles (for repeated patterns)

### Responsive utilities
`max-w-md`, `mx-auto`, container queries. These need vanilla CSS equivalents.

### Animation utilities
`animate-spin`, `animate-pulse`, `transition-colors`, `transition-opacity`. Replace with CSS keyframes/transitions already in index.css or add new ones.

### Typography utilities
`text-heading-h1`, `text-label-xs`, `text-paragraph-sm`, etc. These are already defined as CSS utility classes in index.css — they just happen to be consumed via Tailwind's `@apply` or class syntax. These should survive as-is (they're not Tailwind, they're custom classes).

### shadcn/ui components (12 files in `src/components/ui/`)
These use Tailwind color tokens (`bg-primary`, `text-destructive-foreground`, etc.) mapped through `tailwind.config.ts`. Options:
1. Replace shadcn components with CLEAR design system equivalents where they exist
2. Rewrite remaining shadcn components to use CSS custom properties directly
3. Both — prefer option 1, fall back to option 2

### The `cn()` utility (`src/lib/utils.ts`)
Uses `clsx` + `tailwind-merge`. After Tailwind removal, simplify to just `clsx` (no merge needed without Tailwind conflicts).

## Execution plan

### Phase 1: Audit and categorize (do first)
1. List all 67 files with Tailwind usage
2. Categorize each file: layout-only vs color-tokens vs shadcn-component
3. Identify which shadcn/ui components are actually used in the app
4. Check if CLEAR design system already has replacements (Card, Chip, etc.)

### Phase 2: shadcn/ui migration
For each of the 12 shadcn/ui files:
1. Check if a CLEAR component already exists (e.g., Card, Chip already exist)
2. If yes: migrate consumers to CLEAR component, delete shadcn file
3. If no: rewrite the shadcn component to use CSS custom properties instead of Tailwind tokens
4. Update imports across the app

Key shadcn components to investigate:
- `toaster.tsx` / `toast.tsx` — used for notifications
- `sonner.tsx` — alternative toast
- `tooltip.tsx` — used for TooltipProvider in App.tsx
- `dialog.tsx` / `drawer.tsx` — modals
- Others — check actual usage

### Phase 3: Layout utility replacement
Work file by file through the ~55 non-shadcn files:
1. Replace Tailwind layout classes with inline styles or CSS classes
2. Keep custom typography classes (`text-heading-h1`, etc.) — these aren't Tailwind
3. Replace animation utilities with CSS equivalents

Strategy for common patterns:
- `flex items-center justify-between` → `style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}`
- `gap-2` → `style={{ gap: 'var(--spacing-200)' }}`
- `px-4 py-2` → `style={{ padding: 'var(--spacing-200) var(--spacing-400)' }}`
- `w-full` → `style={{ width: '100%' }}`
- `space-y-2` → CSS class with `> * + * { margin-top: var(--spacing-200) }`

Consider: a small set of layout utility classes in index.css for the most common patterns rather than inline styles everywhere.

### Phase 4: Cleanup
1. Remove `@tailwind base/components/utilities` from index.css
2. Remove `tailwindcss-animate` plugin
3. Remove `tailwind.config.ts`
4. Uninstall packages: `tailwindcss`, `tailwindcss-animate`, `tailwind-merge`
5. Simplify `cn()` to just `clsx`
6. Remove `postcss.config.js` Tailwind plugin (if present)
7. Remove Tailwind content paths from any config
8. Verify build passes
9. Visual regression check on key screens

## Risks
- **Visual regressions**: Tailwind's reset/preflight provides base styles. Removing it may cause subtle layout shifts. Need to check what `@tailwind base` provides and replicate anything needed.
- **Spacing drift**: Tailwind's spacing scale is mapped to CLEAR's `--spacing-*` tokens in the config. Direct replacements should use the same tokens.
- **Animation loss**: `animate-spin`, `animate-pulse` need CSS equivalents added to index.css.

## Files to reference
- `tailwind.config.ts` — current config, shows what's mapped
- `src/index.css` — design tokens, will absorb any needed utility classes
- `src/lib/utils.ts` — the `cn()` function
- `postcss.config.js` — Tailwind PostCSS plugin
- `src/components/ui/` — all shadcn components

## Definition of done
- Zero imports of Tailwind in any file
- `tailwind.config.ts` deleted
- `tailwindcss` and related packages removed from package.json
- `cn()` simplified to `clsx` only
- Build passes, no visual regressions
- Custom typography classes (`text-heading-*`, `text-label-*`, `text-paragraph-*`) still work
