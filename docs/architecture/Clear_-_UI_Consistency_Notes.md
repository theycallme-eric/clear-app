# Clear — UI Consistency Notes

**Created:** January 22, 2026
**Context:** Observations from building the Component Gallery and auditing the design system

---

## 1. Two Competing Button Systems

The app has shadcn `<Button>` (6 variants, proper focus/disabled states) AND custom CSS classes (`glow-button`, `ghost-button`, `selection-active/inactive`). The app almost exclusively uses the custom classes — shadcn Button is available but unused. This means missing accessibility features (focus rings, keyboard handling) on most interactive elements.

**Recommendation:** Extend the shadcn Button with `glow` and `ghost` variants so you get one system with proper a11y baked in. Alternatively, add focus-visible styles to the custom classes.

---

## 2. Two Card Systems

`glass-card` (custom CSS) vs shadcn `<Card>` — the app only uses `glass-card`. The shadcn Card just takes up space.

**Recommendation:** Either drop shadcn Card or alias glass-card styling into it. One card primitive reduces confusion about which to reach for.

---

## 3. Input Styling Divergence

Settings uses raw `<input>` inside a `glass-card p-4` wrapper with `bg-transparent`. The shadcn `<Input>` component exists but looks completely different (rounded-md, border-input, ring styles). Same story with `<Textarea>`.

**Recommendation:** Create a styled input that matches the glass-card aesthetic, or override shadcn Input's classes to fit the app's look. One input pattern.

---

## 4. Repeated Patterns Without Components

The "settings row" (label + subtitle + chevron-right) is copy-pasted ~6 times in SettingsScreen. The "section label" (`font-mono text-xs uppercase tracking-widest text-muted-foreground`) appears in every single screen. These drift over time as individual instances get tweaked.

**Recommendation:** Extract:
- `<SectionLabel>` — the mono uppercase section headers
- `<SettingsRow>` — the clickable row with title, subtitle, and chevron
- These are small components but prevent drift across the app.

---

## 5. Color Contract is Implicit

Current usage (inferred, not documented):
- `clear-orange` — primary action, active state, CTAs
- `clear-lime` — selected/confirmed (equipment chips, section toggles)
- `clear-purple` — rest/passive (rest day indicators)
- `text-accent` — also maps to orange? Overlaps with clear-orange
- shadcn's `bg-primary`, `text-primary-foreground` — another layer of semantic colors

**Recommendation:** Document which color means what. Stick to the custom palette (`clear-*`) as the source of truth for the app's identity colors. Drop or remap shadcn's semantic colors where they conflict. Something like:

| Token | Meaning | Usage |
|-------|---------|-------|
| `clear-orange` | Primary action / active | Buttons, active states, CTAs |
| `clear-lime` | Confirmed / selected | Toggles, chips, checkmarks |
| `clear-purple` | Rest / passive | Rest days, secondary indicators |
| `foreground` | Primary text | Headings, body |
| `muted-foreground` | Secondary text | Labels, descriptions |

---

## 6. Spacing is Ad-hoc

- `space-y-6` vs `space-y-4` for page sections (no clear rule for which)
- `p-4` vs `p-6` vs `p-8` for card padding
- `px-4` consistently used for page-level horizontal padding (good)
- `mb-2` vs `mb-3` vs `mb-4` for label-to-content spacing

**Recommendation:** Establish spacing tokens:
- Page sections: `space-y-6`
- Within-card items: `space-y-3` or `space-y-4`
- Card padding: `p-4` (standard) or `p-6` (hero/featured)
- Section label to content: `mb-3`

---

## Summary of Actions

1. **Consolidate buttons** — one system with a11y
2. **Consolidate cards** — drop or restyle shadcn Card
3. **Consolidate inputs** — one input pattern matching the app aesthetic
4. **Extract repeated patterns** — SectionLabel, SettingsRow
5. **Document colors** — clear contract for when to use each
6. **Standardize spacing** — define and follow spacing tokens

These can be addressed incrementally during UI refinement passes. The Component Gallery (Settings > Developer) can be used to verify consistency as changes are made.
