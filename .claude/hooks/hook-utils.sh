#!/bin/bash
# Shared utilities for all Claude Code hooks.
# Source this at the top of every hook: source "$(dirname "$0")/hook-utils.sh"

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK_NAME="$(basename "${BASH_SOURCE[1]}" .sh)"
HOOK_LOG_DIR="$HOOK_DIR/logs"
KILL_SWITCH="$HOOK_DIR/.disabled"

# --- Kill switch ---
# Create .claude/hooks/.disabled to silence ALL custom hooks instantly.
# Remove it to re-enable. Works from any terminal, no Claude needed.
if [ -f "$KILL_SWITCH" ]; then
  exit 0
fi

# --- Per-hook disable ---
# Create .claude/hooks/.disabled-<hook-name> to silence one hook.
# e.g. touch .claude/hooks/.disabled-design-system-lint
if [ -f "$HOOK_DIR/.disabled-$HOOK_NAME" ]; then
  exit 0
fi

# --- Logging ---
mkdir -p "$HOOK_LOG_DIR"
HOOK_LOG="$HOOK_LOG_DIR/$HOOK_NAME.log"

# Keep log under 500 lines (rotate on each run)
if [ -f "$HOOK_LOG" ] && [ "$(wc -l < "$HOOK_LOG" 2>/dev/null | tr -d ' ')" -gt 500 ]; then
  tail -200 "$HOOK_LOG" > "$HOOK_LOG.tmp" && mv "$HOOK_LOG.tmp" "$HOOK_LOG"
fi

hook_log() {
  echo "[$(date '+%H:%M:%S')] $*" >> "$HOOK_LOG"
}

# Log start
hook_log "START"

# --- Error trap ---
# If the hook crashes, log the error and exit 0 (never block on a bug)
trap 'hook_log "CRASHED (line $LINENO, exit $?)"; exit 0' ERR
