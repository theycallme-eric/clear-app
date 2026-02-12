Execute a session plan from `.claude/plans/`.

## Instructions

1. **If argument provided:** Load `.claude/plans/SESSION_PLAN_[argument].md`
   - Example: `/execute auth_refactor` → loads `SESSION_PLAN_auth_refactor.md`

2. **If no argument:** List available plans and ask which to execute
   ```
   ls .claude/plans/SESSION_PLAN_*.md
   ```
   Present options and let user choose.

3. **Read the execution skill:** `.claude/skills/execute-plan.md`

4. **Follow the skill steps:**
   - Load the plan and parse structure
   - Read all context files
   - Map tasks to relevant skills
   - Initialize TodoWrite with all tasks
   - Execute tasks sequentially
   - Validate acceptance criteria for each task
   - Handle failures (warn, offer retry/skip/pause/abort)

5. **On completion:** Run `close-session.md` skill to log the work

## Quick Reference

```
/execute                    — List available plans, choose one
/execute auth_refactor      — Execute SESSION_PLAN_auth_refactor.md
/execute skill_test         — Execute SESSION_PLAN_skill_test.md
```
