# Data Model
**Project:** [Name]  
**Status:** [Draft / Locked]  
**Last Updated:** [Date]

---

## Purpose
Define database schema and API patterns BEFORE building. This doc helps Claude Code:
- Create correct database tables
- Write proper queries
- Maintain data consistency
- Understand relationships

---

## Entity Overview

### Entity Relationship Diagram
```
┌─────────────┐       ┌─────────────┐
│    USER     │       │   [ENTITY]  │
├─────────────┤       ├─────────────┤
│ id (PK)     │──1:M──│ id (PK)     │
│ email       │       │ user_id(FK) │
│ created_at  │       │ ...         │
└─────────────┘       └─────────────┘
                            │
                           1:M
                            │
                      ┌─────────────┐
                      │   [CHILD]   │
                      ├─────────────┤
                      │ id (PK)     │
                      │ parent_id   │
                      │ ...         │
                      └─────────────┘
```

### Entity Summary
| Entity | Purpose | Key Relationships |
|--------|---------|-------------------|
| User | Account holder | Has many [entities] |
| [Entity 2] | | |
| [Entity 3] | | |

---

## Table Definitions

### users
**Purpose:** Store user account data  
**RLS:** Users can only read/write their own row

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen | Unique identifier |
| email | text | unique, not null | Login email |
| created_at | timestamptz | default now() | Account creation |
| [column] | [type] | [constraints] | [description] |

**Indexes:**
- `users_email_idx` on email (unique)

**RLS Policies:**
```sql
-- Users can read own data
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update own data  
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);
```

---

### [table_name]
**Purpose:** [What this table stores]  
**RLS:** [Access rules]

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen | Unique identifier |
| user_id | uuid | FK → users.id, not null | Owner |
| [column] | [type] | [constraints] | [description] |
| created_at | timestamptz | default now() | Creation time |
| updated_at | timestamptz | default now() | Last modified |

**Indexes:**
- `[index_name]` on [columns]

**RLS Policies:**
```sql
-- [Policy description]
CREATE POLICY "[policy_name]" ON [table]
  FOR [action] USING ([condition]);
```

---

## Enums / Constants

### [Enum Name]
| Value | Description |
|-------|-------------|
| `value_1` | [What it means] |
| `value_2` | [What it means] |

```sql
CREATE TYPE [enum_name] AS ENUM ('value_1', 'value_2', 'value_3');
```

---

## Common Queries

### Get User Profile
```typescript
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()
```

### Get [Entity] with Relations
```typescript
const { data } = await supabase
  .from('[table]')
  .select(`
    *,
    [related_table](*),
    [another_relation]:relation_table(*)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

### Create [Entity]
```typescript
const { data, error } = await supabase
  .from('[table]')
  .insert({
    user_id: userId,
    // fields
  })
  .select()
  .single()
```

### Update [Entity]
```typescript
const { data, error } = await supabase
  .from('[table]')
  .update({ /* fields */ })
  .eq('id', entityId)
  .eq('user_id', userId) // RLS safety
  .select()
  .single()
```

### Delete [Entity]
```typescript
const { error } = await supabase
  .from('[table]')
  .delete()
  .eq('id', entityId)
  .eq('user_id', userId)
```

---

## API Endpoints (if applicable)

### Edge Functions

#### POST /[function-name]
**Purpose:** [What it does]  
**Auth:** Required

**Request:**
```typescript
interface RequestBody {
  field1: string
  field2: number
}
```

**Response:**
```typescript
interface Response {
  success: boolean
  data?: ResultType
  error?: string
}
```

**Example:**
```typescript
const { data, error } = await supabase.functions.invoke('[function-name]', {
  body: { field1: 'value', field2: 42 }
})
```

---

## Data Validation Rules

### [Entity] Validation
| Field | Rules |
|-------|-------|
| [field] | [e.g., "Required, max 255 chars"] |
| [field] | [e.g., "Must be positive integer"] |

---

## Migration Notes

### Initial Setup
```sql
-- Run in order:
-- 1. Create enums
-- 2. Create tables (users first, then dependents)
-- 3. Create indexes
-- 4. Enable RLS and create policies
```

### Migration History
| Version | Date | Changes |
|---------|------|---------|
| 001 | [Date] | Initial schema |
| 002 | [Date] | [Changes] |

---

## Business Logic

### [Rule Name]
**Description:** [What the rule enforces]  
**Implementation:** [How it's enforced - trigger, app code, etc.]

Example:
```
Rule: Streak resets after 1 missed day
- Tracked in: app code (streak-calculator.ts)
- Not enforced at database level
```

---

## Checkpoint Prompt
Before locking this document:
1. Are all entities defined with clear relationships?
2. Are RLS policies correct for data isolation?
3. Are common queries documented for Claude Code reference?
4. Are validation rules clear?

When adding new tables:
1. Update the ERD
2. Define RLS policies
3. Add common queries
4. Document validation rules

---

*Created: [Date]*  
*Locked: [Date]*
