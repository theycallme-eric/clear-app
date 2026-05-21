#!/bin/bash
# Hook Debug Tool
# Usage:
#   .claude/hooks/hook-debug.sh          — show status + recent logs
#   .claude/hooks/hook-debug.sh test     — run all hooks with test inputs
#   .claude/hooks/hook-debug.sh disable  — create kill switch (disable all hooks)
#   .claude/hooks/hook-debug.sh enable   — remove kill switch (re-enable all hooks)
#   .claude/hooks/hook-debug.sh disable <name> — disable one hook
#   .claude/hooks/hook-debug.sh enable <name>  — re-enable one hook

set -e

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$HOOK_DIR/logs"
KILL_SWITCH="$HOOK_DIR/.disabled"

case "${1:-status}" in

  status)
    echo "=== Hook Status ==="
    echo ""

    # Kill switch
    if [ -f "$KILL_SWITCH" ]; then
      echo "KILL SWITCH: ACTIVE (all hooks disabled)"
      echo "  Remove with: $0 enable"
    else
      echo "KILL SWITCH: off (hooks enabled)"
    fi
    echo ""

    # Per-hook status
    echo "=== Individual Hooks ==="
    for hook in "$HOOK_DIR"/*.sh; do
      name=$(basename "$hook" .sh)
      # Skip utility scripts
      case "$name" in hook-utils|hook-debug) continue ;; esac

      if [ -f "$HOOK_DIR/.disabled-$name" ]; then
        status="DISABLED"
      else
        status="enabled"
      fi
      printf "  %-25s %s\n" "$name" "$status"
    done
    echo ""

    # Recent logs
    echo "=== Recent Logs ==="
    if [ -d "$LOG_DIR" ]; then
      for log in "$LOG_DIR"/*.log; do
        [ -f "$log" ] || continue
        name=$(basename "$log" .log)
        echo ""
        echo "--- $name (last 10) ---"
        tail -10 "$log" 2>/dev/null || echo "  (empty)"
      done
    else
      echo "  No logs yet (logs appear after first hook run)"
    fi
    ;;

  test)
    echo "=== Testing Hooks ==="
    echo ""

    # Test branch-guard (should warn — we're on main editing src/)
    echo "--- branch-guard (editing src/ on main) ---"
    echo '{"tool_input":{"file_path":"'"$HOOK_DIR"'/../../src/components/Test.tsx"}}' \
      | CLAUDE_PROJECT_DIR="$HOOK_DIR/../.." "$HOOK_DIR/branch-guard.sh" 2>&1
    echo "  exit: $?"
    echo ""

    # Test branch-guard (editing docs — should be silent)
    echo "--- branch-guard (editing docs/ — should be silent) ---"
    echo '{"tool_input":{"file_path":"'"$HOOK_DIR"'/../../docs/test.md"}}' \
      | CLAUDE_PROJECT_DIR="$HOOK_DIR/../.." "$HOOK_DIR/branch-guard.sh" 2>&1
    echo "  exit: $?"
    echo ""

    # Test design-system-lint (needs a real file — just check it doesn't crash)
    echo "--- design-system-lint (index.css — should skip) ---"
    echo '{"tool_input":{"file_path":"'"$HOOK_DIR"'/../../src/index.css"}}' \
      | "$HOOK_DIR/design-system-lint.sh" 2>&1
    echo "  exit: $?"
    echo ""

    # Test ui-preflight-nudge (UI keyword)
    echo "--- ui-preflight-nudge ('update the button component') ---"
    echo '{"prompt":"update the button component"}' \
      | "$HOOK_DIR/ui-preflight-nudge.sh" 2>&1
    echo "  exit: $?"
    echo ""

    # Test ui-preflight-nudge (non-UI)
    echo "--- ui-preflight-nudge ('fix auth bug' — should be silent) ---"
    echo '{"prompt":"fix auth bug"}' \
      | "$HOOK_DIR/ui-preflight-nudge.sh" 2>&1
    echo "  exit: $?"
    echo ""

    # Test git-safety (safe command)
    echo "--- git-safety ('git status' — should pass) ---"
    echo '{"tool_input":{"command":"git status"}}' \
      | CLAUDE_PROJECT_DIR="$HOOK_DIR/../.." "$HOOK_DIR/git-safety-check.sh" 2>&1
    echo "  exit: $?"
    echo ""

    # Test git-safety (dangerous command)
    echo "--- git-safety ('git push origin main' — should BLOCK) ---"
    echo '{"tool_input":{"command":"git push origin main"}}' \
      | CLAUDE_PROJECT_DIR="$HOOK_DIR/../.." "$HOOK_DIR/git-safety-check.sh" 2>&1
    echo "  exit: $?"
    echo ""

    echo "=== All tests complete ==="
    ;;

  disable)
    if [ -n "$2" ]; then
      touch "$HOOK_DIR/.disabled-$2"
      echo "Disabled hook: $2"
      echo "Re-enable with: $0 enable $2"
    else
      touch "$KILL_SWITCH"
      echo "Kill switch ACTIVE — all custom hooks disabled."
      echo "Re-enable with: $0 enable"
    fi
    ;;

  enable)
    if [ -n "$2" ]; then
      rm -f "$HOOK_DIR/.disabled-$2"
      echo "Re-enabled hook: $2"
    else
      rm -f "$KILL_SWITCH"
      echo "Kill switch removed — all hooks re-enabled."
    fi
    ;;

  *)
    echo "Usage: $0 [status|test|disable|enable] [hook-name]"
    exit 1
    ;;
esac
