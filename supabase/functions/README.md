# Clear - Supabase Edge Functions

This folder contains the Edge Functions for the Clear fitness app.

## Functions

### `generate-workout`

Generates personalized workouts using Claude API based on user context.

**Endpoint:** `POST /functions/v1/generate-workout`

**Request Body:**
```json
{
  "intensity": 6,
  "anchor": "hinge",
  "duration_mins": 45,
  "location_id": "uuid-here",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "workout": {
    "title": "Hinge Focus: Deadlift Day",
    "overview": "...",
    "estimated_duration_mins": 44,
    "intensity_description": "Standard session with conditioning finisher",
    "sections": [...]
  },
  "metadata": {
    "prompt_version": "v1.0.0",
    "generated_at": "2026-01-21T...",
    "request": {...}
  }
}
```

## Deployment

### Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   cd /path/to/clear-app
   supabase link --project-ref your-project-ref
   ```

### Set Secrets

The Edge Functions require the following secrets:

```bash
# Set your Anthropic API key
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

### Deploy

Deploy all functions:
```bash
supabase functions deploy
```

Or deploy a specific function:
```bash
supabase functions deploy generate-workout
```

### Local Development

Run functions locally:
```bash
supabase start
supabase functions serve --env-file .env.local
```

Create a `.env.local` file for local development:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Testing

Call the function using curl:
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/generate-workout' \
  -H 'Authorization: Bearer YOUR_USER_JWT' \
  -H 'Content-Type: application/json' \
  -d '{
    "intensity": 6,
    "anchor": "hinge",
    "duration_mins": 45,
    "location_id": "your-location-id"
  }'
```

Or use the frontend API client:
```typescript
import { generateWorkout, isGenerationError } from '@/lib/workout-api';

const result = await generateWorkout({
  intensity: 6,
  anchor: 'hinge',
  duration_mins: 45,
  location_id: 'your-location-id',
});

if (isGenerationError(result)) {
  console.error(result.error);
} else {
  console.log(result.workout);
}
```

## Architecture

```
User Request
    ↓
Edge Function (generate-workout)
    ↓
1. Validate request params
2. Fetch user profile (experience, limitations, sections)
3. Fetch location equipment
4. Fetch recent workout history
5. Build prompt from template
6. Call Claude API
7. Validate response
8. Return generated workout
```

## Prompt Versioning

Each generated workout includes a `prompt_version` in metadata. Update version when:
- Minor (`v1.0.x`): Small prompt tweaks
- Minor (`v1.x.0`): Larger prompt changes
- Major (`vX.0.0`): Schema changes
