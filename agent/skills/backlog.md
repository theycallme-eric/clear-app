# Skill: Manage Backlog

> **Trigger:** When adding or completing tasks.

## Context

The backlog tracks all pending work, organized by priority. Keeping it current ensures nothing gets lost between sessions.

## Steps

1. **When Starting a Task**
   - No change needed (item stays unchecked)

2. **When Completing a Task**
   - Move item to "Completed Items" section
   - Change `- [ ]` to `- [x]`
   - Add completion date

3. **When Adding New Items**
   - Add to appropriate priority section
   - Use standard format (below)
   - Include enough context for future understanding

4. **Quick Add**
   - Use "Quick Add Section" at bottom for fast capture
   - Organize into proper sections later

## Item Format

```markdown
- [ ] **[Title]** — [Brief description]
  - Priority: High / Medium / Low
  - Type: Bug / Enhancement / Feature / Tech Debt / Idea
  - Added: [Date]
  - Context: [Why this matters]
```

## Priority Sections

| Section | Meaning |
|---------|---------|
| High Priority | Address soon, possibly blocking V1 |
| Medium Priority | Important but not blocking |
| Low Priority | Nice to have, future versions |

## Reference Files

- `docs/BACKLOG.md` — The backlog

## Checklist

- [ ] Completed items marked `[x]`
- [ ] New items added with full format
- [ ] Priority section is correct
- [ ] Context included for future clarity
