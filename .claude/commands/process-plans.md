Process plan files in `.claude/plans/` - rename auto-generated names to meaningful `SESSION_PLAN_*` names, or delete plans that are no longer needed.

## Instructions

1. **List plans needing processing:**
   Find all `.md` files in `.claude/plans/` that do NOT already follow the `SESSION_PLAN_*.md` naming convention.

   If none found, inform user: "No plans need processing — all plans are already named."

2. **For each plan file found:**
   - Read the file to understand its content
   - Show the user a summary of what the plan contains
   - Suggest a name based on content
   - Format: `SESSION_PLAN_[user_choice].md`

3. **Offer options for each file:**
   - **Rename**: Rename in place with new `SESSION_PLAN_*` name
   - **Keep**: Leave with current name
   - **Delete**: Remove if not needed

4. **Rename:**
   ```bash
   mv .claude/plans/[old-name].md .claude/plans/SESSION_PLAN_[new-name].md
   ```

5. **After processing all files:**
   - Show summary of actions taken
   - List current contents of project plans folder

## Example Interaction

```
Found 2 plans needing names in .claude/plans/:

1. dreamy-wibbling-pancake.md
   Content: Plan for implementing dark mode toggle...
   Suggested name: SESSION_PLAN_dark_mode.md
   [Rename] [Keep] [Delete]

2. moonlit-honking-dove.md
   Content: Plan for refactoring auth flow...
   Suggested name: SESSION_PLAN_auth_refactor.md
   [Rename] [Keep] [Delete]
```

## Quick Reference

```
/process-plans              - Rename or clean up auto-named plans in .claude/plans/
```
