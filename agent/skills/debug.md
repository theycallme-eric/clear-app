# Skill: Debug Error

> **Trigger:** When a build fails or the user reports a runtime error.

## Context

Systematic debugging prevents guessing and ensures issues are properly resolved. Always read the actual error before attempting fixes.

## Steps

1. **Read the Error**
   - Copy exact error message from terminal/console
   - Do NOT guess what the error might be
   - Identify the file and line number

2. **Categorize the Error**

   | Error Type | Check This |
   |------------|------------|
   | Type Error | `src/types/database.ts`, interface definitions |
   | Import Error | File paths, did we move/rename something? |
   | Style Error | `tailwind.config.js`, CSS variable names |
   | Runtime Error | Browser console, network tab |
   | Build Error | `package.json` dependencies, Vite config |

3. **Locate the Source**
   - Open the file mentioned in error
   - Read surrounding context
   - Trace back to root cause

4. **Apply Fix**
   - Make minimal change to fix issue
   - Do NOT refactor unrelated code

5. **Verify**
   - Run build command again: `npm run build`
   - Or check browser console for runtime errors
   - Confirm error is resolved

## Common Fixes

```typescript
// Type error: Property doesn't exist
// → Check if type was updated in database.ts

// Import error: Module not found
// → Check if file was moved, update import path

// Runtime error: Cannot read property of undefined
// → Add null check or optional chaining (?.)
```

## Reference Files

- `src/types/database.ts` — Database types
- `tailwind.config.js` — Tailwind config
- `vite.config.ts` — Build config

## Checklist

- [ ] Error message read (not guessed)
- [ ] Error categorized
- [ ] Root cause identified
- [ ] Fix applied
- [ ] Build/runtime verified working
