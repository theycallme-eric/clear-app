#!/bin/bash
# Design System Lint Hook (PostToolUse — Edit/Write)
# Fast grep-based check on the file just edited. No Node, no build.
# Catches mechanical violations that are ALWAYS wrong in component files.

set -e

INPUT=$(cat)

source "$(dirname "$0")/hook-utils.sh"

# Extract the file path from the tool input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# No file path — skip
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only check src/ files (components, pages, hooks, etc.)
if [[ "$FILE_PATH" != *"/src/"* ]]; then
  exit 0
fi

# Skip files that legitimately use primitives/hex
BASENAME=$(basename "$FILE_PATH")
case "$BASENAME" in
  index.css|utils.ts|database.ts|*.test.ts|*.test.tsx|*.d.ts)
    exit 0
    ;;
esac

# Only check .tsx, .ts, .css files
case "$FILE_PATH" in
  *.tsx|*.ts|*.css) ;;
  *) exit 0 ;;
esac

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

WARNINGS=""

# 1. Hex colors in style-related contexts (skip comments)
HEX_HITS=$(grep -n 'color\|background\|fill\|stroke\|border\|shadow' "$FILE_PATH" 2>/dev/null \
  | grep -v '^\s*//' \
  | grep -v '^\s*\*' \
  | grep -oE '#[0-9A-Fa-f]{3,8}' \
  | head -5) || true
if [ -n "$HEX_HITS" ]; then
  WARNINGS+="  - Hex color(s) found: use semantic tokens instead"$'\n'
fi

# 2. Primitive tokens (--color-orange-*, --color-blue-*, etc.)
PRIM_HITS=$(grep -n 'var(--color-\(orange\|blue\|green\|red\|purple\|neutral\)-' "$FILE_PATH" 2>/dev/null \
  | grep -v '^\s*//' \
  | grep -v '^\s*\*' \
  | head -5) || true
if [ -n "$PRIM_HITS" ]; then
  WARNINGS+="  - Primitive token(s) found: use --surface-*, --text-*, --border-* instead"$'\n'
fi

# 3. border-radius (CLEAR uses chamfered corners)
BR_HITS=$(grep -n 'border-\?[Rr]adius' "$FILE_PATH" 2>/dev/null \
  | grep -v '^\s*//' \
  | grep -v '^\s*\*' \
  | grep -v 'border-radius: 0' \
  | grep -v '// ok' \
  | head -3) || true
if [ -n "$BR_HITS" ]; then
  WARNINGS+="  - border-radius found: use ChamferedFrame or corner-cut class"$'\n'
fi

# 4. lucide-react imports
LUCIDE_HITS=$(grep -n "from ['\"]lucide-react['\"]" "$FILE_PATH" 2>/dev/null | head -1) || true
if [ -n "$LUCIDE_HITS" ]; then
  WARNINGS+="  - lucide-react import: use src/components/icons.tsx instead"$'\n'
fi

# 5. !important (bandaid)
IMPORTANT_HITS=$(grep -n '!important' "$FILE_PATH" 2>/dev/null \
  | grep -v '^\s*//' \
  | grep -v '^\s*\*' \
  | head -3) || true
if [ -n "$IMPORTANT_HITS" ]; then
  WARNINGS+="  - !important found: fix specificity instead"$'\n'
fi

# Report (non-blocking — exit 0 always, just print warnings)
if [ -n "$WARNINGS" ]; then
  echo "Design system lint ($BASENAME):" >&2
  echo "$WARNINGS" >&2
  hook_log "WARN $BASENAME: $(echo "$WARNINGS" | tr '\n' ' ')"
else
  hook_log "PASS $BASENAME"
fi

exit 0
