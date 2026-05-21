#!/bin/bash
# Branch Guard Hook (PreToolUse — Edit/Write)
# Warns (non-blocking) if you're about to edit src/ files while on main.

set -e

INPUT=$(cat)

source "$(dirname "$0")/hook-utils.sh"

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# No file path — skip
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only care about src/ edits (not docs, config, etc.)
if [[ "$FILE_PATH" != *"/src/"* ]]; then
  exit 0
fi

# Check current branch
BRANCH=$(cd "$CLAUDE_PROJECT_DIR" && git rev-parse --abbrev-ref HEAD 2>/dev/null) || exit 0

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  cat >&2 << 'EOF'
WARNING: You're editing src/ files on main. Create a feature branch first:
  git checkout -b feature/your-feature
EOF
  hook_log "WARN editing src/ on main: $FILE_PATH"
  # Non-blocking — just a warning. Change to exit 2 to hard-block.
  exit 0
fi

hook_log "PASS (branch: $BRANCH)"
exit 0
