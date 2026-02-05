# Clear App - Development Guide

This guide covers local development setup and common issues.

## Prerequisites

- Node.js 18+
- Docker Desktop (for local Supabase)
- Anthropic API key (for workout generation)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create environment files
cp .env.example .env.local
cp supabase/.env.example supabase/.env
# Edit supabase/.env and add your ANTHROPIC_API_KEY

# 3. Start local Supabase
npx supabase start

# 4. Start dev server
npm run dev
```

## Environment Configuration

### Local Development

Create `.env.local` with:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

The anon key above is the standard local Supabase demo key. It works for all local development.

### Production (Vercel)

Set environment variables in Vercel Dashboard:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

Get these from: Supabase Dashboard > Settings > API

## Local Supabase Commands

```bash
# Start local Supabase
npx supabase start

# Stop local Supabase
npx supabase stop

# View status and connection info
npx supabase status

# Reset database (runs all migrations fresh)
npx supabase db reset

# Open local Studio UI
open http://127.0.0.1:54323

# View Edge Function logs
docker logs -f supabase_edge_runtime_clear-app

# Set Edge Function secrets
npx supabase secrets set ANTHROPIC_API_KEY=your-key
```

## Database Migrations

Migrations are in `supabase/migrations/`. They run automatically on `supabase start` and `supabase db reset`.

### Creating New Migrations

```bash
# Create a new migration file
npx supabase migration new my_migration_name

# Apply migrations to local
npx supabase db reset

# Push to production
npx supabase db push
```

### Important Migration Notes

1. **Trigger functions** that reference tables must use fully-qualified names (e.g., `public.profiles` not just `profiles`) when the trigger runs from the `auth` schema context.

2. **The `handle_new_user()` function** creates profiles for new users. It must have `SET search_path = public` to work correctly.

## Edge Functions

Edge Functions are in `supabase/functions/`.

### Local Development

Edge Functions run automatically with `supabase start`. The local config (`supabase/config.toml`) has `verify_jwt = false` for the generate-workout function to work around a CLI compatibility issue.

### Secrets

Edge Function secrets for **local development** are configured in `supabase/.env`:

```bash
# Create the secrets file
cp supabase/.env.example supabase/.env
# Edit supabase/.env and add your ANTHROPIC_API_KEY
```

The `supabase/config.toml` references these via `env(VAR_NAME)`.

For **production**, set secrets in Supabase Dashboard > Edge Functions > Secrets.

### Testing Edge Functions

```bash
# Get a valid auth token first (login via the app, check Network tab for token)
# Then test:
curl -X POST http://127.0.0.1:54321/functions/v1/generate-workout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"intensity":5,"anchor":"squat","duration_mins":45,"equipment":["barbell"]}'
```

## Troubleshooting

### Auth Issues

**"Invalid login credentials"**
- You're using the wrong password. Local Supabase has its own user database.
- Sign up with a new account locally, or reset the database.

**Auth timeout / Auth check failed**
- Clear browser localStorage: DevTools > Application > Storage > Clear site data
- Try incognito mode to rule out browser extensions

**Profile not created on signup**
- Check the `handle_new_user()` function has `SET search_path = public`
- Run `npx supabase db reset` to reapply migrations

### Edge Function Issues

**401 Unauthorized**
- Ensure `verify_jwt = false` is in `supabase/config.toml` under `[functions.generate-workout]`
- Restart Supabase: `npx supabase stop && npx supabase start`

**500 Internal Server Error**
- Check logs: `docker logs supabase_edge_runtime_clear-app`
- Ensure ANTHROPIC_API_KEY is set: `npx supabase secrets list`

### Database Issues

**"relation does not exist"**
- Run `npx supabase db reset` to reapply all migrations
- Check migration files for proper schema prefixes

**Collation version mismatch warning**
- This is a Docker/PostgreSQL version mismatch warning
- Safe to ignore for local development

### Supabase Won't Start

```bash
# Clean restart
npx supabase stop
docker rm $(docker ps -aq --filter "name=supabase") 2>/dev/null
npx supabase start
```

## Project Structure

```
clear-app/
├── src/                    # Frontend React app
├── supabase/
│   ├── config.toml         # Local Supabase configuration
│   ├── functions/          # Edge Functions
│   │   └── generate-workout/
│   └── migrations/         # Database migrations
├── .env.example            # Environment template
├── .env.local              # Local environment (git-ignored)
└── DEVELOPMENT.md          # This file
```

## Deployment

### Vercel

1. Connect repo to Vercel
2. Set environment variables in Vercel Dashboard
3. Deploy

### Supabase

1. Create project at supabase.com
2. Link local: `npx supabase link --project-ref YOUR_PROJECT_REF`
3. Push migrations: `npx supabase db push`
4. Deploy Edge Functions: `npx supabase functions deploy generate-workout`
5. Set secrets in Dashboard > Edge Functions > Secrets
