---
name: project-map
description: Maintain architecture documentation
trigger: When making major architecture changes
category: documentation
---

# Skill: Update Project Map

## Context

The project map documents the codebase architecture. Keeping it current helps future agents understand the system quickly.

## When to Update

Update `docs/wireframes/PROJECT_MAP.md` when:
- New technology or library is added
- Major file structure changes
- New data flow patterns are introduced
- Risk items are resolved or new ones discovered
- Key files change purpose or location

## Steps

1. **Update Tech Stack**
   - Add new frameworks, libraries
   - Note what each does

2. **Update Data Flow**
   - Document how main user flows work
   - Which files are involved in each flow

3. **Update File Glossary**
   - Top 5 most-touched files for design changes
   - Keep current as architecture evolves

4. **Update Risk Report**
   - Add new technical debt
   - Remove resolved risks (e.g., after refactor)

5. **Add Timestamp**
   - At bottom: `*Last updated: [Date] by [Agent]*`

## Sections to Maintain

| Section | Content |
|---------|---------|
| Tech Stack Scan | Framework, styling, backend, routing |
| Data Flow | User flows and involved files |
| Environment & Safety | API keys, type safety status |
| File Glossary | Key files for design changes |
| Risk Report | Technical debt, hard-to-maintain areas |

## Reference Files

- `docs/wireframes/PROJECT_MAP.md` — The project map

## Related Skills

- [close-session](.claude/skills/close-session.md) — End of session workflow

## Checklist

- [ ] Tech stack section current
- [ ] Data flows documented
- [ ] File glossary updated
- [ ] Risks added/removed as needed
- [ ] Timestamp updated
