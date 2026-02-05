# Skill: Process Handoff

> **Trigger:** When the user pastes a "Session Plan" or prompt.

## Context

This is the entry point for any work session. Properly parsing the handoff ensures you have all necessary context before writing code.

## Steps

1. **Read the Plan**
   - Parse the `## Tasks` section carefully
   - Identify deliverables and acceptance criteria

2. **Load Context**
   - Run `read_file` on every file listed in `## Context` section
   - Understand current state before making changes

3. **Check Skill Index**
   - Read `README.md` in this folder
   - Load relevant skills (e.g., if touching UI → read `component.md`)

4. **Extraction Check**
   - If plan involves `src/pages/Index.tsx`, **STOP**
   - Confirm you are creating a *new* file in `src/components/`
   - Do NOT add more code to the monolith

5. **Begin Work**
   - Start with first task
   - Follow loaded skills for each task type

## Reference Files

- `agent/skills/README.md` — Skill index
- `docs/antigravity-handoff.md` — Current handoff state
- `docs/BACKLOG.md` — Task context

## Checklist

- [ ] Plan parsed and understood
- [ ] All context files read
- [ ] Relevant skills loaded
- [ ] Extraction check passed (if touching Index.tsx)
