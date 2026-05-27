# Inbox Workflow Skill

Process files dropped in the inbox folder. Determine file type, move to correct location, and report actions.

## Inbox Location

```
.claude/inbox/
```

This folder is gitignored. It's a temporary drop zone for new files.

---

## File Type Detection

Determine file type by name pattern and content, then move to the correct location:

| Pattern | Type | Destination |
|---------|------|-------------|
| `*-skill.md` or `*_skill.md` | Skill | `.claude/skills/` |
| `SESSION_PLAN_*.md` or `SESSION-PLAN-*.md` | Session Plan | `.claude/plans/` |
| `*-agent.md` or `*_agent.md` | Agent | `.claude/agents/` |
| `*.png`, `*.jpg`, `*.jpeg`, `*.gif` | Screenshot | `.claude/screenshots/` |
| `*-spec.md`, `*_spec.md` | Spec | `docs/specs/` |
| `*-wireframe.md` | Wireframe | `docs/wireframes/` |
| `design-tokens*.json` | Tokens | `docs/frontend/` |

### If Pattern Doesn't Match

Read the file content and look for clues:

1. **Has "## Session Goal" or "## Tasks"** → Session Plan → `.claude/plans/`
2. **Has "## When to Use" or "## Quick Reference"** → Skill → `.claude/skills/`
3. **Has YAML frontmatter with `name:` and `model:`** → Agent → `.claude/agents/`
4. **Has "## Wireframe" or screen layout content** → Wireframe → `docs/wireframes/`

### If Still Unclear

Ask the user:
```
I found a file that I'm not sure how to categorize:

**File:** `filename.md`
**First 5 lines:**
[show preview]

Where should this go?
1. `.claude/skills/`
2. `.claude/plans/`
3. `.claude/agents/`
4. `docs/` (I'll ask for subfolder)
5. Other (please specify)
```

---

## Processing Steps

1. **List inbox contents**
   ```bash
   ls -la .claude/inbox/
   ```

2. **For each file:**
   - Detect type using rules above
   - Move to destination (create destination folder if needed)
   - If filename needs cleanup (remove `_` prefixes, normalize), rename during move

3. **Report actions:**
   ```
   ## Inbox Processed

   | File | Type | Moved To |
   |------|------|----------|
   | token-audit-skill.md | Skill | .claude/skills/token-audit.md |
   | SESSION_PLAN_inbox.md | Session Plan | .claude/plans/SESSION_PLAN_inbox.md |

   **Session plans found:** SESSION_PLAN_inbox.md
   Ready to execute? (y/n)
   ```

4. **If session plan found:** Ask before executing, don't auto-start

5. **If user says yes to execute:**
   - Read `.claude/skills/execute-plan.md`
   - Follow the skill to execute the plan systematically
   - Track progress with TaskCreate/TaskUpdate
   - Validate acceptance criteria for each task

---

## Filename Normalization

When moving files, clean up names:

| Original | Normalized |
|----------|------------|
| `token-audit-skill.md` | `token-audit.md` (in skills folder, `-skill` suffix redundant) |
| `SESSION_PLAN_foo.md` | `SESSION_PLAN_foo.md` (keep as-is for plans) |
| `My New Skill.md` | `my-new-skill.md` (lowercase, hyphens) |

---

## Empty Inbox

If inbox is empty:
```
Inbox is empty. Nothing to process.

To add files: drop them in `.claude/inbox/` and run `/process-inbox` again.
```

---

## Setup

If inbox folder doesn't exist:

```bash
mkdir -p .claude/inbox
echo "*\n!.gitignore" > .claude/inbox/.gitignore
```

---

## Related

- `.claude/commands/process-inbox.md` — The slash command that triggers this
- `.claude/skills/execute-plan.md` — Execute session plans after filing
- `.claude/skills/` — Destination for skill files
- `.claude/agents/` — Destination for agent files
- `.claude/plans/` — Destination for session plans
