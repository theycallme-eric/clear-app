#!/bin/bash
# Git Safety Hook - Enforces PR-based workflow
# Blocks risky git operations that bypass code review

set -e

# Read JSON input from stdin
INPUT=$(cat)

# Extract the command being run
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# If no command or not a git command, allow it
if [ -z "$COMMAND" ]; then
  exit 0
fi

# Only check git commands
if ! echo "$COMMAND" | grep -q "^git\|[;&|] *git"; then
  exit 0
fi

# ============================================
# BLOCK: Direct pushes to main/master
# ============================================
if echo "$COMMAND" | grep -qE "git push.*(origin|upstream)?.*(main|master)($|\s)"; then
  # Allow if it's pushing a PR branch that happens to reference main
  if echo "$COMMAND" | grep -qE "gh pr|pull request"; then
    exit 0
  fi

  cat >&2 << 'EOF'
╭────────────────────────────────────────────────────────────────╮
│ ✘ BLOCKED: Direct push to main/master                         │
│                                                                │
│ This would push directly to the main branch, bypassing code   │
│ review. Use the PR workflow instead:                          │
│                                                                │
│   1. git checkout -b feature/your-feature                     │
│   2. git push -u origin feature/your-feature                  │
│   3. gh pr create                                              │
│                                                                │
│ Run /pr for guided PR creation.                                │
╰────────────────────────────────────────────────────────────────╯
EOF
  exit 2
fi

# ============================================
# BLOCK: Merging into main/master locally
# ============================================
if echo "$COMMAND" | grep -qE "git merge.*(main|master)|git merge.* (main|master)"; then
  cat >&2 << 'EOF'
╭────────────────────────────────────────────────────────────────╮
│ ✘ BLOCKED: Merging into main/master                           │
│                                                                │
│ Direct merges to main bypass code review. Use a PR instead:   │
│                                                                │
│   1. Push your feature branch                                  │
│   2. Create a PR via: gh pr create                             │
│   3. Get review approval                                       │
│   4. Merge via GitHub UI or: gh pr merge                       │
│                                                                │
│ Run /pr for guided PR creation.                                │
╰────────────────────────────────────────────────────────────────╯
EOF
  exit 2
fi

# ============================================
# BLOCK: Checkout main and merge feature into it
# ============================================
# Detect pattern: on main, merging a feature branch
if echo "$COMMAND" | grep -qE "git checkout (main|master) && git merge"; then
  cat >&2 << 'EOF'
╭────────────────────────────────────────────────────────────────╮
│ ✘ BLOCKED: Merge workflow detected                             │
│                                                                │
│ This command would merge a feature branch into main locally,  │
│ bypassing code review. Use a PR instead:                       │
│                                                                │
│   gh pr create && gh pr merge                                  │
│                                                                │
│ Run /pr for guided PR creation.                                │
╰────────────────────────────────────────────────────────────────╯
EOF
  exit 2
fi

# ============================================
# BLOCK: Force pushes
# ============================================
if echo "$COMMAND" | grep -qE "git push.* (-f|--force|--force-with-lease)( |$)"; then
  # Allow force-with-lease on feature branches (safer)
  if echo "$COMMAND" | grep -q "\-\-force-with-lease" && ! echo "$COMMAND" | grep -qE "(main|master)"; then
    exit 0
  fi

  cat >&2 << 'EOF'
╭────────────────────────────────────────────────────────────────╮
│ ✘ BLOCKED: Force push detected                                 │
│                                                                │
│ Force pushes can overwrite team members' work and break       │
│ history. This is especially dangerous on shared branches.     │
│                                                                │
│ If you need to update a PR branch after rebase:                │
│   git push --force-with-lease origin your-branch               │
│                                                                │
│ Force pushing to main/master is never allowed.                 │
╰────────────────────────────────────────────────────────────────╯
EOF
  exit 2
fi

# ============================================
# BLOCK: Rebase onto main then push
# ============================================
if echo "$COMMAND" | grep -qE "git rebase (main|master) && git push"; then
  if echo "$COMMAND" | grep -qE "(main|master)($|\s)"; then
    cat >&2 << 'EOF'
╭────────────────────────────────────────────────────────────────╮
│ ✘ BLOCKED: Rebase and push to main                             │
│                                                                │
│ This would push rebased commits directly to main. Use a PR:   │
│                                                                │
│   1. git rebase main (on your feature branch)                  │
│   2. git push --force-with-lease origin your-branch            │
│   3. gh pr merge                                               │
╰────────────────────────────────────────────────────────────────╯
EOF
    exit 2
  fi
fi

# ============================================
# WARN: Pushing without PR (advisory only)
# ============================================
# This is informational - we don't block but remind about PRs
# Uncomment the exit 2 to make this a blocking check
# if echo "$COMMAND" | grep -qE "git push" && ! echo "$COMMAND" | grep -qE "gh pr|pull request"; then
#   cat >&2 << 'EOF'
# ╭────────────────────────────────────────────────────────────────╮
# │ ℹ REMINDER: Consider creating a PR                            │
# │                                                                │
# │ You're pushing changes. Don't forget to create a PR for       │
# │ code review: gh pr create                                      │
# ╰────────────────────────────────────────────────────────────────╯
# EOF
# fi

# All checks passed
exit 0
