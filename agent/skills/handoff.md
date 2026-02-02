# Skill: Process Handoff
**Trigger:** When the user pastes a "Session Plan" or prompt.

1.  **Read the Plan:** Parse the `## Tasks` section carefully.
2.  **Context Check:** Before writing code, run `read_file` on every file listed in the `## Context` section.
3.  **Skill Loading:** Check the index (`README.md`) for relevant skills (e.g., if touching UI, read `component.md`).
4.  **Extraction Check:** If the plan involves `src/pages/Index.tsx`, STOP. Confirm you are creating a *new* file in `src/components/`, not adding to the monolith.
