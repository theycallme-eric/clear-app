# SESSION PLAN: Workout Complete Screen Polish

## Session Goal
Bring the Workout Complete screen into full design system compliance — custom mood icons, Card wrapping for bare sections, streak token alignment, and typographic polish.

## Context
- **Reference:** `chamfered-component.md`, `design-tokens.json`, `docs/design-philosophy.md`
- **Color system:** Structure = theme color (orange in orange mode), Interaction = complement (blue in orange mode), Selection = always green
- **Current state:** Screen is functional. `CTAButton` and `Card` components already use the chamfered pattern with correct tokens. Remaining issues: mood icons are stock lucide (rounded/organic), mood + notes sections lack Card wrapping, streak day cells use hardcoded primitives, spacing is tight, "Nice Work!" lacks celebration treatment.

---

## Tasks

### ~~1. Fix FINISH CTA Button~~ — ALREADY DONE
**Status:** Complete. The Finish button already uses `<CTAButton>` which has the full LeftColumn + ChamferedFrame pattern built in. Tokens were updated this session to `--text-on-cta` / `--icon-on-cta` for primary/secondary variants. No work needed.

---

### ~~2a. Apply ChamferedFrame to Summary & Streak Cards~~ — ALREADY DONE
**Status:** Complete. Both the summary card and streak card already use `<Card>` which wraps ChamferedFrame internally with structure tokens (`--surface-card`, `--border-card`). No work needed.

---

### 2b. Wrap Mood Selector and Notes in Cards
**Do:** The mood selector and notes textarea are currently bare `<div>`s with no container treatment. Wrap each in `<Card>` to match the visual rhythm of the rest of the screen (summary card → mood card → notes card → streak card).

- **Mood section:** Wrap in `<Card padding="md">` with the "How Do You Feel?" label inside (matches Streak card pattern on HomeScreen)
- **Notes section:** Wrap in `<Card padding="md">` with the "Session Notes" label inside (matches Limitations card in onboarding)

**Acceptance:**
- [ ] Mood selector wrapped in Card with label inside
- [ ] Notes textarea wrapped in Card with label inside
- [ ] Consistent card rhythm down the full screen
- [ ] No bare unwrapped sections remain

---

### 3. Replace Mood Icons
**Do:** Create 5 custom SVG mood icons using an angular/geometric style that matches Clear's low-tech sci-fi visual language. Should have personality — cutesy is welcome, but shapes should be angular (no border-radius circles). Think: square-ish frames with minimal line features (line eyes, polyline mouths), enough expression to be instantly readable.

Five states, labeled: **Exhausted · Tough · Okay · Good · Great** (matches current code)

Interaction model (matches existing radio button / selection pattern):
- **Unselected:** stroke color = `--text-paragraph` at ~35% opacity
- **Selected:** stroke color = `--text-label-selected` (green-500), background = `--surface-radio-selected` (green-alpha-600), border = `--border-radio-select`

Create icons as a reusable component (`MoodIcon.tsx`) that accepts a `mood` prop and renders the correct SVG. Selection state managed by parent via style props (same pattern as current mood buttons).

**Acceptance:**
- [ ] 5 distinct SVG icons, visually differentiated at a glance
- [ ] Angular/geometric style — no rounded emoji shapes, but expressive/cutesy is good
- [ ] Unselected and selected states are token-driven
- [ ] Selection uses green (confirmation color) — same tokens as RadioButton
- [ ] Works in both orange and blue modes
- [ ] Each icon is at least 44×44px tap target
- [ ] Labels visible below each icon

---

### 4. Verify Notes Textarea Styling
**Do:** Quick verification — the `<Textarea>` component already has chamfered corners and design system styling from onboarding work. Confirm:
- Background uses `--surface-card` or `--surface-input`
- Border uses design tokens
- Focus state uses interaction color
- Placeholder is readable but secondary

If already compliant, skip. If not, fix inline.

**Acceptance:**
- [ ] Textarea uses token-driven styling (no raw browser defaults)
- [ ] Focus state visible

---

### 5. Polish Hierarchy, Spacing, and Streak Tokens
**Do:** Improve visual rhythm and celebration moment.

**Spacing:**
- Sections currently use `mb-6` (24px) everywhere. Verify this feels right with the new Card wrapping. Adjust if needed — the screen should breathe.

**Typography corrections:**
- "WORKOUT COMPLETE" — keep `--text-header` (NOT `--text-paragraph` as original plan suggested — that would kill hierarchy)
- "NICE WORK!" — keep `--text-header`, ADD `.glow-emissive` utility class for celebration feel (already exists in the design system)
- Section labels ("How Do You Feel?", "Session Notes", "Streak") — already using `--text-card-label`, which is correct

**Streak day cells — align with HomeScreen:**
Current SummaryScreen uses hardcoded primitives (`--color-green-alpha-200`, `--color-blue-alpha-200`, `--color-neutral-alpha-300`). Should use the same radio button tokens as HomeScreen:
- Workout: `--surface-radio-selected` / `--border-radio-select` / `--text-label-selected`
- Rest: `--surface-radio-unselect` / `--border-radio-unselected` / `--icon-cta`
- Empty: `transparent` / `transparent` / `--text-disabled`

**Celebration moment:**
- Add `.glow-emissive` to "Nice Work!" text and the new streak number
- If a brief scale pulse on the fire icon is easy (CSS-only), add it. Don't block on this.

**Acceptance:**
- [ ] Clear visual breathing room between sections
- [ ] "NICE WORK!" has glow treatment — reads as the celebration headline
- [ ] Streak day cells use same tokens as HomeScreen (no hardcoded primitives)
- [ ] Streak section feels like a reward, not just data

---

## Implementation Order
1. Wrap mood + notes sections in Cards (task 2b)
2. Build MoodIcon component and integrate (task 3)
3. Apply glow, fix streak tokens, spacing pass (task 5)
4. Quick textarea verification (task 4)
5. Build check: `npx tsc --noEmit && npm run build`

## Design System Compliance
- All colors via CSS custom properties — zero hardcoded hex values
- CTA / interactive elements = **interaction color** (blue in orange mode, orange in blue mode)
- Structural elements (cards, frames, borders) = **theme color** (orange in orange mode, blue in blue mode)
- Selection / confirmation = **always green**, mode-independent
- Existing components: `CTAButton` for buttons, `Card` for containers (both already use ChamferedFrame internally)
- Mobile-first: all changes work on 375px viewport
- Touch targets: 44px minimum on all interactive elements
- Typography: `text-heading-*` = Rajdhani, `text-label-*` = Oxanium, `text-paragraph-*` = Space Grotesk

## Files Likely Touched
- `src/pages/SummaryScreen.tsx` — Card wrapping, glow, streak tokens, spacing
- `src/components/MoodIcon.tsx` — New: custom geometric mood SVGs

## What NOT to Do
- Don't restructure the screen layout or information architecture — it's correct
- Don't change the data flow (mood saving, notes saving, streak logic)
- Don't add animations that require new dependencies
- Don't touch other screens
- Don't re-implement CTAButton or Card — they're already correct

## After Session
- [ ] Commit changes
- [ ] Run `/close-session` to update SESSION_LOG.md and BACKLOG.md
- [ ] Run `/pr` to create PR
- [ ] Test in both orange and blue modes
