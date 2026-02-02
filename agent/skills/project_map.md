# Project Map Skill

**Context:** `docs/wireframes/PROJECT_MAP.md` documents the codebase architecture. Update it when the structure changes significantly.

## When to Update

Update PROJECT_MAP.md when:
- New technology or library is added
- Major file structure changes
- New data flow patterns are introduced
- Risk items are resolved or new ones discovered
- Key files change purpose or location

## Sections to Maintain

1. **Tech Stack Scan:**
   - Framework, styling, backend, routing approach
   - Key libraries and what they do

2. **Data Flow:**
   - How the main user flows work (e.g., "Generate Workout")
   - Which files are involved in each flow

3. **Environment & Safety:**
   - API key handling
   - Type safety status

4. **File Glossary:**
   - Top 5 most-touched files for design changes
   - Keep this current as architecture evolves

5. **Risk Report:**
   - Known technical debt
   - Areas that are hard to maintain
   - Remove risks when resolved (e.g., after Index.tsx refactor)

## After Major Refactors

If you complete a significant refactor (like splitting Index.tsx):
1. Update File Glossary with new file locations
2. Update Data Flow if routing changed
3. Remove resolved items from Risk Report
4. Add note at bottom: `*Last updated: [Date] by [Agent]*`
