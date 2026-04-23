#!/bin/bash
# Session Start Hook - Detects in-progress work across the repo
# Outputs a summary to stdout so Claude can relay it to the user.
# If nothing is found, outputs nothing (clean start).

set -e

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

OUTPUT=""

# --- Check current branch and uncommitted changes ---
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null) || exit 0
DIRTY_COUNT=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

if [ "$BRANCH" != "main" ] || [ "$DIRTY_COUNT" -gt 0 ]; then
  if [ "$BRANCH" != "main" ]; then
    OUTPUT+="Current branch: $BRANCH"$'\n'
  fi
  if [ "$DIRTY_COUNT" -gt 0 ]; then
    OUTPUT+="  - $DIRTY_COUNT uncommitted file(s)"$'\n'
  fi
fi

# --- Check feature branches with unpushed commits ---
UNPUSHED=""
for branch in $(git for-each-ref --format='%(refname:short)' refs/heads/feature/ 2>/dev/null); do
  upstream=$(git rev-parse --abbrev-ref "$branch@{upstream}" 2>/dev/null) || continue
  ahead=$(git rev-list --count "$upstream..$branch" 2>/dev/null) || continue
  if [ "$ahead" -gt 0 ]; then
    UNPUSHED+="  - $branch ($ahead unpushed commit(s))"$'\n'
  fi
done

if [ -n "$UNPUSHED" ]; then
  OUTPUT+=$'\n'"Branches with unpushed work:"$'\n'
  OUTPUT+="$UNPUSHED"
fi

# --- Check stashed changes ---
STASH_COUNT=$(git stash list 2>/dev/null | wc -l | tr -d ' ')
if [ "$STASH_COUNT" -gt 0 ]; then
  OUTPUT+=$'\n'"Stashed changes: $STASH_COUNT stash(es)"$'\n'
fi

# --- Design system drift check (lightweight) ---
REGISTRY_DRIFT=$(npx tsx scripts/registry-check.ts 2>/dev/null | head -1) || true
if [ -n "$REGISTRY_DRIFT" ] && [[ "$REGISTRY_DRIFT" != "Component registry is in sync"* ]]; then
  OUTPUT+=$'\n'"Component registry out of sync — run \`npm run registry-check\` for details."$'\n'
fi

TOKEN_VIOLATIONS=$(npx tsx scripts/token-lint.ts 2>/dev/null | head -1) || true
if [ -n "$TOKEN_VIOLATIONS" ] && [[ "$TOKEN_VIOLATIONS" == "Found"* ]]; then
  OUTPUT+=$'\n'"$TOKEN_VIOLATIONS Run \`npm run token-lint\` for details."$'\n'
fi

# --- Output if anything was found ---
if [ -n "$OUTPUT" ]; then
  echo "IN-PROGRESS WORK DETECTED:"
  echo ""
  echo "$OUTPUT"
  echo "Remind the user about this before starting new work."
fi

exit 0
