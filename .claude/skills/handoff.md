---
name: handoff
description: Entry point for work sessions - parse tasks, load context, check relevant skills
trigger: When the user pastes a "Session Plan" or prompt
category: workflow
---

# Skill: Process Handoff

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
   - Read `.claude/README.md` for available skills
   - Load relevant skills (e.g., if touching UI → read `component.md`)

4. **Extraction Check**
   - If plan involves `src/pages/Index.tsx`, **STOP**
   - Confirm you are creating a *new* file in `src/components/`
   - Do NOT add more code to the monolith

5. **Begin Work**
   - Start with first task
   - Follow loaded skills for each task type

## Reference Files

- `.claude/README.md` — Skill and agent registry
- `docs/BACKLOG.md` — Task context

## Related Skills

- [close-session](.claude/skills/close-session.md) — End of session workflow
- [component](.claude/skills/component.md) — UI component creation
- [supabase-workflow](.claude/skills/supabase-workflow.md) — Backend work

## Checklist

- [ ] Plan parsed and understood
- [ ] All context files read
- [ ] Relevant skills loaded
- [ ] Extraction check passed (if touching Index.tsx)
