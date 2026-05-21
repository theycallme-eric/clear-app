#!/bin/bash
# UI Pre-flight Nudge (user-prompt-submit)
# Reminds about mandatory pre-flight when prompt looks UI-related.

set -e

INPUT=$(cat)

source "$(dirname "$0")/hook-utils.sh"

# Extract the user's prompt
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty' | tr '[:upper:]' '[:lower:]')

if [ -z "$PROMPT" ]; then
  exit 0
fi

# Check for UI-related keywords
if echo "$PROMPT" | grep -qE 'component|style|layout|page |pages|css|button|modal|card |cards|tab |tabs|input|form |spacing|padding|margin|chamfer|gallery|ui |redesign|visual|icon |icons'; then
  # Don't nudge if the prompt already mentions pre-flight or if it's a question
  if echo "$PROMPT" | grep -qE 'pre-?flight|preflight|inventory|what is|how do|explain|why'; then
    exit 0
  fi
  echo "Reminder: UI pre-flight is mandatory before building. Inventory existing components + check tokens first." >&2
  hook_log "NUDGE fired"
fi

exit 0
