# Auth & Data Persistence Stabilization Plan

## Problem Summary

Multiple auth-related issues reported:
- Login failures/timeouts
- Onboarding state not saving
- Settings not persisting
- Account creation issues

**Root Causes Identified:**
1. Sign-in race condition (duplicate profile fetches)
2. Arbitrary 5s timeout with silent fallback
3. No retry logic for failed operations
4. Workout saves not transactional (partial failures possible)
5. Settings updates not atomic (profile vs locations sequential)
6. Optimistic updates without rollback
7. Edge Function JWT parsed without signature verification
8. No observability (can't diagnose production issues)

---

## Implementation Approach

**5 incremental PRs**, each independently testable and rollback-able.

---

## Phase 1: Observability Foundation

**Goal:** Add structured logging so we can diagnose issues.

### Files to Create
- `src/lib/logger.ts` - Centralized logging with timing, categories, in-memory buffer

### Files to Modify
- `src/contexts/AuthContext.tsx` - Log auth events, timeouts, lock acquire/release
- `src/lib/workout-api.ts` - Log API calls and failures

### Implementation
```typescript
// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 'auth' | 'api' | 'workout' | 'data';

export const logger = {
  auth: {
    info: (msg: string, data?: Record<string, unknown>) => log('info', 'auth', msg, data),
    warn: (msg: string, data?: Record<string, unknown>) => log('warn', 'auth', msg, data),
    error: (msg: string, data?: Record<string, unknown>) => log('error', 'auth', msg, data),
  },
  // ... api, workout, data categories
};

export function timed<T>(category: LogCategory, operation: string, fn: () => Promise<T>): Promise<T>;
export function exportLogs(): LogEntry[];  // For debugging
```

### Verification
- `npm run build` passes
- Sign in → see structured logs in console
- Generate workout → see API timing logs

---

## Phase 2: Auth Stabilization

**Goal:** Fix sign-in race condition, add configurable timeout and retry.

### Files to Modify
- `src/pages/SignInScreen.tsx` - Remove duplicate profile fetch (lines 44-54)
- `src/contexts/AuthContext.tsx` - Configurable timeout, retry logic
- `src/pages/Index.tsx` - Update handleSignInSuccess to not expect onboarding param

### Key Changes

**1. SignInScreen.tsx - Remove duplicate fetch:**
```typescript
// BEFORE (race condition):
if (data.user) {
  const { data: profile } = await supabase.from("profiles")...  // DUPLICATE!
  onSuccess(profile?.onboarding_completed ?? false);
}

// AFTER:
if (data.user) {
  toast.success("Welcome back!");
  onSuccess();  // Let AuthContext handle profile fetch
}
```

**2. AuthContext.tsx - Add retry utility:**
```typescript
const AUTH_CONFIG = {
  sessionTimeoutMs: 8000,  // Up from 5s
  maxRetries: 2,
  retryDelayMs: 1000,
};

async function withRetry<T>(operation: () => Promise<T>, options): Promise<T> {
  for (let attempt = 1; attempt <= options.maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt <= options.maxRetries) {
        await new Promise(r => setTimeout(r, options.delayMs * attempt));
      } else throw error;
    }
  }
}
```

**3. Index.tsx - Update navigation logic:**
```typescript
// Navigation now based on AuthContext state, not SignInScreen param
useEffect(() => {
  if (auth.status === 'authenticated' && auth.profile) {
    if (auth.profile.onboarding_completed) {
      navigateTo('home');
    } else {
      navigateTo('onboarding');
    }
  }
}, [auth.status, auth.profile?.onboarding_completed]);
```

### Verification
- Sign in → only ONE profile fetch in Network tab
- Throttle network → see retry attempts in logs
- No more silent auth failures

---

## Phase 3: Atomic Workout Saves

**Goal:** Make workout saves transactional - all or nothing.

### Files to Create
- `supabase/migrations/00018_save_workout_rpc.sql`

### Files to Modify
- `src/lib/workout-api.ts` - Use RPC instead of loop
- `src/types/database.ts` - Add RPC type

### Key Changes

**1. Create RPC function:**
```sql
CREATE OR REPLACE FUNCTION save_generated_workout(
  p_user_id UUID,
  p_location_id UUID,
  p_date DATE,
  p_anchor TEXT,
  p_intensity INTEGER,
  p_sections JSONB
) RETURNS UUID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert session
  INSERT INTO workout_sessions (...) RETURNING id INTO v_session_id;

  -- Loop sections and exercises (all in same transaction)
  FOR v_section IN SELECT * FROM jsonb_array_elements(p_sections) LOOP
    INSERT INTO workout_sections (...);
    FOR v_exercise IN ... LOOP
      INSERT INTO exercises (...);
    END LOOP;
  END LOOP;

  RETURN v_session_id;
EXCEPTION
  WHEN OTHERS THEN RAISE;  -- Auto-rollback
END;
$$;
```

**2. Update workout-api.ts:**
```typescript
// BEFORE: Loop with continue on error (partial saves)
// AFTER: Single RPC call
const { data: sessionId, error } = await supabase.rpc('save_generated_workout', {
  p_user_id: user.id,
  p_sections: transformedSections,
  // ...
});

if (error) {
  logger.workout.error('Atomic save failed', { error });
  return { error: 'Failed to save workout' };
}
```

### Verification
- Generate workout → single RPC call in Network tab
- Simulate failure → no orphaned sessions/sections in DB

---

## Phase 4: Settings Rollback

**Goal:** Add rollback capability to optimistic updates.

### Files to Modify
- `src/contexts/AuthContext.tsx` - Save previous state, rollback on error

### Key Changes

```typescript
const updateProfile = useCallback(async (updates: Partial<Profile>) => {
  // Save for rollback
  const previousProfile = state.profile;

  // Optimistic update
  setState(prev => ({ ...prev, profile: { ...prev.profile, ...updates } }));

  const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);

  if (error) {
    logger.auth.error('Profile update failed, rolling back');
    // ROLLBACK
    setState(prev => ({ ...prev, profile: previousProfile, error: 'Failed to save' }));
    throw error;
  }
}, [state.user, state.profile]);
```

Same pattern for `updateLocations()`.

### Verification
- Change settings → success shows new values
- Simulate network error → UI reverts to previous values
- Toast shows "Failed to save settings"

---

## Phase 5: Edge Function Security

**Goal:** Secure JWT handling, add RLS index optimizations.

### Files to Create
- `supabase/migrations/00019_rls_optimizations.sql`

### Files to Modify
- `supabase/functions/generate-workout/index.ts` - Use getUser() instead of manual JWT parsing

### Key Changes

**1. Fix JWT handling:**
```typescript
// BEFORE (insecure - no signature verification):
const token = authHeader.replace('Bearer ', '');
const payload = JSON.parse(atob(token.split('.')[1]));
userId = payload.sub;

// AFTER (secure):
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } },
});
const { data: { user }, error } = await supabaseClient.auth.getUser();
if (error || !user) {
  return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
}
const userId = user.id;
```

**2. Add indexes for RLS performance:**
```sql
CREATE INDEX idx_workout_sections_session_id ON workout_sections(session_id);
CREATE INDEX idx_exercises_section_id ON exercises(section_id);
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, date DESC);
CREATE INDEX idx_workout_sessions_incomplete ON workout_sessions(user_id, created_at DESC)
  WHERE completed_at IS NULL;
```

### Verification
- Deploy Edge Function
- Generate workout with valid token → works
- Generate workout with invalid/expired token → 401 error
- Query performance improved (check EXPLAIN)

---

## Summary

| Phase | Focus | Risk | Key Files |
|-------|-------|------|-----------|
| 1 | Logging | Low | `src/lib/logger.ts` (new) |
| 2 | Auth race condition | Medium | `SignInScreen.tsx`, `AuthContext.tsx` |
| 3 | Atomic workout saves | Medium | `workout-api.ts`, new migration |
| 4 | Settings rollback | Medium | `AuthContext.tsx` |
| 5 | Edge Function security | Low | `generate-workout/index.ts`, new migration |

---

## Verification (End-to-End)

After all phases:
1. **New user signup** → profile created, onboarding works, data persists
2. **Sign in** → single profile fetch, proper navigation
3. **Generate workout** → atomic save, no partial data
4. **Change settings** → success persists, failure rolls back
5. **Slow network** → retries work, timeouts logged
6. **Invalid JWT** → 401 error, not silent failure

---

## Files to Modify (Complete List)

- `src/lib/logger.ts` (CREATE)
- `src/contexts/AuthContext.tsx`
- `src/pages/SignInScreen.tsx`
- `src/pages/Index.tsx`
- `src/lib/workout-api.ts`
- `src/types/database.ts`
- `supabase/migrations/00018_save_workout_rpc.sql` (CREATE)
- `supabase/migrations/00019_rls_optimizations.sql` (CREATE)
- `supabase/functions/generate-workout/index.ts`
