# Tech Stack & Structure
**Project:** [Name]  
**Status:** [Draft / Locked]  
**Last Updated:** [Date]

---

## Purpose
Define the technical foundation BEFORE building. This doc helps Claude Code understand:
- What tools are available
- Where files should go
- What patterns to follow
- How to maintain consistency

---

## Stack Overview

### Frontend
| Layer | Choice | Why |
|-------|--------|-----|
| Framework | [e.g., React, Vue, Svelte] | [Rationale] |
| Build Tool | [e.g., Vite, Next.js] | [Rationale] |
| Styling | [e.g., Tailwind, CSS Modules] | [Rationale] |
| State | [e.g., Context, Zustand, Redux] | [Rationale] |
| Routing | [e.g., React Router, file-based] | [Rationale] |

### Backend
| Layer | Choice | Why |
|-------|--------|-----|
| Database | [e.g., Supabase, Firebase, Postgres] | [Rationale] |
| Auth | [e.g., Supabase Auth, Auth0, Clerk] | [Rationale] |
| API | [e.g., REST, GraphQL, Edge Functions] | [Rationale] |
| File Storage | [e.g., Supabase Storage, S3] | [Rationale] |

### AI Integration
| Purpose | Tool | Notes |
|---------|------|-------|
| [e.g., Content generation] | [e.g., Claude API] | [How it's called] |

### Deployment
| Layer | Choice | Why |
|-------|--------|-----|
| Hosting | [e.g., Vercel, Netlify] | [Rationale] |
| Domain | [URL] | |
| CI/CD | [e.g., Vercel auto-deploy] | |

---

## File Structure

```
project-root/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Base components (Button, Input, Card)
│   │   └── [feature]/       # Feature-specific components
│   │
│   ├── pages/               # Route-level components
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   └── [Feature]/
│   │
│   ├── lib/                 # Utilities & helpers
│   │   ├── supabase.ts      # Database client
│   │   ├── api.ts           # API helpers
│   │   └── utils.ts         # General utilities
│   │
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.ts
│   │
│   ├── types/               # TypeScript types
│   │   └── database.ts
│   │
│   ├── styles/              # Global styles
│   │   └── globals.css
│   │
│   └── assets/              # Static assets
│       ├── images/
│       └── icons/
│
├── public/                  # Public static files
├── docs/                    # Project documentation
│   └── design/              # Design assets
│
├── supabase/                # Supabase config (if applicable)
│   ├── functions/           # Edge Functions
│   └── migrations/          # Database migrations
│
└── [config files]           # vite.config.ts, tailwind.config.js, etc.
```

### File Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx`, `UserCard.tsx` |
| Utilities | camelCase | `formatDate.ts`, `api.ts` |
| Hooks | camelCase with "use" | `useAuth.ts` |
| Types | PascalCase | `User.ts`, `Database.ts` |
| Pages | PascalCase | `Dashboard.tsx` |
| Styles | kebab-case | `globals.css` |

---

## Code Patterns

### Component Structure
```typescript
// Standard component template
import { useState } from 'react'

interface ComponentNameProps {
  // Props with types
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Hooks at top
  const [state, setState] = useState()
  
  // Handlers
  const handleAction = () => {}
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Database Query Pattern
```typescript
// Always handle errors, always type responses
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('field', value)

if (error) {
  console.error('Query failed:', error)
  throw error
}

return data
```

### API Call Pattern
```typescript
// Supabase Edge Function call
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* params */ }
})

if (error) throw error
return data
```

---

## Environment Variables

### Required Variables
| Variable | Purpose | Where Set |
|----------|---------|-----------|
| `VITE_SUPABASE_URL` | Database URL | .env, Vercel |
| `VITE_SUPABASE_ANON_KEY` | Public API key | .env, Vercel |
| `ANTHROPIC_API_KEY` | Claude API (server only) | Supabase secrets |

### Local Development
```bash
# .env.local (git ignored)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Development Workflow

### Local Setup
```bash
# 1. Clone and install
git clone [repo]
cd [project]
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in values

# 3. Run locally
npm run dev
```

### Deployment
```bash
# Vercel auto-deploys on push to main
git push origin main

# Manual Supabase function deploy
supabase functions deploy function-name
```

---

## Third-Party Services

| Service | Purpose | Dashboard Link |
|---------|---------|----------------|
| Supabase | Database, Auth | [link] |
| Vercel | Hosting | [link] |
| Anthropic | AI API | [link] |
| [Other] | | |

---

## Performance Considerations
- [e.g., "Lazy load routes"]
- [e.g., "Images optimized and served from CDN"]
- [e.g., "Database queries use appropriate indexes"]

---

## Security Notes
- [e.g., "RLS enabled on all tables"]
- [e.g., "API keys never exposed to client"]
- [e.g., "Auth required for all /api routes"]

---

## Known Limitations
- [e.g., "Offline mode not supported in MVP"]
- [e.g., "Mobile app requires Capacitor wrapper (future)"]

---

## Checkpoint Prompt
Before locking this document:
1. Could Claude Code navigate this structure confidently?
2. Are all environment variables documented?
3. Are code patterns clear enough to maintain consistency?
4. Any third-party setup steps missing?

---

*Created: [Date]*  
*Locked: [Date]*
