Run headless workout generation tests to validate prompt quality.

## Instructions

### Parse Arguments

| Argument | Action |
|----------|--------|
| (none) | Run default suite: 3 diverse workouts |
| `N` (number) | Generate N workouts with diverse params |
| `sweep` | All 20 anchor x goal combinations |
| `anchor/goal` (e.g. `squat/strength`) | One specific combo |

---

### Pre-checks

1. **Verify local Supabase is running**
   ```bash
   npx supabase status 2>&1 | head -5
   ```
   If not running, tell the user:
   > "Local Supabase needs to be running. Start it with `npx supabase start`"

2. **Verify API key exists**
   ```bash
   grep -q ANTHROPIC_API_KEY supabase/.env && echo "OK" || echo "MISSING"
   ```
   If missing, tell the user:
   > "Add your Anthropic API key to `supabase/.env`"

---

### Run Tests

Based on the argument, run the appropriate command:

| Input | Command |
|-------|---------|
| (none) | `npx tsx scripts/test-generation.ts` |
| `5` | `npx tsx scripts/test-generation.ts --count 5` |
| `sweep` | `npx tsx scripts/test-generation.ts --sweep` |
| `squat/strength` | `npx tsx scripts/test-generation.ts --anchor squat --goal strength` |
| `squat/strength@8` | `npx tsx scripts/test-generation.ts --anchor squat --goal strength --intensity 8` |

Parse `anchor/goal@intensity` format: split on `/` for anchor and goal, split on `@` for intensity.

Use a **timeout of 600000ms** (10 min) for sweep, 120000ms for single/small runs.

---

### Interpret Results

After the script completes, summarize:

1. **Pass/Warn/Fail counts** — from the SUMMARY section
2. **Any failures** — list the test case and error
3. **Any warnings** — list the test case and warning, assess if it's a prompt issue or acceptable variance
4. **Quality observations:**
   - Are structures varied? (all standard = prompt isn't using EMOM/AMRAP/circuits enough)
   - Are muscle groups diverse? (few unique muscles = thematic coherence may be too narrow)
   - Are warmups/cooldowns relevant? (warnings about warmup not targeting primary muscles = prompt issue)
5. **If failures > 0**, suggest prompt edits to fix common patterns

---

### Common Issues and Fixes

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Unknown exercise_id | LLM hallucinated an ID | Reinforce "MUST use IDs from library" in prompt |
| Missing cooldown | LLM ran out of token budget or time | Add stronger cooldown mandate in prompt |
| Warmup doesn't target primary muscles | Thematic coherence not working | Strengthen WARM-UP PATTERN MATCHING section |
| All standard structures | LLM defaulting to safe option | Add more structure examples in goal sections |
| Duration way off | LLM not respecting time constraint | Check DURATION MANAGEMENT section |
