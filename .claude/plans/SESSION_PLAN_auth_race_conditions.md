# Fix Auth Race Conditions and Onboarding Persistence

## Problem Summary

User completes onboarding but `onboarding_completed` never persists to the database. On next login, they're shown onboarding again. AbortError appears during the process.

## Root Causes Identified

### 1. Token Refresh Race Condition (Critical)
When `TOKEN_REFRESHED` fires during `completeOnboarding()`:
- `onAuthStateChange` calls `fetchUserData()` in parallel
- `fetchUserData()` reads stale profile data (`onboarding_completed=false`)
- Both operations call `setState()`, causing state thrashing
- The AbortError occurs because Supabase aborts in-flight requests during auth state changes

**Timeline of failure:**
```
T1: completeOnboarding() starts, location upsert in progress
T2: TOKEN_REFRESHED fires → fetchUserData() starts
T3: fetchUserData() reads OLD profile (onboarding_completed=false)
T4: setState() with stale data → UI flickers to onboarding
T5: completeOnboarding() profile update gets ABORTED (or completes but state overwritten)
```

### 2. Non-Transactional Multi-Step Writes
`completeOnboarding()` does:
1. Upsert location (await)
2. Update profile (await)

If step 2 fails (network, abort, etc.), location exists but profile isn't updated. No rollback.

### 3. Promise.race() Anti-pattern (AuthContext.tsx:143-146)
```typescript
await Promise.race([supabase.auth.getSession(), timeoutPromise])
```
When timeout wins, the Supabase request continues but isn't cancelled. Its cleanup triggers AbortError.

### 4. AuthContext Does Too Much
Single context manages: auth state, profile data, locations, onboarding. Any auth event triggers full re-fetch, interfering with writes.

---

## Solution: Restructure Auth and Profile Management

### Approach: Operation Locking + Separated Concerns

Instead of restructuring into multiple contexts (high risk, many file changes), we'll:
1. Add operation locking to prevent reads during writes
2. Fix the timeout anti-pattern
3. Make onboarding completion atomic via RPC

### File Changes

#### 1. `src/contexts/AuthContext.tsx`
- Add `operationInProgress` ref to gate `fetchUserData` calls
- Lock during `completeOnboarding()` to prevent `onAuthStateChange` interference
- Remove Promise.race timeout (or implement proper AbortController)
- Debounce/gate `TOKEN_REFRESHED` events during critical operations

#### 2. `supabase/functions/` or `supabase/migrations/`
- Create RPC function `complete_onboarding(...)` that atomically:
  - Creates/updates location
  - Updates profile with `onboarding_completed=true`
  - Returns the new location ID
- Single network call, transactional, no race window

#### 3. `src/lib/supabase.ts` (minor)
- Consider adding explicit auth config for clarity

---

## Implementation Plan

### Step 1: Add Operation Locking to AuthContext

Add a ref to track when critical operations are in progress:

```typescript
const operationLockRef = useRef<string | null>(null);

const acquireLock = (operation: string): boolean => {
  if (operationLockRef.current) return false;
  operationLockRef.current = operation;
  return true;
};

const releaseLock = () => {
  operationLockRef.current = null;
};
```

Modify `onAuthStateChange` to skip `fetchUserData` when locked:
```typescript
if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
  // Skip if a write operation is in progress
  if (operationLockRef.current) {
    console.log(`Skipping fetchUserData: ${operationLockRef.current} in progress`);
    return;
  }
  const userData = await fetchUserData(session.user.id);
  // ...
}
```

### Step 2: Lock During completeOnboarding

```typescript
const completeOnboarding = useCallback(async (data: OnboardingData) => {
  if (!state.user) return;

  if (!acquireLock('completeOnboarding')) {
    throw new Error('Another operation in progress');
  }

  try {
    // ... existing upsert + update logic ...
  } finally {
    releaseLock();
  }
}, [state.user, acquireLock, releaseLock]);
```

### Step 3: Remove Promise.race Timeout

Replace the fragile timeout pattern:

```typescript
// Before (problematic):
const { data: { session }, error } = await Promise.race([
  supabase.auth.getSession(),
  timeoutPromise,
]);

// After (simple, let Supabase handle its own timeouts):
const { data: { session }, error } = await supabase.auth.getSession();
```

If timeout is truly needed, use AbortController properly:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort('Auth timeout'), 5000);

try {
  const { data: { session }, error } = await supabase.auth.getSession();
  clearTimeout(timeoutId);
  // ... handle session
} catch (err) {
  if (err.name === 'AbortError') {
    // Handle timeout gracefully
    setState(prev => ({ ...prev, status: 'unauthenticated', error: 'Auth timed out' }));
    return;
  }
  throw err;
}
```

### Step 4: Create Atomic Onboarding RPC (Optional but Recommended)

Create `supabase/migrations/00015_complete_onboarding_rpc.sql`:

```sql
CREATE OR REPLACE FUNCTION complete_onboarding(
  p_user_id UUID,
  p_location_name TEXT,
  p_location_tier equipment_tier,
  p_equipment TEXT[],
  p_experience_level experience_level,
  p_goal_preset goal_preset,
  p_sections section_type[],
  p_limitations TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_location_id UUID;
BEGIN
  -- Upsert location
  INSERT INTO locations (user_id, name, tier, equipment, is_default)
  VALUES (p_user_id, p_location_name, p_location_tier, p_equipment, true)
  ON CONFLICT (user_id, name) DO UPDATE SET
    tier = EXCLUDED.tier,
    equipment = EXCLUDED.equipment,
    is_default = true,
    updated_at = NOW()
  RETURNING id INTO v_location_id;

  -- Update profile atomically
  UPDATE profiles SET
    onboarding_completed = true,
    experience_level = p_experience_level,
    goal_preset = p_goal_preset,
    enabled_sections = p_sections,
    limitations = p_limitations,
    default_location_id = v_location_id,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN v_location_id;
END;
$$;
```

Then in AuthContext:
```typescript
const { data: locationId, error } = await supabase.rpc('complete_onboarding', {
  p_user_id: state.user.id,
  p_location_name: data.location.name,
  p_location_tier: data.location.tier,
  p_equipment: equipmentForDb,
  p_experience_level: data.experienceLevel,
  p_goal_preset: data.goal,
  p_sections: enabledSectionsForDb,
  p_limitations: data.limitations || null,
});
```

---

## Verification

1. **Manual Testing:**
   - Create new account
   - Complete onboarding
   - Verify no AbortError in console
   - Sign out, sign back in
   - Should go directly to home screen (not onboarding)

2. **Database Check:**
   - After completing onboarding, verify in Supabase dashboard:
     - `profiles.onboarding_completed = true`
     - `profiles.default_location_id` is set
     - `locations` table has the new location

3. **Race Condition Test:**
   - Add `console.log` statements to track operation locking
   - Verify `fetchUserData` is skipped during `completeOnboarding`

---

## Files to Modify

1. `src/contexts/AuthContext.tsx` - Add operation locking, fix timeout
2. `supabase/migrations/00015_complete_onboarding_rpc.sql` - New atomic RPC (optional)

## Risk Assessment

- **Low risk**: Operation locking is additive, doesn't change existing logic flow
- **Medium risk**: Removing Promise.race timeout could cause longer hangs if Supabase is slow (but won't cause AbortError)
- **Low risk**: RPC is isolated database change, called from single location

## Rollback Plan

If issues arise, revert AuthContext changes. The locking mechanism is self-contained and doesn't affect other parts of the app.
